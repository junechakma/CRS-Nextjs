export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  UNIVERSITY_ADMIN: 'university_admin',
  FACULTY_ADMIN: 'faculty_admin',
  DEPARTMENT_MODERATOR: 'department_moderator',
  TEACHER: 'teacher',
  STUDENT: 'student'
} as const

export const USER_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
  PENDING: 'pending'
} as const

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const

export const SESSION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired'
} as const

export const RESPONSE_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  VALIDATED: 'validated'
} as const

export const COURSE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed'
} as const

export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
}

export const API_ENDPOINTS = {
  USERS: 'users',
  UNIVERSITIES: 'universities',
  FACULTIES: 'faculties',
  DEPARTMENTS: 'departments',
  COURSES: 'courses',
  RESPONSE_SESSIONS: 'response_sessions',
  RESPONSES: 'responses',
  SYSTEM_CONFIG: 'system_config'
} as const

export const ROUTE_PATHS = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER_SUPER_ADMIN: '/register-superadmin',
  DASHBOARD: '/dashboard',
  UNIVERSITIES: '/universities',
  FACULTIES: '/faculties',
  DEPARTMENTS: '/departments',
  TEACHERS: '/teachers',
  COURSES: '/courses',
  SESSIONS: '/sessions',
  RESPONSES: '/responses',
  SETTINGS: '/settings',
  USERS: '/users',
  APPROVALS: '/approvals',
  ANALYTICS: '/analytics',
  UNAUTHORIZED: '/unauthorized'
} as const

export const LOCAL_STORAGE_KEYS = {
  THEME: 'crs_theme',
  LANGUAGE: 'crs_language',
  SIDEBAR_COLLAPSED: 'crs_sidebar_collapsed'
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const