// User Types
export type UserRole = "super-admin" | "teacher" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export interface Teacher extends User {
  role: "teacher"
  institution: string
  courses: Course[]
}

export interface SuperAdmin extends User {
  role: "super-admin"
}

// Course Types
export interface Course {
  id: string
  name: string
  code: string
  semester: string
  teacherId: string
  students: number
  description?: string
  createdAt: Date
  updatedAt: Date
}

// Session Types
export type SessionStatus = "draft" | "active" | "ended" | "archived"

export interface FeedbackSession {
  id: string
  courseId: string
  name: string
  description?: string
  status: SessionStatus
  accessCode: string
  qrCode?: string
  startDate: Date
  endDate: Date
  questionIds: string[]
  responses: number
  totalStudents: number
  createdAt: Date
  updatedAt: Date
}

// Question Types
export type QuestionType = "rating" | "text" | "multiple-choice" | "scale"
export type QuestionSource = "custom" | "common"

export interface Question {
  id: string
  text: string
  type: QuestionType
  source: QuestionSource
  options?: string[]
  required: boolean
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

// Response Types
export interface FeedbackResponse {
  id: string
  sessionId: string
  questionId: string
  answer: string | number | string[]
  sentiment?: "positive" | "neutral" | "negative"
  createdAt: Date
}

// Analytics Types
export interface CourseAnalytics {
  courseId: string
  totalSessions: number
  totalResponses: number
  avgResponseRate: number
  avgRating: number
  sentimentBreakdown: {
    positive: number
    neutral: number
    negative: number
  }
  cloMapping?: CLOMapping[]
}

export interface CLOMapping {
  questionId: string
  clo: string
  plo?: string
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"
  confidence: number
}

// Dashboard Types
export interface DashboardStats {
  totalCourses?: number
  totalTeachers?: number
  totalSessions: number
  totalResponses: number
  activeSessionsCount: number
  avgResponseRate: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
