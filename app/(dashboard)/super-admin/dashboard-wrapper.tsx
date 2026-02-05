"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    UserPlus,
    Settings,
    Sparkles,
    Users,
    BookOpen,
    BarChart3,
    ArrowRight,
} from "lucide-react"

// Static header section that shows immediately
export function HeaderSection() {
    return (
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
    )
}

// Static quick actions that show immediately
export function QuickActionsSection() {
    return (
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
    )
}
