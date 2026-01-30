"use client"

import { useState, useRef, useEffect } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Target,
  Plus,
  Search,
  MoreVertical,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Link2,
  Unlink,
  Pencil,
  Trash2,
  GraduationCap,
  X,
  Save,
  AlertCircle,
  FileText,
} from "lucide-react"

interface CLO {
  id: number
  code: string
  description: string
  courseId: number
  courseName: string
  courseCode: string
  linkedQuestions: number
  linkedSessions: number
  status: "active" | "inactive"
}

interface Course {
  id: number
  name: string
  code: string
}

const courses: Course[] = [
  { id: 1, name: "Introduction to Machine Learning", code: "CS401" },
  { id: 2, name: "Database Systems", code: "CS305" },
  { id: 3, name: "Data Structures & Algorithms", code: "CS201" },
  { id: 4, name: "Software Engineering", code: "CS350" },
]

const initialCLOs: CLO[] = [
  {
    id: 1,
    code: "CLO-1",
    description: "Understand fundamental concepts of machine learning algorithms and their applications",
    courseId: 1,
    courseName: "Introduction to Machine Learning",
    courseCode: "CS401",
    linkedQuestions: 8,
    linkedSessions: 3,
    status: "active",
  },
  {
    id: 2,
    code: "CLO-2",
    description: "Apply supervised learning techniques to solve real-world classification problems",
    courseId: 1,
    courseName: "Introduction to Machine Learning",
    courseCode: "CS401",
    linkedQuestions: 5,
    linkedSessions: 2,
    status: "active",
  },
  {
    id: 3,
    code: "CLO-3",
    description: "Evaluate and compare different machine learning models using appropriate metrics",
    courseId: 1,
    courseName: "Introduction to Machine Learning",
    courseCode: "CS401",
    linkedQuestions: 3,
    linkedSessions: 1,
    status: "active",
  },
  {
    id: 4,
    code: "CLO-1",
    description: "Design and implement relational database schemas following normalization principles",
    courseId: 2,
    courseName: "Database Systems",
    courseCode: "CS305",
    linkedQuestions: 6,
    linkedSessions: 2,
    status: "active",
  },
  {
    id: 5,
    code: "CLO-2",
    description: "Write complex SQL queries including joins, subqueries, and aggregations",
    courseId: 2,
    courseName: "Database Systems",
    courseCode: "CS305",
    linkedQuestions: 10,
    linkedSessions: 4,
    status: "active",
  },
  {
    id: 6,
    code: "CLO-1",
    description: "Analyze time and space complexity of algorithms using Big-O notation",
    courseId: 3,
    courseName: "Data Structures & Algorithms",
    courseCode: "CS201",
    linkedQuestions: 12,
    linkedSessions: 5,
    status: "active",
  },
  {
    id: 7,
    code: "CLO-2",
    description: "Implement and apply fundamental data structures including trees, graphs, and hash tables",
    courseId: 3,
    courseName: "Data Structures & Algorithms",
    courseCode: "CS201",
    linkedQuestions: 0,
    linkedSessions: 0,
    status: "inactive",
  },
]

const stats = [
  {
    title: "Total CLOs",
    value: "7",
    icon: Target,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    change: "Across 3 courses",
  },
  {
    title: "Linked Questions",
    value: "44",
    icon: FileText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    change: "Active mappings",
  },
  {
    title: "Linked Sessions",
    value: "17",
    icon: BookOpen,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "With CLO coverage",
  },
  {
    title: "Unmapped CLOs",
    value: "1",
    icon: AlertCircle,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    change: "Need attention",
  },
]

