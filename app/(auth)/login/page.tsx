"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import ProfileCompletionDialog from "@/components/auth/ProfileCompletionDialog"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [showProfileDialog, setShowProfileDialog] = useState(false)
    const [loggedInUser, setLoggedInUser] = useState<{ id: string; email: string } | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    useEffect(() => {
        // Check for messages from URL params (e.g., after email verification)
        const urlMessage = searchParams.get('message')
        const urlError = searchParams.get('error')

        if (urlMessage) {
            setMessage(urlMessage)
        }
        if (urlError) {
            setError(urlError)
        }
    }, [searchParams])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setMessage("")

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            })

            if (signInError) {
                if (signInError.message.includes('Email not confirmed')) {
                    setError('Please verify your email address before signing in. Check your inbox for the verification link.')
                } else if (signInError.message.includes('Invalid login credentials')) {
                    setError('Invalid email or password. Please try again.')
                } else {
                    setError(signInError.message)
                }
                return
            }

            if (data.user && data.session) {
                // Store user info for profile dialog
                const userInfo = { id: data.user.id, email: data.user.email || '' }
                setLoggedInUser(userInfo)

                // Check if profile is complete
                const { data: profile, error: profileError } = await supabase
                    .from('users')
                    .select('name, institution, role')
                    .eq('id', data.user.id)
                    .single()

                if (profileError || !profile?.name || !profile?.institution) {
                    // Profile incomplete, show dialog
                    setShowProfileDialog(true)
                } else {
                    // Profile complete, redirect to dashboard
                    const redirectTo = profile.role === 'super_admin' ? '/super-admin' : '/teacher'
                    window.location.href = searchParams.get('redirect') || redirectTo
                }
            } else if (data.user) {
                setLoggedInUser({ id: data.user.id, email: data.user.email || '' })
                setShowProfileDialog(true)
            }
        } catch (err) {
            console.error('Login error:', err)
            setError('An unexpected error occurred. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleProfileComplete = () => {
        setShowProfileDialog(false)
        const redirectTo = searchParams.get('redirect') || '/teacher'
        // Use window.location for full page navigation to sync cookies properly
        window.location.href = redirectTo
    }

    return (
        <>
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                        Welcome back
                    </h1>
                    <p className="text-slate-500 text-sm">Access your interactive dashboard</p>
                </div>

                {/* Success Message */}
                {message && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
                        <CheckCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email Input with Floating Label Animation */}
                    <div className="relative">
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
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 peer-focus:text-[#468cfe]" />
                    </div>

                    {/* Password Input with Floating Label Animation */}
                    <div className="relative">
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
                            Password
                        </label>
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 transition-colors duration-300 peer-focus:text-[#468cfe]" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-slate-400 hover:text-[#468cfe] transition-colors duration-300"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Links */}
                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-[#468cfe] focus:ring-2 focus:ring-[#468cfe]/20 transition-all cursor-pointer"
                            />
                            <span className="text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                        </label>
                        <Link href="/forgot-password" className="text-[#468cfe] hover:text-[#3a7be0] font-semibold transition-colors hover:underline">
                            Forgot password?
                        </Link>
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
                                Sign in
                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Or continue with</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                </div>

                {/* Switch Form */}
                <div className="mt-6 text-center">
                    <p className="text-slate-600 text-sm">
                        Don&apos;t have an account?
                        <Link href="/register" className="ml-1 text-[#468cfe] font-bold hover:underline transition-all">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>

            {/* Profile Completion Dialog */}
            <ProfileCompletionDialog
                isOpen={showProfileDialog}
                onComplete={handleProfileComplete}
                userId={loggedInUser?.id}
                userEmail={loggedInUser?.email}
            />
        </>
    )
}
