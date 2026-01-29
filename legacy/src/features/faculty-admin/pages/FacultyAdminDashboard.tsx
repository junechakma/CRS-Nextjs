import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Building2, 
  Users, 
  BookOpen, 
  BarChart3,
  MessageSquare,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Button } from '../../../shared/components/ui'
import { FacultyAdminService, type FacultyDashboardStats, type RecentActivity } from '../services/facultyAdminService'

interface DashboardCard {
  title: string
  value: number
  icon: React.ComponentType<any>
  color: string
  bgColor: string
  trend?: string
}

export default function FacultyAdminDashboard() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<FacultyDashboardStats>({
    totalDepartments: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalResponses: 0
  })
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!user?.faculty_id) return
    
    try {
      setLoading(true)
      const [statsData, activitiesData] = await Promise.all([
        FacultyAdminService.getFacultyDashboardStats(user.faculty_id),
        FacultyAdminService.getRecentActivities(user.faculty_id, 8)
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
      title: 'Departments',
      value: stats.totalDepartments,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      title: 'Teachers',
      value: stats.totalTeachers,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%'
    },
    {
      title: 'Courses',
      value: stats.totalCourses,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%'
    },
    {
      title: 'Active Sessions',
      value: stats.totalSessions,
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+5%'
    },
    {
      title: 'Total Responses',
      value: stats.totalResponses,
      icon: MessageSquare,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      trend: '+22%'
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'department_created':
        return Building2
      case 'teacher_added':
        return Users
      case 'course_created':
        return BookOpen
      case 'session_completed':
        return BarChart3
      default:
        return Activity
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'department_created':
        return 'text-blue-500'
      case 'teacher_added':
        return 'text-green-500'
      case 'course_created':
        return 'text-purple-500'
      case 'session_completed':
        return 'text-orange-500'
      default:
        return 'text-gray-500'
    }
  }

  if (!user?.faculty_id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600">You need to be assigned to a faculty to access this dashboard.</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Faculty Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome back, {user.name}! Here's what's happening in your faculty.
          </p>
        </div>
        <Button onClick={loadDashboardData} disabled={loading} className="self-start sm:self-auto">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
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
                  {card.trend && (
                    <p className="text-sm text-green-600 flex items-center mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {card.trend}
                    </p>
                  )}
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Recent Activities - Takes up more space */}
        <div className="lg:col-span-3">
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No recent activities</p>
                <p className="text-sm">Activities will appear here as they happen</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type)
                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 bg-white rounded-full shadow-sm ${getActivityColor(activity.type)}`}>
                        <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{activity.message}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span className="font-medium">{activity.user}</span>
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

        {/* Right Sidebar - Consolidated Information */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          {/* Performance Overview */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Faculty Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Departments</span>
                <span className="text-lg font-bold text-blue-600">{stats.totalDepartments}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Teachers</span>
                <span className="text-lg font-bold text-green-600">{stats.totalTeachers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Running Courses</span>
                <span className="text-lg font-bold text-purple-600">{stats.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Live Sessions</span>
                <span className="text-lg font-bold text-orange-600">{stats.totalSessions}</span>
              </div>
            </div>
          </Card>

          {/* System Status */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Sync</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Synced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Collection</span>
                <span className="flex items-center text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Load</span>
                <span className="flex items-center text-sm text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                  Normal
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Backup Status</span>
                <span className="flex items-center text-sm text-blue-600">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Scheduled
                </span>
              </div>
            </div>
          </Card>

          {/* Calendar Widget */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Today</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Sessions this month</span>
                  <span className="font-medium">{stats.totalSessions}</span>
                </div>
                <div className="flex justify-between">
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