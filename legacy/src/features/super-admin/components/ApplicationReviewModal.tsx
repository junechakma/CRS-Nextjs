import { Button } from '../../../shared/components/ui'
import type { UniversityApplication } from '../services/superAdminService'

interface ApplicationReviewModalProps {
  application: UniversityApplication | null
  isOpen: boolean
  onClose: () => void
  onApprove: (userId: string) => void
  onReject: (userId: string, reason?: string) => void
  loading?: boolean
}

export default function ApplicationReviewModal({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject,
  loading = false
}: ApplicationReviewModalProps) {
  if (!isOpen || !application) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">University Application Review</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Admin Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <div className="text-gray-900">{application.admin_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="text-gray-900">{application.admin_email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="text-gray-900">{application.admin_phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Application Date</label>
                  <div className="text-gray-900">{new Date(application.application_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            {/* University Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">University Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Name</label>
                  <div className="text-gray-900 font-medium">{application.university_name}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">University Code</label>
                  <div className="text-gray-900">{application.university_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="text-gray-900">{application.university_email || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <div className="text-gray-900">{application.university_phone || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <div className="text-gray-900">{application.university_website || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <div className="text-gray-900">{application.university_address || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <div className="text-gray-900">{application.university_city || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  <div className="text-gray-900">{application.university_state || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  <div className="text-gray-900">{application.university_country || 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                  <div className="text-gray-900">{application.university_postal_code || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onReject(application.user_id)
                onClose()
              }}
              disabled={loading}
            >
              Reject Application
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onApprove(application.user_id)
                onClose()
              }}
              disabled={loading}
            >
              Approve Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}