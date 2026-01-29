import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronUp,
  Settings,
  Save,
  X
} from 'lucide-react'
import type { RootState } from '../../../store/store'
import { Card, Table, Button, Modal, Input, TextArea, Select } from '../../../shared/components/ui'
import { UniversityAdminService } from '../services/universityAdminService'

interface Question {
  id: string
  text: string
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no'
  scale?: number
  required: boolean
  category: string
  options?: string[]
}

interface QuestionTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
  is_default?: boolean
  is_active?: boolean
  university_id?: string | null
}

interface TemplateFormData {
  name: string
  description: string
  questions: Question[]
}

export default function QuestionManagement() {
  const { user } = useSelector((state: RootState) => state.auth)
  const [templates, setTemplates] = useState<QuestionTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<{ templateId: string, questionId: string } | null>(null)
  const [editingQuestionData, setEditingQuestionData] = useState<Question | null>(null)

  // Modals
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false)
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false)
  const [addingToTemplateId, setAddingToTemplateId] = useState<string | null>(null)
  const [newQuestionData, setNewQuestionData] = useState<Question>({
    id: '',
    text: '',
    type: 'rating',
    scale: 5,
    required: false,
    category: 'overall',
    options: []
  })

  // Form data
  const [selectedTemplate, setSelectedTemplate] = useState<QuestionTemplate | null>(null)
  const [templateFormData, setTemplateFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    questions: []
  })

  const [formLoading, setFormLoading] = useState(false)
  const [togglingTemplateId, setTogglingTemplateId] = useState<string | null>(null)

  useEffect(() => {
    loadQuestionTemplates()
  }, [])

  const loadQuestionTemplates = async () => {
    try {
      setLoading(true)
      // Load both default templates and university-specific templates
      const templatesData = await UniversityAdminService.getQuestionTemplates(user?.university_id || '')
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading question templates:', error)
    } finally {
      setLoading(false)
    }
  }


  const handleCreateTemplate = async () => {
    if (!user?.university_id) return

    try {
      setFormLoading(true)

      const result = await UniversityAdminService.createQuestionTemplate(user.university_id, templateFormData)

      if (result.success) {
        await loadQuestionTemplates()
        setShowCreateTemplateModal(false)
        resetTemplateForm()
        alert('Question template created successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error creating template:', error)
      alert('Failed to create template')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return

    try {
      setFormLoading(true)

      const result = await UniversityAdminService.updateQuestionTemplate(selectedTemplate.id, templateFormData)

      if (result.success) {
        await loadQuestionTemplates()
        setShowEditTemplateModal(false)
        setSelectedTemplate(null)
        resetTemplateForm()
        alert('Question template updated successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating template:', error)
      alert('Failed to update template')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string, template: QuestionTemplate) => {
    // Prevent deletion of default templates
    if (template.is_default && template.university_id === null) {
      alert('Cannot delete default system templates. You can only activate/deactivate them.')
      return
    }

    if (!confirm('Are you sure you want to delete this question template? This action cannot be undone.')) {
      return
    }

    try {
      await UniversityAdminService.deleteQuestionTemplate(templateId)
      await loadQuestionTemplates()
      alert('Question template deleted successfully!')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  const handleToggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'activate' : 'deactivate'

    if (!confirm(`Are you sure you want to ${action} this question template?`)) {
      return
    }

    try {
      setTogglingTemplateId(templateId)
      const result = await UniversityAdminService.setTemplateActiveStatus(
        templateId,
        newStatus,
        user?.university_id
      )

      if (result.success) {
        await loadQuestionTemplates()
        alert(`Question template ${action}d successfully!`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error(`Error ${action}ing template:`, error)
      alert(`Failed to ${action} template`)
    } finally {
      setTogglingTemplateId(null)
    }
  }

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      description: '',
      questions: []
    })
  }

  const handleEditQuestion = (templateId: string, question: Question, template: QuestionTemplate) => {
    // Prevent editing questions in default templates
    if (template.is_default && template.university_id === null) {
      alert('Cannot edit questions in default system templates. Create a custom template or duplicate this template to edit.')
      return
    }
    setEditingQuestion({ templateId, questionId: question.id })
    setEditingQuestionData({ ...question })
  }

  const handleSaveQuestionEdit = async () => {
    if (!editingQuestion || !editingQuestionData) return

    if (!editingQuestionData.text.trim()) {
      alert('Please enter a question text')
      return
    }

    // Validate multiple choice has at least 2 options
    if (editingQuestionData.type === 'multiple_choice') {
      const options = editingQuestionData.options?.filter(opt => opt.trim()) || []
      if (options.length < 2) {
        alert('Multiple choice questions must have at least 2 options')
        return
      }
    }

    try {
      setFormLoading(true)

      // Find the template and update the specific question
      const templateToUpdate = templates.find(t => t.id === editingQuestion.templateId)
      if (!templateToUpdate) return

      // Clean up the question data
      const cleanedQuestionData = {
        ...editingQuestionData,
        options: editingQuestionData.type === 'multiple_choice'
          ? editingQuestionData.options?.filter(opt => opt.trim())
          : []
      }

      const updatedQuestions = templateToUpdate.questions.map(q =>
        q.id === editingQuestion.questionId ? cleanedQuestionData : q
      )

      const updatedTemplateData = {
        name: templateToUpdate.name,
        description: templateToUpdate.description,
        questions: updatedQuestions
      }

      const result = await UniversityAdminService.updateQuestionTemplate(editingQuestion.templateId, updatedTemplateData)

      if (result.success) {
        await loadQuestionTemplates()
        setEditingQuestion(null)
        setEditingQuestionData(null)
        alert('Question updated successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error updating question:', error)
      alert('Failed to update question')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancelQuestionEdit = () => {
    setEditingQuestion(null)
    setEditingQuestionData(null)
  }

  const handleDeleteQuestion = async (_templateId: string, questionId: string, template: QuestionTemplate) => {
    // Prevent deleting questions from default templates
    if (template.is_default && template.university_id === null) {
      alert('Cannot delete questions from default system templates.')
      return
    }

    if (!confirm('Are you sure you want to delete this question? This will permanently remove it from the database.')) return

    try {
      setFormLoading(true)

      // Delete the question from the database (this also unlinks it from templates)
      const deleteResult = await UniversityAdminService.deleteQuestion(questionId)

      if (deleteResult.success) {
        await loadQuestionTemplates()
        alert('Question deleted successfully!')
      } else {
        alert(`Error: ${deleteResult.error}`)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question')
    } finally {
      setFormLoading(false)
    }
  }

  const handleAddQuestion = (templateId: string, template: QuestionTemplate) => {
    // Prevent adding questions to default templates
    if (template.is_default && template.university_id === null) {
      alert('Cannot add questions to default system templates. Create a custom template instead.')
      return
    }

    setAddingToTemplateId(templateId)
    setNewQuestionData({
      id: crypto.randomUUID(),
      text: '',
      type: 'rating',
      scale: 5,
      required: false,
      category: 'overall',
      options: []
    })
    setShowAddQuestionModal(true)
  }

  const handleSaveNewQuestion = async () => {
    if (!addingToTemplateId || !newQuestionData.text.trim()) {
      alert('Please enter a question text')
      return
    }

    // Validate multiple choice has at least 2 options
    if (newQuestionData.type === 'multiple_choice') {
      const options = newQuestionData.options?.filter(opt => opt.trim()) || []
      if (options.length < 2) {
        alert('Multiple choice questions must have at least 2 options')
        return
      }
    }

    try {
      setFormLoading(true)

      const templateToUpdate = templates.find(t => t.id === addingToTemplateId)
      if (!templateToUpdate) return

      // Clean up options for multiple choice, ensure proper format
      const questionToAdd = {
        ...newQuestionData,
        options: newQuestionData.type === 'multiple_choice' 
          ? newQuestionData.options?.filter(opt => opt.trim()) 
          : []
      }

      const updatedQuestions = [...templateToUpdate.questions, questionToAdd]

      const updatedTemplateData = {
        name: templateToUpdate.name,
        description: templateToUpdate.description,
        questions: updatedQuestions
      }

      const result = await UniversityAdminService.updateQuestionTemplate(addingToTemplateId, updatedTemplateData)

      if (result.success) {
        await loadQuestionTemplates()
        setShowAddQuestionModal(false)
        setAddingToTemplateId(null)
        alert('Question added successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error adding question:', error)
      alert('Failed to add question')
    } finally {
      setFormLoading(false)
    }
  }

  const openCreateTemplateModal = () => {
    resetTemplateForm()
    setShowCreateTemplateModal(true)
  }

  const openEditTemplateModal = (template: QuestionTemplate) => {
    // Prevent editing default templates
    if (template.is_default && template.university_id === null) {
      alert('Cannot edit default system templates. You can only activate/deactivate them.')
      return
    }
    setSelectedTemplate(template)
    setTemplateFormData({
      name: template.name,
      description: template.description,
      questions: template.questions
    })
    setShowEditTemplateModal(true)
  }

  const templatesColumns = [
    {
      key: 'name',
      header: 'Template Name',
      render: (value: string, row: QuestionTemplate) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{value}</span>
            {row.is_default && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                Default
              </span>
            )}
          </div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      )
    },
    {
      key: 'questions',
      header: 'Questions',
      render: (value: Question[]) => (
        <div className="text-sm">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {value.length} questions
          </span>
        </div>
      )
    },
    {
      key: 'categories',
      header: 'Categories',
      render: (_: any, row: QuestionTemplate) => {
        const categories = Array.from(new Set(row.questions.map(q => q.category)))
        return (
          <div className="flex flex-wrap gap-1">
            {categories.map(category => (
              <span key={category} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {category}
              </span>
            ))}
          </div>
        )
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (_: any, row: QuestionTemplate) => (
        <div className="text-sm">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            row.is_active !== false
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {row.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: any, row: QuestionTemplate) => (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setExpandedTemplate(expandedTemplate === row.id ? null : row.id)}
            className="text-xs px-2 py-1"
          >
            <Edit2 className="w-3 h-3 mr-1" />
            {expandedTemplate === row.id ? 'Hide' : 'Edit Questions'}
          </Button>
          {!(row.is_default && row.university_id === null) && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => openEditTemplateModal(row)}
              className="text-xs px-2 py-1"
            >
              <Settings className="w-3 h-3 mr-1" />
              Edit Info
            </Button>
          )}
          <Button
            size="sm"
            variant={row.is_active !== false ? "warning" : "success"}
            onClick={() => handleToggleTemplateStatus(row.id, row.is_active !== false)}
            loading={togglingTemplateId === row.id}
            className="text-xs px-2 py-1"
          >
            <Settings className="w-3 h-3 mr-1" />
            {row.is_active !== false ? 'Deactivate' : 'Activate'}
          </Button>
          {!(row.is_default && row.university_id === null) && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleDeleteTemplate(row.id, row)}
              className="text-xs px-2 py-1"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          )}
        </div>
      ),
      width: '320px'
    }
  ]

  const categories = Array.from(new Set(
    templates.flatMap(t => t.questions.map(q => q.category))
  )).filter(Boolean)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory ||
      template.questions.some(q => q.category === selectedCategory)

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <Card title="Question Template Management" className="mb-6">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <Button onClick={openCreateTemplateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Custom Template
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Templates marked as "Default" are system-wide templates. You can activate/deactivate them but cannot edit or delete them. Create custom templates for your university-specific needs.
          </p>
        </div>

        <Table
          columns={templatesColumns}
          data={filteredTemplates}
          loading={loading}
          emptyMessage="No templates found"
        />

        {/* Expanded Template Details */}
        {expandedTemplate && (
          <Card className="mt-4">
            {filteredTemplates
              .filter(t => t.id === expandedTemplate)
              .map(template => (
                <div key={template.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{template.name}</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedTemplate(null)}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-gray-600">{template.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Questions ({template.questions.length})</h4>
                      {!(template.is_default && template.university_id === null) && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAddQuestion(template.id, template)}
                          loading={formLoading}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Question
                        </Button>
                      )}
                    </div>

                    {template.questions.map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        {editingQuestion?.questionId === question.id ? (
                          // Edit mode
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h5 className="font-medium">Edit Question {index + 1}</h5>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="primary"
                                  onClick={handleSaveQuestionEdit}
                                  loading={formLoading}
                                >
                                  <Save className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={handleCancelQuestionEdit}
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Text
                                </label>
                                <textarea
                                  value={editingQuestionData?.text || ''}
                                  onChange={(e) => setEditingQuestionData(prev =>
                                    prev ? { ...prev, text: e.target.value } : null
                                  )}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={2}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Question Type
                                </label>
                                <select
                                  value={editingQuestionData?.type || 'rating'}
                                  onChange={(e) => setEditingQuestionData(prev =>
                                    prev ? { ...prev, type: e.target.value as Question['type'] } : null
                                  )}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="rating">Rating</option>
                                  <option value="text">Text</option>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="yes_no">Yes/No</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Category
                                </label>
                                <select
                                  value={editingQuestionData?.category || 'overall'}
                                  onChange={(e) => setEditingQuestionData(prev =>
                                    prev ? { ...prev, category: e.target.value } : null
                                  )}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="instructor">Instructor</option>
                                  <option value="content">Content</option>
                                  <option value="delivery">Delivery</option>
                                  <option value="assessment">Assessment</option>
                                  <option value="overall">Overall</option>
                                </select>
                              </div>

                              {editingQuestionData?.type === 'rating' && (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating Scale
                                  </label>
                                  <input
                                    type="number"
                                    min="2"
                                    max="10"
                                    value={editingQuestionData?.scale || 5}
                                    onChange={(e) => setEditingQuestionData(prev =>
                                      prev ? { ...prev, scale: parseInt(e.target.value) } : null
                                    )}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                              )}

                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`required-${question.id}`}
                                  checked={editingQuestionData?.required || false}
                                  onChange={(e) => setEditingQuestionData(prev =>
                                    prev ? { ...prev, required: e.target.checked } : null
                                  )}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-900">
                                  Required Question
                                </label>
                              </div>
                            </div>

                            {editingQuestionData?.type === 'multiple_choice' && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Options (one per line)
                                </label>
                                <textarea
                                  value={editingQuestionData?.options?.join('\n') || ''}
                                  onChange={(e) => setEditingQuestionData(prev =>
                                    prev ? {
                                      ...prev,
                                      options: e.target.value.split('\n')
                                    } : null
                                  )}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={4}
                                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Enter each option on a new line. Empty lines will be ignored.
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          // View mode
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {index + 1}. {question.text}
                              </p>
                              <div className="flex gap-2 mt-2 flex-wrap">
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {question.type}
                                  {question.type === 'rating' && question.scale && ` (1-${question.scale})`}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {question.category}
                                </span>
                                {question.required && (
                                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                    Required
                                  </span>
                                )}
                              </div>
                              {question.type === 'multiple_choice' && question.options && (
                                <div className="mt-2">
                                  <p className="text-sm text-gray-600 mb-1">Options:</p>
                                  <ul className="text-sm text-gray-700 list-disc list-inside">
                                    {question.options.map((option, optIndex) => (
                                      <li key={optIndex}>{option}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              {!(template.is_default && template.university_id === null) && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleEditQuestion(template.id, question, template)}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleDeleteQuestion(template.id, question.id, template)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </Card>
        )}
      </Card>

      {/* Create Template Modal */}
      <Modal
        isOpen={showCreateTemplateModal}
        onClose={() => setShowCreateTemplateModal(false)}
        title="Create Custom Question Template"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            value={templateFormData.name}
            onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Custom Class Evaluation"
            required
          />

          <TextArea
            label="Description"
            value={templateFormData.description}
            onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description of this template"
            rows={3}
          />

          <div className="text-sm text-gray-600">
            <p>After creating the template, you can add questions to it from the main page.</p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowCreateTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} loading={formLoading}>
              Create Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={showEditTemplateModal}
        onClose={() => setShowEditTemplateModal(false)}
        title="Edit Question Template"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            value={templateFormData.name}
            onChange={(e) => setTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Standard Class Evaluation"
            required
          />

          <TextArea
            label="Description"
            value={templateFormData.description}
            onChange={(e) => setTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description of this template"
            rows={3}
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowEditTemplateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTemplate} loading={formLoading}>
              Update Template
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Question Modal */}
      <Modal
        isOpen={showAddQuestionModal}
        onClose={() => setShowAddQuestionModal(false)}
        title="Add New Question"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text *
            </label>
            <textarea
              value={newQuestionData.text}
              onChange={(e) => setNewQuestionData(prev => ({ ...prev, text: e.target.value }))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter your question here..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question Type
              </label>
              <select
                value={newQuestionData.type}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="rating">Rating</option>
                <option value="text">Text</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="yes_no">Yes/No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newQuestionData.category}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="instructor">Instructor</option>
                <option value="content">Content</option>
                <option value="delivery">Delivery</option>
                <option value="assessment">Assessment</option>
                <option value="overall">Overall</option>
              </select>
            </div>

            {newQuestionData.type === 'rating' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating Scale
                </label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={newQuestionData.scale || 5}
                  onChange={(e) => setNewQuestionData(prev => ({ ...prev, scale: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="new-question-required"
                checked={newQuestionData.required}
                onChange={(e) => setNewQuestionData(prev => ({ ...prev, required: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="new-question-required" className="ml-2 block text-sm text-gray-900">
                Required Question
              </label>
            </div>
          </div>

          {newQuestionData.type === 'multiple_choice' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options (one per line)
              </label>
              <textarea
                value={newQuestionData.options?.join('\n') || ''}
                onChange={(e) => setNewQuestionData(prev => ({
                  ...prev,
                  options: e.target.value.split('\n')
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter each option on a new line. Empty lines will be ignored.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="secondary" onClick={() => setShowAddQuestionModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewQuestion} loading={formLoading}>
              Add Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}