"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Plus,
  Users,
  Clock,
  Key,
  QrCode,
  Search,
  Filter,
  MoreVertical,
  Play,
  Pause,
  StopCircle,
  Copy,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Timer,
} from "lucide-react"

const sessions = [
  {
    id: 1,
    name: "Mid-Semester Feedback",
    course: "Introduction to Machine Learning",
    courseCode: "CS401",
    accessCode: "XK9M-PL2Q",
    status: "live",
    responses: 67,
    total: 89,
    startTime: "10:00 AM",
    endTime: "11:30 AM",
    date: "Today",
    duration: "45 min active",
  },
  {
    id: 2,
    name: "Weekly Check-in",
    course: "Database Systems",
    courseCode: "CS305",
    accessCode: "DBN8-KL3M",
    status: "live",
    responses: 28,
    total: 65,
    startTime: "9:00 AM",
    endTime: "12:00 PM",
    date: "Today",
    duration: "20 min active",
  },
  {
    id: 3,
    name: "Lab Session Feedback",
    course: "Data Structures & Algorithms",
    courseCode: "CS201",
    accessCode: "DS20-LABF",
    status: "scheduled",
    responses: 0,
    total: 120,
    startTime: "2:00 PM",
    endTime: "3:30 PM",
    date: "Today",
    duration: "Starts in 2h",
  },
  {
    id: 4,
    name: "Course Evaluation",
    course: "Software Engineering",
    courseCode: "CS350",
    accessCode: "SE35-EVAL",
    status: "scheduled",
    responses: 0,
    total: 45,
    startTime: "10:00 AM",
    endTime: "5:00 PM",
    date: "Tomorrow",
    duration: "7 hours",
  },
  {
    id: 5,
    name: "Final Feedback",
    course: "Introduction to Machine Learning",
    courseCode: "CS401",
    accessCode: "ML40-FINL",
    status: "completed",
    responses: 82,
    total: 89,
    startTime: "9:00 AM",
    endTime: "11:00 AM",
    date: "Yesterday",
    duration: "Completed",
  },
  {
    id: 6,
    name: "Project Review",
    course: "Database Systems",
    courseCode: "CS305",
    accessCode: "DB30-PROJ",
    status: "completed",
    responses: 61,
    total: 65,
    startTime: "2:00 PM",
    endTime: "4:00 PM",
    date: "Jan 28, 2025",
    duration: "Completed",
  },
]

const stats = [
  {
    title: "Active Sessions",
    value: "2",
    icon: Play,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    change: "Live now",
    isLive: true,
  },
  {
    title: "Scheduled",
    value: "2",
    icon: Calendar,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    change: "This week",
  },
  {
    title: "Total Responses",
    value: "238",
    icon: MessageSquare,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    change: "+48 today",
  },
  {
    title: "Avg. Response Rate",
    value: "92%",
    icon: TrendingUp,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    change: "+5%",
  },
]

export default function SessionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("all")

  const filteredSessions = sessions.filter((session) => {
    if (filter === "all") return true
    return session.status === filter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1.5">
            <Clock className="w-3 h-3" />
            Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        )
      default:
        return null
    }
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
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Feedback Sessions
                  </h1>
                </div>
                <p className="text-slate-500">
                  Create and manage feedback collection sessions
                </p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0">
                <Plus className="w-5 h-5" />
                New Session
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="gradient-border-card card-hover-lift group">
                  <div className="card-inner p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          stat.isLive
                            ? "text-emerald-600 bg-emerald-50"
                            : "text-slate-600 bg-slate-100"
                        }`}
                      >
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-0.5">
                      {stat.value}
                    </h3>
                    <p className="text-sm text-slate-500">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                  {[
                    { id: "all", label: "All Sessions" },
                    { id: "live", label: "Live", dot: true },
                    { id: "scheduled", label: "Scheduled" },
                    { id: "completed", label: "Completed" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                        filter === tab.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                      {tab.dot && (
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`bg-white rounded-2xl border transition-all duration-300 hover:shadow-lg group cursor-pointer ${
                    session.status === "live"
                      ? "border-emerald-200 hover:border-emerald-300"
                      : "border-slate-200/60 hover:border-indigo-300"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Session Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-2">
                          {session.status === "live" && (
                            <div className="live-indicator w-3 h-3 rounded-full animate-pulse mt-1.5 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {session.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-sm text-slate-600">
                                {session.course}
                              </span>
                              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {session.courseCode}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Time Info */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 mt-3 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {session.startTime} - {session.endTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Timer className="w-4 h-4" />
                            {session.duration}
                          </span>
                        </div>
                      </div>

                      {/* Access Code */}
                      <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <Key className="w-4 h-4 text-slate-400" />
                            <span className="font-mono text-sm font-semibold text-slate-900">
                              {session.accessCode}
                            </span>
                          </div>
                        </div>
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <Copy className="w-4 h-4 text-slate-500" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <QrCode className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      {/* Progress */}
                      <div className="lg:border-l lg:border-slate-200 lg:pl-6 min-w-[140px]">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="text-slate-600">Responses</span>
                          <span className="font-semibold text-slate-900">
                            {session.responses}/{session.total}
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              session.status === "live"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                                : session.status === "completed"
                                ? "bg-gradient-to-r from-indigo-500 to-violet-500"
                                : "bg-slate-300"
                            }`}
                            style={{
                              width: `${(session.responses / session.total) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {Math.round((session.responses / session.total) * 100)}%
                          response rate
                        </p>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
                        {getStatusBadge(session.status)}
                        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions on Hover */}
                  {session.status === "live" && (
                    <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm text-slate-600">
                        {session.total - session.responses} students haven't
                        responded yet
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <ExternalLink className="w-4 h-4" />
                          View Live
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <StopCircle className="w-4 h-4" />
                          End Session
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
