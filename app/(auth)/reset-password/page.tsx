"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const router = useRouter()
    const supabase = createClient()

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long"
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter"
        }
        if (!/[a-z]/.test(password)) {
            return "Password must contain at least one lowercase letter"
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number"
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        const passwordError = validatePassword(password)
        if (passwordError) {
            setError(passwordError)
            return
        }

        setIsLoading(true)

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            })

            if (updateError) {
                setError(updateError.message)
                return
            }

            setSuccess(true)

            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login?message=Password updated successfully. Please sign in with your new password.')
            }, 3000)
        } catch (err) {
            console.error('Password update error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Success state
    if (success) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Password updated!</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        Your password has been successfully reset.
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-800">
                        Redirecting you to sign in...
                    </p>
                    <div className="w-5 h-5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mt-3" />
                </div>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="text-[#468cfe] font-semibold hover:underline"
                    >
                        Sign in now
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Set new password
                </h1>
                <p className="text-slate-500 text-sm">Create a strong password for your account</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Password Input */}
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        New Password
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors duration-300 z-10"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Password Requirements */}
                <div className="text-xs text-slate-500 space-y-1 pl-1">
                    <p className={password.length >= 8 ? "text-green-600" : ""}>
                        {password.length >= 8 ? "✓" : "•"} At least 8 characters
                    </p>
                    <p className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                        {/[A-Z]/.test(password) ? "✓" : "•"} One uppercase letter
                    </p>
                    <p className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                        {/[a-z]/.test(password) ? "✓" : "•"} One lowercase letter
                    </p>
                    <p className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                        {/[0-9]/.test(password) ? "✓" : "•"} One number
                    </p>
                </div>

                {/* Confirm Password Input */}
                <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

                {/* Password match indicator */}
                {confirmPassword && (
                    <p className={`text-xs pl-1 ${password === confirmPassword ? "text-green-600" : "text-red-500"}`}>
                        {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                )}

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
                            Reset password
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
