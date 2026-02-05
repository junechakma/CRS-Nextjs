"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Search,
  Star,
  MessageSquare,
  ToggleLeft,
  Hash,
  ChevronRight,
  ChevronDown,
  Layers,
  Shield,
  Pencil,
  Lock,
  CheckCircle2,
  Clock,
  Power,
  X,
  Plus,
  Trash2,
  Save,
  List,
  GripVertical,
} from "lucide-react"

const questionTypes = [
  { id: "rating", label: "Rating Scale", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "text", label: "Open Text", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "multiple", label: "Multiple Choice", icon: List, color: "text-violet-500", bg: "bg-violet-50" },
  { id: "boolean", label: "Yes/No", icon: ToggleLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "numeric", label: "Numeric", icon: Hash, color: "text-rose-500", bg: "bg-rose-50" },
]

interface Question {
  id: number
  text: string
  type: string
  required: boolean
  scale?: number
  options?: string[]
}

interface Template {
  id: number
  name: string
  description: string
  isBase: boolean
  questions: Question[]
  lastModified: string
  usageCount: number
  status: "active" | "inactive"
}

const initialBaseTemplate: Template = {
  id: 1,
  name: "Base Template",
  description: "Default feedback template for all teachers. This template serves as the foundation for course evaluation.",
  isBase: true,
  questions: [
    { id: 1, text: "How would you rate the clarity of explanations in today's lecture?", type: "rating", required: true, scale: 5 },
    { id: 2, text: "The pace of the course is appropriate for my learning needs.", type: "rating", required: true, scale: 5 },
    { id: 3, text: "Do you feel comfortable asking questions during class?", type: "boolean", required: true },
    { id: 4, text: "The instructor explains concepts in multiple ways to aid understanding.", type: "rating", required: false, scale: 5 },
    { id: 5, text: "What suggestions do you have for improving the course?", type: "text", required: false },
  ],
  lastModified: "Admin",
  usageCount: 156,
  status: "active",
}

