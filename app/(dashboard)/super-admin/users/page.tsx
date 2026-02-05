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

// Skeleton for the entire content below header (stats, filters, table)
function ContentSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
            <div className="w-16 h-4 bg-slate-200 rounded mb-2" />
            <div className="w-12 h-7 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm animate-pulse">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex gap-2">
            <div className="w-48 h-9 bg-slate-200 rounded-lg" />
            <div className="w-64 h-9 bg-slate-200 rounded-lg" />
          </div>
          <div className="w-64 h-9 bg-slate-200 rounded-xl" />
        </div>
      </div>

      {/* Users Table Skeleton */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left p-4 text-sm font-semibold text-slate-600">User</th>
                <th className="text-left p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Institution</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden lg:table-cell">Courses</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600">Plan</th>
                <th className="text-center p-4 text-sm font-semibold text-slate-600 hidden sm:table-cell">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full" />
                      <div>
                        <div className="w-32 h-4 bg-slate-200 rounded mb-2" />
                        <div className="w-48 h-3 bg-slate-200 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                  </td>
                  <td className="p-4 text-center hidden lg:table-cell">
                    <div className="w-8 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-16 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="p-4 text-center hidden sm:table-cell">
                    <div className="w-16 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="p-4 text-right">
                    <div className="w-8 h-8 bg-slate-200 rounded-lg ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-slate-100 animate-pulse">
          <div className="w-48 h-4 bg-slate-200 rounded" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded" />
            <div className="w-8 h-8 bg-slate-200 rounded" />
            <div className="w-8 h-8 bg-slate-200 rounded" />
            <div className="w-8 h-8 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
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
      showHeader={false}
    />
  )
}

export default function UsersPage({ searchParams }: PageProps) {
  return (
    <>
      {/* Render header outside Suspense - always visible */}
      <UsersPageClient
        initialUsers={[]}
        totalCount={0}
        currentPage={1}
        totalPages={1}
        pageSize={10}
        initialSearch=""
        initialStatus="all"
        initialPlan="all"
        showHeader={true}
        showContent={false}
      />

      {/* Dynamic Content - Shows skeleton during loading */}
      <Suspense fallback={<ContentSkeleton />}>
        <UsersContent searchParams={searchParams} />
      </Suspense>
    </>
  )
}
