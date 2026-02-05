import { Suspense } from "react"
import { getDashboardStats, getRecentUsers, getRecentActivity } from "@/lib/supabase/queries"
import SuperAdminDashboardClient from "./dashboard-client"
import { HeaderSection, QuickActionsSection } from "./dashboard-wrapper"

// Skeleton components for dynamic sections only
function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="gradient-border-card">
          <div className="card-inner p-5 animate-pulse">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-slate-200 rounded-xl" />
              <div className="w-20 h-6 bg-slate-200 rounded-full" />
            </div>
            <div className="w-16 h-7 bg-slate-200 rounded mb-1" />
            <div className="w-24 h-4 bg-slate-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PlanDistributionSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
          <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-slate-300 rounded-full" />
                <div className="w-16 h-4 bg-slate-200 rounded" />
              </div>
              <div className="w-24 h-4 bg-slate-200 rounded" />
            </div>
            <div className="h-2 bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentActivitySkeleton() {
  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
          <div className="w-32 h-5 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50">
            <div className="w-8 h-8 bg-slate-200 rounded-lg" />
            <div className="flex-1">
              <div className="w-3/4 h-4 bg-slate-200 rounded" />
            </div>
            <div className="w-16 h-3 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentUsersSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-200 rounded-xl animate-pulse" />
            <div>
              <div className="w-28 h-5 bg-slate-200 rounded mb-2 animate-pulse" />
              <div className="w-48 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <div className="flex-1">
              <div className="w-32 h-4 bg-slate-200 rounded mb-2" />
              <div className="w-48 h-3 bg-slate-200 rounded" />
            </div>
            <div className="w-16 h-6 bg-slate-200 rounded-full" />
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
      {/* Static Header - Shows immediately */}
      <HeaderSection />

      {/* Dynamic Stats - Shows skeleton */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <DashboardContent section="stats" />
      </Suspense>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Plan Distribution - Shows skeleton */}
        <Suspense fallback={<PlanDistributionSkeleton />}>
          <DashboardContent section="plan-distribution" />
        </Suspense>

        {/* Dynamic Recent Activity - Shows skeleton */}
        <Suspense fallback={<RecentActivitySkeleton />}>
          <DashboardContent section="recent-activity" />
        </Suspense>
      </div>

      {/* Dynamic Recent Users - Shows skeleton */}
      <Suspense fallback={<RecentUsersSkeleton />}>
        <DashboardContent section="recent-users" />
      </Suspense>

      {/* Static Quick Actions - Shows immediately */}
      <QuickActionsSection />
    </div>
  )
}

async function DashboardContent({ section }: { section?: string }) {
  // Fetch all data in parallel
  const [stats, recentUsers, recentActivity] = await Promise.all([
    getDashboardStats(),
    getRecentUsers(5),
    getRecentActivity(5),
  ])

  return (
    <SuperAdminDashboardClient
      stats={stats}
      recentUsers={recentUsers}
      recentActivity={recentActivity}
      section={section}
    />
  )
}

export default function SuperAdminDashboard() {
  return <DashboardWithSkeletons />
}
