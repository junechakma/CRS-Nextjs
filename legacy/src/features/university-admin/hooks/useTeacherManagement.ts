import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Teacher, type CreateTeacherData } from '../services/universityAdminService'

export const useTeacherManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTeachers = useCallback(async () => {
    console.log('🔍 loadTeachers called with user:', user)
    
    if (!user?.university_id) {
      console.log('❌ No university_id found for user')
      setError('University ID not found')
      setLoading(false)
      return
    }

    console.log('✅ University ID found:', user.university_id)

    try {
      setLoading(true)
      setError(null)
      console.log('📡 Fetching teachers for university:', user.university_id)
      
      const teachersData = await UniversityAdminService.getTeachers(user.university_id)
      
      console.log('📊 Teachers fetched:', teachersData)
      console.log('📈 Number of teachers:', teachersData.length)
      
      setTeachers(teachersData)
    } catch (err) {
      console.error('❌ Error loading teachers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load teachers')
    } finally {
      setLoading(false)
    }
  }, [user?.university_id])

  const createTeacher = async (teacherData: CreateTeacherData) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.createTeacher(user.id, teacherData)
    
    if (result.success) {
      await loadTeachers() // Reload the list
    }
    
    return result
  }

  const updateTeacher = async (teacherId: string, updates: Partial<Teacher>) => {
    const result = await UniversityAdminService.updateTeacher(teacherId, updates)
    await loadTeachers() // Reload the list
    return result
  }

  const updateTeacherStatus = async (teacherId: string, status: 'active' | 'blocked') => {
    const result = await UniversityAdminService.updateTeacherStatus(teacherId, status)
    await loadTeachers() // Reload the list
    return result
  }

  const deleteTeacher = async (teacherId: string) => {
    await UniversityAdminService.deleteTeacher(teacherId)
    await loadTeachers() // Reload the list
  }

  const bulkUploadTeachers = async (csvFile: File) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.bulkUploadTeachers(user.id, csvFile)
    
    if (result.success) {
      await loadTeachers() // Reload the list
    }
    
    return result
  }

  useEffect(() => {
    loadTeachers()
  }, [loadTeachers])

  return {
    teachers,
    loading,
    error,
    createTeacher,
    updateTeacher,
    updateTeacherStatus,
    deleteTeacher,
    bulkUploadTeachers,
    refetch: loadTeachers
  }
}