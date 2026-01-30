"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Button } from "@/components/ui/button"
import { AddSemesterModal } from "@/components/teacher/add-semester-modal"
import { EditSemesterModal } from "@/components/teacher/edit-semester-modal"
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
} from "lucide-react"

const initialSemesters = [
  {
    id: 1,
    name: "Spring 2025",
    startDate: "Jan 15, 2025",
    endDate: "May 20, 2025",
    status: "current",
    courses: 4,
    students: 319,
    sessions: 41,
    progress: 35,
  },
  {
    id: 2,
    name: "Fall 2024",
    startDate: "Aug 26, 2024",
    endDate: "Dec 15, 2024",
    status: "completed",
    courses: 3,
    students: 245,
    sessions: 38,
    progress: 100,
  },
  {
    id: 3,
    name: "Spring 2024",
    startDate: "Jan 16, 2024",
    endDate: "May 18, 2024",
    status: "completed",
    courses: 4,
    students: 298,
    sessions: 52,
    progress: 100,
  },
  {
    id: 4,
    name: "Summer 2025",
    startDate: "Jun 2, 2025",
    endDate: "Aug 8, 2025",
    status: "upcoming",
    courses: 2,
    students: 0,
    sessions: 0,
    progress: 0,
  },
]

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

export default function SemestersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingSemester, setEditingSemester] = useState<typeof initialSemesters[0] | null>(null)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [semesters, setSemesters] = useState(initialSemesters)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  const filteredSemesters = semesters.filter((semester) => {
    const matchesSearch = semester.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === "all" || semester.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const stats = {
    total: semesters.length,
    current: semesters.filter((s) => s.status === "current").length,
    upcoming: semesters.filter((s) => s.status === "upcoming").length,
    totalCourses: semesters.reduce((acc, s) => acc + s.courses, 0),
  }

  const handleStatusChange = (semesterId: number, newStatus: string) => {
    setSemesters(prev =>
      prev.map(sem =>
        sem.id === semesterId ? { ...sem, status: newStatus } : sem
      )
    )
    setOpenDropdown(null)
  }

  const handleDelete = (semesterId: number) => {
    setSemesters(prev => prev.filter(sem => sem.id !== semesterId))
    setOpenDropdown(null)
  }

  const handleEdit = (semesterId: number) => {
    const semester = semesters.find(s => s.id === semesterId)
    if (semester) {
      setEditingSemester(semester)
      setIsEditModalOpen(true)
    }
    setOpenDropdown(null)
  }

  const handleEditSubmit = (data: { id: number; name: string; startDate: string; endDate: string; status: string }) => {
    setSemesters(prev =>
      prev.map(sem =>
        sem.id === data.id
          ? {
              ...sem,
              name: data.name,
              startDate: new Date(data.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              endDate: new Date(data.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              status: data.status,
            }
          : sem
      )
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      <Sidebar
        role="teacher"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        <Header
          userName="Dr. Sarah Johnson"
          userEmail="sarah.j@university.edu"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
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

            {/* Quick Stats */}
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

            {/* Filters & Search */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {["all", "current", "upcoming", "completed"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all capitalize ${
                        filterStatus === status
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {status === "all" ? "All Semesters" : status}
                    </button>
                  ))}
                </div>

                {/* Search */}
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

            {/* Semesters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSemesters.map((semester) => {
                const status = statusConfig[semester.status]
                const StatusIcon = status.icon
                return (
                  <div
                    key={semester.id}
                    className="gradient-border-card card-hover-lift group"
                  >
                    <div className="card-inner p-6">
                      {/* Header */}
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

                          {/* Dropdown Menu */}
                          <div className="relative" ref={openDropdown === semester.id ? dropdownRef : null}>
                            <button
                              onClick={() => setOpenDropdown(openDropdown === semester.id ? null : semester.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-slate-400" />
                            </button>

                            {openDropdown === semester.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Edit */}
                                <button
                                  onClick={() => handleEdit(semester.id)}
                                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                >
                                  <Pencil className="w-4 h-4 text-slate-400" />
                                  Edit Semester
                                </button>

                                {/* Status Change Options */}
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

                                {/* Delete */}
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

                      {/* Semester Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {semester.name}
                        </h3>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 px-3 py-2 rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{semester.startDate} — {semester.endDate}</span>
                      </div>

                      {/* Stats */}
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

              {/* Add Semester Card */}
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
          </div>
        </main>
      </div>

      {/* Add Semester Modal */}
      <AddSemesterModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => {
          console.log("New semester:", data)
          // Handle the new semester data here
        }}
      />

      {/* Edit Semester Modal */}
      <EditSemesterModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSemester(null)
        }}
        semester={editingSemester}
        onSubmit={handleEditSubmit}
      />
    </div>
  )
}
