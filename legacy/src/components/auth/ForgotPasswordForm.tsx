import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '../../shared/components/ui'
import { PasswordResetService } from '../../services/passwordResetService'

interface ForgotPasswordFormProps {
  onBack?: () => void
  className?: string
}

export default function ForgotPasswordForm({ onBack, className = '' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!PasswordResetService.validateEmail(email.trim())) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)

    try {
      const result = await PasswordResetService.requestPasswordReset({
        email: email.trim()
      })

      if (result.success) {
        setIsSuccess(true)
        setError('')
      } else {
        setError(result.message)
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`w-full max-w-md mx-auto ${className}`}>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              If an account exists with the email <strong>{email}</strong>,
              you will receive a password reset link shortly.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Please check your email inbox (and spam folder) for the password reset link.
              Click the link in the email to set a new password.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSuccess(false)
                  setEmail('')
                  setError('')
                }}
                variant="secondary"
                className="w-full"
              >
                Send Another Reset Link
              </Button>
              {onBack ? (
                <Button
                  onClick={onBack}
                  variant="secondary"
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="secondary" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">
            Enter your email address and we'll send you a secure link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            Send Reset Link
          </Button>
        </form>

        <div className="mt-6">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </button>
          ) : (
            <Link 
              to="/login"
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}