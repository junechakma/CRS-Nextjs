import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { 
  Search, 
  BookOpen,
  Calendar,
  Activity
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Table } from '../../../shared/components/ui'
import { DepartmentModeratorService, type Course } from '../services/departmentModeratorService'

export default function CourseManagement() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<string>('')
  const [selectedSemester, setSelectedSemester] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  useEffect(() => {
    loadCourses()
  }, [])

  const loadCourses = async () => {
    try {
      setLoading(true)
      if (!user?.department_id) return

      const coursesData = await DepartmentModeratorService.getCourses(user.department_id)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const coursesColumns = [
    {
      key: 'code',
      header: 'Course Code',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'name',
      header: 'Course Name',
      render: (value: string) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
        </div>
      )
    },
    {
      key: 'teacher_name',
      header: 'Teacher',
      render: (value: string) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'semester_name',
      header: 'Semester',
      render: (value: string, row: Course) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.academic_year}</div>
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (value: Course['stats']) => (
        <div className="text-sm">
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
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {value.toUpperCase()}
        </span>
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
    }
  ]

  // Get unique teachers and semesters for filtering
  const uniqueTeachers = Array.from(new Set(courses.map(c => c.teacher_name).filter(Boolean)))
  const uniqueSemesters = Array.from(new Set(courses.map(c => c.semester_name).filter(Boolean)))

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher_name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTeacher = !selectedTeacher || course.teacher_name === selectedTeacher
    const matchesSemester = !selectedSemester || course.semester_name === selectedSemester
    const matchesStatus = !selectedStatus || course.status === selectedStatus
    
    return matchesSearch && matchesTeacher && matchesSemester && matchesStatus
  })

  const totalStats = courses.reduce((acc, course) => {
    acc.totalCourses += 1
    acc.totalSessions += course.stats.total_sessions
    acc.totalResponses += course.stats.total_responses
    acc.activeCourses += course.status === 'active' ? 1 : 0
    return acc
  }, { totalCourses: 0, totalSessions: 0, totalResponses: 0, activeCourses: 0 })

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalCourses}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeCourses}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalSessions}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalResponses}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Course Management" className="mb-6">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
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
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full sm:w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Teachers</option>
              {uniqueTeachers.map(teacher => (
                <option key={teacher} value={teacher}>{teacher}</option>
              ))}
            </select>
            
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full sm:w-48 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-32 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <Table
          columns={coursesColumns}
          data={filteredCourses}
          loading={loading}
          emptyMessage="No courses found"
        />
      </Card>
    </div>
  )
}