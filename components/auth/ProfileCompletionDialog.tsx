"use client"

import { useState } from "react"
import { User, Building2, ArrowRight, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ProfileCompletionDialogProps {
  isOpen: boolean
  onComplete: () => void
  userId?: string
  userEmail?: string
}

export default function ProfileCompletionDialog({ isOpen, onComplete, userId, userEmail }: ProfileCompletionDialogProps) {
  const [name, setName] = useState("")
  const [institution, setInstitution] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim() || !institution.trim()) {
      setError("Please fill in all fields")
      return
    }

    // Get user ID from props or from current session
    let currentUserId = userId
    let currentUserEmail = userEmail

    if (!currentUserId) {
      const { data: { user: sessionUser } } = await supabase.auth.getUser()
      if (!sessionUser) {
        setError("User not found. Please try logging in again.")
        return
      }
      currentUserId = sessionUser.id
      currentUserEmail = sessionUser.email
    }

    setIsLoading(true)

    try {
      // Update the user profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: name.trim(),
          institution: institution.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUserId)

      if (updateError) {
        throw updateError
      }

      // Get the user's role to determine redirect
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', currentUserId)
        .single()

      onComplete()

      // Redirect based on role
      const redirectTo = profile?.role === 'super_admin' ? '/super-admin' : '/teacher'
      window.location.href = redirectTo
    } catch (err) {
      console.error('Error updating profile:', err)
      setError("Failed to update profile. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#468cfe] to-[#5a6bff] px-6 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome to CRS!</h2>
            <p className="text-white/80 text-sm">
              Let&apos;s complete your profile to get started
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Full Name Input */}
            <div className="relative group">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                required
                className="peer w-full px-4 py-3.5 pl-12 rounded-xl border-2 border-slate-200 bg-white outline-none focus:border-[#468cfe] text-slate-900 text-sm font-medium transition-all duration-300 placeholder-transparent"
              />
              <label
                htmlFor="name"
                className="absolute left-12 top-3.5 text-slate-400 text-sm font-medium transition-all duration-300 pointer-events-none
                  peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#468cfe] peer-focus:bg-white peer-focus:px-2 peer-focus:rounded
                  peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded"
              >
                Full Name
              </label>
            </div>

            {/* Institution Input */}
            <div className="relative group">
              <Building2 className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
              <input
                type="text"
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder=" "
                required
                className="peer w-full px-4 py-3.5 pl-12 rounded-xl border-2 border-slate-200 bg-white outline-none focus:border-[#468cfe] text-slate-900 text-sm font-medium transition-all duration-300 placeholder-transparent"
              />
              <label
                htmlFor="institution"
                className="absolute left-12 top-3.5 text-slate-400 text-sm font-medium transition-all duration-300 pointer-events-none
                  peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#468cfe] peer-focus:bg-white peer-focus:px-2 peer-focus:rounded
                  peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded"
              >
                Institution / Organization
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#468cfe] to-[#5a6bff] hover:from-[#3a7be0] hover:to-[#4a5bef] text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500">
              You can update this information later in your profile settings
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
