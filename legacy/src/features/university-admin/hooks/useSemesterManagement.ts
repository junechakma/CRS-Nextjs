import { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Semester, type CreateSemesterData } from '../services/universityAdminService'

export const useSemesterManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSemesters = useCallback(async () => {
    console.log('🔍 loadSemesters called with user:', user)
    
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
      console.log('📡 Fetching semesters for university:', user.university_id)
      
      const semestersData = await UniversityAdminService.getSemesters(user.university_id)
      
      console.log('📊 Semesters fetched:', semestersData)
      console.log('📈 Number of semesters:', semestersData.length)
      
      setSemesters(semestersData)
    } catch (err) {
      console.error('❌ Error loading semesters:', err)
      setError(err instanceof Error ? err.message : 'Failed to load semesters')
    } finally {
      setLoading(false)
    }
  }, [user?.university_id])

  const createSemester = async (semesterData: CreateSemesterData) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.createSemester(user.id, semesterData)
    
    if (result.success) {
      await loadSemesters() // Reload the list
    }
    
    return result
  }

  const updateSemester = async (semesterId: string, updates: Partial<Semester>) => {
    const result = await UniversityAdminService.updateSemester(semesterId, updates)
    await loadSemesters() // Reload the list
    return result
  }

  const setCurrentSemester = async (semesterId: string) => {
    if (!user?.id) {
      throw new Error('User ID not found')
    }

    const result = await UniversityAdminService.setCurrentSemester(user.id, semesterId)
    
    if (result.success) {
      await loadSemesters() // Reload the list
    }
    
    return result
  }

  const deleteSemester = async (semesterId: string) => {
    await UniversityAdminService.deleteSemester(semesterId)
    await loadSemesters() // Reload the list
  }

  useEffect(() => {
    loadSemesters()
  }, [loadSemesters])

  return {
    semesters,
    loading,
    error,
    createSemester,
    updateSemester,
    setCurrentSemester,
    deleteSemester,
    refetch: loadSemesters
  }
}