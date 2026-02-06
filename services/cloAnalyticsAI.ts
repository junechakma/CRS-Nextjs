/**
 * AI-Powered CLO Analysis Service
 * Uses Gemini API for detailed CLO mapping and question analysis
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '')

export interface CLOData {
  id: string
  code: string
  description: string
  bloomLevel?: string | null
}

export interface AIAnalysisResult {
  overall_summary: string
  recommendations: string[]
  questions: {
    question_number: number
    question_text: string
    bloom_level: string
    bloom_reasoning: string
    mapped_clos: {
      clo_id: string
      clo_code: string
      relevance_score: number
      reasoning: string
      confidence: number
    }[]
    quality: 'perfect' | 'good' | 'needs_improvement' | 'unmapped'
    issues: string[]
    improved_question: {
      text: string
      explanation: string
      target_clo_id: string
      target_bloom: string
    } | null
  }[]
}

/**
 * Generate CLO mappings using AI
 */
export async function generateCLOMappings({
  questions,
  clos,
}: {
  questions: string[]
  clos: CLOData[]
}): Promise<AIAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const prompt = buildCLOMappingPrompt(questions, clos)

  try {
    const startTime = Date.now()
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()
    const processingTime = Date.now() - startTime

    console.log(`AI analysis completed in ${processingTime}ms`)

    return parseAIResponse(text, clos)
  } catch (error) {
    console.error('Error generating CLO mappings:', error)
    throw new Error('Failed to generate AI analysis. Please try again.')
  }
}

/**
 * Build comprehensive prompt for CLO mapping
 */
function buildCLOMappingPrompt(questions: string[], clos: CLOData[]): string {
  const cloList = clos
    .map((clo, i) => {
      return `${i + 1}. ${clo.code}: ${clo.description}${clo.bloomLevel ? ` (Bloom's: ${clo.bloomLevel})` : ''}`
    })
    .join('\n')

  const questionList = questions
    .map((q, i) => `Q${i + 1}. ${q}`)
    .join('\n\n')

  return `You are an expert educational assessment analyst specializing in Course Learning Outcomes (CLO) mapping.

COURSE LEARNING OUTCOMES (CLOs):
${cloList}

QUESTIONS TO ANALYZE:
${questionList}

For EACH question, provide a comprehensive analysis:

1. **Bloom's Taxonomy Level**: Identify the cognitive level (remember/understand/apply/analyze/evaluate/create)
2. **Bloom's Reasoning**: Explain why you assigned this level (1-2 sentences)
3. **CLO Mappings**: Map to relevant CLOs with:
   - Relevance score (0-100, where 100 = perfect alignment)
   - Detailed reasoning for the mapping
   - Confidence level (0-1, based on clarity and directness of mapping)
4. **Quality Assessment**: Rate as:
   - perfect: ≥80% relevance, clear alignment, no issues
   - good: 60-79% relevance, reasonable alignment, minor issues
   - needs_improvement: <60% relevance, weak alignment, or multiple issues
   - unmapped: No relevant CLO found
5. **Issues**: List any problems (ambiguity, too broad, too narrow, unclear wording, etc.)
6. **Improved Question**: If quality < perfect, suggest an improved version with:
   - Better wording
   - Explanation of improvements
   - Target CLO it should map to
   - Target Bloom's level

**IMPORTANT MAPPING GUIDELINES:**
- A question can map to multiple CLOs if relevant
- Only include mappings with relevance ≥ 30%
- Higher relevance = more direct alignment with CLO
- Consider both content (what is assessed) and cognitive level (how it's assessed)

**QUALITY CRITERIA:**
- Perfect (≥80%): Question directly assesses the CLO at appropriate Bloom's level
- Good (60-79%): Question assesses CLO but may lack specificity or have minor issues
- Needs Improvement (<60%): Question partially relates but needs significant revision
- Unmapped: Question doesn't clearly relate to any CLO

Return response as JSON:
{
  "overall_summary": "Brief summary of analysis (1-2 sentences)",
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "questions": [
    {
      "question_number": 1,
      "question_text": "...",
      "bloom_level": "understand",
      "bloom_reasoning": "Question asks students to explain, indicating understanding level",
      "mapped_clos": [
        {
          "clo_code": "CLO-1",
          "clo_id": "${clos[0]?.id || 'xxx'}",
          "relevance_score": 85,
          "reasoning": "Detailed explanation of why this CLO maps to the question",
          "confidence": 0.9
        }
      ],
      "quality": "perfect",
      "issues": [],
      "improved_question": null
    }
  ]
}

**CRITICAL INSTRUCTIONS:**
1. Analyze ALL ${questions.length} questions
2. Be precise with relevance scores - use the full 0-100 range
3. Provide specific, actionable reasoning for each mapping
4. If quality is not "perfect", MUST provide improved_question
5. Overall summary should highlight patterns and key findings
6. Recommendations should be actionable and specific to this question set
7. Return ONLY valid JSON, no markdown formatting

Start analysis now:`
}

/**
 * Parse AI response into structured format
 */
function parseAIResponse(responseText: string, clos: CLOData[]): AIAnalysisResult {
  try {
    let cleanText = responseText.trim()

    // Remove markdown code blocks if present
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(cleanText)

    // Validate and transform data
    const result: AIAnalysisResult = {
      overall_summary: parsed.overall_summary || 'Analysis completed',
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      questions: [],
    }

    if (Array.isArray(parsed.questions)) {
      result.questions = parsed.questions.map((q: any) => {
        // Find CLO IDs from codes
        const mappedClos = Array.isArray(q.mapped_clos)
          ? q.mapped_clos.map((m: any) => {
            // Try to find matching CLO by code
            const matchingClo = clos.find(clo => clo.code === m.clo_code)
            return {
              clo_id: matchingClo?.id || m.clo_id,
              clo_code: m.clo_code,
              relevance_score: Math.min(100, Math.max(0, Number(m.relevance_score) || 0)),
              reasoning: m.reasoning || 'No reasoning provided',
              confidence: Math.min(1, Math.max(0, Number(m.confidence) || 0)),
            }
          })
          : []

        return {
          question_number: q.question_number,
          question_text: q.question_text,
          bloom_level: q.bloom_level || 'understand',
          bloom_reasoning: q.bloom_reasoning || 'Not specified',
          mapped_clos: mappedClos,
          quality: q.quality || 'unmapped',
          issues: Array.isArray(q.issues) ? q.issues : [],
          improved_question: q.improved_question || null,
        }
      })
    }

    return result
  } catch (error) {
    console.error('Error parsing AI response:', error)
    console.error('Response text:', responseText)
    throw new Error('Failed to parse AI response. Please try again.')
  }
}
