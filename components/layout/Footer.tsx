"use client"

import Link from "next/link"
import { Zap } from "lucide-react"

interface FooterProps {
    onAboutClick: () => void
}

export function Footer({ onAboutClick }: FooterProps) {
    return (
        <footer className="border-t border-slate-200 py-12 px-6 bg-slate-50 relative z-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div className="col-span-2 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-[#468cfe] to-[#3b82f6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                                <Zap className="w-5 h-5 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900">CRS</span>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Enhancing educational quality through AI-powered feedback collection.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
                        <div className="space-y-3">
                            <Link href="/feedback" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Student Feedback
                            </Link>
                            <Link href="/login" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Admin Login
                            </Link>
                            <Link href="/register" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Register
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
                        <div className="space-y-3">
                            <Link href="/manuals" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Documentation
                            </Link>
                            <Link href="/demo" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Demo
                            </Link>
                            <Link href="/student-reviews" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Analytics
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
                        <div className="space-y-3">
                            <button
                                onClick={onAboutClick}
                                className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors text-left"
                            >
                                About Us
                            </button>
                            <Link href="/terms" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Terms
                            </Link>
                            <Link href="/privacy" className="block text-slate-600 hover:text-[#468cfe] text-sm transition-colors">
                                Privacy
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 pt-8 text-center">
                    <p className="text-slate-500 text-sm">&copy; 2025 Class Response System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
