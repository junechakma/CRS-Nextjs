import React, { useState, useEffect } from 'react'
import { 
  Star, 
  Send, 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  BookOpen,
  MapPin
} from 'lucide-react'
import { StudentService } from '../services/studentService'
import type { SessionAccessData, Question } from '../services/studentService'

interface FeedbackFormProps {
  session: SessionAccessData
  studentId: string
  onBack: () => void
  onSubmit: () => void
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ session, studentId, onBack, onSubmit }) => {
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [startTime] = useState(new Date())
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Calculate progress based on answered questions
    const totalQuestions = session.questions.length
    const answeredQuestions = Object.keys(responses).length
    setProgress(totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0)
  }, [responses, session.questions.length])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const validateResponses = (): boolean => {
    const requiredQuestions = session.questions.filter(q => q.required)
    const missingResponses = requiredQuestions.filter(q => 
      !responses[q.id] || responses[q.id] === '' || responses[q.id] === null
    )
    
    if (missingResponses.length > 0) {
      setError(`Please answer all required questions (${missingResponses.length} remaining)`)
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateResponses()) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const endTime = new Date()
      const completionTime = Math.round((endTime.getTime() - startTime.getTime()) / 1000)

      const metadata = {
        ip_address: await StudentService.getClientIP(),
        user_agent: navigator.userAgent,
        browser_fingerprint: StudentService.generateBrowserFingerprint(),
        start_time: startTime.toISOString(),
        completion_time_seconds: completionTime,
        device_type: StudentService.getDeviceType()
      }

      const result = await StudentService.submitResponse({
        session_id: session.id,
        student_anonymous_id: studentId,
        response_data: responses,
        metadata
      })

      if (!result.success) {
        setError(result.error || 'Failed to submit feedback')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        onSubmit()
      }, 2000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
      setError('An error occurred while submitting your feedback. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getRatingLabel = (rating: number, scale: number = 5): string => {
    const percentage = (rating / scale) * 100
    
    if (rating === 0) return 'Not rated'
    if (percentage <= 20) return 'Poor'
    if (percentage <= 40) return 'Fair'
    if (percentage <= 60) return 'Good'
    if (percentage <= 80) return 'Very Good'
    return 'Excellent'
  }

  const getRatingColor = (rating: number, scale: number = 5): string => {
    const percentage = (rating / scale) * 100
    
    if (percentage <= 20) return 'text-red-600'
    if (percentage <= 40) return 'text-orange-600'
    if (percentage <= 60) return 'text-yellow-600'
    if (percentage <= 80) return 'text-blue-600'
    return 'text-green-600'
  }

  const renderRatingQuestion = (question: Question) => {
    const scale = question.scale || 5
    const currentRating = responses[question.id] || 0
    const ratingLabel = getRatingLabel(currentRating, scale)
    const ratingColor = getRatingColor(currentRating, scale)

    return (
      <div key={question.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{question.category}</p>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap mb-3">
          {Array.from({ length: scale }, (_, i) => i + 1).map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => handleResponseChange(question.id, rating)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                rating <= currentRating
                  ? 'text-yellow-400 bg-yellow-50'
                  : 'text-gray-300 hover:text-yellow-300 hover:bg-gray-50'
              }`}
              title={getRatingLabel(rating, scale)}
            >
              <Star 
                className="h-5 w-5 sm:h-6 sm:w-6" 
                fill={rating <= currentRating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </div>

        {/* Current Rating Display */}
        <div className="mb-3 text-center">
          <span className={`text-sm sm:text-base font-medium ${ratingColor}`}>
            {currentRating > 0 ? `${ratingLabel} (${currentRating}/${scale})` : 'No rating selected'}
          </span>
        </div>
        
        {/* Scale Labels */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>1 - Poor</span>
          {scale >= 3 && <span className="hidden sm:inline">{Math.ceil(scale/2)} - Good</span>}
          <span>{scale} - Excellent</span>
        </div>
      </div>
    )
  }

  const renderTextQuestion = (question: Question) => {
    return (
      <div key={question.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="mb-3 sm:mb-4">
          <label htmlFor={question.id} className="block text-base sm:text-lg font-medium text-gray-900 mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{question.category}</p>
        </div>
        
        <textarea
          id={question.id}
          value={responses[question.id] || ''}
          onChange={(e) => handleResponseChange(question.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
          rows={3}
          placeholder="Share your thoughts..."
          required={question.required}
        />
      </div>
    )
  }

  const renderYesNoQuestion = (question: Question) => {
    const currentValue = responses[question.id]

    return (
      <div key={question.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{question.category}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'yes')}
            className={`px-4 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base ${
              currentValue === 'yes'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleResponseChange(question.id, 'no')}
            className={`px-4 py-2.5 sm:py-2 rounded-lg border transition-colors text-sm sm:text-base ${
              currentValue === 'no'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            No
          </button>
        </div>
      </div>
    )
  }

  const renderMultipleChoiceQuestion = (question: Question) => {
    const currentValue = responses[question.id]

    return (
      <div key={question.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{question.category}</p>
          <p className="text-xs sm:text-sm text-blue-600 mt-1">Select one option:</p>
        </div>
        
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResponseChange(question.id, option)}
              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base relative ${
                currentValue === option
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${
                  currentValue === option
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300'
                }`}>
                  {currentValue === option && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <span className="flex-1">{option}</span>
                {currentValue === option && (
                  <div className="text-blue-600 text-xs font-medium ml-2">Selected</div>
                )}
              </div>
            </button>
          )) || []}
        </div>

        {/* Current Selection Display */}
        {currentValue && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700">
              <span className="font-medium">Selected:</span> {currentValue}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'rating':
        return renderRatingQuestion(question)
      case 'text':
        return renderTextQuestion(question)
      case 'yes_no':
        return renderYesNoQuestion(question)
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question)
      default:
        return null
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-gray-900">
            Thank You!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 px-2">
            Your feedback has been submitted successfully. Your anonymous responses will help improve the course.
          </p>
        </div>
      </div>
    )
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Back</span>
            </button>
            
            <div className="text-center flex-1 mx-2 sm:mx-4">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">Course Feedback</h1>
              <p className="text-xs sm:text-sm text-gray-500">Anonymous Response</p>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{Math.round(progress)}% Complete</span>
              <span className="sm:hidden">{Math.round(progress)}%</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-start sm:items-center space-x-2">
              <BookOpen className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{session.course_code}</p>
                <p className="text-gray-500 truncate">{session.course_title}</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center space-x-2">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{session.teacher_name}</p>
                <p className="text-gray-500 truncate">Section {session.section}</p>
              </div>
            </div>
            <div className="flex items-start sm:items-center space-x-2 sm:col-span-2 lg:col-span-1">
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900">
                  {formatDate(session.session_date)} • {formatTime(session.start_time)}
                </p>
                <p className="text-gray-500 truncate">{session.room_number || 'Room TBA'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {session.questions
            .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
            .map(renderQuestion)}

          {error && (
            <div className="rounded-md bg-red-50 p-3 sm:p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <h3 className="text-xs sm:text-sm font-medium text-red-800">
                    Submission Error
                  </h3>
                  <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-center sm:justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Send className="h-4 w-4" />
              <span>{loading ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default FeedbackForm