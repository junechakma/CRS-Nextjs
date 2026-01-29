
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import type { RootState, AppDispatch } from './store/store'
import { setUser, getCurrentUser } from './store/slices/authSlice'
import { EmailService } from './services/emailService'
import { useMaintenanceMode } from './shared/hooks/useMaintenanceMode'
import MaintenanceMode from './shared/components/MaintenanceMode'
import ScrollToTop from './shared/components/ScrollToTop'

// Pages
import LoginForm from './features/auth/components/LoginForm'
import AuthCallback from './features/auth/components/AuthCallback'
import UniversityAdminRegistration from './features/auth/components/UniversityAdminRegistration'
import UniversityAdminSimpleRegistration from './features/auth/components/UniversityAdminSimpleRegistration'
// import SuperAdminRegistration from './features/auth/components/SuperAdminRegistration'
import {
  SuperAdminDashboard,
  UniversitiesPage,
  UsersPage,
  ApprovalsPage,
  AnalyticsPage,
  SettingsPage,
  QuestionsPage
} from './features/super-admin'
import DashboardLayout from './shared/components/layout/DashboardLayout'
import { UniversityAdminGuard } from './shared/components/guards'
import { UniversityAdminDashboard, ApplicationPendingPage, QuestionsPage as UniversityQuestionsPage, QuestionManagement, DurationPage, UniversitySettingsPage, UniversityApplicationForm } from './features/university-admin'
import FacultyManagement from './features/university-admin/components/FacultyManagement'
import DepartmentManagement from './features/university-admin/components/DepartmentManagement'
import TeacherManagement from './features/university-admin/components/TeacherManagement'
import SemesterManagement from './features/university-admin/components/SemesterManagement'
import { FacultyAdminDashboard, DepartmentManagementPage, TeacherManagementPage } from './features/faculty-admin'
import { DepartmentModeratorDashboard, TeachersPage, CoursesPage as DeptCoursesPage } from './features/department-moderator'
import { TeacherDashboard, CoursesPage, ResponseSessionsPage, CourseSessionsPage, SessionAnalyticsPage, TeacherAnalyticsPage } from './features/teacher'
import CLOAnalyticsPage from './features/teacher/pages/CLOAnalyticsPage'
import { StudentFeedbackPage } from './features/student'
import HomePage from './pages/HomePage'
import TermsPage from './pages/TermsPage'
import PrivacyPage from './pages/PrivacyPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import UpdatePasswordPage from './pages/UpdatePasswordPage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import ManualDownloadPage from './pages/ManualDownloadPage'
import StudentDemoPage from './pages/StudentDemoPage'
import StudentReviewsPage from './pages/StudentReviewsPage'
import CLOMappingDemoPage from './pages/CLOMappingDemoPage'

// Loading component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Protected Route component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Unauthorized page
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
        <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
        <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}

