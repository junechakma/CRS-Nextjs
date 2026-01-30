"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  TrendingUp,
  Award,
  Star,
} from "lucide-react"

const profileData = {
  name: "Dr. Sarah Johnson",
  email: "sarah.j@university.edu",
  institution: "Stanford University",
  department: "Computer Science",
  title: "Associate Professor",
  joinedDate: "September 2023",
  avatar: null,
}

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
    icon: TrendingUp,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(profileData)

  const handleSave = () => {
    setIsEditing(false)
    // Save logic here
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
            {/* Profile Header Card */}
            <div className="hero-gradient rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/60 shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-full filter blur-3xl -mr-20 -mt-20" />

              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                      SJ
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
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                    <p className="text-slate-600 mb-1">{profileData.title}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-4 h-4" />
                        {profileData.institution}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4" />
                        {profileData.department}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                          />
                        ) : (
                          <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900">
                            {profileData.name}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Email Address
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                          />
                        ) : (
                          <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {profileData.email}
                          </p>
                        )}
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
                            value={formData.institution}
                            onChange={(e) =>
                              setFormData({ ...formData, institution: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                          />
                        ) : (
                          <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            {profileData.institution}
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
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({ ...formData, department: e.target.value })
                            }
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                          />
                        ) : (
                          <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900 flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            {profileData.department}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Title / Position
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                        />
                      ) : (
                        <p className="px-4 py-2.5 rounded-xl bg-slate-50 text-slate-900">
                          {profileData.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column - Achievements */}
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
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Key className="w-4 h-4" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      <X className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
