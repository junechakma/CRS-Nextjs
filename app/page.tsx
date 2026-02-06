"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Users,
  Building2 as University,
  BookOpen,
  BarChart3,
  GraduationCap,
  Shield,
  ArrowRight,
  Play,
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  MessageCircle,
  CheckCircle2,
  Smartphone,
  QrCode,
  MousePointer2,
  Trophy,
  Cloud
} from 'lucide-react'
import Image from 'next/image'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AboutModal } from '@/components/layout/AboutModal'
import PricingSection from '@/components/layout/PricingSection'

export default function Home() {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)

  // Spotlight effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const spotlight = document.getElementById('hero-spotlight')
      if (spotlight) {
        const rect = spotlight.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        spotlight.style.setProperty('--x', `${x}px`)
        spotlight.style.setProperty('--y', `${y}px`)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Bento grid spotlight
  useEffect(() => {
    const handleBentoMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.bento-card')
      cards.forEach(card => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
          ; (card as HTMLElement).style.setProperty('--mouse-x', `${x}px`)
          ; (card as HTMLElement).style.setProperty('--mouse-y', `${y}px`)
      })
    }

    const bentoGrid = document.getElementById('bento-grid')
    if (bentoGrid) {
      bentoGrid.addEventListener('mousemove', handleBentoMove)
      return () => bentoGrid.removeEventListener('mousemove', handleBentoMove)
    }
  }, [])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      <style jsx global>{`
        /* Aurora Background */
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

        /* Spotlight */
        .spotlight {
          background: radial-gradient(600px circle at var(--x) var(--y),
            rgba(70, 140, 254, 0.08), transparent 40%);
        }

        /* Bento Card Spotlight */
        .bento-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y),
            rgba(70, 140, 254, 0.15), transparent 40%);
          opacity: 0;
          transition: opacity 0.5s;
          pointer-events: none;
        }

        .bento-card:hover::before {
          opacity: 1;
        }

        /* Float Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-anim {
          animation: float 6s ease-in-out infinite;
        }

        /* Grid Background */
        .grid-bg {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        /* Reveal Animation */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.5, 0, 0, 1);
        }

        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        /* Gradient Text */
        .gradient-text {
          background: linear-gradient(135deg, #468cfe 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* 3D Card */
        .card-3d {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .font-display {
          font-family: var(--font-space-grotesk), sans-serif;
        }

        .font-primary {
          font-family: var(--font-geist-sans), sans-serif;
        }
      `}</style>

      <Navbar onAboutClick={() => setIsAboutModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-white">
        <div className="absolute inset-0 aurora-bg"></div>
        <div className="absolute inset-0 grid-bg"></div>
        <div id="hero-spotlight" className="absolute inset-0 spotlight pointer-events-none"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-medium text-blue-700 mb-8 reveal shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            AI-Powered Analytics & CLO Mapping
          </div>

          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight mb-6 reveal" style={{ transitionDelay: '100ms' }}>
            <span className="text-slate-900 font-primary">Class Response System</span>
            <br />
            <span className="gradient-text font-bold text-4xl md:text-6xl">Powered by AI</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 reveal" style={{ transitionDelay: '200ms' }}>
            Transform your educational feedback with intelligent analytics, real-time insights, and seamless anonymous response collection with CLO mapping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center reveal" style={{ transitionDelay: '300ms' }}>
            <Link href="/feedback">
              <button className="group px-8 py-4 bg-[#468cfe] hover:bg-[#3a7be0] text-white rounded-full font-semibold shadow-xl shadow-blue-200 hover:shadow-2xl transition-all">
                <span className="flex items-center gap-2">
                  Student Feedback Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            <Link href="/demo">
              <button className="px-8 py-4 rounded-full font-semibold text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors flex items-center gap-2 shadow-sm">
                <Play className="w-5 h-5 text-[#468cfe]" />
                Watch Demo
              </button>
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-20 flex flex-wrap items-center justify-center gap-3 reveal" style={{ transitionDelay: '400ms' }}>
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-slate-700">100% Anonymous</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm text-slate-700">Real-time</span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
              <Brain className="w-4 h-4 text-[#468cfe]" />
              <span className="text-sm text-slate-700">AI Insights</span>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-blue-300/30 rounded-full blur-3xl float-anim"></div>
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl float-anim" style={{ animationDelay: '-3s' }}></div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="relative py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">Powerful Features</h2>
            <p className="text-slate-600 text-lg">Everything you need to create interactive learning experiences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto" id="bento-grid">
            {/* Large Card - AI Analytics */}
            <div className="md:col-span-2 md:row-span-2 bento-card relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 group cursor-pointer reveal shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Brain className="w-6 h-6 text-[#468cfe]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">AI-Powered Analytics</h3>
                  <p className="text-slate-600">Automatic sentiment analysis, pattern recognition, and actionable improvement recommendations with real-time insights.</p>
                </div>
                <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                  <div className="flex items-end gap-2 h-32">
                    <div className="flex-1 bg-blue-400/60 rounded-t-lg h-[40%] animate-pulse"></div>
                    <div className="flex-1 bg-blue-500/60 rounded-t-lg h-[70%]"></div>
                    <div className="flex-1 bg-[#468cfe]/60 rounded-t-lg h-[50%] animate-pulse"></div>
                    <div className="flex-1 bg-[#468cfe] rounded-t-lg h-[90%]"></div>
                    <div className="flex-1 bg-blue-500/60 rounded-t-lg h-[60%]"></div>
                    <div className="flex-1 bg-blue-400/60 rounded-t-lg h-[30%] animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Small Card 1 - Anonymous Feedback */}
            <div className="bento-card relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 group cursor-pointer reveal shadow-sm hover:shadow-xl hover:shadow-green-100/50 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-display font-bold mb-1 text-slate-900">100% Anonymous</h3>
                <p className="text-sm text-slate-600">Secure and anonymous response collection with time-limited session access.</p>
              </div>
            </div>

            {/* Small Card 2 - CLO Mapping */}
            <div className="bento-card relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 group cursor-pointer reveal shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-display font-bold mb-1 text-slate-900">CLO Mapping</h3>
                <p className="text-sm text-slate-600">AI-driven alignment with Bloom&apos;s Taxonomy classification.</p>
              </div>
            </div>

            {/* Medium Card - QR Access */}
            <div className="md:col-span-2 bento-card relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 group cursor-pointer reveal shadow-sm hover:shadow-xl hover:shadow-orange-100/50 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4">
                    <QrCode className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-display font-bold mb-2 text-slate-900">QR Code Sessions</h3>
                  <p className="text-slate-600">Generate unique access codes and QR codes for time-limited feedback sessions.</p>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center rotate-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                      <QrCode className="w-16 h-16 text-slate-400" />
                    </div>
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-xl bg-white border border-slate-200 flex items-center justify-center -rotate-6 group-hover:-rotate-12 transition-transform duration-500 shadow-xl">
                      <MousePointer2 className="w-8 h-8 text-[#468cfe]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tall Card - Instant Access */}
            <div className="bento-card relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-6 group cursor-pointer reveal shadow-sm hover:shadow-xl hover:shadow-blue-100/50 transition-shadow duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-[#468cfe]" />
                </div>
                <h3 className="text-lg font-bold mb-4 text-slate-900">Instant Access</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <GraduationCap className="w-4 h-4 text-slate-600" />
                    </div>
                    Self-Service Registration
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-slate-600" />
                    </div>
                    Immediate Activation
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <University className="w-4 h-4 text-slate-600" />
                    </div>
                    Multi-Institution
                  </div>
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-slate-600" />
                    </div>
                    Question Bank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3D Cards Section - How It Works */}
      <section id="how-it-works" className="relative py-32 px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">How It Works</h2>
            <p className="text-slate-600 text-lg">Three simple steps to transform your classroom</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="card-3d group relative h-96 cursor-pointer reveal">
              <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-blue-300 group-hover:shadow-2xl group-hover:shadow-blue-100">
                <div className="h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 text-2xl font-bold text-[#468cfe]">01</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Register</h3>
                  <p className="text-slate-600 mb-6 flex-1">Teachers get instant access through self-service registration. No approval workflow needed.</p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 overflow-hidden">
                    <div className="flex gap-2 mb-3">
                      <div className="h-2 w-20 bg-blue-400 rounded-full"></div>
                      <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-8 rounded-lg bg-white border border-slate-200 flex items-center px-3 shadow-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-[#468cfe] mr-3"></div>
                        <div className="h-2 w-24 bg-slate-300 rounded-full"></div>
                      </div>
                      <div className="h-8 rounded-lg bg-white border border-slate-200 flex items-center px-3 shadow-sm">
                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 mr-3"></div>
                        <div className="h-2 w-32 bg-slate-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="card-3d group relative h-96 cursor-pointer reveal" style={{ transitionDelay: '100ms' }}>
              <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-indigo-300 group-hover:shadow-2xl group-hover:shadow-indigo-100">
                <div className="h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center mb-6 text-2xl font-bold text-indigo-600">02</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Create Session</h3>
                  <p className="text-slate-600 mb-6 flex-1">Generate QR codes and access codes for time-limited feedback sessions. Students join anonymously.</p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-center">
                    <div className="inline-block px-4 py-2 bg-white border border-slate-200 rounded-lg font-mono text-2xl tracking-widest text-indigo-600 shadow-sm mb-2">CR-8821</div>
                    <div className="text-xs text-slate-500">Scan QR or enter code</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="card-3d group relative h-96 cursor-pointer reveal" style={{ transitionDelay: '200ms' }}>
              <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-cyan-300 group-hover:shadow-2xl group-hover:shadow-cyan-100">
                <div className="h-full flex flex-col">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6 text-2xl font-bold text-cyan-600">03</div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900">Analyze</h3>
                  <p className="text-slate-600 mb-6 flex-1">Get real-time AI-powered analytics with sentiment analysis and CLO mapping insights.</p>
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-center justify-between mb-2 text-sm text-slate-600">
                      <span>Responses</span>
                      <span className="text-cyan-600 font-bold">142</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-32 px-6 overflow-hidden bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 reveal">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-slate-900">Experience the Platform</h2>
            <p className="text-slate-600 text-lg">Interactive demonstrations of our key features</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Student Demo Card */}
            <Link href="/demo" className="group block">
              <div className="card-3d relative h-[450px] cursor-pointer reveal">
                <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-violet-300 group-hover:shadow-2xl group-hover:shadow-violet-100">
                  <div className="h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                      <Play className="w-7 h-7 text-violet-600" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3 text-slate-900">Student Portal</h3>
                    <p className="text-slate-600 mb-6 text-[15px] leading-relaxed">Experience a seamless flow—from secure session access to anonymous feedback submission.</p>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-8 flex-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-violet-600" />
                          <span>Secure Access</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-violet-600" />
                          <span>Interactive Flow</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-violet-600" />
                          <span>Anonymous Submission</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-violet-200">
                      Launch Demo
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Analytics Demo Card */}
            <Link href="/session-analytics-demo" className="group block">
              <div className="card-3d relative h-[450px] cursor-pointer reveal" style={{ transitionDelay: '100ms' }}>
                <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-fuchsia-300 group-hover:shadow-2xl group-hover:shadow-fuchsia-100">
                  <div className="h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-fuchsia-100 flex items-center justify-center mb-6">
                      <BarChart3 className="w-7 h-7 text-fuchsia-600" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3 text-slate-900">AI Analytics</h3>
                    <p className="text-slate-600 mb-6 text-[15px] leading-relaxed">Advanced sentiment analysis and actionable insights powered by our intelligent AI engine.</p>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-8 flex-1 flex items-center justify-center">
                      <div className="flex items-end gap-2 h-20 w-full px-2">
                        <div className="flex-1 bg-fuchsia-400/60 rounded-t-lg h-[40%]"></div>
                        <div className="flex-1 bg-fuchsia-500/60 rounded-t-lg h-[70%]"></div>
                        <div className="flex-1 bg-fuchsia-600 rounded-t-lg h-[90%]"></div>
                        <div className="flex-1 bg-fuchsia-500/60 rounded-t-lg h-[60%]"></div>
                        <div className="flex-1 bg-fuchsia-400/60 rounded-t-lg h-[30%]"></div>
                      </div>
                    </div>

                    <div className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-fuchsia-200">
                      View Insights
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* CLO Mapping Demo Card */}
            <Link href="/clo-demo" className="group block">
              <div className="card-3d relative h-[450px] cursor-pointer reveal" style={{ transitionDelay: '200ms' }}>
                <div className="absolute inset-0 rounded-3xl bg-white border border-slate-200 p-8 transition-all duration-500 group-hover:border-amber-300 group-hover:shadow-2xl group-hover:shadow-amber-100">
                  <div className="h-full flex flex-col">
                    <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                      <Sparkles className="w-7 h-7 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-display font-bold mb-3 text-slate-900">CLO Mapping</h3>
                    <p className="text-slate-600 mb-6 text-[15px] leading-relaxed">Intelligently map exam questions to outcomes using AI-driven Bloom&apos;s Taxonomy analysis.</p>

                    <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 mb-8 flex-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Outcome Detection</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Bloom&apos;s Mapping</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Distribution Analysis</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-amber-200">
                      View Analysis
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <PricingSection />

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-100/50 via-white to-white"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10 reveal">
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight text-slate-900">
            Ready to <span className="gradient-text">Transform</span><br />Your Classroom?
          </h2>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            Join educators who are already using AI-powered feedback collection with anonymous responses and CLO mapping.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register/university-admin">
              <button className="px-8 py-4 bg-[#468cfe] hover:bg-[#3a7be0] text-white rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-blue-200">
                Start Free Today
              </button>
            </Link>
            <Link href="/demo">
              <button className="px-8 py-4 border border-slate-300 rounded-full font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50/50 transition-colors bg-white shadow-sm">
                Watch Demo
              </button>
            </Link>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-600 mb-2">Need help or have questions?</p>
            <a href="mailto:classresponsesystem@gmail.com" className="inline-flex items-center gap-2 text-lg font-medium text-[#468cfe] hover:text-[#3a7be0] transition-colors">
              classresponsesystem@gmail.com
            </a>
          </div>
        </div>
      </section>

      <Footer onAboutClick={() => setIsAboutModalOpen(true)} />

      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  )
}
