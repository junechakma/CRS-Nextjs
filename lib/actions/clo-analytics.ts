'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { parsePDF, parseDOCX, parseTextQuestions, validateQuestions } from '@/lib/utils/documentParsers'
import { generateCLOMappings } from '@/services/cloAnalyticsAI'
import { analyzeCLOsLocally } from '@/services/cloAnalyticsLocal'
import { getCLOs } from '@/lib/supabase/queries/teacher'

// ============================================================================
// DOCUMENT MANAGEMENT
// ============================================================================

/**
 * Create analysis document record (for file upload)
 */
export async function createAnalysisDocumentAction({
  cloSetId,
  fileName,
  fileType,
  fileSize,
}: {
  cloSetId: string
  fileName: string
  fileType: 'pdf' | 'docx'
  fileSize: number
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify CLO set ownership
    const { data: cloSet } = await supabase
      .from('clo_sets')
      .select('id')
      .eq('id', cloSetId)
      .eq('user_id', user.id)
      .single()

    if (!cloSet) {
      return { success: false, error: 'CLO set not found' }
    }

    // Create document record
    const { data: document, error } = await supabase
      .from('clo_analysis_documents')
      .insert({
        clo_set_id: cloSetId,
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating analysis document:', error)
      return { success: false, error: error.message }
    }

    // Generate upload URL for Supabase Storage
    const filePath = `clo-analytics/${user.id}/${document.id}/${fileName}`
    const { data: uploadData } = await supabase.storage
      .from('documents')
      .createSignedUploadUrl(filePath)

    if (!uploadData) {
      return { success: false, error: 'Failed to generate upload URL' }
    }

    // Update document with file URL
    await supabase
      .from('clo_analysis_documents')
      .update({ file_url: filePath })
      .eq('id', document.id)

    revalidatePath(`/teacher/clo-mapping/${cloSetId}/analytics`)
    return {
      success: true,
      data: {
        documentId: document.id,
        uploadUrl: uploadData.signedUrl,
        filePath,
      },
    }
  } catch (error) {
    console.error('Error creating analysis document:', error)
    return { success: false, error: 'Failed to create document' }
  }
}

/**
 * Parse uploaded document and extract questions
 */
export async function parseDocumentAction(documentId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get document
    const { data: document } = await supabase
      .from('clo_analysis_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Update status to parsing
    await supabase
      .from('clo_analysis_documents')
      .update({ status: 'parsing' })
      .eq('id', documentId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('documents')
      .download(document.file_url)

    if (downloadError || !fileData) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'Failed to download file',
        })
        .eq('id', documentId)
      return { success: false, error: 'Failed to download file' }
    }

    // Parse document
    const buffer = await fileData.arrayBuffer()
    let questions: string[] = []

    try {
      if (document.file_type === 'pdf') {
        questions = await parsePDF(buffer)
      } else if (document.file_type === 'docx') {
        questions = await parseDOCX(buffer)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (parseError) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: `Failed to parse ${document.file_type.toUpperCase()} file`,
        })
        .eq('id', documentId)
      return { success: false, error: `Failed to parse ${document.file_type.toUpperCase()}` }
    }

    // Validate questions
    const validation = validateQuestions(questions)
    if (!validation.isValid) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: validation.error,
        })
        .eq('id', documentId)
      return { success: false, error: validation.error }
    }

    // Save questions to database
    const questionRecords = questions.map((questionText, index) => ({
      document_id: documentId,
      clo_set_id: document.clo_set_id,
      question_number: index + 1,
      question_text: questionText,
      order_index: index,
    }))

    const { error: questionsError } = await supabase
      .from('clo_analysis_questions')
      .insert(questionRecords)

    if (questionsError) {
      console.error('Error saving questions:', questionsError)
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'Failed to save questions',
        })
        .eq('id', documentId)
      return { success: false, error: 'Failed to save questions' }
    }

    // Update document status
    await supabase
      .from('clo_analysis_documents')
      .update({
        status: 'parsed',
        total_questions: questions.length,
        parsed_at: new Date().toISOString(),
      })
      .eq('id', documentId)

    revalidatePath(`/teacher/clo-mapping/${document.clo_set_id}/analytics`)
    return {
      success: true,
      data: {
        totalQuestions: questions.length,
        warnings: validation.warnings,
      },
    }
  } catch (error) {
    console.error('Error parsing document:', error)
    return { success: false, error: 'Failed to parse document' }
  }
}

