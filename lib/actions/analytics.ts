"use server"

import { createClient } from "@/lib/supabase/server"

export interface SessionAnalytics {
  session: {
    id: string
    name: string
    description: string | null
    course_name: string
    course_code: string
    scheduled_date: string | null
    start_time: string | null
    end_time: string | null
    status: string
    response_count: number
    expected_students: number
    avg_rating: number
  }
  questions: Array<{
    id: string
    text: string
    type: string
    required: boolean
    scale: number | null
    options: any
    min_value: number | null
    max_value: number | null
    order_index: number
    responses: Array<{
      answer_text: string | null
      answer_rating: number | null
      answer_numeric: number | null
      answer_boolean: boolean | null
      answer_choice: string | null
    }>
  }>
}

export async function getSessionAnalytics(sessionId: string) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Fetch session with course info
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select(`
        id,
        name,
        description,
        scheduled_date,
        start_time,
        end_time,
        status,
        response_count,
        expected_students,
        avg_rating,
        courses (
          name,
          code,
          expected_students
        )
      `)
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      return { success: false, error: "Session not found" }
    }

    // Fetch session questions
    const { data: questions, error: questionsError } = await supabase
      .from("session_questions")
      .select("*")
      .eq("session_id", sessionId)
      .order("order_index", { ascending: true })

    if (questionsError) {
      return { success: false, error: "Failed to fetch questions" }
    }

    // Fetch all responses for this session
    const { data: sessionResponses, error: responsesError } = await supabase
      .from("session_responses")
      .select("id")
      .eq("session_id", sessionId)

    if (responsesError) {
      return { success: false, error: "Failed to fetch responses" }
    }

    const responseIds = sessionResponses.map((r) => r.id)

    // Fetch all answers
    let allAnswers: any[] = []
    if (responseIds.length > 0) {
      const { data: answers, error: answersError } = await supabase
        .from("response_answers")
        .select("*")
        .in("response_id", responseIds)

      if (!answersError) {
        allAnswers = answers || []
      }
    }

    // Group answers by question
    const questionsWithResponses = (questions || []).map((q) => {
      const questionAnswers = allAnswers.filter((a) => a.question_id === q.id)

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        required: q.required,
        scale: q.scale,
        options: q.options,
        min_value: q.min_value,
        max_value: q.max_value,
        order_index: q.order_index,
        responses: questionAnswers.map((a) => ({
          answer_text: a.answer_text,
          answer_rating: a.answer_rating,
          answer_numeric: a.answer_numeric,
          answer_boolean: a.answer_boolean,
          answer_choice: a.answer_choice,
        })),
      }
    })

    const analytics: SessionAnalytics = {
      session: {
        id: session.id,
        name: session.name,
        description: session.description,
        course_name: (session.courses as any)?.name || "Unknown Course",
        course_code: (session.courses as any)?.code || "",
        scheduled_date: session.scheduled_date,
        start_time: session.start_time,
        end_time: session.end_time,
        status: session.status,
        response_count: session.response_count || 0,
        expected_students: session.expected_students || (session.courses as any)?.expected_students || 0,
        avg_rating: session.avg_rating || 0,
      },
      questions: questionsWithResponses,
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error("Error fetching session analytics:", error)
    return { success: false, error: "Failed to fetch analytics" }
  }
}

export interface AIInsight {
  summary: string
  strengths: string[]
  areasForImprovement: string[]
  anomalies: string[]
  recommendations: string[]
  categoryInsights: {
    category: string
    analysis: string
  }[]
}

export async function generateAIInsights(sessionId: string) {
  try {
    const analyticsResult = await getSessionAnalytics(sessionId)

    if (!analyticsResult.success || !analyticsResult.data) {
      return { success: false, error: analyticsResult.error }
    }

    const analytics = analyticsResult.data

    // Build the prompt for Gemini
    const prompt = buildAnalysisPrompt(analytics)

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return {
        success: false,
        error: "AI service not configured. Please add GEMINI_API_KEY to environment variables.",
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      console.error("Gemini API error:", await response.text())
      return { success: false, error: "Failed to generate AI insights" }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return { success: false, error: "No response from AI" }
    }

    const insights = parseAIResponse(text)
    return { success: true, data: insights }
  } catch (error) {
    console.error("Error generating AI insights:", error)
    return { success: false, error: "Failed to generate AI insights" }
  }
}

