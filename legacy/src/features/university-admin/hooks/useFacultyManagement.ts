import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Faculty, type CreateFacultyData } from '../services/universityAdminService'

export const useFacultyManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadFaculties = useCallback(async () => {
    if (!user?.university_id) {
      setError('University ID not found')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const facultiesData = await UniversityAdminService.getFaculties(user.university_id)
      setFaculties(facultiesData)
    } catch (err) {
      console.error('Error loading faculties:', err)
      setError(err instanceof Error ? err.message : 'Failed to load faculties')
    } finally {
      setLoading(false)
    }
  }, [user?.university_id])

  const createFaculty = async (facultyData: CreateFacultyData) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.createFacultyWithAdmin(user.id, facultyData)
    
    if (result.success) {
      await loadFaculties() // Reload the list
    }
    
    return result
  }

  const updateFaculty = async (facultyId: string, updates: Partial<Faculty>) => {
    const result = await UniversityAdminService.updateFaculty(facultyId, updates)
    await loadFaculties() // Reload the list
    return result
  }

  const deleteFaculty = async (facultyId: string) => {
    await UniversityAdminService.deleteFaculty(facultyId)
    await loadFaculties() // Reload the list
  }

  useEffect(() => {
    loadFaculties()
  }, [loadFaculties])

  return {
    faculties,
    loading,
    error,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    refetch: loadFaculties
  }
}