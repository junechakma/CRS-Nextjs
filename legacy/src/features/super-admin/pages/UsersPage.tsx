import { useState, useEffect } from 'react'
import { Users, Search, Filter, Edit, Trash2, Mail, Calendar } from 'lucide-react'
import { Button, Card, Table } from '../../../shared/components/ui'
import { SuperAdminService } from '../services/superAdminService'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  approval_status: string
  application_date?: string
  last_login?: string
  universities?: { name: string } | null
  faculties?: { name: string } | null
  departments?: { name: string } | null
}

interface UserFilters {
  role: string
  status: string
  approval_status: string
  search: string
}

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'university_admin', label: 'University Admin' },
  { value: 'faculty_admin', label: 'Faculty Admin' },
  { value: 'department_moderator', label: 'Department Moderator' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' }
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' }
]

const EMAIL_VERIFICATION_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Verified' },
  { value: 'pending', label: 'Unverified' }
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
    approval_status: '',
    search: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [userUniversities, setUserUniversities] = useState<Array<{ id: string; name: string }>>([])
  const [newAdminId, setNewAdminId] = useState<string>('')
  const [eligibleAdmins, setEligibleAdmins] = useState<Array<{ id: string; name: string; email: string }>>([])

  useEffect(() => {
    loadUsers()
  }, [filters])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await SuperAdminService.getAllUsers({
        role: filters.role || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined
      })

      // Transform the data to match our interface
      const transformedUsers: User[] = (data || []).map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        approval_status: user.approval_status,
        application_date: user.application_date,
        last_login: user.last_login,
        universities: user.universities,
        faculties: user.faculties,
        departments: user.departments
      }))

      setUsers(transformedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await SuperAdminService.updateUser(editingUser.id, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role,
        status: editingUser.status
      })
      setEditingUser(null)
      await loadUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      alert(error.message || 'Failed to update user')
    }
  }

  const handleDeleteClick = async (userId: string) => {
    try {
      // Check if user is admin of any universities
      const universities = await SuperAdminService.getUserUniversities(userId)

      if (universities.length > 0) {
        setUserUniversities(universities)
        // Load eligible admins for transfer
        const admins = await SuperAdminService.getEligibleAdmins()
        // Filter out the user being deleted
        setEligibleAdmins(admins.filter(a => a.id !== userId))
      }

      setDeletingUserId(userId)
    } catch (error: any) {
      console.error('Error checking user universities:', error)
      alert(error.message || 'Failed to check user dependencies')
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUserId) return

    const userToDelete = users.find(u => u.id === deletingUserId)
    if (!userToDelete) return

    if (deleteConfirmName !== userToDelete.name) {
      alert('Name does not match. Please type the exact name to confirm deletion.')
      return
    }

    // If user has universities and no new admin selected
    if (userUniversities.length > 0 && !newAdminId) {
      alert('Please select a new admin to transfer university ownership.')
      return
    }

    try {
      await SuperAdminService.deleteUser(deletingUserId, newAdminId || undefined)
      setDeletingUserId(null)
      setDeleteConfirmName('')
      setUserUniversities([])
      setNewAdminId('')
      setEligibleAdmins([])
      await loadUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.message || 'Failed to delete user')
    }
  }

  const getRoleColor = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      university_admin: 'bg-blue-100 text-blue-800',
      faculty_admin: 'bg-green-100 text-green-800',
      department_moderator: 'bg-yellow-100 text-yellow-800',
      teacher: 'bg-indigo-100 text-indigo-800',
      student: 'bg-gray-100 text-gray-800'
    }
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-50 text-green-700 border border-green-200',
      inactive: 'bg-gray-50 text-gray-700 border border-gray-200',
      suspended: 'bg-red-50 text-red-700 border border-red-200'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  const getEmailVerificationColor = (status: string) => {
    const colors = {
      approved: 'text-green-600',
      pending: 'text-yellow-600'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600'
  }

  const columns = [
    {
      key: 'user',
      header: 'User',
      render: (_: any, row: User) => (
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">{row.name}</div>
          <div className="text-xs sm:text-sm text-gray-500 flex items-center">
            <Mail className="w-3 h-3 mr-1" />
            {row.email}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(value)}`}>
          {value.replace('_', ' ').toUpperCase()}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${getStatusColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      key: 'approval_status',
      header: 'Email Verified',
      render: (value: string) => (
        <div className={`text-xs sm:text-sm font-medium ${getEmailVerificationColor(value)}`}>
          {value === 'approved' ? 'Verified' : 'Unverified'}
        </div>
      )
    },
    {
      key: 'organization',
      header: 'Organization',
      render: (_: any, row: User) => (
        <div className="text-xs sm:text-sm text-gray-600">
          <div>{row.universities?.name || 'N/A'}</div>
          {row.departments?.name && (
            <div className="text-gray-500">{row.departments.name}</div>
          )}
        </div>
      )
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (value: string) => (
        <div className="text-xs sm:text-sm text-gray-500">
          {value ? (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {new Date(value).toLocaleDateString()}
            </div>
          ) : (
            'Never'
          )}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: User) => (
        <div className="flex flex-col sm:flex-row gap-1">
          {row.role !== 'super_admin' && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="text-xs px-2 py-1"
                onClick={() => setEditingUser(row)}
              >
                <Edit className="w-3 h-3" />
                <span className="ml-1 hidden sm:inline">Edit</span>
              </Button>
              <Button
                size="sm"
                variant="danger"
                className="text-xs px-2 py-1"
                onClick={() => handleDeleteClick(row.id)}
              >
                <Trash2 className="w-3 h-3" />
                <span className="ml-1 hidden sm:inline">Delete</span>
              </Button>
            </>
          )}
        </div>
      ),
      width: '150px'
    }
  ]

  const filteredUsers = users.filter(user => {
    if (filters.approval_status && user.approval_status !== filters.approval_status) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                User Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage all system users and their permissions</p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Verification</label>
                <select
                  value={filters.approval_status}
                  onChange={(e) => setFilters(prev => ({ ...prev, approval_status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EMAIL_VERIFICATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>
        )}

        <Card title={`Users (${filteredUsers.length})`}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Quick search users..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredUsers}
              loading={loading}
              emptyMessage="No users found"
            />
          </div>
        </Card>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit User</h3>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="university_admin">University Admin</option>
                  <option value="faculty_admin">Faculty Admin</option>
                  <option value="department_moderator">Department Moderator</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <Button type="submit" variant="primary" className="flex-1">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
              <Trash2 className="w-6 h-6 mr-2" />
              Delete User
            </h3>
            <div className="mb-4">
              <p className="text-gray-700 mb-2">
                Are you sure you want to delete this user? This action cannot be undone.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> All associated data (responses, sessions, etc.) may be affected.
                </p>
              </div>

              {/* Transfer University Ownership Section */}
              {userUniversities.length > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Transfer University Ownership</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    This user is admin of {userUniversities.length} {userUniversities.length === 1 ? 'university' : 'universities'}:
                  </p>
                  <ul className="text-sm text-blue-700 mb-3 list-disc list-inside">
                    {userUniversities.map(uni => (
                      <li key={uni.id}>{uni.name}</li>
                    ))}
                  </ul>
                  <div>
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      Select New Admin <span className="text-red-500">*</span>
                    </label>
                    {eligibleAdmins.length > 0 ? (
                      <select
                        value={newAdminId}
                        onChange={(e) => setNewAdminId(e.target.value)}
                        className="w-full border border-blue-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">-- Select New Admin --</option>
                        {eligibleAdmins.map(admin => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name} ({admin.email})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800">
                          <strong>Error:</strong> No eligible admins available for transfer. Cannot delete this user.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-sm font-medium text-gray-700 mb-2">
                Type <strong>{users.find(u => u.id === deletingUserId)?.name}</strong> to confirm:
              </p>
              <input
                type="text"
                value={deleteConfirmName}
                onChange={(e) => setDeleteConfirmName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Enter user name"
              />
            </div>
            <div className="flex space-x-3">
              <Button
                variant="danger"
                onClick={handleDeleteUser}
                disabled={
                  deleteConfirmName !== users.find(u => u.id === deletingUserId)?.name ||
                  (userUniversities.length > 0 && (!newAdminId || eligibleAdmins.length === 0))
                }
                className="flex-1"
              >
                Delete User
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setDeletingUserId(null)
                  setDeleteConfirmName('')
                  setUserUniversities([])
                  setNewAdminId('')
                  setEligibleAdmins([])
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}