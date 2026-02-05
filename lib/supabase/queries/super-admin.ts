import { createClient } from '../server'
import { PaginatedResult, UserWithStats, RecentActivity, getTimeAgo } from './types'

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// DASHBOARD QUERIES
// ============================================================================

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

// ============================================================================
// USER QUERIES
// ============================================================================

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
// ANALYTICS QUERIES
// ============================================================================

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
