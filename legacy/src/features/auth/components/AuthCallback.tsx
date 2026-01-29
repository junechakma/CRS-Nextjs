import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { AuthCallbackService } from '../services/authCallbackService'
import { setUser } from '../../../store/slices/authSlice'
import type { AppDispatch } from '../../../store/store'
import { Card } from '../../../shared/components/ui'

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    handleEmailConfirmation()
  }, [])

  const handleEmailConfirmation = async () => {
    try {
      const result = await AuthCallbackService.handleEmailConfirmation()
      
      if (result.success && result.user) {
        setStatus('success')
        setMessage('Email confirmed successfully! Redirecting to dashboard...')
        
        // Update auth state
        dispatch(setUser(result.user))
        
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 2000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Failed to confirm email')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An unexpected error occurred during email confirmation')
      console.error('Email confirmation error:', error)
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-500" />
      case 'error':
        return <XCircle className="w-12 h-12 text-red-500" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            
            <h2 className={`text-xl font-semibold ${getStatusColor()}`}>
              {status === 'loading' && 'Confirming Email...'}
              {status === 'success' && 'Email Confirmed!'}
              {status === 'error' && 'Confirmation Failed'}
            </h2>
            
            <p className="text-gray-600 text-sm">
              {message}
            </p>

            {status === 'error' && (
              <div className="pt-4">
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}