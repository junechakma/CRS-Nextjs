"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  FolderOpen,
  FileText,
  MessageSquare,
  Star,
} from "lucide-react"

const categories = [
  { id: 1, name: "Course Feedback", count: 124, color: "from-blue-500 to-cyan-500" },
  { id: 2, name: "Teaching Quality", count: 89, color: "from-emerald-500 to-teal-500" },
  { id: 3, name: "Assessment", count: 67, color: "from-violet-500 to-purple-500" },
  { id: 4, name: "Learning Resources", count: 45, color: "from-amber-500 to-orange-500" },
  { id: 5, name: "Student Engagement", count: 56, color: "from-pink-500 to-rose-500" },
]

const questions = [
  { id: 1, question: "How would you rate the overall quality of instruction in this course?", category: "Teaching Quality", type: "Rating Scale", usageCount: 156, isFavorite: true },
  { id: 2, question: "The course materials were well-organized and easy to follow.", category: "Learning Resources", type: "Likert Scale", usageCount: 134, isFavorite: true },
  { id: 3, question: "What aspects of the course did you find most valuable?", category: "Course Feedback", type: "Open Text", usageCount: 98, isFavorite: false },
  { id: 4, question: "The assessments accurately measured my understanding of the material.", category: "Assessment", type: "Likert Scale", usageCount: 87, isFavorite: false },
  { id: 5, question: "How engaged did you feel during class sessions?", category: "Student Engagement", type: "Rating Scale", usageCount: 76, isFavorite: true },
  { id: 6, question: "What suggestions do you have for improving this course?", category: "Course Feedback", type: "Open Text", usageCount: 145, isFavorite: false },
]

const typeColors: Record<string, string> = {
  "Rating Scale": "bg-blue-100 text-blue-700",
  "Likert Scale": "bg-emerald-100 text-emerald-700",
  "Open Text": "bg-violet-100 text-violet-700",
}

export default function QuestionBankPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <div className="fixed inset-0 bg-grid-small [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#8b5cf6" />

      <Sidebar role="super-admin" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header userName="Admin User" userEmail="admin@crs.com" onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 p-2.5 shadow-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Question Bank</h1>
              </div>
              <p className="text-slate-500 text-sm">Manage and organize your feedback questions</p>
            </div>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Question</span>
            </Button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-slate-700 mb-3">Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name === selectedCategory ? "all" : category.name)}
                  className={`group p-4 rounded-xl border transition-all ${
                    selectedCategory === category.name
                      ? "border-violet-300 bg-violet-50 shadow-md"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center shadow-sm`}>
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-slate-900 truncate">{category.name}</p>
                      <p className="text-xs text-slate-500">{category.count} questions</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-input overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{filteredQuestions.length} questions</Badge>
                  {selectedCategory !== "all" && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCategory("all")} className="text-xs">
                      Clear filter
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-3">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="group p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                        <p className="text-sm font-medium text-slate-900 line-clamp-2">{question.question}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="text-xs">{question.category}</Badge>
                        <Badge className={`text-xs ${typeColors[question.type]}`}>{question.type}</Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          Used {question.usageCount} times
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className={`h-8 w-8 p-0 ${question.isFavorite ? "text-amber-500" : "text-slate-400 hover:text-amber-500"}`}>
                        <Star className={`h-4 w-4 ${question.isFavorite ? "fill-current" : ""}`} />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-amber-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
