import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Edit,
  Trash2,
  Target,
  BookOpen,
  Upload,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  FileText,
  X,
  Loader
} from 'lucide-react'
import { Card, Button } from '../../../shared/components/ui'
import { CLOService, type CourseCLO, type CreateCLOData } from '../services/cloService'
import { cloMappingService } from '../services/cloMappingService'
import { supabase } from '../../../lib/supabase'

interface CLOManagementProps {
  courseId: string
  courseName: string
}

interface CLOModalProps {
  isOpen: boolean
  onClose: () => void
  course: string
  clo?: CourseCLO | null
  existingNumbers: number[]
  onSubmit: (data: CreateCLOData) => Promise<void>
}

// Removed BLOOMS_LEVELS and DOMAINS - AI will determine these automatically

const CLOModal: React.FC<CLOModalProps> = ({ isOpen, onClose, course: courseIdProp, clo, existingNumbers, onSubmit }) => {
  const [formData, setFormData] = useState<CreateCLOData>({
    course_id: courseIdProp,
    clo_number: 1,
    clo: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (clo) {
      setFormData({
        course_id: clo.course_id,
        clo_number: clo.clo_number,
        clo: clo.clo
      })
    } else {
      // Find next available CLO number
      const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
      setFormData({
        course_id: courseIdProp,
        clo_number: maxNumber + 1,
        clo: ''
      })
    }
  }, [clo, courseIdProp, existingNumbers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting CLO:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {clo ? 'Edit CLO' : 'Add CLO'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CLO Number *
            </label>
            <input
              type="number"
              min="1"
              value={formData.clo_number}
              onChange={(e) => setFormData(prev => ({ ...prev, clo_number: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={!!clo}
            />
            <p className="text-xs text-gray-500 mt-1">Sequential number for this CLO (e.g., 1, 2, 3)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CLO *
            </label>
            <textarea
              value={formData.clo}
              onChange={(e) => setFormData(prev => ({ ...prev, clo: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Students will be able to analyze sorting algorithms..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              ✨ AI will determine Bloom's level automatically when mapping questions
            </p>
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
              {loading ? 'Saving...' : clo ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const DocumentUploadModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clos: CourseCLO[]
  courseName: string
  onProcessComplete: () => void
}> = ({ isOpen, onClose, clos, courseName }) => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file type
      const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv']
      const fileName = selectedFile.name.toLowerCase()
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isAllowed) {
        setError('Please upload a TXT, PDF, DOCX, XLSX, XLS, or CSV file')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleProcess = async () => {
    if (!file || clos.length === 0) {
      setError('Please select a file and ensure you have created CLOs first')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      // Extract text from file
      const extractionResult = await cloMappingService.extractQuestionsFromFile(file)
      
      if (!extractionResult.success || !extractionResult.questions) {
        setError(extractionResult.error || 'Failed to read file')
        setProcessing(false)
        return
      }

      // Process with AI
      const processingResult = await cloMappingService.processDocument(extractionResult.questions, clos)
      
      // Navigate to analytics page with results
      onClose() // Close modal first
      navigate('/teacher/clo-analytics', {
        state: {
          result: processingResult,
          courseName: courseName
        }
      })
    } catch (err) {
      console.error('Error processing document:', err)
      setError('Failed to process document. Please try again.')
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Upload Question Document</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {clos.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">No CLOs Found</p>
                <p className="text-sm text-yellow-700 mt-1">Please create CLOs first before uploading questions.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Question Document
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.docx,.doc,.xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={processing || clos.length === 0}
            />
            <p className="text-xs text-gray-500 mt-2">
              📄 Supported formats: TXT, PDF, DOCX, XLSX, XLS, CSV
            </p>
            <p className="text-xs text-gray-400 mt-1">
              💡 Tip: For Excel/CSV, put questions in the first column
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={!file || processing || clos.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Process with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


const PasteQuestionsModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clos: CourseCLO[]
  courseName: string
  onProcessComplete: () => void
}> = ({ isOpen, onClose, clos, courseName }) => {
  const navigate = useNavigate()
  const [questionsText, setQuestionsText] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestionsText('')
      setError(null)
    }
  }, [isOpen])

  const handleProcess = async () => {
    if (!questionsText.trim() || clos.length === 0) {
      setError('Please paste questions and ensure you have created CLOs first')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      console.log('🔄 Processing with AI...')
      const processingResult = await cloMappingService.processDocument(questionsText, clos)
      
      console.log('✅ Got result:', processingResult)
      console.log('📊 Total questions:', processingResult.total_questions)
      
      // Navigate to analytics page with results
      onClose() // Close modal first
      navigate('/teacher/clo-analytics', {
        state: {
          result: processingResult,
          courseName: courseName
        }
      })
    } catch (err) {
      console.error('❌ Error processing questions:', err)
      setError('Failed to process questions. Please try again.')
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Add Questions</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {clos.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">No CLOs Found</p>
                <p className="text-sm text-yellow-700 mt-1">Please create CLOs first before adding questions.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Your Questions Below
            </label>
            <textarea
              value={questionsText}
              onChange={(e) => setQuestionsText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              rows={15}
              placeholder="Paste your questions here... Example:

1. What is the time complexity of bubble sort?
2. Explain the difference between stack and queue.
3. Write a function to reverse a linked list.

Each question should be on a new line or numbered."
              disabled={processing || clos.length === 0}
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 Tip: You can paste numbered questions, one per line, or any format
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={!questionsText.trim() || processing || clos.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Process with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const CLOManagement: React.FC<CLOManagementProps> = ({ courseId, courseName }) => {
  const [clos, setClos] = useState<CourseCLO[]>([])
  const [loading, setLoading] = useState(true)
  const [showCLOModal, setShowCLOModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPasteModal, setShowPasteModal] = useState(false)
  const [editingCLO, setEditingCLO] = useState<CourseCLO | null>(null)
  const [overview, setOverview] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [courseId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [closData, overviewData] = await Promise.all([
        CLOService.getCourseCLOs(courseId),
        CLOService.getCourseCLOOverview(courseId)
      ])
      setClos(closData)
      setOverview(overviewData)
    } catch (error) {
      console.error('Error loading CLO data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCLO = async (data: CreateCLOData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('User not authenticated')
      return
    }
    
    const result = await CLOService.createCLO(data, user.id)
    if (result.success) {
      await loadData()
      setShowCLOModal(false)
    } else {
      alert(result.error || 'Failed to create CLO')
    }
  }

  const handleUpdateCLO = async (data: CreateCLOData) => {
    if (!editingCLO) return

    const result = await CLOService.updateCLO(editingCLO.id, data)
    if (result.success) {
      await loadData()
      setShowCLOModal(false)
      setEditingCLO(null)
    } else {
      alert(result.error || 'Failed to update CLO')
    }
  }

  const handleDeleteCLO = async (cloId: string) => {
    if (confirm('Are you sure you want to delete this CLO?')) {
      const result = await CLOService.deleteCLO(cloId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.error || 'Failed to delete CLO')
      }
    }
  }

  const handleToggleStatus = async (cloId: string, currentStatus: boolean) => {
    const result = await CLOService.toggleCLOStatus(cloId, !currentStatus)
    if (result.success) {
      await loadData()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Course Learning Outcomes (CLOs)</h2>
          <p className="text-sm text-gray-600">{courseName}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPasteModal(true)}
            variant="secondary"
            disabled={clos.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" />
            Add Questions
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            variant="secondary"
            disabled={clos.length === 0}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Questions
          </Button>
          <Button onClick={() => { setEditingCLO(null); setShowCLOModal(true) }}>
            <Plus className="w-4 h-4 mr-2" />
            Add CLO
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      {overview && overview.total_clos > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total CLOs</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_clos}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active CLOs</p>
                <p className="text-2xl font-bold text-gray-900">{overview.active_clos}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* CLOs List */}
      {clos.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No CLOs added yet</p>
          <Button onClick={() => setShowCLOModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add First CLO
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {clos.map(clo => (
            <Card key={clo.id} className={`p-4 ${!clo.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">CLO {clo.clo_number}</span>
                    {!clo.is_active && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">{clo.clo}</p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(clo.id, clo.is_active)}
                    className="text-gray-600 hover:text-gray-900"
                    title={clo.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {clo.is_active ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCLO(clo)
                      setShowCLOModal(true)
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCLO(clo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* CLO Modal */}
      <CLOModal
        isOpen={showCLOModal}
        onClose={() => {
          setShowCLOModal(false)
          setEditingCLO(null)
        }}
        course={courseId}
        clo={editingCLO}
        existingNumbers={clos.map(c => c.clo_number)}
        onSubmit={editingCLO ? handleUpdateCLO : handleCreateCLO}
      />

      {/* Paste Questions Modal */}
      <PasteQuestionsModal
        isOpen={showPasteModal}
        onClose={() => setShowPasteModal(false)}
        clos={clos}
        courseName={courseName}
        onProcessComplete={loadData}
      />

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        clos={clos}
        courseName={courseName}
        onProcessComplete={loadData}
      />
    </div>
  )
}

export default CLOManagement

