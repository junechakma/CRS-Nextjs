import type { User, UserRole } from '../../../types/auth'

// Extended registration data that includes temporary fields for user creation
export interface RegistrationData extends Partial<User> {
  // Temporary fields for super admin registration
  university_name?: string
  university_code?: string
  
  // Additional registration fields
  password?: string
  confirmPassword?: string
}

// Super Admin specific registration interface
export interface SuperAdminRegistration {
  name: string
  email: string
  password: string
  confirmPassword: string
  universityName: string
  universityCode: string
}

// Registration form data
export interface RegisterFormData {
  email: string
  password: string
  confirmPassword: string
  name: string
  role?: UserRole
  universityName?: string
  universityCode?: string
  university_id?: string
  faculty_id?: string
  department_id?: string
}

// Auth action payloads
export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  email: string
  password: string
  userData: RegistrationData
}

export interface AuthResponse {
  user: User | null
  session: any
  error?: string
}

// Password validation result
export interface PasswordValidation {
  valid: boolean
  errors: string[]
}

// Form validation errors
export interface FormErrors {
  [key: string]: string[]
}