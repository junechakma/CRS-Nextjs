"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowRight,
  Hash,
  Shield,
  Sparkles,
  QrCode,
  Clock,
  CheckCircle2,
  Keyboard,
} from "lucide-react"

export default function FeedbackEntryPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setError("Please enter a session code")
      return
    }

    if (code.length < 3) {
      setError("Session code must be at least 3 characters")
      return
    }

    setError("")
    setIsLoading(true)

    // Simulate validation
    await new Promise((resolve) => setTimeout(resolve, 300))

    router.push(`/feedback/${code.toUpperCase()}`)
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "")
    setCode(value)
    if (error) setError("")
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      <style jsx global>{`
        .aurora-bg {
          background:
            radial-gradient(at 0% 0%, rgba(70, 140, 254, 0.15) 0, transparent 50%),
            radial-gradient(at 50% 0%, rgba(59, 130, 246, 0.1) 0, transparent 50%),
            radial-gradient(at 100% 0%, rgba(96, 165, 250, 0.1) 0, transparent 50%);
          background-size: 200% 200%;
          animation: aurora 20s ease infinite;
        }

        @keyframes aurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .grid-bg {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-anim {
          animation: float 6s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #468cfe 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl float-anim pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl float-anim pointer-events-none" style={{ animationDelay: "-3s" }} />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Class Response System</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Anonymous</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center min-h-[calc(100vh-73px)] px-6 py-12">
        <div className="max-w-md w-full">
          {/* Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200/50">
              <Hash className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Join a Session</h1>
            <p className="text-slate-600">Enter the code provided by your instructor to submit anonymous feedback</p>
          </div>

          {/* Code Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="sr-only">Session Code</label>
              <div className="relative">
                <input
                  ref={inputRef}
                  id="code"
                  type="text"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter session code"
                  maxLength={10}
                  className={`w-full px-6 py-5 text-center text-2xl font-mono font-bold tracking-widest rounded-2xl border-2 transition-all bg-white ${
                    error
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  } placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal placeholder:text-lg`}
                  autoComplete="off"
                  autoCapitalize="characters"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-slate-400">
                  <Keyboard className="w-4 h-4" />
                </div>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-500 text-center">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className={`w-full py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
                code.trim() && !isLoading
                  ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl hover:shadow-blue-200 hover:-translate-y-0.5"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Session
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* QR Code Option */}
          <button className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-blue-100 transition-colors">
                <QrCode className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-900">Scan QR Code</p>
                <p className="text-sm text-slate-500">Use your camera to scan a session QR code</p>
              </div>
            </div>
          </button>

          {/* Info Cards */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-medium text-slate-900">Anonymous</span>
              </div>
              <p className="text-xs text-slate-500">Your identity is never shared with instructors</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200/60 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-slate-900">Quick</span>
              </div>
              <p className="text-xs text-slate-500">Takes less than 5 minutes to complete</p>
            </div>
          </div>

          {/* Try Demo */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 mb-2">Want to try it out?</p>
            <Link
              href="/feedback/DEMO"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Try Demo Session (Code: DEMO)
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
