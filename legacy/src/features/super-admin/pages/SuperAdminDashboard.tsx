import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  Building2 as University, 
  BookOpen, 
  BarChart3, 
  Settings, 
  UserCheck, 
  AlertCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, StatsCard, Table, Button } from '../../../shared/components/ui'
import { SuperAdminService } from '../services/superAdminService'
import type { UniversityApplication } from '../services/superAdminService'
import ApplicationReviewModal from '../components/ApplicationReviewModal'

interface DashboardStats {
  totalUniversities: number
  totalUsers: number
  pendingApprovals: number
  totalResponses: number
  totalSessions: number
}

interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  university_name?: string
  application_date: string
  status: string
}

export default function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [stats, setStats] = useState<DashboardStats>({
    totalUniversities: 0,
    totalUsers: 0,
    pendingApprovals: 0,
    totalResponses: 0,
    totalSessions: 0
  })
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [universityApplications, setUniversityApplications] = useState<UniversityApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<UniversityApplication | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load statistics using SuperAdminService
      const dashboardStats = await SuperAdminService.getDashboardStats()
      setStats(dashboardStats)

      // Load pending university applications
      try {
        const universityApps = await SuperAdminService.getPendingUniversityApplications()
        console.log('Loaded university applications:', universityApps)
        setUniversityApplications(universityApps)
      } catch (appError) {
        console.error('Error loading university applications:', appError)
        setUniversityApplications([]) // Set empty array on error
      }

      // Load pending users (non-university admin users)
      const pendingUsersData = await SuperAdminService.getPendingUsers(10)
      setPendingUsers(pendingUsersData)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    if (!user?.id) return
    
    try {
      await SuperAdminService.processUniversityApplication(userId, user.id, 'approve')
      // Refresh data
      loadDashboardData()
    } catch (error) {
      console.error('Error approving user:', error)
    }
  }

  const handleRejectUser = async (userId: string, reason?: string) => {
    if (!user?.id) return
    
    try {
      await SuperAdminService.processUniversityApplication(userId, user.id, 'reject', reason)
      // Refresh data
      loadDashboardData()
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const handleViewApplication = (application: UniversityApplication) => {
    setSelectedApplication(application)
    setShowApplicationModal(true)
  }

  const handleCloseModal = () => {
    setSelectedApplication(null)
    setShowApplicationModal(false)
  }


  const universityApplicationsColumns = [
    {
      key: 'university_name',
      header: 'University Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'university_code',
      header: 'Code',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
          {value}
        </span>
      )
    },
    {
      key: 'admin_name',
      header: 'Admin Name',
      render: (value: string) => (
        <div className="text-gray-900">{value}</div>
      )
    },
    {
      key: 'admin_email',
      header: 'Admin Email',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'application_date',
      header: 'Applied',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: UniversityApplication) => (
        <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 min-w-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleViewApplication(row)}
            className="text-xs px-2 py-1 w-full xs:w-auto"
          >
            <span className="truncate">View</span>
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleApproveUser(row.user_id)}
            className="text-xs px-2 py-1 w-full xs:w-auto"
          >
            <span className="truncate">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRejectUser(row.user_id)}
            className="text-xs px-2 py-1 w-full xs:w-auto"
          >
            <span className="truncate">Reject</span>
          </Button>
        </div>
      ),
      width: '180px'
    }
  ]

  const pendingUsersColumns = [
    {
      key: 'name',
      header: 'Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'university_name',
      header: 'University',
      render: (value: string) => (
        <div className="text-gray-600">{value}</div>
      )
    },
    {
      key: 'application_date',
      header: 'Applied',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: PendingUser) => (
        <div className="flex flex-col xs:flex-row gap-1 xs:gap-2 min-w-0">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleApproveUser(row.id)}
            className="text-xs px-2 py-1 w-full xs:w-auto"
          >
            <span className="truncate">Approve</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleRejectUser(row.id)}
            className="text-xs px-2 py-1 w-full xs:w-auto"
          >
            <span className="truncate">Reject</span>
          </Button>
        </div>
      ),
      width: '140px'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Super Admin Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 truncate">Welcome back, {user?.name}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/settings')}
                className="w-full sm:w-auto"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Universities"
            value={stats.totalUniversities}
            icon={<University className="w-6 h-6" />}
            color="blue"
          />
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<AlertCircle className="w-6 h-6" />}
            color="yellow"
          />
          <StatsCard
            title="Total Sessions"
            value={stats.totalSessions}
            icon={<BookOpen className="w-6 h-6" />}
            color="purple"
          />
          <StatsCard
            title="Total Responses"
            value={stats.totalResponses}
            icon={<BarChart3 className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Pending University Applications */}
        <Card title={`Pending University Applications (${universityApplications.length})`} className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>
          </div>
          
          {/* Debug info */}
          {!loading && universityApplications.length === 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-xs sm:text-sm text-yellow-700">
                <span className="font-medium"></span> No university applications found.
              </p>
            </div>
          )}
          
          <Table
            columns={universityApplicationsColumns}
            data={universityApplications.filter(app => 
              app.university_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              app.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              app.admin_email.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            loading={loading}
            emptyMessage="No pending university applications found"
          />
        </Card>

        {/* Other Pending Approvals */}
        {pendingUsers.length > 0 && (
          <Card title="Other Pending User Approvals" className="mb-6 sm:mb-8">
            <Table
              columns={pendingUsersColumns}
              data={pendingUsers.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              loading={loading}
              emptyMessage="No other pending approvals"
            />
          </Card>
        )}

        {/* Core Super Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card title="University Administration">
            <div className="space-y-3">
              <Button 
                fullWidth 
                onClick={() => navigate('/universities')}
                className="justify-center sm:justify-start"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="truncate">Manage Universities</span>
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/approvals')}
                className="justify-center sm:justify-start"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                <span className="truncate">Review Applications ({stats.pendingApprovals})</span>
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/register/university-admin')}
                className="justify-center sm:justify-start"
              >
                <University className="w-4 h-4 mr-2" />
                <span className="truncate">Registration Form</span>
              </Button>
            </div>
          </Card>

          <Card title="System Control">
            <div className="space-y-3">
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/settings')}
                className="justify-center sm:justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                <span className="truncate">System Settings</span>
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/analytics')}
                className="justify-center sm:justify-start"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                <span className="truncate">System Analytics</span>
              </Button>
              <Button 
                fullWidth 
                variant="secondary" 
                onClick={() => navigate('/users')}
                className="justify-center sm:justify-start"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="truncate">All Users</span>
              </Button>
            </div>
          </Card>
        </div>

      </div>

      {/* Application Review Modal */}
      <ApplicationReviewModal
        application={selectedApplication}
        isOpen={showApplicationModal}
        onClose={handleCloseModal}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
        loading={loading}
      />

    </div>
  )
}