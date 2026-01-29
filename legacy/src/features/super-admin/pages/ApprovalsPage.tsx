import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { UserCheck, UserX, Clock, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button, Card, Table } from '../../../shared/components/ui'
import { SuperAdminService } from '../services/superAdminService'
import type { UniversityApplication } from '../services/superAdminService'
import ApplicationReviewModal from '../components/ApplicationReviewModal'

// interface PendingUser {
//   id: string
//   name: string
//   email: string
//   role: string
//   university_name?: string
//   application_date: string
//   status: string
//   approval_status?: string
// }

interface ApprovalStats {
  pending: number
  approved: number
  rejected: number
  total: number
}

export default function ApprovalsPage() {
  // const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [universityApplications, setUniversityApplications] = useState<UniversityApplication[]>([])
  const [stats, setStats] = useState<ApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('pending')
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set())
  const [selectedApplication, setSelectedApplication] = useState<UniversityApplication | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  
  const { user: currentUser } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Load detailed university applications and all users
      const [universityAppsData, , allUsersData] = await Promise.all([
        SuperAdminService.getPendingUniversityApplications(),
        SuperAdminService.getPendingUsers(50),
        SuperAdminService.getAllUsers({ role: 'university_admin' })
      ])

      setUniversityApplications(universityAppsData || [])
      // setPendingUsers(pendingData || [])
      setAllUsers(allUsersData || [])

      // Calculate stats for university admins only
      const allUsers = (allUsersData || []).filter(u => u.role === 'university_admin')
      const approvalStats = {
        pending: (universityAppsData || []).length,
        approved: allUsers.filter(u => u.approval_status === 'approved').length,
        rejected: allUsers.filter(u => u.approval_status === 'rejected').length,
        total: allUsers.length
      }
      setStats(approvalStats)

    } catch (error) {
      console.error('Error loading approval data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveUser = async (userId: string) => {
    if (!currentUser?.id) return
    
    try {
      setProcessingUsers(prev => new Set(prev).add(userId))
      await SuperAdminService.processUniversityApplication(userId, currentUser.id, 'approve')
      await loadData()
    } catch (error) {
      console.error('Error approving user:', error)
      alert('Failed to approve user')
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleRejectUser = async (userId: string, reason?: string) => {
    if (!currentUser?.id) return
    
    if (!confirm('Are you sure you want to reject this user application?')) {
      return
    }
    
    try {
      setProcessingUsers(prev => new Set(prev).add(userId))
      await SuperAdminService.processUniversityApplication(userId, currentUser.id, 'reject', reason)
      await loadData()
    } catch (error) {
      console.error('Error rejecting user:', error)
      alert('Failed to reject user')
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
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

  const handleBulkApprove = async () => {
    if (!currentUser?.id) return
    
    const pendingUserIds = universityApplications.map(app => app.user_id)
    
    if (pendingUserIds.length === 0) {
      alert('No pending applications to approve')
      return
    }
    
    if (!confirm(`Are you sure you want to approve ${pendingUserIds.length} applications?`)) {
      return
    }
    
    try {
      setLoading(true)
      await Promise.all(
        pendingUserIds.map(userId => 
          SuperAdminService.processUniversityApplication(userId, currentUser.id, 'approve')
        )
      )
      await loadData()
    } catch (error) {
      console.error('Error bulk approving applications:', error)
      alert('Failed to approve some applications')
    } finally {
      setLoading(false)
    }
  }

  

  const pendingColumns = [
    {
      key: 'user',
      header: 'Admin Details',
      render: (_: any, row: UniversityApplication) => (
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">{row.admin_name}</div>
          <div className="text-xs sm:text-sm text-gray-500">{row.admin_email}</div>
          <div className="text-xs text-gray-400 mt-1">
            Applied: {new Date(row.application_date).toLocaleDateString()}
          </div>
          {row.admin_phone && (
            <div className="text-xs text-gray-400">
              Phone: {row.admin_phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'university',
      header: 'University Details',
      render: (_: any, row: UniversityApplication) => (
        <div className="text-xs sm:text-sm">
          <div className="font-medium text-gray-900">
            {row.university_name}
          </div>
          <div className="text-gray-500">
            Code: {row.university_code}
          </div>
          {row.university_city && (
            <div className="text-gray-500">
              {[row.university_city, row.university_state, row.university_country].filter(Boolean).join(', ')}
            </div>
          )}
          {row.university_email && (
            <div className="text-gray-400 text-xs">
              {row.university_email}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any) => (
        <div className="text-xs sm:text-sm font-medium text-yellow-600 flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: UniversityApplication) => {
        const isProcessing = processingUsers.has(row.user_id)
        
        return (
          <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleViewApplication(row)}
              className="text-xs px-2 py-1"
            >
              <Search className="w-3 h-3" />
              <span className="ml-1 hidden sm:inline">Review</span>
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleApproveUser(row.user_id)}
              loading={isProcessing}
              className="text-xs px-2 py-1"
            >
              <UserCheck className="w-3 h-3" />
              <span className="ml-1 hidden sm:inline">Approve</span>
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleRejectUser(row.user_id)}
              loading={isProcessing}
              className="text-xs px-2 py-1"
            >
              <UserX className="w-3 h-3" />
              <span className="ml-1 hidden sm:inline">Reject</span>
            </Button>
          </div>
        )
      },
      width: '220px'
    }
  ]

  const approvedRejectedColumns = [
    {
      key: 'user',
      header: 'User Details',
      render: (_: any, row: any) => (
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">{row.name}</div>
          <div className="text-xs sm:text-sm text-gray-500">{row.email}</div>
          <div className="text-xs text-gray-400 mt-1">
            {row.phone && `Phone: ${row.phone}`}
          </div>
        </div>
      )
    },
    {
      key: 'university',
      header: 'University Details',
      render: (_: any, row: any) => (
        <div className="text-xs sm:text-sm">
          <div className="font-medium text-gray-900">
            {row.universities?.name || row.university_name || 'N/A'}
          </div>
          {row.universities?.code && (
            <div className="text-gray-500">
              Code: {row.universities.code}
            </div>
          )}
          {row.universities?.city && (
            <div className="text-gray-500">
              {row.universities.city}, {row.universities.country || ''}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'approval_status',
      header: 'Status',
      render: (value: string) => (
        <div className={`text-xs sm:text-sm font-medium flex items-center ${value === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
          {value === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
          {value === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </div>
      )
    },
    {
      key: 'approval_date',
      header: 'Date',
      render: (value: string) => (
        <div className="text-xs sm:text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ]

  // For pending applications, show university applications data
  // For approved/rejected, show from all users data
  const filteredData = filterStatus === 'pending'
    ? universityApplications.filter(app =>
        app.admin_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.admin_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.university_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allUsers.filter(user =>
        user.approval_status === filterStatus && 
        user.role === 'university_admin' &&
        (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (user.university_name && user.university_name.toLowerCase().includes(searchTerm.toLowerCase())))
      )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                University Admin Applications
              </h1>
              <p className="text-sm text-gray-600 mt-1">Review and approve University Administrator applications</p>
            </div>
            {stats.pending > 0 && (
              <Button onClick={handleBulkApprove} loading={loading}>
                <UserCheck className="w-4 h-4 mr-2" />
                Approve All Pending ({stats.pending})
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card title={`${filterStatus === 'pending' ? 'Pending' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Applications (${filteredData.length})`}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-hidden">
            <Table
              columns={filterStatus === 'pending' ? pendingColumns : approvedRejectedColumns}
              data={filteredData}
              loading={loading}
              emptyMessage={`No ${filterStatus} applications found`}
            />
          </div>
        </Card>
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