/**
 * Create questions from pasted text (no file upload)
 */
export async function createQuestionsFromTextAction({
  cloSetId,
  questionsText,
}: {
  cloSetId: string
  questionsText: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Verify CLO set ownership
    const { data: cloSet } = await supabase
      .from('clo_sets')
      .select('id')
      .eq('id', cloSetId)
      .eq('user_id', user.id)
      .single()

    if (!cloSet) {
      return { success: false, error: 'CLO set not found' }
    }

    // Parse text into questions
    const questions = parseTextQuestions(questionsText)

    // Validate questions
    const validation = validateQuestions(questions)
    if (!validation.isValid) {
      return { success: false, error: validation.error }
    }

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('clo_analysis_documents')
      .insert({
        clo_set_id: cloSetId,
        user_id: user.id,
        file_name: null,
        file_type: 'text',
        file_size: questionsText.length,
        status: 'parsed',
        total_questions: questions.length,
        parsed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (docError) {
      console.error('Error creating document:', docError)
      return { success: false, error: docError.message }
    }

    // Save questions
    const questionRecords = questions.map((questionText, index) => ({
      document_id: document.id,
      clo_set_id: cloSetId,
      question_number: index + 1,
      question_text: questionText,
      order_index: index,
    }))

    const { error: questionsError } = await supabase
      .from('clo_analysis_questions')
      .insert(questionRecords)

    if (questionsError) {
      console.error('Error saving questions:', questionsError)
      return { success: false, error: 'Failed to save questions' }
    }

    revalidatePath(`/teacher/clo-mapping/${cloSetId}/analytics`)
    return {
      success: true,
      data: {
        documentId: document.id,
        totalQuestions: questions.length,
        warnings: validation.warnings,
      },
    }
  } catch (error) {
    console.error('Error creating questions from text:', error)
    return { success: false, error: 'Failed to create questions' }
  }
}

// ============================================================================
// ANALYSIS
// ============================================================================

/**
 * Analyze CLO mappings using AI (Gemini)
 */
export async function analyzeCLOMappingsAIAction(documentId: string) {
  try {
    const startTime = Date.now()
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get document and verify ownership
    const { data: document } = await supabase
      .from('clo_analysis_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Update status to analyzing
    await supabase
      .from('clo_analysis_documents')
      .update({ status: 'analyzing' })
      .eq('id', documentId)

    // Get questions
    const { data: questions } = await supabase
      .from('clo_analysis_questions')
      .select('*')
      .eq('document_id', documentId)
      .order('question_number', { ascending: true })

    if (!questions || questions.length === 0) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'No questions found',
        })
        .eq('id', documentId)
      return { success: false, error: 'No questions found' }
    }

    // Get CLOs
    const clos = await getCLOs(document.clo_set_id)

    if (clos.length === 0) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'No CLOs found in this set',
        })
        .eq('id', documentId)
      return { success: false, error: 'No CLOs found' }
    }

    // Run AI analysis
    const questionTexts = questions.map(q => q.question_text)
    const cloData = clos.map(clo => ({
      id: clo.id,
      code: clo.code,
      description: clo.description,
      bloomLevel: clo.bloomLevel,
    }))

    let analysisResult
    try {
      analysisResult = await generateCLOMappings({
        questions: questionTexts,
        clos: cloData,
      })
    } catch (aiError) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'AI analysis failed',
        })
        .eq('id', documentId)
      return { success: false, error: 'AI analysis failed' }
    }

    // Save analysis results
    await saveAnalysisResults(
      supabase,
      documentId,
      document.clo_set_id,
      user.id,
      questions,
      analysisResult,
      'ai',
      Date.now() - startTime
    )

    revalidatePath(`/teacher/clo-mapping/${document.clo_set_id}/analytics`)
    return { success: true, data: analysisResult }
  } catch (error) {
    console.error('Error analyzing CLO mappings with AI:', error)
    return { success: false, error: 'Failed to analyze' }
  }
}

