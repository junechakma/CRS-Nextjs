"use client"

import { Bell, Menu } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  userName?: string
  userEmail?: string
  onMenuClick?: () => void
}

export function Header({ userName = "User", userEmail, onMenuClick }: HeaderProps) {
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left side - Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block" />

        {/* Right Section */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Notifications */}
          <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Info */}
          <div className="flex items-center gap-3 pl-3 sm:pl-4 border-l border-slate-200">
            {/* Avatar */}
            <Avatar className="h-9 w-9 border-2 border-white shadow-md">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            {/* Name & Email */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{userName}</p>
              {userEmail && (
                <p className="text-xs text-slate-500">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
