import React, { useState, useEffect } from 'react'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  BookOpen,
  Users,
  TrendingUp,
  Eye
} from 'lucide-react'
import { Card, Button } from './ui'
import CourseSessionsManagement from './CourseSessionsManagement'

interface Teacher {
  id: string
  name: string
  email: string
  initial?: string
  phone?: string
  department_id: string
  department_name: string
  faculty_id: string
  faculty_name: string
  status: 'active' | 'blocked'
  stats: {
    total_courses: number
    total_sessions: number
    total_responses: number
  }
  created_at: string
  last_login?: string
}

interface Course {
  id: string
  course_code: string
  course_title: string
  credit_hours: number
  sections: string[]
  semester_id: string
  semester_name: string
  academic_year: string
  department_name: string
  faculty_name: string
  university_name: string
  status: 'active' | 'inactive' | 'completed' | 'cancelled'
  settings: {
    allow_responses: boolean
    response_deadline?: string
    require_attendance: boolean
    min_response_count: number
  }
  stats: {
    total_sessions: number
    total_responses: number
    completion_rate: number
  }
  created_at: string
  updated_at: string
}

interface TeacherDetailsViewProps {
  teacher: Teacher
  onBack: () => void
  getTeacherCourses: (teacherId: string) => Promise<Course[]>
}

const TeacherDetailsView: React.FC<TeacherDetailsViewProps> = ({
  teacher,
  onBack,
  getTeacherCourses
}) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'courses' | 'course-sessions'>('courses')

  useEffect(() => {
    loadTeacherCourses()
  }, [teacher.id])

  const loadTeacherCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await getTeacherCourses(teacher.id)
      setCourses(coursesData)
    } catch (error) {
      console.error('Error loading teacher courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewCourseSessions = (course: Course) => {
    setSelectedCourse(course)
    setView('course-sessions')
  }

  const handleBackToCourses = () => {
    setSelectedCourse(null)
    setView('courses')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (view === 'course-sessions' && selectedCourse) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="secondary" onClick={handleBackToCourses}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedCourse.course_code} - {selectedCourse.course_title}
            </h2>
            <p className="text-sm text-gray-600">
              {teacher.name} | {teacher.department_name}
            </p>
          </div>
        </div>
        
        <CourseSessionsManagement
          courseId={selectedCourse.id}
          course={selectedCourse}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="secondary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Teacher Details</h2>
          <p className="text-sm text-gray-600">View teacher information and courses</p>
        </div>
      </div>

      {/* Teacher Information Card */}
      <Card title="Teacher Information">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                  <p className="text-sm text-gray-600">{teacher.initial || 'No initial'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{teacher.email}</span>
                </div>
                
                {teacher.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{teacher.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-sm text-gray-700">{teacher.department_name}</div>
                    <div className="text-xs text-gray-500">{teacher.faculty_name}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="text-xs text-gray-500">Joined</div>
                    <div className="text-sm text-gray-700">{formatDate(teacher.created_at)}</div>
                  </div>
                </div>
                
                {teacher.last_login && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Last Login</div>
                      <div className="text-sm text-gray-700">{formatDate(teacher.last_login)}</div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  teacher.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{teacher.stats.total_courses}</div>
                    <div className="text-sm text-blue-700">Total Courses</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{teacher.stats.total_sessions}</div>
                    <div className="text-sm text-green-700">Total Sessions</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{teacher.stats.total_responses}</div>
                    <div className="text-sm text-purple-700">Total Responses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Courses Card */}
      <Card title={`Courses (${courses.length})`}>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-600">Loading courses...</div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">This teacher is not assigned to any courses yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">
                      {course.course_code}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{course.course_title}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{course.semester_name} {course.academic_year}</span>
                      <span>•</span>
                      <span>
                        {course.sections && course.sections.length > 0 
                          ? `${course.sections.length} section${course.sections.length !== 1 ? 's' : ''}`
                          : 'No sections'
                        }
                      </span>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{course.stats.total_sessions}</div>
                    <div className="text-xs text-gray-500">Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">{course.stats.total_responses}</div>
                    <div className="text-xs text-gray-500">Responses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{course.stats.completion_rate}%</div>
                    <div className="text-xs text-gray-500">Completion</div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewCourseSessions(course)}
                    className="w-full text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Sessions
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default TeacherDetailsView