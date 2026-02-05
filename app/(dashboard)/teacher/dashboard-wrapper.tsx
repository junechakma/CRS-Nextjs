"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Plus,
    BarChart3,
    GraduationCap,
    FileText,
    ChevronRight,
} from "lucide-react"

// Static hero section that shows immediately
export function HeroSection() {
    const router = useRouter()

    return (
        <div className="hero-gradient rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200/60 shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/50 to-violet-200/50 rounded-full filter blur-3xl -mr-20 -mt-20" />
            <div className="relative z-10">
                <p className="text-indigo-600 font-semibold mb-2 tracking-wide uppercase text-sm">
                    Welcome back
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                    Ready to engage your{" "}
                    <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        students today?
                    </span>
                </h2>
                <p className="text-slate-600 max-w-2xl mb-6 text-sm sm:text-base">
                    Manage your courses, collect feedback, and gain insights.
                </p>
                <div className="flex flex-wrap gap-3">
                    <Button
                        onClick={() => router.push("/teacher/sessions")}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 transform hover:-translate-y-0.5 gap-2 border-0"
                    >
                        <Plus className="w-5 h-5" />
                        New Session
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push("/teacher/analytics")}
                        className="px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 gap-2"
                    >
                        <BarChart3 className="w-5 h-5" />
                        View Analytics
                    </Button>
                </div>
            </div>
        </div>
    )
}

// Static quick actions that show immediately
export function QuickActionsSection() {
    const router = useRouter()

    const quickActions = [
        {
            title: "New Session",
            description: "Start feedback collection",
            icon: Plus,
            href: "/teacher/sessions",
            hoverBg: "hover:bg-indigo-50",
            hoverBorder: "hover:border-indigo-200",
            hoverIcon: "group-hover:border-indigo-300 group-hover:bg-indigo-100",
            hoverIconColor: "group-hover:text-indigo-600",
        },
        {
            title: "Question Templates",
            description: "Manage question sets",
            icon: FileText,
            href: "/teacher/questions",
            hoverBg: "hover:bg-violet-50",
            hoverBorder: "hover:border-violet-200",
            hoverIcon: "group-hover:border-violet-300 group-hover:bg-violet-100",
            hoverIconColor: "group-hover:text-violet-600",
        },
        {
            title: "My Courses",
            description: "View all courses",
            icon: GraduationCap,
            href: "/teacher/courses",
            hoverBg: "hover:bg-blue-50",
            hoverBorder: "hover:border-blue-200",
            hoverIcon: "group-hover:border-blue-300 group-hover:bg-blue-100",
            hoverIconColor: "group-hover:text-blue-600",
        },
    ]

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
                {quickActions.map((action, index) => (
                    <button
                        key={index}
                        onClick={() => router.push(action.href)}
                        className={`group w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl transition-all ${action.hoverBg} ${action.hoverBorder}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-all ${action.hoverIcon}`}>
                                <action.icon className={`w-5 h-5 text-slate-600 ${action.hoverIconColor}`} />
                            </div>
                            <div className="text-left">
                                <p className="font-medium text-slate-900">{action.title}</p>
                                <p className="text-xs text-slate-500">{action.description}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                ))}
            </div>
        </div>
    )
}
