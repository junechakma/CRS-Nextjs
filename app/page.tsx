"use client"

import Link from 'next/link'
import { useState } from 'react'
import {
  Users,
  Building2 as University,
  BookOpen,
  BarChart3,
  Settings,
  GraduationCap,
  Shield,
  Clock,
  ArrowRight,
  X,
  Play,
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  Menu
} from 'lucide-react'

export default function Home() {
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between py-4 md:py-5">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <img src="/assets/logo.png" alt="CRS Logo" className="w-8 h-8 rounded-lg" />
              <span className="text-lg font-semibold text-gray-900 tracking-tight">CRS</span>
            </div>

            {/* Center: Navigation */}
            <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/demo" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Demo</Link>
              <Link href="/manuals" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Documentation</Link>
              <button onClick={() => setIsAboutModalOpen(true)} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</button>
            </nav>

            {/* Right: Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-auto">
              <Link href="/login" className="hidden sm:block">
                <button className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/register/university-admin">
                <button className="text-sm font-medium text-white bg-[#468cfe] hover:bg-[#3a7be0] transition-colors px-4 sm:px-5 py-2 sm:py-2.5 rounded-full">
                  Get Started
                </button>
              </Link>
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-3">
              <Link href="/login" className="block text-gray-700 hover:text-gray-900 py-2 transition-colors">
                Sign In
              </Link>
              <Link href="/demo" className="block text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Demo
              </Link>
              <Link href="/manuals" className="block text-gray-600 hover:text-gray-900 py-2 transition-colors">
                Documentation
              </Link>
              <button
                onClick={() => { setIsAboutModalOpen(true); setIsMobileMenuOpen(false); }}
                className="block text-gray-600 hover:text-gray-900 py-2 transition-colors w-full text-left"
              >
                About
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
          <div className="absolute bottom-0 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 lg:pt-24 pb-12 sm:pb-16 lg:pb-24">
          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8">
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-medium text-blue-700">AI-Powered Analytics</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 tracking-tight leading-[1.1] mb-4 sm:mb-6">
              Class Response System
              <span className="block mt-1 sm:mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Powered by AI
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
              Transform your educational feedback with intelligent analytics, real-time insights, and seamless anonymous response collection with CLO mapping.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10 sm:mb-16">
              <Link href="/feedback" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[#468cfe] hover:bg-[#3a7be0] text-white font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-full transition-all duration-200 shadow-lg shadow-[#468cfe]/20 hover:shadow-xl hover:shadow-[#468cfe]/30">
                  Student Feedback Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <Link href="/demo" className="w-full sm:w-auto">
                <button className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium px-6 sm:px-8 py-3.5 sm:py-4 rounded-full border border-gray-200 transition-all duration-200">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </button>
              </Link>
            </div>

            {/* Feature Pills - Show 2 on mobile, all on larger screens */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 sm:mb-16">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                <span className="text-xs sm:text-sm text-gray-700">100% Anonymous</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                <span className="text-xs sm:text-sm text-gray-700">CLO Mapping</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                <span className="text-xs sm:text-sm text-gray-700">Real-time</span>
              </div>
              <div className="hidden xs:flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                <University className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                <span className="text-xs sm:text-sm text-gray-700">Multi-Institution</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 bg-white border border-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm">
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-600" />
                <span className="text-xs sm:text-sm text-gray-700">AI Insights</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview - Hidden on very small mobile, shown from sm up */}
          <div className="relative max-w-5xl mx-auto hidden sm:block">
            <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-xl sm:shadow-2xl shadow-gray-900/10 border border-gray-100">
              <img
                src="/assets/homepage.png"
                alt="Class Response System Dashboard"
                className="w-full rounded-lg sm:rounded-xl"
              />
            </div>
            {/* Floating cards - Only on large screens */}
            <div className="hidden lg:block absolute -left-12 top-1/4 bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Response Rate</p>
                  <p className="text-lg font-bold text-gray-900">94.2%</p>
                </div>
              </div>
            </div>
            <div className="hidden lg:block absolute -right-12 top-1/3 bg-white rounded-xl shadow-xl p-4 border border-gray-100 animate-pulse" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">AI Score</p>
                  <p className="text-lg font-bold text-gray-900">Excellent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-only simplified visual */}
          <div className="sm:hidden flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-[#468cfe] to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#468cfe]/30">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Contact Email */}
          <div className="text-center mt-12 sm:mt-16">
            <p className="text-sm text-gray-600 mb-2">Need help or have questions?</p>
            <a
              href="mailto:classresponsesystem@gmail.com"
              className="inline-flex items-center gap-2 text-base sm:text-lg font-medium text-[#468cfe] hover:text-[#3a7be0] transition-colors"
            >
              classresponsesystem@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Anonymous Access Section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-2 mb-6">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Privacy First</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  Anonymous Student Feedback
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-xl">
                  Secure, anonymous feedback collection that protects student privacy while enabling honest, constructive class evaluation.
                </p>
                <Link href="/feedback">
                  <button className="group inline-flex items-center gap-2 bg-[#468cfe] hover:bg-[#3a7be0] text-white font-medium px-6 py-3 rounded-full transition-all duration-200">
                    Access Feedback Portal
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </Link>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl flex items-center justify-center">
                    <Shield className="w-20 h-20 sm:w-28 sm:h-28 text-green-600" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-2 mb-6">
              <Play className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-medium text-violet-700">Interactive Demos</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Experience the Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our comprehensive feedback system through interactive demonstrations
            </p>
          </div>

          {/* Demo Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Student Demo Card */}
            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    Student Feedback Demo
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">Complete walkthrough</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Experience the complete student feedback flow from session access to submission.
              </p>
              <Link href="/demo">
                <button className="group/btn w-full flex items-center justify-center gap-2 bg-[#468cfe] hover:bg-[#3a7be0] text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 text-sm sm:text-base">
                  Launch Demo
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p className="mt-3 sm:mt-4 text-center text-xs text-gray-400">
                No registration required
              </p>
            </div>

            {/* Analytics Demo Card */}
            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    AI Analytics Demo
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">Teacher dashboard</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                See how AI-powered analytics work with real feedback data and sentiment analysis.
              </p>
              <Link href="/student-reviews">
                <button className="group/btn w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-200 text-sm sm:text-base">
                  View Analytics
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p className="mt-3 sm:mt-4 text-center text-xs text-gray-400">
                Live demo data included
              </p>
            </div>

            {/* CLO Mapping Demo Card */}
            <div className="group bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-0.5 sm:mb-1">
                    CLO Mapping Demo
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">AI-powered analysis</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                Discover how AI maps exam questions to CLOs with Bloom&apos;s Taxonomy analysis.
              </p>
              <Link href="/clo-demo">
                <button className="group/btn w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 transition-all duration-200 text-sm sm:text-base">
                  View CLO Analysis
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>
              </Link>
              <p className="mt-3 sm:mt-4 text-center text-xs text-gray-400">
                Interactive analysis included
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for modern educational institutions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Instant Teacher Access</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Self-service registration with immediate account activation - no approval workflow needed</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Anonymous Feedback</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Secure and anonymous response collection with time-limited session access</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">AI CLO/PLO Mapping</h3>
              <p className="text-gray-600 text-sm leading-relaxed">AI-driven alignment of questions to CLOs/PLOs via Gemini with Bloom&apos;s Taxonomy classification</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">AI-Powered Analytics</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Automatic sentiment analysis, pattern recognition, and actionable improvement recommendations</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">Flexible Question Bank</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Create custom questions or select from common question bank with hybrid approach support</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">QR Code Sessions</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Generate unique access codes and QR codes for time-limited feedback sessions</p>
            </div>


          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">6 Levels</p>
              <p className="text-xs sm:text-sm text-gray-500">Management</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">100%</p>
              <p className="text-xs sm:text-sm text-gray-500">Anonymous</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">Real-time</p>
              <p className="text-xs sm:text-sm text-gray-500">AI Analytics</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <University className="w-6 h-6 sm:w-7 sm:h-7 text-gray-700" />
              </div>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-0.5 sm:mb-1">Scalable</p>
              <p className="text-xs sm:text-sm text-gray-500">Multi-Institution</p>
            </div>
          </div>
        </div>
      </div>

      {/* Administrative Access */}
      <div className="bg-gray-50 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Get Started
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Choose your role and start managing educational feedback
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <Link href="/login" className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Teacher</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Self-service registration with instant access</p>
              <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Register <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </Link>

            <Link href="/feedback" className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-5">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Student</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">Anonymous feedback access via session code</p>
              <span className="inline-flex items-center gap-1.5 text-sm sm:text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                Access Portal <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
            <div className="col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <img src="/assets/logo.png" alt="CRS Logo" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
                <span className="text-base sm:text-lg font-semibold text-gray-900">CRS</span>
              </div>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                Enhancing educational quality through AI-powered feedback collection.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <div className="space-y-2 sm:space-y-3">
                <Link href="/feedback" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Student Feedback
                </Link>
                <Link href="/login" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Admin Login
                </Link>
                <Link href="/register/university-admin" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Register
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
              <div className="space-y-2 sm:space-y-3">
                <Link href="/manuals" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Documentation
                </Link>
                <Link href="/demo" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Demo
                </Link>
                <Link href="/student-reviews" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Analytics
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => setIsAboutModalOpen(true)}
                  className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors text-left"
                >
                  About Us
                </button>
                <Link href="/terms" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Terms
                </Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900 text-xs sm:text-sm transition-colors">
                  Privacy
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-gray-500 text-xs sm:text-sm">&copy; 2025 Class Response System. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* About Us Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 relative shadow-2xl">
            <button
              onClick={() => setIsAboutModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8">
              <img src="/assets/logo.png" alt="CRS Logo" className="w-12 h-12 rounded-xl mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">About Us</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">SAH</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Prof. Dr. Syed Akhter Hossain</h3>
                  <p className="text-gray-500 text-sm">System Architect & Concept Designer</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">JC</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">June Chakma</h3>
                  <p className="text-gray-500 text-sm">Lead Developer</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">MR</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assoc. Prof. Mahmudur Rahman</h3>
                  <p className="text-gray-500 text-sm">Consultant</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setIsAboutModalOpen(false)}
                className="w-full bg-[#468cfe] hover:bg-[#3a7be0] text-white font-medium py-3 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
