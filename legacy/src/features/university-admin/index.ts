// Pages
export { default as UniversityAdminDashboard } from './pages/UniversityAdminDashboard'
export { default as ApplicationPendingPage } from './pages/ApplicationPendingPage'
export { default as QuestionsPage } from './pages/QuestionsPage'
export { default as DurationPage } from './pages/DurationPage'
export { default as UniversitySettingsPage } from './pages/UniversitySettingsPage'

// Components
export { default as FacultyManagement } from './components/FacultyManagement'
export { default as DepartmentManagement } from './components/DepartmentManagement'
export { default as TeacherManagement } from './components/TeacherManagement'
export { default as SemesterManagement } from './components/SemesterManagement'
export { default as QuestionManagement } from './components/QuestionManagement'
export { LogoUpload } from './components/LogoUpload'
export { default as UniversityApplicationForm } from './components/UniversityApplicationForm'

// Services
export { UniversityAdminService } from './services/universityAdminService'
export type {
  DashboardStats,
  RecentActivity,
  Faculty,
  Department,
  Teacher,
  Question,
  QuestionTemplate,
  Semester,
  CreateFacultyData,
  CreateDepartmentData,
  CreateTeacherData,
  CreateSemesterData
} from './services/universityAdminService'

// Hooks
export { useUniversityAdminStats } from './hooks/useUniversityAdminStats'
export { useFacultyManagement } from './hooks/useFacultyManagement'
export { useDepartmentManagement } from './hooks/useDepartmentManagement'
export { useTeacherManagement } from './hooks/useTeacherManagement'
export { useQuestionManagement } from './hooks/useQuestionManagement'
export { useSemesterManagement } from './hooks/useSemesterManagement'