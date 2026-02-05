import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherDashboard } from "@/lib/supabase/queries"
import TeacherDashboardClient from "./dashboard-client"
import { HeroSection, QuickActionsSection } from "./dashboard-wrapper"

// Skeleton components for dynamic sections only
function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="gradient-border-card">
          <div className="card-inner p-6 animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl" />
              <div className="w-20 h-6 bg-slate-200 rounded-full" />
            </div>
            <div className="w-16 h-8 bg-slate-200 rounded mb-1" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function LiveSessionsSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Live Sessions</h3>
          <p className="text-slate-500 text-sm mt-1">Currently collecting student feedback</p>
        </div>
      </div>
      <div className="space-y-4 animate-pulse">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <div className="flex-1">
                  <div className="w-48 h-5 bg-slate-200 rounded mb-2" />
                  <div className="w-32 h-4 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="w-16 h-6 bg-slate-200 rounded-full" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="w-24 h-4 bg-slate-200 rounded" />
              <div className="w-24 h-4 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentFeedbackSkeleton() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Recent Feedback</h3>
      </div>
      <div className="space-y-3 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-xl border border-slate-200">
            <div className="w-1 min-h-[40px] bg-slate-300 rounded-full" />
            <div className="flex-1">
              <div className="w-full h-4 bg-slate-200 rounded mb-2" />
              <div className="w-3/4 h-4 bg-slate-200 rounded mb-2" />
              <div className="w-24 h-3 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Dashboard wrapper with static and dynamic sections
function DashboardWithSkeletons() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Static Hero - Shows immediately */}
      <HeroSection />

      {/* Dynamic Stats - Shows skeleton */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <DashboardContent section="stats" />
      </Suspense>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dynamic Sessions */}
        <div className="lg:col-span-2 space-y-6">
          <Suspense fallback={<LiveSessionsSkeleton />}>
            <DashboardContent section="sessions" />
          </Suspense>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Static Quick Actions - Shows immediately */}
          <QuickActionsSection />

          {/* Dynamic Recent Feedback - Shows skeleton */}
          <Suspense fallback={<RecentFeedbackSkeleton />}>
            <DashboardContent section="feedback" />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

async function DashboardContent({ section }: { section?: string }) {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Verify user is a teacher
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/super-admin')
  }

  // Fetch dashboard data
  const data = await getTeacherDashboard(user.id)

  return <TeacherDashboardClient data={data} section={section} />
}

export default function TeacherDashboard() {
  return <DashboardWithSkeletons />
}
