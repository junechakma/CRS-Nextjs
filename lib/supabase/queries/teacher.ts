import { createClient } from '../server'
import { PaginatedResult, QuestionTemplate, TemplateQuestion, getTimeAgo } from './types'

// ============================================================================
// TYPES
// ============================================================================

export interface TeacherDashboardData {
  user: {
    id: string
    name: string
    email: string
    institution: string | null
  }
  stats: {
    activeCourses: number
    totalStudents: number
    totalResponses: number
    liveSessions: number
    weeklyResponseChange: number
  }
  liveSessions: Array<{
    id: string
    name: string
    courseName: string
    courseCode: string
    startedAt: string
    startedAgo: string
    responseCount: number
    accessCode: string
  }>
  recentFeedback: Array<{
    id: string
    text: string
    courseCode: string
    sessionName: string
    time: string
    sentiment: 'positive' | 'neutral' | 'negative'
  }>
  courses: Array<{
    id: string
    name: string
    code: string
    color: string
    expectedStudents: number
    totalResponses: number
  }>
}

export interface TeacherAnalyticsData {
  stats: {
    totalResponses: number
    avgRating: number
    avgCompletionTime: number
    totalSessions: number
    liveSessions: number
    scheduledSessions: number
    completedSessions: number
    activeCourses: number
  }
  courseStats: Array<{
    id: string
    name: string
    code: string
    color: string
    status: string
    sessionCount: number
    liveSessionCount: number
    completedSessionCount: number
    totalResponses: number
    avgRating: number
    lastActivity: string | null
    semesterName: string | null
  }>
  recentSessions: Array<{
    id: string
    name: string
    courseName: string
    courseCode: string
    courseColor: string
    status: string
    responseCount: number
    avgRating: number
    avgCompletionTime: number
    completedAt: string | null
  }>
  monthlyTrends: Array<{
    month: string
    responses: number
    avgRating: number
  }>
  sentimentData: {
    positive: number
    neutral: number
    negative: number
    totalAnalyzed: number
  }
}

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

/**
 * Get teacher dashboard stats
 */
export async function getTeacherDashboardStats(userId: string) {
  const supabase = await createClient()

  // Get courses count
  const { count: coursesCount } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'active')

  // Get total students from all courses (using expected_students or responses)
  const { data: courses } = await supabase
    .from('courses')
    .select('expected_students, total_responses')
    .eq('user_id', userId)

  const totalStudents = courses?.reduce((acc, c) => acc + (c.expected_students || 0), 0) || 0

  // Get total responses
  const { count: totalResponses } = await supabase
    .from('session_responses')
    .select('*, sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('sessions.user_id', userId)

  // Get live sessions
  const { count: liveSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'live')

  // Get responses this week for change calculation
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { count: weeklyResponses } = await supabase
    .from('session_responses')
    .select('*, sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('sessions.user_id', userId)
    .gte('submitted_at', weekAgo.toISOString())

  return {
    activeCourses: coursesCount || 0,
    totalStudents: totalStudents,
    totalResponses: totalResponses || 0,
    liveSessions: liveSessions || 0,
    weeklyResponseChange: weeklyResponses || 0,
  }
}

/**
 * Get comprehensive dashboard data for teacher
 */
export async function getTeacherDashboard(userId: string): Promise<TeacherDashboardData> {
  const supabase = await createClient()

  // Get user info
  const { data: userData } = await supabase
    .from('users')
    .select('id, name, email, institution')
    .eq('id', userId)
    .single()

  // Get stats
  const stats = await getTeacherDashboardStats(userId)

  // Get live sessions with details
  const { data: liveSessionsData } = await supabase
    .from('sessions')
    .select(`
      id,
      name,
      access_code,
      response_count,
      start_time,
      courses(name, code)
    `)
    .eq('user_id', userId)
    .eq('status', 'live')
    .order('start_time', { ascending: false })
    .limit(5)

  // Get recent feedback (text responses from recent sessions)
  const { data: recentFeedbackData } = await supabase
    .from('response_answers')
    .select(`
      id,
      answer_text,
      created_at,
      session_questions!inner(
        session_id,
        sessions!inner(
          name,
          user_id,
          courses(code)
        )
      )
    `)
    .not('answer_text', 'is', null)
    .eq('session_questions.sessions.user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get courses
  const { data: coursesData } = await supabase
    .from('courses')
    .select('id, name, code, color, expected_students, total_responses')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_activity_at', { ascending: false })
    .limit(10)

  // Helper to determine sentiment from text (basic heuristics)
  const getSentiment = (text: string): 'positive' | 'neutral' | 'negative' => {
    const lowerText = text.toLowerCase()
    const positiveWords = ['great', 'excellent', 'good', 'helpful', 'love', 'best', 'amazing', 'fantastic', 'wonderful']
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'worst', 'confusing', 'difficult', 'hard', 'boring']

    const hasPositive = positiveWords.some(word => lowerText.includes(word))
    const hasNegative = negativeWords.some(word => lowerText.includes(word))

    if (hasPositive && !hasNegative) return 'positive'
    if (hasNegative && !hasPositive) return 'negative'
    return 'neutral'
  }

  return {
    user: {
      id: userData?.id || userId,
      name: userData?.name || 'Teacher',
      email: userData?.email || '',
      institution: userData?.institution || null,
    },
    stats,
    liveSessions: (liveSessionsData || []).map(s => {
      const course = s.courses as unknown as { name: string; code: string } | null
      return {
        id: s.id,
        name: s.name,
        courseName: course?.name || 'Unknown Course',
        courseCode: course?.code || '',
        startedAt: s.start_time,
        startedAgo: getTimeAgo(s.start_time),
        responseCount: s.response_count || 0,
        accessCode: s.access_code,
      }
    }),
    recentFeedback: (recentFeedbackData || []).map(f => {
      const sessionQuestion = f.session_questions as unknown as { sessions: { name: string; courses: { code: string } } } | null
      return {
        id: f.id,
        text: f.answer_text || '',
        courseCode: sessionQuestion?.sessions?.courses?.code || '',
        sessionName: sessionQuestion?.sessions?.name || '',
        time: getTimeAgo(f.created_at),
        sentiment: getSentiment(f.answer_text || ''),
      }
    }),
    courses: (coursesData || []).map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      color: c.color,
      expectedStudents: c.expected_students || 0,
      totalResponses: c.total_responses || 0,
    })),
  }
}

