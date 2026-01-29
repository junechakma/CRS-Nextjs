import { GoogleGenerativeAI } from '@google/generative-ai'
import type { CourseCLO } from './cloService'
// @ts-ignore - mammoth types
import mammoth from 'mammoth'
// @ts-ignore - xlsx types
import * as XLSX from 'xlsx'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export interface QuestionAnalysis {
  question_text: string
  question_number: number
  mapped_clos: {
    clo_number: number
    clo_description: string
    relevance_score: number
    reasoning: string
  }[]
  issues: string[]
  blooms_analysis: {
    detected_level: string
    reasoning: string
  }
  improved_question: {
    question_text: string
    explanation: string
    target_clo: number
    target_blooms: string
  } | null
}

export interface DocumentProcessingResult {
  extracted_questions: QuestionAnalysis[]
  total_questions: number
  successfully_mapped: number
  unmapped_questions: number
  processing_time_ms: number
  overall_summary: string
  recommendations: string[]
}

export class CLOMappingService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  // private readonly MAX_QUESTIONS_PER_BATCH = 20 // Process in batches to reduce tokens

  /**
   * Main method: Process any text/document and map to CLOs
   * Works like aiAnalyticsService - simple and direct
   */
  async processDocument(
    rawText: string,
    clos: CourseCLO[]
  ): Promise<DocumentProcessingResult> {
    const startTime = performance.now()

    if (!rawText || rawText.trim().length === 0) {
      return this.emptyResult(startTime, 'No text provided')
    }

    if (clos.length === 0) {
      return this.emptyResult(startTime, 'No CLOs found - please create CLOs first')
    }

    try {
      const prompt = this.buildComprehensivePrompt(rawText, clos)
      console.log('📤 Sending to Gemini...')
      
      const result = await this.model.generateContent(prompt)
      const responseText = result.response.text()
      
      console.log('📥 Raw Gemini response:', responseText.substring(0, 500))
      
      const analysis = this.parseResponse(responseText)
      const endTime = performance.now()

      console.log('✅ Parsed analysis:', {
        questionsFound: analysis.questions.length,
        summary: analysis.summary,
        recommendations: analysis.recommendations.length
      })

      if (analysis.questions.length === 0) {
        console.warn('⚠️ No questions extracted from response')
        return this.emptyResult(startTime, 'No questions found in the text. Try a different format.')
      }

      return {
        extracted_questions: analysis.questions,
        total_questions: analysis.questions.length,
        successfully_mapped: analysis.questions.filter(q => q.mapped_clos.length > 0).length,
        unmapped_questions: analysis.questions.filter(q => q.mapped_clos.length === 0).length,
        processing_time_ms: Math.round(endTime - startTime),
        overall_summary: analysis.summary,
        recommendations: analysis.recommendations
      }
    } catch (error) {
      console.error('❌ Error processing document:', error)
      return this.emptyResult(startTime, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Build comprehensive prompt (like aiAnalyticsService)
   */
  private buildComprehensivePrompt(text: string, clos: CourseCLO[]): string {
    const closList = clos.map(c => `${c.clo_number}. ${c.clo}`).join('\n')

    return `Extract questions and map to CLOs. CRITICAL: Return ONLY valid JSON, no other text.

CLOs:
${closList}

Questions:
${text}

Bloom's levels: remember, understand, apply, analyze, evaluate, create

Return this exact JSON structure:
{
  "questions": [
    {
      "question_number": 1,
      "question_text": "the question",
      "mapped_clos": [{"clo_number": 1, "clo_description": "CLO text", "relevance_score": 85, "reasoning": "why"}],
      "blooms_analysis": {"detected_level": "apply", "reasoning": "why"},
      "issues": ["issue if any"],
      "improved_question": {"question_text": "better version", "explanation": "why better", "target_clo": 1, "target_blooms": "apply"}
    }
  ],
  "summary": "overall analysis",
  "recommendations": ["rec 1", "rec 2"]
}

IMPORTANT: 
- Return ONLY the JSON, no markdown, no explanation
- Extract ALL questions from the text
- Each question MUST have all fields
- Be concise but complete`
  }

  /**
   * Parse Gemini response (like aiAnalyticsService)
   */
  private parseResponse(responseText: string): {
    questions: QuestionAnalysis[]
    summary: string
    recommendations: string[]
  } {
    try {
      // Clean markdown formatting
      let cleanText = responseText.trim()
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '')
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '')
      }

      console.log('🔍 Attempting to parse JSON...')
      const parsed = JSON.parse(cleanText)

      // Validate structure
      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        console.error('❌ Invalid response structure - missing questions array')
        throw new Error('Invalid response structure')
      }

      console.log(`✅ Successfully parsed ${parsed.questions.length} questions`)

      return {
        questions: parsed.questions.map((q: any, idx: number) => ({
          question_number: q.question_number || idx + 1,
          question_text: q.question_text || '',
          mapped_clos: Array.isArray(q.mapped_clos) ? q.mapped_clos : [],
          blooms_analysis: q.blooms_analysis || { detected_level: 'unknown', reasoning: '' },
          issues: Array.isArray(q.issues) ? q.issues : [],
          improved_question: q.improved_question || null
        })),
        summary: parsed.summary || 'Analysis complete',
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error)
      console.error('Response text:', responseText.substring(0, 500))
      
      return {
        questions: [],
        summary: 'Failed to parse AI response. The AI might have returned an unexpected format.',
        recommendations: [
          'Try pasting fewer questions at once',
          'Ensure questions are clearly formatted',
          'Try again - sometimes the AI needs a retry'
        ]
      }
    }
  }

  /**
   * Return empty result for errors
   */
  private emptyResult(startTime: number, message: string): DocumentProcessingResult {
    return {
      extracted_questions: [],
      total_questions: 0,
      successfully_mapped: 0,
      unmapped_questions: 0,
      processing_time_ms: Math.round(performance.now() - startTime),
      overall_summary: message,
      recommendations: ['Please check your input and try again']
    }
  }

  /**
   * Extract questions from files using proper parsing libraries
   */
  async extractQuestionsFromFile(file: File): Promise<{
    success: boolean
    questions: string
    error?: string
  }> {
    try {
      const fileName = file.name.toLowerCase()
      let text = ''

      console.log(`📄 Processing file: ${fileName} (${file.type})`)

      // Handle text files
      if (file.type === 'text/plain' || fileName.endsWith('.txt')) {
        text = await file.text()
        console.log('✅ Extracted text from TXT file')
      }
      // Handle CSV
      else if (file.type === 'text/csv' || fileName.endsWith('.csv')) {
        text = await this.extractFromCSV(file)
        console.log('✅ Extracted text from CSV file')
      }
      // Handle Excel files (.xlsx, .xls)
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        text = await this.extractFromExcel(file)
        console.log('✅ Extracted text from Excel file')
      }
      // Handle Word documents (.docx)
      else if (fileName.endsWith('.docx')) {
        text = await this.extractFromDOCX(file)
        console.log('✅ Extracted text from DOCX file')
      }
      // Handle PDF
      else if (file.type === 'application/pdf' || fileName.endsWith('.pdf')) {
        text = await this.extractFromPDF(file)
        console.log('✅ Extracted text from PDF file')
      }
      // For other formats, try to read as text
      else {
        text = await file.text()
        console.log('⚠️ Unknown format, attempting text extraction')
      }

      if (!text || text.trim().length === 0) {
        return {
          success: false,
          questions: '',
          error: 'File is empty or unreadable. Please ensure your file contains questions.'
        }
      }

      console.log(`📊 Extracted ${text.split('\n').length} lines`)

      return {
        success: true,
        questions: text
      }
    } catch (error) {
      console.error('❌ Error reading file:', error)
      return {
        success: false,
        questions: '',
        error: `Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Extract text from CSV file
   */
  private async extractFromCSV(file: File): Promise<string> {
    const csvText = await file.text()
    const lines = csvText.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const cols = line.split(',')
      return cols[0].replace(/^["']|["']$/g, '').trim()
    }).filter(q => q.length > 0).join('\n')
  }

  /**
   * Extract text from Excel file using xlsx library
   */
  private async extractFromExcel(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    
    // Get first sheet
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    
    // Convert to JSON to extract first column
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]
    
    // Extract first column (questions)
    const questions = jsonData
      .map(row => row[0])
      .filter(cell => cell && String(cell).trim().length > 0)
      .map(cell => String(cell).trim())
    
    return questions.join('\n')
  }

  /**
   * Extract text from DOCX file using mammoth library
   */
  private async extractFromDOCX(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer: buffer })
    return result.value
  }

  /**
   * Extract text from PDF file using Gemini Vision API
   * (pdf-parse doesn't work in browser, so we use Gemini)
   */
  private async extractFromPDF(file: File): Promise<string> {
    try {
      const base64 = await this.fileToBase64(file)
      const prompt = `Extract ALL questions from this PDF document. Return ONLY the questions, one per line. Keep question numbers if present (1., Q1:, etc.). Extract complete question text including sub-parts (a, b, c, etc.).`

      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64
          }
        }
      ])

      const text = result.response.text()
      console.log(`✅ Extracted ${text.split('\n').length} lines from PDF`)
      return text
    } catch (error) {
      console.error('❌ Error extracting from PDF:', error)
      throw new Error('Failed to extract text from PDF. The file might be corrupted or image-based.')
    }
  }

  /**
   * Convert file to base64 for Gemini API
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

export const cloMappingService = new CLOMappingService()
