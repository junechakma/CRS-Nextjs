import { createClient } from './server'

// Types for query results
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export interface UserWithStats {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'teacher'
  institution: string | null
  department: string | null
  plan: 'free' | 'premium' | 'custom'
  status: 'active' | 'inactive' | 'banned'
  avatar_url: string | null
  created_at: string
  updated_at: string
  courses_count: number
  sessions_count: number
}

export interface DashboardStats {
  totalUsers: number
  premiumUsers: number
  customUsers: number
  freeUsers: number
  activeUsers: number
  inactiveUsers: number
  activeSessions: number
  totalCourses: number
  totalResponses: number
  monthlyNewUsers: number
}

export interface QuestionTemplate {
  id: string
  user_id: string | null
  name: string
  description: string | null
  is_base: boolean
  status: 'active' | 'inactive'
  usage_count: number
  created_at: string
  updated_at: string
  questions: TemplateQuestion[]
}

export interface TemplateQuestion {
  id: string
  template_id: string
  text: string
  type: 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric'
  required: boolean
  scale: number
  min_value: number
  max_value: number
  options: string[] | null
  order_index: number
}

export interface RecentActivity {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  user_name?: string
  user_email?: string
}

// ============================================================================
// SUPER ADMIN QUERIES
// ============================================================================

/**
 * Get dashboard statistics for super admin
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient()

  // Get user counts by plan and status
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('plan, status', { count: 'exact' })

  if (usersError) {
    console.error('Error fetching user stats:', usersError)
    return getEmptyStats()
  }

  // Get active sessions count
  const { count: activeSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live')

  // Get total courses
  const { count: totalCourses } = await supabase
    .from('courses')
    .select('*', { count: 'exact', head: true })

  // Get total responses
  const { count: totalResponses } = await supabase
    .from('session_responses')
    .select('*', { count: 'exact', head: true })

  // Get new users this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: monthlyNewUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())

  // Calculate stats from users data
  const stats: DashboardStats = {
    totalUsers: users?.length || 0,
    premiumUsers: users?.filter(u => u.plan === 'premium').length || 0,
    customUsers: users?.filter(u => u.plan === 'custom').length || 0,
    freeUsers: users?.filter(u => u.plan === 'free').length || 0,
    activeUsers: users?.filter(u => u.status === 'active').length || 0,
    inactiveUsers: users?.filter(u => u.status !== 'active').length || 0,
    activeSessions: activeSessions || 0,
    totalCourses: totalCourses || 0,
    totalResponses: totalResponses || 0,
    monthlyNewUsers: monthlyNewUsers || 0,
  }

  return stats
}

function getEmptyStats(): DashboardStats {
  return {
    totalUsers: 0,
    premiumUsers: 0,
    customUsers: 0,
    freeUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    activeSessions: 0,
    totalCourses: 0,
    totalResponses: 0,
    monthlyNewUsers: 0,
  }
}

/**
 * Get paginated users with search and filters
 */
export async function getUsers({
  page = 1,
  pageSize = 10,
  search = '',
  status = 'all',
  plan = 'all',
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  plan?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<PaginatedResult<UserWithStats>> {
  const supabase = await createClient()

  // Calculate offset
  const offset = (page - 1) * pageSize

  // Build query
  let query = supabase
    .from('users')
    .select(`
      *,
      courses:courses(count),
      sessions:sessions(count)
    `, { count: 'exact' })

  // Apply search filter
  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,institution.ilike.%${search}%`)
  }

  // Apply status filter
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Apply plan filter
  if (plan !== 'all') {
    query = query.eq('plan', plan)
  }

  // Apply sorting and pagination
  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + pageSize - 1)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching users:', error)
    return { data: [], count: 0, page, pageSize, totalPages: 0 }
  }

  // Transform data to include counts
  const usersWithStats: UserWithStats[] = (data || []).map(user => ({
    id: user.id,
    email: user.email,
    name: user.name || '',
    role: user.role,
    institution: user.institution,
    department: user.department,
    plan: user.plan,
    status: user.status,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
    courses_count: user.courses?.[0]?.count || 0,
    sessions_count: user.sessions?.[0]?.count || 0,
  }))

  return {
    data: usersWithStats,
    count: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  }
}

/**
 * Get recent users for dashboard preview
 */
export async function getRecentUsers(limit = 5): Promise<UserWithStats[]> {
  const result = await getUsers({ page: 1, pageSize: limit, sortBy: 'created_at', sortOrder: 'desc' })
  return result.data
}

/**
 * Get recent activity for dashboard
 */
export async function getRecentActivity(limit = 10): Promise<RecentActivity[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('activity_log')
    .select(`
      *,
      users:user_id(name, email)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching activity:', error)
    return []
  }

  return (data || []).map(activity => ({
    id: activity.id,
    user_id: activity.user_id,
    action: activity.action,
    entity_type: activity.entity_type,
    entity_id: activity.entity_id,
    metadata: activity.metadata,
    created_at: activity.created_at,
    user_name: activity.users?.name,
    user_email: activity.users?.email,
  }))
}

// ============================================================================
// TEACHER QUERIES
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

// ============================================================================
// TEACHER DASHBOARD QUERIES
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

  return {
    activeCourses: coursesCount || 0,
    totalStudents: totalStudents,
    totalResponses: totalResponses || 0,
    liveSessions: liveSessions || 0,
  }
}

// ============================================================================
// QUESTION BANK QUERIES (Super Admin)
// ============================================================================

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
// TEACHER ANALYTICS QUERIES
// ============================================================================

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

