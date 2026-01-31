"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu } from "lucide-react"

interface NavbarProps {
    onAboutClick: () => void
}

export function Navbar({ onAboutClick }: NavbarProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="fixed top-0 w-full z-50 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="rounded-sm" />
                        <span className="font-display font-bold text-xl tracking-tight text-slate-900">CRS</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 absolute left-1/2 -translate-x-1/2">
                    <Link href="/demo" className="hover:text-[#468cfe] transition-colors">Demo</Link>
                    <Link href="/manuals" className="hover:text-[#468cfe] transition-colors">Manuals</Link>
                    <button onClick={onAboutClick} className="hover:text-[#468cfe] transition-colors">About Us</button>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login" className="hidden md:block text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Sign In
                    </Link>
                    <Link href="/register">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-[#468cfe] hover:bg-[#3a7be0] rounded-full shadow-lg shadow-blue-200 hover:shadow-xl transition-all">
                            Get Started Free
                        </button>
                    </Link>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl py-4 px-6 space-y-3">
                    <Link href="/login" className="block text-slate-700 hover:text-slate-900 py-2">Sign In</Link>
                    <Link href="/demo" className="block text-slate-600 hover:text-slate-900 py-2">Demo</Link>
                    <Link href="/manuals" className="block text-slate-600 hover:text-slate-900 py-2">Documentation</Link>
                    <button
                        onClick={() => {
                            onAboutClick()
                            setIsMobileMenuOpen(false)
                        }}
                        className="block text-slate-600 hover:text-slate-900 py-2 w-full text-left"
                    >
                        About
                    </button>
                </div>
            )}
        </nav>
    )
}