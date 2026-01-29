import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { University, Mail, Lock, User, Phone, Globe } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import { supabase } from '../../../lib/supabase'
import { validatePasswordStrength } from '../../../shared/utils/password'
import { EmailService } from '../../../services/emailService'
import { SuperAdminService } from '../../super-admin/services/superAdminService'

interface RegistrationData {
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
  
  // Admin Information
  adminName: string
  adminEmail: string
  adminPhone: string
  password: string
  confirmPassword: string
}

export default function UniversityAdminRegistration() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<RegistrationData>({
    universityName: '',
    universityCode: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    universityEmail: '',
    universityPhone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
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
    
    if (!formData.adminName.trim()) {
      setError('Admin name is required')
      return false
    }
    
    if (!formData.adminEmail.trim() || !formData.adminEmail.includes('@')) {
      setError('Valid admin email is required')
      return false
    }
    
    // Use bcrypt password validation
    const passwordValidation = validatePasswordStrength(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.message)
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setLoading(true)
    setError('')
    
    try {
      // Check if university code already exists
      const { data: existingUniversity } = await supabase
        .from('universities')
        .select('code')
        .eq('code', formData.universityCode.toUpperCase())
        .maybeSingle()

      if (existingUniversity) {
        setError('University code already exists')
        setLoading(false)
        return
      }

      // Check if admin email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', formData.adminEmail.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        setError('Admin email already registered')
        setLoading(false)
        return
      }

      // Create user in Supabase Auth with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.adminEmail.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.adminName.trim(),
            role: 'university_admin',
            phone: formData.adminPhone.trim() || null,
            // University application will be created after profile is auto-created
          }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Failed to create user account')

      // Wait for the trigger to create the user profile (with retry logic)
      let userData = null
      let attempts = 0
      const maxAttempts = 5

      while (!userData && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          userData = data
          break
        }

        if (profileError) {
          console.warn(`Profile check attempt ${attempts + 1} error:`, profileError)
        }

        attempts++
      }

      if (!userData) {
        throw new Error('User profile was not created automatically after multiple attempts')
      }

      // Update user profile - keep as pending until Super Admin approves
      const { error: updateError } = await supabase
        .from('users')
        .update({
          status: 'pending',
          approval_status: 'pending',
          application_date: new Date().toISOString()
        })
        .eq('id', userData.id)

      if (updateError) throw updateError

      // Create university application record with all university data
      const { error: applicationError } = await supabase
        .from('university_applications')
        .insert({
          user_id: userData.id,
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
          admin_name: formData.adminName.trim(),
          admin_email: formData.adminEmail.toLowerCase().trim(),
          admin_phone: formData.adminPhone.trim() || null,
          application_status: 'pending'
        })

      if (applicationError) {
        // Clean up user record if application creation fails
        await supabase.from('users').delete().eq('id', userData.id)
        throw applicationError
      }

      // Send email notification to all super admins
      try {
        const superAdminEmails = await SuperAdminService.getSuperAdminEmails()
        if (superAdminEmails.length > 0 && EmailService.isConfigured()) {
          const notificationResult = await EmailService.sendUniversityApprovalNotificationToAll(
            superAdminEmails,
            formData.universityName.trim(),
            formData.adminName.trim(),
            formData.adminEmail.toLowerCase().trim(),
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
      console.error('Registration error:', error)
      setError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
              Your University Admin application has been submitted successfully.
            </p>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900">
                    Verify Your Email
                  </p>
                  <p className="mt-1 text-sm text-blue-700">
                    We've sent a verification link to your email address.
                    Please check your inbox and click the link to verify your account before logging in.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your university application will remain pending until approved by a Super Admin.
              </p>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              <p>Didn't receive the email? Check your spam folder.</p>
            </div>
            <div className="mt-6">
              <Button onClick={() => navigate('/login')} fullWidth>
                Go to Login
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
            University Admin Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Apply for system access as a University Administrator
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
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

            {/* Admin Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Administrator Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.adminName}
                      onChange={(e) => handleInputChange('adminName', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@university.edu"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.adminPhone}
                      onChange={(e) => handleInputChange('adminPhone', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                loading={loading}
                className="flex-1"
              >
                Submit Application
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}