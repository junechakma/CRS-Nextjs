"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Mail,
  Shield,
  Calendar,
  Edit3,
  Camera,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

const profileData = {
  name: "Admin User",
  email: "admin@crs.com",
  role: "Super Administrator",
  joinedDate: "January 2024",
  avatar: null,
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(profileData)

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

  const handleSave = () => {
    setIsEditing(false)
    // Save profile logic here
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailLoading(true)
    setEmailMessage(null)

    try {
      // Supabase email update
      // const { error } = await supabase.auth.updateUser({ email: newEmail })
      // if (error) throw error

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

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

    // Validation
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
      // Supabase password update
      // const { error } = await supabase.auth.updateUser({ password: newPassword })
      // if (error) throw error

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setPasswordMessage({
        type: "error",
        text: "Failed to update password. Please check your current password.",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      <Sidebar
        role="super-admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        <Header
          userName="Admin User"
          userEmail="admin@crs.com"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="hero-gradient rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/60 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-slate-200/50 to-blue-200/50 rounded-full filter blur-3xl -mr-20 -mt-20" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      AU
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-xl shadow-lg border border-slate-200 hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        {profileData.name}
                      </h1>
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-1">{profileData.role}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" />
                        {profileData.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        Joined {profileData.joinedDate}
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
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Details */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-5 h-5 text-slate-600" />
                    Profile Information
                  </h3>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                      <Button size="sm" className="gap-1" onClick={handleSave}>
                        <Save className="w-4 h-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-100 outline-none transition-all"
                      />
                    ) : (
                      <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900">
                        {profileData.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Role
                    </label>
                    <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-slate-400" />
                      {profileData.role}
                      <span className="text-xs text-slate-400">(Cannot be changed)</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Change Email */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Change Email
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  A confirmation link will be sent to your new email address.
                </p>

                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Current Email
                    </label>
                    <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-500">
                      {profileData.email}
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

              {/* Change Password */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5 text-emerald-600" />
                  Change Password
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Enter your current password and choose a new secure password.
                </p>

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                  </div>

                  <p className="text-xs text-slate-500">
                    Password must be at least 8 characters long. Use a mix of letters, numbers, and symbols for better security.
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

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
                      className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {passwordLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Key className="w-4 h-4" />
                      )}
                      {passwordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
