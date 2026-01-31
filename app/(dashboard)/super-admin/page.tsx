import { Suspense } from "react"
import { getDashboardStats, getRecentUsers, getRecentActivity } from "@/lib/supabase/queries"
import SuperAdminDashboardClient from "./dashboard-client"

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200 rounded-2xl" />
        <div className="lg:col-span-2 h-64 bg-slate-200 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  )
}

async function DashboardContent() {
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
    />
  )
}

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
