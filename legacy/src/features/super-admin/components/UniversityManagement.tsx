import { useState, useEffect } from 'react'
import { Edit, Trash2, Search, Filter, Eye, University, Mail, Phone, Globe, MapPin } from 'lucide-react'
import { SuperAdminService } from '../services/superAdminService'
import { Button, Card, Table } from '../../../shared/components/ui'

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
  settings?: any
  admin_id?: string
  status?: string
  created_at: string
  updated_at?: string
  admin?: {
    id: string
    name: string
    email: string
  }
  created_by_user?: {
    id: string
    name: string
    email: string
  }
  stats: {
    total_faculties: number
    total_departments: number
    total_teachers: number
    total_students: number
  }
}

export default function UniversityManagement() {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<University>>({})

  useEffect(() => {
    loadUniversities()
  }, [])

  const loadUniversities = async () => {
    try {
      setLoading(true)
      const data = await SuperAdminService.getAllUniversities()
      setUniversities(data as any)
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

  const handleViewUniversity = (university: University) => {
    setSelectedUniversity(university)
    setShowViewModal(true)
  }

  const handleEditUniversity = (university: University) => {
    setSelectedUniversity(university)
    setEditFormData({
      name: university.name,
      code: university.code,
      address: university.address,
      city: university.city,
      state: university.state,
      country: university.country,
      postal_code: university.postal_code,
      email: university.email,
      phone: university.phone,
      website: university.website
    })
    setShowEditModal(true)
  }

  const handleUpdateUniversity = async () => {
    if (!selectedUniversity) return

    try {
      await SuperAdminService.updateUniversity(selectedUniversity.id, editFormData)
      setShowEditModal(false)
      setSelectedUniversity(null)
      setEditFormData({})
      await loadUniversities()
    } catch (error) {
      console.error('Error updating university:', error)
      alert('Failed to update university')
    }
  }

  const handleCloseModals = () => {
    setShowViewModal(false)
    setShowEditModal(false)
    setSelectedUniversity(null)
    setEditFormData({})
  }

  const columns = [
    {
      key: 'name',
      header: 'University Name',
      render: (value: string, row: University) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.code}</div>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      render: (_: any, row: University) => (
        <div className="text-sm text-gray-600">
          {row.city && row.state ? `${row.city}, ${row.state}` : row.country || 'Not specified'}
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (_: any, row: University) => (
        <div className="text-sm text-gray-600">
          <div>{row.email || 'No email'}</div>
          <div>{row.phone || 'No phone'}</div>
        </div>
      )
    },
    {
      key: 'stats',
      header: 'Statistics',
      render: (_: any, row: University) => (
        <div className="text-sm text-gray-600">
          <div>{row.stats?.total_faculties || 0} Faculties</div>
          <div>{row.stats?.total_teachers || 0} Teachers</div>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: University) => (
        <div className="flex space-x-1">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleViewUniversity(row)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => handleEditUniversity(row)}
            title="Edit University"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteUniversity(row.id)}
            title="Delete University"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: '160px'
    }
  ]

  const filteredUniversities = universities.filter(university =>
    university.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    university.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">University Management</h1>
      </div>

      <Card title="Universities">
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
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <Table
          columns={columns}
          data={filteredUniversities}
          loading={loading}
          emptyMessage="No universities found"
        />
      </Card>

      {/* View University Modal */}
      {showViewModal && selectedUniversity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">University Details</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">University Name</label>
                    <p className="text-gray-900">{selectedUniversity.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">University Code</label>
                    <p className="text-gray-900">{selectedUniversity.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUniversity.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUniversity.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedUniversity.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedUniversity.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <p className="text-gray-900">{selectedUniversity.website || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <p className="text-gray-900">{selectedUniversity.address || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <p className="text-gray-900">{selectedUniversity.city || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <p className="text-gray-900">{selectedUniversity.state || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <p className="text-gray-900">{selectedUniversity.country || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <p className="text-gray-900">{selectedUniversity.postal_code || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Administration</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Admin</label>
                    <p className="text-gray-900">
                      {selectedUniversity.admin ? 
                        `${selectedUniversity.admin.name} (${selectedUniversity.admin.email})` : 
                        'Not assigned'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created By</label>
                    <p className="text-gray-900">
                      {selectedUniversity.created_by_user ? 
                        `${selectedUniversity.created_by_user.name}` : 
                        'System'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Faculties</label>
                    <p className="text-gray-900">{selectedUniversity.stats?.total_faculties || 0}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Teachers</label>
                    <p className="text-gray-900">{selectedUniversity.stats?.total_teachers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Timestamps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created At</label>
                    <p className="text-gray-900">{new Date(selectedUniversity.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Updated At</label>
                    <p className="text-gray-900">
                      {selectedUniversity.updated_at ? 
                        new Date(selectedUniversity.updated_at).toLocaleString() : 
                        'Never updated'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={handleCloseModals}>
                Close
              </Button>
              <Button onClick={() => {
                setShowViewModal(false)
                handleEditUniversity(selectedUniversity)
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit University
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit University Modal */}
      {showEditModal && selectedUniversity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit University</h2>
              <button
                onClick={handleCloseModals}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form className="space-y-8">
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
                        value={editFormData.name || ''}
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
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
                      value={editFormData.code || ''}
                      onChange={(e) => setEditFormData({...editFormData, code: e.target.value.toUpperCase()})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., GDU"
                      maxLength={10}
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
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
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
                      value={editFormData.city || ''}
                      onChange={(e) => setEditFormData({...editFormData, city: e.target.value})}
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
                      value={editFormData.state || ''}
                      onChange={(e) => setEditFormData({...editFormData, state: e.target.value})}
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
                      value={editFormData.country || ''}
                      onChange={(e) => setEditFormData({...editFormData, country: e.target.value})}
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
                      value={editFormData.postal_code || ''}
                      onChange={(e) => setEditFormData({...editFormData, postal_code: e.target.value})}
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
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
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
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
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
                        value={editFormData.website || ''}
                        onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                        className="w-full pl-10 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.university.edu"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="secondary" onClick={handleCloseModals}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUniversity}>
                Update University
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}