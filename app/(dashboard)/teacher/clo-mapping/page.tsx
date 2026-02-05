import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTeacherCLOSets, getTeacherCourses } from '@/lib/supabase/queries/teacher'
import CLOMappingClient from './clo-mapping-client'
import { Target } from 'lucide-react'

// Static header that shows immediately
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            CLO Mapping
          </h1>
        </div>
        <p className="text-slate-500">
          Create and manage Course Learning Outcome sets
        </p>
      </div>
    </div>
  )
}

// Skeleton for dynamic content only (stats + data)
function CLOMappingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-200 rounded-2xl p-6 h-24"></div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="h-16 bg-slate-200 rounded-2xl"></div>

      {/* CLO Sets Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-slate-200 rounded-2xl p-6 h-80"></div>
        ))}
      </div>
    </div>
  )
}

async function CLOMappingContent() {
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

  // Fetch CLO sets and courses in parallel
  const [cloSets, courses] = await Promise.all([
    getTeacherCLOSets(user.id),
    getTeacherCourses(user.id)
  ])

  // Format courses for the client component
  const formattedCourses = courses.map(course => ({
    id: course.id,
    name: course.name,
    code: course.code
  }))

  return (
    <CLOMappingClient
      cloSets={cloSets}
      courses={formattedCourses}
      userId={user.id}
    />
  )
}

export default function CLOMappingPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Static header - shows immediately */}
      <PageHeader />

      {/* Dynamic content - shows skeleton while loading */}
      <Suspense fallback={<CLOMappingSkeleton />}>
        <CLOMappingContent />
      </Suspense>
    </div>
  )
}
