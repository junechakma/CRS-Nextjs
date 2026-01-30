"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  Layers,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  Star,
  MessageSquare,
  List,
  ToggleLeft,
  Hash,
  GripVertical,
  CheckCircle2,
} from "lucide-react"

interface Question {
  id: number
  text: string
  type: string
  required: boolean
}

interface Template {
  id: number
  name: string
  description: string
  isBase: boolean
  questions: Question[]
  lastModified: string
  usageCount: number
}

interface TemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template: Template | null
  onSubmit: (data: { name: string; description: string; questions: Question[] }) => void
}

const questionTypes = [
  { id: "rating", label: "Rating Scale", icon: Star, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-500" },
  { id: "text", label: "Open Text", icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-500" },
  { id: "multiple", label: "Multiple Choice", icon: List, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-500" },
  { id: "boolean", label: "Yes/No", icon: ToggleLeft, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-500" },
  { id: "numeric", label: "Numeric", icon: Hash, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-500" },
]

export function TemplateModal({ isOpen, onClose, template, onSubmit }: TemplateModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ name?: string; questions?: string }>({})

  // New question form state
  const [newQuestionText, setNewQuestionText] = useState("")
  const [newQuestionType, setNewQuestionType] = useState("rating")
  const [newQuestionRequired, setNewQuestionRequired] = useState(true)

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description)
      setQuestions(template.questions)
    } else {
      setName("")
      setDescription("")
      setQuestions([])
    }
    setErrors({})
    setNewQuestionText("")
    setNewQuestionType("rating")
    setNewQuestionRequired(true)
  }, [template, isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  const validateForm = () => {
    const newErrors: { name?: string; questions?: string } = {}
    if (!name.trim()) newErrors.name = "Template name is required"
    if (questions.length === 0) newErrors.questions = "Add at least one question"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addQuestion = () => {
    if (!newQuestionText.trim()) return
    const newQuestion: Question = {
      id: Date.now(),
      text: newQuestionText.trim(),
      type: newQuestionType,
      required: newQuestionRequired,
    }
    setQuestions(prev => [...prev, newQuestion])
    setNewQuestionText("")
    setNewQuestionRequired(true)
    setErrors(prev => ({ ...prev, questions: undefined }))
  }

  const removeQuestion = (id: number) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    onSubmit({ name, description, questions })
    setIsSubmitting(false)
  }

  const getTypeConfig = (typeId: string) => {
    return questionTypes.find(t => t.id === typeId) || questionTypes[0]
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {template ? "Edit Template" : "Create New Template"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {template ? "Update your question template" : "Build a custom feedback template"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
            {/* Template Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Template Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., End of Semester Feedback"
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                  errors.name
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of when to use this template..."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm resize-none"
              />
            </div>

            {/* Questions Section */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <MessageSquare className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Questions
                <span className="ml-2 text-slate-400 font-normal">({questions.length} added)</span>
              </label>

              {/* Existing Questions List */}
              {questions.length > 0 && (
                <div className="space-y-2 mb-4">
                  {questions.map((question, index) => {
                    const typeConfig = getTypeConfig(question.type)
                    const TypeIcon = typeConfig.icon
                    return (
                      <div
                        key={question.id}
                        className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 group"
                      >
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
                          <div className={`p-1.5 rounded-lg ${typeConfig.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-relaxed">{question.text}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${typeConfig.bg} ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                            {question.required && (
                              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Required
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestion(question.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {errors.questions && questions.length === 0 && (
                <p className="mb-3 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.questions}
                </p>
              )}

              {/* Add New Question */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-xl border-2 border-dashed border-indigo-200">
                <p className="text-sm font-medium text-slate-700 mb-3">Add a Question</p>

                {/* Question Text */}
                <div className="mb-3">
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Enter your question..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm bg-white"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addQuestion()
                      }
                    }}
                  />
                </div>

                {/* Question Type */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-600 mb-2">Question Type</label>
                  <div className="grid grid-cols-5 gap-2">
                    {questionTypes.map((type) => {
                      const TypeIcon = type.icon
                      const isSelected = newQuestionType === type.id
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setNewQuestionType(type.id)}
                          className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? `${type.border} ${type.bg} ${type.color}`
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <TypeIcon className="w-4 h-4" />
                          <span className="text-xs font-medium leading-tight text-center">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Required Toggle & Add Button */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-slate-600">Required question</span>
                  </label>
                  <Button
                    type="button"
                    onClick={addQuestion}
                    disabled={!newQuestionText.trim()}
                    size="sm"
                    className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>
              </div>
            </div>
          </form>

          {/* Actions */}
          <div className="px-6 py-4 border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all border-0 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {template ? "Saving..." : "Creating..."}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {template ? "Save Changes" : "Create Template"}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
