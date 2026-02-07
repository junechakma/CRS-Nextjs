"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { generateAIInsights, type AIInsight, type SessionAnalytics } from "@/lib/actions/analytics"
import { toast } from "sonner"
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

interface AnalyticsClientProps {
  analytics: SessionAnalytics
}

export default function AnalyticsClient({ analytics }: AnalyticsClientProps) {
  const router = useRouter()
  const [expandedQuestions, setExpandedQuestions] = useState<string[]>([])
  const [showInsights, setShowInsights] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [insights, setInsights] = useState<AIInsight | null>(null)

  const { session, questions } = analytics

  // Calculate stats
  const responseRate = session.expected_students > 0
    ? Math.round((session.response_count / session.expected_students) * 100)
    : 0

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not specified"
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ""
    const time = new Date(timeStr)
    return time.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  }

  const handleGenerateInsights = async () => {
    setShowInsights(true)
    if (!insights) {
      setIsGenerating(true)
      const result = await generateAIInsights(session.id)

      if (result.success && result.data) {
        setInsights(result.data)
      } else {
        toast.error(result.error || "Failed to generate insights")
      }
      setIsGenerating(false)
    }
  }

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    )
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "rating":
        return Star
      case "boolean":
        return CheckCircle2
      case "multiple":
        return List
      case "text":
        return MessageSquare
      case "numeric":
        return Hash
      default:
        return FileText
    }
  }

  const getQuestionTypeColor = (type: string) => {
    switch (type) {
      case "rating":
        return { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" }
      case "boolean":
        return { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" }
      case "multiple":
        return { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" }
      case "text":
        return { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" }
      case "numeric":
        return { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" }
      default:
        return { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" }
    }
  }

  // Calculate question stats
  const getQuestionStats = (question: SessionAnalytics["questions"][0]) => {
    if (question.type === "rating") {
      const ratings = question.responses
        .map((r) => r.answer_rating)
        .filter((r): r is number => r !== null)

      if (ratings.length === 0) return null

      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
      const distribution: Record<number, number> = {}
      const scale = question.scale || 5

      for (let i = 1; i <= scale; i++) {
        distribution[i] = 0
      }

      ratings.forEach((r) => {
        distribution[r] = (distribution[r] || 0) + 1
      })

      return {
        average: avg.toFixed(1),
        distribution: Object.entries(distribution).map(([value, count]) => ({
          value: parseInt(value),
          count,
          percentage: Math.round((count / ratings.length) * 100),
        })),
      }
    }

    if (question.type === "boolean") {
      const yesCount = question.responses.filter((r) => r.answer_boolean === true).length
      const noCount = question.responses.filter((r) => r.answer_boolean === false).length
      const total = yesCount + noCount

      if (total === 0) return null

      return {
        yesCount,
        noCount,
        yesPercentage: Math.round((yesCount / total) * 100),
        noPercentage: Math.round((noCount / total) * 100),
      }
    }

    if (question.type === "multiple") {
      // Check both answer_choice (new) and answer_text (old) for multiple choice
      const choices = question.responses
        .map((r) => r.answer_choice || r.answer_text)
        .filter((c): c is string => c !== null)

      if (choices.length === 0) return null

      const distribution: Record<string, number> = {}
      choices.forEach((c) => {
        distribution[c] = (distribution[c] || 0) + 1
      })

      return {
        options: Object.entries(distribution).map(([label, count]) => ({
          label,
          count,
          percentage: Math.round((count / choices.length) * 100),
        })),
      }
    }

    if (question.type === "numeric") {
      const numbers = question.responses
        .map((r) => r.answer_numeric)
        .filter((n): n is number => n !== null)

      if (numbers.length === 0) return null

      const avg = numbers.reduce((a, b) => a + b, 0) / numbers.length
      const min = Math.min(...numbers)
      const max = Math.max(...numbers)

      return {
        average: avg.toFixed(1),
        min,
        max,
      }
    }

    if (question.type === "text") {
      const textResponses = question.responses
        .map((r) => r.answer_text)
        .filter((t): t is string => t !== null && t.length > 0)

      return {
        textResponses: textResponses.map((text, idx) => ({
          id: idx,
          text,
        })),
      }
    }

    return null
  }

  return (
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
                {session.name}
              </h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-slate-600">{session.course_name}</span>
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {session.course_code}
                </span>
                <Badge
                  className={
                    session.status === "completed"
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : session.status === "live"
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                  }
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            onClick={handleGenerateInsights}
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
            {formatDate(session.scheduled_date)}
          </div>
          {session.start_time && session.end_time && (
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              {formatTime(session.start_time)} - {formatTime(session.end_time)}
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-slate-400" />
            {session.response_count} {session.response_count === 1 ? "response" : "responses"} received
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
          <p className="text-3xl font-bold text-slate-900">{session.response_count}</p>
          <p className="text-sm text-slate-500">Total Responses</p>
          <p className="text-xs text-emerald-600 mt-1">
            {session.expected_students > 0
              ? `of ${session.expected_students} expected`
              : "Anonymous submissions"}
          </p>
        </div>

        {session.expected_students > 0 ? (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{responseRate}%</p>
            <p className="text-sm text-slate-500">Response Rate</p>
            <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${responseRate}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-indigo-50">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{session.response_count}</p>
            <p className="text-sm text-slate-500">Submissions</p>
            <p className="text-xs text-indigo-600 mt-1">Anonymous feedback</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{session.avg_rating.toFixed(1)}</p>
          <p className="text-sm text-slate-500">Average Rating</p>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(session.avg_rating)
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
          <p className="text-3xl font-bold text-slate-900">{questions.length}</p>
          <p className="text-sm text-slate-500">Questions Asked</p>
          <p className="text-xs text-violet-600 mt-1">
            {session.response_count > 0 ? "Responses collected" : "No responses yet"}
          </p>
        </div>
      </div>

      {/* Question Responses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Question Breakdown</h2>

        {questions.length === 0 && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No questions in this session</p>
          </div>
        )}

        {questions.map((question, index) => {
          const TypeIcon = getQuestionTypeIcon(question.type)
          const colors = getQuestionTypeColor(question.type)
          const isExpanded = expandedQuestions.includes(question.id)
          const stats = getQuestionStats(question)

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
                        {question.responses.length} responses
                      </span>
                      {question.required && (
                        <span className="text-xs text-slate-400">Required</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    {question.type === "rating" && stats && "average" in stats && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{stats.average}</p>
                        <p className="text-xs text-slate-500">avg rating</p>
                      </div>
                    )}
                    {question.type === "boolean" && stats && "yesPercentage" in stats && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">{stats.yesPercentage}%</p>
                        <p className="text-xs text-slate-500">said yes</p>
                      </div>
                    )}
                    {question.type === "numeric" && stats && "average" in stats && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{stats.average}</p>
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
              {isExpanded && stats && (
                <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                  {/* Rating Distribution */}
                  {question.type === "rating" && "distribution" in stats && stats.distribution && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700 mb-4">Rating Distribution</p>
                      {stats.distribution.map((item) => (
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
                  {question.type === "boolean" && "yesCount" in stats && (
                    <div className="flex gap-6">
                      <div className="flex-1 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-2">
                          <ThumbsUp className="w-5 h-5 text-emerald-600" />
                          <span className="font-medium text-emerald-700">Yes</span>
                        </div>
                        <p className="text-3xl font-bold text-emerald-600">{stats.yesPercentage}%</p>
                        <p className="text-sm text-emerald-600/70">{stats.yesCount} responses</p>
                      </div>
                      <div className="flex-1 p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-3 mb-2">
                          <ThumbsDown className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-red-700">No</span>
                        </div>
                        <p className="text-3xl font-bold text-red-600">{stats.noPercentage}%</p>
                        <p className="text-sm text-red-600/70">{stats.noCount} responses</p>
                      </div>
                    </div>
                  )}

                  {/* Multiple Choice Distribution */}
                  {question.type === "multiple" && "options" in stats && stats.options && (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-slate-700 mb-4">Response Distribution</p>
                      {stats.options.map((option, idx) => (
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
                  {question.type === "text" && "textResponses" in stats && stats.textResponses && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-medium text-slate-700">
                          Text Responses ({stats.textResponses.length})
                        </p>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stats.textResponses.slice(0, 10).map((response) => (
                          <div
                            key={response.id}
                            className="p-3 bg-white rounded-xl border border-slate-200"
                          >
                            <p className="text-sm text-slate-700">{response.text}</p>
                          </div>
                        ))}
                      </div>
                      {stats.textResponses.length > 10 && (
                        <p className="text-sm text-slate-500 text-center">
                          +{stats.textResponses.length - 10} more responses
                        </p>
                      )}
                    </div>
                  )}

                  {/* Numeric Distribution */}
                  {question.type === "numeric" && "average" in stats && "min" in stats && (
                    <div className="space-y-4">
                      <div className="flex gap-4 mb-4">
                        <div className="p-3 bg-slate-100 rounded-xl">
                          <p className="text-xs text-slate-500">Average</p>
                          <p className="text-xl font-bold text-slate-900">{stats.average}</p>
                        </div>
                        <div className="p-3 bg-slate-100 rounded-xl">
                          <p className="text-xs text-slate-500">Min</p>
                          <p className="text-xl font-bold text-slate-900">{stats.min}</p>
                        </div>
                        <div className="p-3 bg-slate-100 rounded-xl">
                          <p className="text-xs text-slate-500">Max</p>
                          <p className="text-xl font-bold text-slate-900">{stats.max}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
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
                      <p className="text-sm text-slate-500">
                        Generated from {session.response_count} student responses
                      </p>
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
                ) : insights ? (
                  <div className="space-y-5">
                    {/* Summary */}
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex gap-4">
                        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600 shrink-0">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">Summary</h3>
                          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{insights.summary}</p>
                        </div>
                      </div>
                    </div>

                    {/* Strengths */}
                    {insights.strengths.length > 0 && (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "100ms", animationFillMode: "both" }}>
                        <div className="flex gap-4">
                          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
                            <TrendingUp className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">Strengths</h3>
                            <ul className="mt-2 space-y-1.5">
                              {insights.strengths.map((strength, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                  {strength}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Areas for Improvement */}
                    {insights.areasForImprovement.length > 0 && (
                      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "200ms", animationFillMode: "both" }}>
                        <div className="flex gap-4">
                          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">Areas for Improvement</h3>
                            <ul className="mt-2 space-y-1.5">
                              {insights.areasForImprovement.map((area, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                  {area}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {insights.recommendations.length > 0 && (
                      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "300ms", animationFillMode: "both" }}>
                        <div className="flex gap-4">
                          <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600 shrink-0">
                            <Target className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">Recommendations</h3>
                            <ul className="mt-2 space-y-1.5">
                              {insights.recommendations.map((rec, idx) => (
                                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                                  <Zap className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Category Insights */}
                    {insights.categoryInsights.length > 0 && (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
                        <div className="flex gap-4">
                          <div className="p-2.5 rounded-xl bg-slate-200 text-slate-600 shrink-0">
                            <Lightbulb className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900">Category Insights</h3>
                            <div className="mt-3 space-y-3">
                              {insights.categoryInsights.map((cat, idx) => (
                                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-100">
                                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                                    {cat.category}
                                  </p>
                                  <p className="text-sm text-slate-600 mt-1">{cat.analysis}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Footer */}
              {!isGenerating && insights && (
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Powered by AI analysis of {session.response_count} student responses
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
