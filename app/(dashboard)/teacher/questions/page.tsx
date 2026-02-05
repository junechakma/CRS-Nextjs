import { Suspense } from "react"
import { createClient } from "@/lib/supabase/server"
import { getQuestionTemplates, getTemplateStats } from "@/lib/supabase/queries"
import QuestionsPageClient from "./questions-client"
import { FileText, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
  }>
}

// Static header that shows immediately
function PageHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Question Templates
          </h1>
        </div>
        <p className="text-slate-500">
          Create and manage reusable question sets
        </p>
      </div>
    </div>
  )
}

// Skeleton for dynamic content only (stats + data list)
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      {/* Filters Skeleton */}
      <div className="h-16 bg-slate-200 rounded-2xl" />
      {/* Templates List Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

async function QuestionsContent({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const search = params.search || ""
  const status = params.status || "all"

  // Get current user
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">Please sign in to view templates</p>
      </div>
    )
  }

  // Fetch templates and stats in parallel
  const [templatesResult, stats] = await Promise.all([
    getQuestionTemplates({
      userId: user.id,
      page,
      pageSize: 10,
      search,
      status,
      includeBase: true,
    }),
    getTemplateStats(user.id),
  ])

  return (
    <QuestionsPageClient
      userId={user.id}
      initialTemplates={templatesResult.data}
      totalCount={templatesResult.count}
      currentPage={templatesResult.page}
      totalPages={templatesResult.totalPages}
      pageSize={templatesResult.pageSize}
      initialSearch={search}
      initialStatus={status}
      stats={stats}
    />
  )
}

export default function QuestionsPage({ searchParams }: PageProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Static header - shows immediately */}
      <PageHeader />

      {/* Dynamic content - shows skeleton while loading */}
      <Suspense fallback={<LoadingSkeleton />}>
        <QuestionsContent searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
