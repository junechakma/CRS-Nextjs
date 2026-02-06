"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  X,
  CalendarDays,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from "lucide-react"

interface EditSemesterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (data: SemesterFormData) => void
  semester: {
    id: string
    name: string
    start_date: string
    end_date: string
    status: string
  } | null
}

interface SemesterFormData {
  name: string
  startDate: string
  endDate: string
  description: string
  status: "upcoming" | "current" | "completed"
}

// Helper to convert display date to input format
const parseDisplayDate = (displayDate: string): string => {
  try {
    const date = new Date(displayDate)
    return date.toISOString().split('T')[0]
  } catch {
    return ""
  }
}

export function EditSemesterModal({ isOpen, onClose, onSubmit, semester }: EditSemesterModalProps) {
  const [formData, setFormData] = useState<SemesterFormData>({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof SemesterFormData, string>>>({})

  // Populate form when semester changes
  useEffect(() => {
    if (semester) {
      setFormData({
        name: semester.name,
        startDate: parseDisplayDate(semester.start_date),
        endDate: parseDisplayDate(semester.end_date),
        description: (semester as any).description || "",
        status: semester.status as "upcoming" | "current" | "completed",
      })
      setErrors({})
    }
  }, [semester])

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
    const newErrors: Partial<Record<keyof SemesterFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = "Semester name is required"
    if (!formData.startDate) newErrors.startDate = "Start date is required"
    if (!formData.endDate) newErrors.endDate = "End date is required"
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    onSubmit?.(formData)
    setIsSubmitting(false)
    onClose()
  }

  if (!isOpen || !semester) return null

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
                  <h2 className="text-xl font-semibold text-slate-900">Edit Semester</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update semester details</p>
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
            {/* Semester Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Semester Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Spring 2025"
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

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                    errors.startDate
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1.5 text-slate-400" />
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all outline-none text-sm ${
                    errors.endDate
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.endDate}
                  </p>
                )}
              </div>
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
                  onClick={() => setFormData({ ...formData, status: "upcoming" })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    formData.status === "upcoming"
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium text-xs">Upcoming</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: "current" })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    formData.status === "current"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-xs">Current</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: "completed" })}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    formData.status === "completed"
                      ? "border-slate-500 bg-slate-100 text-slate-700"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium text-xs">Completed</span>
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1.5 text-slate-400" />
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Add any notes or description for this semester..."
                  rows={3}
                  maxLength={250}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-sm resize-none"
                />
                <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                  {formData.description.length}/250
                </div>
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
