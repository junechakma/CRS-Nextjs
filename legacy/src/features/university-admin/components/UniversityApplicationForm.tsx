import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { University, Mail, Phone, Globe } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import { supabase } from '../../../lib/supabase'
import { EmailService } from '../../../services/emailService'
import { SuperAdminService } from '../../super-admin/services/superAdminService'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../../store/store'
import { setUser } from '../../../store/slices/authSlice'

interface ApplicationData {
  // University Information
  universityName: string
  universityCode: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string

  // Contact Information
  universityEmail: string
  universityPhone: string
  website: string
}

export default function UniversityApplicationForm() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<ApplicationData>({
    universityName: '',
    universityCode: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    universityEmail: '',
    universityPhone: '',
    website: ''
  })

  useEffect(() => {
    checkExistingApplication()
  }, [user])

  const checkExistingApplication = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('university_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        setExistingApplication(data)
        // Pre-fill form with existing data
        setFormData({
          universityName: data.university_name || '',
          universityCode: data.university_code || '',
          address: data.university_address || '',
          city: data.university_city || '',
          state: data.university_state || '',
          country: data.university_country || '',
          postalCode: data.university_postal_code || '',
          universityEmail: data.university_email || '',
          universityPhone: data.university_phone || '',
          website: data.university_website || ''
        })
      }
    } catch (error: any) {
      console.error('Error checking existing application:', error)
    } finally {
      setCheckingExisting(false)
    }
  }

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = (): boolean => {
    if (!formData.universityName.trim()) {
      setError('University name is required')
      return false
    }

    if (!formData.universityCode.trim() || formData.universityCode.length < 2) {
      setError('University code must be at least 2 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!user) {
      setError('You must be logged in to submit an application')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Check if university code already exists (only if it's different from existing)
      if (!existingApplication || existingApplication.university_code !== formData.universityCode.toUpperCase()) {
        // Use RPC function to check code existence (works with encrypted codes)
        const { data: codeCheck, error: codeCheckError } = await supabase
          .rpc('rpc_check_university_code_exists', {
            code_to_check: formData.universityCode.toUpperCase()
          })

        if (codeCheckError) {
          console.error('Error checking university code:', codeCheckError)
          setError('Failed to validate university code')
          setLoading(false)
          return
        }

        if (codeCheck?.exists) {
          setError('University code already exists')
          setLoading(false)
          return
        }
      }

      // Prepare application data
      const applicationData = {
        user_id: user.id,
        university_name: formData.universityName.trim(),
        university_code: formData.universityCode.toUpperCase().trim(),
        university_address: formData.address.trim() || null,
        university_city: formData.city.trim() || null,
        university_state: formData.state.trim() || null,
        university_country: formData.country.trim() || null,
        university_postal_code: formData.postalCode.trim() || null,
        university_email: formData.universityEmail.trim() || null,
        university_phone: formData.universityPhone.trim() || null,
        university_website: formData.website.trim() || null,
        admin_name: user.name,
        admin_email: user.email,
        admin_phone: user.phone || null,
        application_status: 'pending'
      }

      let applicationError
      let applicationId: string | null = null

      if (existingApplication) {
        // Update existing application
        const { error } = await supabase
          .from('university_applications')
          .update(applicationData)
          .eq('id', existingApplication.id)

        applicationError = error
        applicationId = existingApplication.id
      } else {
        // Create new application
        const { data, error } = await supabase
          .from('university_applications')
          .insert(applicationData)
          .select('id')
          .single()

        applicationError = error
        applicationId = data?.id || null
      }

      if (applicationError) {
        throw applicationError
      }

      // Update user status to pending and link application
      await supabase
        .from('users')
        .update({
          status: 'pending',
          approval_status: 'pending',
          application_date: new Date().toISOString(),
          application_id: applicationId
        })
        .eq('id', user.id)

      // Update user data in Redux to reflect the new status
      // This is important so ApplicationPendingPage sees the updated approval_status
      // We update directly instead of fetching to avoid auth issues
      dispatch(setUser({
        ...user,
        status: 'pending',
        approval_status: 'pending',
        application_id: applicationId
      }))

      // Send email notification to all super admins
      try {
        const superAdminEmails = await SuperAdminService.getSuperAdminEmails()
        if (superAdminEmails.length > 0 && EmailService.isConfigured()) {
          const notificationResult = await EmailService.sendUniversityApprovalNotificationToAll(
            superAdminEmails,
            formData.universityName.trim(),
            user.name,
            user.email,
            formData.universityCode.toUpperCase().trim()
          )

          console.log(`University approval notifications sent: ${notificationResult.successCount} successful, ${notificationResult.failureCount} failed out of ${superAdminEmails.length} super admins`)

          if (notificationResult.successCount > 0) {
            console.log('At least one super admin was notified successfully')
          } else {
            console.warn('Failed to notify any super admins')
          }
        } else {
          console.warn('No super admin emails found or EmailJS not configured - notification not sent')
        }
      } catch (emailError) {
        console.error('Failed to send email notifications:', emailError)
        // Don't throw error - application should still succeed even if email fails
      }

      setSuccess(true)

    } catch (error: any) {
      console.error('Application submission error:', error)
      setError(error.message || 'Application submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (checkingExisting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <University className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Application Submitted!
            </h2>
            <p className="mt-4 text-sm text-gray-600">
              Your University application has been {existingApplication ? 'updated' : 'submitted'} successfully.
            </p>
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your application will remain pending until approved by a Super Admin.
                You will receive an email notification once your application is reviewed.
              </p>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/university-admin/pending')} fullWidth>
                View Application Status
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <University className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {existingApplication ? 'Update University Application' : 'Submit University Application'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {existingApplication
              ? 'Update your university information below'
              : 'Step 2 of 2: Submit your university details for approval'}
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {existingApplication && existingApplication.application_status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm font-medium text-red-900">Your previous application was rejected</p>
                {existingApplication.rejection_reason && (
                  <p className="text-sm text-red-700 mt-1">Reason: {existingApplication.rejection_reason}</p>
                )}
                <p className="text-sm text-red-700 mt-1">Please update your information and resubmit.</p>
              </div>
            )}

            {/* University Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                University Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.universityName}
                    onChange={(e) => handleInputChange('universityName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Gazipur Digital University"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.universityCode}
                    onChange={(e) => handleInputChange('universityCode', e.target.value.toUpperCase())}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., GDU"
                    maxLength={10}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="University campus address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                University Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={formData.universityEmail}
                      onChange={(e) => handleInputChange('universityEmail', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="info@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.universityPhone}
                      onChange={(e) => handleInputChange('universityPhone', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+1-555-123-4567"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://www.university.edu"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/university-admin/pending')}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                {existingApplication ? 'Update Application' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
