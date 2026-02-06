"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getTeacherCoursesPaginated } from "@/lib/supabase/queries/teacher"

export async function getCoursesPaginatedAction({
  page = 1,
  pageSize = 12,
  search = '',
  status = 'all',
  semesterId = '',
}: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  semesterId?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated", data: [], count: 0, totalPages: 0 }
    }

    const result = await getTeacherCoursesPaginated({
      userId: user.id,
      page,
      pageSize,
      search,
      status,
      semesterId,
    })

    return { success: true, ...result }
  } catch (error) {
    console.error("Error in getCoursesPaginatedAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch courses",
      data: [],
      count: 0,
      totalPages: 0,
    }
  }
}

export async function createCourseAction(input: {
  name: string
  code: string
  description?: string
  semesterId?: string
  color: string
  expectedStudents?: number
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        name: input.name,
        code: input.code,
        description: input.description || null,
        semester_id: input.semesterId || null,
        color: input.color,
        expected_students: input.expectedStudents || null,
        status: 'active',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating course:', error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/courses")

    return { success: true, data }
  } catch (error) {
    console.error("Error in createCourseAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create course"
    }
  }
}

export async function updateCourseAction(input: {
  id: string
  name?: string
  code?: string
  description?: string
  semesterId?: string
  color?: string
  expectedStudents?: number
  status?: 'active' | 'archived'
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const updateData: Record<string, unknown> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.code !== undefined) updateData.code = input.code
    if (input.description !== undefined) updateData.description = input.description
    if (input.semesterId !== undefined) updateData.semester_id = input.semesterId || null
    if (input.color !== undefined) updateData.color = input.color
    if (input.expectedStudents !== undefined) updateData.expected_students = input.expectedStudents || null
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from('courses')
      .update(updateData)
      .eq('id', input.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating course:', error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/courses")

    return { success: true, data }
  } catch (error) {
    console.error("Error in updateCourseAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update course"
    }
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting course:', error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/courses")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteCourseAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete course"
    }
  }
}
