"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TemplateModal } from "@/components/teacher/template-modal"
import {
  FileText,
  Plus,
  Search,
  MoreVertical,
  Star,
  Copy,
  Edit3,
  Trash2,
  List,
  MessageSquare,
  ToggleLeft,
  Hash,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Layers,
  Shield,
  Pencil,
  Lock,
  CheckCircle2,
  Clock,
  Power,
  Calendar,
  Loader2,
} from "lucide-react"
import { QuestionTemplate, TemplateQuestion } from "@/lib/supabase/queries"
import { deleteTemplate, duplicateTemplate, toggleTemplateStatus, createTemplate, updateTemplate } from "@/lib/supabase/actions"

const questionTypes = [
  { id: "rating", label: "Rating Scale", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "text", label: "Open Text", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "multiple", label: "Multiple Choice", icon: List, color: "text-violet-500", bg: "bg-violet-50" },
  { id: "boolean", label: "Yes/No", icon: ToggleLeft, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "numeric", label: "Numeric", icon: Hash, color: "text-rose-500", bg: "bg-rose-50" },
]

interface QuestionsPageClientProps {
  userId: string
  initialTemplates: QuestionTemplate[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  initialSearch: string
  initialStatus: string
  stats: {
    totalTemplates: number
    activeTemplates: number
    totalQuestions: number
    totalUsage: number
  }
}

export default function QuestionsPageClient({
  userId,
  initialTemplates,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  initialSearch,
  initialStatus,
  stats,
}: QuestionsPageClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<QuestionTemplate | null>(null)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update URL with filters (debounced for search)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', '1')

      startTransition(() => {
        router.push(`/teacher/questions?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, statusFilter, router])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())

    startTransition(() => {
      router.push(`/teacher/questions?${params.toString()}`)
    })
  }

  const baseTemplate = initialTemplates.find(t => t.is_base)
  const customTemplates = initialTemplates.filter(t => !t.is_base)

  const getTypeConfig = (type: string) => {
    return questionTypes.find((t) => t.id === type) || questionTypes[0]
  }

  const handleDelete = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteTemplate(templateId, userId)
      if (result.success) {
        setOpenDropdown(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete template')
      }
    })
  }

  const handleDuplicate = async (templateId: string) => {
    startTransition(async () => {
      const result = await duplicateTemplate(templateId, userId)
      if (result.success) {
        setOpenDropdown(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to duplicate template')
      }
    })
  }

  const handleEdit = (template: QuestionTemplate) => {
    setEditingTemplate(template)
    setOpenDropdown(null)
  }

  const handleToggleStatus = async (templateId: string) => {
    startTransition(async () => {
      const result = await toggleTemplateStatus(templateId, userId)
      if (result.success) {
        setOpenDropdown(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to toggle status')
      }
    })
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

  const handleTemplateSubmit = (data: {
    name: string
    description: string
    questions: { id: number; text: string; type: string; required: boolean; scale?: number; options?: string[] }[]
  }) => {
    startTransition(async () => {
      if (editingTemplate) {
        const result = await updateTemplate(editingTemplate.id, userId, {
          name: data.name,
          description: data.description,
          questions: data.questions.map((q, i) => ({
            text: q.text,
            type: q.type as 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric',
            required: q.required,
            scale: q.scale,
            options: q.options,
            order_index: i,
          })),
        })
        if (!result.success) {
          alert(result.error || 'Failed to update template')
          return
        }
      } else {
        const result = await createTemplate(userId, {
          name: data.name,
          description: data.description,
          questions: data.questions.map((q, i) => ({
            text: q.text,
            type: q.type as 'rating' | 'text' | 'multiple' | 'boolean' | 'numeric',
            required: q.required,
            scale: q.scale,
            options: q.options,
            order_index: i,
          })),
        })
        if (!result.success) {
          alert(result.error || 'Failed to create template')
          return
        }
      }

      setIsCreateModalOpen(false)
      setEditingTemplate(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="space-y-6">
            {/* Create Template Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
              >
                <Plus className="w-5 h-5" />
                Create Template
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50">
                    <Layers className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalTemplates}</p>
                    <p className="text-xs text-slate-500">Total Templates</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.activeTemplates}</p>
                    <p className="text-xs text-slate-500">Active Templates</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.totalQuestions}</p>
                    <p className="text-xs text-slate-500">Total Questions</p>
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
                    <p className="text-xs text-slate-500">Total Usage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {[
                    { id: "all", label: "All Templates" },
                    { id: "active", label: "Active", dot: true },
                    { id: "inactive", label: "Inactive" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        statusFilter === tab.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                      {tab.dot && statusFilter !== tab.id && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Base Template */}
            {baseTemplate && (
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
                              Used <span className="font-semibold text-slate-700">{baseTemplate.usage_count}</span> times
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicate(baseTemplate.id)
                          }}
                          className="gap-1.5"
                        >
                          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
                          Duplicate
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
            )}

            {/* My Templates */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                My Templates
              </h2>

              {customTemplates.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No custom templates yet</h3>
                  <p className="text-sm text-slate-500 mb-4">
                    Create your first template or duplicate the base template to get started
                  </p>
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    Create Template
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {customTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg group cursor-pointer ${
                        template.status === "active"
                          ? "border-emerald-200 hover:border-emerald-300"
                          : "border-slate-200/60 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className="p-5"
                        onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Template Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3 mb-2">
                              {template.status === "active" && (
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-2 shrink-0 animate-pulse" />
                              )}
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                                  {template.name}
                                </h3>
                                <p className="text-sm text-slate-500 mt-1 line-clamp-1">{template.description}</p>
                              </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 flex-wrap">
                              <span className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4" />
                                {template.questions.length} questions
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Star className="w-4 h-4" />
                                Used {template.usage_count} times
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {new Date(template.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
                            {getStatusBadge(template.status)}

                            {/* Dropdown */}
                            <div className="relative" ref={openDropdown === template.id ? dropdownRef : null}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setOpenDropdown(openDropdown === template.id ? null : template.id)
                                }}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical className="w-5 h-5 text-slate-400" />
                              </button>

                              {openDropdown === template.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleEdit(template)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4 text-slate-400" />
                                    Edit Template
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDuplicate(template.id)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Copy className="w-4 h-4 text-slate-400" />
                                    Duplicate
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleToggleStatus(template.id)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Power className="w-4 h-4 text-slate-400" />
                                    {template.status === "active" ? "Deactivate" : "Activate"}
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleDelete(template.id)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Template
                                  </button>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setExpandedTemplate(expandedTemplate === template.id ? null : template.id)
                              }}
                              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              {expandedTemplate === template.id ? (
                                <ChevronDown className="w-5 h-5 text-slate-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-slate-500" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Questions */}
                      {expandedTemplate === template.id && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-5 rounded-b-2xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-slate-700">Questions in this template:</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(template)}
                              className="gap-1.5"
                            >
                              <Edit3 className="w-4 h-4" />
                              Edit Questions
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {template.questions.map((question, index) => {
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
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage === 1 || isPending}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={`h-8 px-3 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0"
                            : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isPending}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage === totalPages || isPending}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Add Template Card */}
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
                <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h3 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors mb-1">
                Create New Template
              </h3>
              <p className="text-sm text-slate-500">
                Build a custom question template for your sessions
              </p>
            </div>
      </div>

      {/* Create/Edit Template Modal */}
      <TemplateModal
        isOpen={isCreateModalOpen || !!editingTemplate}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingTemplate(null)
        }}
        template={editingTemplate ? {
          id: parseInt(editingTemplate.id, 10) || Date.now(),
          name: editingTemplate.name,
          description: editingTemplate.description || '',
          isBase: editingTemplate.is_base,
          lastModified: editingTemplate.updated_at,
          usageCount: editingTemplate.usage_count,
          questions: editingTemplate.questions.map(q => ({
            id: parseInt(q.id, 10) || Date.now(),
            text: q.text,
            type: q.type,
            required: q.required,
            scale: q.scale,
            options: q.options || undefined,
          })),
        } : null}
        onSubmit={handleTemplateSubmit}
      />
    </>
  )
}
