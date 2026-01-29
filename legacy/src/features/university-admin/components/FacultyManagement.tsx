import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Users,
  UserPlus,
  Settings,
  X
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Table, Button, Modal, Input, TextArea } from '../../../shared/components/ui'
import { UniversityAdminService } from '../services/universityAdminService'

interface Faculty {
  id: string
  name: string
  code: string
  description?: string
  admin_id?: string
  admin_name?: string
  admin_email?: string
  stats: {
    total_departments: number
    total_teachers: number
    total_courses: number
    total_responses: number
  }
  created_at: string
  updated_at: string
}

interface FacultyFormData {
  name: string
  code: string
  description: string
  admin_name?: string
  admin_email?: string
  admin_phone?: string
  temp_password?: string
  assign_admin: boolean
}

interface AdminFormData {
  admin_name: string
  admin_email: string
  admin_phone?: string
  temp_password: string
}

interface FacultyAdmin {
  id: string
  name: string
  email: string
  created_at: string
  status: 'active' | 'inactive'
}

export default function FacultyManagement() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false)
  const [showManageAdminsModal, setShowManageAdminsModal] = useState(false)
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [facultyAdmins, setFacultyAdmins] = useState<FacultyAdmin[]>([])
  const [loadingAdmins, setLoadingAdmins] = useState(false)
  const [formData, setFormData] = useState<FacultyFormData>({
    name: '',
    code: '',
    description: '',
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    temp_password: '',
    assign_admin: false
  })
  const [formLoading, setFormLoading] = useState(false)
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    temp_password: ''
  })

  useEffect(() => {
    loadFaculties()
  }, [])

  const loadFaculties = async () => {
    try {
      setLoading(true)
      if (!user?.university_id) return

      const facultiesData = await UniversityAdminService.getFaculties(user.university_id)
      setFaculties(facultiesData)
    } catch (error) {
      console.error('Error loading faculties:', error)
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

  const handleCreateFaculty = async () => {
    if (!user?.id || !user?.university_id) return

    try {
      setFormLoading(true)
      
      let result
      if (formData.assign_admin) {
        // Generate temp password if not provided
        const tempPassword = formData.temp_password || generateTempPassword()

        result = await UniversityAdminService.createFacultyWithAdmin(
          user.id,
          {
            ...formData,
            temp_password: tempPassword,
            admin_name: formData.admin_name || '',
            admin_email: formData.admin_email || '',
            admin_phone: formData.admin_phone || ''
          }
        )

        if (result.success) {
          await loadFaculties()
          setShowCreateModal(false)
          resetForm()
          alert(`Faculty and Admin created successfully!\n\nAdmin Email: ${formData.admin_email}\nTemporary Password: ${tempPassword}\n\nThe admin can log in with this password and will be required to change it on first login.\n\nIMPORTANT: Please share this password with the admin securely.`)
        }
      } else {
        // Create faculty without admin
        result = await UniversityAdminService.createFaculty(
          user.id,
          {
            name: formData.name,
            code: formData.code,
            description: formData.description
          }
        )
        
        if (result.success) {
          await loadFaculties()
          setShowCreateModal(false)
          resetForm()
          alert('Faculty created successfully!')
        }
      }
      
      if (!result.success) {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating faculty:', error)
      alert('Failed to create faculty')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditFaculty = async () => {
    if (!selectedFaculty || !user?.id) return

    try {
      setFormLoading(true)
      
      await UniversityAdminService.updateFaculty(selectedFaculty.id, {
        name: formData.name,
        code: formData.code,
        description: formData.description
      })

      await loadFaculties()
      setShowEditModal(false)
      setSelectedFaculty(null)
      resetForm()
    } catch (error) {
      console.error('Error updating faculty:', error)
      alert('Failed to update faculty')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteFaculty = async (facultyId: string) => {
    if (!confirm('Are you sure you want to delete this faculty? This will also delete all departments and associated data.')) {
      return
    }

    try {
      await UniversityAdminService.deleteFaculty(facultyId)
      await loadFaculties()
    } catch (error) {
      console.error('Error deleting faculty:', error)
      alert('Failed to delete faculty')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      admin_name: '',
      admin_email: '',
      admin_phone: '',
      temp_password: '',
      assign_admin: false
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setFormData({
      name: faculty.name,
      code: faculty.code,
      description: faculty.description || '',
      admin_name: faculty.admin_name || '',
      admin_email: faculty.admin_email || '',
      admin_phone: '',
      temp_password: '',
      assign_admin: false
    })
    setShowEditModal(true)
  }

  const openAssignAdminModal = (faculty: Faculty) => {
    setSelectedFaculty(faculty)
    setAdminFormData({
      admin_name: '',
      admin_email: '',
      admin_phone: '',
      temp_password: generateTempPassword()
    })
    setShowAssignAdminModal(true)
  }

  const handleAssignAdmin = async () => {
    if (!selectedFaculty || !user?.id) return

    try {
      setFormLoading(true)
      
      const result = await UniversityAdminService.assignFacultyAdmin(
        selectedFaculty.id,
        adminFormData
      )

      if (result.success) {
        await loadFaculties()
        setShowAssignAdminModal(false)
        setSelectedFaculty(null)
        const assignedEmail = adminFormData.admin_email
        const assignedPassword = adminFormData.temp_password
        setAdminFormData({
          admin_name: '',
          admin_email: '',
          admin_phone: '',
          temp_password: ''
        })
        alert(`Faculty admin assigned successfully!\n\nEmail: ${assignedEmail}\nTemporary Password: ${assignedPassword}\n\nThe admin can log in with this password and will be required to change it on first login.\n\nIMPORTANT: Please share this password with the admin securely.`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error assigning faculty admin:', error)
      alert('Failed to assign faculty admin')
    } finally {
      setFormLoading(false)
    }
  }

  const openManageAdminsModal = async () => {
    setShowManageAdminsModal(true)
    await loadFacultyAdmins()
  }

  const loadFacultyAdmins = async () => {
    try {
      setLoadingAdmins(true)
      if (!user?.university_id) return

      const adminsData = await UniversityAdminService.getFacultyAdmins(user.university_id)
      setFacultyAdmins(adminsData)
    } catch (error) {
      console.error('Error loading faculty admins:', error)
    } finally {
      setLoadingAdmins(false)
    }
  }

  const handleAddNewAdmin = async () => {
    if (!user?.id || !user?.university_id) return

    try {
      setFormLoading(true)
      
      const result = await UniversityAdminService.addFacultyAdmin(
        user.university_id,
        adminFormData
      )

      if (result.success) {
        await loadFacultyAdmins()
        const addedEmail = adminFormData.admin_email
        const addedPassword = adminFormData.temp_password
        setAdminFormData({
          admin_name: '',
          admin_email: '',
          admin_phone: '',
          temp_password: generateTempPassword()
        })
        alert(`Faculty admin added successfully!\n\nEmail: ${addedEmail}\nTemporary Password: ${addedPassword}\n\nThe admin can log in with this password and will be required to change it on first login.\n\nIMPORTANT: Please share this password with the admin securely.`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding faculty admin:', error)
      alert('Failed to add faculty admin')
    } finally {
      setFormLoading(false)
    }
  }

  const handleRemoveAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin?')) return

    try {
      await UniversityAdminService.removeFacultyAdmin(adminId)
      await loadFacultyAdmins()
      alert('Admin removed successfully')
    } catch (error) {
      console.error('Error removing admin:', error)
      alert('Failed to remove admin')
    }
  }

  const facultiesColumns = [
    {
      key: 'code',
      header: 'Code',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'name',
      header: 'Faculty Name',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'admin_name',
      header: 'Faculty Admin',
      render: (value: string, row: Faculty) => (
        <div>
          <div className="font-medium text-gray-900">{value || 'No Admin'}</div>
          {row.admin_email && (
            <div className="text-sm text-gray-500">{row.admin_email}</div>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (value: Faculty['stats']) => (
        <div className="text-sm">
          <div>Departments: {value.total_departments}</div>
          <div>Teachers: {value.total_teachers}</div>
          <div>Courses: {value.total_courses}</div>
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
      render: (_: any, row: Faculty) => (
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
          {!row.admin_id && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openAssignAdminModal(row)}
              className="text-xs px-2 py-1"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              Assign Admin
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteFaculty(row.id)}
            className="text-xs px-2 py-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
      width: '200px'
    }
  ]

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (faculty.admin_name && faculty.admin_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <Card title="Faculty Management" className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search faculties..."
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
          <Button variant="secondary" onClick={openManageAdminsModal}>
            <Settings className="w-4 h-4 mr-2" />
            Manage Admins
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
        
        <Table
          columns={facultiesColumns}
          data={filteredFaculties}
          loading={loading}
          emptyMessage="No faculties found"
        />
      </Card>

      {/* Create Faculty Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Faculty"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Faculty Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Faculty of Engineering"
              required
            />
            <Input
              label="Faculty Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., ENG"
              maxLength={10}
              required
            />
          </div>
          
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Faculty description (optional)"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFaculty} loading={formLoading}>
              Create Faculty
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Faculty Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Faculty"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Faculty Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Faculty of Engineering"
              required
            />
            <Input
              label="Faculty Code"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
              placeholder="e.g., ENG"
              maxLength={10}
              required
            />
          </div>
          
          <TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Faculty description (optional)"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFaculty} loading={formLoading}>
              Update Faculty
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Admin Modal */}
      <Modal
        isOpen={showAssignAdminModal}
        onClose={() => setShowAssignAdminModal(false)}
        title={`Assign Admin to ${selectedFaculty?.name}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Admin Name"
              value={adminFormData.admin_name}
              onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_name: e.target.value }))}
              placeholder="Faculty admin full name"
              required
            />
            <Input
              label="Admin Email"
              type="email"
              value={adminFormData.admin_email}
              onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_email: e.target.value }))}
              placeholder="admin@university.edu"
              required
            />
            <Input
              label="Admin Phone (Optional)"
              type="tel"
              value={adminFormData.admin_phone || ''}
              onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
              placeholder="+1234567890"
            />
            <Input
              label="Temporary Password"
              value={adminFormData.temp_password}
              onChange={(e) => setAdminFormData(prev => ({ ...prev, temp_password: e.target.value }))}
              placeholder="Auto-generated password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAssignAdminModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignAdmin} loading={formLoading}>
              Assign Admin
            </Button>
          </div>
        </div>
      </Modal>

      {/* Manage Admins Modal */}
      <Modal
        isOpen={showManageAdminsModal}
        onClose={() => setShowManageAdminsModal(false)}
        title="Manage Faculty Admins"
      >
        <div className="space-y-6">
          {/* Add New Admin Form */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Add New Faculty Admin
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Admin Name"
                value={adminFormData.admin_name}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_name: e.target.value }))}
                placeholder="Faculty admin full name"
                required
              />
              <Input
                label="Admin Email"
                type="email"
                value={adminFormData.admin_email}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_email: e.target.value }))}
                placeholder="admin@university.edu"
                required
              />
            </div>
            <div className="mt-4">
              <Input
                label="Admin Phone (Optional)"
                type="tel"
                value={adminFormData.admin_phone || ''}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, admin_phone: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <div className="mt-4">
              <Input
                label="Temporary Password"
                value={adminFormData.temp_password}
                onChange={(e) => setAdminFormData(prev => ({ ...prev, temp_password: e.target.value }))}
                placeholder="Auto-generated password"
                required
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleAddNewAdmin} loading={formLoading}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </div>
          </div>

          {/* Current Admins List */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Current Faculty Admins ({facultyAdmins.length})
            </h4>
            {loadingAdmins ? (
              <div className="text-center py-8 text-gray-500">Loading admins...</div>
            ) : facultyAdmins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No faculty admins found</div>
            ) : (
              <div className="space-y-3">
                {facultyAdmins.map((admin) => (
                  <div key={admin.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{admin.name}</div>
                      <div className="text-sm text-gray-500">{admin.email}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Added: {new Date(admin.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        admin.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.status}
                      </span>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleRemoveAdmin(admin.id)}
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
            <Button variant="secondary" onClick={() => setShowManageAdminsModal(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}