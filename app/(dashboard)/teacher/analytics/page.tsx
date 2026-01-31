"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Brain,
  Sparkles,
  Download,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Star,
  ChevronRight,
  Clock,
  Timer,
  Zap,
} from "lucide-react"

// Mock data matching database schema - would come from teacher_dashboard_stats view
const dashboardStats = {
  totalCourses: 4,
  activeCourses: 4,
  totalSessions: 41,
  liveSessions: 2,
  scheduledSessions: 3,
  completedSessions: 36,
  totalResponses: 2847,
  avgRating: 4.58,
  avgCompletionTimeSeconds: 204, // 3 min 24 sec
}

// Mock data matching course_stats view
const courseStats = [
  {
    id: "1",
    name: "Introduction to Machine Learning",
    code: "CS401",
    color: "indigo",
    status: "active",
    sessionCount: 12,
    liveSessionCount: 1,
    completedSessionCount: 10,
    totalResponses: 892,
    avgRating: 4.8,
    lastActivity: "2 hours ago",
    semesterName: "Spring 2025",
    trend: "up",
    trendValue: "+0.2",
  },
  {
    id: "2",
    name: "Database Systems",
    code: "CS305",
    color: "violet",
    status: "active",
    sessionCount: 8,
    liveSessionCount: 1,
    completedSessionCount: 6,
    totalResponses: 485,
    avgRating: 4.5,
    lastActivity: "1 day ago",
    semesterName: "Spring 2025",
    trend: "up",
    trendValue: "+0.1",
  },
  {
    id: "3",
    name: "Data Structures & Algorithms",
    code: "CS201",
    color: "blue",
    status: "active",
    sessionCount: 15,
    liveSessionCount: 0,
    completedSessionCount: 14,
    totalResponses: 1120,
    avgRating: 4.7,
    lastActivity: "3 hours ago",
    semesterName: "Spring 2025",
    trend: "down",
    trendValue: "-0.1",
  },
  {
    id: "4",
    name: "Software Engineering",
    code: "CS350",
    color: "emerald",
    status: "active",
    sessionCount: 6,
    liveSessionCount: 0,
    completedSessionCount: 5,
    totalResponses: 350,
    avgRating: 4.3,
    lastActivity: "5 days ago",
    semesterName: "Spring 2025",
    trend: "up",
    trendValue: "+0.4",
  },
]

// Recent sessions matching session_details view
const recentSessions = [
  {
    id: "1",
    name: "Mid-Semester Feedback",
    courseName: "Introduction to Machine Learning",
    courseCode: "CS401",
    courseColor: "indigo",
    status: "completed",
    responseCount: 82,
    avgRating: 4.3,
    avgCompletionTimeSeconds: 195,
    completedAt: "Jan 30, 2025",
  },
  {
    id: "2",
    name: "Weekly Check-in",
    courseName: "Database Systems",
    courseCode: "CS305",
    courseColor: "violet",
    status: "completed",
    responseCount: 58,
    avgRating: 4.5,
    avgCompletionTimeSeconds: 142,
    completedAt: "Jan 29, 2025",
  },
  {
    id: "3",
    name: "Lab Session Feedback",
    courseName: "Data Structures & Algorithms",
    courseCode: "CS201",
    courseColor: "blue",
    status: "completed",
    responseCount: 112,
    avgRating: 4.6,
    avgCompletionTimeSeconds: 210,
    completedAt: "Jan 28, 2025",
  },
]

// Sentiment breakdown from analytics
const sentimentData = {
  positive: 78,
  neutral: 15,
  negative: 7,
  totalAnalyzed: 2847,
}

// AI Insights matching analytics_reports structure
const aiInsights = [
  {
    id: "1",
    type: "positive" as const,
    title: "Strong Practical Examples",
    description: "Students consistently praise the real-world examples in Machine Learning class. 94% positive mentions.",
    courseCode: "CS401",
    confidence: 96,
  },
  {
    id: "2",
    type: "suggestion" as const,
    title: "Pacing Adjustment Needed",
    description: "Multiple students suggest slowing down during complex topics, especially in Database Systems.",
    courseCode: "CS305",
    confidence: 87,
  },
  {
    id: "3",
    type: "warning" as const,
    title: "Lab Session Concerns",
    description: "Some students feel lab sessions could use more structured guidance and clearer objectives.",
    courseCode: "CS201",
    confidence: 72,
  },
  {
    id: "4",
    type: "positive" as const,
    title: "Excellent Communication",
    description: "Teaching style and clarity of explanations rated highly across all courses.",
    courseCode: "All",
    confidence: 91,
  },
]

