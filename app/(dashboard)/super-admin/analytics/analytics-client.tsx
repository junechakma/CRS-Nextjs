"use client"

import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Download,
  ArrowUpRight,
  Star,
  DollarSign,
  UserPlus,
  BookOpen,
  ChevronRight,
  Sparkles,
  Crown,
  Zap,
  Activity,
  Brain,
} from "lucide-react"
import { SuperAdminAnalyticsData } from "@/lib/supabase/queries"

interface AnalyticsClientProps {
  data: SuperAdminAnalyticsData
}

export default function AnalyticsClient({ data }: AnalyticsClientProps) {
  const router = useRouter()
  const { systemStats, planDistribution, monthlyTrends, topTeachers, recentActivity, platformSentiment } = data

  const maxResponses = Math.max(...monthlyTrends.map((d) => d.responses), 1)

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "session_created": return Calendar
      case "responses_received": return MessageSquare
      case "user_registered":
      case "user_created_by_admin": return UserPlus
      case "session_completed": return BookOpen
      case "plan_upgraded": return Crown
      case "ai_insights_generated": return Brain
      case "user_updated":
      case "user_deleted": return Users
      default: return Activity
    }
  }

  const getActivityColor = (action: string) => {
    switch (action) {
      case "session_created": return "bg-blue-100 text-blue-600"
      case "responses_received": return "bg-emerald-100 text-emerald-600"
      case "user_registered":
      case "user_created_by_admin": return "bg-violet-100 text-violet-600"
      case "session_completed": return "bg-indigo-100 text-indigo-600"
      case "plan_upgraded": return "bg-amber-100 text-amber-600"
      case "ai_insights_generated": return "bg-pink-100 text-pink-600"
      case "user_updated": return "bg-blue-100 text-blue-600"
      case "user_deleted": return "bg-red-100 text-red-600"
      default: return "bg-slate-100 text-slate-600"
    }
  }

  const getActivityText = (activity: typeof recentActivity[0]) => {
    const metadata = activity.metadata || {}
    switch (activity.action) {
      case "session_created": return `Created session "${metadata.sessionName || 'New Session'}"`
      case "responses_received": return `Received ${metadata.count || 0} new responses`
      case "user_registered": return `New teacher from ${metadata.institution || 'Unknown'}`
      case "user_created_by_admin": return `Account created by admin`
      case "session_completed": return `Session completed with ${metadata.responses || 0} responses`
      case "plan_upgraded": return `Upgraded from ${metadata.from || 'free'} to ${metadata.to || 'premium'}`
      case "ai_insights_generated": return `Generated AI insights for ${metadata.course || 'course'}`
      case "user_updated": return `Profile updated`
      case "user_deleted": return `Account deleted`
      case "base_template_updated": return `Base template updated`
      default: return activity.action.replace(/_/g, ' ')
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="w-4 h-4" />
          Last 6 months
        </Button>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
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
              Active
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{systemStats.totalResponses.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Total Responses</p>
          <p className="text-xs text-slate-400 mt-1">Across all teachers</p>
        </div>

        {/* Active Teachers */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            {systemStats.newTeachersWeek > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                +{systemStats.newTeachersWeek} this week
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-slate-900">{systemStats.totalTeachers}</p>
          <p className="text-sm text-slate-500">Total Teachers</p>
          <p className="text-xs text-slate-400 mt-1">{systemStats.activeTeachers} active</p>
        </div>

        {/* Platform Rating */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-50">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            {systemStats.platformAvgRating > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                Rating
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-3xl font-bold text-slate-900">{systemStats.platformAvgRating.toFixed(1)}</p>
            <span className="text-sm text-slate-500">/ 5.0</span>
          </div>
          <p className="text-sm text-slate-500">Platform Avg Rating</p>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(systemStats.platformAvgRating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-violet-50">
              <DollarSign className="w-5 h-5 text-violet-600" />
            </div>
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <Crown className="w-3 h-3" />
              {systemStats.premiumUsers} premium
            </span>
          </div>
          <p className="text-3xl font-bold text-slate-900">${systemStats.estimatedMrr.toLocaleString()}</p>
          <p className="text-sm text-slate-500">Estimated MRR</p>
          <p className="text-xs text-slate-400 mt-1">{systemStats.customUsers} custom plans</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Trends Chart */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Response Trends</h3>
                  <p className="text-sm text-slate-500">Monthly response collection across platform</p>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Last 6 months</Badge>
            </div>

            {/* Bar chart */}
            {monthlyTrends.length > 0 ? (
              <>
                <div className="flex items-end gap-4 h-48 mb-4">
                  {monthlyTrends.map((data) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-slate-600">{data.responses.toLocaleString()}</span>
                      <div
                        className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-teal-500 cursor-pointer"
                        style={{ height: `${(data.responses / maxResponses) * 140}px`, minHeight: '4px' }}
                      />
                      <span className="text-sm text-slate-500">{data.month}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {monthlyTrends.reduce((sum, m) => sum + m.responses, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Total Responses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {monthlyTrends.reduce((sum, m) => sum + m.sessions, 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">Sessions Created</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{systemStats.activeSessions}</p>
                    <p className="text-xs text-slate-500">Currently Active</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48 text-slate-400">
                No trend data available yet
              </div>
            )}
          </div>

          {/* Top Performing Teachers */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-50 rounded-xl">
                  <Users className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Top Performing Teachers</h3>
                  <p className="text-sm text-slate-500">Ranked by total responses collected</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                onClick={() => router.push("/super-admin/users")}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {topTeachers.length > 0 ? (
              <div className="space-y-3">
                {topTeachers.map((teacher, idx) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/super-admin/users?search=${encodeURIComponent(teacher.email)}`)}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      idx === 0 ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                      idx === 1 ? "bg-gradient-to-br from-slate-400 to-slate-500" :
                      idx === 2 ? "bg-gradient-to-br from-amber-600 to-amber-800" :
                      "bg-gradient-to-br from-slate-300 to-slate-400"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-slate-900 truncate">{teacher.name}</h4>
                        {teacher.plan === "premium" && (
                          <Badge className="bg-violet-100 text-violet-700 text-xs">Premium</Badge>
                        )}
                        {teacher.plan === "custom" && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs">Custom</Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{teacher.institution || 'No institution'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-slate-900">{teacher.totalResponses.toLocaleString()}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm text-slate-500">{teacher.avgRating.toFixed(1)}</span>
                        <span className="text-slate-300 mx-1">·</span>
                        <span className="text-sm text-slate-500">{teacher.totalSessions} sessions</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400">
                No teacher data available yet
              </div>
            )}
          </div>

          {/* Platform Sentiment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Brain className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Platform-Wide Sentiment</h3>
                  <p className="text-sm text-slate-500">AI-analyzed feedback across all courses</p>
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
                <p className="text-3xl font-bold text-emerald-700">{platformSentiment.positive}%</p>
                <p className="text-sm text-emerald-600 font-medium">Positive</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-2" />
                <p className="text-3xl font-bold text-amber-700">{platformSentiment.neutral}%</p>
                <p className="text-sm text-amber-600 font-medium">Neutral</p>
              </div>
              <div className="text-center p-4 rounded-2xl bg-red-50 border border-red-100">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2" />
                <p className="text-3xl font-bold text-red-700">{platformSentiment.negative}%</p>
                <p className="text-sm text-red-600 font-medium">Negative</p>
              </div>
            </div>

            <div className="h-4 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500" style={{ width: `${platformSentiment.positive}%` }} />
              <div className="bg-amber-500" style={{ width: `${platformSentiment.neutral}%` }} />
              <div className="bg-red-500" style={{ width: `${platformSentiment.negative}%` }} />
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Plan Distribution */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-violet-50 rounded-xl">
                <Crown className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Plan Distribution</h3>
                <p className="text-sm text-slate-500">{systemStats.totalTeachers} total users</p>
              </div>
            </div>

            <div className="space-y-4">
              {planDistribution.map((plan) => (
                <div key={plan.plan}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{plan.plan}</span>
                    <span className="text-sm text-slate-500">{plan.count} users ({plan.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${plan.color}`} style={{ width: `${plan.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Conversion Rate</span>
                <span className="text-lg font-bold text-emerald-600">
                  {systemStats.totalTeachers > 0
                    ? ((systemStats.premiumUsers + systemStats.customUsers) / systemStats.totalTeachers * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900">Recent Activity</h3>
              </div>
            </div>

            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.action)
                  return (
                    <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className={`p-2 rounded-lg ${getActivityColor(activity.action)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{activity.userName}</p>
                        <p className="text-xs text-slate-500 truncate">{getActivityText(activity)}</p>
                      </div>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{activity.time}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-slate-400">
                No recent activity
              </div>
            )}

            <Button variant="outline" className="w-full mt-4" onClick={() => router.push("/super-admin")}>
              View All Activity
            </Button>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5" />
              <h3 className="font-bold">System Status</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-emerald-100">Active Sessions</span>
                <span className="font-bold">{systemStats.activeSessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100">Total Courses</span>
                <span className="font-bold">{systemStats.totalCourses}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100">Completed Sessions</span>
                <span className="font-bold">{systemStats.completedSessions.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-emerald-100">This Month</span>
                <span className="font-bold">
                  +{monthlyTrends.length > 0
                    ? monthlyTrends[monthlyTrends.length - 1].responses.toLocaleString()
                    : 0} responses
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
