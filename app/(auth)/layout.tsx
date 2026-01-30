"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      const spotlight = document.getElementById("auth-spotlight")
      if (spotlight) {
        spotlight.style.setProperty("--x", `${e.clientX}px`)
        spotlight.style.setProperty("--y", `${e.clientY}px`)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-slate-50 text-slate-900 antialiased overflow-hidden selection:bg-blue-200 selection:text-blue-900">
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

        .auth-spotlight {
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--x) var(--y),
            rgba(70, 140, 254, 0.08), transparent 40%);
          pointer-events: none;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
          animation: float 20s infinite ease-in-out;
          pointer-events: none;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.1),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
        }

        .input-group:focus-within .input-label,
        .input-field:not(:placeholder-shown) + .input-label {
          transform: translateY(-24px) scale(0.85);
          color: #468cfe;
        }

        .gradient-text {
          background: linear-gradient(135deg, #468cfe 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Background Layer */}
      <div className="fixed inset-0 aurora-bg -z-10" />
      <div id="auth-spotlight" className="auth-spotlight -z-10" />


      {/* Orbs */}
      <div className="floating-orb w-96 h-96 bg-blue-400/20 top-0 left-0" />
      <div className="floating-orb w-80 h-80 bg-violet-400/20 bottom-0 right-0" style={{ animationDelay: '2s' }} />
      <div className="floating-orb w-64 h-64 bg-indigo-400/20 top-1/2 left-1/2" style={{ animationDelay: '4s' }} />

      <div className="relative z-10 w-full max-w-md p-6">
        <Link
          href="/"
          className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        {/* Logo/Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="rounded-sm" />
            <span className="font-display font-bold text-2xl tracking-tight text-slate-900">CRS</span>
          </Link>
        </div>

        {/* Content Card */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-100/30">
          {children}
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center px-4">
          <p className="text-xs text-slate-400 leading-relaxed uppercase tracking-widest font-medium">
            Protected by Cloud Infrastructure & AI Monitoring
          </p>
        </div>
      </div>
    </div>
  )
}