export default function App() {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.auth)
  const { isMaintenanceMode, maintenanceSettings, loading: maintenanceLoading, refresh: refreshMaintenanceMode } = useMaintenanceMode()

  useEffect(() => {
    // Initialize EmailJS once
    EmailService.init();

    let isInitialCheck = true

    // Check for existing session in localStorage (custom auth)
    const checkSession = async () => {
      try {
        // First check custom auth
        const storedUser = localStorage.getItem('crs_auth_user')
        if (storedUser) {
          dispatch(getCurrentUser())
        } else {
          // Fallback to Supabase auth for existing sessions
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            dispatch(getCurrentUser())
          } else {
            dispatch(setUser(null))
          }
        }
      } catch (error) {
        console.error('Error checking session:', error)
        dispatch(setUser(null))
      }
    }

    // Check session only once on mount
    checkSession()

    // Listen for auth changes (mainly for Supabase auth compatibility)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignore initial event to prevent double-checking
      if (isInitialCheck) {
        isInitialCheck = false
        return
      }

      if (event === 'SIGNED_IN' && session?.user) {
        dispatch(getCurrentUser())
      } else if (event === 'SIGNED_OUT') {
        dispatch(setUser(null))
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  // Show loading screen while checking authentication and maintenance mode
  if (loading || maintenanceLoading) {
    return <LoadingScreen />
  }

  // Show maintenance mode for all users except super_admin accessing settings
  if (isMaintenanceMode) {
    // Allow super_admin to access login and settings to disable maintenance mode
    if (isAuthenticated && user?.role === 'super_admin') {
      // Super admin can access settings page to disable maintenance mode
      const currentPath = window.location.pathname
      if (currentPath === '/settings' || currentPath === '/login' || currentPath === '/dashboard') {
        // Allow access to these routes for super admin
      } else {
        return <MaintenanceMode settings={maintenanceSettings} onRefresh={refreshMaintenanceMode} />
      }
    } else {
      return <MaintenanceMode settings={maintenanceSettings} onRefresh={refreshMaintenanceMode} />
    }
  }

  return (
    <Router>
      <ScrollToTop />
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginForm />
              )
            }
          />

          <Route
            path="/register/university-admin"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <UniversityAdminSimpleRegistration />
              )
            }
          />

          {/* Legacy route - redirect to new flow */}
          <Route
            path="/register/university-admin/old"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <UniversityAdminRegistration />
              )
            }
          />

          {/* <Route 
            path="/register-superadmin" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SuperAdminRegistration />
              )
            } 
          /> */}

          {/* Password Reset Routes */}
          <Route
            path="/forgot-password"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <ForgotPasswordPage />
              )
            }
          />

          <Route
            path="/update-password"
            element={<UpdatePasswordPage />}
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Auth Callback for email verification */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Student Feedback - Public route */}
          <Route path="/feedback" element={<StudentFeedbackPage />} />

          {/* Additional Public Pages */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/manuals" element={<ManualDownloadPage />} />
          <Route path="/demo" element={<StudentDemoPage />} />
          <Route path="/student-reviews" element={<StudentReviewsPage />} />
          <Route path="/clo-demo" element={<CLOMappingDemoPage />} />


          {/* Dashboard route with role-based redirects */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'university_admin', 'faculty_admin', 'department_moderator', 'teacher']}>
                {user?.role === 'university_admin' ? (
                  // Redirect based on application status and university setup
                  (() => {
                    console.log('Dashboard redirect for university_admin:', {
                      university_id: user?.university_id,
                      approval_status: user?.approval_status,
                      status: user?.status
                    })

                    if (user?.university_id) {
                      console.log('→ Redirecting to: /university-admin/dashboard')
                      return <Navigate to="/university-admin/dashboard" replace />
                    } else if (user?.approval_status === 'approved') {
                      console.log('→ Redirecting to: /university-admin/apply')
                      return <Navigate to="/university-admin/apply" replace />
                    } else {
                      console.log('→ Redirecting to: /university-admin/pending')
                      return <Navigate to="/university-admin/pending" replace />
                    }
                  })()
                ) : user?.role === 'faculty_admin' ? (
                  <Navigate to="/faculty-admin/dashboard" replace />
                ) : user?.role === 'department_moderator' ? (
                  <Navigate to="/department-moderator/dashboard" replace />
                ) : (
                  <DashboardLayout>
                    {user?.role === 'super_admin' && <SuperAdminDashboard />}
                    {user?.role === 'teacher' && <TeacherDashboard />}
                  </DashboardLayout>
                )}
              </ProtectedRoute>
            }
          />

          {/* Super Admin only routes */}
          <Route
            path="/universities"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <UniversitiesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <ApprovalsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <AnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/questions"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <DashboardLayout>
                  <QuestionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* University Admin routes */}
          <Route
            path="/university-admin/apply"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityApplicationForm />
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/pending"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <ApplicationPendingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <UniversityAdminDashboard />
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/faculties"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <FacultyManagement />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/departments"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <DepartmentManagement />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/teachers"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <TeacherManagement />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/questions"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <QuestionManagement />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/semesters"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <SemesterManagement />
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/durations"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <DurationPage />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <div className="p-6"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/questions"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <UniversityQuestionsPage />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/settings"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <UniversitySettingsPage />
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/university-admin/sessions/:sessionId/analytics"
            element={
              <ProtectedRoute allowedRoles={['university_admin']}>
                <UniversityAdminGuard>
                  <DashboardLayout>
                    <SessionAnalyticsPage />
                  </DashboardLayout>
                </UniversityAdminGuard>
              </ProtectedRoute>
            }
          />

          {/* Faculty Admin routes */}
          <Route
            path="/faculty-admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <FacultyAdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-admin/department-management"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <DepartmentManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-admin/teacher-management"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <TeacherManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-admin/courses"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <div className="p-6"><h1 className="text-2xl font-bold">Faculty Courses - Coming Soon</h1></div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <div className="p-6"><h1 className="text-2xl font-bold">Faculty Analytics - Coming Soon</h1></div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/faculty-admin/sessions/:sessionId/analytics"
            element={
              <ProtectedRoute allowedRoles={['faculty_admin']}>
                <DashboardLayout>
                  <SessionAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Department Moderator routes */}
          <Route
            path="/department-moderator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['department_moderator']}>
                <DashboardLayout>
                  <DepartmentModeratorDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-moderator/teachers"
            element={
              <ProtectedRoute allowedRoles={['department_moderator']}>
                <DashboardLayout>
                  <TeachersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-moderator/courses"
            element={
              <ProtectedRoute allowedRoles={['department_moderator']}>
                <DashboardLayout>
                  <DeptCoursesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-moderator/analytics"
            element={
              <ProtectedRoute allowedRoles={['department_moderator']}>
                <DashboardLayout>
                  <div className="p-6"><h1 className="text-2xl font-bold">Department Analytics - Coming Soon</h1></div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/department-moderator/sessions/:sessionId/analytics"
            element={
              <ProtectedRoute allowedRoles={['department_moderator']}>
                <DashboardLayout>
                  <SessionAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Change Password Route - Available to all authenticated users */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'university_admin', 'faculty_admin', 'department_moderator', 'teacher', 'student']}>
                <ChangePasswordPage />
              </ProtectedRoute>
            }
          />

          {/* Teacher routes */}
          <Route
            path="/teacher/courses"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <CoursesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/sessions"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <ResponseSessionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/courses/:courseId/sessions"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <CourseSessionsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/sessions/:sessionId/analytics"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <SessionAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/analytics"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <DashboardLayout>
                  <TeacherAnalyticsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/clo-analytics"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <CLOAnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <HomePage />
              )
            }
          />

          {/* Catch all route */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found.</p>
                  <a href="/" className="text-blue-600 hover:text-blue-800">
                    Go Home
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}
