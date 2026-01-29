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
import { Button } from "@/components/ui/button"
import {
  GraduationCap,
  Calendar,
  MessageSquare,
  TrendingUp,
  Plus,
  Users,
  Clock,
} from "lucide-react"

// Mock data for demonstration
const stats = [
  {
    title: "Total Courses",
    value: "8",
    change: "+2 this semester",
    icon: GraduationCap,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    title: "Active Sessions",
    value: "12",
    change: "3 ending today",
    icon: Calendar,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    title: "Total Responses",
    value: "1,284",
    change: "+142 this week",
    icon: MessageSquare,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    title: "Avg Response Rate",
    value: "87%",
    change: "+5% from last month",
    icon: TrendingUp,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
  },
]

const activeSessions = [
  {
    id: 1,
    course: "Data Structures",
    code: "CS201",
    sessionName: "Mid-Semester Feedback",
    responses: 45,
    total: 52,
    status: "active",
    endDate: "2025-01-30",
    accessCode: "DS2025",
  },
  {
    id: 2,
    course: "Algorithms",
    code: "CS301",
    sessionName: "Course Evaluation",
    responses: 38,
    total: 48,
    status: "active",
    endDate: "2025-01-29",
    accessCode: "AL2025",
  },
  {
    id: 3,
    course: "Database Systems",
    code: "CS305",
    sessionName: "Weekly Feedback",
    responses: 62,
    total: 65,
    status: "active",
    endDate: "2025-02-01",
    accessCode: "DB2025",
  },
  {
    id: 4,
    course: "Software Engineering",
    code: "CS401",
    sessionName: "Project Feedback",
    responses: 28,
    total: 40,
    status: "ending",
    endDate: "2025-01-29",
    accessCode: "SE2025",
  },
]

const recentCourses = [
  {
    id: 1,
    name: "Data Structures",
    code: "CS201",
    semester: "Spring 2025",
    students: 52,
    sessions: 5,
    avgRating: 4.5,
  },
  {
    id: 2,
    name: "Algorithms",
    code: "CS301",
    semester: "Spring 2025",
    students: 48,
    sessions: 4,
    avgRating: 4.7,
  },
  {
    id: 3,
    name: "Database Systems",
    code: "CS305",
    semester: "Spring 2025",
    students: 65,
    sessions: 6,
    avgRating: 4.3,
  },
]

export default function TeacherDashboard() {
  const responseRate = (responses: number, total: number) => {
    return Math.round((responses / total) * 100)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <Sidebar role="teacher" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        {/* Header */}
        <Header userName="Dr. Sarah Johnson" userEmail="sarah.j@university.edu" />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage your courses and track student feedback
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                New Session
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Course
              </Button>
            </div>
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
                      <p className="text-sm text-gray-500 mt-2">
                        {stat.change}
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

          {/* Active Sessions */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Sessions</CardTitle>
                  <CardDescription>
                    Currently running feedback sessions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead className="hidden md:table-cell">Session Name</TableHead>
                      <TableHead className="text-center">Responses</TableHead>
                      <TableHead className="text-center hidden sm:table-cell">Rate</TableHead>
                      <TableHead className="hidden lg:table-cell">Access Code</TableHead>
                      <TableHead className="hidden lg:table-cell">Ends</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium text-gray-900">
                              {session.course}
                            </div>
                            <div className="text-sm text-gray-500">
                              {session.code}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {session.sessionName}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{session.responses}/{session.total}</span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {responseRate(session.responses, session.total)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center hidden sm:table-cell">
                          <Badge variant="secondary">
                            {responseRate(session.responses, session.total)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {session.accessCode}
                          </code>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(session.endDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={session.status === "active" ? "success" : "warning"}
                          >
                            {session.status === "active" ? "Active" : "Ending Soon"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* My Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>
                    Spring 2025 semester courses
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{course.name}</CardTitle>
                          <CardDescription>{course.code}</CardDescription>
                        </div>
                        <Badge variant="outline">{course.semester}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Students
                          </span>
                          <span className="font-medium">{course.students}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Sessions
                          </span>
                          <span className="font-medium">{course.sessions}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Avg Rating
                          </span>
                          <span className="font-medium">{course.avgRating}/5.0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
