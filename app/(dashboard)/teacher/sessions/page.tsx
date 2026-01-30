"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateSessionModal } from "@/components/teacher/create-session-modal"
import { EditSessionModal } from "@/components/teacher/edit-session-modal"
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
  Pencil,
  Trash2,
  Power,
  X,
  Download,
} from "lucide-react"

interface Session {
  id: number
  name: string
  course: string
  courseCode: string
  accessCode: string
  status: string
  responses: number
  total: number
  startTime: string
  endTime: string
  date: string
  duration: string
  courseId?: string
  templateId?: string
}

const initialSessions: Session[] = [
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
    courseId: "1",
    templateId: "1",
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
    courseId: "2",
    templateId: "2",
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
    courseId: "3",
    templateId: "3",
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
    courseId: "4",
    templateId: "1",
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
    courseId: "1",
    templateId: "1",
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
    courseId: "2",
    templateId: "2",
  },
]

const courses = [
  { id: "1", name: "Introduction to Machine Learning", code: "CS401" },
  { id: "2", name: "Database Systems", code: "CS305" },
  { id: "3", name: "Data Structures & Algorithms", code: "CS201" },
  { id: "4", name: "Software Engineering", code: "CS350" },
]

const templates = [
  { id: "1", name: "Base Template" },
  { id: "2", name: "Mid-Semester Review" },
  { id: "3", name: "Quick Session Feedback" },
  { id: "4", name: "Lab Session Evaluation" },
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
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("all")
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [qrSession, setQrSession] = useState<Session | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredSessions = sessions.filter((session) => {
    const matchesFilter = filter === "all" || session.status === filter
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleDelete = (sessionId: number) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    setOpenDropdown(null)
  }

  const handleEdit = (session: Session) => {
    setEditingSession(session)
    setOpenDropdown(null)
  }

  const handleToggleStatus = (sessionId: number) => {
    setSessions(prev =>
      prev.map(s => {
        if (s.id === sessionId) {
          if (s.status === "scheduled") return { ...s, status: "live", duration: "Just started" }
          if (s.status === "live") return { ...s, status: "completed", duration: "Completed" }
          return s
        }
        return s
      })
    )
    setOpenDropdown(null)
  }

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

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
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
              >
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        <button
                          onClick={() => copyAccessCode(session.accessCode)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Copy access code"
                        >
                          <Copy className="w-4 h-4 text-slate-500" />
                        </button>
                        <button
                          onClick={() => setQrSession(session)}
                          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          title="Show QR code"
                        >
                          <QrCode className="w-4 h-4 text-slate-500" />
                        </button>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
                        {getStatusBadge(session.status)}

                        {/* Dropdown */}
                        <div className="relative" ref={openDropdown === session.id ? dropdownRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenDropdown(openDropdown === session.id ? null : session.id)
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-400" />
                          </button>

                          {openDropdown === session.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEdit(session)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Pencil className="w-4 h-4 text-slate-400" />
                                Edit Session
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyAccessCode(session.accessCode)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Copy className="w-4 h-4 text-slate-400" />
                                Copy Access Code
                              </button>
                              {session.status !== "completed" && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleToggleStatus(session.id)
                                  }}
                                  className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                >
                                  <Power className="w-4 h-4 text-slate-400" />
                                  {session.status === "scheduled" ? "Start Session" : "End Session"}
                                </button>
                              )}
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(session.id)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Session
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-700">{session.responses}</span> students responded
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => router.push(`/teacher/sessions/${session.id}/analytics`)}
                      >
                        <TrendingUp className="w-4 h-4" />
                        View Analytics
                      </Button>
                      {session.status === "live" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(session.id)}
                          className="gap-1.5 text-red-600 hover:text-red-700 hover:border-red-300"
                        >
                          <StopCircle className="w-4 h-4" />
                          End Session
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Create Session Modal */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courses={courses}
        templates={templates}
        onSubmit={(data) => {
          const selectedCourse = courses.find(c => c.id === data.courseId)
          const now = new Date()

          let sessionDate: string
          let startTime: string
          let endTime: string
          let status: string
          let duration: string

          if (data.sessionType === "now") {
            // Start immediately with duration
            sessionDate = "Today"
            startTime = formatTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`)
            const endDate = new Date(now.getTime() + data.duration * 60000)
            endTime = formatTime(`${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`)
            status = "live"
            duration = "Just started"
          } else {
            // Scheduled session
            sessionDate = formatDate(data.date)
            startTime = formatTime(data.startTime)
            endTime = formatTime(data.endTime)
            status = "scheduled"
            duration = "Scheduled"
          }

          const newSession: Session = {
            id: Date.now(),
            name: data.name,
            course: selectedCourse?.name || "",
            courseCode: selectedCourse?.code || "",
            accessCode: data.accessCode,
            status: status,
            responses: 0,
            total: 45,
            startTime: startTime,
            endTime: endTime,
            date: sessionDate,
            duration: duration,
            courseId: data.courseId,
            templateId: data.templateId,
          }
          setSessions(prev => [newSession, ...prev])
          setIsCreateModalOpen(false)
        }}
      />

      {/* Edit Session Modal */}
      <EditSessionModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        courses={courses}
        templates={templates}
        onSubmit={(data) => {
          const selectedCourse = courses.find(c => c.id === data.courseId)
          setSessions(prev =>
            prev.map(s =>
              s.id === data.id
                ? {
                    ...s,
                    name: data.name,
                    course: selectedCourse?.name || s.course,
                    courseCode: selectedCourse?.code || s.courseCode,
                    accessCode: data.accessCode,
                    status: data.status,
                    startTime: formatTime(data.startTime),
                    endTime: formatTime(data.endTime),
                    date: formatDate(data.date),
                    courseId: data.courseId,
                    templateId: data.templateId,
                  }
                : s
            )
          )
          setEditingSession(null)
        }}
      />

      {/* QR Code Modal */}
      {qrSession && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setQrSession(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Session QR Code</h2>
                      <p className="text-sm text-slate-500">{qrSession.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setQrSession(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrSession.accessCode)}&bgcolor=ffffff&color=1e293b&margin=0`}
                    alt={`QR Code for ${qrSession.accessCode}`}
                    className="w-48 h-48"
                  />
                </div>

                {/* Access Code Display */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 w-full mb-4">
                  <p className="text-xs text-slate-500 text-center mb-1">Access Code</p>
                  <p className="text-2xl font-mono font-bold text-center text-slate-900 tracking-wider">
                    {qrSession.accessCode}
                  </p>
                </div>

                {/* Session Info */}
                <div className="text-center text-sm text-slate-600 mb-4">
                  <p className="font-medium text-slate-900">{qrSession.course}</p>
                  <p>{qrSession.date} • {qrSession.startTime} - {qrSession.endTime}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full">
                  <Button
                    variant="outline"
                    onClick={() => copyAccessCode(qrSession.accessCode)}
                    className="flex-1 gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </Button>
                  <Button
                    onClick={() => {
                      const link = document.createElement("a")
                      link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrSession.accessCode)}&bgcolor=ffffff&color=1e293b&margin=10`
                      link.download = `qr-${qrSession.accessCode}.png`
                      link.click()
                    }}
                    className="flex-1 gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper functions
function formatTime(time24: string): string {
  if (!time24) return ""
  const [hours, minutes] = time24.split(":")
  const h = parseInt(hours)
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
