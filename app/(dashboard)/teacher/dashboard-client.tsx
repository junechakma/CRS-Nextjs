"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  MessageSquare,
  TrendingUp,
  Plus,
  Users,
  Clock,
  Activity,
  ArrowRight,
  BarChart3,
  Sparkles,
  Key,
  FileText,
  ChevronRight,
  Brain,
  MessageCircle,
  Copy,
  StopCircle,
} from "lucide-react"
import { TeacherDashboardData } from "@/lib/supabase/queries"

interface DashboardClientProps {
  data: TeacherDashboardData
}

export default function TeacherDashboardClient({ data }: DashboardClientProps) {
  const router = useRouter()
  const { user, stats, liveSessions, recentFeedback, courses } = data

  const copyAccessCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const statsDisplay = [
    {
      title: "Active Courses",
      value: stats.activeCourses.toString(),
      change: "This semester",
      icon: GraduationCap,
      iconBg: "bg-indigo-50 group-hover:bg-indigo-100",
      iconColor: "text-indigo-600",
    },
    {
      title: "Total Students",
      value: stats.totalStudents.toString(),
      change: "Expected",
      icon: Users,
      iconBg: "bg-violet-50 group-hover:bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "Total Responses",
      value: stats.totalResponses.toLocaleString(),
      change: stats.weeklyResponseChange > 0 ? `+${stats.weeklyResponseChange} this week` : "All time",
      icon: MessageCircle,
      iconBg: "bg-blue-50 group-hover:bg-blue-100",
      iconColor: "text-blue-600",
      isNew: stats.weeklyResponseChange > 0,
    },
    {
      title: "Live Sessions",
      value: stats.liveSessions.toString(),
      change: stats.liveSessions > 0 ? "Active now" : "None active",
      icon: Activity,
      iconBg: "bg-emerald-50 group-hover:bg-emerald-100",
      iconColor: "text-emerald-600",
      isLive: stats.liveSessions > 0,
    },
  ]

  const quickActions = [
    {
      title: "New Session",
      description: "Start feedback collection",
      icon: Plus,
      href: "/teacher/sessions",
      hoverBg: "hover:bg-indigo-50",
      hoverBorder: "hover:border-indigo-200",
      hoverIcon: "group-hover:border-indigo-300 group-hover:bg-indigo-100",
      hoverIconColor: "group-hover:text-indigo-600",
    },
    {
      title: "Question Templates",
      description: "Manage question sets",
      icon: FileText,
      href: "/teacher/questions",
      hoverBg: "hover:bg-violet-50",
      hoverBorder: "hover:border-violet-200",
      hoverIcon: "group-hover:border-violet-300 group-hover:bg-violet-100",
      hoverIconColor: "group-hover:text-violet-600",
    },
    {
      title: "My Courses",
      description: "View all courses",
      icon: GraduationCap,
      href: "/teacher/courses",
      hoverBg: "hover:bg-blue-50",
      hoverBorder: "hover:border-blue-200",
      hoverIcon: "group-hover:border-blue-300 group-hover:bg-blue-100",
      hoverIconColor: "group-hover:text-blue-600",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Hero Welcome Section */}
      <div className="hero-gradient rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/60 shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-full filter blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10">
          <p className="text-indigo-600 font-semibold mb-2 tracking-wide uppercase text-sm">
            Welcome back
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Ready to engage your{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              students today?
            </span>
          </h2>
          <p className="text-slate-600 max-w-2xl mb-6 text-sm sm:text-base">
            {stats.liveSessions > 0 ? (
              <>You have {stats.liveSessions} live session{stats.liveSessions > 1 ? 's' : ''} with {stats.totalResponses.toLocaleString()} responses collected.</>
            ) : (
              <>You have {stats.totalResponses.toLocaleString()} total responses. Start a new session to collect more feedback.</>
            )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => router.push("/teacher/sessions")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 gap-2 border-0"
            >
              <Plus className="w-5 h-5" />
              New Session
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/teacher/analytics")}
              className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              View Analytics
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsDisplay.map((stat, index) => (
          <div
            key={index}
            className="gradient-border-card card-hover-lift group"
          >
            <div className="card-inner p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-2xl transition-colors ${stat.iconBg}`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <span
                  className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                    stat.isLive
                      ? "text-emerald-600 bg-emerald-50"
                      : stat.isNew
                      ? "text-blue-600 bg-blue-50"
                      : "text-slate-600 bg-slate-100"
                  }`}
                >
                  {stat.isNew && <TrendingUp className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">
                {stat.value}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Active Sessions & AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Sessions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Live Sessions
                </h3>
                <p className="text-slate-500 text-sm mt-1">
                  Currently collecting student feedback
                </p>
              </div>
              <button
                onClick={() => router.push("/teacher/sessions")}
                className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {liveSessions.length > 0 ? (
              <div className="space-y-4">
                {liveSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group relative bg-slate-50 hover:bg-white border border-emerald-200 hover:border-emerald-300 rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-lg"
                    onClick={() => router.push(`/teacher/sessions/${session.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="live-indicator w-3 h-3 rounded-full animate-pulse bg-emerald-500" />
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {session.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-slate-600">{session.courseName}</span>
                            <span className="font-mono text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {session.courseCode}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-xs font-bold gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        LIVE
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 mb-4">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Started {session.startedAgo}
                      </span>
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        <span className="font-semibold text-slate-900">{session.responseCount}</span> responses
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 flex items-center gap-2">
                          <Key className="w-3 h-3 text-slate-400" />
                          {session.accessCode}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            copyAccessCode(session.accessCode)
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                          title="Copy access code"
                        >
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/teacher/sessions/${session.id}/analytics`)
                          }}
                          className="text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white border-slate-200 hover:border-indigo-300"
                        >
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Analytics
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm font-medium text-red-600 hover:text-red-700 bg-white border-slate-200 hover:border-red-300"
                        >
                          <StopCircle className="w-4 h-4 mr-1" />
                          End
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p className="font-medium">No live sessions</p>
                <p className="text-sm mt-1">Start a new session to collect feedback</p>
                <Button
                  onClick={() => router.push("/teacher/sessions")}
                  className="mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Session
                </Button>
              </div>
            )}
          </div>

          {/* AI Insights Preview */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-6 border border-violet-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-200/50 to-purple-200/50 rounded-full filter blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Insights
                  </h3>
                </div>
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 text-xs">
                  {stats.totalResponses > 0 ? 'Analysis Available' : 'Collect More Data'}
                </Badge>
              </div>
              <p className="text-slate-600 mb-4 text-sm">
                {stats.totalResponses > 0 ? (
                  `Analysis based on ${stats.totalResponses.toLocaleString()} responses across ${stats.activeCourses} courses.`
                ) : (
                  'Start collecting feedback to unlock AI-powered insights about your teaching.'
                )}
              </p>
              {stats.totalResponses > 0 && (
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 p-3 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700">View detailed analytics to see student engagement patterns</p>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-white/70 backdrop-blur rounded-xl border border-white/50">
                    <Brain className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-slate-700">AI-generated recommendations based on feedback trends</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/teacher/analytics")}
                className="w-full bg-white/80 hover:bg-white border-violet-200 hover:border-violet-300 text-violet-700"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                View Full AI Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Recent Feedback */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className={`group w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl transition-all ${action.hoverBg} ${action.hoverBorder}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-all ${action.hoverIcon}`}
                    >
                      <action.icon
                        className={`w-5 h-5 text-slate-600 ${action.hoverIconColor}`}
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">
                        {action.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Recent Feedback
              </h3>
              {recentFeedback.length > 0 && (
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                  Latest
                </span>
              )}
            </div>
            {recentFeedback.length > 0 ? (
              <div className="space-y-3">
                {recentFeedback.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                  >
                    <div
                      className={`w-1 min-h-[40px] rounded-full shrink-0 ${
                        feedback.sentiment === "positive"
                          ? "bg-emerald-400"
                          : feedback.sentiment === "neutral"
                          ? "bg-amber-400"
                          : "bg-red-400"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 mb-1.5 line-clamp-2">
                        "{feedback.text}"
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{feedback.courseCode}</span>
                        <span>-</span>
                        <span>{feedback.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No feedback yet</p>
                <p className="text-xs mt-1">Start a session to collect responses</p>
              </div>
            )}
            <button
              onClick={() => router.push("/teacher/sessions")}
              className="w-full mt-4 py-2.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
            >
              View All Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
