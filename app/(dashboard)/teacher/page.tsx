import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherDashboard } from "@/lib/supabase/queries"
import TeacherDashboardClient from "./dashboard-client"

// Loading skeleton component
function DashboardSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Hero skeleton */}
      <div className="h-48 bg-slate-200 rounded-3xl" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-slate-200 rounded-3xl" />
          <div className="h-80 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    </div>
  )
}

async function DashboardContent() {
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

  return <TeacherDashboardClient data={data} />
}

export default function TeacherDashboard() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