/**
 * Analyze CLO mappings using local algorithm
 */
export async function analyzeCLOMappingsLocalAction(documentId: string) {
  try {
    const startTime = Date.now()
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get document and verify ownership
    const { data: document } = await supabase
      .from('clo_analysis_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Update status to analyzing
    await supabase
      .from('clo_analysis_documents')
      .update({ status: 'analyzing' })
      .eq('id', documentId)

    // Get questions
    const { data: questions } = await supabase
      .from('clo_analysis_questions')
      .select('*')
      .eq('document_id', documentId)
      .order('question_number', { ascending: true })

    if (!questions || questions.length === 0) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'No questions found',
        })
        .eq('id', documentId)
      return { success: false, error: 'No questions found' }
    }

    // Get CLOs
    const clos = await getCLOs(document.clo_set_id)

    if (clos.length === 0) {
      await supabase
        .from('clo_analysis_documents')
        .update({
          status: 'failed',
          error_message: 'No CLOs found in this set',
        })
        .eq('id', documentId)
      return { success: false, error: 'No CLOs found' }
    }

    // Run local analysis
    const questionTexts = questions.map(q => q.question_text)
    const cloData = clos.map(clo => ({
      id: clo.id,
      code: clo.code,
      description: clo.description,
      bloomLevel: clo.bloomLevel,
    }))

    const analysisResult = await analyzeCLOsLocally({
      questions: questionTexts,
      clos: cloData,
    })

    // Save analysis results
    await saveAnalysisResults(
      supabase,
      documentId,
      document.clo_set_id,
      user.id,
      questions,
      analysisResult,
      'algorithmic',
      Date.now() - startTime
    )

    revalidatePath(`/teacher/clo-mapping/${document.clo_set_id}/analytics`)
    return { success: true, data: analysisResult }
  } catch (error) {
    console.error('Error analyzing CLO mappings locally:', error)
    return { success: false, error: 'Failed to analyze' }
  }
}

/**
 * Helper: Save analysis results to database
 */
async function saveAnalysisResults(
  supabase: any,
  documentId: string,
  cloSetId: string,
  userId: string,
  questions: any[],
  analysisResult: any,
  method: 'ai' | 'algorithmic',
  processingTimeMs: number
) {
  // Update questions with analysis results
  for (const resultQuestion of analysisResult.questions) {
    const dbQuestion = questions.find(q => q.question_number === resultQuestion.question_number)
    if (!dbQuestion) continue

    await supabase
      .from('clo_analysis_questions')
      .update({
        bloom_level: resultQuestion.bloom_level,
        bloom_reasoning: resultQuestion.bloom_reasoning,
        quality: resultQuestion.quality,
        issues: resultQuestion.issues,
        improved_question_text: resultQuestion.improved_question?.text || null,
        improved_explanation: resultQuestion.improved_question?.explanation || null,
        improved_target_clo_id: resultQuestion.improved_question?.target_clo_id || null,
        improved_target_bloom: resultQuestion.improved_question?.target_bloom || null,
      })
      .eq('id', dbQuestion.id)

    // Delete old mappings for this question
    await supabase
      .from('clo_analysis_mappings')
      .delete()
      .eq('analysis_question_id', dbQuestion.id)

    // Insert new mappings
    if (resultQuestion.mapped_clos && resultQuestion.mapped_clos.length > 0) {
      const mappings = resultQuestion.mapped_clos.map((mapping: any) => ({
        analysis_question_id: dbQuestion.id,
        clo_id: mapping.clo_id,
        relevance_score: mapping.relevance_score,
        reasoning: mapping.reasoning,
        confidence: mapping.confidence,
      }))

      await supabase.from('clo_analysis_mappings').insert(mappings)
    }
  }

  // Calculate stats
  const perfectCount = analysisResult.questions.filter((q: any) => q.quality === 'perfect').length
  const goodCount = analysisResult.questions.filter((q: any) => q.quality === 'good').length
  const needsImprovementCount = analysisResult.questions.filter(
    (q: any) => q.quality === 'needs_improvement'
  ).length
  const unmappedCount = analysisResult.questions.filter((q: any) => q.quality === 'unmapped').length
  const successfullyMapped = perfectCount + goodCount + needsImprovementCount

  // Delete old report (unique constraint ensures only one per document)
  await supabase.from('clo_analysis_reports').delete().eq('document_id', documentId)

  // Insert new report
  await supabase.from('clo_analysis_reports').insert({
    document_id: documentId,
    clo_set_id: cloSetId,
    user_id: userId,
    analysis_method: method,
    total_questions: analysisResult.questions.length,
    successfully_mapped: successfullyMapped,
    unmapped_questions: unmappedCount,
    perfect_questions: perfectCount,
    good_questions: goodCount,
    needs_improvement: needsImprovementCount,
    overall_summary: analysisResult.overall_summary,
    recommendations: analysisResult.recommendations,
    processing_time_ms: processingTimeMs,
    tokens_used: null, // TODO: Track from Gemini API if available
  })

  // Update document status
  await supabase
    .from('clo_analysis_documents')
    .update({
      status: 'completed',
      analyzed_at: new Date().toISOString(),
    })
    .eq('id', documentId)
}

