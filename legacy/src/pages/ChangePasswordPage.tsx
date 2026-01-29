import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock, Shield, User } from 'lucide-react'
import { Button } from '../shared/components/ui'
import { PasswordResetService } from '../services/passwordResetService'
import DashboardLayout from '../shared/components/layout/DashboardLayout'
import type { RootState } from '../store/store'

interface PasswordStrengthIndicatorProps {
  password: string
}

function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
  const validation = PasswordResetService.validatePasswordStrength(password)
  
  if (!password) return null

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'strong': return 'bg-green-400'
      default: return 'bg-gray-300'
    }
  }

  const getStrengthWidth = (strength: string) => {
    switch (strength) {
      case 'weak': return 'w-1/3'
      case 'medium': return 'w-2/3'
      case 'strong': return 'w-full'
      default: return 'w-0'
    }
  }

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-gray-600">Password strength:</span>
        <span className={`font-medium ${
          validation.strength === 'strong' ? 'text-green-600' :
          validation.strength === 'medium' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {validation.strength.charAt(0).toUpperCase() + validation.strength.slice(1)}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(validation.strength)} ${getStrengthWidth(validation.strength)}`}
        />
      </div>
      {validation.errors.length > 0 && (
        <ul className="mt-2 text-xs text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index} className="flex items-center">
              <span className="w-1 h-1 bg-red-400 rounded-full mr-2 flex-shrink-0 mt-1.5" />
              {error}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ChangePasswordPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    const validation = PasswordResetService.validatePasswordStrength(newPassword)
    if (!validation.isValid) {
      setError('Please fix the password requirements shown above')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsLoading(true)

    try {
      const result = await PasswordResetService.changePassword({
        userId: user.id,
        currentPassword,
        newPassword,
        ipAddress: undefined,
        userAgent: navigator.userAgent || 'Unknown'
      })

      if (result.success) {
        setIsSuccess(true)
        // Redirect back to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard')
        }, 3000)
      } else {
        setError(result.message)
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  // Success state
  if (isSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100 mb-4 sm:mb-6">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Password Changed Successfully
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Your password has been updated successfully. You can continue using your account with the new password.
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mb-6 sm:mb-8">
                Redirecting to dashboard in a few seconds...
              </p>
              <Button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Continue to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          {/* <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button> */}
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-100 mb-3 sm:mb-0 sm:mr-4 self-start sm:self-center">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Change Password</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Update your account password for better security</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <div className="flex items-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-3 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{user.name}</p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{user.email}</p>
                <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full mt-1">
                  {user.role.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Form */}
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 sm:p-4">
                <div className="flex">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm text-red-700">{error}</div>
                </div>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
              <div className="flex">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-medium text-blue-900 mb-2">Password Security Tips</h4>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                    <li>• Use a unique password that you haven't used elsewhere</li>
                    <li>• Include a mix of letters, numbers, and special characters</li>
                    <li>• Make it at least 8 characters long</li>
                    <li>• Avoid using personal information like names or dates</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end pt-4 sm:pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleGoBack}
                disabled={isLoading}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || 
                  !currentPassword || 
                  !newPassword || 
                  !confirmPassword || 
                  newPassword !== confirmPassword ||
                  currentPassword === newPassword
                }
                loading={isLoading}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Change Password
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}