import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SuperAdminService, type UniversityApplication } from '../services/superAdminService'
import type { RootState } from '../../../store/store'
import { Button, Table } from '../../../shared/components/ui'
import {  Clock, User, Building2 } from 'lucide-react'
import ApplicationReviewModal from './ApplicationReviewModal'

export default function UserApprovals() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [pendingApplications, setPendingApplications] = useState<UniversityApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [reviewingApplication, setReviewingApplication] = useState<UniversityApplication | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  useEffect(() => {
    loadPendingApplications()
  }, [])

  const loadPendingApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const applications = await SuperAdminService.getPendingUniversityApplications()
      setPendingApplications(applications)
    } catch (err) {
      console.error('Error loading pending applications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load pending applications')
    } finally {
      setLoading(false)
    }
  }

  const handleReviewApplication = (application: UniversityApplication) => {
    setReviewingApplication(application)
    setShowReviewModal(true)
  }

  const handleApproveApplication = async (userId: string) => {
    if (!user?.id || !reviewingApplication) return

    setProcessingIds(prev => new Set(prev).add(userId))
    try {
      await SuperAdminService.approveUniversityAdmin(user.id, reviewingApplication)
      await loadPendingApplications() // Refresh applications
      setShowReviewModal(false)
      setReviewingApplication(null)
    } catch (err) {
      console.error('Error approving application:', err)
      setError(err instanceof Error ? err.message : 'Failed to approve application')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }

  const handleRejectApplication = async (userId: string) => {
    if (!user?.id) return

    setProcessingIds(prev => new Set(prev).add(userId))
    try {
      await SuperAdminService.rejectUser(userId, user.id)
      await loadPendingApplications() // Refresh applications
      setShowReviewModal(false)
      setReviewingApplication(null)
    } catch (err) {
      console.error('Error rejecting application:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject application')
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })
    }
  }


  const columns = [
    {
      key: 'admin_name',
      header: 'Admin',
      render: (_: string, row: UniversityApplication) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="ml-3">
            <div className="font-medium text-gray-900">{row.admin_name}</div>
            <div className="text-sm text-gray-500">{row.admin_email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'university_name',
      header: 'University',
      render: (_: string, row: UniversityApplication) => (
        <div>
          <div className="font-medium text-gray-900">{row.university_name}</div>
          <div className="text-sm text-gray-500">Code: {row.university_code}</div>
        </div>
      )
    },
    {
      key: 'university_city',
      header: 'Location',
      render: (_: string, row: UniversityApplication) => (
        <div className="text-sm text-gray-600">
          {[row.university_city, row.university_state, row.university_country]
            .filter(Boolean)
            .join(', ') || 'N/A'}
        </div>
      )
    },
    {
      key: 'application_date',
      header: 'Applied',
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: UniversityApplication) => {
        const isProcessing = processingIds.has(row.user_id)
        return (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="primary"
              loading={isProcessing}
              disabled={isProcessing}
              onClick={() => handleReviewApplication(row)}
              className="text-xs"
            >
              <Building2 className="w-3 h-3 mr-1" />
              Review Application
            </Button>
          </div>
        )
      },
      width: '150px'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          University Admin Applications ({pendingApplications.length})
        </h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Table
        columns={columns}
        data={pendingApplications}
        loading={loading}
        emptyMessage="No pending university admin applications"
      />

      {/* Application Review Modal */}
      <ApplicationReviewModal
        application={reviewingApplication}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false)
          setReviewingApplication(null)
        }}
        onApprove={handleApproveApplication}
        onReject={handleRejectApplication}
        loading={processingIds.has(reviewingApplication?.user_id || '')}
      />
    </div>
  )
}