import { Suspense } from "react"
import { getBaseTemplate, getBaseTemplateStats } from "@/lib/supabase/queries"
import QuestionBankClient from "./question-bank-client"

function LoadingSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-20 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-8 bg-slate-200 rounded-xl w-40" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
      <div className="h-48 bg-slate-200 rounded-2xl" />
    </div>
  )
}

async function QuestionBankContent() {
  // Fetch base template and stats in parallel
  const [baseTemplate, stats] = await Promise.all([
    getBaseTemplate(),
    getBaseTemplateStats(),
  ])

  return (
    <QuestionBankClient
      baseTemplate={baseTemplate}
      stats={stats}
    />
  )
}

export default function QuestionBankPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <QuestionBankContent />
    </Suspense>
  )
}
