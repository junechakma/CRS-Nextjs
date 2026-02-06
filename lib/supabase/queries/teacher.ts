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
// SEMESTERS QUERIES & MUTATIONS
// ============================================================================

export interface SemesterData {
  id: string
  name: string
  start_date: string
  end_date: string
  description?: string | null
  status: 'current' | 'upcoming' | 'completed'
  courses: number
  students: number
  sessions: number
  progress: number
}

export interface CreateSemesterInput {
  name: string
  startDate: string
  endDate: string
  description?: string
  status: 'current' | 'upcoming'
}

export interface UpdateSemesterInput {
  id: string
  name?: string
  startDate?: string
  endDate?: string
  description?: string
  status?: 'current' | 'upcoming' | 'completed'
}

/**
 * Get paginated semesters for a teacher (OPTIMIZED with view)
 */
export async function getTeacherSemestersPaginated({
  userId,
  page = 1,
  pageSize = 12,
  search = '',
  status = 'all',
}: {
  userId: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
}): Promise<PaginatedResult<SemesterData>> {
  const supabase = await createClient()

  const offset = (page - 1) * pageSize

  // Build query using optimized view
  let query = supabase
    .from('semester_stats')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply search filter
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Apply sorting and pagination
  query = query
    .order('start_date', { ascending: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching semesters:', error)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  // Transform data
  const semesters: SemesterData[] = (data || []).map(semester => ({
    id: semester.id,
    name: semester.name,
    start_date: semester.start_date,
    end_date: semester.end_date,
    description: semester.description,
    status: semester.status as 'current' | 'upcoming' | 'completed',
    courses: semester.courses_count || 0,
    students: semester.students_count || 0,
    sessions: semester.sessions_count || 0,
    progress: semester.progress || 0,
  }))

  return {
    data: semesters,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get all semesters for a teacher (DEPRECATED - use getTeacherSemestersPaginated)
 */
export async function getTeacherSemesters(userId: string): Promise<SemesterData[]> {
  const supabase = await createClient()

  // Get semesters with aggregated data
  const { data: semesters } = await supabase
    .from('semesters')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  if (!semesters) return []

  // For each semester, get counts
  const semestersWithStats = await Promise.all(
    semesters.map(async (semester) => {
      // Get courses count for this semester
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true })
        .eq('semester_id', semester.id)

      // Get total students from courses in this semester
      const { data: courses } = await supabase
        .from('courses')
        .select('expected_students')
        .eq('semester_id', semester.id)

      const studentsCount = courses?.reduce((acc, c) => acc + (c.expected_students || 0), 0) || 0

      // Get sessions count for courses in this semester
      const { data: semesterCourses } = await supabase
        .from('courses')
        .select('id')
        .eq('semester_id', semester.id)

      const courseIds = semesterCourses?.map(c => c.id) || []

      let sessionsCount = 0
      if (courseIds.length > 0) {
        const { count } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .in('course_id', courseIds)

        sessionsCount = count || 0
      }

      // Calculate progress based on dates
      const now = new Date()
      const start = new Date(semester.start_date)
      const end = new Date(semester.end_date)

      let progress = 0
      if (now > end) {
        progress = 100
      } else if (now > start) {
        const total = end.getTime() - start.getTime()
        const elapsed = now.getTime() - start.getTime()
        progress = Math.round((elapsed / total) * 100)
      }

      return {
        id: semester.id,
        name: semester.name,
        start_date: semester.start_date,
        end_date: semester.end_date,
        description: semester.description,
        status: semester.status,
        courses: coursesCount || 0,
        students: studentsCount,
        sessions: sessionsCount,
        progress,
      }
    })
  )

  return semestersWithStats
}

/**
 * Create a new semester
 */
export async function createSemester(userId: string, input: CreateSemesterInput) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('semesters')
    .insert({
      user_id: userId,
      name: input.name,
      start_date: input.startDate,
      end_date: input.endDate,
      description: input.description || null,
      status: input.status,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating semester:', error)
    throw new Error(`Failed to create semester: ${error.message}`)
  }

  return data
}

/**
 * Update a semester
 */
export async function updateSemester(userId: string, input: UpdateSemesterInput) {
  const supabase = await createClient()

  const updateData: Record<string, unknown> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.startDate !== undefined) updateData.start_date = input.startDate
  if (input.endDate !== undefined) updateData.end_date = input.endDate
  if (input.description !== undefined) updateData.description = input.description
  if (input.status !== undefined) updateData.status = input.status

  const { data, error } = await supabase
    .from('semesters')
    .update(updateData)
    .eq('id', input.id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating semester:', error)
    throw new Error('Failed to update semester')
  }

  return data
}

/**
 * Delete a semester
 */
export async function deleteSemester(userId: string, semesterId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('semesters')
    .delete()
    .eq('id', semesterId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting semester:', error)
    throw new Error('Failed to delete semester')
  }

  return true
}

// ============================================================================
// COURSES QUERIES
// ============================================================================

export interface CourseData {
  id: string
  name: string
  code: string
  description?: string | null
  semester: string
  semester_id: string | null
  students: number
  sessions: number
  avg_rating: number
  last_activity: string | null
  status: 'active' | 'archived'
  color: string
}

/**
 * Get paginated courses for a teacher (OPTIMIZED with view)
 */
export async function getTeacherCoursesPaginated({
  userId,
  page = 1,
  pageSize = 12,
  search = '',
  status = 'all',
  semesterId = '',
}: {
  userId: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
  semesterId?: string
}): Promise<PaginatedResult<CourseData>> {
  const supabase = await createClient()

  const offset = (page - 1) * pageSize

  // Build query using optimized view
  let query = supabase
    .from('course_stats_paginated')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply semester filter
  if (semesterId && semesterId !== 'all') {
    query = query.eq('semester_id', semesterId)
  }

  // Apply search filter (name or code)
  if (search) {
    query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`)
  }

  // Apply sorting and pagination
  query = query
    .order('last_activity', { ascending: false, nullsFirst: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching courses:', error)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  // Transform data
  const courses: CourseData[] = (data || []).map(course => ({
    id: course.id,
    name: course.name,
    code: course.code,
    description: course.description,
    semester: course.semester_name || 'No Semester',
    semester_id: course.semester_id,
    students: course.expected_students || 0,
    sessions: course.session_count || 0,
    avg_rating: Math.round((course.avg_rating || 0) * 10) / 10,
    last_activity: course.last_activity,
    status: course.status as 'active' | 'archived',
    color: course.color || 'indigo',
  }))

  return {
    data: courses,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get all courses for a teacher (DEPRECATED - use getTeacherCoursesPaginated)
 */
export async function getTeacherCourses(userId: string): Promise<CourseData[]> {
  const supabase = await createClient()

  // Get courses with semester information
  const { data: courses } = await supabase
    .from('courses')
    .select(`
      id,
      name,
      code,
      color,
      status,
      expected_students,
      last_activity_at,
      semester_id,
      semesters(name)
    `)
    .eq('user_id', userId)
    .order('last_activity_at', { ascending: false })

  if (!courses) return []

  // For each course, get sessions count and avg rating
  const coursesWithStats = await Promise.all(
    courses.map(async (course) => {
      // Get sessions count
      const { count: sessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', course.id)

      // Get avg rating from completed sessions
      const { data: sessionStats } = await supabase
        .from('sessions')
        .select('avg_rating')
        .eq('course_id', course.id)
        .eq('status', 'completed')
        .not('avg_rating', 'is', null)

      const avgRating = sessionStats && sessionStats.length > 0
        ? sessionStats.reduce((acc, s) => acc + (s.avg_rating || 0), 0) / sessionStats.length
        : 0

      const semester = course.semesters as unknown as { name: string } | null

      return {
        id: course.id,
        name: course.name,
        code: course.code,
        description: course.description,
        semester: semester?.name || 'No Semester',
        semester_id: course.semester_id,
        students: course.expected_students || 0,
        sessions: sessionsCount || 0,
        avg_rating: Math.round(avgRating * 10) / 10,
        last_activity: course.last_activity_at,
        status: course.status === 'active' ? 'active' : 'archived',
        color: course.color || 'indigo',
      }
    })
  )

  return coursesWithStats
}

/**
 * Get semesters list (id and name) for dropdowns
 */
export async function getTeacherSemestersList(userId: string) {
  const supabase = await createClient()

  const { data: semesters } = await supabase
    .from('semesters')
    .select('id, name, status')
    .eq('user_id', userId)
    .order('start_date', { ascending: false })

  return semesters || []
}

// ============================================================================
// SESSIONS QUERIES
// ============================================================================

export interface SessionData {
  id: string
  name: string
  course: string
  courseCode: string
  courseId: string
  accessCode: string
  status: 'live' | 'scheduled' | 'completed'
  responses: number
  total: number
  startTime: string
  endTime: string
  date: string
  duration: string
  templateId: string
}

export interface SessionStats {
  activeSessions: number
  scheduledSessions: number
  totalResponses: number
  avgResponseRate: number
}

/**
 * Get paginated sessions for a teacher (OPTIMIZED with view)
 */
export async function getTeacherSessionsPaginated({
  userId,
  page = 1,
  pageSize = 12,
  search = '',
  status = 'all',
  courseId = '',
}: {
  userId: string
  page?: number
  pageSize?: number
  search?: string
  status?: string
  courseId?: string
}): Promise<PaginatedResult<SessionData>> {
  const supabase = await createClient()

  const offset = (page - 1) * pageSize

  // Build query using optimized view
  let query = supabase
    .from('session_stats_paginated')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply course filter
  if (courseId && courseId !== 'all') {
    query = query.eq('course_id', courseId)
  }

  // Apply search filter
  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Apply sorting and pagination
  query = query
    .order('start_time', { ascending: false, nullsFirst: false })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching sessions:', error)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  const now = new Date()

  // Transform data
  const sessions: SessionData[] = (data || []).map(session => {
    const startTime = session.start_time ? new Date(session.start_time) : null
    const endTime = session.end_time ? new Date(session.end_time) : null

    // Calculate duration/status text
    let duration = ''
    if (session.status === 'live') {
      const elapsed = Math.floor((now.getTime() - (startTime?.getTime() || 0)) / 60000)
      duration = `${elapsed} min active`
    } else if (session.status === 'scheduled' && startTime) {
      const timeUntil = Math.floor((startTime.getTime() - now.getTime()) / 60000)
      if (timeUntil < 60) {
        duration = `Starts in ${timeUntil}m`
      } else if (timeUntil < 1440) {
        duration = `Starts in ${Math.floor(timeUntil / 60)}h`
      } else {
        duration = 'Scheduled'
      }
    } else {
      duration = 'Completed'
    }

    // Format date
    let date = ''
    if (startTime) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sessionDate = new Date(startTime)
      sessionDate.setHours(0, 0, 0, 0)
      const diffDays = Math.floor((sessionDate.getTime() - today.getTime()) / 86400000)

      if (diffDays === 0) date = 'Today'
      else if (diffDays === 1) date = 'Tomorrow'
      else if (diffDays === -1) date = 'Yesterday'
      else date = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    return {
      id: session.id,
      name: session.name,
      course: session.course_name || 'Unknown Course',
      courseCode: session.course_code || '',
      courseId: session.course_id,
      accessCode: session.access_code,
      status: session.status as 'live' | 'scheduled' | 'completed',
      responses: session.response_count || 0,
      total: session.total_expected_students || 0,
      startTime: startTime ? startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      endTime: endTime ? endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      date,
      duration,
      templateId: session.template_id || '',
    }
  })

  return {
    data: sessions,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get all sessions for a teacher (DEPRECATED - use getTeacherSessionsPaginated)
 */
export async function getTeacherSessions(userId: string): Promise<SessionData[]> {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      id,
      name,
      access_code,
      status,
      response_count,
      start_time,
      end_time,
      template_id,
      courses(
        id,
        name,
        code,
        expected_students
      )
    `)
    .eq('user_id', userId)
    .order('start_time', { ascending: false })

  if (!sessions) return []

  const now = new Date()

  return sessions.map(session => {
    const course = session.courses as unknown as { id: string; name: string; code: string; expected_students: number } | null
    const startTime = new Date(session.start_time)
    const endTime = session.end_time ? new Date(session.end_time) : null

    // Calculate duration/status text
    let duration = ''
    if (session.status === 'live') {
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 60000)
      duration = `${elapsed} min active`
    } else if (session.status === 'scheduled') {
      const timeUntil = Math.floor((startTime.getTime() - now.getTime()) / 60000)
      if (timeUntil < 60) {
        duration = `Starts in ${timeUntil}m`
      } else if (timeUntil < 1440) {
        duration = `Starts in ${Math.floor(timeUntil / 60)}h`
      } else {
        duration = 'Scheduled'
      }
    } else {
      duration = 'Completed'
    }

    // Format date
    let date = ''
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const sessionDate = new Date(startTime)
    sessionDate.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((sessionDate.getTime() - today.getTime()) / 86400000)

    if (diffDays === 0) date = 'Today'
    else if (diffDays === 1) date = 'Tomorrow'
    else if (diffDays === -1) date = 'Yesterday'
    else date = startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    return {
      id: session.id,
      name: session.name,
      course: course?.name || 'Unknown Course',
      courseCode: course?.code || '',
      courseId: course?.id || '',
      accessCode: session.access_code,
      status: session.status as 'live' | 'scheduled' | 'completed',
      responses: session.response_count || 0,
      total: course?.expected_students || 0,
      startTime: startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      endTime: endTime ? endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : '',
      date,
      duration,
      templateId: session.template_id || '',
    }
  })
}

