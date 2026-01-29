import React, { useState } from 'react'
import { Lock, ArrowRight, AlertCircle, Clock, User, ArrowLeft, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StudentService } from '../services/studentService'
import type { SessionAccessData } from '../services/studentService'

interface SessionAccessProps {
  onSessionAccess: (session: SessionAccessData, studentId: string) => void
}

const SessionAccess: React.FC<SessionAccessProps> = ({ onSessionAccess }) => {
  const [anonymousKey, setAnonymousKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!anonymousKey.trim()) {
      setError('Please enter your session access key')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await StudentService.getSessionByAnonymousKey(anonymousKey.trim())
      
      if (!result.success) {
        setError(result.error || 'Failed to access session')
        return
      }

      if (!result.session) {
        setError('Session not found')
        return
      }

      // Generate or retrieve anonymous student ID
      const studentId = StudentService.generateAnonymousId()

      // Check if student has already responded (only by student ID, no IP/fingerprint check)
      const existingResponse = await StudentService.checkExistingResponse(
        result.session.id,
        studentId
      )

      if (existingResponse.exists) {
        setError('You have already submitted feedback for this session.')
        return
      }

      onSessionAccess(result.session, studentId)
    } catch (error) {
      console.error('Error accessing session:', error)
      setError('An error occurred while accessing the session. Please try again.')
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Back to Homepage Button */}
      <div className="max-w-7xl mx-auto mb-6 sm:mb-8">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <Home className="w-4 h-4 mr-2" />
          Back to Homepage
        </Link>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Course Feedback
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 px-2">
            Enter your session access key to provide anonymous feedback
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="anonymous-key" className="sr-only">
              Session Access Key
            </label>
            <div className="relative">
              <input
                id="anonymous-key"
                name="anonymous-key"
                type="text"
                value={anonymousKey}
                onChange={(e) => setAnonymousKey(e.target.value.toUpperCase())}
                className="appearance-none relative block w-full px-3 py-2.5 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-center text-base sm:text-lg font-mono tracking-wider"
                placeholder="Enter 8-character access key"
                maxLength={8}
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-500 text-center px-2">
              Your teacher will provide you with an 8-character access key
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4 mx-2 sm:mx-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">
                    Access Error
                  </h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !anonymousKey.trim()}
              className="group relative w-full flex justify-center py-2.5 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 group-hover:text-blue-400" />
              </span>
              {loading ? 'Accessing Session...' : 'Access Session'}
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 bg-white rounded-lg p-4 sm:p-6 shadow-sm mx-2 sm:mx-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
            How it works
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Your teacher will share an 8-character access key during class
              </p>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Enter the key above to access the feedback form
              </p>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-600">
                Provide anonymous feedback about the course and teaching
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>Anonymous</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>Quick</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}

export default SessionAccess