export default function QuestionBankPage() {
  const [baseTemplate, setBaseTemplate] = useState<Template>(initialBaseTemplate)
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingQuestions, setEditingQuestions] = useState<Question[]>([])
  const [editingName, setEditingName] = useState("")
  const [editingDescription, setEditingDescription] = useState("")

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newQuestionType, setNewQuestionType] = useState("rating")
  const [newQuestionRequired, setNewQuestionRequired] = useState(true)
  const [newQuestionScale, setNewQuestionScale] = useState(5)
  const [newQuestionOptions, setNewQuestionOptions] = useState<string[]>([""])
  const [isAddingQuestion, setIsAddingQuestion] = useState(false)

  const getTypeIcon = (type: string) => {
    const found = questionTypes.find((t) => t.id === type)
    return found ? found.icon : FileText
  }

  const getTypeConfig = (type: string) => {
    return questionTypes.find((t) => t.id === type) || questionTypes[0]
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 gap-1.5">
            <Clock className="w-3 h-3" />
            Inactive
          </Badge>
        )
      default:
        return null
    }
  }

  const handleEditTemplate = () => {
    setEditingQuestions([...baseTemplate.questions])
    setEditingName(baseTemplate.name)
    setEditingDescription(baseTemplate.description)
    setIsEditModalOpen(true)
  }

  const handleSaveTemplate = () => {
    setBaseTemplate((prev) => ({
      ...prev,
      name: editingName,
      description: editingDescription,
      questions: editingQuestions,
      lastModified: "Just now",
    }))
    setIsEditModalOpen(false)
    resetNewQuestionForm()
  }

  const handleToggleStatus = () => {
    setBaseTemplate((prev) => ({
      ...prev,
      status: prev.status === "active" ? "inactive" : "active",
    }))
  }

  const handleDeleteQuestion = (questionId: number) => {
    setEditingQuestions((prev) => prev.filter((q) => q.id !== questionId))
  }

  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return

    const newQuestion: Question = {
      id: Date.now(),
      text: newQuestionText,
      type: newQuestionType,
      required: newQuestionRequired,
      ...(newQuestionType === "rating" && { scale: newQuestionScale }),
      ...(newQuestionType === "multiple" && { options: newQuestionOptions.filter((o) => o.trim()) }),
    }

    setEditingQuestions((prev) => [...prev, newQuestion])
    resetNewQuestionForm()
    setIsAddingQuestion(false)
  }

  const resetNewQuestionForm = () => {
    setNewQuestionText("")
    setNewQuestionType("rating")
    setNewQuestionRequired(true)
    setNewQuestionScale(5)
    setNewQuestionOptions([""])
    setIsAddingQuestion(false)
  }

  const handleAddOption = () => {
    setNewQuestionOptions((prev) => [...prev, ""])
  }

  const handleUpdateOption = (index: number, value: string) => {
    setNewQuestionOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)))
  }

  const handleRemoveOption = (index: number) => {
    setNewQuestionOptions((prev) => prev.filter((_, i) => i !== index))
  }

  const stats = {
    totalQuestions: baseTemplate.questions.length,
    requiredQuestions: baseTemplate.questions.filter((q) => q.required).length,
    totalUsage: baseTemplate.usageCount,
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <Layers className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Question Bank
                  </h1>
                </div>
                <p className="text-slate-500">
                  Manage the base feedback template for all teachers
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <Lock className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 font-medium">Admin Only</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalQuestions}</p>
                    <p className="text-xs text-slate-500">Total Questions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.requiredQuestions}</p>
                    <p className="text-xs text-slate-500">Required Questions</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-50">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalUsage}</p>
                    <p className="text-xs text-slate-500">Times Used</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Base Template */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Base Template
              </h2>
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border-2 border-indigo-200 overflow-hidden">
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedTemplate(expandedTemplate === baseTemplate.id ? null : baseTemplate.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-lg text-slate-900">{baseTemplate.name}</h3>
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                            <Lock className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                          {getStatusBadge(baseTemplate.status)}
                        </div>
                        <p className="text-sm text-slate-600 mb-3">{baseTemplate.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-slate-500">
                            <span className="font-semibold text-slate-700">{baseTemplate.questions.length}</span> questions
                          </span>
                          <span className="text-slate-500">
                            Used <span className="font-semibold text-slate-700">{baseTemplate.usageCount}</span> times
                          </span>
                          <span className="text-slate-500">
                            Modified: <span className="font-semibold text-slate-700">{baseTemplate.lastModified}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleStatus()
                        }}
                        className="gap-1.5"
                      >
                        <Power className="w-4 h-4" />
                        {baseTemplate.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditTemplate()
                        }}
                        className="gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit Template
                      </Button>
                      <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                        {expandedTemplate === baseTemplate.id ? (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Questions */}
                {expandedTemplate === baseTemplate.id && (
                  <div className="border-t border-indigo-200 bg-white/50 p-5">
                    <h4 className="text-sm font-medium text-slate-700 mb-3">Questions in this template:</h4>
                    <div className="space-y-2">
                      {baseTemplate.questions.map((question, index) => {
                        const typeConfig = getTypeConfig(question.type)
                        const TypeIcon = typeConfig.icon
                        return (
                          <div
                            key={question.id}
                            className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200"
                          >
                            <span className="text-xs font-medium text-slate-400 mt-1">{index + 1}.</span>
                            <div className={`p-1.5 rounded-lg ${typeConfig.bg}`}>
                              <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-700">{question.text}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-slate-500">
                                  {typeConfig.label}
                                  {question.type === "rating" && question.scale && ` (1-${question.scale})`}
                                </span>
                                {question.required && (
                                  <Badge variant="outline" className="text-xs py-0 h-5">Required</Badge>
                                )}
                              </div>
                              {question.type === "multiple" && question.options && question.options.length > 0 && (
                                <div className="mt-2 pl-2 border-l-2 border-slate-200">
                                  <p className="text-xs text-slate-500 mb-1">Options:</p>
                                  <ul className="text-xs text-slate-600 space-y-0.5">
                                    {question.options.map((option, optIndex) => (
                                      <li key={optIndex} className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                        {option}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-50">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">About the Base Template</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    The base template serves as the foundation for all teacher feedback forms. Teachers can duplicate this template to create their own customized versions, but only administrators can modify the original base template.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      All teachers can view and duplicate this template
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Changes to the base template affect all new duplications
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Existing teacher copies remain unchanged
                    </li>
                    <li className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-500" />
                      Only super admins can edit this template
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsEditModalOpen(false)
              resetNewQuestionForm()
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-3xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Pencil className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Edit Base Template</h2>
                      <p className="text-sm text-slate-500">Modify the default feedback template</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditModalOpen(false)
                      resetNewQuestionForm()
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Template Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Questions List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-slate-700">
                      Questions ({editingQuestions.length})
                    </label>
                  </div>

                  <div className="space-y-2">
                    {editingQuestions.map((question, index) => {
                      const typeConfig = getTypeConfig(question.type)
                      const TypeIcon = typeConfig.icon
                      return (
                        <div
                          key={question.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group"
                        >
                          <div className="flex items-center gap-2 mt-1">
                            <GripVertical className="w-4 h-4 text-slate-300" />
                            <span className="text-xs font-medium text-slate-400">{index + 1}.</span>
                          </div>
                          <div className={`p-1.5 rounded-lg ${typeConfig.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700">{question.text}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-xs text-slate-500">
                                {typeConfig.label}
                                {question.type === "rating" && question.scale && ` (1-${question.scale})`}
                              </span>
                              {question.required && (
                                <Badge variant="outline" className="text-xs py-0 h-5">Required</Badge>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Add Question Form */}
                  {isAddingQuestion ? (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Question Text
                        </label>
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="Enter your question..."
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Question Type
                          </label>
                          <select
                            value={newQuestionType}
                            onChange={(e) => setNewQuestionType(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                          >
                            {questionTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {newQuestionType === "rating" && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                              Scale (1 to)
                            </label>
                            <select
                              value={newQuestionScale}
                              onChange={(e) => setNewQuestionScale(Number(e.target.value))}
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                            >
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {newQuestionType === "multiple" && (
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1.5">
                            Options
                          </label>
                          <div className="space-y-2">
                            {newQuestionOptions.map((option, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleUpdateOption(index, e.target.value)}
                                  placeholder={`Option ${index + 1}`}
                                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                                />
                                {newQuestionOptions.length > 1 && (
                                  <button
                                    onClick={() => handleRemoveOption(index)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleAddOption}
                              className="gap-1.5"
                            >
                              <Plus className="w-4 h-4" />
                              Add Option
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="required"
                          checked={newQuestionRequired}
                          onChange={(e) => setNewQuestionRequired(e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="required" className="text-sm text-slate-700">
                          Required question
                        </label>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setIsAddingQuestion(false)
                            resetNewQuestionForm()
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleAddQuestion}
                          disabled={!newQuestionText.trim()}
                          className="gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                        >
                          <Plus className="w-4 h-4" />
                          Add Question
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingQuestion(true)}
                      className="w-full mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add New Question
                    </button>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0 rounded-b-3xl">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false)
                    resetNewQuestionForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
