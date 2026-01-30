"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Brain,
  Sparkles,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react"

const overviewStats = [
  {
    title: "Total Responses",
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: MessageSquare,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Avg. Satisfaction",
    value: "4.6",
    subtext: "/ 5.0",
    change: "+0.3",
    trend: "up",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Response Rate",
    value: "89%",
    change: "+5%",
    trend: "up",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "AI Insights",
    value: "24",
    subtext: "new",
    change: "This week",
    trend: "neutral",
    icon: Brain,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
]

const sentimentData = {
  positive: 78,
  neutral: 15,
  negative: 7,
}

const coursePerformance = [
  {
    name: "Introduction to Machine Learning",
    code: "CS401",
    satisfaction: 4.8,
    responses: 89,
    trend: "up",
    change: "+0.2",
  },
  {
    name: "Database Systems",
    code: "CS305",
    satisfaction: 4.5,
    responses: 65,
    trend: "up",
    change: "+0.1",
  },
  {
    name: "Data Structures & Algorithms",
    code: "CS201",
    satisfaction: 4.7,
    responses: 120,
    trend: "down",
    change: "-0.1",
  },
  {
    name: "Software Engineering",
    code: "CS350",
    satisfaction: 4.3,
    responses: 45,
    trend: "up",
    change: "+0.4",
  },
]

const aiInsights = [
  {
    type: "positive",
    icon: CheckCircle2,
    title: "Strong Practical Examples",
    description:
      "Students consistently praise the real-world examples in Machine Learning class. 94% positive mentions.",
    course: "CS401",
    confidence: 96,
  },
  {
    type: "suggestion",
    icon: Lightbulb,
    title: "Pacing Adjustment Needed",
    description:
      "Multiple students suggest slowing down during complex topics, especially in Database Systems.",
    course: "CS305",
    confidence: 87,
  },
  {
    type: "warning",
    icon: AlertTriangle,
    title: "Lab Session Concerns",
    description:
      "Some students feel lab sessions could use more structured guidance and clearer objectives.",
    course: "CS201",
    confidence: 72,
  },
  {
    type: "positive",
    icon: CheckCircle2,
    title: "Excellent Communication",
    description:
      "Teaching style and clarity of explanations rated highly across all courses.",
    course: "All",
    confidence: 91,
  },
]

const cloMapping = [
  { clo: "CLO-1", name: "Understand fundamental concepts", coverage: 95, questions: 12 },
  { clo: "CLO-2", name: "Apply theoretical knowledge", coverage: 88, questions: 8 },
  { clo: "CLO-3", name: "Analyze complex problems", coverage: 72, questions: 6 },
  { clo: "CLO-4", name: "Evaluate solutions critically", coverage: 65, questions: 4 },
  { clo: "CLO-5", name: "Create innovative solutions", coverage: 45, questions: 3 },
]

const recentTrends = [
  { period: "Week 1", satisfaction: 4.2 },
  { period: "Week 2", satisfaction: 4.3 },
  { period: "Week 3", satisfaction: 4.4 },
  { period: "Week 4", satisfaction: 4.5 },
  { period: "Week 5", satisfaction: 4.6 },
  { period: "Week 6", satisfaction: 4.6 },
]

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [timeRange, setTimeRange] = useState("semester")

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
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Analytics
                  </h1>
                </div>
                <p className="text-slate-500">
                  AI-powered insights from student feedback
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Spring 2025
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, index) => (
                <div key={index} className="gradient-border-card card-hover-lift group">
                  <div className="card-inner p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <span
                        className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                          stat.trend === "up"
                            ? "text-emerald-600 bg-emerald-50"
                            : stat.trend === "down"
                            ? "text-red-600 bg-red-50"
                            : "text-slate-600 bg-slate-100"
                        }`}
                      >
                        {stat.trend === "up" && <ArrowUpRight className="w-3 h-3" />}
                        {stat.trend === "down" && <ArrowDownRight className="w-3 h-3" />}
                        {stat.change}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </h3>
                      {stat.subtext && (
                        <span className="text-sm text-slate-500">{stat.subtext}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{stat.title}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sentiment Analysis */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 rounded-xl">
                        <Brain className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Sentiment Analysis</h3>
                        <p className="text-sm text-slate-500">AI-processed feedback sentiment</p>
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
                    <div
                      className="bg-emerald-500 transition-all"
                      style={{ width: `${sentimentData.positive}%` }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{ width: `${sentimentData.neutral}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${sentimentData.negative}%` }}
                    />
                  </div>
                </div>

                {/* Course Performance */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-50 rounded-xl">
                        <BookOpen className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">Course Performance</h3>
                        <p className="text-sm text-slate-500">Satisfaction scores by course</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {coursePerformance.map((course, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-slate-900 truncate">
                            {course.name}
                          </h4>
                          <p className="text-sm text-slate-500">{course.code}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-slate-900">
                              {course.satisfaction}
                            </span>
                            <span className="text-sm text-slate-500">/ 5.0</span>
                            <span
                              className={`flex items-center text-xs font-medium ${
                                course.trend === "up"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {course.trend === "up" ? (
                                <ArrowUpRight className="w-3 h-3" />
                              ) : (
                                <ArrowDownRight className="w-3 h-3" />
                              )}
                              {course.change}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {course.responses} responses
                          </p>
                        </div>
                        <div className="w-24">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                              style={{ width: `${(course.satisfaction / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CLO Mapping */}
                <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-3xl p-6 border border-indigo-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white rounded-xl shadow-sm">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">CLO Coverage Mapping</h3>
                      <p className="text-sm text-slate-600">
                        AI-aligned learning outcomes assessment
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cloMapping.map((clo, index) => (
                      <div key={index} className="bg-white/70 backdrop-blur rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 font-mono">
                              {clo.clo}
                            </Badge>
                            <span className="text-sm font-medium text-slate-700">
                              {clo.name}
                            </span>
                          </div>
                          <span className="text-sm text-slate-500">
                            {clo.questions} questions
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                clo.coverage >= 80
                                  ? "bg-emerald-500"
                                  : clo.coverage >= 60
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${clo.coverage}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-slate-700 w-12 text-right">
                            {clo.coverage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - AI Insights */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-xl">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">AI Insights</h3>
                      <p className="text-sm text-slate-500">Key findings from feedback</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border transition-colors cursor-pointer hover:shadow-md ${
                          insight.type === "positive"
                            ? "bg-emerald-50 border-emerald-100 hover:border-emerald-200"
                            : insight.type === "suggestion"
                            ? "bg-blue-50 border-blue-100 hover:border-blue-200"
                            : "bg-amber-50 border-amber-100 hover:border-amber-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-1.5 rounded-lg ${
                              insight.type === "positive"
                                ? "bg-emerald-100"
                                : insight.type === "suggestion"
                                ? "bg-blue-100"
                                : "bg-amber-100"
                            }`}
                          >
                            <insight.icon
                              className={`w-4 h-4 ${
                                insight.type === "positive"
                                  ? "text-emerald-600"
                                  : insight.type === "suggestion"
                                  ? "text-blue-600"
                                  : "text-amber-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 text-sm mb-1">
                              {insight.title}
                            </h4>
                            <p className="text-xs text-slate-600 mb-2">
                              {insight.description}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {insight.course}
                              </Badge>
                              <span className="text-xs text-slate-500">
                                {insight.confidence}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full mt-4 gap-2">
                    View All Insights
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Trend Chart Placeholder */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Satisfaction Trend</h3>
                      <p className="text-sm text-slate-500">Last 6 weeks</p>
                    </div>
                  </div>

                  {/* Simple visual trend */}
                  <div className="flex items-end gap-2 h-32">
                    {recentTrends.map((week, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all hover:from-indigo-600 hover:to-violet-600"
                          style={{ height: `${((week.satisfaction - 4) / 1) * 100}%` }}
                        />
                        <span className="text-xs text-slate-500">{week.period.replace("Week ", "W")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Current Average</span>
                    <span className="text-lg font-bold text-slate-900">4.6 / 5.0</span>
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