/**
 * Get session statistics for a teacher
 */
export async function getTeacherSessionStats(userId: string): Promise<SessionStats> {
  const supabase = await createClient()

  // Get active sessions count
  const { count: activeSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'live')

  // Get scheduled sessions count
  const { count: scheduledSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'scheduled')

  // Get total responses from all sessions
  const { count: totalResponses } = await supabase
    .from('session_responses')
    .select('*, sessions!inner(user_id)', { count: 'exact', head: true })
    .eq('sessions.user_id', userId)

  // Calculate average response rate
  const { data: sessions } = await supabase
    .from('sessions')
    .select('response_count, courses(expected_students)')
    .eq('user_id', userId)
    .eq('status', 'completed')

  let avgResponseRate = 0
  if (sessions && sessions.length > 0) {
    const rates = sessions
      .map(s => {
        const course = s.courses as unknown as { expected_students: number } | null
        const expected = course?.expected_students || 0
        const responses = s.response_count || 0
        return expected > 0 ? (responses / expected) * 100 : 0
      })
      .filter(rate => rate > 0)

    if (rates.length > 0) {
      avgResponseRate = Math.round(rates.reduce((acc, rate) => acc + rate, 0) / rates.length)
    }
  }

  return {
    activeSessions: activeSessions || 0,
    scheduledSessions: scheduledSessions || 0,
    totalResponses: totalResponses || 0,
    avgResponseRate,
  }
}

