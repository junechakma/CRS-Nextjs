import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Department, type CreateDepartmentData } from '../services/universityAdminService'

export const useDepartmentManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDepartments = useCallback(async () => {
    if (!user?.university_id) {
      setError('University ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const departmentsData = await UniversityAdminService.getDepartments(user.university_id)
      setDepartments(departmentsData)
    } catch (err) {
      console.error('Error loading departments:', err)
      setError(err instanceof Error ? err.message : 'Failed to load departments')
    } finally {
      setLoading(false)
    }
  }, [user?.university_id])

  const createDepartment = async (departmentData: CreateDepartmentData) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.createDepartmentWithModerator(user.id, departmentData)
    
    if (result.success) {
      await loadDepartments() // Reload the list
    }
    
    return result
  }

  const updateDepartment = async (departmentId: string, updates: Partial<Department>) => {
    const result = await UniversityAdminService.updateDepartment(departmentId, updates)
    await loadDepartments() // Reload the list
    return result
  }

  const deleteDepartment = async (departmentId: string) => {
    await UniversityAdminService.deleteDepartment(departmentId)
    await loadDepartments() // Reload the list
  }

  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  return {
    departments,
    loading,
    error,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: loadDepartments
  }
}