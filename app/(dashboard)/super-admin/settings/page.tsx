"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Key,
  Save,
  ChevronRight,
} from "lucide-react"

const settingsSections = [
  { id: "profile", title: "Profile Settings", description: "Manage your account information", icon: User, color: "from-blue-500 to-cyan-500" },
  { id: "security", title: "Security", description: "Password and authentication", icon: Shield, color: "from-emerald-500 to-teal-500" },
  { id: "notifications", title: "Notifications", description: "Email and push notifications", icon: Bell, color: "from-violet-500 to-purple-500" },
  { id: "appearance", title: "Appearance", description: "Theme and display options", icon: Palette, color: "from-amber-500 to-orange-500" },
]

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("profile")

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 bg-grid-small [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#64748b" />

      <Sidebar role="super-admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header userName="Admin User" userEmail="admin@crs.com" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="rounded-lg bg-gradient-to-br from-slate-600 to-slate-700 p-2.5 shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h1>
            </div>
            <p className="text-slate-500 text-sm">Manage your account and preferences</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1 space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                    activeSection === section.id ? "bg-white border border-slate-200 shadow-md" : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${section.color} flex items-center justify-center shadow-sm`}>
                    <section.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{section.title}</p>
                    <p className="text-xs text-slate-500 truncate">{section.description}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${activeSection === section.id ? "rotate-90" : ""}`} />
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3">
              {activeSection === "profile" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Profile Settings</h2>
                    <p className="text-sm text-slate-500">Update your personal information</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                        <input type="text" defaultValue="Admin" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                        <input type="text" defaultValue="User" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                      <input type="email" defaultValue="admin@crs.com" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                      <input type="text" defaultValue="Super Administrator" disabled className="w-full h-10 px-4 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-500" />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "security" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Security Settings</h2>
                    <p className="text-sm text-slate-500">Manage your password and security</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                      <input type="password" placeholder="Enter current password" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                        <input type="password" placeholder="Enter new password" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Confirm Password</label>
                        <input type="password" placeholder="Confirm new password" className="w-full h-10 px-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Key className="h-5 w-5 text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-100 text-emerald-700">Enabled</Badge>
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0">
                        <Save className="h-4 w-4" />
                        Update Security
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Notification Preferences</h2>
                    <p className="text-sm text-slate-500">Choose how you want to be notified</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-4">
                    {[
                      { title: "Email Notifications", description: "Receive updates via email", enabled: true },
                      { title: "New Teacher Registration", description: "When a new teacher signs up", enabled: true },
                      { title: "Session Completion", description: "When feedback sessions end", enabled: false },
                      { title: "Weekly Reports", description: "Receive weekly summary reports", enabled: true },
                      { title: "System Alerts", description: "Important system notifications", enabled: true },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{item.title}</p>
                          <p className="text-xs text-slate-500">{item.description}</p>
                        </div>
                        <button className={`relative w-11 h-6 rounded-full transition-colors ${item.enabled ? "bg-gradient-to-r from-violet-500 to-purple-500" : "bg-slate-200"}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${item.enabled ? "left-6" : "left-1"}`} />
                        </button>
                      </div>
                    ))}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0">
                        <Save className="h-4 w-4" />
                        Save Preferences
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "appearance" && (
                <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
                  <div className="p-4 sm:p-6 border-b border-slate-100">
                    <h2 className="text-lg font-semibold text-slate-900">Appearance Settings</h2>
                    <p className="text-sm text-slate-500">Customize the look and feel</p>
                  </div>
                  <div className="p-4 sm:p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Theme</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ name: "Light", active: true }, { name: "Dark", active: false }, { name: "System", active: false }].map((theme) => (
                          <button key={theme.name} className={`p-4 rounded-xl border-2 transition-all ${theme.active ? "border-amber-500 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                            <div className={`w-full h-12 rounded-lg mb-2 ${theme.name === "Light" ? "bg-white border border-slate-200" : theme.name === "Dark" ? "bg-slate-800" : "bg-gradient-to-r from-white to-slate-800"}`} />
                            <p className="text-sm font-medium text-slate-700">{theme.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">Accent Color</label>
                      <div className="flex gap-3">
                        {["from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-violet-500 to-purple-500", "from-amber-500 to-orange-500", "from-pink-500 to-rose-500"].map((color, idx) => (
                          <button key={idx} className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} ${idx === 0 ? "ring-2 ring-offset-2 ring-blue-500" : ""}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                        <Save className="h-4 w-4" />
                        Apply Changes
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
