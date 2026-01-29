import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Star,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, StatsCard } from '../../../shared/components/ui'
import { TeacherService } from '../services/teacherService'
import type { SessionResponse } from '../services/teacherService'

interface TeacherAnalyticsData {
  overview: {
    totalCourses: number
    totalSessions: number
    totalResponses: number
    averageRating: number
    activeSessions: number
    completedSessions: number
    currentSemester?: string
  }
  performance: {
    ratingTrend: { month: string; rating: number; responses: number }[]
    categoryRatings: { category: string; rating: number; responses: number }[]
    responseRates: { month: string; rate: number; sessions: number }[]
  }
  sessionStats: {
    sessionsByStatus: { status: string; count: number; percentage: number }[]
    sessionsByMonth: { month: string; sessions: number; responses: number }[]
    averageSessionDuration: number
    averageResponseTime: number
  }
  courseStats: {
    coursesByStatus: { status: string; count: number }[]
    topPerformingCourses: { 
      course_code: string
      course_title: string
      totalSessions: number
      totalResponses: number
      averageRating: number
    }[]
  }
}

const TeacherAnalyticsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)
  const [analytics, setAnalytics] = useState<TeacherAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('90') // days
  // const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    if (user?.id) {
      loadAnalytics()
    }
  }, [user?.id, timeRange])

  const loadAnalytics = async () => {
    if (!user?.id) return

    try {
      setLoading(true)

      // Get basic stats
      const [dashboardStats, courses, sessions] = await Promise.all([
        TeacherService.getDashboardStats(user.id),
        TeacherService.getCourses(user.id),
        TeacherService.getResponseSessions(user.id)
      ])

      // Get responses for all sessions
      const allResponses: SessionResponse[] = []
      const sessionResponsesMap = new Map<string, SessionResponse[]>()

      for (const session of sessions) {
        try {
          const sessionResponses = await TeacherService.getSessionResponses(session.id)
          allResponses.push(...sessionResponses)
          sessionResponsesMap.set(session.id, sessionResponses)
        } catch (error) {
          console.warn(`Error getting responses for session ${session.id}:`, error)
        }
      }

      // Helper function to calculate average rating from responses
      const calculateAverageRating = (responses: SessionResponse[]): number => {
        if (responses.length === 0) return 0

        const ratings: number[] = []
        responses.forEach(response => {
          Object.values(response.response_data || {}).forEach(value => {
            if (typeof value === 'number' && value >= 1 && value <= 5) {
              ratings.push(value)
            }
          })
        })

        return ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : 0
      }

      // Calculate category ratings from actual response data
      const calculateCategoryRatings = (responses: SessionResponse[]) => {
        const categories = ['instructor', 'content', 'delivery', 'assessment', 'overall']

        return categories.map(category => {
          const categoryResponses: number[] = []

          responses.forEach(response => {
            Object.entries(response.response_data || {}).forEach(([_key, value]) => {
              // This is simplified - ideally questions would have category metadata
              if (typeof value === 'number' && value >= 1 && value <= 5) {
                categoryResponses.push(value)
              }
            })
          })

          const avgRating = categoryResponses.length > 0
            ? categoryResponses.reduce((sum, r) => sum + r, 0) / categoryResponses.length
            : 0

          return {
            category: category.charAt(0).toUpperCase() + category.slice(1),
            rating: avgRating,
            responses: categoryResponses.length
          }
        }).filter(c => c.responses > 0)
      }

      // Group sessions by month for trend analysis
      const getMonthlyData = (sessions: any[], responses: SessionResponse[]) => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const now = new Date()
        const monthlyData = []

        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthSessions = sessions.filter(s => {
            const sessionDate = new Date(s.created_at)
            return sessionDate.getMonth() === date.getMonth() &&
                   sessionDate.getFullYear() === date.getFullYear()
          })

          const monthResponses = responses.filter(r => {
            const responseDate = new Date(r.created_at)
            return responseDate.getMonth() === date.getMonth() &&
                   responseDate.getFullYear() === date.getFullYear()
          })

          const avgRating = calculateAverageRating(monthResponses)

          monthlyData.push({
            month: monthNames[date.getMonth()],
            rating: avgRating,
            responses: monthResponses.length,
            sessions: monthSessions.length,
            rate: monthSessions.length > 0
              ? Math.round((monthResponses.length / (monthSessions.length * 30)) * 100)
              : 0
          })
        }

        return monthlyData
      }

      const monthlyData = getMonthlyData(sessions, allResponses)
      const completedSessions = sessions.filter(s => s.status === 'completed').length
      const categoryRatings = calculateCategoryRatings(allResponses)

      // Calculate course performance from actual data
      const coursePerformance = courses.map(course => {
        const courseSessions = sessions.filter(s => s.course_id === course.id)
        const courseResponses = allResponses.filter(r =>
          courseSessions.some(s => s.id === r.session_id)
        )

        return {
          course_code: course.course_code,
          course_title: course.course_title,
          totalSessions: courseSessions.length,
          totalResponses: courseResponses.length,
          averageRating: calculateAverageRating(courseResponses)
        }
      }).filter(c => c.totalSessions > 0)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5)

      const analyticsData: TeacherAnalyticsData = {
        overview: {
          ...dashboardStats,
          completedSessions
        },
        performance: {
          ratingTrend: monthlyData.map(m => ({
            month: m.month,
            rating: m.rating,
            responses: m.responses
          })),
          categoryRatings,
          responseRates: monthlyData.map(m => ({
            month: m.month,
            rate: m.rate,
            sessions: m.sessions
          }))
        },
        sessionStats: {
          sessionsByStatus: [
            {
              status: 'Completed',
              count: completedSessions,
              percentage: Math.round((completedSessions / Math.max(sessions.length, 1)) * 100)
            },
            {
              status: 'Active',
              count: dashboardStats.activeSessions,
              percentage: Math.round((dashboardStats.activeSessions / Math.max(sessions.length, 1)) * 100)
            },
            {
              status: 'Pending',
              count: sessions.filter(s => s.status === 'pending').length,
              percentage: Math.round((sessions.filter(s => s.status === 'pending').length / Math.max(sessions.length, 1)) * 100)
            }
          ],
          sessionsByMonth: monthlyData.map(m => ({
            month: m.month,
            sessions: m.sessions,
            responses: m.responses
          })),
          averageSessionDuration: sessions.length > 0
            ? sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length
            : 0,
          averageResponseTime: allResponses.length > 0
            ? allResponses
                .filter(r => r.metadata?.completion_time_seconds)
                .reduce((sum, r) => sum + (r.metadata.completion_time_seconds || 0), 0) /
                allResponses.filter(r => r.metadata?.completion_time_seconds).length / 60
            : 0
        },
        courseStats: {
          coursesByStatus: [
            { status: 'active', count: courses.filter(c => c.status === 'active').length },
            { status: 'completed', count: courses.filter(c => c.status === 'completed').length },
            { status: 'inactive', count: courses.filter(c => c.status === 'inactive').length }
          ],
          topPerformingCourses: coursePerformance
        }
      }

      setAnalytics(analyticsData)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }


  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600'
    if (rating >= 4.0) return 'text-blue-600'
    if (rating >= 3.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
          <p className="text-gray-600">Failed to load analytics</p>
          <button
            onClick={loadAnalytics}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Try Again
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
              <div className="flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  <span className="hidden sm:inline">Teacher Analytics</span>
                  <span className="sm:hidden">Analytics</span>
                </h1>
                <p className="text-sm sm:text-base text-gray-600 hidden sm:block">Welcome back, {user?.name}</p>
                {analytics.overview.currentSemester && (
                  <p className="text-xs sm:text-sm text-gray-500">
                    Current: {analytics.overview.currentSemester}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="180">Last 6 months</option>
                <option value="365">Last year</option>
              </select>
              <div className="flex gap-2">
                {/* <Button onClick={handleExport} className="flex-1 sm:flex-initial">
                  <Download className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Export Data</span>
                  <span className="sm:hidden">Export</span>
                </Button> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Courses"
            value={analytics.overview.totalCourses}
            icon={<BookOpen className="w-6 h-6" />}
            color="blue"
            trend={+5}
          />
          <StatsCard
            title="Total Sessions"
            value={analytics.overview.totalSessions}
            icon={<Calendar className="w-6 h-6" />}
            color="green"
            trend={+12}
          />
          <StatsCard
            title="Total Responses"
            value={analytics.overview.totalResponses}
            icon={<MessageSquare className="w-6 h-6" />}
            color="purple"
            trend={+18}
          />
          <StatsCard
            title="Average Rating"
            value={analytics.overview.averageRating.toFixed(1)}
            icon={<Star className="w-6 h-6" />}
            color="yellow"
            trend={+3.2}
          />
          <StatsCard
            title="Active Sessions"
            value={analytics.overview.activeSessions}
            icon={<Activity className="w-6 h-6" />}
            color="orange"
            trend={0}
          />
          <StatsCard
            title="Completion Rate"
            value={`${Math.round((analytics.overview.completedSessions / Math.max(analytics.overview.totalSessions, 1)) * 100)}%`}
            icon={<Target className="w-6 h-6" />}
            color="red"
            trend={+5}
          />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Rating Trend */}
          <Card title="Rating Trend Over Time">
            <div className="h-64 flex items-end justify-between space-x-2 p-4">
              {analytics.performance.ratingTrend.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-blue-500 rounded-t w-full relative"
                    style={{ height: `${(data.rating / 5) * 200}px`, minHeight: '20px' }}
                    title={`${data.rating.toFixed(1)} rating, ${data.responses} responses`}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                      {data.rating.toFixed(1)}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Category Ratings */}
          <Card title="Performance by Category">
            <div className="space-y-4 p-4">
              {analytics.performance.categoryRatings.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-3" style={{
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]
                    }}></div>
                    <span className="text-sm text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${(category.rating / 5) * 100}%`,
                          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index]
                        }}
                      ></div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`text-sm font-medium ${getRatingColor(category.rating)}`}>
                        {category.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {category.responses} responses
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Session Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Session Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.sessionStats.averageSessionDuration.toFixed(0)}min
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.sessionStats.averageResponseTime.toFixed(1)}min
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.performance.responseRates[analytics.performance.responseRates.length - 1]?.rate || 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.performance.categoryRatings.reduce((prev, current) => 
                    (prev.rating > current.rating) ? prev : current
                  ).category}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Session Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card title="Session Status Distribution">
            <div className="space-y-3 p-4">
              {analytics.sessionStats.sessionsByStatus.map((status, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)} mr-3`}>
                      {status.status}
                    </span>
                    <span className="text-sm text-gray-700">{status.count} sessions</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${status.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-10 text-right">
                      {status.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Monthly Activity">
            <div className="h-64 flex items-end justify-between space-x-2 p-4">
              {analytics.sessionStats.sessionsByMonth.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-green-500 rounded-t w-full relative"
                    style={{ height: `${(data.sessions / 15) * 200}px`, minHeight: '20px' }}
                    title={`${data.sessions} sessions, ${data.responses} responses`}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                      {data.sessions}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">{data.month}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Performing Courses */}
        <Card title="Course Performance">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sessions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Responses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.courseStats.topPerformingCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {course.course_code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {course.course_title}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.totalSessions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {course.totalResponses}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getRatingColor(course.averageRating)}`}>
                        {course.averageRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(course.averageRating / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">
                          {Math.round((course.averageRating / 5) * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default TeacherAnalyticsPage