"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

const overviewStats = [
  { title: "Total Responses", value: "24,582", change: "+12.5%", trend: "up", icon: MessageSquare, color: "from-blue-500 to-cyan-500" },
  { title: "Active Teachers", value: "156", change: "+8.2%", trend: "up", icon: Users, color: "from-emerald-500 to-teal-500" },
  { title: "Avg Response Rate", value: "78.4%", change: "+3.1%", trend: "up", icon: TrendingUp, color: "from-violet-500 to-purple-500" },
  { title: "Active Sessions", value: "43", change: "-2.4%", trend: "down", icon: Calendar, color: "from-amber-500 to-orange-500" },
]

const monthlyData = [
  { month: "Aug", responses: 1850 },
  { month: "Sep", responses: 2340 },
  { month: "Oct", responses: 2890 },
  { month: "Nov", responses: 3200 },
  { month: "Dec", responses: 2100 },
  { month: "Jan", responses: 3580 },
]

const topTeachers = [
  { name: "Dr. Sarah Johnson", responses: 456, rate: 92 },
  { name: "Prof. Michael Chen", responses: 389, rate: 88 },
  { name: "Dr. Emily Rodriguez", responses: 345, rate: 85 },
  { name: "Prof. David Kim", responses: 312, rate: 82 },
  { name: "Dr. Lisa Thompson", responses: 287, rate: 79 },
]

const recentActivity = [
  { action: "New session created", teacher: "Dr. Sarah Johnson", time: "2 mins ago", type: "session" },
  { action: "Feedback collected", teacher: "Prof. Michael Chen", time: "15 mins ago", type: "feedback" },
  { action: "Teacher registered", teacher: "Dr. James Wilson", time: "1 hour ago", type: "user" },
  { action: "Session completed", teacher: "Dr. Emily Rodriguez", time: "2 hours ago", type: "session" },
  { action: "Report generated", teacher: "Prof. David Kim", time: "3 hours ago", type: "report" },
]

export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const maxResponses = Math.max(...monthlyData.map((d) => d.responses))

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 bg-grid-small [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#10b981" />

      <Sidebar role="super-admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header userName="Admin User" userEmail="admin@crs.com" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Analytics</h1>
              </div>
              <p className="text-slate-500 text-sm">System-wide insights and metrics</p>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {overviewStats.map((stat, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-input">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} shadow-sm`}>
                    <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>
                    {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-xs text-slate-500 mb-1">{stat.title}</p>
                <p className="text-xl sm:text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            {/* Chart */}
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Response Trends</h2>
                    <p className="text-sm text-slate-500">Monthly response collection</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700">Last 6 months</Badge>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-end justify-between gap-2 h-48">
                  {monthlyData.map((data, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">{data.responses.toLocaleString()}</span>
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg hover:from-emerald-600 hover:to-teal-500 transition-colors"
                        style={{ height: `${(data.responses / maxResponses) * 140}px` }}
                      />
                      <span className="text-xs text-slate-500">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Teachers */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Top Performers</h2>
                <p className="text-sm text-slate-500">By response rate</p>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {topTeachers.map((teacher, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{teacher.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full" style={{ width: `${teacher.rate}%` }} />
                        </div>
                        <span className="text-xs font-medium text-slate-600">{teacher.rate}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
              <p className="text-sm text-slate-500">Latest system events</p>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "session" ? "bg-blue-100 text-blue-600" :
                    activity.type === "feedback" ? "bg-emerald-100 text-emerald-600" :
                    activity.type === "user" ? "bg-violet-100 text-violet-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {activity.type === "session" ? <Calendar className="h-5 w-5" /> :
                     activity.type === "feedback" ? <MessageSquare className="h-5 w-5" /> :
                     activity.type === "user" ? <Users className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.teacher}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