/**
 * Get comprehensive analytics data for teacher dashboard
 */
// ============================================================================
// SUPER ADMIN ANALYTICS QUERIES
// ============================================================================

export interface SuperAdminAnalyticsData {
  systemStats: {
    totalTeachers: number
    activeTeachers: number
    premiumUsers: number
    customUsers: number
    newTeachersWeek: number
    totalSessions: number
    activeSessions: number
    completedSessions: number
    totalResponses: number
    platformAvgRating: number
    totalCourses: number
    estimatedMrr: number
  }
  planDistribution: Array<{
    plan: string
    count: number
    percentage: number
    color: string
  }>
  monthlyTrends: Array<{
    month: string
    responses: number
    sessions: number
    activeTeachers: number
  }>
  topTeachers: Array<{
    id: string
    name: string
    email: string
    institution: string | null
    plan: string
    totalSessions: number
    totalResponses: number
    avgRating: number
  }>
  recentActivity: Array<{
    id: string
    action: string
    userName: string
    userPlan: string
    time: string
    metadata: Record<string, unknown> | null
  }>
  platformSentiment: {
    positive: number
    neutral: number
    negative: number
  }
}

/**
 * Get comprehensive analytics data for super admin
 */
export async function getSuperAdminAnalytics(): Promise<SuperAdminAnalyticsData> {
  const supabase = await createClient()

  // Get system stats from view
  const { data: statsData } = await supabase
    .from('super_admin_dashboard_stats')
    .select('*')
    .single()

  // Get plan distribution from view
  const { data: planData } = await supabase
    .from('plan_distribution')
    .select('*')

  // Get monthly trends from view
  const { data: trendsData } = await supabase
    .from('monthly_response_trends')
    .select('*')
    .order('month', { ascending: true })
    .limit(6)

  // Get top performing teachers from view
  const { data: teachersData } = await supabase
    .from('top_performing_teachers')
    .select('*')
    .limit(5)

  // Get recent activity from view
  const { data: activityData } = await supabase
    .from('recent_activity')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6)

  // Get platform sentiment from analytics reports
  const { data: sentimentData } = await supabase
    .from('analytics_reports')
    .select('sentiment_breakdown')
    .not('sentiment_breakdown', 'is', null)
    .order('generated_at', { ascending: false })
    .limit(100)

  // Calculate aggregated sentiment
  let platformSentiment = { positive: 76, neutral: 17, negative: 7 }
  if (sentimentData && sentimentData.length > 0) {
    let totalPositive = 0, totalNeutral = 0, totalNegative = 0, count = 0
    sentimentData.forEach(report => {
      if (report.sentiment_breakdown) {
        const sb = report.sentiment_breakdown as { positive?: number; neutral?: number; negative?: number }
        totalPositive += sb.positive || 0
        totalNeutral += sb.neutral || 0
        totalNegative += sb.negative || 0
        count++
      }
    })
    if (count > 0) {
      platformSentiment = {
        positive: Math.round(totalPositive / count),
        neutral: Math.round(totalNeutral / count),
        negative: Math.round(totalNegative / count),
      }
    }
  }

  // Map plan to color
  const planColors: Record<string, string> = {
    free: 'bg-slate-400',
    premium: 'bg-violet-500',
    custom: 'bg-amber-500',
  }

  // Format time ago
  const getTimeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} mins ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    return `${diffDays} days ago`
  }

  return {
    systemStats: {
      totalTeachers: statsData?.total_teachers || 0,
      activeTeachers: statsData?.active_teachers || 0,
      premiumUsers: statsData?.premium_users || 0,
      customUsers: statsData?.custom_users || 0,
      newTeachersWeek: statsData?.new_teachers_week || 0,
      totalSessions: statsData?.total_sessions || 0,
      activeSessions: statsData?.active_sessions || 0,
      completedSessions: statsData?.completed_sessions || 0,
      totalResponses: statsData?.total_responses || 0,
      platformAvgRating: parseFloat(statsData?.platform_avg_rating) || 0,
      totalCourses: statsData?.total_courses || 0,
      estimatedMrr: parseFloat(statsData?.estimated_mrr) || 0,
    },
    planDistribution: (planData || []).map(p => ({
      plan: (p.plan || 'free').charAt(0).toUpperCase() + (p.plan || 'free').slice(1),
      count: p.count || 0,
      percentage: parseFloat(p.percentage) || 0,
      color: planColors[p.plan || 'free'] || 'bg-slate-400',
    })),
    monthlyTrends: (trendsData || []).map(t => ({
      month: new Date(t.month).toLocaleDateString('en-US', { month: 'short' }),
      responses: t.response_count || 0,
      sessions: t.session_count || 0,
      activeTeachers: t.active_teachers || 0,
    })),
    topTeachers: (teachersData || []).map(t => ({
      id: t.id,
      name: t.name || 'Unknown',
      email: t.email || '',
      institution: t.institution,
      plan: t.plan || 'free',
      totalSessions: t.total_sessions || 0,
      totalResponses: t.total_responses || 0,
      avgRating: parseFloat(t.avg_rating) || 0,
    })),
    recentActivity: (activityData || []).map(a => ({
      id: a.id,
      action: a.action,
      userName: a.user_name || 'Unknown User',
      userPlan: a.user_plan || 'free',
      time: getTimeAgo(a.created_at),
      metadata: a.metadata,
    })),
    platformSentiment,
  }
}

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

  // Calculate sentiment (use mock if not available)
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
