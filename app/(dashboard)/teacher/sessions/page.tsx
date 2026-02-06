import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherSessionsPaginated, getTeacherSessionStats, getTeacherCourses } from "@/lib/supabase/queries/teacher"
import { getQuestionTemplates } from "@/lib/supabase/queries"
import SessionsClient from "./sessions-client"
import { Calendar, Play, MessageSquare, TrendingUp } from "lucide-react"

function SessionsSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Feedback Sessions</h1>
          </div>
          <p className="text-slate-500">Create and manage feedback collection sessions</p>
        </div>
        <div className="w-40 h-10 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="gradient-border-card">
            <div className="card-inner p-5 animate-pulse">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                <div className="w-16 h-6 bg-slate-200 rounded-full" />
              </div>
              <div className="w-12 h-8 bg-slate-200 rounded mb-1" />
              <div className="w-24 h-4 bg-slate-200 rounded" />
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

      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="p-5 animate-pulse">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1">
                  <div className="w-48 h-5 bg-slate-200 rounded mb-2" />
                  <div className="w-32 h-4 bg-slate-200 rounded mb-3" />
                  <div className="flex gap-4">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-32 h-12 bg-slate-200 rounded-xl" />
                  <div className="w-10 h-12 bg-slate-200 rounded-lg" />
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/50 flex items-center justify-between animate-pulse">
              <div className="w-32 h-4 bg-slate-200 rounded" />
              <div className="w-24 h-8 bg-slate-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function SessionsContent() {
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

  const [sessionsResult, stats, coursesData, templatesData] = await Promise.all([
    getTeacherSessionsPaginated({
      userId: user.id,
      page: 1,
      pageSize: 12,
    }),
    getTeacherSessionStats(user.id),
    getTeacherCourses(user.id),
    getQuestionTemplates({
      userId: user.id,
      page: 1,
      pageSize: 100,
      includeBase: true,
    })
  ])

  const sessions = sessionsResult?.data || []

  // Format courses for the modal
  const courses = coursesData.map(c => ({
    id: c.id,
    name: c.name,
    code: c.code,
  }))

  // Format templates for the modal
  const templates = templatesData.data.map(t => ({
    id: t.id,
    name: t.name,
  }))

  return (
    <SessionsClient
      sessions={sessions}
      stats={stats}
      courses={courses}
      templates={templates}
    />
  )
}

export default function SessionsPage() {
  return (
    <Suspense fallback={<SessionsSkeleton />}>
      <SessionsContent />
    </Suspense>
  )
}
