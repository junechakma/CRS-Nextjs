/**
 * Local Algorithmic CLO Analysis Service
 * Keyword-based analysis without AI API calls
 * Free, fast, and privacy-friendly
 */

export interface CLOData {
  id: string
  code: string
  description: string
  bloomLevel?: string | null
}

export interface LocalAnalysisResult {
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
    improved_question: null
  }[]
}

/**
 * Analyze CLO mappings using local keyword-based algorithm
 */
export async function analyzeCLOsLocally({
  questions,
  clos,
}: {
  questions: string[]
  clos: CLOData[]
}): Promise<LocalAnalysisResult> {
  const results = questions.map((questionText, index) => {
    // 1. Extract keywords from question
    const questionKeywords = extractKeywords(questionText)

    // 2. Detect Bloom's level from verbs
    const bloomLevel = detectBloomLevel(questionText)

    // 3. Match against CLO keywords
    const cloScores = clos.map(clo => {
      const cloKeywords = extractKeywords(clo.description)
      const overlap = calculateKeywordOverlap(questionKeywords, cloKeywords)

      // Calculate relevance score (0-100)
      const maxKeywords = Math.max(questionKeywords.length, cloKeywords.length, 1)
      let relevanceScore = Math.min(100, (overlap / maxKeywords) * 200)

      // Boost score if Bloom levels match
      if (clo.bloomLevel && bloomLevel.toLowerCase() === clo.bloomLevel.toLowerCase()) {
        relevanceScore = Math.min(100, relevanceScore * 1.2)
      }

      // Calculate confidence (0-1) based on keyword count
      const confidence = Math.min(1, overlap / 5)

      return {
        clo_id: clo.id,
        clo_code: clo.code,
        relevance_score: Math.round(relevanceScore * 100) / 100,
        reasoning: `Keyword overlap: ${overlap} common terms (${questionKeywords.filter(k => cloKeywords.includes(k)).join(', ')})`,
        confidence: Math.round(confidence * 100) / 100,
      }
    })

    // 4. Filter mappings with relevance > 30%
    const validMappings = cloScores.filter(s => s.relevance_score > 30)

    // 5. Assess quality
    let quality: 'perfect' | 'good' | 'needs_improvement' | 'unmapped' = 'unmapped'
    const issues: string[] = []

    if (validMappings.length === 0) {
      quality = 'unmapped'
      issues.push('No CLO mappings found above 30% relevance threshold')
    } else if (validMappings.some(m => m.relevance_score >= 80)) {
      quality = 'perfect'
    } else if (validMappings.some(m => m.relevance_score >= 60)) {
      quality = 'good'
      if (validMappings[0].confidence < 0.5) {
        issues.push('Mapping confidence is low - manual review recommended')
      }
    } else {
      quality = 'needs_improvement'
      issues.push('Relevance scores are below 60% - question may need revision')
    }

    return {
      question_number: index + 1,
      question_text: questionText,
      bloom_level: bloomLevel,
      bloom_reasoning: `Detected from action verbs in question`,
      mapped_clos: validMappings.sort((a, b) => b.relevance_score - a.relevance_score),
      quality,
      issues,
      improved_question: null, // Not available for local analysis
    }
  })

  // Generate overall stats
  const perfectCount = results.filter(r => r.quality === 'perfect').length
  const goodCount = results.filter(r => r.quality === 'good').length
  const needsImprovementCount = results.filter(r => r.quality === 'needs_improvement').length
  const unmappedCount = results.filter(r => r.quality === 'unmapped').length

  const overallSummary = `Analyzed ${questions.length} questions using keyword matching. ${perfectCount} perfect, ${goodCount} good, ${needsImprovementCount} need improvement, ${unmappedCount} unmapped.`

  const recommendations: string[] = [
    'Consider using AI analysis for more detailed insights and improved question suggestions.',
    'Review low-confidence mappings manually to ensure accuracy.',
  ]

  if (unmappedCount > questions.length / 3) {
    recommendations.push('High number of unmapped questions - consider revising CLO descriptions or question wording.')
  }

  if (perfectCount === 0 && goodCount === 0) {
    recommendations.push('No high-quality mappings found. Questions may be too generic or CLO descriptions need clarification.')
  }

  return {
    overall_summary: overallSummary,
    recommendations,
    questions: results,
  }
}

/**
 * Extract keywords from text (remove stop words, lowercase)
 */
function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'of', 'and', 'or', 'but',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'it', 'its', 'they', 'their',
    'what', 'which', 'who', 'when', 'where', 'why', 'how', 'with', 'from',
    'by', 'as', 'such', 'not', 'so', 'than', 'too', 'very', 'just', 'also',
  ])

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word))
    .filter((word, index, self) => self.indexOf(word) === index) // Remove duplicates
}

/**
 * Calculate keyword overlap between two sets
 */
function calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
  const set1 = new Set(keywords1)
  const set2 = new Set(keywords2)
  return [...set1].filter(k => set2.has(k)).length
}

/**
 * Detect Bloom's Taxonomy level from action verbs
 */
function detectBloomLevel(question: string): string {
  const text = question.toLowerCase()

  const bloomVerbs: Record<string, string[]> = {
    remember: ['list', 'name', 'identify', 'define', 'recall', 'state', 'recognize', 'memorize', 'repeat', 'label'],
    understand: ['explain', 'describe', 'summarize', 'interpret', 'clarify', 'paraphrase', 'illustrate', 'classify', 'compare', 'discuss'],
    apply: ['solve', 'use', 'demonstrate', 'apply', 'implement', 'execute', 'employ', 'operate', 'show', 'illustrate'],
    analyze: ['analyze', 'compare', 'contrast', 'examine', 'differentiate', 'distinguish', 'investigate', 'categorize', 'relate', 'breakdown'],
    evaluate: ['evaluate', 'judge', 'assess', 'critique', 'justify', 'argue', 'defend', 'support', 'rate', 'prioritize'],
    create: ['create', 'design', 'develop', 'construct', 'formulate', 'compose', 'plan', 'produce', 'invent', 'generate'],
  }

  // Check for verbs in order of complexity (higher levels first)
  const levels = ['create', 'evaluate', 'analyze', 'apply', 'understand', 'remember']

  for (const level of levels) {
    const verbs = bloomVerbs[level]
    for (const verb of verbs) {
      // Match whole word boundaries
      const regex = new RegExp(`\\b${verb}\\b`, 'i')
      if (regex.test(text)) {
        return level
      }
    }
  }

  // Default to 'understand' if no specific verb found
  return 'understand'
}
