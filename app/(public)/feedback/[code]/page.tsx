"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Hash,
  List,
  MessageSquare,
  Send,
  Shield,
  Star,
  BookOpen,
  Sparkles,
  Users,
  Loader2,
} from "lucide-react"

// Mock session data - In production, this would be fetched from API
const getSessionByCode = (code: string) => {
  // Simulate different sessions
  const sessions: Record<string, {
    id: number
    name: string
    course: string
    courseCode: string
    teacherName: string
    status: "active" | "expired" | "scheduled"
    expiresAt: string
    questions: Question[]
  }> = {
    "CS401": {
      id: 1,
      name: "Mid-Semester Feedback",
      course: "Introduction to Machine Learning",
      courseCode: "CS401",
      teacherName: "Dr. Sarah Johnson",
      status: "active",
      expiresAt: "2025-01-31T23:59:59",
      questions: [
        {
          id: 1,
          text: "How would you rate the clarity of explanations in today's lecture?",
          type: "rating",
          scale: 5,
          required: true,
        },
        {
          id: 2,
          text: "The pace of the course is appropriate for my learning needs.",
          type: "rating",
          scale: 5,
          required: true,
        },
        {
          id: 3,
          text: "Do you feel comfortable asking questions during class?",
          type: "boolean",
          required: true,
        },
        {
          id: 4,
          text: "Which teaching method do you find most effective?",
          type: "multiple",
          required: false,
          options: [
            "Lecture with slides",
            "Live coding demonstrations",
            "Group discussions",
            "Hands-on exercises",
          ],
        },
        {
          id: 5,
          text: "What suggestions do you have for improving the course?",
          type: "text",
          required: false,
        },
        {
          id: 6,
          text: "On a scale of 1-10, how likely are you to recommend this course?",
          type: "numeric",
          required: true,
          min: 1,
          max: 10,
        },
      ],
    },
    "DEMO": {
      id: 2,
      name: "Demo Feedback Session",
      course: "Demo Course",
      courseCode: "DEMO",
      teacherName: "Demo Teacher",
      status: "active",
      expiresAt: "2025-12-31T23:59:59",
      questions: [
        {
          id: 1,
          text: "How would you rate your overall experience?",
          type: "rating",
          scale: 5,
          required: true,
        },
        {
          id: 2,
          text: "Would you recommend this to others?",
          type: "boolean",
          required: true,
        },
        {
          id: 3,
          text: "Any additional feedback?",
          type: "text",
          required: false,
        },
      ],
    },
  }

  return sessions[code.toUpperCase()] || null
}

interface Question {
  id: number
  text: string
  type: "rating" | "boolean" | "multiple" | "text" | "numeric"
  required: boolean
  scale?: number
  options?: string[]
  min?: number
  max?: number
}

interface Response {
  questionId: number
  value: number | string | boolean | null
}

type SessionData = {
  id: number
  name: string
  course: string
  courseCode: string
  teacherName: string
  status: "active" | "expired" | "scheduled"
  expiresAt: string
  questions: Question[]
} | null

