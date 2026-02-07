import { Suspense } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCLOSet, getCLOs, getAnalysisDocuments } from '@/lib/supabase/queries/teacher'
import CLOSetDetailClient from './clo-set-detail-client'
import { Target, Loader2 } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

function CLOSetDetailSkeleton() {
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

      <div className="h-20 bg-slate-200 rounded-2xl" />

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

async function CLOSetDetailContent({ params }: PageProps) {
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

  // Fetch CLO set, CLOs, and analysis documents
  const [cloSet, clos, documents] = await Promise.all([
    getCLOSet(id, user.id),
    getCLOs(id),
    getAnalysisDocuments(id),
  ])

  if (!cloSet) {
    notFound()
  }

  return (
    <CLOSetDetailClient
      cloSet={cloSet}
      clos={clos}
      initialDocuments={documents}
      userId={user.id}
    />
  )
}

export default function CLOSetDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<CLOSetDetailSkeleton />}>
      <CLOSetDetailContent params={params} />
    </Suspense>
  )
}
