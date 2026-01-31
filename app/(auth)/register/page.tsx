"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, Shield, GraduationCap } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const [role, setRole] = useState<'teacher' | 'super_admin'>('teacher')

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
        if (!agreedToTerms) {
            setError("Please agree to the Terms of Service and Privacy Policy")
            return
        }

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
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: {
                        role: role,
                    },
                },
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('This email is already registered. Please sign in or use a different email.')
                } else {
                    setError(signUpError.message)
                }
                return
            }

            if (data.user) {
                // Check if email confirmation is required
                if (data.user.identities && data.user.identities.length === 0) {
                    setError('This email is already registered. Please sign in or use a different email.')
                    return
                }

                // Show success message
                setSuccess(true)
            }
        } catch (err) {
            console.error('Registration error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    // Success state - show email verification message
    if (success) {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
                    <p className="text-slate-500 text-sm mb-6">
                        We&apos;ve sent a verification link to <strong className="text-slate-700">{email}</strong>
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 mb-2">Next steps:</h3>
                    <ol className="list-decimal list-inside text-sm text-blue-800 space-y-2">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the verification link in the email</li>
                        <li>Complete your profile setup</li>
                        <li>Start using CRS!</li>
                    </ol>
                </div>

                <div className="text-center pt-4">
                    <p className="text-slate-600 text-sm mb-4">
                        Didn&apos;t receive the email?
                    </p>
                    <button
                        onClick={() => {
                            setSuccess(false)
                            setEmail("")
                            setPassword("")
                            setConfirmPassword("")
                        }}
                        className="text-[#468cfe] font-semibold hover:underline"
                    >
                        Try again with a different email
                    </button>
                </div>

                <div className="text-center">
                    <Link href="/login" className="text-slate-500 text-sm hover:text-slate-700">
                        Back to Sign in
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Create account</h1>
                <p className="text-slate-500 text-sm">Join the next generation of education</p>
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

                {/* Role Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Account Type</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                role === 'teacher'
                                    ? 'border-[#468cfe] bg-blue-50 text-[#468cfe]'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <GraduationCap className="w-5 h-5" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Teacher</p>
                                <p className="text-xs opacity-70">Collect feedback</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('super_admin')}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                                role === 'super_admin'
                                    ? 'border-violet-500 bg-violet-50 text-violet-600'
                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                            }`}
                        >
                            <Shield className="w-5 h-5" />
                            <div className="text-left">
                                <p className="font-semibold text-sm">Super Admin</p>
                                <p className="text-xs opacity-70">Manage platform</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Password Input with Floating Label Animation */}
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

                {/* Confirm Password Input with Floating Label Animation */}
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

                {/* Terms */}
                <div className="flex items-start gap-2 py-1">
                    <input
                        type="checkbox"
                        id="terms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-slate-300 text-[#468cfe] focus:ring-2 focus:ring-[#468cfe]/20 cursor-pointer"
                    />
                    <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link href="#" className="text-[#468cfe] font-semibold hover:underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="#" className="text-[#468cfe] font-semibold hover:underline">
                            Privacy Policy
                        </Link>
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
