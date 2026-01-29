import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Clock, 
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  Eye,
  Filter
} from 'lucide-react'
import { Card } from '../shared/components/ui'

interface SessionAnalytics {
  session: {
    id: string
    course_code: string
    course_title: string
    section: string
    session_date: string
    status: string
    room_number: string
    start_time: string
    end_time: string
    duration_minutes: number
    questions: Array<{
      id: string
      text: string
      type: string
      category: string
      scale?: number
      options?: string[]
      required: boolean
    }>
  }
  responses: Array<{
    id: string
    response_data: Record<string, any>
    created_at: string
  }>
  totalResponses: number
  averageRating: number
  categoryRatings: Record<string, number>
  responseDistribution: Record<string, number>
  completionRate: number
  averageTime: number
  questionAnalytics: {
    questionId: string
    questionText: string
    questionType: string
    category: string
    responses: any[]
    averageRating?: number
    distribution?: Record<string, number>
  }[]
}

const StudentReviewsPage: React.FC = () => {
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  // Demo data following exact SessionAnalyticsPage format
  const demoAnalyticsData: SessionAnalytics = {
    session: {
      id: '1',
      course_code: 'CSE401',
      course_title: 'Software Engineering',
      section: 'A',
      session_date: '2024-01-15',
      status: 'completed',
      room_number: '301',
      start_time: '2024-01-15T14:00:00Z',
      end_time: '2024-01-15T15:30:00Z',
      duration_minutes: 90,
      questions: [
        {
          id: 'q1',
          text: 'Rate the instructor\'s teaching effectiveness',
          type: 'rating',
          category: 'instructor',
          scale: 5,
          required: true
        },
        {
          id: 'q2',
          text: 'How clear was the content delivery?',
          type: 'rating',
          category: 'delivery',
          scale: 5,
          required: true
        },
        {
          id: 'q3',
          text: 'Rate the overall course content quality',
          type: 'rating',
          category: 'content',
          scale: 5,
          required: true
        },
        {
          id: 'q4',
          text: 'How would you rate the assessment methods?',
          type: 'rating',
          category: 'assessment',
          scale: 5,
          required: true
        },
        {
          id: 'q5',
          text: 'What did you like most about this session?',
          type: 'text',
          category: 'overall',
          required: false
        },
        {
          id: 'q6',
          text: 'Any suggestions for improvement?',
          type: 'text',
          category: 'overall',
          required: false
        },
        {
          id: 'q7',
          text: 'Would you recommend this course to others?',
          type: 'yes_no',
          category: 'overall',
          required: true
        }
      ]
    },
    responses: [
      {
        id: 'r1',
        response_data: {
          'q1': 5,
          'q2': 4,
          'q3': 5,
          'q4': 4,
          'q5': 'Excellent session! The concepts were explained very clearly and the examples were helpful.',
          'q6': 'Maybe add more interactive exercises.',
          'q7': 'yes'
        },
        created_at: '2024-01-15T14:30:00Z'
      },
      {
        id: 'r2',
        response_data: {
          'q1': 4,
          'q2': 5,
          'q3': 4,
          'q4': 3,
          'q5': 'Good session overall. The pace was perfect for me.',
          'q6': 'Would like more time for Q&A at the end.',
          'q7': 'yes'
        },
        created_at: '2024-01-15T14:35:00Z'
      },
      {
        id: 'r3',
        response_data: {
          'q1': 3,
          'q2': 3,
          'q3': 3,
          'q4': 2,
          'q5': 'The content was good but felt a bit rushed.',
          'q6': 'Slow down the pace a bit and allow more questions during the session.',
          'q7': 'no'
        },
        created_at: '2024-01-15T14:32:00Z'
      },
      {
        id: 'r4',
        response_data: {
          'q1': 5,
          'q2': 5,
          'q3': 5,
          'q4': 5,
          'q5': 'Amazing session! Very engaging and informative.',
          'q6': 'Nothing major, maybe provide slides beforehand.',
          'q7': 'yes'
        },
        created_at: '2024-01-15T14:40:00Z'
      },
      {
        id: 'r5',
        response_data: {
          'q1': 4,
          'q2': 3,
          'q3': 4,
          'q4': 4,
          'q5': 'Well-structured session with good content coverage.',
          'q6': 'Some concepts could be explained with more detail.',
          'q7': 'yes'
        },
        created_at: '2024-01-15T14:25:00Z'
      }
    ],
    totalResponses: 5,
    averageRating: 4.2,
    categoryRatings: {
      'instructor': 4.2,
      'delivery': 4.0,
      'content': 4.2,
      'assessment': 3.6
    },
    responseDistribution: {
      '5': 2,
      '4': 2, 
      '3': 1
    },
    completionRate: 100,
    averageTime: 8.5,
    questionAnalytics: []
  }

  useEffect(() => {
    // Always load demo data since this is a demo page
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // Process question analytics like in SessionAnalyticsPage
      const questionAnalytics = (demoAnalyticsData.session.questions || []).map(question => {
        const questionResponses = demoAnalyticsData.responses
          .map(response => response.response_data[question.id])
          .filter(value => value !== undefined && value !== null)

        let averageRating: number | undefined
        let distribution: Record<string, number> | undefined

        if (question.type === 'rating') {
          const ratings = questionResponses.filter(r => typeof r === 'number')
          averageRating = ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0

          distribution = {}
          for (let i = 1; i <= (question.scale || 5); i++) {
            distribution[i.toString()] = ratings.filter(r => r === i).length
          }
        } else if (question.type === 'yes_no') {
          distribution = {
            'Yes': questionResponses.filter(r => r === 'yes' || r === true).length,
            'No': questionResponses.filter(r => r === 'no' || r === false).length
          }
        } else if (question.type === 'multiple_choice') {
          distribution = {}
          questionResponses.forEach(response => {
            if (typeof response === 'string') {
              if (distribution) {
                distribution[response] = (distribution[response] || 0) + 1
              }
            }
          })
        }

        return {
          questionId: question.id,
          questionText: question.text,
          questionType: question.type,
          category: question.category,
          responses: questionResponses,
          averageRating,
          distribution
        }
      })

      setAnalytics({
        ...demoAnalyticsData,
        questionAnalytics
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  // const handleBack = () => {
  //   navigate('/')
  // }


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredQuestions = selectedCategory 
    ? analytics?.questionAnalytics.filter(q => q.category === selectedCategory) || []
    : analytics?.questionAnalytics || []

  const categories = Array.from(new Set(analytics?.questionAnalytics.map(q => q.category) || []))

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Session not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
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
            
            <div className="flex-1 min-w-0 text-center">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Session Analytics</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Demo Analytics Dashboard</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {analytics.session.course_code} - {analytics.session.course_title} (Section {analytics.session.section})
                </p>
              </div>

            {/* Spacer to balance the layout */}
            <div className="w-[120px]"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Session Info */}
        <Card className="mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{formatDate(analytics.session.session_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-medium">
                  {analytics.session.status === 'pending' 
                    ? `${analytics.session.duration_minutes} min` 
                    : `${formatTime(analytics.session.start_time)} - ${formatTime(analytics.session.end_time)}`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(analytics.session.status)}`}>
                  {analytics.session.status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Room</p>
                <p className="font-medium">{analytics.session.room_number || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalResponses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.completionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.averageTime.toFixed(1)}min</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Category Filter */}
        <Card className="p-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">
              Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Question Analytics */}
        <div className="space-y-6 sm:space-y-8">
          {filteredQuestions.map((question, index) => (
            <Card key={question.questionId} className="p-4 sm:p-6">
              <div className="mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">
                      Question {index + 1}: {question.questionText}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <span className="bg-gray-100 px-2 py-1 rounded">
                        {question.category.charAt(0).toUpperCase() + question.category.slice(1)}
                      </span>
                      <span>{question.questionType.replace('_', ' ')}</span>
                      <span>{question.responses.length} responses</span>
                    </div>
                  </div>
                  {question.averageRating && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {question.averageRating.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600">avg rating</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts based on question type */}
              {question.questionType === 'rating' && question.distribution && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(question.distribution).map(([rating, count]) => (
                        <div key={rating} className="flex items-center space-x-3">
                          <div className="w-8 text-sm text-gray-600">{rating}⭐</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ 
                                width: `${question.responses.length > 0 ? (count / question.responses.length) * 100 : 0}%`,
                                minWidth: count > 0 ? '20px' : '0px'
                              }}
                            >
                              {count > 0 && (
                                <span className="text-xs text-white font-medium">{count}</span>
                              )}
                            </div>
                          </div>
                          <div className="w-8 text-sm text-gray-600 text-right">
                            {question.responses.length > 0 ? Math.round((count / question.responses.length) * 100) : 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Stars */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Rating Breakdown</h4>
                    <div className="space-y-3">
                      {Array.from({ length: 5 }, (_, i) => 5 - i).map(rating => {
                        const count = question.distribution?.[rating.toString()] || 0
                        const percentage = question.responses.length > 0 ? (count / question.responses.length) * 100 : 0
                        return (
                          <div key={rating} className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              {Array.from({ length: rating }, (_, i) => (
                                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <div className="flex-1 text-sm text-gray-600">
                              {count} response{count !== 1 ? 's' : ''} ({percentage.toFixed(0)}%)
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {question.questionType === 'yes_no' && question.distribution && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Response Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(question.distribution).map(([answer, count]) => (
                        <div key={answer} className="flex items-center space-x-3">
                          <div className="w-12 text-sm text-gray-600">{answer}</div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6">
                            <div
                              className={`h-6 rounded-full flex items-center justify-end pr-2 ${
                                answer === 'Yes' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              style={{ 
                                width: `${question.responses.length > 0 ? (count / question.responses.length) * 100 : 0}%`,
                                minWidth: count > 0 ? '20px' : '0px'
                              }}
                            >
                              {count > 0 && (
                                <span className="text-xs text-white font-medium">{count}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {question.questionType === 'text' && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Text Responses</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {question.responses.length > 0 ? (
                      question.responses.map((response, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded border">
                          <p className="text-sm text-gray-700">{response}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No text responses</p>
                    )}
                  </div>
                </div>
              )}

              {question.questionType === 'multiple_choice' && question.distribution && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Choice Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(question.distribution).map(([choice, count]) => (
                      <div key={choice} className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-gray-600 truncate">{choice}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-6">
                          <div
                            className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ 
                              width: `${question.responses.length > 0 ? (count / question.responses.length) * 100 : 0}%`,
                              minWidth: count > 0 ? '20px' : '0px'
                            }}
                          >
                            {count > 0 && (
                              <span className="text-xs text-white font-medium">{count}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-8 text-sm text-gray-600 text-right">
                          {question.responses.length > 0 ? Math.round((count / question.responses.length) * 100) : 0}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StudentReviewsPage