// Monthly trends matching teacher_monthly_trends view
const monthlyTrends = [
  { month: "Sep", responses: 320, avgRating: 4.2 },
  { month: "Oct", responses: 480, avgRating: 4.3 },
  { month: "Nov", responses: 520, avgRating: 4.4 },
  { month: "Dec", responses: 410, avgRating: 4.5 },
  { month: "Jan", responses: 620, avgRating: 4.6 },
  { month: "Feb", responses: 497, avgRating: 4.6 },
]

const colorClasses: Record<string, { bg: string; text: string; border: string; light: string }> = {
  indigo: { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-200", light: "bg-indigo-50" },
  violet: { bg: "bg-violet-500", text: "text-violet-600", border: "border-violet-200", light: "bg-violet-50" },
  blue: { bg: "bg-blue-500", text: "text-blue-600", border: "border-blue-200", light: "bg-blue-50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-200", light: "bg-emerald-50" },
  amber: { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-200", light: "bg-amber-50" },
  rose: { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-200", light: "bg-rose-50" },
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("Spring 2025")

  const getInsightStyles = (type: "positive" | "suggestion" | "warning") => {
    switch (type) {
      case "positive":
        return { bg: "bg-emerald-50", border: "border-emerald-100", icon: "bg-emerald-100", iconColor: "text-emerald-600" }
      case "suggestion":
        return { bg: "bg-blue-50", border: "border-blue-100", icon: "bg-blue-100", iconColor: "text-blue-600" }
      case "warning":
        return { bg: "bg-amber-50", border: "border-amber-100", icon: "bg-amber-100", iconColor: "text-amber-600" }
    }
  }

  const getInsightIcon = (type: "positive" | "suggestion" | "warning") => {
    switch (type) {
      case "positive": return CheckCircle2
      case "suggestion": return Lightbulb
      case "warning": return AlertTriangle
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Analytics Overview
                  </h1>
                </div>
                <p className="text-slate-500">
                  AI-powered insights across all your courses and sessions
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {selectedSemester}
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Overview Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Responses */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50">
                    <MessageSquare className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    +12.5%
                  </span>
                </div>
                <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalResponses.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Total Responses</p>
              </div>

              {/* Average Rating */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-50">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3" />
                    +0.3
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-bold text-slate-900">{dashboardStats.avgRating.toFixed(1)}</p>
                  <span className="text-sm text-slate-500">/ 5.0</span>
                </div>
                <p className="text-sm text-slate-500">Avg. Satisfaction</p>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(dashboardStats.avgRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Avg Completion Time */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50">
                    <Timer className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{formatDuration(dashboardStats.avgCompletionTimeSeconds)}</p>
                <p className="text-sm text-slate-500">Avg. Completion Time</p>
                <p className="text-xs text-slate-400 mt-1">Per feedback session</p>
              </div>

              {/* Sessions Stats */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-violet-50">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                  </div>
                  {dashboardStats.liveSessions > 0 && (
                    <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      {dashboardStats.liveSessions} live
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-slate-900">{dashboardStats.totalSessions}</p>
                <p className="text-sm text-slate-500">Total Sessions</p>
                <p className="text-xs text-slate-400 mt-1">
                  {dashboardStats.completedSessions} completed · {dashboardStats.scheduledSessions} scheduled
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sentiment Analysis */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                        <Brain className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Sentiment Analysis</h3>
                        <p className="text-sm text-slate-500">
                          Based on {sentimentData.totalAnalyzed.toLocaleString()} text responses
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Powered
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-2" />
                      <p className="text-3xl font-bold text-emerald-700">{sentimentData.positive}%</p>
                      <p className="text-sm text-emerald-600 font-medium">Positive</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-100">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-2" />
                      <p className="text-3xl font-bold text-amber-700">{sentimentData.neutral}%</p>
                      <p className="text-sm text-amber-600 font-medium">Neutral</p>
                    </div>
                    <div className="text-center p-4 rounded-2xl bg-red-50 border border-red-100">
                      <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2" />
                      <p className="text-3xl font-bold text-red-700">{sentimentData.negative}%</p>
                      <p className="text-sm text-red-600 font-medium">Negative</p>
                    </div>
                  </div>

                  {/* Sentiment Bar */}
                  <div className="h-4 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500" style={{ width: `${sentimentData.positive}%` }} />
                    <div className="bg-amber-500" style={{ width: `${sentimentData.neutral}%` }} />
                    <div className="bg-red-500" style={{ width: `${sentimentData.negative}%` }} />
                  </div>
                </div>

                {/* Course Performance */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Course Performance</h3>
                        <p className="text-sm text-slate-500">Ratings and responses across {courseStats.length} courses</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                      onClick={() => router.push("/teacher/courses")}
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {courseStats.map((course) => {
                      const colors = colorClasses[course.color] || colorClasses.indigo
                      return (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/teacher/courses/${course.id}`)}
                        >
                          <div className={`w-1.5 h-12 rounded-full ${colors.bg}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-slate-900 truncate">{course.name}</h4>
                              {course.liveSessionCount > 0 && (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  Live
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="font-mono text-xs">{course.code}</span>
                              <span>·</span>
                              <span>{course.totalResponses.toLocaleString()} responses</span>
                              <span>·</span>
                              <span>{course.sessionCount} sessions</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-slate-900">{course.avgRating.toFixed(1)}</span>
                              <span className="text-sm text-slate-500">/ 5.0</span>
                              <span className={`flex items-center text-xs font-medium ${
                                course.trend === "up" ? "text-emerald-600" : "text-red-600"
                              }`}>
                                {course.trend === "up" ? (
                                  <ArrowUpRight className="w-3 h-3" />
                                ) : (
                                  <ArrowDownRight className="w-3 h-3" />
                                )}
                                {course.trendValue}
                              </span>
                            </div>
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${colors.bg}`}
                                style={{ width: `${(course.avgRating / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Response Trend - Full Width in Left Column */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Response Trend</h3>
                        <p className="text-sm text-slate-500">Monthly responses over the past 6 months</p>
                      </div>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="flex items-end gap-3 h-40 mb-4">
                    {monthlyTrends.map((month) => {
                      const maxResponses = Math.max(...monthlyTrends.map(m => m.responses))
                      const height = (month.responses / maxResponses) * 100
                      return (
                        <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex flex-col items-center">
                            <span className="text-xs font-medium text-slate-600 mb-1">{month.responses}</span>
                            <div
                              className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all hover:from-indigo-600 hover:to-violet-600 cursor-pointer"
                              style={{ height: `${height}%`, minHeight: '20px' }}
                            />
                          </div>
                          <span className="text-sm text-slate-500">{month.month}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm text-slate-600">Total this period</span>
                      <p className="text-lg font-bold text-slate-900">
                        {monthlyTrends.reduce((sum, m) => sum + m.responses, 0).toLocaleString()} responses
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-slate-600">Current rating</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-lg font-bold text-slate-900">{dashboardStats.avgRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* AI Insights */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">AI Insights</h3>
                      <p className="text-sm text-slate-500">Key findings this semester</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {aiInsights.map((insight) => {
                      const styles = getInsightStyles(insight.type)
                      const Icon = getInsightIcon(insight.type)
                      return (
                        <div
                          key={insight.id}
                          className={`p-4 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${styles.bg} ${styles.border}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1.5 rounded-lg ${styles.icon}`}>
                              <Icon className={`w-4 h-4 ${styles.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 text-sm mb-1">{insight.title}</h4>
                              <p className="text-xs text-slate-600 mb-2">{insight.description}</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{insight.courseCode}</Badge>
                                <span className="text-xs text-slate-500">{insight.confidence}% confidence</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Button variant="outline" className="w-full mt-4 gap-2">
                    View All Insights
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 rounded-xl">
                        <Clock className="w-5 h-5 text-violet-600" />
                      </div>
                      <h3 className="font-bold text-slate-900">Recent Sessions</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 -mr-2"
                      onClick={() => router.push("/teacher/sessions")}
                    >
                      View All
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {recentSessions.map((session) => {
                      const colors = colorClasses[session.courseColor] || colorClasses.indigo
                      return (
                        <div
                          key={session.id}
                          className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                          onClick={() => router.push(`/teacher/sessions/${session.id}/analytics`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-1 h-10 rounded-full ${colors.bg}`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-slate-900 truncate">{session.name}</h4>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="font-mono">{session.courseCode}</span>
                                <span>·</span>
                                <span>{session.responseCount} responses</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                <span className="text-sm font-medium text-slate-900">{session.avgRating}</span>
                              </div>
                              <span className="text-xs text-slate-500">{session.completedAt}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5" />
                    <h3 className="font-bold">Quick Stats</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-100">Active Courses</span>
                      <span className="font-bold">{dashboardStats.activeCourses}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-100">Live Sessions</span>
                      <span className="font-bold">{dashboardStats.liveSessions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-100">This Week</span>
                      <span className="font-bold">+{Math.round(dashboardStats.totalResponses * 0.08)} responses</span>
                    </div>
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
