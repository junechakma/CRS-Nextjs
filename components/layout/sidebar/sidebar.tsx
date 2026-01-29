"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  MessageSquare,
  Calendar,
  HelpCircle,
} from "lucide-react"

interface SidebarProps {
  role: "super-admin" | "teacher"
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
  { name: "Courses", href: "/teacher/courses", icon: GraduationCap },
  { name: "Sessions", href: "/teacher/sessions", icon: Calendar },
  { name: "Questions", href: "/teacher/questions", icon: HelpCircle },
  { name: "Analytics", href: "/teacher/analytics", icon: BarChart3 },
  { name: "Profile", href: "/teacher/profile", icon: Settings },
]

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const navigation = role === "super-admin" ? superAdminNavigation : teacherNavigation

  return (
    <div className="flex h-full w-64 flex-col fixed inset-y-0 z-50 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200">
        <img src="/assets/logo.png" alt="CRS Logo" className="w-8 h-8 rounded-lg" />
        <span className="text-lg font-semibold text-gray-900">CRS</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-[#468cfe] text-white"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Role Badge */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs font-medium text-gray-600">
            {role === "super-admin" ? "Super Admin" : "Teacher"}
          </span>
        </div>
      </div>
    </div>
  )
}
