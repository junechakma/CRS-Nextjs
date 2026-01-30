"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Calendar,
  HelpCircle,
  CalendarDays,
  Target,
} from "lucide-react"

interface SidebarProps {
  role: "super-admin" | "teacher"
  isOpen?: boolean
  onClose?: () => void
}

const superAdminNavigation = [
  { name: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
  { name: "Teachers", href: "/super-admin/teachers", icon: Users },
  { name: "Question Bank", href: "/super-admin/question-bank", icon: BookOpen },
  { name: "Analytics", href: "/super-admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/super-admin/settings", icon: Settings },
]

const teacherNavigation = [
  { name: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { name: "Semesters", href: "/teacher/semesters", icon: CalendarDays },
  { name: "Courses", href: "/teacher/courses", icon: GraduationCap },
  { name: "Sessions", href: "/teacher/sessions", icon: Calendar },
  { name: "Questions", href: "/teacher/questions", icon: HelpCircle },
  { name: "CLO Mapping", href: "/teacher/clo-mapping", icon: Target },
  { name: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  { name: "Profile", href: "/teacher/profile", icon: Settings },
]

export function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const navigation = role === "super-admin" ? superAdminNavigation : teacherNavigation

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between gap-3 px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CRS</span>
            </div>
            <div>
              <span className="text-lg font-semibold text-slate-900">CRS</span>
              <p className="text-[10px] text-slate-400 -mt-0.5">Response System</p>
            </div>
          </div>

          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Role Badge */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 rounded-lg">
            <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50" />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {role === "super-admin" ? "Super Admin" : "Teacher"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
