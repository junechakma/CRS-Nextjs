import { useState, useEffect } from 'react'
import {  useSelector } from 'react-redux'
import { Edit, Trash2, Search, Filter, University, MapPin, Mail, Phone, Globe, UserPlus } from 'lucide-react'
import type { RootState} from '../../../store/store'
import { Button, Card, Table } from '../../../shared/components/ui'
import { SuperAdminService } from '../services/superAdminService'

interface University {
  id: string
  name: string
  code: string
  address?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  email?: string
  phone?: string
  website?: string
  created_at: string
  stats?: {
    total_faculties?: number
    total_departments?: number
    total_teachers?: number
    total_students?: number
  }
}

interface UniversityModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingUniversity?: University | null
}

function UniversityModal({ isOpen, onClose, onSuccess, editingUniversity }: UniversityModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    email: '',
    phone: '',
    website: ''
  })

  useEffect(() => {
    if (editingUniversity) {
      setFormData({
        name: editingUniversity.name || '',
        code: editingUniversity.code || '',
        address: editingUniversity.address || '',
        city: editingUniversity.city || '',
        state: editingUniversity.state || '',
        country: editingUniversity.country || '',
        postal_code: editingUniversity.postal_code || '',
        email: editingUniversity.email || '',
        phone: editingUniversity.phone || '',
        website: editingUniversity.website || ''
      })
    } else {
      setFormData({
        name: '',
        code: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
        email: '',
        phone: '',
        website: ''
      })
    }
  }, [editingUniversity, isOpen])
  const [loading, setLoading] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      setLoading(true)
      if (editingUniversity) {
        await SuperAdminService.updateUniversity(editingUniversity.id, formData)
      } else {
        await SuperAdminService.updateUniversity('new', formData)
      }
      onSuccess()
      onClose()
    } catch (error) {
      console.error(`Error ${editingUniversity ? 'updating' : 'creating'} university:`, error)
      alert(`Failed to ${editingUniversity ? 'update' : 'create'} university`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingUniversity ? 'Edit University' : 'Add New University'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
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
                <div className="relative">
                  <University className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Gazipur Digital University"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  University Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., GDU"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="University campus address"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="State/Province"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Country"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Postal Code"
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
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
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
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.university.edu"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {editingUniversity ? 'Update University' : 'Create University'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AddUniversityAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function AddUniversityAdminModal({ isOpen, onClose, onSuccess }: AddUniversityAdminModalProps) {
  const [loading, setLoading] = useState(false)
  const { user } = useSelector((state: RootState) => state.auth)

  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  })

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  useEffect(() => {
    if (isOpen && !adminData.password) {
      // Generate password when modal opens if not already set
      setAdminData(prev => ({ ...prev, password: generateTempPassword() }))
    } else if (!isOpen) {
      // Reset form when modal closes
      setAdminData({ name: '', email: '', password: '', phone: '' })
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    try {
      setLoading(true)
      const tempPassword = adminData.password || generateTempPassword()

      await SuperAdminService.createUniversityAdminBySuperAdmin(
        user.id,
        {
          ...adminData,
          password: tempPassword
        }
      )

      alert(
        `✅ University Admin created successfully!\n\n` +
        `Email: ${adminData.email}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `The admin can log in with this password.\n\n` +
        `IMPORTANT: Please share this password with the admin securely.`
      )

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Error creating university admin:', error)
      alert(error.message || 'Failed to create university admin')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Add University Admin
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              The admin will complete university setup after logging in
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Admin Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={adminData.name}
                  onChange={(e) => setAdminData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={adminData.email}
                    onChange={(e) => setAdminData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@university.edu"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password *
                </label>
                <input
                  type="text"
                  required
                  minLength={8}
                  value={adminData.password}
                  onChange={(e) => setAdminData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-generated password"
                />
                <p className="text-xs text-gray-500 mt-1">Password is auto-generated. You can edit if needed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={adminData.phone}
                    onChange={(e) => setAdminData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1-555-123-4567"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              Create Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null)

  useEffect(() => {
    loadUniversities()
  }, [])

  const loadUniversities = async () => {
    try {
      setLoading(true)
      const data = await SuperAdminService.getAllUniversities()
      setUniversities(data || [])
    } catch (error) {
      console.error('Error loading universities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUniversity = async (universityId: string) => {
    if (!confirm('Are you sure you want to delete this university? This action cannot be undone.')) {
      return
    }

    try {
      await SuperAdminService.deleteUniversity(universityId)
      await loadUniversities()
    } catch (error) {
      console.error('Error deleting university:', error)
      alert('Failed to delete university')
    }
  }

  const columns = [
    {
      key: 'name',
      header: 'University',
      render: (value: string, row: University) => (
        <div>
          <div className="font-medium text-gray-900 text-sm sm:text-base">{value}</div>
          <div className="text-xs sm:text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: string, row: University) => (
        <div className="text-xs sm:text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {row.city && row.country ? `${row.city}, ${row.country}` : row.country || 'Not specified'}
          </div>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_: string, row: University) => (
        <div className="text-xs sm:text-sm text-gray-600 space-y-1">
          {row.email && (
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              <span className="truncate">{row.email}</span>
            </div>
          )}
          {row.phone && (
            <div className="flex items-center">
              <Phone className="w-3 h-3 mr-1" />
              {row.phone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Stats',
      render: (_: string, row: University) => (
        <div className="text-xs sm:text-sm text-gray-600">
          <div>{row.stats?.total_faculties || 0} Faculties</div>
          <div>{row.stats?.total_teachers || 0} Teachers</div>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value: string) => (
        <div className="text-xs sm:text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: string, row: University) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button 
            size="sm" 
            variant="secondary" 
            className="text-xs px-2 py-1"
            onClick={() => {
              setEditingUniversity(row)
              setShowAddModal(true)
            }}
          >
            <Edit className="w-3 h-3" />
            <span className="ml-1 hidden sm:inline">Edit</span>
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteUniversity(row.id)}
            className="text-xs px-2 py-1"
          >
            <Trash2 className="w-3 h-3" />
            <span className="ml-1 hidden sm:inline">Delete</span>
          </Button>
        </div>
      ),
      width: '120px'
    }
  ]

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (university.city && university.city.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <University className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Universities Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">Manage all universities in the system</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowAddAdminModal(true)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add University Admin
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Card title={`Universities (${filteredUniversities.length})`}>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search universities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="overflow-hidden">
            <Table
              columns={columns}
              data={filteredUniversities}
              loading={loading}
              emptyMessage="No universities found"
            />
          </div>
        </Card>
      </div>

      <UniversityModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setEditingUniversity(null)
        }}
        onSuccess={loadUniversities}
        editingUniversity={editingUniversity}
      />

      <AddUniversityAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onSuccess={() => {
          loadUniversities()
        }}
      />
    </div>
  )
}