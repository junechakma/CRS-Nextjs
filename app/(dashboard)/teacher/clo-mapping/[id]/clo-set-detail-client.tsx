"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CLOData } from "@/lib/supabase/queries/teacher"
import {
  updateCLOSetAction,
  createCLOAction,
  updateCLOAction,
  deleteCLOAction,
} from "@/lib/actions/clo"
import {
  Target,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  FileText,
  X,
  Save,
  Loader2,
  ArrowLeft,
  BookOpen,
  GripVertical,
  BarChart3,
} from "lucide-react"
import { toast } from "sonner"

interface CLOSetDetailClientProps {
  cloSet: {
    id: string
    name: string
    description: string
    courseId: string
    courseName: string
    courseCode: string
    cloCount: number
    mappedQuestions: number
    createdAt: string
    status: "active" | "draft"
    color: string
  }
  clos: CLOData[]
  userId: string
}

const colorMap: Record<
  string,
  { bg: string; text: string; border: string; gradient: string }
> = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-indigo-600",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-600",
    border: "border-violet-200",
    gradient: "from-violet-500 to-violet-600",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
    gradient: "from-blue-500 to-blue-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-600",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-600",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-200",
    gradient: "from-rose-500 to-rose-600",
  },
}

const bloomLevels = [
  "Remember",
  "Understand",
  "Apply",
  "Analyze",
  "Evaluate",
  "Create",
]

