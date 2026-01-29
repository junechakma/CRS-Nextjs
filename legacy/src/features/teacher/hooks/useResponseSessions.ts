import { useState, useEffect } from 'react'
import { TeacherService, type ResponseSession, type CreateSessionData } from '../services/teacherService'

export const useResponseSessions = (teacherId?: string) => {
  const [sessions, setSessions] = useState<ResponseSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = async () => {
    if (!teacherId) return

    try {
      setLoading(true)
      setError(null)
      const data = await TeacherService.getResponseSessions(teacherId)
      setSessions(data)
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (sessionData: CreateSessionData) => {
    if (!teacherId) return { success: false, error: 'Teacher ID is required' }

    try {
      const result = await TeacherService.createResponseSession(teacherId, sessionData)
      if (result.success) {
        await loadSessions() // Refresh the list
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create session'
      return { success: false, error }
    }
  }

  const updateSessionStatus = async (sessionId: string, status: ResponseSession['status']) => {
    try {
      const result = await TeacherService.updateSessionStatus(sessionId, status)
      if (result.success) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId ? { ...session, status } : session
        ))
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update session status'
      return { success: false, error }
    }
  }

  const getSessionAnalytics = async (sessionId: string) => {
    try {
      return await TeacherService.getSessionAnalytics(sessionId)
    } catch (err) {
      console.error('Error loading session analytics:', err)
      return {
        totalResponses: 0,
        averageRating: 0,
        categoryRatings: {},
        responseDistribution: {},
        completionRate: 0
      }
    }
  }

  useEffect(() => {
    loadSessions()
  }, [teacherId])

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSessionStatus,
    getSessionAnalytics,
    refresh: loadSessions
  }
}