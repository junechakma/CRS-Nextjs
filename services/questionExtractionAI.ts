/**
 * AI Question Extraction Service
 * Uses Gemini to extract and format questions from raw text
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

// Use server-side environment variable (more secure)
const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''

if (!apiKey) {
  console.error('WARNING: GEMINI_API_KEY not set. AI features will not work.')
}

const genAI = new GoogleGenerativeAI(apiKey)

export interface ExtractedQuestion {
  questionNumber: number
  questionText: string
  questionType?: 'mcq' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
  options?: string[]
  suggestedAnswer?: string
  marksAllocated?: number
}

export interface QuestionExtractionResult {
  questions: ExtractedQuestion[]
  summary: string
  totalQuestions: number
}

/**
 * Extract and format questions from raw text using AI
 */
export async function extractQuestionsWithAI(rawText: string): Promise<QuestionExtractionResult> {
  console.log('=== Question Extraction AI Service ===')
  console.log('Step 1: Initializing Gemini model...')

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    console.log('✓ Model initialized successfully')

    console.log('Step 2: Building extraction prompt...')
    console.log('Raw text length:', rawText.length, 'characters')
    console.log('Raw text preview:', rawText.substring(0, 200) + '...')

    const prompt = buildExtractionPrompt(rawText)
    console.log('✓ Prompt built, total length:', prompt.length)

    console.log('Step 3: Calling Gemini API...')
    const startTime = Date.now()

    const result = await model.generateContent(prompt)
    console.log('✓ Gemini API responded')

    const response = result.response
    console.log('Step 4: Extracting response text...')

    const text = response.text()
    const processingTime = Date.now() - startTime

    console.log('✓ Response text extracted')
    console.log('Processing time:', processingTime, 'ms')
    console.log('Response length:', text.length, 'characters')
    console.log('Response preview:', text.substring(0, 300) + '...')

    console.log('Step 5: Parsing AI response...')
    const parsed = parseExtractionResponse(text)
    console.log('✓ Parsing complete!')
    console.log('Extracted questions:', parsed.totalQuestions)
    console.log('=== Extraction Successful ===')

    return parsed
  } catch (error) {
    console.error('❌ === EXTRACTION FAILED ===')
    console.error('Error occurred at some step above')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : String(error))

    if (error instanceof Error) {
      console.error('Full error object:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      })
    } else {
      console.error('Non-Error object thrown:', error)
    }

    // Check if it's an API error
    if (typeof error === 'object' && error !== null) {
      console.error('Error properties:', Object.keys(error))
      console.error('Full error:', JSON.stringify(error, null, 2))
    }

    throw new Error(`Failed to extract questions: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build extraction prompt
 */
function buildExtractionPrompt(rawText: string): string {
  return `You are an expert educational content analyzer. Extract and format all questions from the following document text.

DOCUMENT TEXT:
${rawText}

Your task:
1. Identify all questions in the text
2. Clean up formatting and fix any OCR errors
3. Properly number each question (Q1, Q2, etc.)
4. Identify question type (MCQ, short answer, essay, true/false, fill in the blank)
5. For MCQs, extract all options (A, B, C, D, etc.)
6. Extract marks allocated if mentioned
7. Remove any instructional text that's not part of the question

**IMPORTANT GUIDELINES:**
- Only extract actual questions, not instructions or headers
- Clean up formatting inconsistencies
- Fix obvious typos or OCR errors
- Preserve mathematical notation and symbols
- Each question should be complete and clear
- If a question has sub-parts (a, b, c), keep them together

Return as JSON:
{
  "summary": "Brief summary of extracted content (1 sentence)",
  "totalQuestions": number,
  "questions": [
    {
      "questionNumber": 1,
      "questionText": "Full question text here",
      "questionType": "mcq" | "short_answer" | "essay" | "true_false" | "fill_blank",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."], // Only for MCQ
      "suggestedAnswer": "Answer if provided in text",
      "marksAllocated": 5 // If mentioned in document
    }
  ]
}

**CRITICAL**:
- Return ONLY valid JSON, no markdown formatting
- Include ALL questions found in the document
- Do not make up questions that aren't in the text
- If you're unsure about question type, use "short_answer"

Start extraction now:`
}

/**
 * Parse AI response
 */
function parseExtractionResponse(responseText: string): QuestionExtractionResult {
  console.log('--- Parsing AI Response ---')
  console.log('Response length:', responseText.length)

  try {
    console.log('Cleaning markdown code blocks...')
    let cleanText = responseText.trim()

    // Remove markdown code blocks
    if (cleanText.startsWith('```json')) {
      console.log('Found ```json code block, removing...')
      cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
    } else if (cleanText.startsWith('```')) {
      console.log('Found ``` code block, removing...')
      cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
    } else {
      console.log('No code blocks found')
    }

    console.log('Clean text length:', cleanText.length)
    console.log('Clean text preview:', cleanText.substring(0, 500))

    console.log('Parsing JSON...')
    const parsed = JSON.parse(cleanText)
    console.log('✓ JSON parsed successfully')

    console.log('Parsed object keys:', Object.keys(parsed))
    console.log('Summary:', parsed.summary)
    console.log('Total questions:', parsed.totalQuestions)
    console.log('Questions array length:', parsed.questions?.length)

    if (Array.isArray(parsed.questions)) {
      console.log('Sample question:', parsed.questions[0])
    }

    const result = {
      summary: parsed.summary || 'Questions extracted successfully',
      totalQuestions: parsed.totalQuestions || parsed.questions?.length || 0,
      questions: Array.isArray(parsed.questions)
        ? parsed.questions.map((q: any, index: number) => ({
          questionNumber: q.questionNumber || index + 1,
          questionText: q.questionText || '',
          questionType: q.questionType || 'short_answer',
          options: Array.isArray(q.options) ? q.options : undefined,
          suggestedAnswer: q.suggestedAnswer || undefined,
          marksAllocated: q.marksAllocated || undefined,
        }))
        : [],
    }

    console.log('✓ Result object created successfully')
    console.log('Final question count:', result.questions.length)
    return result

  } catch (error) {
    console.error('❌ === PARSING FAILED ===')
    console.error('Parse error type:', error?.constructor?.name)
    console.error('Parse error message:', error instanceof Error ? error.message : String(error))
    console.error('Failed at parsing this response:')
    console.error('--- START RESPONSE ---')
    console.error(responseText)
    console.error('--- END RESPONSE ---')

    if (error instanceof SyntaxError) {
      console.error('This is a JSON syntax error. The AI returned invalid JSON.')
    }

    throw new Error('Failed to parse AI response. Please try again.')
  }
}
