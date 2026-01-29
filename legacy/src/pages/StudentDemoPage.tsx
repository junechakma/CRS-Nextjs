import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Lock,
  Star,
  Send,
  CheckCircle,
  Play,
  Clock,
  User,
  BookOpen,
  MapPin,
  MessageCircle
} from 'lucide-react'
import Button from '../shared/components/ui/Button'

export default function StudentDemoPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [accessKey, setAccessKey] = useState('')
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [progress, setProgress] = useState(0)

  // Demo session data that matches the real structure
  const demoSession = {
    id: 'demo-session-123',
    course_code: 'CS2231',
    course_title: 'Object Oriented Programming',
    teacher_name: 'Jane Chakma JN',
    section: '6C',
    session_date: new Date().toISOString(),
    start_time: new Date().toISOString(),
    room_number: 'Room 01',
    questions: [
      {
        id: 'q1',
        text: "Rate the instructor's knowledge of the subject matter",
        type: 'rating',
        category: 'instructor',
        required: true,
        priority: 1,
        scale: 5
      },
      {
        id: 'q2',
        text: "Overall, how satisfied are you with this course?",
        type: 'rating',
        category: 'overall',
        required: true,
        priority: 2,
        scale: 5
      },
      {
        id: 'q3',
        text: "Rate the effectiveness of the teaching methods used",
        type: 'multiple_choice',
        category: 'teaching',
        required: true,
        priority: 3,
        options: ['Could be improved', 'Acceptable', 'Excellent', 'N/A']
      },
      {
        id: 'q4',
        text: "How engaging were the class sessions?",
        type: 'text',
        category: 'delivery',
        required: false,
        priority: 4
      }
    ]
  }

  useEffect(() => {
    // Calculate progress based on answered questions
    const totalQuestions = demoSession.questions.length
    const answeredQuestions = Object.keys(responses).length
    setProgress(totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0)
  }, [responses])

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const steps = [
    'Enter Session Key',
    'Provide Feedback',
    'Submit Response'
  ]

  const demoAccessKey = 'DEMO123A'

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Helper functions from FeedbackForm.tsx
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

  // Question rendering functions matching FeedbackForm.tsx
  const renderRatingQuestion = (question: any) => {
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
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${rating <= currentRating
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
          {scale >= 3 && <span className="hidden sm:inline">{Math.ceil(scale / 2)} - Good</span>}
          <span>{scale} - Excellent</span>
        </div>
      </div>
    )
  }

  const renderTextQuestion = (question: any) => {
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
        />
      </div>
    )
  }

  const renderMultipleChoiceQuestion = (question: any) => {
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
          {question.options?.map((option: string, index: number) => (
            <button
              key={index}
              type="button"
              onClick={() => handleResponseChange(question.id, option)}
              className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-colors text-sm sm:text-base relative ${currentValue === option
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex-shrink-0 ${currentValue === option
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

  const renderQuestion = (question: any) => {
    switch (question.type) {
      case 'rating':
        return renderRatingQuestion(question)
      case 'text':
        return renderTextQuestion(question)
      case 'multiple_choice':
        return renderMultipleChoiceQuestion(question)
      default:
        return null
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="text-center max-w-md mx-auto">
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Course Feedback</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter your session access key to provide anonymous feedback
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter 8-character access key"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                  maxLength={8}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your teacher will provide you with an 8-character access key
                </p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800 mb-2">
                  <strong>Demo Key:</strong> Try entering <code className="bg-yellow-200 px-2 py-1 rounded">DEMO123A</code>
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={accessKey !== demoAccessKey}
                className="w-full"
              >
                Access Session
              </Button>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-700 mb-2">How it works</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Your teacher will share an 8-character access key during class
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Enter the key above to access the feedback form
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Provide anonymous feedback about the course and teaching
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="min-h-screen bg-gray-50">
            {/* Header matching FeedbackForm.tsx */}
            <div className="bg-white shadow-sm border-b">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between py-3 sm:py-4">
                  <button
                    onClick={handlePrev}
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
                      <p className="font-medium text-gray-900 truncate">{demoSession.course_code}</p>
                      <p className="text-gray-500 truncate">{demoSession.course_title}</p>
                    </div>
                  </div>
                  <div className="flex items-start sm:items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{demoSession.teacher_name}</p>
                      <p className="text-gray-500 truncate">Section {demoSession.section}</p>
                    </div>
                  </div>
                  <div className="flex items-start sm:items-center space-x-2 sm:col-span-2 lg:col-span-1">
                    <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">
                        {formatDate(demoSession.session_date)} • {formatTime(demoSession.start_time)}
                      </p>
                      <p className="text-gray-500 truncate">{demoSession.room_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4 sm:space-y-6">
                {demoSession.questions
                  .sort((a, b) => a.priority - b.priority)
                  .map(renderQuestion)}

                <div className="flex justify-center sm:justify-end pt-4">
                  <button
                    onClick={handleNext}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
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

              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => {
                    setCurrentStep(0)
                    setAccessKey('')
                    setResponses({})
                  }}
                  variant="secondary"
                  className="w-full"
                >
                  Try Demo Again
                </Button>

                <Link to="/feedback">
                  <Button className="w-full">
                    Go to Real Feedback Portal
                  </Button>
                </Link>
              </div>

              <div className="mt-8 text-left bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-800 mb-3 text-center">Demo Features Shown</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    <span>Anonymous access with session keys</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-3 flex-shrink-0" />
                    <span>Star rating questions with live feedback</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-blue-500 mr-3 flex-shrink-0" />
                    <span>Multiple choice selection</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-purple-500 mr-3 flex-shrink-0" />
                    <span>Text feedback and comments</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-indigo-500 mr-3 flex-shrink-0" />
                    <span>Real-time progress tracking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              to="/"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <div className="flex-1 text-center text-2xl font-bold text-blue-600">
              Student Feedback Demo
            </div>
            {/* Spacer to balance the layout */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Interactive Student Feedback Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the complete student feedback flow from accessing a session to submitting anonymous responses
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center mx-8">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${index <= currentStep
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-gray-300 text-gray-400'
                    }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs mt-2 text-center ${index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                    }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStep()}
        </div>

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex justify-center mt-8 max-w-2xl mx-auto">
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handlePrev} className="mr-4">
                Previous
              </Button>
            )}
            {currentStep === 0 && accessKey === demoAccessKey && (
              <Button onClick={handleNext}>
                Next Step
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}