function buildAnalysisPrompt(analytics: SessionAnalytics): string {
  const { session, questions } = analytics

  // Format questions data
  const questionsData = questions
    .map((q, idx) => {
      let questionSummary = `
Question ${idx + 1}: ${q.text}
- Type: ${q.type}
- Total Responses: ${q.responses.length}`

      if (q.type === "rating" && q.responses.length > 0) {
        const ratings = q.responses
          .map((r) => r.answer_rating)
          .filter((r): r is number => r !== null)
        const avgRating = ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0

        const distribution: Record<number, number> = {}
        ratings.forEach((r) => {
          distribution[r] = (distribution[r] || 0) + 1
        })

        questionSummary += `
- Average Rating: ${avgRating.toFixed(2)}/${q.scale || 5}
- Distribution: ${JSON.stringify(distribution)}`
      } else if (q.type === "boolean" && q.responses.length > 0) {
        const yesCount = q.responses.filter((r) => r.answer_boolean === true).length
        const noCount = q.responses.filter((r) => r.answer_boolean === false).length
        questionSummary += `
- Yes: ${yesCount}, No: ${noCount}`
      } else if (q.type === "text" && q.responses.length > 0) {
        const textResponses = q.responses
          .map((r) => r.answer_text)
          .filter((t): t is string => t !== null)
        questionSummary += `
- Sample Responses: ${textResponses.slice(0, 5).join("; ")}`
      } else if (q.type === "multiple" && q.responses.length > 0) {
        // Check both answer_choice (new) and answer_text (old) for multiple choice
        const choices = q.responses
          .map((r) => r.answer_choice || r.answer_text)
          .filter((c): c is string => c !== null)
        const distribution: Record<string, number> = {}
        choices.forEach((c) => {
          distribution[c] = (distribution[c] || 0) + 1
        })
        questionSummary += `
- Distribution: ${JSON.stringify(distribution)}`
      } else if (q.type === "numeric" && q.responses.length > 0) {
        const numbers = q.responses
          .map((r) => r.answer_numeric)
          .filter((n): n is number => n !== null)
        const avg = numbers.length > 0
          ? numbers.reduce((a, b) => a + b, 0) / numbers.length
          : 0
        questionSummary += `
- Average: ${avg.toFixed(2)}`
      }

      return questionSummary
    })
    .join("\n")

  const responseRate = session.expected_students > 0
    ? ((session.response_count / session.expected_students) * 100).toFixed(1)
    : 0

  return `You are an educational analytics expert analyzing student feedback from a class session.

SESSION INFORMATION:
Course: ${session.course_code} - ${session.course_name}
Session: ${session.name}
Date: ${session.scheduled_date || "Not specified"}
Total Responses: ${session.response_count}
Response Rate: ${responseRate}%
Average Rating: ${session.avg_rating.toFixed(2)}/5

QUESTIONS AND RESPONSES:
${questionsData}

Please analyze this data and provide insights in the following JSON format:
{
  "summary": "One concise sentence summarizing the session",
  "strengths": ["strength 1", "strength 2"],
  "areasForImprovement": ["area 1", "area 2"],
  "anomalies": ["anomaly 1 if any"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "categoryInsights": [
    {
      "category": "category_name",
      "analysis": "Brief 1-2 sentence analysis"
    }
  ]
}

IMPORTANT INSTRUCTIONS:
1. Keep "summary" to ONE sentence (max 20 words)
2. Limit "strengths" to TOP 2 most significant points (each max 10 words)
3. Limit "areasForImprovement" to TOP 2 most critical areas (each max 10 words)
4. Only include "anomalies" if truly unusual patterns exist
5. Provide TOP 2 actionable "recommendations" (each max 15 words)
6. Keep "categoryInsights" analysis brief (1-2 sentences max per category)
7. Be concise and direct - avoid filler words

Return ONLY valid JSON, no additional text or markdown formatting.`
}

function parseAIResponse(responseText: string): AIInsight {
  try {
    let cleanText = responseText.trim()
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.replace(/```json\n?/, "").replace(/\n?```$/, "")
    } else if (cleanText.startsWith("```")) {
      cleanText = cleanText.replace(/```\n?/, "").replace(/\n?```$/, "")
    }

    const parsed = JSON.parse(cleanText)

    return {
      summary: parsed.summary || "No summary available",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      areasForImprovement: Array.isArray(parsed.areasForImprovement)
        ? parsed.areasForImprovement
        : [],
      anomalies: Array.isArray(parsed.anomalies)
        ? parsed.anomalies.filter((a: string) => a && a.length > 0)
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      categoryInsights: Array.isArray(parsed.categoryInsights)
        ? parsed.categoryInsights
        : [],
    }
  } catch (error) {
    console.error("Error parsing AI response:", error)
    return {
      summary: "Unable to generate detailed insights at this time.",
      strengths: [],
      areasForImprovement: [],
      anomalies: [],
      recommendations: ["Please try analyzing the session again."],
      categoryInsights: [],
    }
  }
}
