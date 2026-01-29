import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { University, Mail, Lock, User, Home } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import { AuthService } from '../services/authService'
import { EmailService } from '../../../services/emailService'
import { SuperAdminService } from '../../super-admin/services/superAdminService'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function UniversityAdminSimpleRegistration() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Full name is required')
      return false
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return false
    }

    const passwordValidation = AuthService.validatePassword(formData.password)
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
      // Create account using AuthService
      await AuthService.signUp(
        formData.email,
        formData.password,
        {
          name: formData.name,
          role: 'university_admin'
        }
      )

      // Send email notification to all super admins
      try {
        const superAdminEmails = await SuperAdminService.getSuperAdminEmails()
        if (superAdminEmails.length > 0 && EmailService.isConfigured()) {
          const notificationResult = await EmailService.sendUniversityApprovalNotificationToAll(
            superAdminEmails,
            'Pending Application', // University name not available yet
            formData.name.trim(),
            formData.email.toLowerCase().trim(),
            'N/A' // University code not available yet
          )

          console.log(`University admin registration notifications sent: ${notificationResult.successCount} successful, ${notificationResult.failureCount} failed out of ${superAdminEmails.length} super admins`)

          if (notificationResult.successCount > 0) {
            console.log('At least one super admin was notified of new registration')
          } else {
            console.warn('Failed to notify any super admins of new registration')
          }
        } else {
          console.warn('No super admin emails found or EmailJS not configured - notification not sent')
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError)
        // Don't throw error - registration should still succeed even if email fails
      }

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
            <University className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Account Created Successfully!
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              Your University Admin account has been created.
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
                    Please check your inbox and click the link to verify your account.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Next Step:</strong> After verifying your email, log in to submit your university application.
              </p>
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
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <University className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Step 1 of 2: Account Registration
            </p>
            <p className="mt-1 text-xs text-gray-500">
              After creating your account, you'll be able to submit your university application.
            </p>
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Important Notice for Teachers
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      <strong>Teachers cannot create university admin accounts.</strong> This registration is only for official university administrators who will manage the institution's account.
                    </p>
                    <p className="mt-2">
                      If you are a teacher, your university admin must create your account and assign you the appropriate role. Please contact your institution's administrator for access.
                    </p>
                  </div>
                </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="admin@university.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
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
                className="flex-1"
              >
                Create Account
              </Button>
            </div>
          </form>
        </Card>
        </div>
      </div>
    </div>
  )
}
