import { Suspense } from "react"
import { getSuperAdminAnalytics } from "@/lib/supabase/queries"
import AnalyticsClient from "./analytics-client"
import { BarChart3, Calendar, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Static header that shows immediately
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Platform Analytics
          </h1>
        </div>
        <p className="text-slate-500">System-wide insights and metrics</p>
      </div>
    </div>
  )
}

// Loading skeleton for dynamic content only
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-96 bg-slate-200 rounded-2xl" />
          <div className="h-64 bg-slate-200 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 rounded-2xl" />
          <div className="h-80 bg-slate-200 rounded-2xl" />
          <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

async function AnalyticsContent() {
  const data = await getSuperAdminAnalytics()

  return <AnalyticsClient data={data} />
}

export default function SuperAdminAnalyticsPage() {
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
