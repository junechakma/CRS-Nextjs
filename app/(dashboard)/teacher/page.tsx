"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  GraduationCap,
  Calendar,
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
  Download,
  ChevronRight,
  Brain,
  MessageCircle,
} from "lucide-react"

const stats = [
  {
    title: "Total Students",
    value: "1,247",
    change: "+12%",
    icon: Users,
    iconBg: "bg-indigo-50 group-hover:bg-indigo-100",
    iconColor: "text-indigo-600",
  },
  {
    title: "Avg. Engagement",
    value: "89%",
    change: "+5%",
    icon: Activity,
    iconBg: "bg-violet-50 group-hover:bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    title: "Feedback Entries",
    value: "342",
    change: "24 new",
    icon: MessageCircle,
    iconBg: "bg-blue-50 group-hover:bg-blue-100",
    iconColor: "text-blue-600",
    isNew: true,
  },
  {
    title: "Active Sessions",
    value: "3",
    change: "Live",
    icon: Clock,
    iconBg: "bg-amber-50 group-hover:bg-amber-100",
    iconColor: "text-amber-600",
    isLive: true,
  },
]

const activeSessions = [
  {
    id: 1,
    course: "Introduction to Machine Learning",
    startedAgo: "45m ago",
    students: 89,
    accessCode: "XK9M-PL2Q",
    status: "live",
  },
  {
    id: 2,
    course: "Database Systems - Week 4",
    startedAgo: "20m ago",
    students: 34,
    accessCode: "DBN8-KL3M",
    status: "live",
  },
]

const recentFeedback = [
  {
    id: 1,
    text: "The practical examples really helped clarify the neural network concepts...",
    course: "ML Class",
    time: "2m ago",
    sentiment: "positive",
  },
  {
    id: 2,
    text: "Great pace today, could use more time on backpropagation...",
    course: "ML Class",
    time: "15m ago",
    sentiment: "positive",
  },
  {
    id: 3,
    text: "Slides were a bit fast, need more explanation on joins...",
    course: "Database",
    time: "1h ago",
    sentiment: "neutral",
  },
]

const quickActions = [
  {
    title: "Create Session",
    description: "Start new feedback collection",
    icon: Plus,
    hoverBg: "hover:bg-indigo-50",
    hoverBorder: "hover:border-indigo-200",
    hoverIcon: "group-hover:border-indigo-300 group-hover:bg-indigo-100",
    hoverIconColor: "group-hover:text-indigo-600",
  },
  {
    title: "Question Template",
    description: "Build reusable questions",
    icon: FileText,
    hoverBg: "hover:bg-violet-50",
    hoverBorder: "hover:border-violet-200",
    hoverIcon: "group-hover:border-violet-300 group-hover:bg-violet-100",
    hoverIconColor: "group-hover:text-violet-600",
  },
  {
    title: "Export Reports",
    description: "Download analytics data",
    icon: Download,
    hoverBg: "hover:bg-blue-50",
    hoverBorder: "hover:border-blue-200",
    hoverIcon: "group-hover:border-blue-300 group-hover:bg-blue-100",
    hoverIconColor: "group-hover:text-blue-600",
  },
]

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

      {/* Sidebar */}
      <Sidebar
        role="teacher"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        {/* Header */}
        <Header
          userName="Dr. Sarah Johnson"
          userEmail="sarah.j@university.edu"
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
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
                  You have 3 active sessions and 127 students waiting. Create a new
                  session or check your AI-generated insights from recent feedback.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 gap-2 border-0">
                    <Plus className="w-5 h-5" />
                    New Session
                  </Button>
                  <Button
                    variant="outline"
                    className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    View AI Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {stats.map((stat, index) => (
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
                            ? "text-slate-600 bg-slate-100"
                            : "text-emerald-600 bg-emerald-50"
                        }`}
                      >
                        {!stat.isNew && !stat.isLive && (
                          <TrendingUp className="w-3 h-3" />
                        )}
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
                        Active Sessions
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">
                        Real-time student feedback sessions
                      </p>
                    </div>
                    <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition-all duration-300 cursor-pointer hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="live-indicator w-3 h-3 rounded-full animate-pulse" />
                            <h4 className="font-semibold text-slate-900">
                              {session.course}
                            </h4>
                          </div>
                          <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 text-xs font-bold">
                            LIVE
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 mb-4">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Started {session.startedAgo}
                          </span>
                          <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {session.students} students joined
                          </span>
                          <span className="flex items-center gap-2 font-mono text-slate-900 bg-white px-2 py-1 rounded border border-slate-200">
                            <Key className="w-3 h-3" />
                            {session.accessCode}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-indigo-700">
                              +{session.students - 4}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs text-slate-600">
                              JD
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm font-medium text-slate-600 hover:text-indigo-600 bg-white border-slate-200 hover:border-indigo-300"
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-sm font-medium text-red-600 hover:text-red-700 bg-white border-slate-200 hover:border-red-300"
                            >
                              End Session
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Insights Preview */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 border border-indigo-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-full filter blur-2xl -mr-10 -mt-10" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-xl shadow-sm">
                        <Brain className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        AI-Powered Insights
                      </h3>
                    </div>
                    <p className="text-slate-600 mb-4 text-sm">
                      Recent sentiment analysis from your Machine Learning class
                      shows 94% positive engagement. Students particularly
                      appreciated the hands-on coding exercises.
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-medium text-slate-600">
                            Positive
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">94%</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span className="text-xs font-medium text-slate-600">
                            Neutral
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">5%</p>
                      </div>
                      <div className="bg-white/70 backdrop-blur rounded-xl p-4 border border-white/50">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-xs font-medium text-slate-600">
                            Negative
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-slate-900">1%</p>
                      </div>
                    </div>
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
                  <h3 className="text-lg font-bold text-slate-900 mb-4">
                    Recent Feedback
                  </h3>
                  <div className="space-y-4">
                    {recentFeedback.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <div
                          className={`w-1 min-h-[40px] rounded-full ${
                            feedback.sentiment === "positive"
                              ? "bg-emerald-400"
                              : feedback.sentiment === "neutral"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900 font-medium mb-1 line-clamp-2">
                            "{feedback.text}"
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{feedback.course}</span>
                            <span>•</span>
                            <span>{feedback.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                    View All Feedback
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Floating Action Button (Mobile) */}
      <button className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full shadow-xl shadow-indigo-300 flex items-center justify-center z-50 hover:scale-110 transition-transform">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
