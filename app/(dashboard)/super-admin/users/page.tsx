import { Suspense } from "react"
import { getUsers } from "@/lib/supabase/queries"
import UsersPageClient from "./users-client"

interface PageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    plan?: string
  }>
}

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-16 bg-slate-200 rounded-2xl" />
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  )
}

async function UsersContent({ searchParams }: PageProps) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const search = params.search || ""
  const status = params.status || "all"
  const plan = params.plan || "all"

  const result = await getUsers({
    page,
    pageSize: 10,
    search,
    status,
    plan,
    sortBy: 'created_at',
    sortOrder: 'desc',
  })

  return (
    <UsersPageClient
      initialUsers={result.data}
      totalCount={result.count}
      currentPage={result.page}
      totalPages={result.totalPages}
      pageSize={result.pageSize}
      initialSearch={search}
      initialStatus={status}
      initialPlan={plan}
    />
  )
}

export default function UsersPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <UsersContent searchParams={searchParams} />
    </Suspense>
  )
}
