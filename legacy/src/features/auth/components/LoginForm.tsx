import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Home } from 'lucide-react'
import type { RootState, AppDispatch } from '../../../store/store'
import { signIn, clearError } from '../../../store/slices/authSlice'
import { Button, Card } from '../../../shared/components/ui'

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    console.log('LoginForm: Redirecting authenticated user', { user, isAuthenticated })
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())

    try {
      const result = await dispatch(signIn(formData)).unwrap()
      console.log('Login successful:', result)
      console.log('Auth state after login:', { isAuthenticated, user })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <Home className="h-4 w-4" />
          Back to Homepage
        </Link>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to CRS System
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Course Response System
            </p>
          </div>

        <Card className="max-w-md mx-auto">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              loading={loading}
              disabled={!formData.email || !formData.password}
            >
              Sign In
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="text-center space-y-2">
              <Link
                to="/feedback"
                className="text-sm text-green-600 hover:text-green-800 block font-medium"
              >
                🎓 Student Feedback Portal
              </Link>
              <Link
                to="/register/university-admin"
                className="text-sm text-blue-600 hover:text-blue-800 block"
              >
                Apply as University Administrator
              </Link>
              {/* <Link
                to="/register-superadmin"
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Create Super Admin Account
              </Link> */}
            </div>
          </form>
        </Card>
        </div>
      </div>
    </div>
  )
}