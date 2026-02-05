import Link from "next/link"
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  BookOpen,
  Star,
  Eye,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Target,
} from "lucide-react"
import { Card } from "@/components/ui/card"

const analytics = {
  session: {
    course_code: "CS2231",
    course_title: "Object Oriented Programming",
    section: "6C",
    session_date: "2025-10-02",
    start_time: "2025-10-02T09:00:00",
    end_time: "2025-10-02T10:15:00",
    status: "completed",
    room_number: "Room 01",
  },
  totalResponses: 142,
  averageRating: 4.3,
  completionRate: 91,
  averageTime: 6.4,
  categoryRatings: [
    { label: "Instructor", value: 4.5 },
    { label: "Content", value: 4.1 },
    { label: "Pacing", value: 3.9 },
    { label: "Engagement", value: 4.4 },
  ],
  responseDistribution: [
    { label: "5", value: 64 },
    { label: "4", value: 46 },
    { label: "3", value: 20 },
    { label: "2", value: 9 },
    { label: "1", value: 3 },
  ],
  highlights: [
    {
      question: "Rate the instructor's knowledge of the subject matter",
      average: 4.6,
      sentiment: "Very positive",
    },
    {
      question: "How engaging were the class sessions?",
      average: 4.2,
      sentiment: "Positive",
    },
    {
      question: "Rate the effectiveness of the teaching methods used",
      average: 3.8,
      sentiment: "Mixed",
    },
  ],
  aiInsights: {
    summary:
      "Students responded positively to the instructor's clarity and real-world examples. Engagement dipped during longer code walkthroughs, suggesting a need for more interactive checkpoints.",
    wins: [
      "Strong clarity on core OOP concepts",
      "High satisfaction with lab exercises",
      "Participation increased after introducing quick polls",
    ],
    opportunities: [
      "Rebalance pacing for complex inheritance topics",
      "Add more peer-to-peer discussion prompts",
      "Provide summary slides for each major concept",
    ],
    actionItems: [
      "Insert a 2-minute recap every 20 minutes",
      "Use a short quiz before the midterm review",
      "Share practice problems after each lecture",
    ],
  },
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

export default function SessionAnalyticsDemoPage() {
  const maxDistribution = Math.max(
    ...analytics.responseDistribution.map((item) => item.value)
  )

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>

              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                  Session Analytics Demo
                </h1>
                <p className="text-sm sm:text-base text-slate-600 hidden sm:block">
                  {analytics.session.course_code} - {analytics.session.course_title} (Section {analytics.session.section})
                </p>
                <p className="text-xs sm:text-sm text-slate-500 truncate">
                  {formatDate(analytics.session.session_date)} · {analytics.session.room_number}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 sm:mb-8 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-medium">{formatDate(analytics.session.session_date)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Duration</p>
                <p className="font-medium">
                  {formatTime(analytics.session.start_time)} - {formatTime(analytics.session.end_time)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  {analytics.session.status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Eye className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Room</p>
                <p className="font-medium">{analytics.session.room_number}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Total Responses</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.totalResponses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Average Rating</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.averageRating.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Completion Rate</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.completionRate}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-slate-600">Avg. Time</p>
                <p className="text-2xl font-bold text-slate-900">{analytics.averageTime}m</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Rating Distribution</h2>
                <p className="text-sm text-slate-500">How students rated the session</p>
              </div>
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-3">
              {analytics.responseDistribution.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-6">{item.label}</span>
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${(item.value / maxDistribution) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-600 w-10 text-right">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Category Averages</h2>
                <p className="text-sm text-slate-500">Average rating by category</p>
              </div>
              <Target className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-4">
              {analytics.categoryRatings.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${(item.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Question Highlights</h2>
                <p className="text-sm text-slate-500">Key prompts and sentiment</p>
              </div>
              <CheckCircle className="h-5 w-5 text-violet-600" />
            </div>
            <div className="space-y-4">
              {analytics.highlights.map((item) => (
                <div key={item.question} className="rounded-lg border border-slate-200 p-4">
                  <p className="text-sm font-medium text-slate-900">{item.question}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                    <span>Average: {item.average.toFixed(1)}</span>
                    <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.sentiment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Insights</h2>
                <p className="text-sm text-slate-500">Generated recommendations</p>
              </div>
              <Lightbulb className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {analytics.aiInsights.summary}
            </p>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Wins</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  {analytics.aiInsights.wins.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Opportunities</h3>
                <ul className="space-y-1 text-sm text-slate-600">
                  {analytics.aiInsights.opportunities.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Target className="h-4 w-4 text-amber-500 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
