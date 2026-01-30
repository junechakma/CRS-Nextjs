"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Star,
  TrendingUp,
  BarChart3,
  List,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  ThumbsUp,
  ThumbsDown,
  Hash,
  Sparkles,
  X,
  Lightbulb,
  AlertTriangle,
  Target,
  Loader2,
  Zap,
} from "lucide-react"

// Mock session data
const sessionData = {
  id: 1,
  name: "Mid-Semester Feedback",
  course: "Introduction to Machine Learning",
  courseCode: "CS401",
  date: "Jan 30, 2025",
  startTime: "10:00 AM",
  endTime: "11:30 AM",
  status: "completed",
  totalStudents: 89,
  responses: 82,
  responseRate: 92,
  averageRating: 4.2,
  completionTime: "3m 24s",
}

// Mock question responses
const questionResponses = [
  {
    id: 1,
    text: "How would you rate the clarity of explanations in today's lecture?",
    type: "rating",
    scale: 5,
    required: true,
    responses: 82,
    averageRating: 4.3,
    distribution: [
      { value: 1, count: 2, percentage: 2 },
      { value: 2, count: 4, percentage: 5 },
      { value: 3, count: 12, percentage: 15 },
      { value: 4, count: 28, percentage: 34 },
      { value: 5, count: 36, percentage: 44 },
    ],
  },
  {
    id: 2,
    text: "The pace of the course is appropriate for my learning needs.",
    type: "rating",
    scale: 5,
    required: true,
    responses: 82,
    averageRating: 3.8,
    distribution: [
      { value: 1, count: 4, percentage: 5 },
      { value: 2, count: 8, percentage: 10 },
      { value: 3, count: 18, percentage: 22 },
      { value: 4, count: 32, percentage: 39 },
      { value: 5, count: 20, percentage: 24 },
    ],
  },
  {
    id: 3,
    text: "Do you feel comfortable asking questions during class?",
    type: "boolean",
    required: true,
    responses: 82,
    yesCount: 68,
    noCount: 14,
    yesPercentage: 83,
    noPercentage: 17,
  },
  {
    id: 4,
    text: "Which teaching method do you find most effective?",
    type: "multiple",
    required: false,
    responses: 78,
    options: [
      { label: "Lecture with slides", count: 24, percentage: 31 },
      { label: "Live coding demonstrations", count: 32, percentage: 41 },
      { label: "Group discussions", count: 12, percentage: 15 },
      { label: "Hands-on exercises", count: 10, percentage: 13 },
    ],
  },
  {
    id: 5,
    text: "What suggestions do you have for improving the course?",
    type: "text",
    required: false,
    responses: 45,
    textResponses: [
      { id: 1, text: "More practical examples would help understand the concepts better.", timestamp: "10:15 AM" },
      { id: 2, text: "The pace is a bit fast sometimes, especially during complex topics.", timestamp: "10:18 AM" },
      { id: 3, text: "Would love more office hours or Q&A sessions.", timestamp: "10:22 AM" },
      { id: 4, text: "Great course overall! Maybe add more real-world case studies.", timestamp: "10:25 AM" },
      { id: 5, text: "The assignments are helpful but could use clearer instructions.", timestamp: "10:28 AM" },
      { id: 6, text: "Please provide more practice problems before exams.", timestamp: "10:32 AM" },
      { id: 7, text: "Excellent teaching! No complaints.", timestamp: "10:35 AM" },
      { id: 8, text: "More interactive sessions would be appreciated.", timestamp: "10:38 AM" },
    ],
  },
  {
    id: 6,
    text: "On a scale of 1-10, how likely are you to recommend this course?",
    type: "numeric",
    required: true,
    responses: 82,
    average: 8.4,
    min: 4,
    max: 10,
    distribution: [
      { value: "1-3", count: 2, percentage: 2 },
      { value: "4-6", count: 8, percentage: 10 },
      { value: "7-8", count: 32, percentage: 39 },
      { value: "9-10", count: 40, percentage: 49 },
    ],
  },
]

// Mock AI Insights (following the AI service response format)
const mockAiInsights = {
  summary: "Strong session with high engagement; pacing needs attention for complex topics.",
  strengths: [
    "Clear explanations rated highly (4.3/5 avg)",
    "High recommendation score (88% scored 7+)",
  ],
  areasForImprovement: [
    "Course pace too fast for 15% of students",
    "17% uncomfortable asking questions in class",
  ],
  anomalies: [],
  recommendations: [
    "Add recap sessions or additional resources for complex topics",
    "Implement anonymous Q&A to increase student participation",
  ],
  categoryInsights: [
    {
      category: "Teaching Methods",
      analysis: "Live coding demonstrations are most effective (41%). Consider increasing hands-on coding examples.",
    },
    {
      category: "Student Engagement",
      analysis: "Most students feel comfortable, but creating more inclusive discussion opportunities could help the 17% who don't.",
    },
    {
      category: "Course Content",
      analysis: "Students want more practical examples and clearer assignment instructions based on text feedback.",
    },
  ],
}