// ============================================================================
// TEMPLATE QUERIES
// ============================================================================

/**
 * Get paginated question templates for a teacher
 */
export async function getQuestionTemplates({
  userId,
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
  includeBase = true,
}: {
  userId?: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
  includeBase?: boolean
}): Promise<PaginatedResult<QuestionTemplate>> {
  const supabase = await createClient()

  const offset = (page - 1) * pageSize

  // Build query for templates
  let query = supabase
    .from('question_templates')
    .select(`
      *,
      template_questions(*)
    `, { count: 'exact' })

  // Filter by user or include base templates
  if (userId) {
    if (includeBase) {
      query = query.or(`user_id.eq.${userId},is_base.eq.true`)
    } else {
      query = query.eq('user_id', userId)
    }
  } else if (includeBase) {
    query = query.eq('is_base', true)
  }

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply sorting and pagination
  query = query
    .order('is_base', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching templates:', error)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  // Transform data
  const templates: QuestionTemplate[] = (data || []).map(template => ({
    id: template.id,
    user_id: template.user_id,
    name: template.name,
    description: template.description,
    is_base: template.is_base,
    status: template.status,
    usage_count: template.usage_count,
    created_at: template.created_at,
    updated_at: template.updated_at,
    questions: (template.template_questions || []).sort((a: TemplateQuestion, b: TemplateQuestion) =>
      a.order_index - b.order_index
    ),
  }))

  return {
    data: templates,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get template stats for teacher dashboard
 */
export async function getTemplateStats(userId: string) {
  const supabase = await createClient()

  // Get all templates for user (including base)
  const { data: templates, error } = await supabase
    .from('question_templates')
    .select('id, status, usage_count, is_base, template_questions(count)')
    .or(`user_id.eq.${userId},is_base.eq.true`)

  if (error) {
    console.error('Error fetching template stats:', error)
    return {
      totalTemplates: 0,
      activeTemplates: 0,
      totalQuestions: 0,
      totalUsage: 0,
    }
  }

  return {
    totalTemplates: templates?.length || 0,
    activeTemplates: templates?.filter(t => t.status === 'active').length || 0,
    totalQuestions: templates?.reduce((acc, t) => acc + (t.template_questions?.[0]?.count || 0), 0) || 0,
    totalUsage: templates?.reduce((acc, t) => acc + (t.usage_count || 0), 0) || 0,
  }
}

/**
 * Get the base template for question bank management
 */
export async function getBaseTemplate(): Promise<QuestionTemplate | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_templates')
    .select(`
      *,
      template_questions(*)
    `)
    .eq('is_base', true)
    .single()

  if (error) {
    console.error('Error fetching base template:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    description: data.description,
    is_base: data.is_base,
    status: data.status,
    usage_count: data.usage_count,
    created_at: data.created_at,
    updated_at: data.updated_at,
    questions: (data.template_questions || []).sort((a: TemplateQuestion, b: TemplateQuestion) =>
      a.order_index - b.order_index
    ),
  }
}

/**
 * Get base template stats for question bank page
 */
export async function getBaseTemplateStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('question_templates')
    .select(`
      id,
      usage_count,
      template_questions(count)
    `)
    .eq('is_base', true)
    .single()

  if (error) {
    console.error('Error fetching base template stats:', error)
    return {
      totalQuestions: 0,
      requiredQuestions: 0,
      totalUsage: 0,
    }
  }

  // Get required questions count
  const { count: requiredCount } = await supabase
    .from('template_questions')
    .select('*', { count: 'exact', head: true })
    .eq('template_id', data.id)
    .eq('required', true)

  return {
    totalQuestions: data.template_questions?.[0]?.count || 0,
    requiredQuestions: requiredCount || 0,
    totalUsage: data.usage_count || 0,
  }
}

// ============================================================================
// ANALYTICS QUERIES
// ============================================================================

/**
 * Get comprehensive analytics data for teacher dashboard
 */
export async function getTeacherAnalytics(userId: string): Promise<TeacherAnalyticsData> {
  const supabase = await createClient()

  // Get dashboard stats from view
  const { data: statsData } = await supabase
    .from('teacher_dashboard_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Get course stats from view
  const { data: courseData } = await supabase
    .from('course_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('total_responses', { ascending: false })

  // Get recent sessions from view
  const { data: sessionsData } = await supabase
    .from('session_details')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  // Get monthly trends from view
  const { data: trendsData } = await supabase
    .from('teacher_monthly_trends')
    .select('*')
    .eq('user_id', userId)
    .order('month', { ascending: true })
    .limit(6)

  // Get sentiment data from analytics reports
  const { data: sentimentReport } = await supabase
    .from('analytics_reports')
    .select('sentiment_breakdown, report_data')
    .eq('user_id', userId)
    .eq('report_type', 'overview')
    .order('generated_at', { ascending: false })
    .limit(1)
    .single()

  // Calculate sentiment (use default if not available)
  let sentimentData = {
    positive: 78,
    neutral: 15,
    negative: 7,
    totalAnalyzed: statsData?.total_responses || 0,
  }

  if (sentimentReport?.sentiment_breakdown) {
    const sb = sentimentReport.sentiment_breakdown as { positive?: number; neutral?: number; negative?: number }
    sentimentData = {
      positive: sb.positive || 78,
      neutral: sb.neutral || 15,
      negative: sb.negative || 7,
      totalAnalyzed: statsData?.total_responses || 0,
    }
  }

  return {
    stats: {
      totalResponses: statsData?.total_responses || 0,
      avgRating: parseFloat(statsData?.avg_rating) || 0,
      avgCompletionTime: statsData?.avg_completion_time_seconds || 0,
      totalSessions: statsData?.total_sessions || 0,
      liveSessions: statsData?.live_sessions || 0,
      scheduledSessions: statsData?.scheduled_sessions || 0,
      completedSessions: statsData?.completed_sessions || 0,
      activeCourses: statsData?.active_courses || 0,
    },
    courseStats: (courseData || []).map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      color: c.color,
      status: c.status,
      sessionCount: c.session_count || 0,
      liveSessionCount: c.live_session_count || 0,
      completedSessionCount: c.completed_session_count || 0,
      totalResponses: c.total_responses || 0,
      avgRating: parseFloat(c.avg_rating) || 0,
      lastActivity: c.last_activity,
      semesterName: c.semester_name,
    })),
    recentSessions: (sessionsData || []).map(s => ({
      id: s.id,
      name: s.name,
      courseName: s.course_name,
      courseCode: s.course_code,
      courseColor: s.course_color,
      status: s.status,
      responseCount: s.response_count || 0,
      avgRating: parseFloat(s.avg_rating) || 0,
      avgCompletionTime: s.avg_completion_time_seconds || 0,
      completedAt: s.end_time,
    })),
    monthlyTrends: (trendsData || []).map(t => ({
      month: new Date(t.month).toLocaleDateString('en-US', { month: 'short' }),
      responses: t.response_count || 0,
      avgRating: parseFloat(t.avg_rating) || 0,
    })),
    sentimentData,
  }
}
