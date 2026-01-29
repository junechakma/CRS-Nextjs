import React, { useState } from 'react'
import { Plus, Edit, Trash2, Clock } from 'lucide-react'
import { Card, Button } from '../../../shared/components/ui'
import { useDurationManagement } from '../hooks/useDurationManagement'
import type { Duration, CreateDurationData } from '../services/universityAdminService'

interface DurationModalProps {
  isOpen: boolean
  onClose: () => void
  duration?: Duration | null
  onSubmit: (data: CreateDurationData) => Promise<void>
}

const DurationModal: React.FC<DurationModalProps> = ({ isOpen, onClose, duration, onSubmit }) => {
  const [formData, setFormData] = useState<CreateDurationData>({
    minutes: '',
    label: ''
  })
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (duration) {
      setFormData({
        minutes: duration.minutes.toString(),
        label: duration.label
      })
    } else {
      setFormData({
        minutes: '',
        label: ''
      })
    }
  }, [duration, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({
        minutes: formData.minutes,
        label: formData.label
      })
      onClose()
    } catch (error) {
      console.error('Error submitting duration:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {duration ? 'Edit Duration' : 'Add New Duration'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, minutes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
              placeholder="e.g., 30, 60, 90"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Label *
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., 30 minutes, 1 hour, 1.5 hours"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : duration ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const DurationManagement: React.FC = () => {
  const { durations, loading, createDuration, updateDuration, deleteDuration } = useDurationManagement()
  const [showModal, setShowModal] = useState(false)
  const [editingDuration, setEditingDuration] = useState<Duration | null>(null)

  const handleCreate = async (data: CreateDurationData) => {
    const result = await createDuration(data)
    if (result.success) {
      setShowModal(false)
    } else {
      alert(result.error || 'Failed to create duration')
    }
  }

  const handleUpdate = async (data: CreateDurationData) => {
    if (!editingDuration) return
    const result = await updateDuration(editingDuration.id, data)
    if (result.success) {
      setShowModal(false)
      setEditingDuration(null)
    } else {
      alert(result.error || 'Failed to update duration')
    }
  }

  const handleDelete = async (durationId: string) => {
    if (confirm('Are you sure you want to delete this duration? This action cannot be undone.')) {
      const result = await deleteDuration(durationId)
      if (!result.success) {
        alert(result.error || 'Failed to delete duration')
      }
    }
  }

  const sortedDurations = [...durations].sort((a, b) => a.minutes - b.minutes)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading durations...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card title={`Session Durations (${durations.length})`}>
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Manage available session durations for teachers when creating response sessions.
          </p>
          <Button onClick={() => {
            setEditingDuration(null)
            setShowModal(true)
          }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Duration
          </Button>
        </div>

        {durations.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No durations configured</h3>
              <p className="text-gray-600 mb-4">
                Add session durations that teachers can choose from when creating response sessions.
              </p>
              <Button onClick={() => {
                setEditingDuration(null)
                setShowModal(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Duration
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedDurations.map(duration => (
              <div key={duration.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{duration.label}</h3>
                      <p className="text-sm text-gray-600">{duration.minutes} minutes</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingDuration(duration)
                      setShowModal(true)
                    }}
                    className="flex items-center"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(duration.id)}
                    className="flex items-center"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <DurationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingDuration(null)
        }}
        duration={editingDuration}
        onSubmit={editingDuration ? handleUpdate : handleCreate}
      />
    </div>
  )
}

export default DurationManagement