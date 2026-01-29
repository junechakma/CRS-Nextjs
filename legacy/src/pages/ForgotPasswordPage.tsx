import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm'
import type { RootState } from '../store/store'

export default function ForgotPasswordPage() {
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    // If user is already logged in, redirect to their dashboard
    if (!loading && user) {
      const redirectPath = getRoleBasedRedirect(user.role)
      navigate(redirectPath, { replace: true })
    }
  }, [user, loading, navigate])

  const getRoleBasedRedirect = (role: string): string => {
    switch (role) {
      case 'super_admin':
        return '/super-admin'
      case 'university_admin':
        return '/university-admin'
      case 'faculty_admin':
        return '/faculty-admin'
      case 'department_admin':
        return '/department-admin'
      case 'teacher':
        return '/teacher'
      case 'student':
        return '/student'
      default:
        return '/login'
    }
  }

  const handleBackToLogin = () => {
    navigate('/login')
  }

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  // Don't render if user is logged in (will redirect)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Course Response System
          </h1>
          <p className="text-gray-600">
            Password Recovery
          </p>
        </div>
      </div>

      <div className="mt-8">
        <ForgotPasswordForm 
          onBack={handleBackToLogin}
          className="sm:mx-auto sm:w-full sm:max-w-md"
        />
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{' '}
          <button
            onClick={handleBackToLogin}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  )
}