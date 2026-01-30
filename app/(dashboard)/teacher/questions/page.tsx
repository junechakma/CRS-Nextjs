"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Star,
  Copy,
  Edit3,
  Trash2,
  CheckCircle,
  List,
  MessageSquare,
  ToggleLeft,
  Hash,
  ChevronRight,
  Folder,
  FolderOpen,
  Sparkles,
  BookOpen,
  Library,
} from "lucide-react"

const questionTypes = [
  { id: "rating", label: "Rating Scale", icon: Star },
  { id: "text", label: "Open Text", icon: MessageSquare },
  { id: "multiple", label: "Multiple Choice", icon: List },
  { id: "boolean", label: "Yes/No", icon: ToggleLeft },
  { id: "numeric", label: "Numeric", icon: Hash },
]

const categories = [
  { id: "teaching", name: "Teaching Quality", count: 12 },
  { id: "content", name: "Course Content", count: 8 },
  { id: "assessment", name: "Assessment & Feedback", count: 6 },
  { id: "resources", name: "Learning Resources", count: 5 },
  { id: "engagement", name: "Student Engagement", count: 9 },
]

const questions = [
  {
    id: 1,
    text: "How would you rate the clarity of explanations in today's lecture?",
    type: "rating",
    category: "Teaching Quality",
    usageCount: 45,
    isCustom: true,
    lastUsed: "2 days ago",
    clo: "CLO-2",
  },
  {
    id: 2,
    text: "What topics would you like more clarification on?",
    type: "text",
    category: "Course Content",
    usageCount: 32,
    isCustom: true,
    lastUsed: "1 week ago",
    clo: "CLO-1",
  },
  {
    id: 3,
    text: "The pace of the course is appropriate for my learning needs.",
    type: "rating",
    category: "Teaching Quality",
    usageCount: 28,
    isCustom: false,
    lastUsed: "3 days ago",
    clo: "CLO-3",
  },
  {
    id: 4,
    text: "Which learning resources have you found most helpful?",
    type: "multiple",
    category: "Learning Resources",
    usageCount: 15,
    isCustom: true,
    lastUsed: "5 days ago",
    clo: "CLO-4",
  },
  {
    id: 5,
    text: "Do you feel comfortable asking questions during class?",
    type: "boolean",
    category: "Student Engagement",
    usageCount: 52,
    isCustom: false,
    lastUsed: "1 day ago",
    clo: "CLO-5",
  },
  {
    id: 6,
    text: "On a scale of 1-10, how confident do you feel about the exam topics?",
    type: "numeric",
    category: "Assessment & Feedback",
    usageCount: 18,
    isCustom: true,
    lastUsed: "4 days ago",
    clo: "CLO-2",
  },
  {
    id: 7,
    text: "The instructor explains concepts in multiple ways to aid understanding.",
    type: "rating",
    category: "Teaching Quality",
    usageCount: 67,
    isCustom: false,
    lastUsed: "Today",
    clo: "CLO-1",
  },
  {
    id: 8,
    text: "What suggestions do you have for improving the course?",
    type: "text",
    category: "Course Content",
    usageCount: 89,
    isCustom: false,
    lastUsed: "Today",
    clo: null,
  },
]

const stats = [
  {
    title: "My Questions",
    value: "24",
    icon: FileText,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    title: "Common Bank",
    value: "156",
    icon: Library,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Used This Month",
    value: "42",
    icon: CheckCircle,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "CLO Mapped",
    value: "89%",
    icon: Sparkles,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
]

export default function QuestionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("my")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const getTypeIcon = (type: string) => {
    const found = questionTypes.find((t) => t.id === type)
    return found ? found.icon : FileText
  }

  const getTypeLabel = (type: string) => {
    const found = questionTypes.find((t) => t.id === type)
    return found ? found.label : type
  }

  const filteredQuestions = questions.filter((q) => {
    const matchesTab = activeTab === "all" || (activeTab === "my" && q.isCustom) || (activeTab === "common" && !q.isCustom)
    const matchesCategory = !selectedCategory || q.category === selectedCategory
    const matchesSearch = q.text.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesCategory && matchesSearch
  })

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="meteor meteor-1" />
        <div className="meteor meteor-2" />
        <div className="meteor meteor-3" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-delayed-2" />
      </div>

      <Sidebar
        role="teacher"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="relative flex-1 flex flex-col overflow-hidden lg:pl-64 z-10">
        <Header
          userName="Dr. Sarah Johnson"
          userEmail="sarah.j@university.edu"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Question Bank
                  </h1>
                </div>
                <p className="text-slate-500">
                  Create and manage feedback questions for your sessions
                </p>
              </div>
              <Button className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all border-0">
                <Plus className="w-5 h-5" />
                Create Question
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="gradient-border-card card-hover-lift group">
                  <div className="card-inner p-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {stat.value}
                        </h3>
                        <p className="text-sm text-slate-500">{stat.title}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar - Categories */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-4 sticky top-4">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-slate-500" />
                    Categories
                  </h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        !selectedCategory
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>All Categories</span>
                      <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                        {questions.length}
                      </span>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.name
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{category.name}</span>
                        <span className="text-xs font-medium bg-slate-100 px-2 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Question Types */}
                  <h3 className="font-semibold text-slate-900 mt-6 mb-4 flex items-center gap-2">
                    <List className="w-4 h-4 text-slate-500" />
                    Question Types
                  </h3>
                  <div className="space-y-2">
                    {questionTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600"
                      >
                        <type.icon className="w-4 h-4 text-slate-400" />
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content - Questions */}
              <div className="lg:col-span-3 space-y-4">
                {/* Tabs & Search */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex gap-2">
                      {[
                        { id: "my", label: "My Questions" },
                        { id: "common", label: "Common Bank" },
                        { id: "all", label: "All" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeTab === tab.id
                              ? "bg-indigo-100 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full sm:w-auto">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-72 pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-3">
                  {filteredQuestions.map((question) => {
                    const TypeIcon = getTypeIcon(question.type)
                    return (
                      <div
                        key={question.id}
                        className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className="p-2.5 rounded-xl bg-slate-50 group-hover:bg-indigo-50 transition-colors shrink-0">
                            <TypeIcon className="w-5 h-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-900 font-medium mb-2 group-hover:text-indigo-600 transition-colors">
                              {question.text}
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(question.type)}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="text-xs bg-slate-50"
                              >
                                {question.category}
                              </Badge>
                              {question.clo && (
                                <Badge className="text-xs bg-violet-100 text-violet-700 hover:bg-violet-100">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  {question.clo}
                                </Badge>
                              )}
                              {question.isCustom ? (
                                <span className="text-xs text-indigo-600 font-medium">
                                  Custom
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  Common Bank
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stats & Actions */}
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right hidden sm:block">
                              <p className="text-sm font-semibold text-slate-900">
                                {question.usageCount}
                              </p>
                              <p className="text-xs text-slate-500">uses</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <Copy className="w-4 h-4 text-slate-500" />
                              </button>
                              {question.isCustom && (
                                <>
                                  <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                    <Edit3 className="w-4 h-4 text-slate-500" />
                                  </button>
                                  <button className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Empty State */}
                {filteredQuestions.length === 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">
                      No questions found
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => {
                        setSearchQuery("")
                        setSelectedCategory(null)
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
