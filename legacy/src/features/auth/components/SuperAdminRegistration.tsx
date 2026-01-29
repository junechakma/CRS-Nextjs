import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import { supabase } from '../../../lib/supabase'
import { validatePasswordStrength } from '../../../shared/utils/password'

interface SuperAdminFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SuperAdminRegistration() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState<SuperAdminFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: keyof SuperAdminFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return false
    }
    
    // Use bcrypt password validation
    const passwordValidation = validatePasswordStrength(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Check if maximum super admins already exist (limit: 2)
      const { data: existingSuperAdmins, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'super_admin')

      if (checkError) {
        console.error('Check error:', checkError)
        throw new Error('Failed to check existing super admins')
      }

      if (existingSuperAdmins && existingSuperAdmins.length >= 2) {
        setError('Maximum number of Super Admins (2) already exists in the system')
        setLoading(false)
        return
      }

      // Create super admin using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: 'super_admin'
          }
        }
      })

      if (authError) {
        console.error('Super admin creation error:', authError)
        if (authError.message.includes('already registered')) {
          setError('Email already registered')
        } else {
          throw authError
        }
        setLoading(false)
        return
      }

      if (!authData.user) {
        throw new Error('Failed to create super admin account')
      }

      console.log('Super admin created successfully:', authData.user.id)
      setSuccess(true)
      
    } catch (error: any) {
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Super Admin Created!
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              Your Super Admin account has been created successfully.
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Verify Your Email
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    We've sent a verification link to your email address.
                    Please check your inbox and click the link to verify your account before logging in.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              <p>Didn't receive the email? Check your spam folder.</p>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/login')} fullWidth>
                Go to Login
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <Shield className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create Super Admin
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Initialize the system with a Super Administrator account
          </p>
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">
              ⚠️ This page should be removed after initial setup for security
            </p>
          </div>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="admin@crsfeedback.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Strong password required"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                8+ chars, uppercase, lowercase, number, special character
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={!formData.name || !formData.email || !formData.password || !formData.confirmPassword}
              >
                Create Super Admin
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}