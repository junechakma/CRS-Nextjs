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
