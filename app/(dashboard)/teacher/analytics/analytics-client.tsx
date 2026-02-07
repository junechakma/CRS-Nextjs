"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { TeacherAnalyticsData } from "@/lib/supabase/queries/teacher"
import {
  TrendingUp,
  MessageSquare,
  BookOpen,
  Star,
  ChevronRight,
  Clock,
  Timer,
  BarChart3,
  Inbox,
} from "lucide-react"

interface AnalyticsClientProps {
  data: TeacherAnalyticsData
}

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

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const router = useRouter()
  const { stats, courseStats, recentSessions, monthlyTrends } = data

  const maxResponses = monthlyTrends.length > 0
    ? Math.max(...monthlyTrends.map(m => m.responses))
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Responses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-indigo-50">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalResponses.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Responses</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-900">{stats.avgRating.toFixed(1)}</p>
            <span className="text-sm text-slate-500">/ 5.0</span>
          </div>
          <p className="text-sm text-slate-500">Avg. Satisfaction</p>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(stats.avgRating)
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
          <p className="text-3xl font-bold text-slate-900">{formatDuration(stats.avgCompletionTime)}</p>
          <p className="text-sm text-slate-500">Avg. Completion Time</p>
          <p className="text-xs text-slate-400 mt-1">Per feedback session</p>
        </div>

        {/* Sessions Stats */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-violet-50">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            {stats.liveSessions > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                {stats.liveSessions} live
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalSessions}</p>
          <p className="text-sm text-slate-500">Total Sessions</p>
          <p className="text-xs text-slate-400 mt-1">
            {stats.completedSessions} completed · {stats.scheduledSessions} scheduled
          </p>
        </div>
      </div>

      {/* Course Performance - Full Width */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-xl">
              <BookOpen className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Course Performance</h3>
              <p className="text-sm text-slate-500">
                {courseStats.length > 0
                  ? `Ratings and responses across ${courseStats.length} courses`
                  : "No active courses yet"}
              </p>
            </div>
          </div>
          {courseStats.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              onClick={() => router.push("/teacher/courses")}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>

        {courseStats.length > 0 ? (
          <div className="space-y-3">
            {courseStats.map((course) => {
              const colors = colorClasses[course.color] || colorClasses.indigo
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-slate-50"
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
                    </div>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${colors.bg}`}
                        style={{ width: `${(course.avgRating / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-3 bg-slate-100 rounded-xl mb-3">
              <BookOpen className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No courses yet</p>
            <p className="text-xs text-slate-400 mt-1">Create a course to start tracking performance</p>
          </div>
        )}
      </div>

      {/* Bottom Row: Response Trends (2/3) + Recent Sessions (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Response Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Response Trends</h3>
                <p className="text-sm text-slate-500">Monthly responses over the past 6 months</p>
              </div>
            </div>
          </div>

          {monthlyTrends.length > 0 ? (
            <>
              <div className="flex items-end gap-3 h-40 mb-4">
                {monthlyTrends.map((month) => {
                  const height = maxResponses > 0
                    ? (month.responses / maxResponses) * 100
                    : 0
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center">
                        <span className="text-xs font-medium text-slate-600 mb-1">{month.responses}</span>
                        <div
                          className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all hover:from-indigo-600 hover:to-violet-600"
                          style={{ height: `${Math.max(height, 4)}%`, minHeight: '8px' }}
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
                    <span className="text-lg font-bold text-slate-900">{stats.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-slate-100 rounded-xl mb-3">
                <BarChart3 className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No response data yet</p>
              <p className="text-xs text-slate-400 mt-1">Trends will appear after sessions are completed</p>
            </div>
          )}
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
            {recentSessions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 -mr-2"
                onClick={() => router.push("/teacher/sessions")}
              >
                View All
              </Button>
            )}
          </div>

          {recentSessions.length > 0 ? (
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const colors = colorClasses[session.courseColor] || colorClasses.indigo
                return (
                  <div
                    key={session.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
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
                          <span className="text-sm font-medium text-slate-900">{session.avgRating.toFixed(1)}</span>
                        </div>
                        {session.completedAt && (
                          <span className="text-xs text-slate-500">{session.completedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 bg-slate-100 rounded-xl mb-3">
                <Inbox className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No completed sessions yet</p>
              <p className="text-xs text-slate-400 mt-1">Sessions will appear here once completed</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
