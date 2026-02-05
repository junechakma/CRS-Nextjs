"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CreateCourseModal } from "@/components/teacher/create-course-modal"
import { EditCourseModal } from "@/components/teacher/edit-course-modal"
import { CourseData } from "@/lib/supabase/queries/teacher"
import { getTimeAgo } from "@/lib/supabase/queries/types"
import {
  GraduationCap,
  Plus,
  Users,
  Search,
  MoreVertical,
  BookOpen,
  Clock,
  ChevronRight,
  Star,
  MessageSquare,
  Pencil,
  Trash2,
  Play,
  Archive,
  Eye,
} from "lucide-react"

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
}

interface CoursesClientProps {
  courses: CourseData[]
  semesters: Array<{ id: string; name: string; status: string }>
}

export default function CoursesClient({ courses: initialCourses, semesters }: CoursesClientProps) {
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CourseData | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [courses, setCourses] = useState(initialCourses)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredCourses = courses.filter((course) => {
    const matchesSemester = selectedSemester === "all" || course.semester_id === selectedSemester
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSemester && matchesSearch
  })

  const handleEdit = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    if (course) {
      setEditingCourse(course)
      setIsEditModalOpen(true)
    }
    setOpenDropdown(null)
  }

  const handleStatusChange = (courseId: string, newStatus: string) => {
    setCourses(prev =>
      prev.map(course =>
        course.id === courseId ? { ...course, status: newStatus as 'active' | 'archived' } : course
      )
    )
    setOpenDropdown(null)
  }

  const handleDelete = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId))
    setOpenDropdown(null)
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                My Courses
              </h1>
            </div>
            <p className="text-slate-500">
              Manage your courses and track student engagement
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
          >
            <Plus className="w-5 h-5" />
            Create Course
          </Button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              <button
                onClick={() => setSelectedSemester("all")}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSemester === "all"
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                All Courses
              </button>
              {semesters.map((semester) => (
                <button
                  key={semester.id}
                  onClick={() => setSelectedSemester(semester.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedSemester === semester.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {semester.name}
                  {semester.status === 'current' && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 sm:max-w-xs ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const colors = colorMap[course.color] || colorMap.indigo
            return (
              <div
                key={course.id}
                className="gradient-border-card card-hover-lift group"
              >
                <div className="card-inner p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl ${colors.bg} transition-colors`}
                    >
                      <BookOpen className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div className="flex items-center gap-2">
                      {course.status === "active" ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                          <Archive className="w-3 h-3" />
                          Archived
                        </span>
                      )}

                      <div className="relative" ref={openDropdown === course.id ? dropdownRef : null}>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === course.id ? null : course.id)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>

                        {openDropdown === course.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                            <button
                              onClick={() => handleEdit(course.id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-slate-400" />
                              Edit Course
                            </button>

                            <button
                              onClick={() => {
                                console.log("View sessions for:", course.id)
                                setOpenDropdown(null)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-slate-400" />
                              View Sessions
                            </button>

                            <div className="border-t border-slate-100 my-1" />
                            <p className="px-4 py-1.5 text-xs font-medium text-slate-400 uppercase">Change Status</p>

                            {course.status !== "active" && (
                              <button
                                onClick={() => handleStatusChange(course.id, "active")}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Play className="w-4 h-4 text-emerald-500" />
                                Set as Active
                              </button>
                            )}

                            {course.status !== "archived" && (
                              <button
                                onClick={() => handleStatusChange(course.id, "archived")}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors"
                              >
                                <Archive className="w-4 h-4 text-slate-400" />
                                Archive Course
                              </button>
                            )}

                            <div className="border-t border-slate-100 my-1" />
                            <button
                              onClick={() => handleDelete(course.id)}
                              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete Course
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {course.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">
                        {course.semester}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {course.students}
                      </p>
                      <p className="text-xs text-slate-500">Students</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-slate-600 mb-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {course.sessions}
                      </p>
                      <p className="text-xs text-slate-500">Sessions</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {course.avg_rating.toFixed(1)}
                      </p>
                      <p className="text-xs text-slate-500">Rating</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.last_activity ? getTimeAgo(course.last_activity) : 'No activity'}
                    </span>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Sessions
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer group min-h-[280px]"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            </div>
            <h3 className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors mb-1">
              Create New Course
            </h3>
            <p className="text-sm text-slate-500">
              Add a new course to your portfolio
            </p>
          </div>
        </div>
      </div>

      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        semesters={semesters}
        onSubmit={(data) => {
          console.log("New course:", data)
        }}
      />

      <EditCourseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingCourse(null)
        }}
        semesters={semesters}
        course={editingCourse}
        onSubmit={(data) => {
          console.log("Edit course:", data)
        }}
      />
    </>
  )
}
