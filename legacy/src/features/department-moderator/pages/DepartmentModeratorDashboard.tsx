import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Users, 
  BookOpen, 
  BarChart3,
  MessageSquare,
  GraduationCap,
  Calendar,
  Activity
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card } from '../../../shared/components/ui'
import { DepartmentModeratorService, type DepartmentDashboardStats, type RecentActivity } from '../services/departmentModeratorService'

interface DashboardCard {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

export default function DepartmentModeratorDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DepartmentDashboardStats>({
    totalTeachers: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalResponses: 0,
    totalStudents: 0
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!user?.department_id) return
    
    try {
      setLoading(true)
      const [statsData, activitiesData] = await Promise.all([
        DepartmentModeratorService.getDepartmentDashboardStats(user.department_id),
        DepartmentModeratorService.getRecentActivities(user.department_id, 8)
      ])
      
      setStats(statsData)
      setActivities(activitiesData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dashboardCards: DashboardCard[] = [
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Students',
      value: stats.totalStudents,
      icon: GraduationCap,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Sessions',
      value: stats.totalSessions,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses,
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'teacher_added':
        return Users
      case 'course_created':
        return BookOpen
      case 'session_completed':
        return BarChart3
      case 'response_received':
        return MessageSquare
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'teacher_added':
        return 'text-green-500'
      case 'course_created':
        return 'text-purple-500'
      case 'session_completed':
        return 'text-orange-500'
      case 'response_received':
        return 'text-indigo-500'
      default:
        return 'text-gray-500'
    }
  }


  if (!user?.department_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">You need to be assigned to a department to access this dashboard.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Department Moderator Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back, {user.name}! Here's what's happening in your department.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card key={index} className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {loading ? '...' : card.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 ${card.bgColor} rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No recent activities</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 bg-white rounded-full ${getActivityColor(activity.type)}`}>
                        <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{activity.message}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span>{activity.user}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(activity.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Stats */}
        <div className="space-y-4 sm:space-y-6">
          {/* System Status */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Sessions</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sync</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Updated
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Collection</span>
                <span className="flex items-center text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
            </div>
          </Card>

          {/* Calendar Widget */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">This Month</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
              </div>
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Sessions this month</span>
                  <span className="font-medium">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Responses collected</span>
                  <span className="font-medium">{stats.totalResponses}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}