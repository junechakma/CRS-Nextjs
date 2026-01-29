// Teacher Feature Exports

// Services
export { TeacherService } from './services/teacherService'
export type {
  TeacherDashboardStats,
  Course,
  ResponseSession,
  Question,
  Semester,
  CreateCourseData,
  CreateSessionData,
  ResponseData,
  SessionResponse
} from './services/teacherService'

// Pages
export { default as TeacherDashboard } from './pages/TeacherDashboard'
export { default as CoursesPage } from './pages/CoursesPage'
export { default as ResponseSessionsPage } from './pages/ResponseSessionsPage'
export { default as CourseSessionsPage } from './pages/CourseSessionsPage'
export { default as SessionAnalyticsPage } from './pages/SessionAnalyticsPage'
export { default as TeacherAnalyticsPage } from './pages/TeacherAnalyticsPage'

// Components
export { default as CourseManagement } from './components/CourseManagement'
export { default as ResponseSessionManagement } from './components/ResponseSessionManagement'
export { default as CourseSessionsManagement } from './components/CourseSessionsManagement'

// Hooks
export { useTeacherStats } from './hooks/useTeacherStats'
export { useCourses } from './hooks/useCourses'
export { useResponseSessions } from './hooks/useResponseSessions'