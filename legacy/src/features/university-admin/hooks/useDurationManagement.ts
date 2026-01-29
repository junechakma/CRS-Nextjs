import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../store/store'
import { UniversityAdminService, type Duration, type CreateDurationData } from '../services/universityAdminService'

export const useDurationManagement = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [durations, setDurations] = useState<Duration[]>([])
  const [loading, setLoading] = useState(true)

  const loadDurations = async () => {
    if (!user?.university_id) return

    try {
      setLoading(true)
      const durationsData = await UniversityAdminService.getDurations(user.university_id)
      setDurations(durationsData)
    } catch (error) {
      console.error('Error loading durations:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDurations()
  }, [user?.university_id])

  const createDuration = async (data: CreateDurationData) => {
    if (!user?.university_id) {
      return { success: false, error: 'University ID not found' }
    }

    try {
      const result = await UniversityAdminService.createDuration(user.university_id, data, user.id)
      if (result.success) {
        await loadDurations()
      }
      return result
    } catch (error) {
      console.error('Error creating duration:', error)
      return { success: false, error: 'Failed to create duration' }
    }
  }

  const updateDuration = async (durationId: string, data: CreateDurationData) => {
    try {
      const result = await UniversityAdminService.updateDuration(durationId, data)
      if (result.success) {
        await loadDurations()
      }
      return result
    } catch (error) {
      console.error('Error updating duration:', error)
      return { success: false, error: 'Failed to update duration' }
    }
  }

  const deleteDuration = async (durationId: string) => {
    try {
      const result = await UniversityAdminService.deleteDuration(durationId)
      if (result.success) {
        await loadDurations()
      }
      return result
    } catch (error) {
      console.error('Error deleting duration:', error)
      return { success: false, error: 'Failed to delete duration' }
    }
  }

  return {
    durations,
    loading,
    createDuration,
    updateDuration,
    deleteDuration,
    refetch: loadDurations
  }
}