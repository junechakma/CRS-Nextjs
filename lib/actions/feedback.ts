"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSessionByAccessCode(accessCode: string) {
  try {
    const supabase = await createClient()

    // Query session with course and template data
    const { data: session, error } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        access_code,
        status,
        scheduled_date,
        start_time,
        end_time,
        expected_students,
        courses (
          id,
          name,
          code,
          expected_students
        ),
        users (
          name
        )
      `)
      .eq("access_code", accessCode.toUpperCase())
      .single()

    if (error || !session) {
      console.error("Error fetching session:", error)
      return { success: false, error: "Session not found" }
    }

    // Only allow live sessions for feedback
    if (session.status !== "live") {
      return {
        success: false,
        error: session.status === "completed" ? "expired" : "not_started"
      }
    }

    // Fetch session questions
    const { data: questions, error: questionsError } = await supabase
      .from("session_questions")
      .select("*")
      .eq("session_id", session.id)
      .order("order_index", { ascending: true })

    if (questionsError) {
      console.error("Error fetching questions:", questionsError)
      return { success: false, error: "Failed to load questions" }
    }

    // Transform data to match frontend expectations
    const sessionData = {
      id: session.id,
      name: session.name,
      course: (session.courses as any)?.name || "Unknown Course",
      courseCode: (session.courses as any)?.code || "",
      teacherName: (session.users as any)?.name || "Instructor",
      status: "active" as const,
      questions: (questions || []).map((q: any) => ({
        id: q.id,
        text: q.text,
        type: q.type,
        required: q.required,
        scale: q.scale,
        options: q.options,
        min: q.min_value,
        max: q.max_value,
      })),
    }

    return { success: true, data: sessionData }
  } catch (error) {
    console.error("Error in getSessionByAccessCode:", error)
    return { success: false, error: "Failed to fetch session" }
  }
}

export async function submitSessionResponse({
  sessionId,
  responses,
}: {
  sessionId: string
  responses: Array<{
    questionId: string
    value: number | string | boolean | null
  }>
}) {
  try {
    const supabase = await createClient()

    // Generate anonymous identifier (you could use browser fingerprint or random ID)
    const anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Calculate completion time (you could track this in the frontend)
    const completionTimeSeconds = 0 // Placeholder - could be tracked in frontend

    // Fetch question types to properly map answers
    const questionIds = responses.map((r) => r.questionId)
    const { data: questions, error: questionsError } = await supabase
      .from("session_questions")
      .select("id, type")
      .in("id", questionIds)

    if (questionsError) {
      console.error("Error fetching questions:", questionsError)
      return { success: false, error: "Failed to fetch question types" }
    }

    const questionTypeMap = new Map(questions?.map((q) => [q.id, q.type]) || [])

    // Create a response record
    const { data: responseRecord, error: responseError } = await supabase
      .from("session_responses")
      .insert({
        session_id: sessionId,
        anonymous_id: anonymousId,
        completion_time_seconds: completionTimeSeconds,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (responseError) {
      console.error("Error creating response:", responseError)
      return { success: false, error: "Failed to submit response" }
    }

    // Insert individual answers with correct column names based on question type
    const answers = responses
      .filter((r) => r.value !== null && r.value !== "")
      .map((r) => {
        const answer: any = {
          response_id: responseRecord.id,
          question_id: r.questionId,
        }

        const questionType = questionTypeMap.get(r.questionId)

        // Map to correct column based on question type
        if (questionType === "rating") {
          answer.answer_rating = r.value
        } else if (questionType === "numeric") {
          answer.answer_numeric = r.value
        } else if (questionType === "boolean") {
          answer.answer_boolean = r.value
        } else if (questionType === "multiple") {
          answer.answer_choice = r.value
        } else if (questionType === "text") {
          answer.answer_text = r.value
        } else {
          // Fallback based on value type
          if (typeof r.value === "string") {
            answer.answer_text = r.value
          } else if (typeof r.value === "number") {
            answer.answer_rating = r.value
            answer.answer_numeric = r.value
          } else if (typeof r.value === "boolean") {
            answer.answer_boolean = r.value
          }
        }

        return answer
      })

    if (answers.length > 0) {
      const { error: answersError } = await supabase
        .from("response_answers")
        .insert(answers)

      if (answersError) {
        console.error("Error inserting answers:", answersError)
        return { success: false, error: "Failed to save answers" }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in submitSessionResponse:", error)
    return { success: false, error: "Failed to submit response" }
  }
}