export default function CLOSetDetailClient({
  cloSet: initialCLOSet,
  clos: initialCLOs,
  userId,
}: CLOSetDetailClientProps) {
  const router = useRouter()
  const [cloSet, setCloSet] = useState(initialCLOSet)
  const [clos, setClos] = useState<CLOData[]>(initialCLOs)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isEditSetModalOpen, setIsEditSetModalOpen] = useState(false)
  const [isCreateCLOModalOpen, setIsCreateCLOModalOpen] = useState(false)
  const [isEditCLOModalOpen, setIsEditCLOModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [cloToDelete, setCloToDelete] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Edit CLO Set form
  const [editSetName, setEditSetName] = useState("")
  const [editSetDescription, setEditSetDescription] = useState("")

  // Create/Edit CLO form
  const [cloCode, setCloCode] = useState("")
  const [cloDescription, setCloDescription] = useState("")
  const [cloBloomLevel, setCloBloomLevel] = useState("")
  const [editingCLOId, setEditingCLOId] = useState<string | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const colors = colorMap[cloSet.color] || colorMap.indigo

  const handleToggleStatus = async () => {
    const newStatus = cloSet.status === "active" ? "draft" : "active"

    // Optimistic update
    setCloSet((prev) => ({ ...prev, status: newStatus }))

    const result = await updateCLOSetAction({
      id: cloSet.id,
      status: newStatus,
    })

    if (result.success) {
      toast.success(
        `CLO set ${newStatus === "active" ? "activated" : "set to draft"}`
      )
    } else {
      toast.error(result.error || "Failed to update status")
      // Revert optimistic update
      setCloSet((prev) => ({
        ...prev,
        status: newStatus === "active" ? "draft" : "active",
      }))
    }
  }

  const openEditSetModal = () => {
    setEditSetName(cloSet.name)
    setEditSetDescription(cloSet.description)
    setIsEditSetModalOpen(true)
  }

  const handleEditSetSubmit = async () => {
    if (!editSetName) {
      toast.error("Please enter a name")
      return
    }

    setIsSubmitting(true)

    try {
      // Optimistic update
      setCloSet((prev) => ({
        ...prev,
        name: editSetName,
        description: editSetDescription,
      }))

      const result = await updateCLOSetAction({
        id: cloSet.id,
        name: editSetName,
        description: editSetDescription,
      })

      if (result.success) {
        toast.success("CLO set updated successfully")
        setIsEditSetModalOpen(false)
      } else {
        toast.error(result.error || "Failed to update CLO set")
        // Revert optimistic update
        setCloSet(initialCLOSet)
      }
    } catch (error) {
      toast.error("An error occurred while updating the CLO set")
      console.error(error)
      setCloSet(initialCLOSet)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openCreateCLOModal = () => {
    setCloCode("")
    setCloDescription("")
    setCloBloomLevel("")
    setIsCreateCLOModalOpen(true)
  }

  const handleCreateCLOSubmit = async () => {
    if (!cloCode || !cloDescription) {
      toast.error("Please fill in code and description")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createCLOAction({
        cloSetId: cloSet.id,
        code: cloCode,
        description: cloDescription,
        bloomLevel: cloBloomLevel || undefined,
      })

      if (result.success) {
        toast.success("CLO created successfully")
        setIsCreateCLOModalOpen(false)

        // Add to local state
        const newCLO: CLOData = {
          id: result.data.id,
          cloSetId: cloSet.id,
          code: cloCode,
          description: cloDescription,
          bloomLevel: cloBloomLevel || null,
          mappedQuestions: 0,
          avgRelevance: 0,
          coveragePercentage: 0,
          orderIndex: result.data.order_index,
        }
        setClos((prev) => [...prev, newCLO])
        setCloSet((prev) => ({ ...prev, cloCount: prev.cloCount + 1 }))

        // Reset form
        setCloCode("")
        setCloDescription("")
        setCloBloomLevel("")
      } else {
        toast.error(result.error || "Failed to create CLO")
      }
    } catch (error) {
      toast.error("An error occurred while creating the CLO")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditCLOModal = (clo: CLOData) => {
    setEditingCLOId(clo.id)
    setCloCode(clo.code)
    setCloDescription(clo.description)
    setCloBloomLevel(clo.bloomLevel || "")
    setIsEditCLOModalOpen(true)
    setOpenDropdown(null)
  }

  const handleEditCLOSubmit = async () => {
    if (!editingCLOId || !cloCode || !cloDescription) {
      toast.error("Please fill in code and description")
      return
    }

    setIsSubmitting(true)

    try {
      // Optimistic update
      setClos((prev) =>
        prev.map((c) =>
          c.id === editingCLOId
            ? {
                ...c,
                code: cloCode,
                description: cloDescription,
                bloomLevel: cloBloomLevel || null,
              }
            : c
        )
      )

      const result = await updateCLOAction({
        id: editingCLOId,
        code: cloCode,
        description: cloDescription,
        bloomLevel: cloBloomLevel || undefined,
      })

      if (result.success) {
        toast.success("CLO updated successfully")
        setIsEditCLOModalOpen(false)
        setEditingCLOId(null)
      } else {
        toast.error(result.error || "Failed to update CLO")
        // Revert optimistic update
        setClos(initialCLOs)
      }
    } catch (error) {
      toast.error("An error occurred while updating the CLO")
      console.error(error)
      setClos(initialCLOs)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteCLO = (id: string) => {
    setCloToDelete(id)
    setDeleteConfirmOpen(true)
    setOpenDropdown(null)
  }

  const confirmDeleteCLO = async () => {
    if (!cloToDelete) return

    setIsSubmitting(true)

    try {
      // Optimistic update
      setClos((prev) => prev.filter((c) => c.id !== cloToDelete))
      setCloSet((prev) => ({ ...prev, cloCount: prev.cloCount - 1 }))

      const result = await deleteCLOAction(cloToDelete)

      if (result.success) {
        toast.success("CLO deleted successfully")
        setDeleteConfirmOpen(false)
        setCloToDelete(null)
      } else {
        toast.error(result.error || "Failed to delete CLO")
        // Revert optimistic update
        setClos(initialCLOs)
        setCloSet(initialCLOSet)
      }
    } catch (error) {
      toast.error("An error occurred while deleting the CLO")
      console.error(error)
      setClos(initialCLOs)
      setCloSet(initialCLOSet)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => router.push("/teacher/clo-mapping")}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to CLO Mapping</span>
        </button>

        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg`}
              >
                <Target className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {cloSet.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {cloSet.courseCode}
                  </span>
                  <span className="text-sm text-slate-400">•</span>
                  <span className="text-sm text-slate-500">
                    {cloSet.courseName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleToggleStatus}
                variant="outline"
                className={`gap-2 ${
                  cloSet.status === "active"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                }`}
              >
                {cloSet.status === "active" ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Active
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Draft
                  </>
                )}
              </Button>
              <Button
                onClick={() => router.push(`/teacher/clo-mapping/${cloSet.id}/analytics`)}
                variant="outline"
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                onClick={openEditSetModal}
                variant="outline"
                className="gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit Details
              </Button>
            </div>
          </div>

          {cloSet.description && (
            <p className="text-slate-600 bg-slate-50 p-4 rounded-xl">
              {cloSet.description}
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="gradient-border-card">
            <div className="card-inner p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50">
                  <Target className="w-5 h-5 text-indigo-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-0.5">
                {clos.length}
              </h3>
              <p className="text-sm text-slate-500">Total CLOs</p>
            </div>
          </div>

          <div className="gradient-border-card">
            <div className="card-inner p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-violet-50">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-0.5">
                {cloSet.mappedQuestions}
              </h3>
              <p className="text-sm text-slate-500">Mapped Questions</p>
            </div>
          </div>

          <div className="gradient-border-card">
            <div className="card-inner p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-0.5">
                {clos.reduce((acc, c) => acc + c.mappedQuestions, 0)}
              </h3>
              <p className="text-sm text-slate-500">Total Mappings</p>
            </div>
          </div>
        </div>

        {/* CLOs Section */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Course Learning Outcomes
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Define and manage CLOs for this course
              </p>
            </div>
            <Button
              onClick={openCreateCLOModal}
              className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
            >
              <Plus className="w-4 h-4" />
              Add CLO
            </Button>
          </div>

          <div className="p-6">
            {clos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-slate-700 mb-1">
                  No CLOs yet
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Start by adding your first Course Learning Outcome
                </p>
                <Button
                  onClick={openCreateCLOModal}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  <Plus className="w-4 h-4" />
                  Add First CLO
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {clos.map((clo, index) => (
                  <div
                    key={clo.id}
                    className="group border border-slate-200 rounded-xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
                        <GripVertical className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-mono text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                                {clo.code}
                              </span>
                              {clo.bloomLevel && (
                                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
                                  {clo.bloomLevel}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-slate-700 mb-3">
                              {clo.description}
                            </p>

                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                {clo.mappedQuestions} mapped
                              </span>
                              {clo.avgRelevance > 0 && (
                                <span>
                                  Avg Relevance: {clo.avgRelevance.toFixed(1)}%
                                </span>
                              )}
                              {clo.coveragePercentage > 0 && (
                                <span>
                                  Coverage: {clo.coveragePercentage.toFixed(1)}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            className="relative"
                            ref={openDropdown === clo.id ? dropdownRef : null}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdown(
                                  openDropdown === clo.id ? null : clo.id
                                )
                              }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {openDropdown === clo.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openEditCLOModal(clo)
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                  Edit CLO
                                </button>

                                <div className="border-t border-slate-100 my-1" />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDeleteCLO(clo.id)
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete CLO
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit CLO Set Modal */}
      {isEditSetModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsEditSetModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${colors.gradient} shadow-lg shadow-indigo-200`}
                    >
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Edit CLO Set
                      </h2>
                      <p className="text-sm text-slate-500">
                        Update CLO set details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditSetModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CLO Set Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editSetName}
                    onChange={(e) => setEditSetName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editSetDescription}
                    onChange={(e) => setEditSetDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  onClick={() => setIsEditSetModalOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditSetSubmit}
                  disabled={isSubmitting || !editSetName}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Create CLO Modal */}
      {isCreateCLOModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsCreateCLOModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Add Course Learning Outcome
                      </h2>
                      <p className="text-sm text-slate-500">
                        Define a new CLO for this course
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateCLOModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CLO Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cloCode}
                    onChange={(e) => setCloCode(e.target.value)}
                    placeholder="e.g., CLO-1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cloDescription}
                    onChange={(e) => setCloDescription(e.target.value)}
                    placeholder="Describe what students should be able to do..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bloom's Taxonomy Level (Optional)
                  </label>
                  <select
                    value={cloBloomLevel}
                    onChange={(e) => setCloBloomLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select a level</option>
                    {bloomLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  onClick={() => setIsCreateCLOModalOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateCLOSubmit}
                  disabled={isSubmitting || !cloCode || !cloDescription}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Add CLO
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit CLO Modal */}
      {isEditCLOModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsEditCLOModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">
                        Edit Course Learning Outcome
                      </h2>
                      <p className="text-sm text-slate-500">
                        Update CLO details
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditCLOModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    CLO Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={cloCode}
                    onChange={(e) => setCloCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={cloDescription}
                    onChange={(e) => setCloDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bloom's Taxonomy Level (Optional)
                  </label>
                  <select
                    value={cloBloomLevel}
                    onChange={(e) => setCloBloomLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select a level</option>
                    {bloomLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  onClick={() => setIsEditCLOModalOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEditCLOSubmit}
                  disabled={isSubmitting || !cloCode || !cloDescription}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setCloToDelete(null)
        }}
        onConfirm={confirmDeleteCLO}
        title="Delete CLO"
        message="Are you sure you want to delete this CLO? This action cannot be undone and will remove all question mappings associated with this CLO."
        confirmText="Delete CLO"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </>
  )
}