// ============================================================================
// OTHER ACTIONS
// ============================================================================

/**
 * Delete analysis document and all related data
 */
export async function deleteAnalysisDocumentAction(documentId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get document to get clo_set_id for revalidation
    const { data: document } = await supabase
      .from('clo_analysis_documents')
      .select('clo_set_id, file_url')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Delete file from storage if exists
    if (document.file_url) {
      await supabase.storage.from('documents').remove([document.file_url])
    }

    // Delete document (cascades to questions, mappings, report)
    const { error } = await supabase
      .from('clo_analysis_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting document:', error)
      return { success: false, error: error.message }
    }

    revalidatePath(`/teacher/clo-mapping/${document.clo_set_id}/analytics`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting analysis document:', error)
    return { success: false, error: 'Failed to delete document' }
  }
}

/**
 * Save analyzed questions to question template
 */
export async function saveQuestionsToTemplateAction({
  documentId,
  templateName,
  templateDescription,
  questionIds,
}: {
  documentId: string
  templateName: string
  templateDescription?: string
  questionIds?: string[] // If null, save all
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get document
    const { data: document } = await supabase
      .from('clo_analysis_documents')
      .select('clo_set_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single()

    if (!document) {
      return { success: false, error: 'Document not found' }
    }

    // Get questions
    let query = supabase
      .from('clo_analysis_questions')
      .select('*')
      .eq('document_id', documentId)
      .order('question_number', { ascending: true })

    if (questionIds && questionIds.length > 0) {
      query = query.in('id', questionIds)
    }

    const { data: questions } = await query

    if (!questions || questions.length === 0) {
      return { success: false, error: 'No questions found' }
    }

    // Create new question template
    const { data: template, error: templateError } = await supabase
      .from('question_templates')
      .insert({
        user_id: user.id,
        name: templateName,
        description: templateDescription || null,
        status: 'active',
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating template:', templateError)
      return { success: false, error: 'Failed to create template' }
    }

    // Convert analysis questions to template questions
    const templateQuestions = questions.map((q, index) => ({
      template_id: template.id,
      text: q.question_text,
      type: 'text', // Default to text type
      required: false,
      order_index: index,
    }))

    const { error: questionsError } = await supabase
      .from('template_questions')
      .insert(templateQuestions)

    if (questionsError) {
      console.error('Error creating template questions:', questionsError)
      // Rollback template creation
      await supabase.from('question_templates').delete().eq('id', template.id)
      return { success: false, error: 'Failed to create template questions' }
    }

    revalidatePath('/teacher/questions')
    revalidatePath(`/teacher/clo-mapping/${document.clo_set_id}/analytics`)
    return {
      success: true,
      data: {
        templateId: template.id,
        questionCount: questions.length,
      },
    }
  } catch (error) {
    console.error('Error saving questions to template:', error)
    return { success: false, error: 'Failed to save questions' }
  }
}
