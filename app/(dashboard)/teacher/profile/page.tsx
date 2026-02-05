"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/lib/context/AuthContext"
import {
  User,
  Mail,
  Building2,
  GraduationCap,
  Calendar,
  Edit3,
  Camera,
  Key,
  Save,
  X,
  CheckCircle2,
  BookOpen,
  Users,
  MessageSquare,
  Award,
  Star,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react"

const stats = [
  { label: "Courses", value: "8", icon: BookOpen },
  { label: "Students", value: "459", icon: Users },
  { label: "Sessions", value: "47", icon: MessageSquare },
  { label: "Avg Rating", value: "4.7", icon: Star },
]

const achievements = [
  {
    title: "Feedback Champion",
    description: "Collected over 1,000 student responses",
    icon: Award,
    color: "amber",
    earned: true,
  },
  {
    title: "Consistent Educator",
    description: "Maintained 4.5+ rating for 3 months",
    icon: Star,
    color: "emerald",
    earned: true,
  },
  {
    title: "Early Adopter",
    description: "Among the first 100 teachers on ClassResponse",
    icon: Star,
    color: "violet",
    earned: true,
  },
  {
    title: "Community Builder",
    description: "Shared 10+ questions to common bank",
    icon: Users,
    color: "blue",
    earned: false,
  },
]

export default function ProfilePage() {
  const supabase = createClient()
  const { profile, refreshProfile } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [formName, setFormName] = useState("")
  const [formInstitution, setFormInstitution] = useState("")
  const [formDepartment, setFormDepartment] = useState("")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Email change state
  const [newEmail, setNewEmail] = useState("")
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Modals
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Sync form with profile
  useEffect(() => {
    if (profile) {
      setFormName(profile.name || "")
      setFormInstitution(profile.institution || "")
      setFormDepartment(profile.department || "")
    }
  }, [profile])

  const handleSave = async () => {
    if (!profile?.id) return

    setProfileLoading(true)
    setProfileMessage(null)

    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: formName,
          institution: formInstitution,
          department: formDepartment,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfileMessage({ type: "success", text: "Profile updated successfully." })
      setIsEditing(false)
      refreshProfile()
    } catch {
      setProfileMessage({ type: "error", text: "Failed to update profile." })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail })
      if (error) throw error

      setEmailMessage({
        type: "success",
        text: "Confirmation email sent to your new address. Please check your inbox.",
      })
      setNewEmail("")
    } catch {
      setEmailMessage({
        type: "error",
        text: "Failed to update email. Please try again.",
      })
    } finally {
      setEmailLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "Password must be at least 8 characters long.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "New passwords do not match.",
      })
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowPasswordModal(false)
        setPasswordMessage(null)
      }, 2000)
    } catch {
      setPasswordMessage({
        type: "error",
        text: "Failed to update password.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  // Format the join date
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/60 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-full filter blur-3xl -mr-20 -mt-20" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {profile?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'T'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
                <Camera className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {profile?.name || 'Teacher'}
                </h1>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
              <p className="text-slate-600 mb-1">Teacher</p>
              <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                {profile?.institution && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {profile.institution}
                  </span>
                )}
                {profile?.department && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    {profile.department}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {joinedDate}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Button
              variant="outline"
              className="gap-2 bg-white/80 backdrop-blur"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50"
              >
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm text-slate-600">{stat.label}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Profile Information
              </h3>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    disabled={profileLoading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="gap-1" onClick={handleSave} disabled={profileLoading}>
                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save
                  </Button>
                </div>
              )}
            </div>

            {profileMessage && (
              <div className={`mb-4 flex items-center gap-2 p-3 rounded-xl text-sm ${
                profileMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {profileMessage.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {profileMessage.text}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900">
                      {profile?.name || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {profile?.email || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Institution
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formInstitution}
                      onChange={(e) => setFormInstitution(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      {profile?.institution || 'Not set'}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                    />
                  ) : (
                    <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-slate-400" />
                      {profile?.department || 'Not set'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Achievements & Security */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-600" />
              Achievements
            </h3>

            <div className="space-y-3">
              {achievements.map((achievement, index) => {
                const colorMap: Record<string, { bg: string; text: string; border: string }> = {
                  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
                  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
                  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
                  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
                }
                const colors = colorMap[achievement.color]

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      achievement.earned
                        ? `${colors.bg} ${colors.border}`
                        : "bg-slate-50 border-slate-200 opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg ${
                          achievement.earned ? colors.bg : "bg-slate-100"
                        }`}
                      >
                        <achievement.icon
                          className={`w-5 h-5 ${
                            achievement.earned ? colors.text : "text-slate-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm ${
                            achievement.earned ? "text-slate-900" : "text-slate-500"
                          }`}
                        >
                          {achievement.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {achievement.description}
                        </p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-600" />
              Security
            </h3>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowEmailModal(true)}
              >
                <Mail className="w-4 h-4" />
                Change Email
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="w-4 h-4" />
                Change Password
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowEmailModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Change Email
                </h3>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                A confirmation link will be sent to your new email address.
              </p>

              <form onSubmit={handleEmailChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Email
                  </label>
                  <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500">
                    {profile?.email || 'Not set'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Enter new email address"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  />
                </div>

                {emailMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      emailMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {emailMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    {emailMessage.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={emailLoading || !newEmail}
                  className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {emailLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {emailLoading ? "Sending..." : "Update Email"}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Change Password
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-slate-500 mb-6">
                Choose a new secure password for your account.
              </p>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500">
                  Password must be at least 8 characters long.
                </p>

                {passwordMessage && (
                  <div
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                      passwordMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {passwordMessage.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    {passwordMessage.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                >
                  {passwordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Key className="w-4 h-4" />
                  )}
                  {passwordLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
