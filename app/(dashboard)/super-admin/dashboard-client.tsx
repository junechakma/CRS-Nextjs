"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  BookOpen,
  BarChart3,
  ArrowRight,
  UserPlus,
  Settings,
  Sparkles,
  Crown,
  Zap,
  Building2,
  CreditCard,
  MessageSquare,
  ChevronRight,
  Activity,
  Clock,
} from "lucide-react"
import { DashboardStats, UserWithStats, RecentActivity } from "@/lib/supabase/queries"

interface SuperAdminDashboardClientProps {
  stats: DashboardStats
  recentUsers: UserWithStats[]
  recentActivity: RecentActivity[]
  section?: string
}

const avatarGradients = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
]

const getPlanBadge = (plan: string) => {
  switch (plan) {
    case "premium":
      return (
        <Badge className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-500 hover:to-violet-500 gap-1">
          <Crown className="w-3 h-3" />
          Premium
        </Badge>
      )
    case "custom":
      return (
        <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white hover:from-violet-500 hover:to-purple-500 gap-1">
          <Building2 className="w-3 h-3" />
          Custom
        </Badge>
      )
    default:
      return (
        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 gap-1">
          <Zap className="w-3 h-3" />
          Free
        </Badge>
      )
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "active":
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          Active
        </span>
      )
    case "inactive":
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Inactive
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          {status}
        </span>
      )
  }
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}

export default function SuperAdminDashboardClient({
  stats,
  recentUsers,
  recentActivity,
  section,
}: SuperAdminDashboardClientProps) {
  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toString(),
      change: `+${stats.monthlyNewUsers} this month`,
      icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Premium Users",
      value: stats.premiumUsers.toString(),
      change: `${stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0}% of total`,
      icon: Crown,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Active Sessions",
      value: stats.activeSessions.toString(),
      change: "Live now",
      icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses.toString(),
      change: `${stats.totalResponses} responses`,
      icon: BookOpen,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ]

  const planStats = [
    { plan: "Free", count: stats.freeUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.freeUsers / stats.totalUsers) * 100) : 0, color: "bg-slate-500" },
    { plan: "Premium", count: stats.premiumUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.premiumUsers / stats.totalUsers) * 100) : 0, color: "bg-indigo-500" },
    { plan: "Custom", count: stats.customUsers, percentage: stats.totalUsers > 0 ? Math.round((stats.customUsers / stats.totalUsers) * 100) : 0, color: "bg-violet-500" },
  ]

  // If section is specified, render only that section
  if (section === "stats") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="gradient-border-card card-hover-lift group">
            <div className="card-inner p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-emerald-600 bg-emerald-50">
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
    )
  }

  if (section === "plan-distribution") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50">
              <CreditCard className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Plan Distribution</h3>
          </div>
        </div>

        <div className="space-y-4">
          {planStats.map((plan, index) => (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${plan.color}`} />
                  <span className="text-sm font-medium text-slate-700">{plan.plan}</span>
                </div>
                <span className="text-sm text-slate-600">
                  {plan.count} users ({plan.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${plan.color} rounded-full transition-all`}
                  style={{ width: `${plan.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Total Users</span>
            <span className="text-lg font-bold text-slate-900">{stats.totalUsers}</span>
          </div>
        </div>
      </div>
    )
  }

  if (section === "recent-activity") {
    return (
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-50">
              <Activity className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
          </div>
        </div>

        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${activity.action.includes("signup") || activity.action.includes("created")
                    ? "bg-emerald-100 text-emerald-600"
                    : activity.action.includes("upgrade")
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                  }`}>
                  {activity.action.includes("signup") || activity.action.includes("created") ? (
                    <UserPlus className="w-4 h-4" />
                  ) : activity.action.includes("upgrade") ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                    <MessageSquare className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">{activity.user_name || 'Unknown User'}</span>{' '}
                    {activity.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(activity.created_at)}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (section === "recent-users") {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Recent Users</h3>
                <p className="text-sm text-slate-500">Recently registered users and their plans</p>
              </div>
            </div>
            <Link href="/super-admin/users">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Institution</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Courses</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                          <AvatarFallback
                            className={`text-white font-semibold text-sm bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`}
                          >
                            {user.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{user.name || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{user.institution || 'Not specified'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="secondary" className="font-medium">
                        {user.courses_count}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      {getPlanBadge(user.plan)}
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/super-admin/users">
                        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-indigo-600">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Default: render full dashboard (for backward compatibility)
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-slate-500">
            Welcome back! Here&apos;s what&apos;s happening in your system.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <Link href="/super-admin/users">
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-200 transition-all border-0"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="gradient-border-card card-hover-lift group">
            <div className="card-inner p-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full text-emerald-600 bg-emerald-50">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-50">
                <CreditCard className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Plan Distribution</h3>
            </div>
          </div>

          <div className="space-y-4">
            {planStats.map((plan, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${plan.color}`} />
                    <span className="text-sm font-medium text-slate-700">{plan.plan}</span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {plan.count} users ({plan.percentage}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${plan.color} rounded-full transition-all`}
                    style={{ width: `${plan.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Total Users</span>
              <span className="text-lg font-bold text-slate-900">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-50">
                <Activity className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Recent Activity</h3>
            </div>
          </div>

          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${activity.action.includes("signup") || activity.action.includes("created")
                    ? "bg-emerald-100 text-emerald-600"
                    : activity.action.includes("upgrade")
                      ? "bg-amber-100 text-amber-600"
                      : "bg-blue-100 text-blue-600"
                    }`}>
                    {activity.action.includes("signup") || activity.action.includes("created") ? (
                      <UserPlus className="w-4 h-4" />
                    ) : activity.action.includes("upgrade") ? (
                      <Crown className="w-4 h-4" />
                    ) : (
                      <MessageSquare className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      <span className="font-medium">{activity.user_name || 'Unknown User'}</span>{' '}
                      {activity.action.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Recent Users</h3>
                <p className="text-sm text-slate-500">Recently registered users and their plans</p>
              </div>
            </div>
            <Link href="/super-admin/users">
              <Button variant="outline" size="sm" className="gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Institution</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Courses</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, idx) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                          <AvatarFallback
                            className={`text-white font-semibold text-sm bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`}
                          >
                            {user.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{user.name || 'Unnamed User'}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-slate-600">{user.institution || 'Not specified'}</span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="secondary" className="font-medium">
                        {user.courses_count}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      {getPlanBadge(user.plan)}
                    </td>
                    <td className="p-4 text-center hidden sm:table-cell">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Link href="/super-admin/users">
                        <Button variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-indigo-600">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/super-admin/users" className="block">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white hover:shadow-xl hover:shadow-indigo-200 transition-all cursor-pointer group">
            <Users className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-lg mb-1">Manage Users</h3>
            <p className="text-sm text-indigo-100">View and manage all users</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium">
              Go to Users
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/super-admin/question-bank" className="block">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white hover:shadow-xl hover:shadow-emerald-200 transition-all cursor-pointer group">
            <BookOpen className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-lg mb-1">Question Bank</h3>
            <p className="text-sm text-emerald-100">Manage base templates</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium">
              Go to Questions
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/super-admin/analytics" className="block">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white hover:shadow-xl hover:shadow-amber-200 transition-all cursor-pointer group">
            <BarChart3 className="w-8 h-8 mb-3 opacity-80" />
            <h3 className="font-semibold text-lg mb-1">Analytics</h3>
            <p className="text-sm text-amber-100">View system analytics</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-medium">
              View Analytics
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
