"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react"

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setTimeout(() => setIsLoading(false), 2000)
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Create account</h1>
                <p className="text-slate-500 text-sm">Join the next generation of education</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div className="input-group relative">
                    <input
                        type="email"
                        id="email"
                        placeholder=" "
                        required
                        className="input-field w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all"
                    />
                    <label
                        htmlFor="email"
                        className="input-label absolute left-4 top-3.5 text-slate-400 text-sm font-medium origin-left transition-all pointer-events-none"
                    >
                        Email address
                    </label>
                    <Mail className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
                </div>

                {/* Password */}
                <div className="input-group relative">
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder=" "
                        required
                        className="input-field w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all"
                    />
                    <label
                        htmlFor="password"
                        className="input-label absolute left-4 top-3.5 text-slate-400 text-sm font-medium origin-left transition-all pointer-events-none"
                    >
                        Create Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="input-group relative">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        placeholder=" "
                        required
                        className="input-field w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all"
                    />
                    <label
                        htmlFor="confirm-password"
                        className="input-label absolute left-4 top-3.5 text-slate-400 text-sm font-medium origin-left transition-all pointer-events-none"
                    >
                        Confirm Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 py-1">
                    <input type="checkbox" required className="mt-1 rounded border-slate-300 text-[#468cfe] focus:ring-[#468cfe]" />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        I agree to the <Link href="#" className="text-[#468cfe] font-semibold hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#468cfe] font-semibold hover:underline">Privacy Policy</Link>
                    </p>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-[#468cfe] hover:bg-[#3a7be0] text-white font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Create account
                            <ArrowRight className="w-4 h-4" />
                        </>
                    )}
                </button>
            </form>

            {/* Switch Form */}
            <div className="mt-6 text-center">
                <p className="text-slate-600 text-sm">
                    Already have an account?
                    <Link href="/login" className="ml-1 text-[#468cfe] font-bold hover:underline transition-all">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
