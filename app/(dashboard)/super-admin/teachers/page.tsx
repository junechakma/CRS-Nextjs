"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
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
import { Spotlight } from "@/components/ui/spotlight"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Building,
  Edit,
  Trash2,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const allTeachers = [
  { id: 1, name: "Dr. Sarah Johnson", email: "sarah.johnson@example.com", institution: "MIT", department: "Computer Science", courses: 5, sessions: 12, status: "active", joinedDate: "2025-01-15" },
  { id: 2, name: "Prof. Michael Chen", email: "m.chen@example.com", institution: "Stanford University", department: "Engineering", courses: 3, sessions: 8, status: "active", joinedDate: "2025-01-14" },
  { id: 3, name: "Dr. Emily Rodriguez", email: "e.rodriguez@example.com", institution: "Harvard University", department: "Mathematics", courses: 4, sessions: 15, status: "active", joinedDate: "2025-01-12" },
  { id: 4, name: "Prof. James Williams", email: "j.williams@example.com", institution: "UC Berkeley", department: "Physics", courses: 2, sessions: 6, status: "inactive", joinedDate: "2025-01-10" },
  { id: 5, name: "Dr. Aisha Patel", email: "a.patel@example.com", institution: "Oxford University", department: "Chemistry", courses: 6, sessions: 20, status: "active", joinedDate: "2025-01-08" },
  { id: 6, name: "Prof. David Kim", email: "d.kim@example.com", institution: "Yale University", department: "Biology", courses: 4, sessions: 10, status: "active", joinedDate: "2025-01-05" },
  { id: 7, name: "Dr. Lisa Thompson", email: "l.thompson@example.com", institution: "Princeton University", department: "Economics", courses: 3, sessions: 9, status: "pending", joinedDate: "2025-01-03" },
  { id: 8, name: "Prof. Robert Garcia", email: "r.garcia@example.com", institution: "Columbia University", department: "Psychology", courses: 5, sessions: 14, status: "active", joinedDate: "2024-12-28" },
]

const statusColors = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
}

const avatarGradients = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500",
]

export default function TeachersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredTeachers = allTeachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.institution.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 bg-grid-small [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#3b82f6" />

      <Sidebar role="super-admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header userName="Admin User" userEmail="admin@crs.com" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Teachers</h1>
              </div>
              <p className="text-slate-500 text-sm">Manage all registered teachers</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Teacher</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-input">
              <p className="text-xs text-slate-500 mb-1">Total</p>
              <p className="text-2xl font-bold text-slate-900">{allTeachers.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-input">
              <p className="text-xs text-slate-500 mb-1">Active</p>
              <p className="text-2xl font-bold text-emerald-600">{allTeachers.filter((t) => t.status === "active").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-input">
              <p className="text-xs text-slate-500 mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{allTeachers.filter((t) => t.status === "pending").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-input">
              <p className="text-xs text-slate-500 mb-1">Inactive</p>
              <p className="text-2xl font-bold text-slate-500">{allTeachers.filter((t) => t.status === "inactive").length}</p>
            </div>
          </div>

          {/* Teachers Table */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                  {["all", "active", "pending", "inactive"].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        statusFilter === status
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold">Teacher</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Institution</TableHead>
                    <TableHead className="hidden lg:table-cell font-semibold">Department</TableHead>
                    <TableHead className="text-center font-semibold">Courses</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTeachers.map((teacher, idx) => (
                    <TableRow key={teacher.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border-2 border-white shadow-md">
                            <AvatarFallback className={`text-white font-semibold text-xs bg-gradient-to-br ${avatarGradients[idx % avatarGradients.length]}`}>
                              {teacher.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="font-medium text-slate-900 text-sm truncate">{teacher.name}</div>
                            <div className="text-xs text-slate-400 truncate flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {teacher.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Building className="h-3.5 w-3.5 text-slate-400" />
                          {teacher.institution}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-slate-600 text-sm">{teacher.department}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{teacher.courses}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[teacher.status as keyof typeof statusColors]}>
                          {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium">{filteredTeachers.length}</span> of <span className="font-medium">{allTeachers.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" className="h-8 px-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">1</Button>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
