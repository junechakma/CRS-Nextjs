"use client"

import { useState } from "react"
import Link from "next/link"
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
                }
            )

            if (resetError) {
                setError(resetError.message)
                return
            }

            setSuccess(true)
        } catch (err) {
            console.error('Password reset error:', err)
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
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        We&apos;ve sent a password reset link to <strong className="text-slate-700">{email}</strong>
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the reset link in the email</li>
                        <li>Create a new secure password</li>
                        <li>Sign in with your new password</li>
                    </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-800">
                        <strong>Note:</strong> The link will expire in 1 hour for security reasons.
                    </p>
                </div>

                <div className="text-center pt-4">
                    <p className="text-slate-600 text-sm mb-4">
                        Didn&apos;t receive the email?
                    </p>
                    <button
                        onClick={() => {
                            setSuccess(false)
                            setEmail("")
                        }}
                        className="text-[#468cfe] font-semibold hover:underline"
                    >
                        Try again
                    </button>
                </div>

                <div className="text-center">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-500 text-sm hover:text-slate-700"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Sign in
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Forgot password?
                </h1>
                <p className="text-slate-500 text-sm">No worries, we&apos;ll send you reset instructions</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Input with Floating Label Animation */}
                <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 group-focus-within:text-[#468cfe] z-10 pointer-events-none" />
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                            Send reset link
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>
            </form>

            {/* Back to Login */}
            <div className="text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-slate-600 text-sm hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign in
                </Link>
            </div>
        </div>
    )
}
