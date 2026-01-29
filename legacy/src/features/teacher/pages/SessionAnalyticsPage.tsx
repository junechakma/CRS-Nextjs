import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  Eye,
  Filter,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button, Card } from '../../../shared/components/ui'
import { TeacherService } from '../services/teacherService'
import type { ResponseSession, SessionResponse } from '../services/teacherService'
import { aiAnalyticsService, type AIInsight, type SessionData } from '../services/aiAnalyticsService'

interface SessionAnalytics {
  session: ResponseSession
  responses: SessionResponse[]
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

const SessionAnalyticsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [aiInsights, setAiInsights] = useState<AIInsight | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadAnalytics()
    }
  }, [sessionId])

  const loadAnalytics = async () => {
    if (!sessionId) return

    try {
      setLoading(true)
      
      // Get session data and responses
      const [session, responsesData, analyticsData] = await Promise.all([
        TeacherService.getResponseSession(sessionId),
        TeacherService.getSessionResponses(sessionId),
        TeacherService.getSessionAnalytics(sessionId)
      ])

      if (!session) {
        throw new Error('Session not found')
      }

      // Process question analytics
      const questionAnalytics = (session.questions || []).map(question => {
        const questionResponses = responsesData
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
        session,
        responses: responsesData,
        totalResponses: analyticsData.totalResponses,
        averageRating: analyticsData.averageRating,
        categoryRatings: analyticsData.categoryRatings,
        responseDistribution: analyticsData.responseDistribution,
        completionRate: analyticsData.completionRate,
        averageTime: (analyticsData as any).averageTime || 0,
        questionAnalytics
      })

    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Navigate back with state to preserve context
    navigate(-1)
  }

  const generateAIInsights = async () => {
    if (!analytics) return

    try {
      setLoadingAI(true)
      setAiError(null)

      // Prepare session data for AI analysis
      const sessionData: SessionData = {
        sessionInfo: {
          courseCode: analytics.session.course_code,
          courseTitle: analytics.session.course_title,
          section: analytics.session.section,
          date: formatDate(analytics.session.session_date),
          totalResponses: analytics.totalResponses,
          averageRating: analytics.averageRating,
          completionRate: analytics.completionRate
        },
        questions: analytics.questionAnalytics.map(q => ({
          questionText: q.questionText,
          category: q.category,
          type: q.questionType,
          responses: q.responses,
          averageRating: q.averageRating,
          distribution: q.distribution
        }))
      }

      const insights = await aiAnalyticsService.analyzeSessionData(sessionData)
      setAiInsights(insights)
    } catch (error) {
      console.error('Error generating AI insights:', error)
      setAiError('Failed to generate AI insights. Please try again.')
    } finally {
      setLoadingAI(false)
    }
  }


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
            onClick={() => navigate('/teacher/sessions')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Back to Sessions
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
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={handleBack}
                className="flex items-center space-x-2 px-3 py-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Session Analytics</h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Welcome back, {user?.name}</p>
                <p className="text-xs sm:text-sm text-gray-500 truncate">
                  {analytics.session.course_code} - {analytics.session.course_title} (Section {analytics.session.section})
                </p>
              </div>

            </div>
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

        {/* AI Insights Section */}
        <Card className="p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h2>
            </div>
            {!aiInsights && (
              <Button
                onClick={generateAIInsights}
                disabled={loadingAI}
                className="flex items-center space-x-2"
              >
                {loadingAI ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate AI Insights</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {aiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{aiError}</p>
              <Button
                onClick={generateAIInsights}
                variant="secondary"
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          )}

          {!aiInsights && !loadingAI && !aiError && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Get AI-powered analysis of your session</p>
              <p className="text-sm text-gray-500">
                Our AI will analyze student responses, identify patterns, detect anomalies, and provide actionable recommendations
              </p>
            </div>
          )}

          {aiInsights && (
            <div className="space-y-6">
              {/* Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Session Summary</h3>
                <p className="text-blue-800 text-sm">{aiInsights.summary}</p>
              </div>

              {/* Strengths */}
              {aiInsights.strengths.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-green-600 mt-1">✓</span>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {aiInsights.areasForImprovement.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900">Areas for Improvement</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.areasForImprovement.map((area, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-orange-600 mt-1">→</span>
                        <span className="text-sm text-gray-700">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Anomalies */}
              {aiInsights.anomalies.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-medium text-yellow-900">Detected Anomalies</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.anomalies.map((anomaly, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-yellow-600 mt-1">⚠</span>
                        <span className="text-sm text-yellow-800">{anomaly}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {aiInsights.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-gray-900">Recommendations</h3>
                  </div>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-purple-600 mt-1">💡</span>
                        <span className="text-sm text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Category Insights */}
              {aiInsights.categoryInsights.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Category-Specific Analysis</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {aiInsights.categoryInsights.map((categoryInsight, idx) => (
                      <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2 capitalize">
                          {categoryInsight.category}
                        </h4>
                        <p className="text-sm text-gray-700">{categoryInsight.analysis}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={generateAIInsights}
                  variant="secondary"
                  disabled={loadingAI}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Regenerate Insights</span>
                </Button>
              </div>
            </div>
          )}
        </Card>

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

export default SessionAnalyticsPage