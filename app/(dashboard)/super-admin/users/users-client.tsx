"use client"

import { useState, useRef, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Crown,
  Zap,
  Building2,
  MoreVertical,
  X,
  Save,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Calendar,
  BookOpen,
  MessageSquare,
  Loader2,
} from "lucide-react"
import { UserWithStats } from "@/lib/supabase/queries"
import { updateUser, deleteUser, createUserByAdmin } from "@/lib/supabase/actions"

interface UsersPageClientProps {
  initialUsers: UserWithStats[]
  totalCount: number
  currentPage: number
  totalPages: number
  pageSize: number
  initialSearch: string
  initialStatus: string
  initialPlan: string
}

const avatarGradients = [
  "from-indigo-500 to-violet-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
]

export default function UsersPageClient({
  initialUsers,
  totalCount,
  currentPage,
  totalPages,
  pageSize,
  initialSearch,
  initialStatus,
  initialPlan,
}: UsersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [statusFilter, setStatusFilter] = useState(initialStatus)
  const [planFilter, setPlanFilter] = useState(initialPlan)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<UserWithStats | null>(null)
  const [viewingUser, setViewingUser] = useState<UserWithStats | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const router = useRouter()
  const searchParams = useSearchParams()

  // Form state for editing
  const [formPlan, setFormPlan] = useState<"free" | "premium" | "custom">("free")
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active")

  // Form state for adding new user
  const [newUserName, setNewUserName] = useState("")
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserInstitution, setNewUserInstitution] = useState("")
  const [newUserDepartment, setNewUserDepartment] = useState("")
  const [newUserPlan, setNewUserPlan] = useState<"free" | "premium" | "custom">("free")

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update URL with filters (debounced for search)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams()
      if (searchQuery) params.set('search', searchQuery)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (planFilter !== 'all') params.set('plan', planFilter)
      params.set('page', '1') // Reset to page 1 on filter change

      startTransition(() => {
        router.push(`/super-admin/users?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timeout)
  }, [searchQuery, statusFilter, planFilter, router])

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())

    startTransition(() => {
      router.push(`/super-admin/users?${params.toString()}`)
    })
  }

  const stats = {
    total: totalCount,
    active: initialUsers.filter((u) => u.status === "active").length,
    inactive: initialUsers.filter((u) => u.status !== "active").length,
    premium: initialUsers.filter((u) => u.plan === "premium").length,
    custom: initialUsers.filter((u) => u.plan === "custom").length,
    free: initialUsers.filter((u) => u.plan === "free").length,
  }

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
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Active
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 gap-1">
            <XCircle className="w-3 h-3" />
            Inactive
          </Badge>
        )
    }
  }

  const handleEdit = (user: UserWithStats) => {
    setEditingUser(user)
    setFormPlan(user.plan)
    setFormStatus(user.status === 'banned' ? 'inactive' : user.status)
    setOpenDropdown(null)
  }

  const handleSaveEdit = async () => {
    if (!editingUser) return

    startTransition(async () => {
      const result = await updateUser(editingUser.id, {
        plan: formPlan,
        status: formStatus,
      })

      if (result.success) {
        setEditingUser(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to update user')
      }
    })
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    startTransition(async () => {
      const result = await deleteUser(userId)

      if (result.success) {
        setOpenDropdown(null)
        router.refresh()
      } else {
        alert(result.error || 'Failed to delete user')
      }
    })
  }

  const handleView = (user: UserWithStats) => {
    setViewingUser(user)
    setOpenDropdown(null)
  }

  const handleAddUser = async () => {
    if (!newUserName || !newUserEmail) return

    startTransition(async () => {
      const result = await createUserByAdmin({
        email: newUserEmail,
        name: newUserName,
        institution: newUserInstitution || undefined,
        department: newUserDepartment || undefined,
        plan: newUserPlan,
      })

      if (result.success) {
        setIsAddModalOpen(false)
        resetAddForm()
        router.refresh()
      } else {
        alert(result.error || 'Failed to create user')
      }
    })
  }

  const resetAddForm = () => {
    setNewUserName("")
    setNewUserEmail("")
    setNewUserInstitution("")
    setNewUserDepartment("")
    setNewUserPlan("free")
  }

  return (
    <>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Users Management
                  </h1>
                  {isPending && (
                    <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                  )}
                </div>
                <p className="text-slate-500">
                  Manage users, subscriptions and account status
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsAddModalOpen(true)}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
                >
                  <UserPlus className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Total</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-slate-500">Active</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Inactive</span>
                </div>
                <p className="text-2xl font-bold text-slate-600">{stats.inactive}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-500">Free</span>
                </div>
                <p className="text-2xl font-bold text-slate-600">{stats.free}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs text-slate-500">Premium</span>
                </div>
                <p className="text-2xl font-bold text-indigo-600">{stats.premium}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-slate-500">Custom</span>
                </div>
                <p className="text-2xl font-bold text-violet-600">{stats.custom}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {/* Status Filter */}
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    {["all", "active", "inactive"].map((status) => (
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

                  {/* Plan Filter */}
                  <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                    {["all", "free", "premium", "custom"].map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setPlanFilter(plan)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
                          planFilter === plan
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        {plan === "premium" && <Crown className="w-3 h-3" />}
                        {plan === "custom" && <Building2 className="w-3 h-3" />}
                        {plan === "free" && <Zap className="w-3 h-3" />}
                        {plan.charAt(0).toUpperCase() + plan.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="relative w-full lg:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                      <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Institution</th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">Courses</th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-600">Plan</th>
                      <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Status</th>
                      <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {initialUsers.length > 0 ? (
                      initialUsers.map((user, idx) => (
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
                                <p className="font-medium text-slate-900 text-sm">{user.name || 'Unnamed'}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              {user.institution || 'Not specified'}
                            </div>
                            <p className="text-xs text-slate-400 ml-5">{user.department || ''}</p>
                          </td>
                          <td className="p-4 text-center hidden lg:table-cell">
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
                            <div className="relative" ref={openDropdown === user.id ? dropdownRef : null}>
                              <button
                                onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <MoreVertical className="w-4 h-4 text-slate-400" />
                              </button>

                              {openDropdown === user.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                  <button
                                    onClick={() => handleView(user)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Eye className="w-4 h-4 text-slate-400" />
                                    View Details
                                  </button>
                                  <button
                                    onClick={() => handleEdit(user)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Edit className="w-4 h-4 text-slate-400" />
                                    Edit User
                                  </button>
                                  <div className="border-t border-slate-100 my-1" />
                                  <button
                                    onClick={() => handleDelete(user.id)}
                                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete User
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500">No users found</p>
                          <p className="text-sm text-slate-400">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                  <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
                  <span className="font-medium">{totalCount}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage === 1 || isPending}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={currentPage === pageNum ? "default" : "outline"}
                        className={`h-8 px-3 ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-0"
                            : ""
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isPending}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={currentPage === totalPages || isPending}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsAddModalOpen(false)
              resetAddForm()
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Add New User</h2>
                      <p className="text-sm text-slate-500">Create a new user account</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false)
                      resetAddForm()
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Dr. John Doe"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="john.doe@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Institution
                  </label>
                  <input
                    type="text"
                    value={newUserInstitution}
                    onChange={(e) => setNewUserInstitution(e.target.value)}
                    placeholder="MIT"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subscription Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['free', 'premium', 'custom'] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setNewUserPlan(plan)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          newUserPlan === plan
                            ? plan === 'free'
                              ? 'border-slate-400 bg-slate-50'
                              : plan === 'premium'
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-violet-400 bg-violet-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {plan === 'free' && <Zap className={`w-5 h-5 mx-auto mb-1 ${newUserPlan === plan ? 'text-slate-600' : 'text-slate-400'}`} />}
                        {plan === 'premium' && <Crown className={`w-5 h-5 mx-auto mb-1 ${newUserPlan === plan ? 'text-indigo-600' : 'text-slate-400'}`} />}
                        {plan === 'custom' && <Building2 className={`w-5 h-5 mx-auto mb-1 ${newUserPlan === plan ? 'text-violet-600' : 'text-slate-400'}`} />}
                        <span className={`text-sm font-medium capitalize ${newUserPlan === plan ? (plan === 'free' ? 'text-slate-900' : plan === 'premium' ? 'text-indigo-700' : 'text-violet-700') : 'text-slate-600'}`}>
                          {plan}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setIsAddModalOpen(false)
                  resetAddForm()
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddUser}
                  disabled={!newUserName || !newUserEmail || isPending}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Add User
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditingUser(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Edit className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Edit User</h2>
                      <p className="text-sm text-slate-500">Update subscription and status</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md">
                    <AvatarFallback className="text-white font-semibold bg-gradient-to-br from-indigo-500 to-violet-500">
                      {editingUser.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">{editingUser.name}</p>
                    <p className="text-sm text-slate-500">{editingUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subscription Plan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['free', 'premium', 'custom'] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setFormPlan(plan)}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          formPlan === plan
                            ? plan === 'free'
                              ? 'border-slate-400 bg-slate-50'
                              : plan === 'premium'
                              ? 'border-indigo-400 bg-indigo-50'
                              : 'border-violet-400 bg-violet-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {plan === 'free' && <Zap className={`w-5 h-5 mx-auto mb-1 ${formPlan === plan ? 'text-slate-600' : 'text-slate-400'}`} />}
                        {plan === 'premium' && <Crown className={`w-5 h-5 mx-auto mb-1 ${formPlan === plan ? 'text-indigo-600' : 'text-slate-400'}`} />}
                        {plan === 'custom' && <Building2 className={`w-5 h-5 mx-auto mb-1 ${formPlan === plan ? 'text-violet-600' : 'text-slate-400'}`} />}
                        <span className={`text-sm font-medium capitalize ${formPlan === plan ? (plan === 'free' ? 'text-slate-900' : plan === 'premium' ? 'text-indigo-700' : 'text-violet-700') : 'text-slate-600'}`}>
                          {plan}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Account Status
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFormStatus("active")}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formStatus === "active"
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-slate-200 hover:border-emerald-200"
                      }`}
                    >
                      <CheckCircle2 className={`w-5 h-5 mx-auto mb-1 ${formStatus === "active" ? "text-emerald-600" : "text-slate-400"}`} />
                      <span className={`text-sm font-medium ${formStatus === "active" ? "text-emerald-700" : "text-slate-600"}`}>
                        Active
                      </span>
                    </button>
                    <button
                      onClick={() => setFormStatus("inactive")}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formStatus === "inactive"
                          ? "border-slate-400 bg-slate-100"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <XCircle className={`w-5 h-5 mx-auto mb-1 ${formStatus === "inactive" ? "text-slate-600" : "text-slate-400"}`} />
                      <span className={`text-sm font-medium ${formStatus === "inactive" ? "text-slate-700" : "text-slate-600"}`}>
                        Inactive
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setEditingUser(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isPending}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* View User Modal */}
      {viewingUser && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setViewingUser(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                      <AvatarFallback className="text-white font-bold text-lg bg-gradient-to-br from-indigo-500 to-violet-500">
                        {viewingUser.name?.split(" ").map((n) => n[0]).join("").substring(0, 2) || '??'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{viewingUser.name || 'Unnamed User'}</h2>
                      <p className="text-sm text-slate-500">{viewingUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingUser(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Subscription Plan</span>
                  {getPlanBadge(viewingUser.plan)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Account Status</span>
                  {getStatusBadge(viewingUser.status)}
                </div>
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{viewingUser.institution || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">{viewingUser.department || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">Joined {new Date(viewingUser.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <BookOpen className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">{viewingUser.courses_count}</p>
                    <p className="text-xs text-slate-500">Courses</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <MessageSquare className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-slate-900">{viewingUser.sessions_count}</p>
                    <p className="text-xs text-slate-500">Sessions</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => setViewingUser(null)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setViewingUser(null)
                    handleEdit(viewingUser)
                  }}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
