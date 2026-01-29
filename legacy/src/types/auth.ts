// User Role Types based on CRS System Documentation
export type UserRole = 
  | 'super_admin'
  | 'university_admin' 
  | 'faculty_admin'
  | 'department_moderator'
  | 'teacher'
  | 'student'

// User Status Types
export type UserStatus = 'active' | 'blocked' | 'pending'

// Approval Status Types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

// Core User Interface
export interface User {
  id: string
  auth_user_id?: string // Link to Supabase auth.users
  email: string
  role: UserRole
  status: UserStatus

  // Profile information
  name: string
  initial?: string // For teachers
  phone?: string

  // Permission scope
  university_id?: string
  faculty_id?: string
  department_id?: string

  // Registration tracking
  application_date?: string
  approved_by?: string
  approval_date?: string
  approval_status: ApprovalStatus

  // Timestamps
  created_at: string
  updated_at: string
  last_login?: string
}

// University Admin Registration Form
export interface UniversityAdminRegistration {
  institution_name: string
  email: string
  password: string
  name: string
  phone?: string
}

// Auth State for Redux
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Login Form Data
export interface LoginCredentials {
  email: string
  password: string
}

// Password Update
export interface PasswordUpdate {
  current_password: string
  new_password: string
}

// Role Permissions Helper
export interface RolePermissions {
  canManageUsers: boolean
  canManageUniversities: boolean
  canManageFaculties: boolean
  canManageDepartments: boolean
  canManageCourses: boolean
  canViewResponses: boolean
  canModerateContent: boolean
  accessLevel: 'system' | 'university' | 'faculty' | 'department' | 'course' | 'response'
}

// Role hierarchy levels
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  'super_admin': 6,
  'university_admin': 5,
  'faculty_admin': 4,
  'department_moderator': 3,
  'teacher': 2,
  'student': 1
}

// Get permissions based on role
export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case 'super_admin':
      return {
        canManageUsers: true,
        canManageUniversities: true,
        canManageFaculties: true,
        canManageDepartments: true,
        canManageCourses: true,
        canViewResponses: true,
        canModerateContent: true,
        accessLevel: 'system'
      }
    case 'university_admin':
      return {
        canManageUsers: true,
        canManageUniversities: false,
        canManageFaculties: true,
        canManageDepartments: true,
        canManageCourses: false,
        canViewResponses: true,
        canModerateContent: true,
        accessLevel: 'university'
      }
    case 'faculty_admin':
      return {
        canManageUsers: true,
        canManageUniversities: false,
        canManageFaculties: false,
        canManageDepartments: true,
        canManageCourses: false,
        canViewResponses: true,
        canModerateContent: true,
        accessLevel: 'faculty'
      }
    case 'department_moderator':
      return {
        canManageUsers: true,
        canManageUniversities: false,
        canManageFaculties: false,
        canManageDepartments: false,
        canManageCourses: true,
        canViewResponses: true,
        canModerateContent: true,
        accessLevel: 'department'
      }
    case 'teacher':
      return {
        canManageUsers: false,
        canManageUniversities: false,
        canManageFaculties: false,
        canManageDepartments: false,
        canManageCourses: true,
        canViewResponses: true,
        canModerateContent: false,
        accessLevel: 'course'
      }
    case 'student':
      return {
        canManageUsers: false,
        canManageUniversities: false,
        canManageFaculties: false,
        canManageDepartments: false,
        canManageCourses: false,
        canViewResponses: false,
        canModerateContent: false,
        accessLevel: 'response'
      }
    default:
      return {
        canManageUsers: false,
        canManageUniversities: false,
        canManageFaculties: false,
        canManageDepartments: false,
        canManageCourses: false,
        canViewResponses: false,
        canModerateContent: false,
        accessLevel: 'response'
      }
  }
}