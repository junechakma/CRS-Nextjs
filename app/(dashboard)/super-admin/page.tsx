"use client"

import { useState } from "react"
import Link from "next/link"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  BookOpen,
  BarChart3,
  TrendingUp,
  ArrowRight,
  UserPlus,
  Settings,
  Sparkles,
  Crown,
  Zap,
  Building2,
  CreditCard,
  MessageSquare,
  Target,
  ChevronRight,
  Activity,
  DollarSign,
  Clock,
} from "lucide-react"

const stats = [
  {
    title: "Total Users",
    value: "156",
    change: "+12 this month",
    icon: Users,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    trend: "up",
  },
  {
    title: "Premium Users",
    value: "48",
    change: "31% of total",
    icon: Crown,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    trend: "up",
  },
  {
    title: "Active Sessions",
    value: "43",
    change: "+8 from last week",
    icon: Activity,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    trend: "up",
  },
  {
    title: "Monthly Revenue",
    value: "$720",
    change: "+$180 this month",
    icon: DollarSign,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    trend: "up",
  },
]

const planStats = [
  { plan: "Free", count: 98, percentage: 63, color: "bg-slate-500" },
  { plan: "Premium", count: 48, percentage: 31, color: "bg-indigo-500" },
  { plan: "Custom", count: 10, percentage: 6, color: "bg-violet-500" },
]

const recentUsers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    institution: "MIT",
    courses: 5,
    plan: "premium",
    status: "active",
    joinedDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    email: "m.chen@example.com",
    institution: "Stanford University",
    courses: 3,
    plan: "free",
    status: "active",
    joinedDate: "2025-01-14",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    email: "e.rodriguez@example.com",
    institution: "Harvard University",
    courses: 4,
    plan: "premium",
    status: "active",
    joinedDate: "2025-01-12",
  },
  {
    id: 4,
    name: "Prof. James Williams",
    email: "j.williams@example.com",
    institution: "UC Berkeley",
    courses: 2,
    plan: "free",
    status: "pending",
    joinedDate: "2025-01-10",
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    email: "a.patel@example.com",
    institution: "Oxford University",
    courses: 6,
    plan: "custom",
    status: "active",
    joinedDate: "2025-01-08",
  },
]

const recentActivity = [
  { type: "signup", user: "Dr. Lisa Thompson", time: "2 hours ago" },
  { type: "upgrade", user: "Prof. David Kim", plan: "Premium", time: "5 hours ago" },
  { type: "session", user: "Dr. Sarah Johnson", count: 3, time: "1 day ago" },
  { type: "signup", user: "Prof. Robert Garcia", time: "2 days ago" },
]

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
    case "pending":
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
          Pending
        </span>
      )
    default:
      return (
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
          Inactive
        </span>
      )
  }
}

export default function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      <Sidebar
        role="super-admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        <Header
          userName="Admin User"
          userEmail="admin@crs.com"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
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
                  Welcome back! Here's what's happening in your system.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
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
              {stats.map((stat, index) => (
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
                    <span className="text-lg font-bold text-slate-900">156</span>
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
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${
                        activity.type === "signup"
                          ? "bg-emerald-100 text-emerald-600"
                          : activity.type === "upgrade"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-blue-100 text-blue-600"
                      }`}>
                        {activity.type === "signup" ? (
                          <UserPlus className="w-4 h-4" />
                        ) : activity.type === "upgrade" ? (
                          <Crown className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">
                          {activity.type === "signup" && (
                            <><span className="font-medium">{activity.user}</span> signed up</>
                          )}
                          {activity.type === "upgrade" && (
                            <><span className="font-medium">{activity.user}</span> upgraded to <span className="font-medium text-indigo-600">{activity.plan}</span></>
                          )}
                          {activity.type === "session" && (
                            <><span className="font-medium">{activity.user}</span> created <span className="font-medium">{activity.count}</span> new sessions</>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                    </div>
                  ))}
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
                    {recentUsers.map((user, idx) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-md">
                              <AvatarFallback
                                className={`text-white font-semibold text-sm bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`}
                              >
                                {user.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-slate-600">{user.institution}</span>
                        </td>
                        <td className="p-4 text-center">
                          <Badge variant="secondary" className="font-medium">
                            {user.courses}
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
                    ))}
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
        </main>
      </div>
    </div>
  )
}
