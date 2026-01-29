import { useState, useEffect } from 'react'
import { SuperAdminService, type DashboardStats } from '../services/superAdminService'

export function useSuperAdminStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUniversities: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    totalResponses: 0,
    totalSessions: 0,
    totalFaculties: 0,
    totalDepartments: 0,
    totalTeachers: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SuperAdminService.getDashboardStats()
      setStats(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load stats')
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refresh: loadStats
  }
}