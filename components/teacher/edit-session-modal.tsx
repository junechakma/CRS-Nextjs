"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  Layers,
  Key,
  RefreshCw,
  AlertCircle,
  Play,
  Pencil,
  CheckCircle2,
  StopCircle,
  Users,
} from "lucide-react"
import { SessionData } from "@/lib/supabase/queries/teacher"

interface EditSessionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: SessionFormData) => void
  session: SessionData | null
  courses: { id: string; name: string; code: string }[]
  templates: { id: string; name: string }[]
}

interface SessionFormData {
  id: string
  name: string
  description: string
  courseId: string
  templateId: string
  date: string
  startTime: string
  endTime: string
  accessCode: string
  status: "scheduled" | "live" | "completed"
  expectedStudents: number
}

// Generate random access code
const generateAccessCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const part1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `${part1}-${part2}`
}

// Convert time string like "10:00 AM" to "10:00" format
const convertTo24Hour = (time12h: string) => {
  if (!time12h || time12h.includes(":") && !time12h.includes(" ")) return time12h
  const [time, modifier] = time12h.split(" ")
  let [hours, minutes] = time.split(":")
  if (modifier === "PM" && hours !== "12") {
    hours = String(parseInt(hours, 10) + 12)
  }
  if (modifier === "AM" && hours === "12") {
    hours = "00"
  }
  return `${hours.padStart(2, "0")}:${minutes}`
}

// Convert date like "Today", "Tomorrow", "Jan 28, 2025" to YYYY-MM-DD
const convertToDateInput = (dateStr: string) => {
  const today = new Date()
  if (dateStr === "Today") {
    return today.toISOString().split("T")[0]
  }
  if (dateStr === "Tomorrow") {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }
  if (dateStr === "Yesterday") {
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split("T")[0]
  }
  // Try to parse other date formats
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0]
  }
  return today.toISOString().split("T")[0]
}

export function EditSessionModal({ isOpen, onClose, onSubmit, session, courses, templates }: EditSessionModalProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    id: "",
    name: "",
    description: "",
    courseId: "",
    templateId: "",
    date: "",
    startTime: "",
    endTime: "",
    accessCode: "",
    status: "scheduled",
    expectedStudents: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormData, string>>>({})

  // Populate form when session changes
  useEffect(() => {
    if (session) {
      // Find course id from course code
      const courseId = courses.find(c => c.code === session.courseCode)?.id || session.courseId || ""

      setFormData({
        id: session.id,
        name: session.name,
        description: session.description || "",
        courseId: courseId,
        templateId: session.templateId || templates[0]?.id || "",
        date: convertToDateInput(session.date),
        startTime: convertTo24Hour(session.startTime),
        endTime: convertTo24Hour(session.endTime),
        accessCode: session.accessCode,
        status: session.status as "scheduled" | "live" | "completed",
        expectedStudents: session.total || 0,
      })
      setErrors({})
    }
  }, [session, courses, templates])

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
    const newErrors: Partial<Record<keyof SessionFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Session name is required"
    if (!formData.courseId) newErrors.courseId = "Please select a course"
    if (!formData.templateId) newErrors.templateId = "Please select a template"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.startTime) newErrors.startTime = "Start time is required"
    if (!formData.endTime) newErrors.endTime = "End time is required"
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time"
    }
    if (!formData.accessCode.trim()) newErrors.accessCode = "Access code is required"

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
  }

  const regenerateCode = () => {
    setFormData({ ...formData, accessCode: generateAccessCode() })
  }

  if (!isOpen || !session) return null

  const isCompleted = session.status === "completed"

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
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200">
                  <Pencil className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Edit Session</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update session details</p>
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
            {isCompleted && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  This session has been completed. Some fields cannot be modified.
                </p>
              </div>
            )}

            {/* Session Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Session Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Mid-Semester Feedback"
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
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Description <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this feedback session..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm resize-none"
                />
                <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                  {formData.description.length}/500
                </div>
              </div>
            </div>

            {/* Course & Template */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Course
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  disabled={isCompleted}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed ${
                    errors.courseId
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                >
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
                {errors.courseId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.courseId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Layers className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  disabled={isCompleted || session.status === "live"}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm bg-white disabled:bg-slate-50 disabled:cursor-not-allowed ${
                    errors.templateId
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                >
                  <option value="">Select template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                {errors.templateId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.templateId}
                  </p>
                )}
              </div>
            </div>

            {/* Expected Students */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Users className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Expected Students <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                value={formData.expectedStudents || ""}
                onChange={(e) => setFormData({ ...formData, expectedStudents: parseInt(e.target.value) || 0 })}
                placeholder="Leave blank for anonymous sessions"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                Only fill if you have a fixed class roster. Leave blank for open anonymous feedback.
              </p>
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                disabled={isCompleted}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                  errors.date
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                }`}
              />
              {errors.date && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  disabled={isCompleted}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                    errors.startTime
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.startTime && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.startTime}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  disabled={isCompleted}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm disabled:bg-slate-50 disabled:cursor-not-allowed ${
                    errors.endTime
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.endTime}
                  </p>
                )}
              </div>
            </div>

            {/* Access Code */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Key className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Access Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.accessCode}
                  onChange={(e) => setFormData({ ...formData, accessCode: e.target.value.toUpperCase() })}
                  placeholder="e.g., XK9M-PL2Q"
                  maxLength={9}
                  disabled={isCompleted}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm font-mono uppercase disabled:bg-slate-50 disabled:cursor-not-allowed ${
                    errors.accessCode
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={regenerateCode}
                  disabled={isCompleted}
                  className="px-4 py-3 rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all text-slate-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Generate new code"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              {errors.accessCode && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.accessCode}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Status
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => !isCompleted && setFormData({ ...formData, status: "scheduled" })}
                  disabled={isCompleted}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.status === "scheduled"
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-xs">Scheduled</span>
                </button>
                <button
                  type="button"
                  onClick={() => !isCompleted && setFormData({ ...formData, status: "live" })}
                  disabled={isCompleted}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    formData.status === "live"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Play className="w-4 h-4" />
                  <span className="font-medium text-xs">Live</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: "completed" })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 ${
                    formData.status === "completed"
                      ? "border-slate-500 bg-slate-100 text-slate-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <StopCircle className="w-4 h-4" />
                  <span className="font-medium text-xs">Completed</span>
                </button>
              </div>
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
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Save Changes
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