export default function SessionResponsePage() {
  const params = useParams()
  const router = useRouter()
  const code = (params.code as string)?.toUpperCase()

  const [session, setSession] = useState<SessionData>(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Response[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const sessionData = getSessionByCode(code)
      setSession(sessionData)
      if (sessionData) {
        setResponses(
          sessionData.questions.map((q) => ({
            questionId: q.id,
            value: null,
          }))
        )
      }
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [code])

  const currentQ = session?.questions[currentQuestion]
  const currentResponse = responses.find((r) => r.questionId === currentQ?.id)
  const progress = session ? ((currentQuestion + 1) / session.questions.length) * 100 : 0

  const updateResponse = (value: number | string | boolean | null) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.questionId === currentQ?.id ? { ...r, value } : r
      )
    )
  }

  const canProceed = () => {
    if (!currentQ?.required) return true
    return currentResponse?.value !== null && currentResponse?.value !== ""
  }

  const handleNext = () => {
    if (session && currentQuestion < session.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const isLastQuestion = session && currentQuestion === session.questions.length - 1

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading session...</p>
        </div>
      </div>
    )
  }

  // Session not found
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6">
            <Hash className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Not Found</h1>
          <p className="text-slate-600 mb-8">
            The session code &quot;{code}&quot; doesn&apos;t exist or has expired. Please check the code and try again.
          </p>
          <Link href="/feedback">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
              Enter a Different Code
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Session expired
  if (session.status === "expired") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h1>
          <p className="text-slate-600 mb-8">
            This feedback session has ended. Please contact your instructor if you believe this is an error.
          </p>
          <Link href="/feedback">
            <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
              Enter a Different Code
            </button>
          </Link>
        </div>
      </div>
    )
  }

  // Submission success
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <style jsx global>{`
          @keyframes checkmark {
            0% { stroke-dashoffset: 100; }
            100% { stroke-dashoffset: 0; }
          }
          .checkmark-animate {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: checkmark 0.6s ease-out forwards;
            animation-delay: 0.2s;
          }
        `}</style>
        <div className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-200">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Thank You!</h1>
          <p className="text-slate-600 mb-2">Your anonymous feedback has been submitted successfully.</p>
          <p className="text-sm text-slate-500 mb-8">
            Your response helps improve the learning experience for everyone.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/">
              <button className="w-full px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors">
                Return to Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      <style jsx global>{`
        .aurora-bg {
          background:
            radial-gradient(at 0% 0%, rgba(70, 140, 254, 0.15) 0, transparent 50%),
            radial-gradient(at 50% 0%, rgba(59, 130, 246, 0.1) 0, transparent 50%),
            radial-gradient(at 100% 0%, rgba(96, 165, 250, 0.1) 0, transparent 50%);
          background-size: 200% 200%;
          animation: aurora 20s ease infinite;
        }

        @keyframes aurora {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .grid-bg {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .float-anim {
          animation: float 6s ease-in-out infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, #468cfe 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Background Effects */}
      <div className="fixed inset-0 aurora-bg pointer-events-none" />
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed top-1/4 left-10 w-64 h-64 bg-blue-300/20 rounded-full blur-3xl float-anim pointer-events-none" />
      <div className="fixed bottom-1/4 right-10 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl float-anim pointer-events-none" style={{ animationDelay: "-3s" }} />

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Exit</span>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Anonymous Response</span>
            </div>
          </div>
        </div>
      </header>

      {/* Session Info */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {session.courseCode}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">Active</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900">{session.name}</h1>
              <p className="text-sm text-slate-600 mt-1">{session.course}</p>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{session.teacherName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{session.questions.length} questions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>Question {currentQuestion + 1} of {session.questions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        {currentQ && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden">
            {/* Question Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  currentQ.type === "rating" ? "bg-amber-100" :
                  currentQ.type === "boolean" ? "bg-emerald-100" :
                  currentQ.type === "multiple" ? "bg-violet-100" :
                  currentQ.type === "text" ? "bg-blue-100" :
                  "bg-rose-100"
                }`}>
                  {currentQ.type === "rating" && <Star className="w-6 h-6 text-amber-600" />}
                  {currentQ.type === "boolean" && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
                  {currentQ.type === "multiple" && <List className="w-6 h-6 text-violet-600" />}
                  {currentQ.type === "text" && <MessageSquare className="w-6 h-6 text-blue-600" />}
                  {currentQ.type === "numeric" && <Hash className="w-6 h-6 text-rose-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
                    {currentQ.text}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      currentQ.type === "rating" ? "bg-amber-50 text-amber-700" :
                      currentQ.type === "boolean" ? "bg-emerald-50 text-emerald-700" :
                      currentQ.type === "multiple" ? "bg-violet-50 text-violet-700" :
                      currentQ.type === "text" ? "bg-blue-50 text-blue-700" :
                      "bg-rose-50 text-rose-700"
                    }`}>
                      {currentQ.type === "rating" && "Rating Scale"}
                      {currentQ.type === "boolean" && "Yes / No"}
                      {currentQ.type === "multiple" && "Multiple Choice"}
                      {currentQ.type === "text" && "Open Text"}
                      {currentQ.type === "numeric" && "Numeric"}
                    </span>
                    {currentQ.required && (
                      <span className="text-xs text-red-500 font-medium">Required</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Response Area */}
            <div className="p-6 sm:p-8">
              {/* Rating Type */}
              {currentQ.type === "rating" && currentQ.scale && (
                <div className="flex flex-wrap justify-center gap-3">
                  {Array.from({ length: currentQ.scale }, (_, i) => i + 1).map((value) => (
                    <button
                      key={value}
                      onClick={() => updateResponse(value)}
                      className={`w-16 h-16 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                        currentResponse?.value === value
                          ? "border-amber-400 bg-amber-50 shadow-lg shadow-amber-100"
                          : "border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                      }`}
                    >
                      <Star className={`w-6 h-6 ${
                        currentResponse?.value === value || (typeof currentResponse?.value === "number" && value <= currentResponse.value)
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`} />
                      <span className="text-sm font-medium text-slate-600">{value}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Boolean Type */}
              {currentQ.type === "boolean" && (
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => updateResponse(true)}
                    className={`flex-1 max-w-48 p-6 rounded-2xl border-2 transition-all ${
                      currentResponse?.value === true
                        ? "border-emerald-400 bg-emerald-50 shadow-lg shadow-emerald-100"
                        : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    <CheckCircle2 className={`w-10 h-10 mx-auto mb-3 ${
                      currentResponse?.value === true ? "text-emerald-500" : "text-slate-300"
                    }`} />
                    <p className="text-lg font-semibold text-slate-900">Yes</p>
                  </button>
                  <button
                    onClick={() => updateResponse(false)}
                    className={`flex-1 max-w-48 p-6 rounded-2xl border-2 transition-all ${
                      currentResponse?.value === false
                        ? "border-red-400 bg-red-50 shadow-lg shadow-red-100"
                        : "border-slate-200 hover:border-red-300 hover:bg-red-50/50"
                    }`}
                  >
                    <div className={`w-10 h-10 mx-auto mb-3 rounded-full border-4 ${
                      currentResponse?.value === false ? "border-red-400" : "border-slate-300"
                    }`} />
                    <p className="text-lg font-semibold text-slate-900">No</p>
                  </button>
                </div>
              )}

              {/* Multiple Choice Type */}
              {currentQ.type === "multiple" && currentQ.options && (
                <div className="space-y-3">
                  {currentQ.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateResponse(option)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${
                        currentResponse?.value === option
                          ? "border-violet-400 bg-violet-50 shadow-lg shadow-violet-100"
                          : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        currentResponse?.value === option
                          ? "border-violet-500 bg-violet-500"
                          : "border-slate-300"
                      }`}>
                        {currentResponse?.value === option && (
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="font-medium text-slate-700">{option}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Text Type */}
              {currentQ.type === "text" && (
                <div>
                  <textarea
                    value={(currentResponse?.value as string) || ""}
                    onChange={(e) => updateResponse(e.target.value)}
                    placeholder="Type your response here..."
                    rows={5}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    {((currentResponse?.value as string) || "").length} characters
                  </p>
                </div>
              )}

              {/* Numeric Type */}
              {currentQ.type === "numeric" && (
                <div>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-sm text-slate-500">{currentQ.min || 1}</span>
                    <input
                      type="range"
                      min={currentQ.min || 1}
                      max={currentQ.max || 10}
                      value={(currentResponse?.value as number) || currentQ.min || 1}
                      onChange={(e) => updateResponse(parseInt(e.target.value))}
                      className="flex-1 max-w-md h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <span className="text-sm text-slate-500">{currentQ.max || 10}</span>
                  </div>
                  <div className="text-center">
                    <span className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white text-3xl font-bold shadow-xl shadow-rose-200">
                      {(currentResponse?.value as number) || currentQ.min || 1}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    currentQuestion === 0
                      ? "text-slate-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>

                {isLastQuestion ? (
                  <button
                    onClick={handleSubmit}
                    disabled={!canProceed() || isSubmitting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      canProceed() && !isSubmitting
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Feedback
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      canProceed()
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg hover:shadow-blue-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Question Navigation Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {session.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentQuestion
                  ? "bg-blue-500 w-8"
                  : responses[idx]?.value !== null && responses[idx]?.value !== ""
                  ? "bg-emerald-400"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
