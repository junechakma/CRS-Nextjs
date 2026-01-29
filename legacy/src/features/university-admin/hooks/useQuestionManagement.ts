import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Question, type QuestionTemplate } from '../services/universityAdminService'

export const useQuestionManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [questions, setQuestions] = useState<Question[]>([])
  const [templates, setTemplates] = useState<QuestionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadQuestions = useCallback(async () => {
    if (!user?.university_id) {
      setError('University ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const questionsData = await UniversityAdminService.getQuestions(user.university_id)
      setQuestions(questionsData)
    } catch (err) {
      console.error('Error loading questions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [user?.university_id])

  const loadTemplates = useCallback(async () => {
    if (!user?.university_id) {
      setError('University ID not found')
      return
    }

    try {
      const templatesData = await UniversityAdminService.getQuestionTemplates(user.university_id)
      setTemplates(templatesData)
    } catch (err) {
      console.error('Error loading templates:', err)
      setError(err instanceof Error ? err.message : 'Failed to load templates')
    }
  }, [user?.university_id])

  const loadData = useCallback(async () => {
    await Promise.all([loadQuestions(), loadTemplates()])
  }, [loadQuestions, loadTemplates])

  const createQuestion = async (questionData: Omit<Question, 'id' | 'created_at'>) => {
    if (!user?.university_id) {
      throw new Error('University ID not found')
    }

    const result = await UniversityAdminService.createQuestion(user.university_id, questionData)
    await loadQuestions() // Reload the list
    return result
  }

  const updateQuestion = async (questionId: string, updates: Partial<Question>) => {
    const result = await UniversityAdminService.updateQuestion(questionId, updates)
    await loadQuestions() // Reload the list
    return result
  }

  const deleteQuestion = async (questionId: string) => {
    await UniversityAdminService.deleteQuestion(questionId)
    await loadQuestions() // Reload the list
  }

  const createTemplate = async (templateData: Omit<QuestionTemplate, 'id' | 'created_at' | 'questions' | 'usage_count'> & { selected_questions: string[] }) => {
    if (!user?.university_id) {
      throw new Error('University ID not found')
    }

    const { selected_questions, ...rest } = templateData
    const templatePayload = {
      ...rest,
      questions: selected_questions || []
    }
    const result = await UniversityAdminService.createQuestionTemplate(user.university_id, templatePayload)
    await loadTemplates() // Reload the list
    return result
  }

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    questions,
    templates,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    createTemplate,
    refetch: loadData,
    refetchQuestions: loadQuestions,
    refetchTemplates: loadTemplates
  }
}