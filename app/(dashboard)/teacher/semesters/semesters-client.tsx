"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { AddSemesterModal } from "@/components/teacher/add-semester-modal"
import { EditSemesterModal } from "@/components/teacher/edit-semester-modal"
import { SemesterData } from "@/lib/supabase/queries/teacher"
import {
  createSemesterAction,
  updateSemesterAction,
  deleteSemesterAction,
  getSemestersPaginatedAction,
} from "@/lib/actions/semesters"
import {
  CalendarDays,
  Plus,
  GraduationCap,
  Users,
  Clock,
  MoreVertical,
  Search,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BookOpen,
  TrendingUp,
  Pencil,
  Trash2,
  Play,
  Pause,
  Archive,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  current: {
    label: "Current",
    icon: Clock,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    color: "text-slate-500",
    bg: "bg-slate-100",
  },
  upcoming: {
    label: "Upcoming",
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
}

interface SemestersClientProps {
  semesters: SemesterData[]
}

export default function SemestersClient({ semesters: initialSemesters }: SemestersClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<SemesterData | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [semesters, setSemesters] = useState(initialSemesters)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(initialSemesters.length)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [semesterToDelete, setSemesterToDelete] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

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
      // Reset and fetch from server
      setPage(1)
      fetchSemesters(1, searchQuery, filterStatus, true)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, filterStatus])

  // Fetch semesters from server
  const fetchSemesters = async (
    pageNum: number,
    search: string,
    status: string,
    reset: boolean = false
  ) => {
    setIsLoadingMore(true)

    try {
      const result = await getSemestersPaginatedAction({
        page: pageNum,
        pageSize: 12,
        search,
        status,
      })

      if (result.success) {
        if (reset) {
          setSemesters(result.data)
        } else {
          setSemesters(prev => [...prev, ...result.data])
        }
        setTotalCount(result.count || 0)
        setHasMore(pageNum < (result.totalPages || 0))
      }
    } catch (error) {
      console.error("Error fetching semesters:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Load more function
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchSemesters(nextPage, searchQuery, filterStatus, false)
    }
  }

  // Calculate stats from all loaded semesters (not filtered)
  const stats = {
    total: filterStatus === "all" ? totalCount : semesters.length,
    current: semesters.filter((s) => s.status === "current").length,
    upcoming: semesters.filter((s) => s.status === "upcoming").length,
    totalCourses: semesters.reduce((acc, s) => acc + s.courses, 0),
  }

  const handleStatusChange = async (semesterId: string, newStatus: string) => {
    setIsSubmitting(true)
    setOpenDropdown(null)

    try {
      const result = await updateSemesterAction({
        id: semesterId,
        status: newStatus as 'current' | 'upcoming' | 'completed',
      })

      if (result.success) {
        // Optimistically update the local state
        setSemesters(prev =>
          prev.map(sem =>
            sem.id === semesterId
              ? { ...sem, status: newStatus as 'current' | 'upcoming' | 'completed' }
              : sem
          )
        )

        toast.success("Semester status updated successfully")
        router.refresh()
      } else {
        toast.error(result.error || "Failed to update semester status")
      }
    } catch (error) {
      toast.error("An error occurred while updating the semester")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (semesterId: string) => {
    if (!confirm("Are you sure you want to delete this semester? This action cannot be undone.")) {
      return
    }

    setIsSubmitting(true)
    setOpenDropdown(null)

    try {
      const result = await deleteSemesterAction(semesterId)

      if (result.success) {
        toast.success("Semester deleted successfully")
        setSemesters(prev => prev.filter(sem => sem.id !== semesterId))
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete semester")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the semester")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!semesterToDelete) return

    setIsSubmitting(true)
    setOpenDropdown(null)

    try {
      const result = await deleteSemesterAction(semesterToDelete)

      if (result.success) {
        toast.success("Semester deleted successfully")
        setSemesters(prev => prev.filter(sem => sem.id !== semesterToDelete))
        setDeleteConfirmOpen(false)
        setSemesterToDelete(null)
        router.refresh()
      } else {
        toast.error(result.error || "Failed to delete semester")
      }
    } catch (error) {
      toast.error("An error occurred while deleting the semester")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (semesterId: string) => {
    const semester = semesters.find(s => s.id === semesterId)
    if (semester) {
      setEditingSemester(semester)
      setIsEditModalOpen(true)
    }
    setOpenDropdown(null)
  }

  const handleCreateSemester = async (data: {
    name: string
    startDate: string
    endDate: string
    description: string
    status: 'current' | 'upcoming'
  }) => {
    setIsSubmitting(true)

    try {
      const result = await createSemesterAction(data)

      if (result.success && result.data) {
        toast.success("Semester created successfully")
        setIsAddModalOpen(false)

        // Refetch first page to show new semester
        setPage(1)
        await fetchSemesters(1, searchQuery, filterStatus, true)
      } else {
        toast.error(result.error || "Failed to create semester")
      }
    } catch (error) {
      toast.error("An error occurred while creating the semester")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSemester = async (data: {
    name: string
    startDate: string
    endDate: string
    description: string
    status: 'current' | 'upcoming' | 'completed'
  }) => {
    if (!editingSemester) return

    setIsSubmitting(true)

    try {
      const result = await updateSemesterAction({
        id: editingSemester.id,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        status: data.status,
      })

      if (result.success) {
        // Optimistically update the local state
        setSemesters(prev =>
          prev.map(sem =>
            sem.id === editingSemester.id
              ? {
                ...sem,
                name: data.name,
                start_date: data.startDate,
                end_date: data.endDate,
                description: data.description,
                status: data.status,
              }
              : sem
          )
        )

        toast.success("Semester updated successfully")
        setIsEditModalOpen(false)
        setEditingSemester(null)
      } else {
        toast.error(result.error || "Failed to update semester")
      }
    } catch (error) {
      toast.error("An error occurred while updating the semester")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Semesters
              </h1>
            </div>
            <p className="text-slate-500">
              Manage your academic semesters and track progress
            </p>
          </div>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
          >
            <Plus className="w-5 h-5" />
            Add Semester
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-500">Total Semesters</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.current}</p>
                <p className="text-xs text-slate-500">Current</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.upcoming}</p>
                <p className="text-xs text-slate-500">Upcoming</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-50">
                <BookOpen className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.totalCourses}</p>
                <p className="text-xs text-slate-500">Total Courses</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {["all", "current", "upcoming", "completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${filterStatus === status
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                    }`}
                >
                  {status === "all" ? "All Semesters" : status}
                </button>
              ))}
            </div>

            <div className="flex-1 sm:max-w-xs ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search semesters..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {semesters.map((semester) => {
            const status = statusConfig[semester.status]
            const StatusIcon = status.icon
            return (
              <div
                key={semester.id}
                className="gradient-border-card card-hover-lift group"
              >
                <div className="card-inner p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${status.bg} transition-colors`}
                    >
                      <CalendarDays className={`w-6 h-6 ${status.color}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1.5 text-xs font-medium ${status.color} ${status.bg} px-2.5 py-1 rounded-full`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>

                      <div className="relative" ref={openDropdown === semester.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === semester.id ? null : semester.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>

                        {openDropdown === semester.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => handleEdit(semester.id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit Semester
                            </button>

                            <div className="border-t border-slate-100 my-1" />
                            <p className="px-4 py-1.5 text-xs font-medium text-slate-400 uppercase">Change Status</p>

                            {semester.status !== "current" && (
                              <button
                                onClick={() => handleStatusChange(semester.id, "current")}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Play className="w-4 h-4 text-emerald-500" />
                                Set as Current
                              </button>
                            )}

                            {semester.status !== "upcoming" && (
                              <button
                                onClick={() => handleStatusChange(semester.id, "upcoming")}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-amber-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Pause className="w-4 h-4 text-amber-500" />
                                Set as Upcoming
                              </button>
                            )}

                            {semester.status !== "completed" && (
                              <button
                                onClick={() => handleStatusChange(semester.id, "completed")}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                              >
                                <Archive className="w-4 h-4 text-slate-400" />
                                Mark Completed
                              </button>
                            )}

                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleDelete(semester.id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Semester
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {semester.name}
                    </h3>
                    {(semester as any).description && (
                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2">
                        {(semester as any).description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(semester.start_date)} — {formatDate(semester.end_date)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {semester.courses}
                      </p>
                      <p className="text-xs text-slate-500">Courses</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {semester.students}
                      </p>
                      <p className="text-xs text-slate-500">Students</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {semester.sessions}
                      </p>
                      <p className="text-xs text-slate-500">Sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          <div
            onClick={() => setIsAddModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors mb-1">
              Add New Semester
            </h3>
            <p className="text-sm text-slate-500">
              Create a new academic semester
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
                  Load More Semesters
                  <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        )}

        {/* Results Info */}
        {semesters.length > 0 && (
          <div className="text-center mt-6 text-sm text-slate-500">
            Showing {semesters.length} of {totalCount} semesters
          </div>
        )}
      </div>

      <AddSemesterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateSemester}
      />

      <EditSemesterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSemester(null)
        }}
        semester={editingSemester}
        onSubmit={handleEditSemester}
      />

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false)
          setSemesterToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Delete Semester"
        message="Are you sure you want to delete this semester? This action cannot be undone and will remove all associated data."
        confirmText="Delete Semester"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </>
  )
}
