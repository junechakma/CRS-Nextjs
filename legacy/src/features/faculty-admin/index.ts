// Faculty Admin Feature Exports

// Services
export { FacultyAdminService } from './services/facultyAdminService'
export type {
  FacultyDashboardStats,
  RecentActivity,
  Department,
  Teacher,
  Course,
  CreateDepartmentData,
  CreateTeacherData
} from './services/facultyAdminService'

// Components
export { default as DepartmentManagement } from './components/DepartmentManagement'
export { default as TeacherManagement } from './components/TeacherManagement'

// Pages
export { default as FacultyAdminDashboard } from './pages/FacultyAdminDashboard'
export { default as DepartmentManagementPage } from './pages/DepartmentManagementPage'
export { default as TeacherManagementPage } from './pages/TeacherManagementPage'