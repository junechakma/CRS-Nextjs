import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Upload,
  Download,
  Eye
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Table, Button, Modal, Input } from '../../../shared/components/ui'
import TeacherDetailsView from '../../../shared/components/TeacherDetailsView'
import { DepartmentModeratorService, type Teacher } from '../services/departmentModeratorService'

interface TeacherFormData {
  name: string
  email: string
  initial: string
  phone: string
  temp_password: string
}

export default function TeacherManagement() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
  const [showTeacherDetails, setShowTeacherDetails] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    initial: '',
    phone: '',
    temp_password: ''
  })
  const [formLoading, setFormLoading] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = async () => {
    try {
      setLoading(true)
      if (!user?.department_id) return

      const teachersData = await DepartmentModeratorService.getTeachers(user.department_id)
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error loading teachers:', error)
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

  const handleCreateTeacher = async () => {
    if (!user?.id || !user?.department_id) return

    try {
      setFormLoading(true)
      
      const tempPassword = formData.temp_password || generateTempPassword()
      
      const result = await DepartmentModeratorService.createTeacher(user.id, {
        ...formData,
        temp_password: tempPassword
      })

      if (result.success) {
        await loadTeachers()
        setShowCreateModal(false)
        resetForm()
        alert(`Teacher created successfully!\n\nEmail: ${formData.email}\nTemporary Password: ${tempPassword}\n\nThe teacher can log in with this password and will be required to change it on first login.\n\nIMPORTANT: Please share this password with the teacher securely.`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating teacher:', error)
      alert('Failed to create teacher')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditTeacher = async () => {
    if (!selectedTeacher || !user?.id) return

    try {
      setFormLoading(true)
      
      await DepartmentModeratorService.updateTeacher(selectedTeacher.id, {
        name: formData.name,
        email: formData.email,
        initial: formData.initial,
        phone: formData.phone
      })

      await loadTeachers()
      setShowEditModal(false)
      setSelectedTeacher(null)
      resetForm()
    } catch (error) {
      console.error('Error updating teacher:', error)
      alert('Failed to update teacher')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This will also delete all courses and associated data.')) {
      return
    }

    try {
      await DepartmentModeratorService.deleteTeacher(teacherId)
      await loadTeachers()
    } catch (error) {
      console.error('Error deleting teacher:', error)
      alert('Failed to delete teacher')
    }
  }

  const handleToggleTeacherStatus = async (teacherId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'
    
    try {
      await DepartmentModeratorService.updateTeacherStatus(teacherId, newStatus)
      await loadTeachers()
    } catch (error) {
      console.error('Error updating teacher status:', error)
      alert('Failed to update teacher status')
    }
  }

  const handleBulkUpload = async () => {
    if (!csvFile || !user?.id) return

    try {
      setFormLoading(true)
      
      const result = await DepartmentModeratorService.bulkUploadTeachers(user.id, csvFile)

      if (result.success) {
        await loadTeachers()
        setShowBulkUploadModal(false)
        setCsvFile(null)
        alert(`Bulk upload completed! ${result.created_count} teachers created.${result.error ? ` Errors: ${result.error}` : ''}`)
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Error uploading teachers:', error)
      alert('Failed to upload teachers')
    } finally {
      setFormLoading(false)
    }
  }

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'initial', 'phone']
    const csvContent = headers.join(',') + '\n' + 
      'John Doe,john.doe@university.edu,JD,+1234567890\n' +
      'Jane Smith,jane.smith@university.edu,JS,+1234567891'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'teachers_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      initial: '',
      phone: '',
      temp_password: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setFormData(prev => ({ ...prev, temp_password: generateTempPassword() }))
    setShowCreateModal(true)
  }

  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      initial: teacher.initial || '',
      phone: teacher.phone || '',
      temp_password: ''
    })
    setShowEditModal(true)
  }

  const handleViewTeacherDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setShowTeacherDetails(true)
  }

  const handleBackFromTeacherDetails = () => {
    setShowTeacherDetails(false)
    setSelectedTeacher(null)
  }

  const teachersColumns = [
    {
      key: 'initial',
      header: 'Initial',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value || 'N/A'}</div>
      )
    },
    {
      key: 'name',
      header: 'Teacher Name',
      render: (value: string, row: Teacher) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (value: string) => (
        <div className="text-gray-600">{value || 'N/A'}</div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (value: Teacher['stats']) => (
        <div className="text-sm">
          <div>Courses: {value.total_courses}</div>
          <div>Sessions: {value.total_sessions}</div>
          <div>Responses: {value.total_responses}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'last_login',
      header: 'Last Login',
      render: (value: string) => (
        <div className="text-gray-500 text-sm">
          {value ? new Date(value).toLocaleDateString() : 'Never'}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Teacher) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleViewTeacherDetails(row)}
            className="text-xs px-2 py-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditModal(row)}
            className="text-xs px-2 py-1"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant={row.status === 'active' ? 'danger' : 'secondary'}
            onClick={() => handleToggleTeacherStatus(row.id, row.status)}
            className="text-xs px-2 py-1"
          >
            {row.status === 'active' ? 'Block' : 'Unblock'}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteTeacher(row.id)}
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

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.initial && teacher.initial.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !selectedStatus || teacher.status === selectedStatus
    
    return matchesSearch && matchesStatus
  })

  // If showing teacher details, render the TeacherDetailsView component
  if (showTeacherDetails && selectedTeacher) {
    return (
      <TeacherDetailsView
        teacher={selectedTeacher}
        onBack={handleBackFromTeacherDetails}
        getTeacherCourses={DepartmentModeratorService.getTeacherCourses}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Card title="Teacher Management" className="mb-6">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowBulkUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
        
        <Table
          columns={teachersColumns}
          data={filteredTeachers}
          loading={loading}
          emptyMessage="No teachers found"
        />
      </Card>

      {/* Create Teacher Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add New Teacher"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teacher Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="teacher@university.edu"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial"
              value={formData.initial}
              onChange={(e) => setFormData(prev => ({ ...prev, initial: e.target.value.toUpperCase() }))}
              placeholder="e.g., JD"
              maxLength={10}
            />
            <Input
              label="Phone (Optional)"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>

          <Input
            label="Temporary Password"
            value={formData.temp_password}
            onChange={(e) => setFormData(prev => ({ ...prev, temp_password: e.target.value }))}
            placeholder="Auto-generated password"
            required
          />
          <p className="text-sm text-gray-500 mt-1 -mb-3">Teacher must change on first login</p>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeacher} loading={formLoading}>
              Create Teacher
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Teacher Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Teacher"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Teacher Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Full name"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="teacher@university.edu"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Initial"
              value={formData.initial}
              onChange={(e) => setFormData(prev => ({ ...prev, initial: e.target.value.toUpperCase() }))}
              placeholder="e.g., JD"
              maxLength={10}
            />
            <Input
              label="Phone (Optional)"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTeacher} loading={formLoading}>
              Update Teacher
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        title="Bulk Upload Teachers"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Columns: name, email, initial, phone</li>
              <li>• Email must be unique</li>
              <li>• Initial must be unique within department</li>
              <li>• Phone number is optional</li>
            </ul>
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Download Template
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowBulkUploadModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkUpload}
              loading={formLoading}
              disabled={!csvFile}
            >
              Upload Teachers
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}