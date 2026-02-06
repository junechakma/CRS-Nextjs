import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCLOSet, getCLOs, getAnalysisDocuments } from '@/lib/supabase/queries/teacher'
import CLOAnalyticsClient from './analytics-client'
import { Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function CLOAnalyticsSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 w-32 bg-slate-200 rounded" />
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-2" />
            <div className="h-4 w-48 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}

async function CLOAnalyticsContent({ params }: PageProps) {
  const { id } = await params
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

  // Fetch CLO set, CLOs, and existing analysis documents
  const [cloSet, clos, documents] = await Promise.all([
    getCLOSet(id, user.id),
    getCLOs(id),
    getAnalysisDocuments(id),
  ])

  if (!cloSet) {
    notFound()
  }

  return (
    <CLOAnalyticsClient
      cloSet={cloSet}
      clos={clos}
      initialDocuments={documents}
      userId={user.id}
    />
  )
}

export default function CLOAnalyticsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CLOAnalyticsSkeleton />}>
      <CLOAnalyticsContent params={params} />
    </Suspense>
  )
}
