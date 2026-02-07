import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeacherAnalytics } from '@/lib/supabase/queries/teacher'
import AnalyticsClient from './analytics-client'
import { BarChart3 } from 'lucide-react'

// Static header that shows immediately
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Analytics Overview
          </h1>
        </div>
        <p className="text-slate-500">
          Comprehensive insights across all your courses and sessions
        </p>
      </div>
    </div>
  )
}

// Skeleton for dynamic content
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-200 rounded-2xl p-5 h-32"></div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-200 rounded-2xl h-64"></div>
          <div className="bg-slate-200 rounded-2xl h-96"></div>
          <div className="bg-slate-200 rounded-2xl h-64"></div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-slate-200 rounded-2xl h-96"></div>
          <div className="bg-slate-200 rounded-2xl h-64"></div>
        </div>
      </div>
    </div>
  )
}

async function AnalyticsContent() {
  const supabase = await createClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is a teacher
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/super-admin')
  }

  // Fetch analytics data
  const analyticsData = await getTeacherAnalytics(user.id)

  return <AnalyticsClient data={analyticsData} />
}

export default function AnalyticsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Static header - shows immediately */}
      <PageHeader />

      {/* Dynamic content - shows skeleton while loading */}
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  )
}
