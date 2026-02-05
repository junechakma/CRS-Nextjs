"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CLOSetData } from "@/lib/supabase/queries/teacher"
import { createCLOSet, deleteCLOSet } from "@/lib/supabase/actions"
import {
  Target,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  BookOpen,
  Pencil,
  Trash2,
  Clock,
  CheckCircle2,
  Layers,
  FileText,
  X,
  Save,
} from "lucide-react"

interface CLOMappingClientProps {
  cloSets: CLOSetData[]
  courses: Array<{ id: string; name: string; code: string }>
  userId: string
}

const colorMap: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200", gradient: "from-indigo-500 to-indigo-600" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", gradient: "from-violet-500 to-violet-600" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", gradient: "from-blue-500 to-blue-600" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", gradient: "from-emerald-500 to-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", gradient: "from-amber-500 to-amber-600" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200", gradient: "from-rose-500 to-rose-600" },
}

export default function CLOMappingClient({ cloSets: initialCLOSets, courses, userId }: CLOMappingClientProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cloSets, setCloSets] = useState<CLOSetData[]>(initialCLOSets)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [formName, setFormName] = useState("")
  const [formCourse, setFormCourse] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formColor, setFormColor] = useState("indigo")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCLOSets = cloSets.filter((set) => {
    const matchesCourse = selectedCourse === "all" || set.courseId === selectedCourse
    const matchesSearch =
      set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      set.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCourse && matchesSearch
  })

  const stats = [
    {
      title: "Total CLO Sets",
      value: cloSets.length.toString(),
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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this CLO set?')) return

    const result = await deleteCLOSet(id)
    if (result.success) {
      setCloSets((prev) => prev.filter((set) => set.id !== id))
      setOpenDropdown(null)
    } else {
      alert(result.error || 'Failed to delete CLO set')
    }
  }

  const handleCreateSubmit = async () => {
    if (!formName || !formCourse) return

    setIsSubmitting(true)

    const result = await createCLOSet({
      userId,
      courseId: formCourse,
      name: formName,
      description: formDescription,
      color: formColor,
    })

    setIsSubmitting(false)

    if (result.success) {
      router.refresh()
      setIsCreateModalOpen(false)
      setFormName("")
      setFormCourse("")
      setFormDescription("")
      setFormColor("indigo")
    } else {
      alert(result.error || 'Failed to create CLO set')
    }
  }

  const navigateToDetail = (id: string) => {
    router.push(`/teacher/clo-mapping/${id}`)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Create CLO Set Button */}
        <div className="flex justify-end">
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

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
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
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search CLO Sets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCLOSets.map((set) => {
            const colors = colorMap[set.color]
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

                      <div
                        className="relative"
                        ref={openDropdown === set.id ? dropdownRef : null}
                        onClick={(e) => e.stopPropagation()}
                      >
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
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigateToDetail(set.id)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <BookOpen className="w-4 h-4 text-slate-400" />
                              View & Manage
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdown(null)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit Set
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
                              Delete Set
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {set.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {set.courseCode}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500 truncate">
                        {set.courseName}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2">
                      {set.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1.5 text-indigo-600 mb-1">
                        <Target className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {set.cloCount}
                      </p>
                      <p className="text-xs text-slate-500">CLOs</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center justify-center gap-1.5 text-violet-600 mb-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {set.mappedQuestions}
                      </p>
                      <p className="text-xs text-slate-500">Questions</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {set.createdAt}
                    </span>
                    <span className="text-sm font-medium text-indigo-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            )
          })}

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
              Define learning outcomes for a course
            </p>
          </div>
        </div>

        {filteredCLOSets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">No CLO Sets found</h3>
            <p className="text-sm text-slate-500">
              {searchQuery ? "Try a different search term" : "Create your first CLO Set to get started"}
            </p>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        Create CLO Set
                      </h2>
                      <p className="text-sm text-slate-500">
                        Define a new set of learning outcomes
                      </p>
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

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Set Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., ML Fundamentals CLO Set"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
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
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the learning outcomes covered in this set..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Color Theme
                  </label>
                  <div className="flex gap-2">
                    {Object.keys(colorMap).map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormColor(color)}
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[color].gradient} transition-all ${
                          formColor === color
                            ? "ring-2 ring-offset-2 ring-indigo-500 scale-110"
                            : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={!formName || !formCourse || isSubmitting}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Creating...' : 'Create CLO Set'}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
