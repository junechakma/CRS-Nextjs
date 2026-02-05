// Re-export all types
export * from './types'

// Re-export super admin queries
export {
  getDashboardStats,
  getUsers,
  getRecentUsers,
  getRecentActivity,
  getSuperAdminAnalytics,
  type DashboardStats,
  type SuperAdminAnalyticsData,
} from './super-admin'

// Re-export teacher queries
export {
  getTeacherDashboard,
  getTeacherDashboardStats,
  getQuestionTemplates,
  getTemplateStats,
  getBaseTemplate,
  getBaseTemplateStats,
  getTeacherAnalytics,
  type TeacherDashboardData,
  type TeacherAnalyticsData,
} from './teacher'
