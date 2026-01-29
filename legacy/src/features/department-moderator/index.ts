// Department Moderator Feature Exports

// Services
export { DepartmentModeratorService } from './services/departmentModeratorService'
export type {
  DepartmentDashboardStats,
  RecentActivity,
  Teacher,
  Course,
  ResponseSession,
  Student,
  CreateTeacherData
} from './services/departmentModeratorService'

// Components
export { default as TeacherManagement } from './components/TeacherManagement'
export { default as CourseManagement } from './components/CourseManagement'

// Pages
export { default as DepartmentModeratorDashboard } from './pages/DepartmentModeratorDashboard'
export { default as TeachersPage } from './pages/TeachersPage'
export { default as CoursesPage } from './pages/CoursesPage'