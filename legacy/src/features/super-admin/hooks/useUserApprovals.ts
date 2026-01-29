import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SuperAdminService, type PendingUser } from '../services/superAdminService'
import type { RootState } from '../../../store/store'

interface UniversityApprovalData {
  university_name: string
  university_code: string
  university_settings?: any
}

export function useUserApprovals() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPendingUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await SuperAdminService.getPendingUsers()
      setPendingUsers(data)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load pending users')
      console.error('Error loading pending users:', error)
    } finally {
      setLoading(false)
    }
  }

  const approveUser = async (userId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      // This is for non-university admin users (direct approval)
      await SuperAdminService.rejectUser(userId, user.id) // Need to implement direct approval
      await loadPendingUsers() // Refresh the list  
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve user'
      setError(message)
      return { success: false, error: message }
    }
  }

  const approveUniversityAdmin = async (_: string, universityData: UniversityApprovalData) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      const result = await SuperAdminService.approveUniversityAdmin(user.id, universityData as any)
      
      await loadPendingUsers() // Refresh the list
      return { success: true, data: result }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to approve university admin'
      setError(message)
      return { success: false, error: message }
    }
  }

  const rejectUser = async (userId: string) => {
    if (!user?.id) throw new Error('User not authenticated')
    
    try {
      await SuperAdminService.rejectUser(userId, user.id)
      await loadPendingUsers() // Refresh the list
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to reject user'
      setError(message)
      return { success: false, error: message }
    }
  }

  useEffect(() => {
    loadPendingUsers()
  }, [])

  return {
    pendingUsers,
    loading,
    error,
    approveUser,
    approveUniversityAdmin,
    rejectUser,
    refresh: loadPendingUsers
  }
}