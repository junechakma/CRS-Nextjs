import { useState, useEffect } from 'react'
import { TeacherService, type Course, type CreateCourseData } from '../services/teacherService'

export const useCourses = (teacherId?: string) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = async () => {
    if (!teacherId) return

    try {
      setLoading(true)
      setError(null)
      const data = await TeacherService.getCourses(teacherId)
      setCourses(data)
    } catch (err) {
      console.error('Error loading courses:', err)
      setError(err instanceof Error ? err.message : 'Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const createCourse = async (courseData: CreateCourseData) => {
    if (!teacherId) return { success: false, error: 'Teacher ID is required' }

    try {
      const result = await TeacherService.createCourse(teacherId, courseData)
      if (result.success) {
        await loadCourses() // Refresh the list
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create course'
      return { success: false, error }
    }
  }

  const updateCourse = async (courseId: string, updates: Partial<Course>) => {
    try {
      const result = await TeacherService.updateCourse(courseId, updates)
      if (result.success) {
        setCourses(prev => prev.map(course => 
          course.id === courseId ? { ...course, ...updates } : course
        ))
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update course'
      return { success: false, error }
    }
  }

  const deleteCourse = async (courseId: string) => {
    try {
      const result = await TeacherService.deleteCourse(courseId)
      if (result.success) {
        setCourses(prev => prev.filter(course => course.id !== courseId))
      }
      return result
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete course'
      return { success: false, error }
    }
  }

  useEffect(() => {
    loadCourses()
  }, [teacherId])

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refresh: loadCourses
  }
}