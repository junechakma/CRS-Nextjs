import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus, Settings, Target } from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button } from '../../../shared/components/ui'
import CourseManagement, { type CourseManagementRef } from '../components/CourseManagement'
import CLOManagement from '../components/CLOManagement'

export default function CoursesPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const courseManagementRef = useRef<CourseManagementRef>(null)
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; name: string } | null>(null)
  const [showCLOModal, setShowCLOModal] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Course Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button variant="secondary" onClick={() => navigate('/teacher/profile')} className="w-full sm:w-auto">
                <Settings className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button variant="secondary" onClick={() => navigate('/teacher/sessions')} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
              <Button onClick={() => courseManagementRef.current?.openCreateCourseModal()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <CourseManagement 
          ref={courseManagementRef}
          onManageCLOs={(courseId: string, courseName: string) => {
            setSelectedCourse({ id: courseId, name: courseName })
            setShowCLOModal(true)
          }}
        />
      </div>

      {/* CLO Management Modal */}
      {showCLOModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Target className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">CLO Management</h2>
              </div>
              <button
                onClick={() => {
                  setShowCLOModal(false)
                  setSelectedCourse(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CLOManagement courseId={selectedCourse.id} courseName={selectedCourse.name} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}