"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Users,
    UserPlus,
    Download,
    Search,
    CheckCircle2,
    XCircle,
    Zap,
    Crown,
    Building2,
    Loader2,
} from "lucide-react"

interface HeaderSectionProps {
    isPending?: boolean
    onAddUser: () => void
}

export function HeaderSection({ isPending, onAddUser }: HeaderSectionProps) {
    return (
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
                    onClick={onAddUser}
                    className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0"
                >
                    <UserPlus className="w-4 h-4" />
                    Add User
                </Button>
            </div>
        </div>
    )
}

interface StatsGridSectionProps {
    totalCount: number
    stats: {
        active: number
        inactive: number
        free: number
        premium: number
        custom: number
    }
}

export function StatsGridSection({ totalCount, stats }: StatsGridSectionProps) {
    return (
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
    )
}

interface FiltersSectionProps {
    searchQuery: string
    statusFilter: string
    planFilter: string
    onSearchChange: (value: string) => void
    onStatusChange: (value: string) => void
    onPlanChange: (value: string) => void
}

export function FiltersSection({
    searchQuery,
    statusFilter,
    planFilter,
    onSearchChange,
    onStatusChange,
    onPlanChange,
}: FiltersSectionProps) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2">
                    {/* Status Filter */}
                    <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
                        {["all", "active", "inactive"].map((status) => (
                            <button
                                key={status}
                                onClick={() => onStatusChange(status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${statusFilter === status
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
                                onClick={() => onPlanChange(plan)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${planFilter === plan
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
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full lg:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                    />
                </div>
            </div>
        </div>
    )
}
