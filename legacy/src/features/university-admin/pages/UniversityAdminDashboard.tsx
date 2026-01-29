import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  Building2,
  BarChart3, 
  Settings, 
  UserPlus, 
  AlertCircle,
  Plus,
  Search,
  Filter,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, StatsCard, Table, Button } from '../../../shared/components/ui'
import DashboardLayout from '../../../shared/components/layout/DashboardLayout'
import { UniversityAdminService, type DashboardStats } from '../services/universityAdminService'


interface RecentActivity {
  id: string
  type: 'faculty_created' | 'department_created' | 'teacher_added' | 'session_completed'
  message: string
  timestamp: string
  user: string
}

interface ApplicationStatus {
  status: 'pending' | 'approved' | 'rejected'
  university_name: string
  university_code: string
  applied_date: string
  review_date?: string
  rejection_reason?: string
}

export default function UniversityAdminDashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculties: 0,
    totalDepartments: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalCourses: 0,
    totalSessions: 0,
    totalResponses: 0,
    totalSemesters: 0,
    currentSemester: 'Not Set'
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Check if user has university assigned
      if (!user?.university_id) {
        // Load application status instead
        try {
          const appStatus = await UniversityAdminService.getApplicationStatus(user?.id)
          setApplicationStatus(appStatus)
        } catch (error) {
          console.error('Error loading application status:', error)
        }
        return
      }

      // Load statistics using UniversityAdminService
      const dashboardStats = await UniversityAdminService.getDashboardStats(user.university_id)
      setStats(dashboardStats)

      // Load recent activities
      const activities = await UniversityAdminService.getRecentActivities(user.university_id, 10)
      setRecentActivities(activities)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentActivitiesColumns = [
    {
      key: 'type',
      header: 'Type',
      render: (value: string) => {
        const typeMap = {
          faculty_created: { label: 'Faculty Created', color: 'bg-blue-100 text-blue-800' },
          department_created: { label: 'Department Created', color: 'bg-green-100 text-green-800' },
          teacher_added: { label: 'Teacher Added', color: 'bg-purple-100 text-purple-800' },
          session_completed: { label: 'Session Completed', color: 'bg-orange-100 text-orange-800' }
        }
        const config = typeMap[value as keyof typeof typeMap] || { label: value, color: 'bg-gray-100 text-gray-800' }
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            {config.label}
          </span>
        )
      }
    },
    {
      key: 'message',
      header: 'Activity',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'user',
      header: 'By User',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'timestamp',
      header: 'When',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ]

  // If no university assigned, show application status
  if (!user?.university_id && applicationStatus) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">University Admin Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user?.name}</p>
          </div>

          {/* Application Status Card */}
          <Card className="mb-6">
            <div className="p-6">
              <div className="flex items-center mb-4">
                {applicationStatus.status === 'pending' && (
                  <Clock className="w-8 h-8 text-yellow-500 mr-3" />
                )}
                {applicationStatus.status === 'approved' && (
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                )}
                {applicationStatus.status === 'rejected' && (
                  <XCircle className="w-8 h-8 text-red-500 mr-3" />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    University Application Status
                  </h2>
                  <p className="text-gray-600">
                    Application for {applicationStatus.university_name}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">University Name</p>
                  <p className="text-gray-900">{applicationStatus.university_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">University Code</p>
                  <p className="text-gray-900">{applicationStatus.university_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Applied Date</p>
                  <p className="text-gray-900">
                    {new Date(applicationStatus.applied_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    applicationStatus.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : applicationStatus.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {applicationStatus.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {applicationStatus.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        Application Under Review
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your university application is currently being reviewed by our administrators. 
                        You will receive notification once a decision has been made.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {applicationStatus.status === 'rejected' && applicationStatus.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <XCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">
                        Application Rejected
                      </h3>
                      <p className="text-sm text-red-700 mt-1">
                        {applicationStatus.rejection_reason}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">University Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Faculties"
            value={stats.totalFaculties}
            icon={<Building2 className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Total Departments"
            value={stats.totalDepartments}
            icon={<BookOpen className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={<GraduationCap className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={<FileText className="w-6 h-6" />}
            color="red"
          />
          <StatsCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<AlertCircle className="w-6 h-6" />}
            color="orange"
          />
          <StatsCard
            title="Total Responses"
            value={stats.totalResponses}
            icon={<BarChart3 className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Recent Activities */}
        <Card title="Recent Activities" className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button variant="secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          
          <Table
            columns={recentActivitiesColumns}
            data={recentActivities.filter(activity => 
              activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
              activity.user.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            loading={loading}
            emptyMessage="No recent activities"
          />
        </Card>

        {/* Core University Admin Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card title="Faculty Management">
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/university-admin/faculties')} className="justify-start">
                <Building2 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Faculties ({stats.totalFaculties})</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/faculties/create')} className="justify-start">
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Add New Faculty</span>
              </Button>
            </div>
          </Card>

          <Card title="Department Management">
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/university-admin/departments')} className="justify-start">
                <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Departments ({stats.totalDepartments})</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/departments/create')} className="justify-start">
                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Add New Department</span>
              </Button>
            </div>
          </Card>

          <Card title="Teacher Management">
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/university-admin/teachers')} className="justify-start">
                <GraduationCap className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Teachers ({stats.totalTeachers})</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/teachers/create')} className="justify-start">
                <UserPlus className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Add New Teacher</span>
              </Button>
            </div>
          </Card>

          <Card title="Question Management">
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/university-admin/questions')} className="justify-start">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Questions</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/questions/templates')} className="justify-start">
                <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Question Templates</span>
              </Button>
            </div>
          </Card>

          <Card title="Analytics & Reports">
            <div className="space-y-3">
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/analytics')} className="justify-start">
                <BarChart3 className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">University Analytics</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/reports')} className="justify-start">
                <FileText className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Generate Reports</span>
              </Button>
            </div>
          </Card>

          <Card title="Semester Management">
            <div className="space-y-3">
              <Button fullWidth onClick={() => navigate('/university-admin/semesters')} className="justify-start">
                <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Manage Semesters ({stats.totalSemesters})</span>
              </Button>
              <div className="text-sm text-gray-600 px-3 py-2 bg-gray-50 rounded">
                <span className="font-medium">Current: </span>
                {stats.currentSemester}
              </div>
            </div>
          </Card>

          <Card title="University Settings">
            <div className="space-y-3">
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/settings')} className="justify-start">
                <Settings className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">University Settings</span>
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate('/university-admin/users')} className="justify-start">
                <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">All Users ({stats.totalTeachers + stats.totalStudents})</span>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}