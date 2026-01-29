import { useState } from 'react'
import { AlertTriangle, Calendar, Database, X } from 'lucide-react'
import { Button } from '../../../shared/components/ui'

interface DataDeletionConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  startDate: string
  endDate: string
  loading: boolean
}

export default function DataDeletionConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  startDate,
  endDate,
  loading
}: DataDeletionConfirmDialogProps) {
  const [confirmText, setConfirmText] = useState('')
  const [understood, setUnderstood] = useState(false)
  
  const requiredText = 'DELETE ALL DATA'
  const isConfirmValid = confirmText === requiredText && understood
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleConfirm = () => {
    if (isConfirmValid) {
      onConfirm()
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setUnderstood(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-red-900">
                Confirm Data Deletion
              </h3>
              <p className="text-sm text-red-700">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range Display */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-gray-600 mr-2" />
              <h4 className="font-medium text-gray-900">Date Range</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-sm text-gray-500 mb-1">From</div>
                <div className="font-semibold text-gray-900">{formatDate(startDate)}</div>
              </div>
              <div className="text-center p-3 bg-white rounded border">
                <div className="text-sm text-gray-500 mb-1">To</div>
                <div className="font-semibold text-gray-900">{formatDate(endDate)}</div>
              </div>
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <Database className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <h4 className="font-semibold text-red-800 mb-2">
                  The following data will be permanently deleted:
                </h4>
                <ul className="space-y-1 text-sm text-red-700">
                  <li>• All student responses and feedback within this date range</li>
                  <li>• Response sessions and evaluation data</li>
                  <li>• Course information created in this timeframe</li>
                  <li>• Academic structure data (semesters, departments, faculties)</li>
                  <li>• University and user account data from this period (excluding super admins)</li>
                  <li>• University applications submitted during this time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Critical Warnings */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Critical Warnings:</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• This action is <strong>IRREVERSIBLE</strong> - deleted data cannot be recovered</li>
                <li>• Always create a backup before performing bulk deletions</li>
                <li>• Ensure you have selected the correct date range</li>
                <li>• Consider the impact on system integrity and user experience</li>
                <li>• This operation may affect system statistics and reports</li>
                <li>• Super admin accounts are protected and will not be deleted</li>
              </ul>
            </div>
          </div>

          {/* Confirmation Checks */}
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    id="understand-consequences"
                    type="checkbox"
                    checked={understood}
                    onChange={(e) => setUnderstood(e.target.checked)}
                    disabled={loading}
                    className="mt-0.5 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="understand-consequences" className="ml-3 text-sm text-gray-700">
                    I understand the consequences of this action and confirm that I want to permanently delete all data within the specified date range. I acknowledge that this action cannot be undone.
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type "{requiredText}" to confirm deletion:
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    disabled={loading}
                    placeholder={requiredText}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 font-mono"
                  />
                  {confirmText && confirmText !== requiredText && (
                    <p className="mt-1 text-sm text-red-600">
                      Text does not match. Please type exactly: {requiredText}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="sm:order-1"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            disabled={!isConfirmValid || loading}
            loading={loading}
            className="sm:order-2"
          >
            {loading ? 'Deleting Data...' : 'Delete Data Permanently'}
          </Button>
        </div>

        {/* Progress indicator */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Deleting data...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}