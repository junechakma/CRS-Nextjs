"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  GraduationCap,
  BookOpen,
  FileText,
  Hash,
  Calendar,
  Palette,
  AlertCircle,
} from "lucide-react"

interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: CourseFormData) => void
  semesters: { id: string; name: string }[]
}

interface CourseFormData {
  name: string
  code: string
  semester: string
  description: string
  color: string
}

const colorOptions = [
  { id: "indigo", label: "Indigo", bg: "bg-indigo-500", ring: "ring-indigo-500" },
  { id: "violet", label: "Violet", bg: "bg-violet-500", ring: "ring-violet-500" },
  { id: "blue", label: "Blue", bg: "bg-blue-500", ring: "ring-blue-500" },
  { id: "emerald", label: "Emerald", bg: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500", ring: "ring-amber-500" },
  { id: "rose", label: "Rose", bg: "bg-rose-500", ring: "ring-rose-500" },
]

export function CreateCourseModal({ isOpen, onClose, onSubmit, semesters }: CreateCourseModalProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    name: "",
    code: "",
    semester: "",
    description: "",
    color: "indigo",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({})

  // Set default semester to first active/available one
  useEffect(() => {
    if (semesters.length > 0 && !formData.semester) {
      setFormData(prev => ({ ...prev, semester: semesters[0].id }))
    }
  }, [semesters])

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
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Course name is required"
    if (!formData.code.trim()) newErrors.code = "Course code is required"
    if (!formData.semester) newErrors.semester = "Please select a semester"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    onSubmit?.(formData)
    setIsSubmitting(false)
    onClose()
    // Reset form
    setFormData({
      name: "",
      code: "",
      semester: semesters[0]?.id || "",
      description: "",
      color: "indigo",
    })
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
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Create New Course</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Add a course to your portfolio</p>
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
          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Course Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <BookOpen className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Course Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Introduction to Machine Learning"
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

            {/* Course Code & Semester */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., CS401"
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm font-mono uppercase ${
                    errors.code
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.code && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.code}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Semester
                </label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm bg-white ${
                    errors.semester
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                >
                  {semesters.map((semester) => (
                    <option key={semester.id} value={semester.id}>
                      {semester.name}
                    </option>
                  ))}
                </select>
                {errors.semester && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.semester}
                  </p>
                )}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Palette className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Course Color
              </label>
              <div className="flex gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.id })}
                    className={`w-10 h-10 rounded-xl ${color.bg} transition-all hover:scale-110 ${
                      formData.color === color.id
                        ? `ring-2 ${color.ring} ring-offset-2`
                        : ""
                    }`}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the course content and objectives..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border-2 border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all border-0 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Create Course
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
