import { useState, useEffect } from 'react'
import { TeacherService, type TeacherDashboardStats } from '../services/teacherService'

export const useTeacherStats = (teacherId?: string) => {
  const [stats, setStats] = useState<TeacherDashboardStats>({
    totalCourses: 0,
    totalSessions: 0,
    totalResponses: 0,
    activeSessions: 0,
    averageRating: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    if (!teacherId) return

    try {
      setLoading(true)
      setError(null)
      const data = await TeacherService.getDashboardStats(teacherId)
      setStats(data)
    } catch (err) {
      console.error('Error loading teacher stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [teacherId])

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  }
}