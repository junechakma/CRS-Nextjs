import { useState } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react'
import { Card, Table, Button, Modal, Input, Select } from '../../../shared/components/ui'
import DashboardLayout from '../../../shared/components/layout/DashboardLayout'
import { useSemesterManagement } from '../hooks/useSemesterManagement'
import type { Semester, CreateSemesterData } from '../services/universityAdminService'


interface SemesterFormData {
  name: 'Spring' | 'Summer' | 'Autumn' | 'Year' | ''
  academic_year: string
  start_date: string
  end_date: string
}

const SEMESTER_OPTIONS = [
  { value: 'Spring', label: 'Spring' },
  { value: 'Summer', label: 'Summer' },
  { value: 'Autumn', label: 'Autumn' }
]


export default function SemesterManagement() {
  const {
    semesters,
    loading,
    createSemester: createSemesterHook,
    updateSemester: updateSemesterHook,
    setCurrentSemester: setCurrentSemesterHook,
    deleteSemester: deleteSemesterHook
  } = useSemesterManagement()

  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null)
  const [formData, setFormData] = useState<SemesterFormData>({
    name: '',
    academic_year: new Date().getFullYear().toString(),
    start_date: '',
    end_date: ''
  })
  const [formLoading, setFormLoading] = useState(false)


  const handleCreateSemester = async () => {
    try {
      setFormLoading(true)

      const result = await createSemesterHook({
        ...formData,
        name: formData.name === '' ? 'Spring' : formData.name,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined
      } as CreateSemesterData)

      if (result.success) {
        setShowCreateModal(false)
        resetForm()
        alert('Semester created successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating semester:', error)
      alert('Failed to create semester')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditSemester = async () => {
    if (!selectedSemester) return

    try {
      setFormLoading(true)

      await updateSemesterHook(selectedSemester.id, {
        name: formData.name === '' ? undefined : formData.name,
        academic_year: formData.academic_year,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined
      })

      setShowEditModal(false)
      setSelectedSemester(null)
      resetForm()
      alert('Semester updated successfully!')
    } catch (error) {
      console.error('Error updating semester:', error)
      alert('Failed to update semester')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteSemester = async (semesterId: string) => {
    if (!confirm('Are you sure you want to delete this semester? This will also affect all courses associated with it.')) {
      return
    }

    try {
      await deleteSemesterHook(semesterId)
      alert('Semester deleted successfully!')
    } catch (error) {
      console.error('Error deleting semester:', error)
      alert('Failed to delete semester')
    }
  }

  const handleSetCurrentSemester = async (semesterId: string) => {
    if (!confirm('Are you sure you want to set this as the current semester? This will affect all new course registrations.')) {
      return
    }

    try {
      const result = await setCurrentSemesterHook(semesterId)
      if (result.success) {
        alert('Current semester updated successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error setting current semester:', error)
      alert('Failed to set current semester')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      academic_year: new Date().getFullYear().toString(),
      start_date: '',
      end_date: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (semester: Semester) => {
    setSelectedSemester(semester)
    setFormData({
      name: semester.name,
      academic_year: semester.academic_year,
      start_date: semester.start_date || '',
      end_date: semester.end_date || ''
    })
    setShowEditModal(true)
  }

  const semestersColumns = [
    {
      key: 'name',
      header: 'Semester',
      render: (value: string, row: Semester) => (
        <div className="flex items-center">
          <div className="font-medium text-gray-900">{value} {row.academic_year}</div>
          {row.is_current && (
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
              Current
            </span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value: string) => {
        const statusConfig = {
          active: { icon: CheckCircle, color: 'bg-green-100 text-green-800' },
          inactive: { icon: XCircle, color: 'bg-gray-100 text-gray-800' },
          completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800' }
        }
        const config = statusConfig[value as keyof typeof statusConfig]
        const Icon = config.icon

        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
            <Icon className="w-3 h-3 mr-1" />
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        )
      }
    },
    {
      key: 'start_date',
      header: 'Duration',
      render: (value: string, row: Semester) => (
        <div className="text-sm text-gray-600">
          {value && row.end_date ? (
            <>
              {new Date(value).toLocaleDateString()} - {new Date(row.end_date).toLocaleDateString()}
            </>
          ) : (
            'Not set'
          )}
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (value: Semester['stats']) => (
        <div className="text-sm">
          <div>Courses: {value.total_courses}</div>
          <div>Sessions: {value.total_sessions}</div>
          {/* <div>Responses: {value.total_responses}</div> */}
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
      render: (_: any, row: Semester) => (
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
          {!row.is_current && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleSetCurrentSemester(row.id)}
              className="text-xs px-2 py-1"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Set Current
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteSemester(row.id)}
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

  const filteredSemesters = semesters.filter(semester =>
    `${semester.name} ${semester.academic_year}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    semester.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Generate year options (current year ± 5 years)
  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 11 }, (_, i) => {
    const year = currentYear - 5 + i
    return { value: year.toString(), label: year.toString() }
  })

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Semester Management</h1>
          <p className="text-gray-600">Manage academic semesters for your university</p>
        </div>

        <Card title="Academic Semesters" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search semesters..."
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
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Semester
            </Button>
          </div>

          <Table
            columns={semestersColumns}
            data={filteredSemesters}
            loading={loading}
            emptyMessage="No semesters found"
          />
        </Card>

        {/* Create Semester Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Semester"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Semester"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value as any }))}
                required
              >
                <option value="">Select semester</option>
                {SEMESTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Academic Year"
                value={formData.academic_year}
                onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                required
              >
                <option value="">Select year</option>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date (Optional)"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="End Date (Optional)"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSemester} loading={formLoading}>
                Create Semester
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Semester Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Semester"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Semester"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value as any }))}
                required
              >
                <option value="">Select semester</option>
                {SEMESTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Academic Year"
                value={formData.academic_year}
                onChange={(e) => setFormData(prev => ({ ...prev, academic_year: e.target.value }))}
                required
              >
                <option value="">Select year</option>
                {yearOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Start Date (Optional)"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
              <Input
                label="End Date (Optional)"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSemester} loading={formLoading}>
                Update Semester
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}