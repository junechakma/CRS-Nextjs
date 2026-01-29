import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, University, Home } from 'lucide-react'
import type { RootState, AppDispatch } from '../../../store/store'
import { clearError } from '../../../store/slices/authSlice'
import { Button, Card } from '../../../shared/components/ui'
import { supabase } from '../../../lib/supabase'
import { validatePasswordStrength } from '../../../shared/utils/password'

interface RegisterFormProps {
  userType?: 'super_admin' | 'university_admin' | 'faculty_admin' | 'department_moderator' | 'teacher' | 'student'
  showUniversityFields?: boolean
}

export default function RegisterForm({ 
  userType = 'super_admin', 
  showUniversityFields = true 
}: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    universityName: '',
    universityCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(clearError())
    
    // Password validation
    if (formData.password !== formData.confirmPassword) {
      setRegistrationStatus('error')
      setStatusMessage('Passwords do not match!')
      return
    }

    // Use bcrypt password validation
    const passwordValidation = validatePasswordStrength(formData.password)
    if (!passwordValidation.isValid) {
      setRegistrationStatus('error')
      setStatusMessage(passwordValidation.message)
      return
    }

    try {
      if (userType === 'super_admin') {
        // Check if maximum super admins already exist (limit: 2)
        const { data: existingSuperAdmins, error: superAdminCheckError } = await supabase
          .from('users')
          .select('id')
          .eq('role', 'super_admin')

        if (superAdminCheckError) {
          throw new Error('Failed to check existing super admins')
        }

        if (existingSuperAdmins && existingSuperAdmins.length >= 2) {
          setRegistrationStatus('error')
          setStatusMessage('Maximum number of Super Admins (2) already exists in the system')
          return
        }
      }

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: userType,
            // For super_admin, include university info if provided
            ...(userType === 'super_admin' && formData.universityName && {
              university_name: formData.universityName.trim(),
              university_code: formData.universityCode.trim().toUpperCase()
            })
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setRegistrationStatus('error')
          setStatusMessage('Email already registered')
          return
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      setRegistrationStatus('success')
      if (userType === 'super_admin') {
        setStatusMessage('Super Admin account created successfully! You can now login.')
      } else {
        setStatusMessage(`${userType.replace('_', ' ')} account created successfully! Your application is pending approval.`)
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      setRegistrationStatus('error')
      setStatusMessage(error.message || 'Registration failed')
    }
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
            Create {userType === 'super_admin' ? 'Super Admin' : 'User'} Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {userType === 'super_admin' ? 'Temporary registration for system setup' : 'Register for CRS System'}
          </p>
          {userType === 'super_admin' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs text-yellow-700">
                ⚠️ This is a temporary registration form for initial setup. Remove this after creating your admin account.
              </p>
            </div>
          )}
        </div>

        <Card>
          {registrationStatus === 'success' ? (
            <div className="text-center py-8">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">
                {statusMessage}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Verify Your Email
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      We've sent a verification link to your email. Please check your inbox and verify your account before logging in.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                to="/login"
                className="inline-block mt-6 text-blue-600 hover:text-blue-800 font-medium"
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {registrationStatus === 'error' && statusMessage && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {statusMessage}
                </div>
              )}

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder={userType === 'super_admin' ? 'admin@youruni.edu' : 'your.email@university.edu'}
                />
              </div>
            </div>

            {/* University Fields (for super admin) */}
            {showUniversityFields && userType === 'super_admin' && (
              <>
                <div>
                  <label htmlFor="universityName" className="block text-sm font-medium text-gray-700 mb-1">
                    University Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <University className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="universityName"
                      name="universityName"
                      type="text"
                      required
                      value={formData.universityName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your University Name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="universityCode" className="block text-sm font-medium text-gray-700 mb-1">
                    University Code
                  </label>
                  <input
                    id="universityCode"
                    name="universityCode"
                    type="text"
                    required
                    maxLength={10}
                    value={formData.universityCode}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="UNI (Max 10 chars)"
                  />
                </div>
              </>
            )}

            {/* Password */}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth

            >
              Create {userType === 'super_admin' ? 'Super Admin' : 'User'} Account
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Already have an account? Sign in
              </Link>
            </div>
            </form>
          )}
        </Card>
        </div>
      </div>
    </div>
  )
}