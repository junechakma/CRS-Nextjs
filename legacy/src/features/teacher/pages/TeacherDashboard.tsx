import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  BarChart3, 
  Clock, 
  Star,
  Calendar,
  Plus,
  Activity
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, StatsCard, Button } from '../../../shared/components/ui'
import { useTeacherStats } from '../hooks/useTeacherStats'
import { useCourses } from '../hooks/useCourses'
import { useResponseSessions } from '../hooks/useResponseSessions'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { stats, error: statsError } = useTeacherStats(user?.id)
  const { courses, loading: coursesLoading } = useCourses(user?.id)
  const { sessions, loading: sessionsLoading } = useResponseSessions(user?.id)

  // Recent courses (latest 3)
  const recentCourses = courses.slice(0, 3)
  
  // Recent sessions (latest 3)
  const recentSessions = sessions.slice(0, 3)

  // Active sessions
  const activeSessions = sessions.filter(session => session.status === 'active')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString)
    const time = timeString ? new Date(`1970-01-01T${timeString}`) : null
    
    const dateFormatted = date.toLocaleDateString()
    const timeFormatted = time ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    
    return timeFormatted ? `${dateFormatted} at ${timeFormatted}` : dateFormatted
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.name}</p>
              {stats.currentSemester && (
                <p className="text-xs sm:text-sm text-gray-500">Current semester: {stats.currentSemester}</p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button onClick={() => navigate('/teacher/sessions')} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses.toString()}
            icon={<BookOpen className="w-6 h-6" />}
            color="blue"
          />
          
          <StatsCard
            title="Response Sessions"
            value={stats.totalSessions.toString()}
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          
          <StatsCard
            title="Student Responses"
            value={stats.totalResponses.toString()}

            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
          />
          
          <StatsCard
            title="Average Rating"
            value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '0.0'}
            icon={<Star className="w-6 h-6" />}
            color="yellow"
          />
        </div>

        {/* Active Sessions Alert */}
        {activeSessions.length > 0 && (
          <Card title={`Active Sessions (${activeSessions.length})`} className="mb-6 sm:mb-8 border-orange-200 bg-orange-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm text-orange-600">
                    Students can currently submit responses to {activeSessions.length} session{activeSessions.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/teacher/sessions')} className="w-full sm:w-auto">
                <Clock className="w-4 h-4 mr-1" />
                Manage Sessions
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Recent Courses */}
          <Card title="Recent Courses" className="h-fit">
            <div className="space-y-4">
              {coursesLoading ? (
                <div className="text-center py-4 text-gray-500">Loading courses...</div>
              ) : recentCourses.length > 0 ? (
                <>
                  {recentCourses.map((course) => (
                    <div key={course.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{course.course_code}</h4>
                          <p className="text-gray-600 text-sm">{course.course_title}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{course.credit_hours} credit hours</span>
                            <span className="mx-2">•</span>
                            <span>{course.sections.length} section{course.sections.length > 1 ? 's' : ''}</span>
                            <span className="mx-2">•</span>
                            <span>{course.semester_name} {course.academic_year}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                          {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button variant="secondary" fullWidth size="sm" onClick={() => navigate('/teacher/courses')}>
                      <BookOpen className="w-4 h-4 mr-2" />
                      View All Courses
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No courses yet</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/teacher/courses')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Course
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Recent Sessions */}
          <Card title="Recent Sessions" className="h-fit">
            <div className="space-y-4">
              {sessionsLoading ? (
                <div className="text-center py-4 text-gray-500">Loading sessions...</div>
              ) : recentSessions.length > 0 ? (
                <>
                  {recentSessions.map((session) => (
                    <div key={session.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{session.course_code}</h4>
                          <p className="text-gray-600 text-sm">{session.course_title}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{formatDateTime(session.session_date, session.start_time)}</span>
                            <span className="mx-2">•</span>
                            <span>Section {session.section}</span>
                            {session.room_number && (
                              <>
                                <span className="mx-2">•</span>
                                <span>Room {session.room_number}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <Users className="w-3 h-3 mr-1" />
                            <span>{session.stats.total_responses} responses</span>
                            <span className="mx-2">•</span>
                            <span>{session.duration_minutes} minutes</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
                          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Button variant="secondary" fullWidth size="sm" onClick={() => navigate('/teacher/sessions')}>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View All Sessions
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No sessions yet</p>
                  <Button variant="primary" size="sm" onClick={() => navigate('/teacher/sessions')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Session
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>


        {/* Error Display */}
        {statsError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">Error loading dashboard data: {statsError}</p>
          </div>
        )}
      </div>
    </div>
  )
}