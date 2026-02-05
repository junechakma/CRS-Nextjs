// Shared types for query results

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

// Helper function to format time ago
export function getTimeAgo(dateStr: string): string {
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
