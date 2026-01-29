import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  LogOut,
  Home
} from 'lucide-react'
import type { RootState, AppDispatch } from '../../../store/store'
import { signOut, getCurrentUser } from '../../../store/slices/authSlice'
import { Card, Button } from '../../../shared/components/ui'
import { UniversityAdminService } from '../services/universityAdminService'

interface ApplicationStatus {
  status: 'pending' | 'approved' | 'rejected'
  university_name: string
  university_code: string
  applied_date: string
  review_date?: string
  rejection_reason?: string
}

export default function ApplicationPendingPage() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    // DEBUG: Log user data to see what's happening
    console.log('ApplicationPendingPage - User data:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      approval_status: user?.approval_status,
      university_id: user?.university_id,
      status: user?.status
    })

    // If user is approved, they shouldn't be on this page
    if (user?.approval_status === 'approved') {
      console.log('User is APPROVED - redirecting...')
      if (user.university_id) {
        // Has university - go to dashboard
        console.log('Has university_id - going to dashboard')
        navigate('/university-admin/dashboard', { replace: true })
      } else {
        // No university yet - go to create university
        console.log('No university_id - going to apply page')
        navigate('/university-admin/apply', { replace: true })
      }
      return
    }

    console.log('User is NOT approved - loading application status')
    // Only load application status if user is NOT approved
    loadApplicationStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadApplicationStatus = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const status = await UniversityAdminService.getApplicationStatus(user.id)
        setApplicationStatus(status)

        // If approved, refresh user data to get the new role/university_id
        if (status.status === 'approved') {
          console.log('Application approved - refreshing user data...')
          await dispatch(getCurrentUser()).unwrap()
        }
      }
    } catch (error) {
      console.error('Error loading application status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadApplicationStatus()
    // Also refresh user data in case it changed in the background
    await dispatch(getCurrentUser())
    setRefreshing(false)
  }

  const handleSignOut = () => {
    dispatch(signOut())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application status...</p>
        </div>
      </div>
    )
  }

  if (!applicationStatus) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <div className="text-center p-6">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Application Found</h1>
            <p className="text-gray-600 mb-6">
              You haven't submitted a university application yet.
              Please submit your application to get started.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/university-admin/apply')} fullWidth>
                Submit Application
              </Button>
              <Button variant="secondary" onClick={handleSignOut} fullWidth>
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">CRS System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">University Admin</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4">
            {applicationStatus.status === 'pending' && (
              <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
            )}
            {applicationStatus.status === 'approved' && (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            )}
            {applicationStatus.status === 'rejected' && (
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            University Application {applicationStatus.status.charAt(0).toUpperCase() + applicationStatus.status.slice(1)}
          </h1>
          <p className="text-lg text-gray-600">
            {applicationStatus.university_name} ({applicationStatus.university_code})
          </p>
        </div>

        {/* Application Status Card */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">University Name</p>
                <p className="text-lg text-gray-900">{applicationStatus.university_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">University Code</p>
                <p className="text-lg text-gray-900">{applicationStatus.university_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Application Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(applicationStatus.applied_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Current Status</p>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${applicationStatus.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : applicationStatus.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {applicationStatus.status.toUpperCase()}
                </span>
              </div>
            </div>

            {applicationStatus.review_date && (
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Review Date</p>
                <p className="text-lg text-gray-900">
                  {new Date(applicationStatus.review_date).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Status-specific messages */}
            {applicationStatus.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <Clock className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">
                      Application Under Review
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Your university application is currently being reviewed by our administrators.
                      This process typically takes 1-3 business days. You will receive an email notification
                      once a decision has been made.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {applicationStatus.status === 'rejected' && applicationStatus.rejection_reason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <XCircle className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Application Rejected
                    </h3>
                    <p className="text-sm text-red-700 mb-2">
                      Unfortunately, your university application has been rejected for the following reason:
                    </p>
                    <p className="text-sm text-red-700 font-medium">
                      {applicationStatus.rejection_reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {applicationStatus.status === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-green-800 mb-1">
                      Application Approved
                    </h3>
                    <p className="text-sm text-green-700">
                      Congratulations! Your university application has been approved.
                      You should now have access to the full University Admin dashboard.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="min-w-[160px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Checking...' : 'Check Status'}
          </Button>

          {applicationStatus.status === 'approved' && (
            <Button
              onClick={() => navigate('/university-admin/dashboard')}
              className="min-w-[160px]"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          )}

          {(applicationStatus.status === 'rejected' || applicationStatus.status === 'pending') && (
            <Button
              variant="secondary"
              onClick={() => navigate('/university-admin/apply')}
              className="min-w-[160px]"
            >
              {applicationStatus.status === 'rejected' ? 'Update & Resubmit' : 'Edit Application'}
            </Button>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 mb-4">
                If you have questions about your application status or need assistance,
                please contact our support team.
              </p>
              <div className="flex justify-center">
                <a
                  href="mailto:classresponsesystem@gmail.com"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  classresponsesystem@gmail.com
                </a>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}