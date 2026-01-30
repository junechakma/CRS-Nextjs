"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/ui/stat-card"
import { Spotlight } from "@/components/ui/spotlight"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, BookOpen, BarChart3, TrendingUp, ArrowRight, UserPlus, Settings, Sparkles } from "lucide-react"

const stats = [
  {
    title: "Total Teachers",
    value: "156",
    change: "+12% from last month",
    icon: Users,
  },
  {
    title: "Active Sessions",
    value: "43",
    change: "+8% from last week",
    icon: BarChart3,
  },
  {
    title: "Question Bank",
    value: "892",
    change: "+24 new questions",
    icon: BookOpen,
  },
  {
    title: "Total Responses",
    value: "12.4K",
    change: "+18% this month",
    icon: TrendingUp,
  },
]

const recentTeachers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    institution: "MIT",
    courses: 5,
    sessions: 12,
    status: "active",
    joinedDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    email: "m.chen@example.com",
    institution: "Stanford University",
    courses: 3,
    sessions: 8,
    status: "active",
    joinedDate: "2025-01-14",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    email: "e.rodriguez@example.com",
    institution: "Harvard University",
    courses: 4,
    sessions: 15,
    status: "active",
    joinedDate: "2025-01-12",
  },
  {
    id: 4,
    name: "Prof. James Williams",
    email: "j.williams@example.com",
    institution: "UC Berkeley",
    courses: 2,
    sessions: 6,
    status: "active",
    joinedDate: "2025-01-10",
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    email: "a.patel@example.com",
    institution: "Oxford University",
    courses: 6,
    sessions: 20,
    status: "active",
    joinedDate: "2025-01-08",
  },
]

const avatarGradients = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
]

export default function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Background */}
      <div className="fixed inset-0 bg-grid-small [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />

      {/* Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="#3b82f6"
      />

      {/* Sidebar */}
      <Sidebar
        role="super-admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <Header
          userName="Admin User"
          userEmail="admin@crs.com"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  System Dashboard
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                Welcome back! Here&apos;s what&apos;s happening in your system.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white border-0"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Teacher</span>
              </Button>
            </div>
          </div>

          {/* Stats Grid with Moving Border */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                icon={stat.icon}
                index={index}
                trend="up"
              />
            ))}
          </div>

          {/* Recent Teachers Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Recent Teachers</h2>
                    <p className="text-sm text-slate-500">
                      Recently registered teachers and their activity
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Teacher</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Institution</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">Email</TableHead>
                    <TableHead className="text-center font-semibold">Courses</TableHead>
                    <TableHead className="hidden sm:table-cell font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTeachers.map((teacher, idx) => (
                    <TableRow key={teacher.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                            <AvatarFallback
                              className={`text-white font-semibold text-xs bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`}
                            >
                              {teacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">{teacher.name}</div>
                            <div className="text-xs text-slate-400 md:hidden truncate">
                              {teacher.institution}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-slate-600 text-sm">
                        {teacher.institution}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-500 text-sm">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-medium">
                          {teacher.courses}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
