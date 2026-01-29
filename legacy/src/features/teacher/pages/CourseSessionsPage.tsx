import { useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button } from '../../../shared/components/ui'
import CourseSessionsManagement, { type CourseSessionsManagementRef } from '../components/CourseSessionsManagement'
import { useCourses } from '../hooks/useCourses'

export default function CourseSessionsPage() {
  const navigate = useNavigate()
  const { courseId } = useParams<{ courseId: string }>()
  const { user } = useSelector((state: RootState) => state.auth)
  const { courses } = useCourses(user?.id)
  const sessionsManagementRef = useRef<CourseSessionsManagementRef>(null)

  const course = courses.find(c => c.id === courseId)

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Course Not Found</h1>
                <p className="text-sm sm:text-base text-gray-600">The requested course could not be found.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
                <Button onClick={() => navigate('/teacher/courses')} className="w-full sm:w-auto">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Courses
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Course Sessions - {course.course_code}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">{course.course_title}</p>
              <p className="text-xs sm:text-sm text-gray-500">
                {course.semester_name} {course.academic_year} • {course.credit_hours} credit hours
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/teacher/courses')}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
              <Button onClick={() => sessionsManagementRef.current?.openCreateSessionModal()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CourseSessionsManagement ref={sessionsManagementRef} courseId={courseId!} course={course} />
      </div>
    </div>
  )
}