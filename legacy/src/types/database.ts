// Database Entity Types based on Supabase SQL Schema

// University Entity
export interface University {
  id: string
  name: string
  code: string
  
  // Location
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  
  // Contact
  email?: string
  phone?: string
  website?: string
  
  // Settings (JSONB)
  settings: {
    maintenance_mode: boolean
    registration_open: boolean
    default_session_duration: number
    max_questions_per_session: number
  }
  
  // Stats (JSONB)
  stats: {
    total_faculties: number
    total_departments: number
    total_teachers: number
    total_students: number
    total_courses: number
    total_responses: number
  }
  
  created_at: string
  updated_at: string
  created_by: string
}

// Faculty Entity
export interface Faculty {
  id: string
  university_id: string
  name: string
  code: string
  description?: string
  admin_id?: string
  
  // Settings (JSONB)
  settings: {
    question_templates: Array<any>
    default_semester_settings: {
      active_semesters: string[]
      current_semester: string
      academic_year: string
    }
  }
  
  // Stats (JSONB)
  stats: {
    total_departments: number
    total_teachers: number
    total_courses: number
    total_responses: number
  }
  
  created_at: string
  updated_at: string
  created_by: string
}

// Department Entity
export interface Department {
  id: string
  university_id: string
  faculty_id: string
  name: string
  code: string
  description?: string
  moderator_id?: string
  
  // Settings (JSONB)
  settings: {
    semesters: string[]
    current_semester: string
    question_config: {
      max_questions: number
      default_questions: Array<any>
      allow_remarks: boolean
      remarks_required: boolean
    }
  }
  
  // Stats (JSONB)
  stats: {
    total_teachers: number
    total_courses: number
    total_sessions: number
    total_responses: number
  }
  
  created_at: string
  updated_at: string
  created_by: string
}

// Course Entity
export interface Course {
  id: string
  university_id: string
  faculty_id: string
  department_id: string
  teacher_id: string
  course_code: string
  course_title: string
  semester: string
  academic_year: string
  sections: string[] // JSONB array
  status: 'active' | 'inactive' | 'completed'
  created_at: string
  updated_at: string
}

// Response Session Entity
export interface ResponseSession {
  id: string
  university_id: string
  faculty_id: string
  department_id: string
  course_id: string
  teacher_id: string
  section_id: string
  room_number?: string
  session_date: string
  start_time: string
  end_time: string
  duration_minutes: number
  anonymous_key: string
  status: 'pending' | 'active' | 'completed' | 'expired'
  
  // Questions (JSONB)
  questions: Array<{
    id: string
    text: string
    type: 'rating' | 'text' | 'multiple_choice'
    scale?: number
    options?: string[]
    required: boolean
    category: string
  }>
  
  // Stats (JSONB)
  stats: {
    total_responses: number
    target_responses: number
    completion_rate: number
  }
  
  created_at: string
  updated_at: string
}

// Response Entity
export interface Response {
  id: string
  session_id: string
  university_id: string
  faculty_id: string
  department_id: string
  course_id: string
  teacher_id: string
  section_id: string
  student_anonymous_id: string
  
  // Responses (JSONB)
  responses: Record<string, any>
  
  // Metadata (JSONB)
  metadata: {
    ip_address?: string
    user_agent?: string
    completion_time_seconds: number
  }
  
  status: 'draft' | 'submitted' | 'validated'
  submission_time: string
}

// System Config Entity
export interface SystemConfig {
  key: string
  value: any // JSONB
  description?: string
  updated_at: string
  updated_by?: string
}

// Common semester types
export type Semester = 'Spring' | 'Summer' | 'Autumn' | 'Year'

// Question types for forms
export interface Question {
  id: string
  text: string
  type: 'rating' | 'text' | 'multiple_choice'
  scale?: number
  options?: string[]
  required: boolean
  category: 'instructor' | 'content' | 'delivery' | 'environment' | 'overall'
}