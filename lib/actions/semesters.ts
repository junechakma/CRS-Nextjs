"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  createSemester,
  updateSemester,
  deleteSemester,
  getTeacherSemestersPaginated,
  CreateSemesterInput,
  UpdateSemesterInput,
} from "@/lib/supabase/queries/teacher"

export async function getSemestersPaginatedAction({
  page = 1,
  pageSize = 12,
  search = '',
  status = 'all',
}: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
}) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated", data: [], count: 0, totalPages: 0 }
    }

    const result = await getTeacherSemestersPaginated({
      userId: user.id,
      page,
      pageSize,
      search,
      status,
    })

    return { success: true, ...result }
  } catch (error) {
    console.error("Error in getSemestersPaginatedAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch semesters",
      data: [],
      count: 0,
      totalPages: 0,
    }
  }
}

export async function createSemesterAction(input: CreateSemesterInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const semester = await createSemester(user.id, input)

    revalidatePath("/teacher/semesters")

    return { success: true, data: semester }
  } catch (error) {
    console.error("Error in createSemesterAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create semester"
    }
  }
}

export async function updateSemesterAction(input: UpdateSemesterInput) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const semester = await updateSemester(user.id, input)

    revalidatePath("/teacher/semesters")

    return { success: true, data: semester }
  } catch (error) {
    console.error("Error in updateSemesterAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update semester"
    }
  }
}

export async function deleteSemesterAction(semesterId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await deleteSemester(user.id, semesterId)

    revalidatePath("/teacher/semesters")

    return { success: true }
  } catch (error) {
    console.error("Error in deleteSemesterAction:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete semester"
    }
  }
}
