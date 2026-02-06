/**
 * Document Parsing Utilities
 * Extract questions from PDF, DOCX, and plain text
 */

// Import using require for better compatibility with CommonJS modules
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')

/**
 * Parse PDF file and extract questions
 */
export async function parsePDF(fileBuffer: ArrayBuffer): Promise<string[]> {
  try {
    const data = await pdfParse(Buffer.from(fileBuffer))
    const text = data.text
    return extractQuestionsFromText(text)
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error('Failed to parse PDF file')
  }
}

/**
 * Parse DOCX file and extract questions
 */
export async function parseDOCX(fileBuffer: ArrayBuffer): Promise<string[]> {
  try {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(fileBuffer) })
    const text = result.value
    return extractQuestionsFromText(text)
  } catch (error) {
    console.error('Error parsing DOCX:', error)
    throw new Error('Failed to parse DOCX file')
  }
}

/**
 * Parse plain text into questions
 */
export function parseTextQuestions(text: string): string[] {
  return extractQuestionsFromText(text)
}

/**
 * Extract questions from text using heuristics
 * Supports:
 * - Numbered questions (1., 2., 1), 2), Q1, Q1., etc.)
 * - Lines ending with question marks
 * - Paragraphs separated by blank lines
 */
function extractQuestionsFromText(text: string): string[] {
  // Clean up text
  const cleanText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim()

  const questions: string[] = []
  const lines = cleanText.split('\n')

  let currentQuestion = ''
  let inQuestion = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      if (currentQuestion) {
        questions.push(currentQuestion.trim())
        currentQuestion = ''
        inQuestion = false
      }
      continue
    }

    // Check if line starts a new question
    const questionMarkerRegex = /^(\d+[\.)]\s+|Q\d+[\.):]?\s+|Question\s+\d+[\.):]?\s+)/i
    const isQuestionStart = questionMarkerRegex.test(line)

    if (isQuestionStart) {
      // Save previous question if exists
      if (currentQuestion) {
        questions.push(currentQuestion.trim())
      }
      // Start new question (remove the number/marker)
      currentQuestion = line.replace(questionMarkerRegex, '')
      inQuestion = true
    } else if (inQuestion) {
      // Continue current question
      currentQuestion += ' ' + line
    } else {
      // If not in a question, check if this line is a standalone question
      if (line.includes('?') || line.length > 20) {
        // Likely a question without numbering
        if (currentQuestion) {
          questions.push(currentQuestion.trim())
        }
        currentQuestion = line
        inQuestion = true
      }
    }
  }

  // Add last question
  if (currentQuestion) {
    questions.push(currentQuestion.trim())
  }

  // Filter out very short "questions" (likely not real questions)
  const validQuestions = questions.filter(q => q.length > 10)

  // If we didn't find numbered questions, try splitting by question marks
  if (validQuestions.length === 0) {
    const questionsBySplit = cleanText.split('?').map(q => q.trim() + '?')
    return questionsBySplit.filter(q => q.length > 15)
  }

  return validQuestions
}

/**
 * Validate if extracted questions look reasonable
 */
export function validateQuestions(questions: string[]): {
  isValid: boolean
  error?: string
  warnings: string[]
} {
  const warnings: string[] = []

  if (questions.length === 0) {
    return {
      isValid: false,
      error: 'No questions found in document',
      warnings,
    }
  }

  if (questions.length > 200) {
    warnings.push('Large number of questions detected. This may take longer to analyze.')
  }

  // Check if questions are too short
  const tooShort = questions.filter(q => q.length < 15).length
  if (tooShort > questions.length / 2) {
    warnings.push('Many questions seem unusually short. Please verify the extraction.')
  }

  // Check if questions are too long
  const tooLong = questions.filter(q => q.length > 500).length
  if (tooLong > 0) {
    warnings.push('Some questions are very long. They may contain multiple questions.')
  }

  return {
    isValid: true,
    warnings,
  }
}
