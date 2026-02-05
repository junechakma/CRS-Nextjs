import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherSemesters } from "@/lib/supabase/queries/teacher"
import SemestersClient from "./semesters-client"
import { CalendarDays, Calendar, Clock, TrendingUp, BookOpen } from "lucide-react"

function SemestersSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
              <CalendarDays className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Semesters</h1>
          </div>
          <p className="text-slate-500">Manage your academic semesters and track progress</p>
        </div>
        <div className="w-40 h-10 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-9 h-9 bg-slate-200 rounded-lg" />
              <div className="flex-1">
                <div className="w-12 h-7 bg-slate-200 rounded mb-1" />
                <div className="w-20 h-3 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm animate-pulse">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-32 h-10 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="gradient-border-card">
            <div className="card-inner p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="w-20 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="w-32 h-5 bg-slate-200 rounded mb-4" />
              <div className="w-full h-8 bg-slate-200 rounded-lg mb-4" />
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-slate-200 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function SemestersContent() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'teacher') {
    redirect('/super-admin')
  }

  const semesters = await getTeacherSemesters(user.id)

  return <SemestersClient semesters={semesters} />
}

export default function SemestersPage() {
  return (
    <Suspense fallback={<SemestersSkeleton />}>
      <SemestersContent />
    </Suspense>
  )
}
