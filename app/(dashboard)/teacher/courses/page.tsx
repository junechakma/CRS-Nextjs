import { Suspense } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getTeacherCourses, getTeacherSemestersList } from "@/lib/supabase/queries/teacher"
import CoursesClient from "./courses-client"
import { GraduationCap } from "lucide-react"

function CoursesSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">My Courses</h1>
          </div>
          <p className="text-slate-500">Manage your courses and track student engagement</p>
        </div>
        <div className="w-40 h-10 bg-slate-200 rounded-lg animate-pulse" />
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
              <div className="w-48 h-5 bg-slate-200 rounded mb-2" />
              <div className="w-24 h-4 bg-slate-200 rounded mb-4" />
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-16 bg-slate-200 rounded-lg" />
                ))}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="w-20 h-4 bg-slate-200 rounded" />
                <div className="w-24 h-4 bg-slate-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

async function CoursesContent() {
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

  const [courses, semesters] = await Promise.all([
    getTeacherCourses(user.id),
    getTeacherSemestersList(user.id)
  ])

  return (
    <CoursesClient
      courses={courses}
      semesters={semesters}
    />
  )
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesSkeleton />}>
      <CoursesContent />
    </Suspense>
  )
}
