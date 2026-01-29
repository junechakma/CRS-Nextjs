import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users,
  UserPlus,
  Settings,
  X
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Table, Button, Modal, Input, TextArea } from '../../../shared/components/ui'
import { FacultyAdminService } from '../services/facultyAdminService'

interface Department {
  id: string
  name: string
  code: string
  description?: string
  faculty_id: string
  moderator_id?: string
  moderator_name?: string
  moderator_email?: string
  moderator_phone?: string
  stats: {
    total_teachers: number
    total_courses: number
    total_sessions: number
    total_responses: number
  }
  created_at: string
  updated_at: string
}

interface DepartmentFormData {
  name: string
  code: string
  description: string
  moderator_name?: string
  moderator_email?: string
  moderator_phone?: string
  temp_password?: string
  assign_moderator: boolean
}

interface ModeratorFormData {
  moderator_name: string
  moderator_email: string
  moderator_phone?: string
  temp_password: string
}

interface DepartmentModerator {
  id: string
  name: string
  email: string
  department_name?: string
  created_at: string
  status: 'active' | 'inactive'
}

export default function DepartmentManagement() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModeratorModal, setShowAssignModeratorModal] = useState(false)
  const [showManageModeratorsModal, setShowManageModeratorsModal] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  const [departmentModerators, setDepartmentModerators] = useState<DepartmentModerator[]>([])
  const [loadingModerators, setLoadingModerators] = useState(false)
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    description: '',
    moderator_name: '',
    moderator_email: '',
    moderator_phone: '',
    temp_password: '',
    assign_moderator: false
  })
  const [formLoading, setFormLoading] = useState(false)
  const [moderatorFormData, setModeratorFormData] = useState<ModeratorFormData>({
    moderator_name: '',
    moderator_email: '',
    moderator_phone: '',
    temp_password: ''
  })

  useEffect(() => {
    loadDepartments()
  }, [])

  const loadDepartments = async () => {
    try {
      setLoading(true)
      if (!user?.faculty_id) return

      const departmentsData = await FacultyAdminService.getDepartments(user.faculty_id)
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Error loading departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleCreateDepartment = async () => {
    if (!user?.id || !user?.faculty_id) return

    try {
      setFormLoading(true)
      
      let result
      if (formData.assign_moderator) {
        // Generate temp password if not provided
        const tempPassword = formData.temp_password || generateTempPassword()
        
        result = await FacultyAdminService.createDepartmentWithModerator(
          user.id,
          {
            ...formData,
            moderator_name: formData.moderator_name || '',
            moderator_email: formData.moderator_email || '',
            moderator_phone: formData.moderator_phone || '',
            temp_password: tempPassword
          }
        )
        
        if (result.success) {
          await loadDepartments()
          setShowCreateModal(false)
          resetForm()
          alert(`Department created successfully! Moderator password: ${tempPassword}`)
        }
      } else {
        // Create department without moderator
        result = await FacultyAdminService.createDepartment(
          user.id,
          {
            name: formData.name,
            code: formData.code,
            description: formData.description
          }
        )
        
        if (result.success) {
          await loadDepartments()
          setShowCreateModal(false)
          resetForm()
          alert('Department created successfully!')
        }
      }
      
      if (!result.success) {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating department:', error)
      alert('Failed to create department')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditDepartment = async () => {
    if (!selectedDepartment || !user?.id) return

    try {
      setFormLoading(true)
      
      await FacultyAdminService.updateDepartment(selectedDepartment.id, {
        name: formData.name,
        code: formData.code,
        description: formData.description
      })

      await loadDepartments()
      setShowEditModal(false)
      setSelectedDepartment(null)
      resetForm()
    } catch (error) {
      console.error('Error updating department:', error)
      alert('Failed to update department')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department? This will also delete all teachers and associated data.')) {
      return
    }

    try {
      await FacultyAdminService.deleteDepartment(departmentId)
      await loadDepartments()
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('Failed to delete department')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      moderator_name: '',
      moderator_email: '',
      moderator_phone: '',
      temp_password: '',
      assign_moderator: false
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department)
    setFormData({
      name: department.name,
      code: department.code,
      description: department.description || '',
      moderator_name: department.moderator_name || '',
      moderator_email: department.moderator_email || '',
      moderator_phone: '',
      temp_password: '',
      assign_moderator: false
    })
    setShowEditModal(true)
  }

  const openAssignModeratorModal = (department: Department) => {
    setSelectedDepartment(department)
    setModeratorFormData({
      moderator_name: '',
      moderator_email: '',
      moderator_phone: '',
      temp_password: generateTempPassword()
    })
    setShowAssignModeratorModal(true)
  }

  const handleAssignModerator = async () => {
    if (!selectedDepartment || !user?.id) return

    try {
      setFormLoading(true)
      
      const result = await FacultyAdminService.assignDepartmentModerator(
        selectedDepartment.id,
        moderatorFormData
      )

      if (result.success) {
        await loadDepartments()
        setShowAssignModeratorModal(false)
        setSelectedDepartment(null)
        setModeratorFormData({
          moderator_name: '',
          moderator_email: '',
          moderator_phone: '',
          temp_password: ''
        })
        alert(`Department moderator assigned successfully! Password: ${moderatorFormData.temp_password}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error assigning department moderator:', error)
      alert('Failed to assign department moderator')
    } finally {
      setFormLoading(false)
    }
  }

  const openManageModeratorsModal = async () => {
    setShowManageModeratorsModal(true)
    await loadDepartmentModerators()
  }

  const loadDepartmentModerators = async () => {
    try {
      setLoadingModerators(true)
      if (!user?.faculty_id) return

      const moderatorsData = await FacultyAdminService.getDepartmentModerators(user.faculty_id)
      setDepartmentModerators(moderatorsData)
    } catch (error) {
      console.error('Error loading department moderators:', error)
    } finally {
      setLoadingModerators(false)
    }
  }

  const handleRemoveModerator = async (moderatorId: string) => {
    if (!confirm('Are you sure you want to remove this moderator?')) return

    try {
      await FacultyAdminService.removeDepartmentModerator(moderatorId)
      await loadDepartmentModerators()
      alert('Moderator removed successfully')
    } catch (error) {
      console.error('Error removing moderator:', error)
      alert('Failed to remove moderator')
    }
  }

  const departmentsColumns = [
    {
      key: 'code',
      header: 'Code',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'name',
      header: 'Department Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'moderator_name',
      header: 'Department Moderator',
      render: (value: string, row: Department) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'No Moderator'}</div>
          {row.moderator_email && (
            <div className="text-sm text-gray-500">{row.moderator_email}</div>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (value: Department['stats']) => (
        <div className="text-sm">
          <div>Teachers: {value.total_teachers}</div>
          <div>Courses: {value.total_courses}</div>
          <div>Sessions: {value.total_sessions}</div>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Department) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(row)}
            className="text-xs px-2 py-1"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          {!row.moderator_id && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openAssignModeratorModal(row)}
              className="text-xs px-2 py-1"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Assign Moderator
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteDepartment(row.id)}
            className="text-xs px-2 py-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
      width: '250px'
    }
  ]

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (department.moderator_name && department.moderator_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <Card title="Department Management" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <Button variant="secondary" onClick={openManageModeratorsModal}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Moderators
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        </div>
        
        <Table
          columns={departmentsColumns}
          data={filteredDepartments}
          loading={loading}
          emptyMessage="No departments found"
        />
      </Card>

      {/* Create Department Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Department"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science & Engineering"
              required
            />
            <Input
              label="Department Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., CSE"
              maxLength={10}
              required
            />
          </div>
          
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Department description (optional)"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDepartment} loading={formLoading}>
              Create Department
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Department Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Department"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Department Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science & Engineering"
              required
            />
            <Input
              label="Department Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., CSE"
              maxLength={10}
              required
            />
          </div>
          
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Department description (optional)"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditDepartment} loading={formLoading}>
              Update Department
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Moderator Modal */}
      <Modal
        isOpen={showAssignModeratorModal}
        onClose={() => setShowAssignModeratorModal(false)}
        title={`Assign Moderator to ${selectedDepartment?.name}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Moderator Name"
              value={moderatorFormData.moderator_name}
              onChange={(e) => setModeratorFormData(prev => ({ ...prev, moderator_name: e.target.value }))}
              placeholder="Department moderator full name"
              required
            />
            <Input
              label="Moderator Email"
              type="email"
              value={moderatorFormData.moderator_email}
              onChange={(e) => setModeratorFormData(prev => ({ ...prev, moderator_email: e.target.value }))}
              placeholder="moderator@university.edu"
              required
            />
            <Input
              label="Moderator Phone (Optional)"
              type="tel"
              value={moderatorFormData.moderator_phone || ''}
              onChange={(e) => setModeratorFormData(prev => ({ ...prev, moderator_phone: e.target.value }))}
              placeholder="+1234567890"
            />
            <Input
              label="Temporary Password"
              value={moderatorFormData.temp_password}
              onChange={(e) => setModeratorFormData(prev => ({ ...prev, temp_password: e.target.value }))}
              placeholder="Auto-generated password"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAssignModeratorModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignModerator} loading={formLoading}>
              Assign Moderator
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Moderators Modal */}
      <Modal
        isOpen={showManageModeratorsModal}
        onClose={() => setShowManageModeratorsModal(false)}
        title="Manage Department Moderators"
      >
        <div className="space-y-6">
          {/* Current Moderators List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Current Department Moderators ({departmentModerators.length})
            </h4>
            {loadingModerators ? (
              <div className="text-center py-8 text-gray-500">Loading moderators...</div>
            ) : departmentModerators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No department moderators found</div>
            ) : (
              <div className="space-y-3">
                {departmentModerators.map((moderator) => (
                  <div key={moderator.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{moderator.name}</div>
                      <div className="text-sm text-gray-500">{moderator.email}</div>
                      {moderator.department_name && (
                        <div className="text-xs text-blue-600 mt-1">Department: {moderator.department_name}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">
                        Added: {new Date(moderator.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        moderator.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {moderator.status}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveModerator(moderator.id)}
                        className="text-xs px-2 py-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setShowManageModeratorsModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}