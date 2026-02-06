import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSessionAnalytics } from "@/lib/actions/analytics"
import AnalyticsClient from "./analytics-client"

export default async function SessionAnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "teacher") {
    redirect("/super-admin")
  }

  // Fetch session analytics
  const result = await getSessionAnalytics(id)

  if (!result.success || !result.data) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 border border-slate-200/60 shadow-sm text-center">
          <p className="text-slate-500">{result.error || "Session not found"}</p>
        </div>
      </div>
    )
  }

  return <AnalyticsClient analytics={result.data} />
}