// ============================================================================
// CLO MAPPING QUERIES
// ============================================================================

export interface CLOSetData {
  id: string
  name: string
  description: string
  courseId: string
  courseName: string
  courseCode: string
  cloCount: number
  mappedQuestions: number
  createdAt: string
  status: 'active' | 'draft'
  color: string
}

export interface CLOData {
  id: string
  cloSetId: string
  code: string
  description: string
  bloomLevel: string | null
  mappedQuestions: number
  avgRelevance: number
  coveragePercentage: number
  orderIndex: number
}

export interface CLOQuestionMapping {
  id: string
  cloId: string
  questionId: string
  relevanceScore: number
  quality: 'perfect' | 'good' | 'needs_improvement' | 'unmapped'
  aiReasoning: string | null
  confidence: number
}

/**
 * Get all CLO sets for a teacher
 */
export async function getTeacherCLOSets(userId: string): Promise<CLOSetData[]> {
  const supabase = await createClient()

  const { data: cloSets } = await supabase
    .from('clo_sets')
    .select(`
      id,
      name,
      description,
      color,
      status,
      clo_count,
      mapped_questions,
      created_at,
      courses(
        id,
        name,
        code
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!cloSets) return []

  return cloSets.map(set => {
    const course = set.courses as unknown as { id: string; name: string; code: string } | null
    return {
      id: set.id,
      name: set.name,
      description: set.description || '',
      courseId: course?.id || '',
      courseName: course?.name || 'Unknown Course',
      courseCode: course?.code || '',
      cloCount: set.clo_count || 0,
      mappedQuestions: set.mapped_questions || 0,
      createdAt: getTimeAgo(set.created_at),
      status: set.status as 'active' | 'draft',
      color: set.color || 'indigo',
    }
  })
}

/**
 * Get a single CLO set with details
 */
export async function getCLOSet(cloSetId: string, userId: string) {
  const supabase = await createClient()

  const { data: cloSet } = await supabase
    .from('clo_sets')
    .select(`
      id,
      name,
      description,
      color,
      status,
      clo_count,
      mapped_questions,
      created_at,
      courses(
        id,
        name,
        code
      )
    `)
    .eq('id', cloSetId)
    .eq('user_id', userId)
    .single()

  if (!cloSet) return null

  const course = cloSet.courses as unknown as { id: string; name: string; code: string } | null

  return {
    id: cloSet.id,
    name: cloSet.name,
    description: cloSet.description || '',
    courseId: course?.id || '',
    courseName: course?.name || 'Unknown Course',
    courseCode: course?.code || '',
    cloCount: cloSet.clo_count || 0,
    mappedQuestions: cloSet.mapped_questions || 0,
    createdAt: getTimeAgo(cloSet.created_at),
    status: cloSet.status as 'active' | 'draft',
    color: cloSet.color || 'indigo',
  }
}

/**
 * Get CLOs for a CLO set
 */
export async function getCLOs(cloSetId: string): Promise<CLOData[]> {
  const supabase = await createClient()

  const { data: clos } = await supabase
    .from('clos')
    .select('*')
    .eq('clo_set_id', cloSetId)
    .order('order_index', { ascending: true })

  if (!clos) return []

  return clos.map(clo => ({
    id: clo.id,
    cloSetId: clo.clo_set_id,
    code: clo.code,
    description: clo.description,
    bloomLevel: clo.bloom_level,
    mappedQuestions: clo.mapped_questions || 0,
    avgRelevance: parseFloat(clo.avg_relevance) || 0,
    coveragePercentage: parseFloat(clo.coverage_percentage) || 0,
    orderIndex: clo.order_index || 0,
  }))
}

/**
 * Get CLO question mappings for a CLO set
 */
export async function getCLOQuestionMappings(cloSetId: string): Promise<CLOQuestionMapping[]> {
  const supabase = await createClient()

  const { data: mappings } = await supabase
    .from('clo_question_mappings')
    .select(`
      id,
      clo_id,
      question_id,
      relevance_score,
      quality,
      ai_reasoning,
      confidence,
      clos!inner(clo_set_id)
    `)
    .eq('clos.clo_set_id', cloSetId)

  if (!mappings) return []

  return mappings.map(m => ({
    id: m.id,
    cloId: m.clo_id,
    questionId: m.question_id,
    relevanceScore: parseFloat(m.relevance_score) || 0,
    quality: m.quality as 'perfect' | 'good' | 'needs_improvement' | 'unmapped',
    aiReasoning: m.ai_reasoning,
    confidence: parseFloat(m.confidence) || 0,
  }))
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
