"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { useAuth } from "@/lib/context/AuthContext"

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Meteors */}
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="meteor meteor-4" />
        <div className="meteor meteor-5" />

        {/* Floating Gradient Blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      {/* Sidebar - stays mounted during navigation */}
      <Sidebar
        role="teacher"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        {/* Header - stays mounted during navigation */}
        <Header
          userName={profile?.name || "Teacher"}
          userEmail={profile?.email || "teacher@university.edu"}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content - this is what changes during navigation */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => window.location.href = "/teacher/sessions"}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center z-50 hover:scale-110 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14"/>
          <path d="M12 5v14"/>
        </svg>
      </button>
    </div>
  )
}
