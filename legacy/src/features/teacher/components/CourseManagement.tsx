import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  BarChart3,
  Target
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../../../store/store'
import { Card, Button, Table } from '../../../shared/components/ui'
import { TeacherService, type Course, type Semester, type CreateCourseData } from '../services/teacherService'
import { useSelector } from 'react-redux'

export interface CourseManagementRef {
  openCreateCourseModal: () => void
}

interface CourseManagementProps {
  onManageCLOs?: (courseId: string, courseName: string) => void
}

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  course?: Course | null
  semesters: Semester[]
  onSubmit: (data: CreateCourseData) => Promise<void>
}

const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, course, semesters, onSubmit }) => {
  const [formData, setFormData] = useState<CreateCourseData>({
    course_code: '',
    course_title: '',
    credit_hours: 3,
    sections: [],
    semester_id: ''
  })
  const [sectionInput, setSectionInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (course) {
      setFormData({
        course_code: course.course_code,
        course_title: course.course_title,
        credit_hours: course.credit_hours,
        sections: course.sections || [],
        semester_id: course.semester_id
      })
    } else {
      setFormData({
        course_code: '',
        course_title: '',
        credit_hours: 3,
        sections: [],
        semester_id: ''
      })
    }
  }, [course])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting course:', error)
    } finally {
      setLoading(false)
    }
  }

  const addSection = () => {
    if (sectionInput.trim() && !formData.sections.includes(sectionInput.trim().toUpperCase())) {
      setFormData(prev => ({
        ...prev,
        sections: [...prev.sections, sectionInput.trim().toUpperCase()]
      }))
      setSectionInput('')
    }
  }

  const removeSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s !== section)
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          {course ? 'Edit Course' : 'Create New Course'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Code *
            </label>
            <input
              type="text"
              value={formData.course_code}
              onChange={(e) => setFormData(prev => ({ ...prev, course_code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., CSE101"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.course_title}
              onChange={(e) => setFormData(prev => ({ ...prev, course_title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Introduction to Computer Science"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit Hours *
            </label>
            <select
              value={formData.credit_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, credit_hours: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {[1, 2, 3, 4, 5, 6].map(hours => (
                <option key={hours} value={hours}>{hours} Credit{hours > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester *
            </label>
            <select
              value={formData.semester_id}
              onChange={(e) => setFormData(prev => ({ ...prev, semester_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Semester</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} {semester.academic_year}
                  {semester.is_current && ' (Current)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sections
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={sectionInput}
                onChange={(e) => setSectionInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSection())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., A, B, C"
              />
              <button
                type="button"
                onClick={addSection}
                className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.sections.map(section => (
                <span
                  key={section}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center space-x-1"
                >
                  <span>{section}</span>
                  <button
                    type="button"
                    onClick={() => removeSection(section)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 order-1 sm:order-2"
            >
              {loading ? 'Saving...' : course ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


const CourseManagement = forwardRef<CourseManagementRef, CourseManagementProps>(({ onManageCLOs }, ref) => {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const [courses, setCourses] = useState<Course[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSemester, setFilterSemester] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // Expose function to parent component
  useImperativeHandle(ref, () => ({
    openCreateCourseModal: () => {
      setEditingCourse(null)
      setShowModal(true)
    }
  }))

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user?.id || !user.university_id) return

    try {
      setLoading(true)
      const [coursesData, semestersData] = await Promise.all([
        TeacherService.getCourses(user.id),
        TeacherService.getSemesters(user.university_id)
      ])
      
      setCourses(coursesData)
      setSemesters(semestersData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async (data: CreateCourseData) => {
    if (!user?.id) return

    const result = await TeacherService.createCourse(user.id, data)
    if (result.success) {
      await loadData()
      setShowModal(false)
    } else {
      alert(result.error || 'Failed to create course')
    }
  }

  const handleEditCourse = async (data: CreateCourseData) => {
    if (!editingCourse) return

    const result = await TeacherService.updateCourse(editingCourse.id, data)
    if (result.success) {
      await loadData()
      setShowModal(false)
      setEditingCourse(null)
    } else {
      alert(result.error || 'Failed to update course')
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      const result = await TeacherService.deleteCourse(courseId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.error || 'Failed to delete course')
      }
    }
  }

  const handleViewSessions = (course: Course) => {
    navigate(`/teacher/courses/${course.id}/sessions`)
  }


  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.course_title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = !filterSemester || course.semester_id === filterSemester
    const matchesStatus = !filterStatus || course.status === filterStatus
    
    return matchesSearch && matchesSemester && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const coursesColumns = [
    {
      key: 'course_info',
      header: 'Course Details',
      render: (_: any, row: Course) => (
        <div>
          <div className="font-medium text-gray-900">{row.course_code}</div>
          <div className="text-sm text-gray-600">{row.course_title}</div>
          <div className="flex items-center mt-1 text-xs text-gray-500">
            <span>{row.credit_hours} credit{row.credit_hours > 1 ? 's' : ''}</span>
          </div>
        </div>
      )
    },
    {
      key: 'semester',
      header: 'Semester',
      render: (_: any, row: Course) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{row.semester_name}</div>
          <div className="text-gray-600">{row.academic_year}</div>
        </div>
      )
    },
    {
      key: 'sections',
      header: 'Sections',
      render: (_: any, row: Course) => (
        <div>
          {row.sections.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.sections.map(section => (
                <span
                  key={section}
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800"
                >
                  {section}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-sm text-gray-500">No sections</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, row: Course) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(row.status)}`}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: Course) => (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleViewSessions(row)}
              className="text-xs px-2 py-1"
            >
              <BarChart3 className="w-3 h-3 mr-1" />
              Sessions
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditingCourse(row)
                setShowModal(true)
              }}
              className="text-xs px-2 py-1"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          </div>
          <div className="flex gap-1">
            {onManageCLOs && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onManageCLOs(row.id, `${row.course_code} - ${row.course_title}`)}
                className="text-xs px-2 py-1"
              >
                <Target className="w-3 h-3 mr-1" />
                CLO Mapping
              </Button>
            )}
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteCourse(row.id)}
            className="text-xs px-2 py-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
          </div>
        </div>
      ),
      width: '200px'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card title={`My Courses (${filteredCourses.length})`}>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Semesters</option>
              {semesters.map(semester => (
                <option key={semester.id} value={semester.id}>
                  {semester.name} {semester.academic_year}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={() => {
              setEditingCourse(null)
              setShowModal(true)
            }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>

        <Table
          columns={coursesColumns}
          data={filteredCourses}
          loading={loading}
          emptyMessage={courses.length === 0 ? "You haven't created any courses yet." : "No courses match your current filters."}
        />
      </Card>

      {/* Course Modal */}
      <CourseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingCourse(null)
        }}
        course={editingCourse}
        semesters={semesters}
        onSubmit={editingCourse ? handleEditCourse : handleCreateCourse}
      />

    </div>
  )
})

CourseManagement.displayName = 'CourseManagement'

export default CourseManagement