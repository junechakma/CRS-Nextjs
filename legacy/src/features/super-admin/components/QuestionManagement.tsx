import { useState, useEffect } from 'react'
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Copy,
  ChevronUp,
  Settings,
  Save,
  X,
  Power,
  PowerOff
} from 'lucide-react'
import { Card, Table, Button, Modal, Input, TextArea, Select } from '../../../shared/components/ui'
import { SuperAdminService } from '../services/superAdminService'

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
  is_active?: boolean
  is_default?: boolean
}


interface TemplateFormData {
  name: string
  description: string
  questions: Question[]
}

export default function QuestionManagement() {
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

  useEffect(() => {
    loadQuestionTemplates()
  }, [])

  const loadQuestionTemplates = async () => {
    try {
      setLoading(true)
      const templatesData = await SuperAdminService.getQuestionTemplates()
      setTemplates(templatesData)
    } catch (error) {
      console.error('Error loading question templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTemplate = async () => {
    try {
      setFormLoading(true)

      const result = await SuperAdminService.createQuestionTemplate(templateFormData)

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

      const result = await SuperAdminService.updateQuestionTemplate(selectedTemplate.id, templateFormData)

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

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this question template? This action cannot be undone.')) {
      return
    }

    try {
      await SuperAdminService.deleteQuestionTemplate(templateId)
      await loadQuestionTemplates()
      alert('Question template deleted successfully!')
    } catch (error) {
      console.error('Error deleting template:', error)
      alert('Failed to delete template')
    }
  }

  const handleToggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      setFormLoading(true)
      await SuperAdminService.toggleQuestionTemplateStatus(templateId, !currentStatus)
      await loadQuestionTemplates()
      alert(`Template ${!currentStatus ? 'activated' : 'deactivated'} successfully!`)
    } catch (error) {
      console.error('Error toggling template status:', error)
      alert('Failed to update template status')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDuplicateTemplate = async (template: QuestionTemplate) => {
    try {
      setFormLoading(true)

      const duplicateData = {
        name: `${template.name} (Copy)`,
        description: template.description,
        questions: template.questions
      }

      const result = await SuperAdminService.createQuestionTemplate(duplicateData)

      if (result.success) {
        await loadQuestionTemplates()
        alert('Question template duplicated successfully!')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error duplicating template:', error)
      alert('Failed to duplicate template')
    } finally {
      setFormLoading(false)
    }
  }

  const resetTemplateForm = () => {
    setTemplateFormData({
      name: '',
      description: '',
      questions: []
    })
  }

  const handleEditQuestion = (templateId: string, question: Question) => {
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

      const result = await SuperAdminService.updateQuestionTemplate(editingQuestion.templateId, updatedTemplateData)

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

  const handleDeleteQuestion = async (_templateId: string, questionId: string) => {
    if (!confirm('Are you sure you want to delete this question? This will permanently remove it from the database.')) return

    try {
      setFormLoading(true)

      // Delete the question from the database (this also unlinks it from templates)
      const deleteResult = await SuperAdminService.deleteQuestion(questionId)

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

  const handleAddQuestion = (templateId: string) => {
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

      const result = await SuperAdminService.updateQuestionTemplate(addingToTemplateId, updatedTemplateData)

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
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                Default
              </span>
            )}
            {row.is_active ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openEditTemplateModal(row)}
            className="text-xs px-2 py-1"
          >
            <Settings className="w-3 h-3 mr-1" />
            Edit Info
          </Button>
          <Button
            size="sm"
            variant={row.is_active ? 'secondary' : 'primary'}
            onClick={() => handleToggleTemplateStatus(row.id, row.is_active || false)}
            className="text-xs px-2 py-1"
            title={row.is_active ? 'Deactivate template' : 'Activate template'}
          >
            {row.is_active ? (
              <>
                <PowerOff className="w-3 h-3 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Power className="w-3 h-3 mr-1" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleDuplicateTemplate(row)}
            className="text-xs px-2 py-1"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDeleteTemplate(row.id)}
            className="text-xs px-2 py-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      ),
      width: '400px'
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
              Create Template
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

        <Table
          columns={templatesColumns}
          data={filteredTemplates}
          loading={loading}
          emptyMessage="No question templates found"
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
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleAddQuestion(template.id)}
                        loading={formLoading}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Question
                      </Button>
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
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditQuestion(template.id, question)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDeleteQuestion(template.id, question.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
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
        title="Create Question Template"
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
            placeholder="e.g., Standard Course Evaluation"
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