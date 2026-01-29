import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type DashboardStats } from '../services/universityAdminService'

export const useUniversityAdminStats = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculties: 0,
    totalDepartments: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalResponses: 0,
    totalSemesters: 0,
    currentSemester: 'Not Set'
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    if (!user?.university_id) {
      setError('University ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const dashboardStats = await UniversityAdminService.getDashboardStats(user.university_id)
      setStats(dashboardStats)
    } catch (err) {
      console.error('Error loading university admin stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [user?.university_id])

  return {
    stats,
    loading,
    error,
    refetch: loadStats
  }
}