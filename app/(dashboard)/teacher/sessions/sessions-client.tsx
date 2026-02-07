"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateSessionModal } from "@/components/teacher/create-session-modal"
import { EditSessionModal } from "@/components/teacher/edit-session-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { SessionData, SessionStats } from "@/lib/supabase/queries/teacher"
import {
  getSessionsPaginatedAction,
  createSessionAction,
  updateSessionAction,
  deleteSessionAction,
  CreateSessionInput,
  UpdateSessionInput,
} from "@/lib/actions/sessions"
import { toast } from "sonner"
import {
  Calendar,
  Plus,
  Users,
  Clock,
  Key,
  QrCode,
  Search,
  MoreVertical,
  Play,
  Copy,
  CheckCircle2,
  StopCircle,
  TrendingUp,
  MessageSquare,
  Timer,
  Pencil,
  Trash2,
  Power,
  X,
  Download,
  Loader2,
} from "lucide-react"

interface SessionsClientProps {
  sessions: SessionData[]
  stats: SessionStats
  courses: Array<{ id: string; name: string; code: string }>
  templates: Array<{ id: string; name: string }>
}

export default function SessionsClient({ sessions: initialSessions, stats, courses, templates }: SessionsClientProps) {
  const router = useRouter()
  const [filter, setFilter] = useState("all")
  const [sessions, setSessions] = useState<SessionData[]>(initialSessions || [])
  const [searchQuery, setSearchQuery] = useState("")
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<SessionData | null>(null)
  const [qrSession, setQrSession] = useState<SessionData | null>(null)
  const [deleteSession, setDeleteSession] = useState<SessionData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isMounted = useRef(false)

  // Pagination state
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(initialSessions?.length || 0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      setPage(1)
      fetchSessions(1, searchQuery, filter, true)
    }, 500)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Fetch sessions from server
  const fetchSessions = async (
    pageNum: number,
    search: string,
    status: string,
    reset: boolean = false
  ) => {
    setIsLoadingMore(true)
    try {
      const result = await getSessionsPaginatedAction({
        page: pageNum,
        pageSize: 12,
        search,
        status,
      })

      if (result.success && result.data) {
        const paginatedData = result.data
        if (reset) {
          setSessions(paginatedData.data)
        } else {
          setSessions((prev) => [...prev, ...paginatedData.data])
        }
        const hasMoreItems = pageNum < paginatedData.totalPages
        setHasMore(hasMoreItems)
        setTotalCount(paginatedData.count)
        setPage(pageNum)
      } else {
        toast.error(result.error || "Failed to fetch sessions")
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to fetch sessions")
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Filter change handler
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    setPage(1)
    fetchSessions(1, searchQuery, filter, true)
  }, [filter])

  const handleCreateSession = async (data: any) => {
    // Prepare session input based on session type
    const sessionInput: CreateSessionInput = {
      courseId: data.courseId,
      name: data.name,
      accessCode: data.accessCode,
      templateId: data.templateId,
      description: data.description,
      expectedStudents: data.expectedStudents,
    }

    // For "Start Now" sessions - auto-calculate times from duration
    if (data.sessionType === "now") {
      sessionInput.durationMinutes = data.duration
      sessionInput.status = "live" // Start immediately as live
      // startTime and endTime will be auto-calculated in the action
    }
    // For "Scheduled" sessions - use provided date/time
    else {
      sessionInput.scheduledDate = data.date
      // Combine date and time into ISO timestamps
      if (data.date && data.startTime) {
        const startDateTime = new Date(`${data.date}T${data.startTime}`)
        sessionInput.startTime = startDateTime.toISOString()
      }
      if (data.date && data.endTime) {
        const endDateTime = new Date(`${data.date}T${data.endTime}`)
        sessionInput.endTime = endDateTime.toISOString()
      }
      sessionInput.status = "scheduled"
    }

    const result = await createSessionAction(sessionInput)

    if (result.success) {
      toast.success("Session created successfully")
      setIsCreateModalOpen(false)
      setPage(1)
      await fetchSessions(1, searchQuery, filter, true)
    } else {
      toast.error(result.error || "Failed to create session")
    }
  }

  const handleEditSession = async (data: any) => {
    if (!editingSession) return

    // Optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === editingSession.id
          ? { ...s, name: data.name, description: data.description }
          : s
      )
    )

    // Construct proper ISO timestamps from date and time inputs
    let startTimeISO: string | undefined = undefined
    let endTimeISO: string | undefined = undefined

    if (data.date && data.startTime) {
      startTimeISO = new Date(`${data.date}T${data.startTime}`).toISOString()
    }

    if (data.date && data.endTime) {
      endTimeISO = new Date(`${data.date}T${data.endTime}`).toISOString()
    }

    const updateInput: UpdateSessionInput = {
      id: editingSession.id,
      name: data.name,
      description: data.description,
      scheduledDate: data.date || null,
      startTime: startTimeISO,
      endTime: endTimeISO,
      durationMinutes: data.durationMinutes,
      expectedStudents: data.expectedStudents,
      status: data.status,
    }

    const result = await updateSessionAction(updateInput)

    if (result.success) {
      toast.success("Session updated successfully")
      setEditingSession(null)
      await fetchSessions(page, searchQuery, filter, true)
    } else {
      toast.error(result.error || "Failed to update session")
      // Revert optimistic update
      await fetchSessions(page, searchQuery, filter, true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteSession) return

    setIsDeleting(true)

    // Optimistic update
    setSessions((prev) => prev.filter((s) => s.id !== deleteSession.id))

    const result = await deleteSessionAction(deleteSession.id)

    if (result.success) {
      toast.success("Session deleted successfully")
      setDeleteSession(null)
      setIsDeleting(false)
      // Refresh to adjust pagination
      await fetchSessions(page, searchQuery, filter, true)
    } else {
      toast.error(result.error || "Failed to delete session")
      setIsDeleting(false)
      // Revert optimistic update
      await fetchSessions(page, searchQuery, filter, true)
    }
  }

  const handleEdit = (session: SessionData) => {
    setEditingSession(session)
    setOpenDropdown(null)
  }

  const handleToggleStatus = async (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return

    let newStatus: "scheduled" | "live" | "completed"

    if (session.status === "scheduled") {
      newStatus = "live"
    } else if (session.status === "live") {
      newStatus = "completed"
    } else {
      return
    }

    // Optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: newStatus } : s
      )
    )
    setOpenDropdown(null)

    const result = await updateSessionAction({
      id: sessionId,
      status: newStatus,
    })

    if (result.success) {
      toast.success(`Session ${newStatus === "live" ? "started" : "ended"} successfully`)
      await fetchSessions(page, searchQuery, filter, true)
    } else {
      toast.error(result.error || "Failed to update session status")
      // Revert optimistic update
      await fetchSessions(page, searchQuery, filter, true)
    }
  }

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchSessions(page + 1, searchQuery, filter, false)
    }
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

  const statsDisplay = [
    {
      title: "Active Sessions",
      value: stats.activeSessions.toString(),
      icon: Play,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      change: "Live now",
      isLive: true,
    },
    {
      title: "Scheduled",
      value: stats.scheduledSessions.toString(),
      icon: Calendar,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      change: "This week",
    },
    {
      title: "Total Responses",
      value: stats.totalResponses.toString(),
      icon: MessageSquare,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      change: "All time",
    },
    {
      title: "Avg. Response Rate",
      value: `${stats.avgResponseRate}%`,
      icon: TrendingUp,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      change: "Overall",
    },
  ]

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsDisplay.map((stat, index) => (
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

        <div className="space-y-4">
          {sessions.length === 0 && !isLoadingMore && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No sessions found</p>
            </div>
          )}

          {sessions.map((session) => (
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
                        {session.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            {session.description}
                          </p>
                        )}
                      </div>
                    </div>

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

                  <div className="flex items-center gap-3 lg:border-l lg:border-slate-200 lg:pl-6">
                    {getStatusBadge(session.status)}

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
                              setDeleteSession(session)
                              setOpenDropdown(null)
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

              <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between">
                <span className="text-sm text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-400" />
                  {session.total > 0 ? (
                    <>
                      <span className="font-semibold text-slate-700">{session.responses}</span> / {session.total} responded
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-slate-700">{session.responses}</span> {session.responses === 1 ? "response" : "responses"}
                    </>
                  )}
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

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="outline"
                className="gap-2 min-w-[200px]"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>Load More Sessions</>
                )}
              </Button>
            </div>
          )}

          {sessions.length > 0 && !hasMore && (
            <div className="text-center py-4 text-sm text-slate-500">
              Showing all {totalCount} session{totalCount !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courses={courses}
        templates={templates}
        onSubmit={handleCreateSession}
      />

      <EditSessionModal
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        session={editingSession}
        courses={courses}
        templates={templates}
        onSubmit={handleEditSession}
      />

      <ConfirmDialog
        isOpen={!!deleteSession}
        onClose={() => setDeleteSession(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Session"
        message={`Are you sure you want to delete "${deleteSession?.name}"? This action cannot be undone and will permanently remove all session data, responses, and analytics.`}
        confirmText="Delete Session"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />

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

              <div className="p-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm mb-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://classresponse.com/feedback/${qrSession.accessCode}`)}&bgcolor=ffffff&color=1e293b&margin=0`}
                    alt={`QR Code for ${qrSession.accessCode}`}
                    className="w-48 h-48"
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 w-full mb-4">
                  <p className="text-xs text-slate-500 text-center mb-1">Access Code</p>
                  <p className="text-2xl font-mono font-bold text-center text-slate-900 tracking-wider">
                    {qrSession.accessCode}
                  </p>
                </div>

                <div className="text-center text-sm text-slate-600 mb-4">
                  <p className="font-medium text-slate-900">{qrSession.course}</p>
                  <p>{qrSession.date} • {qrSession.startTime} - {qrSession.endTime}</p>
                </div>

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
                      link.href = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(`https://classresponse.com/feedback/${qrSession.accessCode}`)}&bgcolor=ffffff&color=1e293b&margin=10`
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
    </>
  )
}
