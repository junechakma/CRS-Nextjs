"use client"

import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, BookOpen, BarChart3, TrendingUp } from "lucide-react"

// Mock data for demonstration
const stats = [
  {
    title: "Total Teachers",
    value: "156",
    change: "+12%",
    trend: "up",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Sessions",
    value: "43",
    change: "+8%",
    trend: "up",
    icon: BarChart3,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Question Bank",
    value: "892",
    change: "+24",
    trend: "up",
    icon: BookOpen,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Total Responses",
    value: "12.4K",
    change: "+18%",
    trend: "up",
    icon: TrendingUp,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
]

const recentTeachers = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@example.com",
    institution: "MIT",
    courses: 5,
    sessions: 12,
    status: "active",
    joinedDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Prof. Michael Chen",
    email: "m.chen@example.com",
    institution: "Stanford University",
    courses: 3,
    sessions: 8,
    status: "active",
    joinedDate: "2025-01-14",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    email: "e.rodriguez@example.com",
    institution: "Harvard University",
    courses: 4,
    sessions: 15,
    status: "active",
    joinedDate: "2025-01-12",
  },
  {
    id: 4,
    name: "Prof. James Williams",
    email: "j.williams@example.com",
    institution: "UC Berkeley",
    courses: 2,
    sessions: 6,
    status: "active",
    joinedDate: "2025-01-10",
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    email: "a.patel@example.com",
    institution: "Oxford University",
    courses: 6,
    sessions: 20,
    status: "active",
    joinedDate: "2025-01-08",
  },
]

export default function SuperAdminDashboard() {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="super-admin" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <Header userName="Admin User" userEmail="admin@crs.com" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back! Here's what's happening in your system.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Teachers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Teachers</CardTitle>
              <CardDescription>
                Recently registered teachers and their activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Institution</TableHead>
                      <TableHead className="hidden sm:table-cell">Email</TableHead>
                      <TableHead className="text-center">Courses</TableHead>
                      <TableHead className="text-center hidden lg:table-cell">Sessions</TableHead>
                      <TableHead className="hidden sm:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTeachers.map((teacher) => (
                      <TableRow key={teacher.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium text-gray-900">
                              {teacher.name}
                            </div>
                            <div className="text-sm text-gray-500 md:hidden">
                              {teacher.institution}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {teacher.institution}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-gray-600">
                          {teacher.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{teacher.courses}</Badge>
                        </TableCell>
                        <TableCell className="text-center hidden lg:table-cell">
                          <Badge variant="outline">{teacher.sessions}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="success">
                            {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600">
                          {new Date(teacher.joinedDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
