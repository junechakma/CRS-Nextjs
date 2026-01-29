import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export interface AIInsight {
  summary: string
  strengths: string[]
  areasForImprovement: string[]
  anomalies: string[]
  recommendations: string[]
  categoryInsights: {
    category: string
    analysis: string
  }[]
}

export interface SessionData {
  sessionInfo: {
    courseCode: string
    courseTitle: string
    section: string
    date: string
    totalResponses: number
    averageRating: number
    completionRate: number
  }
  questions: {
    questionText: string
    category: string
    type: string
    responses: (string | number | boolean)[]
    averageRating?: number
    distribution?: Record<string, number>
  }[]
}

export class AIAnalyticsService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  /**
   * Analyze session data and generate AI insights
   */
  async analyzeSessionData(sessionData: SessionData): Promise<AIInsight> {
    const prompt = this.buildAnalysisPrompt(sessionData)

    try {
      const result = await this.model.generateContent(prompt)
      const response = result.response
      const text = response.text()

      return this.parseAIResponse(text)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      throw new Error('Failed to generate AI insights. Please try again.')
    }
  }

  /**
   * Build a comprehensive prompt for Gemini
   */
  private buildAnalysisPrompt(data: SessionData): string {
    const { sessionInfo, questions } = data

    // Format questions data for the prompt
    const questionsData = questions.map((q, idx) => {
      let questionSummary = `
Question ${idx + 1}: ${q.questionText}
- Category: ${q.category}
- Type: ${q.type}
- Total Responses: ${q.responses.length}`

      if (q.type === 'rating' && q.averageRating !== undefined) {
        questionSummary += `
- Average Rating: ${q.averageRating.toFixed(2)}/5
- Distribution: ${JSON.stringify(q.distribution)}`
      } else if (q.type === 'yes_no' && q.distribution) {
        questionSummary += `
- Distribution: ${JSON.stringify(q.distribution)}`
      } else if (q.type === 'text') {
        questionSummary += `
- Sample Responses: ${q.responses.slice(0, 5).join('; ')}`
      } else if (q.type === 'multiple_choice' && q.distribution) {
        questionSummary += `
- Distribution: ${JSON.stringify(q.distribution)}`
      }

      return questionSummary
    }).join('\n')

    return `You are an educational analytics expert analyzing student feedback from a class session.

SESSION INFORMATION:
Course: ${sessionInfo.courseCode} - ${sessionInfo.courseTitle} (Section ${sessionInfo.section})
Date: ${sessionInfo.date}
Total Responses: ${sessionInfo.totalResponses}
Average Rating: ${sessionInfo.averageRating.toFixed(2)}/5
Completion Rate: ${sessionInfo.completionRate}%

QUESTIONS AND RESPONSES:
${questionsData}

Please analyze this data and provide insights in the following JSON format:
{
  "summary": "One concise sentence summarizing the session",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "anomalies": ["anomaly 1 if any"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "categoryInsights": [
    {
      "category": "category_name",
      "analysis": "Brief 1-2 sentence analysis"
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Keep "summary" to ONE sentence (max 20 words)
2. Limit "strengths" to TOP 2 most significant points (each max 10 words)
3. Limit "areasForImprovement" to TOP 2 most critical areas (each max 10 words)
4. Only include "anomalies" if truly unusual patterns exist (e.g., extremely polarized responses, contradictory feedback, suspicious patterns)
5. Provide TOP 2 actionable "recommendations" (each max 15 words)
6. Keep "categoryInsights" analysis brief (1-2 sentences max per category)
7. Be concise and direct - avoid filler words

Return ONLY valid JSON, no additional text or markdown formatting.`
  }

  /**
   * Parse AI response and structure it
   */
  private parseAIResponse(responseText: string): AIInsight {
    try {
      // Remove markdown code blocks if present
      let cleanText = responseText.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
      }

      const parsed = JSON.parse(cleanText)

      return {
        summary: parsed.summary || 'No summary available',
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        areasForImprovement: Array.isArray(parsed.areasForImprovement) ? parsed.areasForImprovement : [],
        anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.filter((a: string) => a && a.length > 0) : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        categoryInsights: Array.isArray(parsed.categoryInsights) ? parsed.categoryInsights : []
      }
    } catch (error) {
      console.error('Error parsing AI response:', error)
      // Return a fallback structure
      return {
        summary: 'Unable to generate detailed insights at this time.',
        strengths: [],
        areasForImprovement: [],
        anomalies: [],
        recommendations: ['Please try analyzing the session again.'],
        categoryInsights: []
      }
    }
  }
}

export const aiAnalyticsService = new AIAnalyticsService()
