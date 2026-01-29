import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Settings, Save, RefreshCw, Shield, Database, Trash2, AlertTriangle } from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Button, Card } from '../../../shared/components/ui'
import { supabase } from '../../../lib/supabase'
import DataDeletionConfirmDialog from '../components/DataDeletionConfirmDialog'

interface SystemSettings {
  maintenance_mode: boolean
  maintenance_message?: string
  estimated_completion?: string
  registration_enabled: boolean
  default_session_duration: number
  max_session_duration: number
  min_session_duration: number
  anonymous_key_length: number
  password_policy: {
    min_length: number
    require_uppercase: boolean
    require_lowercase: boolean
    require_numbers: boolean
    require_special_chars: boolean
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    maintenance_message: 'System is currently under maintenance. Please check back soon.',
    estimated_completion: '',
    registration_enabled: true,
    default_session_duration: 30,
    max_session_duration: 120,
    min_session_duration: 5,
    anonymous_key_length: 8,
    password_policy: {
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_special_chars: true
    }
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Data deletion states
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    loadSettings()
  }, [])


  const loadSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_config')
        .select('key, value')
        .eq('key', 'global_settings')
        .single()

      if (error) {
        console.error('Error loading settings:', error)
        return
      }

      if (data?.value) {
        // Merge loaded settings with defaults to ensure all fields exist
        const loadedSettings = data.value as Partial<SystemSettings>
        setSettings({
          maintenance_mode: loadedSettings.maintenance_mode ?? false,
          maintenance_message: loadedSettings.maintenance_message ?? 'System is currently under maintenance. Please check back soon.',
          estimated_completion: loadedSettings.estimated_completion ?? '',
          registration_enabled: loadedSettings.registration_enabled ?? true,
          default_session_duration: loadedSettings.default_session_duration ?? 30,
          max_session_duration: loadedSettings.max_session_duration ?? 120,
          min_session_duration: loadedSettings.min_session_duration ?? 5,
          anonymous_key_length: loadedSettings.anonymous_key_length ?? 8,
          password_policy: {
            min_length: loadedSettings.password_policy?.min_length ?? 8,
            require_uppercase: loadedSettings.password_policy?.require_uppercase ?? true,
            require_lowercase: loadedSettings.password_policy?.require_lowercase ?? true,
            require_numbers: loadedSettings.password_policy?.require_numbers ?? true,
            require_special_chars: loadedSettings.password_policy?.require_special_chars ?? true
          }
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!user?.id) return

    try {
      setSaving(true)
      
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'global_settings',
          value: settings,
          description: 'Global system settings',
          updated_by: user.id,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setLastSaved(new Date())
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = (key: keyof SystemSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleNumberChange = (key: keyof SystemSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleStringChange = (key: keyof SystemSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // const handlePasswordPolicyChange = (key: keyof SystemSettings['password_policy'], value: boolean | number) => {
  //   setSettings(prev => ({
  //     ...prev,
  //     password_policy: {
  //       ...prev.password_policy,
  //       [key]: value
  //     }
  //   }))
  // }


  const validateDateRange = (): string | null => {
    if (!startDate || !endDate) {
      return 'Please select both start and end dates.'
    }
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()
    
    if (start > end) {
      return 'Start date cannot be after end date.'
    }
    
    if (start > now) {
      return 'Start date cannot be in the future.'
    }
    
    if (end > now) {
      return 'End date cannot be in the future.'
    }
    
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    if (daysDiff > 365) {
      return 'Date range cannot exceed 365 days for safety reasons.'
    }
    
    return null
  }

  const handleShowDeleteDialog = () => {
    const error = validateDateRange()
    if (error) {
      alert(error)
      return
    }
    setShowDeleteDialog(true)
  }

  const handleDeleteData = async () => {
    if (!user?.id) return
    
    try {
      setDeleting(true)
      
      // Convert dates to proper timezone format
      const startDateTime = new Date(startDate + 'T00:00:00Z').toISOString()
      const endDateTime = new Date(endDate + 'T23:59:59Z').toISOString()
      
      const { error } = await supabase.rpc('delete_data_in_date_range', {
        p_start_date: startDateTime,
        p_end_date: endDateTime,
      })

      if (error) {
        throw error
      }

      // Log the deletion action
      await supabase.from('audit_log').insert({
        user_id: user.id,
        action: 'BULK_DELETE',
        table_name: 'multiple_tables',
        old_data: { start_date: startDateTime, end_date: endDateTime },
        new_data: { status: 'completed' }
      })

      alert('Data deleted successfully!')
      setStartDate('')
      setEndDate('')
      setShowDeleteDialog(false)
    } catch (error: any) {
      console.error('Error deleting data:', error)
      alert(`Error deleting data: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                System Settings
              </h1>
              <p className="text-sm text-gray-600 mt-1">Configure global system parameters</p>
              {lastSaved && (
                <p className="text-xs text-gray-500 mt-1">
                  Last saved: {lastSaved.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={loadSettings} loading={loading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload
              </Button>
              <Button onClick={saveSettings} loading={saving}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Maintenance Mode</label>
                  <p className="text-xs text-gray-500">Temporarily disable system access</p>
                </div>
                <button
                  onClick={() => handleToggle('maintenance_mode')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Message */}
              {settings.maintenance_mode && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Maintenance Message
                    </label>
                    <textarea
                      value={settings.maintenance_message || ''}
                      onChange={(e) => handleStringChange('maintenance_message', e.target.value)}
                      rows={3}
                      className="w-full border border-red-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter message to display during maintenance..."
                    />
                    <p className="text-xs text-red-600 mt-1">
                      This message will be shown to users during maintenance
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-900 mb-2">
                      Estimated Completion (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={settings.estimated_completion || ''}
                      onChange={(e) => handleStringChange('estimated_completion', e.target.value)}
                      className="w-full border border-red-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="text-xs text-red-600 mt-1">
                      When you expect maintenance to be completed
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">User Registration</label>
                  <p className="text-xs text-gray-500">Allow new user registrations</p>
                </div>
                <button
                  onClick={() => handleToggle('registration_enabled')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.registration_enabled ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      settings.registration_enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Anonymous Key Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.anonymous_key_length}
                  onChange={(e) => handleNumberChange('anonymous_key_length', parseInt(e.target.value) || 8)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Length of anonymous keys for student responses</p>
              </div>
            </div>
          </Card>

          {/* Session Settings */}
          <Card>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Default Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={settings.default_session_duration}
                  onChange={(e) => handleNumberChange('default_session_duration', parseInt(e.target.value) || 30)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Maximum Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="30"
                  max="480"
                  value={settings.max_session_duration}
                  onChange={(e) => handleNumberChange('max_session_duration', parseInt(e.target.value) || 120)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Minimum Session Duration (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.min_session_duration}
                  onChange={(e) => handleNumberChange('min_session_duration', parseInt(e.target.value) || 5)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </Card>

          {/* System Information */}
          <Card>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-2 mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  System Information
                </h3>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">System Version</span>
                <span className="text-sm font-medium text-gray-900">v1.0.0</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Database Status</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Current User</span>
                <span className="text-sm font-medium text-gray-900">{user?.name || 'Unknown'}</span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">User Role</span>
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.role?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                </span>
              </div>
            </div>
          </Card>


          {/* Data Deletion Management */}
          <Card>
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-red-600" />
                  Data Deletion Management
                </h3>
                <p className="text-sm text-gray-600 mt-1">Permanently delete data within a specific date range</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start mb-4">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 mb-1">Critical Warning</h4>
                      <p className="text-xs text-red-700">
                        This operation permanently deletes all system data within the specified date range.
                        This includes users (except super admins), responses, courses, and all related data. This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full border border-red-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-900 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full border border-red-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleShowDeleteDialog}
                    variant="danger"
                    disabled={!startDate || !endDate || deleting}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Data in Range
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Safety Guidelines</h4>
                      <ul className="text-xs text-yellow-700 space-y-1">
                        <li>• Always create a full system backup before bulk deletion</li>
                        <li>• Verify the date range carefully before proceeding</li>
                        <li>• Consider the impact on reports and analytics</li>
                        <li>• Maximum allowed range is 365 days for safety</li>
                        <li>• Future dates are not allowed to prevent accidental deletions</li>
                        <li>• This operation affects all universities in the system</li>
                        <li>• Super admin accounts are protected and cannot be deleted</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Warning Message */}
        {settings.maintenance_mode && (
          <div className="mt-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <Shield className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Maintenance Mode Active
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      The system is currently in maintenance mode. Users will not be able to access the application.
                      Remember to disable maintenance mode when maintenance is complete.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Deletion Confirmation Dialog */}
        <DataDeletionConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteData}
          startDate={startDate}
          endDate={endDate}
          loading={deleting}
        />
      </div>
    </div>
  )
}