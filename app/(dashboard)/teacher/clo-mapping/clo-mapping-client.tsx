"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { CLOSetData } from "@/lib/supabase/queries/teacher"
import {
  getCLOSetsPaginatedAction,
  createCLOSetAction,
  deleteCLOSetAction,
} from "@/lib/actions/clo"
import {
  Target,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
  X,
  Save,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface CLOMappingClientProps {
  cloSets: CLOSetData[]
  courses: Array<{ id: string; name: string; code: string }>
}

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", gradient: "from-indigo-500 to-indigo-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", gradient: "from-violet-500 to-violet-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500 to-amber-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", gradient: "from-rose-500 to-rose-600" },
}

export default function CLOMappingClient({ cloSets: initialCLOSets, courses }: CLOMappingClientProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cloSets, setCloSets] = useState<CLOSetData[]>(initialCLOSets)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(initialCLOSets.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [cloSetToDelete, setCloSetToDelete] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  const [formName, setFormName] = useState("")
  const [formCourse, setFormCourse] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formColor, setFormColor] = useState("indigo")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search and filter - refetch from server
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      fetchCLOSets(1, searchQuery, selectedCourse, true)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, selectedCourse])

  // Fetch CLO sets from server
  const fetchCLOSets = async (
    pageNum: number,
    search: string,
    courseId: string,
    reset: boolean = false
  ) => {
    setIsLoadingMore(true)

    try {
      const result = await getCLOSetsPaginatedAction({
        page: pageNum,
        pageSize: 12,
        search,
        courseId,
      })

      if (result.success) {
        if (reset) {
          setCloSets(result.data)
        } else {
          setCloSets(prev => [...prev, ...result.data])
        }
        setTotalCount(result.count || 0)
        setHasMore(pageNum < (result.totalPages || 0))
      } else {
        toast.error(result.error || "Failed to fetch CLO sets")
      }
    } catch (error) {
      console.error("Error fetching CLO sets:", error)
      toast.error("Failed to fetch CLO sets")
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Load more function
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchCLOSets(nextPage, searchQuery, selectedCourse, false)
    }
  }

  const handleDelete = (id: string) => {
    setCloSetToDelete(id)
    setDeleteConfirmOpen(true)
    setOpenDropdown(null)
  }

  const confirmDelete = async () => {
    if (!cloSetToDelete) return

    setIsSubmitting(true)

    try {
      // Optimistic update
      setCloSets(prev => prev.filter(set => set.id !== cloSetToDelete))

      const result = await deleteCLOSetAction(cloSetToDelete)

      if (result.success) {
        toast.success("CLO set deleted successfully")
        setDeleteConfirmOpen(false)
        setCloSetToDelete(null)
        // Refresh to adjust pagination
        await fetchCLOSets(1, searchQuery, selectedCourse, true)
      } else {
        toast.error(result.error || "Failed to delete CLO set")
        // Revert optimistic update
        await fetchCLOSets(page, searchQuery, selectedCourse, true)
      }
    } catch (error) {
      toast.error("An error occurred while deleting the CLO set")
      console.error(error)
      // Revert optimistic update
      await fetchCLOSets(page, searchQuery, selectedCourse, true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateSubmit = async () => {
    if (!formName || !formCourse) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createCLOSetAction({
        courseId: formCourse,
        name: formName,
        description: formDescription,
        color: formColor,
      })

      if (result.success) {
        toast.success("CLO set created successfully")
        setIsCreateModalOpen(false)
        setFormName("")
        setFormCourse("")
        setFormDescription("")
        setFormColor("indigo")
        setPage(1)
        await fetchCLOSets(1, searchQuery, selectedCourse, true)
      } else {
        toast.error(result.error || "Failed to create CLO set")
      }
    } catch (error) {
      toast.error("An error occurred while creating the CLO set")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const navigateToDetail = (id: string) => {
    router.push(`/teacher/clo-mapping/${id}`)
  }

  const stats = [
    {
      title: "Total CLO Sets",
      value: totalCount.toString(),
      icon: Layers,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      change: `Across ${courses.length} courses`,
    },
    {
      title: "Total CLOs",
      value: cloSets.reduce((acc, set) => acc + set.cloCount, 0).toString(),
      icon: Target,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      change: "Active outcomes",
    },
    {
      title: "Mapped Questions",
      value: cloSets.reduce((acc, set) => acc + set.mappedQuestions, 0).toString(),
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      change: "With CLO coverage",
    },
    {
      title: "Draft Sets",
      value: cloSets.filter(s => s.status === 'draft').length.toString(),
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      change: "Need attention",
    },
  ]

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                CLO Mapping
              </h1>
            </div>
            <p className="text-slate-500">
              Create and manage Course Learning Outcome sets
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
          >
            <Plus className="w-5 h-5" />
            Create CLO Set
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="gradient-border-card card-hover-lift group">
              <div className="card-inner p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full text-slate-600 bg-slate-100">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-0.5">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-500">{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedCourse("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCourse === "all"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Courses
              </button>
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => setSelectedCourse(course.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCourse === course.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {course.code}
                </button>
              ))}
            </div>

            <div className="flex-1 sm:max-w-xs ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search CLO Sets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CLO Sets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cloSets.map((set) => {
            const colors = colorMap[set.color] || colorMap.indigo
            return (
              <div
                key={set.id}
                className="gradient-border-card card-hover-lift group cursor-pointer"
                onClick={() => navigateToDetail(set.id)}
              >
                <div className="card-inner p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg} transition-colors`}>
                      <Target className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {set.status === "active" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          Draft
                        </span>
                      )}

                      <div className="relative" ref={openDropdown === set.id ? dropdownRef : null}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenDropdown(openDropdown === set.id ? null : set.id)
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>

                        {openDropdown === set.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigateToDetail(set.id)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit & Manage
                            </button>

                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(set.id)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete CLO Set
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {set.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {set.courseCode}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {set.courseName}
                      </span>
                    </div>
                    {set.description && (
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {set.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {set.cloCount}
                      </p>
                      <p className="text-xs text-slate-500">CLOs</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {set.mappedQuestions}
                      </p>
                      <p className="text-xs text-slate-500">Mapped</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {set.createdAt}
                    </span>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage CLOs
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Create New CLO Set Card */}
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group min-h-[320px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors mb-1">
              Create New CLO Set
            </h3>
            <p className="text-sm text-slate-500">
              Start mapping learning outcomes
            </p>
          </div>
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl font-medium transition-all"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Load More CLO Sets
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Results Info */}
        {cloSets.length > 0 && (
          <div className="text-center mt-6 text-sm text-slate-500">
            Showing {cloSets.length} of {totalCount} CLO sets
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Create CLO Set</h2>
                      <p className="text-sm text-slate-500">Define a new Course Learning Outcome set</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(false)}
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
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Fall 2024 CLO Set"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color Theme
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {Object.entries(colorMap).map(([colorName, colorData]) => (
                      <button
                        key={colorName}
                        onClick={() => setFormColor(colorName)}
                        className={`h-10 rounded-xl transition-all ${colorData.bg} ${
                          formColor === colorName
                            ? `ring-2 ring-offset-2 ${colorData.border.replace('border', 'ring')}`
                            : 'hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  onClick={() => setIsCreateModalOpen(false)}
                  variant="outline"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={isSubmitting || !formName || !formCourse}
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
                      Create CLO Set
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
          setCloSetToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete CLO Set"
        message="Are you sure you want to delete this CLO set? This action cannot be undone and will remove all CLOs and question mappings associated with this set."
        confirmText="Delete CLO Set"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </>
  )
}
