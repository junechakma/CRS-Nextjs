"use server"

import { revalidatePath } from "next/cache"
import { getTeacherSessionsPaginated } from "@/lib/supabase/queries/teacher"
import { createClient } from "@/lib/supabase/server"

export interface CreateSessionInput {
  courseId: string
  name: string
  accessCode?: string
  description?: string
  scheduledDate?: string
  startTime?: string
  endTime?: string
  durationMinutes?: number
  expectedStudents?: number
  status?: "scheduled" | "live" | "completed"
  templateId?: string
}

export interface UpdateSessionInput {
  id: string
  name?: string
  description?: string
  scheduledDate?: string
  startTime?: string
  endTime?: string
  durationMinutes?: number
  expectedStudents?: number
  status?: "scheduled" | "live" | "completed"
}

export async function getSessionsPaginatedAction({
  page = 1,
  pageSize = 12,
  search = "",
  status = "all",
  courseId = "",
}: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  courseId?: string
}) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const result = await getTeacherSessionsPaginated({
      userId: user.id,
      page,
      pageSize,
      search,
      status,
      courseId,
    })

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching paginated sessions:", error)
    return { success: false, error: "Failed to fetch sessions" }
  }
}

export async function createSessionAction(input: CreateSessionInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Calculate start_time and end_time based on duration if not provided
    let startTime = input.startTime
    let endTime = input.endTime
    let scheduledDate = input.scheduledDate

    // If duration is provided and times are not, calculate them (for "Start Now" sessions)
    if (input.durationMinutes && !input.startTime && !input.endTime) {
      const now = new Date()
      startTime = now.toISOString()
      const end = new Date(now.getTime() + input.durationMinutes * 60000)
      endTime = end.toISOString()
      scheduledDate = now.toISOString().split('T')[0]
    }

    // Insert the session
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        course_id: input.courseId,
        name: input.name,
        access_code: input.accessCode,
        description: input.description || null,
        scheduled_date: scheduledDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        duration_minutes: input.durationMinutes || null,
        expected_students: input.expectedStudents || null,
        status: input.status || "scheduled",
        template_id: input.templateId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating session:", error)
      return { success: false, error: error.message }
    }

    // Copy questions from template to session if template is provided
    if (input.templateId) {
      const { data: templateQuestions, error: questionsError } = await supabase
        .from("template_questions")
        .select("*")
        .eq("template_id", input.templateId)
        .order("order_index", { ascending: true })

      if (questionsError) {
        console.error("Error fetching template questions:", questionsError)
      } else if (templateQuestions && templateQuestions.length > 0) {
        // Map template questions to session questions
        const sessionQuestions = templateQuestions.map((q: any) => ({
          session_id: session.id,
          original_question_id: q.id,
          text: q.text,
          type: q.type,
          required: q.required,
          scale: q.scale,
          min_value: q.min_value,
          max_value: q.max_value,
          options: q.options,
          order_index: q.order_index,
        }))

        const { error: insertQuestionsError } = await supabase
          .from("session_questions")
          .insert(sessionQuestions)

        if (insertQuestionsError) {
          console.error("Error copying questions to session:", insertQuestionsError)
          // Continue anyway - session is created but without questions
        }
      }
    }

    revalidatePath("/teacher/sessions")
    return { success: true, data: session }
  } catch (error) {
    console.error("Error creating session:", error)
    return { success: false, error: "Failed to create session" }
  }
}

export async function updateSessionAction(input: UpdateSessionInput) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const updateData: Record<string, any> = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.description !== undefined) updateData.description = input.description || null
    if (input.scheduledDate !== undefined) updateData.scheduled_date = input.scheduledDate || null
    if (input.startTime !== undefined) updateData.start_time = input.startTime || null
    if (input.endTime !== undefined) updateData.end_time = input.endTime || null
    if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes || null
    if (input.expectedStudents !== undefined) updateData.expected_students = input.expectedStudents || null
    if (input.status !== undefined) updateData.status = input.status

    const { data, error } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", input.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating session:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/sessions")
    return { success: true, data }
  } catch (error) {
    console.error("Error updating session:", error)
    return { success: false, error: "Failed to update session" }
  }
}

export async function deleteSessionAction(sessionId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting session:", error)
      return { success: false, error: error.message }
    }

    revalidatePath("/teacher/sessions")
    return { success: true }
  } catch (error) {
    console.error("Error deleting session:", error)
    return { success: false, error: "Failed to delete session" }
  }
}