export default function SessionAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([1, 2, 3, 4, 5, 6])
  const [showInsights, setShowInsights] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [insightsGenerated, setInsightsGenerated] = useState(false)

  const generateInsights = () => {
    setShowInsights(true)
    if (!insightsGenerated) {
      setIsGenerating(true)
      // Simulate AI generation delay
      setTimeout(() => {
        setIsGenerating(false)
        setInsightsGenerated(true)
      }, 2000)
    }
  }

  const toggleQuestion = (id: number) => {
    setExpandedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    )
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "rating": return Star
      case "boolean": return CheckCircle2
      case "multiple": return List
      case "text": return MessageSquare
      case "numeric": return Hash
      default: return FileText
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "rating": return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" }
      case "boolean": return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" }
      case "multiple": return { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" }
      case "text": return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" }
      case "numeric": return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" }
      default: return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }
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
            {/* Back Button & Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Sessions</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {sessionData.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600">{sessionData.course}</span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sessionData.courseCode}
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={generateInsights}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-200 transition-all border-0"
                >
                  <Sparkles className="w-4 h-4" />
                  AI Insights
                </Button>
              </div>
            </div>

            {/* Session Info Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {sessionData.date}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  {sessionData.startTime} - {sessionData.endTime}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Users className="w-4 h-4 text-slate-400" />
                  {sessionData.totalStudents} students enrolled
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Avg. completion: {sessionData.completionTime}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-50">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{sessionData.responses}</p>
                <p className="text-sm text-slate-500">Total Responses</p>
                <p className="text-xs text-emerald-600 mt-1">of {sessionData.totalStudents} students</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-50">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{sessionData.responseRate}%</p>
                <p className="text-sm text-slate-500">Response Rate</p>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${sessionData.responseRate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-50">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{sessionData.averageRating}</p>
                <p className="text-sm text-slate-500">Average Rating</p>
                <div className="flex gap-0.5 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(sessionData.averageRating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-violet-50">
                    <MessageSquare className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-slate-900">{questionResponses.length}</p>
                <p className="text-sm text-slate-500">Questions Asked</p>
                <p className="text-xs text-violet-600 mt-1">All responses collected</p>
              </div>
            </div>

            {/* Question Responses */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Question Breakdown</h2>

              {questionResponses.map((question, index) => {
                const TypeIcon = getQuestionTypeIcon(question.type)
                const colors = getQuestionTypeColor(question.type)
                const isExpanded = expandedQuestions.includes(question.id)

                return (
                  <div
                    key={question.id}
                    className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden"
                  >
                    {/* Question Header */}
                    <div
                      className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      onClick={() => toggleQuestion(question.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-slate-400 w-6">Q{index + 1}</span>
                          <div className={`p-2 rounded-xl ${colors.bg}`}>
                            <TypeIcon className={`w-5 h-5 ${colors.text}`} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{question.text}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="outline" className={`${colors.bg} ${colors.text} border-0`}>
                              {question.type === "rating" && "Rating Scale"}
                              {question.type === "boolean" && "Yes/No"}
                              {question.type === "multiple" && "Multiple Choice"}
                              {question.type === "text" && "Open Text"}
                              {question.type === "numeric" && "Numeric"}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              {question.responses} responses
                            </span>
                            {question.required && (
                              <span className="text-xs text-slate-400">Required</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {question.type === "rating" && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">{question.averageRating}</p>
                              <p className="text-xs text-slate-500">avg rating</p>
                            </div>
                          )}
                          {question.type === "boolean" && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-600">{question.yesPercentage}%</p>
                              <p className="text-xs text-slate-500">said yes</p>
                            </div>
                          )}
                          {question.type === "numeric" && (
                            <div className="text-right">
                              <p className="text-2xl font-bold text-slate-900">{question.average}</p>
                              <p className="text-xs text-slate-500">average</p>
                            </div>
                          )}
                          <button className="p-1">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                        {/* Rating Distribution */}
                        {question.type === "rating" && question.distribution && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700 mb-4">Rating Distribution</p>
                            {question.distribution.map((item) => (
                              <div key={item.value} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-16 shrink-0">
                                  <span className="text-sm font-medium text-slate-700">{item.value}</span>
                                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                </div>
                                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg flex items-center justify-end px-2"
                                    style={{ width: `${Math.max(item.percentage, 5)}%` }}
                                  >
                                    {item.percentage > 10 && (
                                      <span className="text-xs font-medium text-white">{item.count}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-slate-600 w-12 text-right">{item.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Boolean Distribution */}
                        {question.type === "boolean" && (
                          <div className="flex gap-6">
                            <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                              <div className="flex items-center gap-3 mb-2">
                                <ThumbsUp className="w-5 h-5 text-emerald-600" />
                                <span className="font-medium text-emerald-700">Yes</span>
                              </div>
                              <p className="text-3xl font-bold text-emerald-600">{question.yesPercentage}%</p>
                              <p className="text-sm text-emerald-600/70">{question.yesCount} responses</p>
                            </div>
                            <div className="flex-1 p-4 bg-red-50 rounded-xl border border-red-100">
                              <div className="flex items-center gap-3 mb-2">
                                <ThumbsDown className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-red-700">No</span>
                              </div>
                              <p className="text-3xl font-bold text-red-600">{question.noPercentage}%</p>
                              <p className="text-sm text-red-600/70">{question.noCount} responses</p>
                            </div>
                          </div>
                        )}

                        {/* Multiple Choice Distribution */}
                        {question.type === "multiple" && question.options && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-700 mb-4">Response Distribution</p>
                            {question.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-40 shrink-0">
                                  <span className="text-sm text-slate-700">{option.label}</span>
                                </div>
                                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-violet-400 to-violet-500 rounded-lg flex items-center justify-end px-2"
                                    style={{ width: `${Math.max(option.percentage, 5)}%` }}
                                  >
                                    {option.percentage > 10 && (
                                      <span className="text-xs font-medium text-white">{option.count}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-slate-600 w-12 text-right">{option.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Text Responses */}
                        {question.type === "text" && question.textResponses && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between mb-4">
                              <p className="text-sm font-medium text-slate-700">Text Responses ({question.textResponses.length})</p>
                              <Button variant="outline" size="sm">View All</Button>
                            </div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {question.textResponses.slice(0, 5).map((response) => (
                                <div
                                  key={response.id}
                                  className="p-3 bg-white rounded-xl border border-slate-200"
                                >
                                  <p className="text-sm text-slate-700">{response.text}</p>
                                  <p className="text-xs text-slate-400 mt-2">{response.timestamp}</p>
                                </div>
                              ))}
                            </div>
                            {question.textResponses.length > 5 && (
                              <p className="text-sm text-slate-500 text-center">
                                +{question.textResponses.length - 5} more responses
                              </p>
                            )}
                          </div>
                        )}

                        {/* Numeric Distribution */}
                        {question.type === "numeric" && question.distribution && (
                          <div className="space-y-4">
                            <div className="flex gap-4 mb-4">
                              <div className="p-3 bg-slate-100 rounded-xl">
                                <p className="text-xs text-slate-500">Average</p>
                                <p className="text-xl font-bold text-slate-900">{question.average}</p>
                              </div>
                              <div className="p-3 bg-slate-100 rounded-xl">
                                <p className="text-xs text-slate-500">Min</p>
                                <p className="text-xl font-bold text-slate-900">{question.min}</p>
                              </div>
                              <div className="p-3 bg-slate-100 rounded-xl">
                                <p className="text-xs text-slate-500">Max</p>
                                <p className="text-xl font-bold text-slate-900">{question.max}</p>
                              </div>
                            </div>
                            <p className="text-sm font-medium text-slate-700">Score Distribution</p>
                            {question.distribution.map((item) => (
                              <div key={item.value} className="flex items-center gap-3">
                                <div className="w-16 shrink-0">
                                  <span className="text-sm font-medium text-slate-700">{item.value}</span>
                                </div>
                                <div className="flex-1 h-8 bg-slate-100 rounded-lg overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-rose-400 to-rose-500 rounded-lg flex items-center justify-end px-2"
                                    style={{ width: `${Math.max(item.percentage, 5)}%` }}
                                  >
                                    {item.percentage > 10 && (
                                      <span className="text-xs font-medium text-white">{item.count}</span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-sm text-slate-600 w-12 text-right">{item.percentage}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>

      {/* AI Insights Modal */}
      {showInsights && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowInsights(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-200">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">AI Insights</h2>
                      <p className="text-sm text-slate-500">Generated from {sessionData.responses} student responses</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInsights(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-lg flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-violet-600 animate-spin" />
                      </div>
                    </div>
                    <p className="text-lg font-medium text-slate-900 mt-6">Analyzing responses...</p>
                    <p className="text-sm text-slate-500 mt-1">Our AI is generating insights from the feedback data</p>
                    <div className="flex gap-1 mt-4">
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600 shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Summary</h3>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{mockAiInsights.summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">Strengths</h3>
                          <ul className="mt-2 space-y-1.5">
                            {mockAiInsights.strengths.map((strength, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">Areas for Improvement</h3>
                          <ul className="mt-2 space-y-1.5">
                            {mockAiInsights.areasForImprovement.map((area, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                          <Target className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">Recommendations</h3>
                          <ul className="mt-2 space-y-1.5">
                            {mockAiInsights.recommendations.map((rec, idx) => (
                              <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                <Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Category Insights */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-200 text-slate-600 shrink-0">
                          <Lightbulb className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">Category Insights</h3>
                          <div className="mt-3 space-y-3">
                            {mockAiInsights.categoryInsights.map((cat, idx) => (
                              <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100">
                                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">{cat.category}</p>
                                <p className="text-sm text-slate-600 mt-1">{cat.analysis}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isGenerating && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Powered by AI analysis of {sessionData.responses} student responses
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInsights(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
