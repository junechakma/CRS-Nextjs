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
                {/* Email Input with Floating Label Animation */}
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type="email"
                        id="email"
                        placeholder=" "
                        required
                        className="peer w-full px-4 py-3.5 pl-12 rounded-xl border-2 border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all duration-300 placeholder-transparent"
                    />
                    <label
                        htmlFor="email"
                        className="absolute left-12 top-3.5 text-slate-400 text-sm font-medium transition-all duration-300 pointer-events-none
                                        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#468cfe] peer-focus:bg-white peer-focus:px-2 peer-focus:rounded
                                        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded"
                    >
                        Email address
                    </label>
                </div>

                {/* Password Input with Floating Label Animation */}
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        placeholder=" "
                        required
                        className="peer w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all duration-300 placeholder-transparent"
                    />
                    <label
                        htmlFor="password"
                        className="absolute left-12 top-3.5 text-slate-400 text-sm font-medium transition-all duration-300 pointer-events-none
                                        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#468cfe] peer-focus:bg-white peer-focus:px-2 peer-focus:rounded
                                        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded"
                    >
                        Create Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors duration-300 z-10"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Confirm Password Input with Floating Label Animation */}
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        placeholder=" "
                        required
                        className="peer w-full px-4 py-3.5 pl-12 pr-12 rounded-xl border-2 border-slate-200 bg-white/50 outline-none focus:border-[#468cfe] focus:bg-white text-slate-900 text-sm font-medium transition-all duration-300 placeholder-transparent"
                    />
                    <label
                        htmlFor="confirm-password"
                        className="absolute left-12 top-3.5 text-slate-400 text-sm font-medium transition-all duration-300 pointer-events-none
                                        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-xs peer-focus:text-[#468cfe] peer-focus:bg-white peer-focus:px-2 peer-focus:rounded
                                        peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-slate-600 peer-[:not(:placeholder-shown)]:bg-white peer-[:not(:placeholder-shown)]:px-2 peer-[:not(:placeholder-shown)]:rounded"
                    >
                        Confirm Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors duration-300 z-10"
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 py-1">
                    <input
                        type="checkbox"
                        required
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#468cfe] focus:ring-2 focus:ring-[#468cfe]/20 cursor-pointer"
                    />
                    <p className="text-xs text-slate-500 leading-relaxed">
                        I agree to the{" "}
                        <Link href="#" className="text-[#468cfe] font-semibold hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-[#468cfe] font-semibold hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#468cfe] to-[#5a6bff] hover:from-[#3a7be0] hover:to-[#4a5bef] text-white font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            Create account
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