export default function CLOMappingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [clos, setClos] = useState<CLO[]>(initialCLOs)
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingCLO, setEditingCLO] = useState<CLO | null>(null)
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

  const filteredCLOs = clos.filter((clo) => {
    const matchesCourse = selectedCourse === "all" || clo.courseId.toString() === selectedCourse
    const matchesSearch =
      clo.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clo.courseName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCourse && matchesSearch
  })

  const handleDelete = (id: number) => {
    setClos((prev) => prev.filter((clo) => clo.id !== id))
    setOpenDropdown(null)
  }

  const handleToggleStatus = (id: number) => {
    setClos((prev) =>
      prev.map((clo) =>
        clo.id === id
          ? { ...clo, status: clo.status === "active" ? "inactive" : "active" }
          : clo
      )
    )
    setOpenDropdown(null)
  }

  // Group CLOs by course for better visualization
  const groupedCLOs = filteredCLOs.reduce((acc, clo) => {
    const key = clo.courseCode
    if (!acc[key]) {
      acc[key] = {
        courseName: clo.courseName,
        courseCode: clo.courseCode,
        clos: [],
      }
    }
    acc[key].clos.push(clo)
    return acc
  }, {} as Record<string, { courseName: string; courseCode: string; clos: CLO[] }>)

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
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    CLO Mapping
                  </h1>
                </div>
                <p className="text-slate-500">
                  Map Course Learning Outcomes to questions and sessions
                </p>
              </div>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
              >
                <Plus className="w-5 h-5" />
                Add CLO
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

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  <button
                    onClick={() => setSelectedCourse("all")}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCourse === "all"
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-100"
                      }`}
                  >
                    All Courses
                  </button>
                  {courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id.toString())}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedCourse === course.id.toString()
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
                    placeholder="Search CLOs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* CLO List - Grouped by Course */}
            <div className="space-y-6">
              {Object.entries(groupedCLOs).map(([courseCode, group]) => (
                <div key={courseCode} className="space-y-3">
                  {/* Course Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100">
                      <GraduationCap className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{group.courseName}</h3>
                      <p className="text-xs text-slate-500">{group.courseCode} • {group.clos.length} CLOs</p>
                    </div>
                  </div>

                  {/* CLO Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-11">
                    {group.clos.map((clo) => (
                      <div
                        key={clo.id}
                        className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg ${clo.status === "active"
                            ? "border-slate-200/60 hover:border-indigo-300"
                            : "border-slate-200 bg-slate-50/50"
                          }`}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${clo.status === "active"
                                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                                  }`}
                              >
                                {clo.code}
                              </Badge>
                              {clo.linkedQuestions === 0 && clo.linkedSessions === 0 && (
                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Unmapped
                                </Badge>
                              )}
                            </div>

                            {/* Dropdown Menu */}
                            <div className="relative" ref={openDropdown === clo.id ? dropdownRef : null}>
                              <button
                                onClick={() => setOpenDropdown(openDropdown === clo.id ? null : clo.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </button>

                              {openDropdown === clo.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={() => {
                                      setEditingCLO(clo)
                                      setOpenDropdown(null)
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4 text-slate-400" />
                                    Edit CLO
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(clo.id)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    {clo.status === "active" ? (
                                      <>
                                        <Unlink className="w-4 h-4 text-slate-400" />
                                        Set Inactive
                                      </>
                                    ) : (
                                      <>
                                        <Link2 className="w-4 h-4 text-slate-400" />
                                        Set Active
                                      </>
                                    )}
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => handleDelete(clo.id)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete CLO
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <p className={`text-sm mb-4 line-clamp-2 ${clo.status === "active" ? "text-slate-700" : "text-slate-500"}`}>
                            {clo.description}
                          </p>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <FileText className="w-4 h-4 text-violet-500" />
                              <span className="font-medium">{clo.linkedQuestions}</span>
                              <span className="text-slate-400">questions</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <BookOpen className="w-4 h-4 text-blue-500" />
                              <span className="font-medium">{clo.linkedSessions}</span>
                              <span className="text-slate-400">sessions</span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Action Footer */}
                        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between">
                          <span className={`text-xs ${clo.status === "active" ? "text-emerald-600" : "text-slate-500"}`}>
                            {clo.status === "active" ? "Active" : "Inactive"}
                          </span>
                          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                            Manage Links
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredCLOs.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">No CLOs found</h3>
                  <p className="text-sm text-slate-500">
                    {searchQuery ? "Try a different search term" : "Create your first CLO to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Create/Edit CLO Modal */}
      {(isCreateModalOpen || editingCLO) && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsCreateModalOpen(false)
              setEditingCLO(null)
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {editingCLO ? "Edit CLO" : "Add New CLO"}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {editingCLO ? "Update course learning outcome" : "Create a new course learning outcome"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setEditingCLO(null)
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Course <span className="text-red-500">*</span>
                  </label>
                  <select
                    defaultValue={editingCLO?.courseId || ""}
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
                    CLO Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    defaultValue={editingCLO?.code || ""}
                    placeholder="e.g., CLO-1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    defaultValue={editingCLO?.description || ""}
                    placeholder="Describe the learning outcome..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingCLO(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setEditingCLO(null)
                  }}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  <Save className="w-4 h-4" />
                  {editingCLO ? "Save Changes" : "Create CLO"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
