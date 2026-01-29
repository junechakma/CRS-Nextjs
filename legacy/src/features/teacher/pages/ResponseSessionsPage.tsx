import { useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button } from '../../../shared/components/ui'
import ResponseSessionManagement, { type ResponseSessionManagementRef } from '../components/ResponseSessionManagement'

export default function ResponseSessionsPage() {
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const sessionManagementRef = useRef<ResponseSessionManagementRef>(null)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Response Sessions</h1>
              <p className="text-sm sm:text-base text-gray-600">Welcome back, {user?.name}</p>
              <p className="text-xs sm:text-sm text-gray-500">{user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-4">
              <Button variant="secondary" onClick={() => navigate('/teacher/courses')} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
              <Button onClick={() => sessionManagementRef.current?.openCreateSessionModal()} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <ResponseSessionManagement ref={sessionManagementRef} />
      </div>
    </div>
  )
}