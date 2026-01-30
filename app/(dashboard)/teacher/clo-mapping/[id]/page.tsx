"use client"

import { useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar/sidebar"
import { Header } from "@/components/layout/header/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Target,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  X,
  Save,
  FileText,
  Upload,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileUp,
  File,
  Link2,
  Clock,
  GraduationCap,
  Zap,
  TrendingUp,
  Lightbulb,
  Download,
  AlertTriangle,
  ThumbsUp,
  XCircle,
  Brain,
  Copy,
  Check,
} from "lucide-react"

interface CLO {
  id: number
  code: string
  description: string
  bloomLevel: string
  status: "active" | "inactive"
}

interface CLOMapping {
  cloNumber: string
  cloDescription: string
  relevanceScore: number
  reasoning: string
}

interface BloomsAnalysis {
  detectedLevel: string
  reasoning: string
}

interface ImprovedQuestion {
  questionText: string
  targetCLO: string
  targetBlooms: string
  explanation: string
}

interface ExtractedQuestion {
  id: number
  questionNumber: number
  questionText: string
  bloomsAnalysis: BloomsAnalysis
  mappedCLOs: CLOMapping[]
  issues: string[]
  improvedQuestion?: ImprovedQuestion
  source: string
}

interface UploadedDoc {
  id: number
  name: string
  type: string
  size: string
  uploadedAt: string
  status: "processing" | "processed" | "error"
  questionsExtracted: number
}

interface ProcessingResult {
  totalQuestions: number
  successfullyMapped: number
  unmappedQuestions: number
  processingTimeMs: number
  overallSummary: string
  recommendations: string[]
  extractedQuestions: ExtractedQuestion[]
}

// Mock CLO Set data
const cloSetData = {
  id: 1,
  name: "ML Fundamentals CLO Set",
  description: "Core learning outcomes covering machine learning fundamentals, supervised learning, and model evaluation techniques.",
  courseId: 1,
  courseName: "Introduction to Machine Learning",
  courseCode: "CS401",
  createdAt: "Jan 28, 2025",
  status: "active",
}

// Mock CLOs
const initialCLOs: CLO[] = [
  {
    id: 1,
    code: "CLO-1",
    description: "Understand fundamental concepts of machine learning algorithms and their applications in real-world scenarios",
    bloomLevel: "Understanding",
    status: "active",
  },
  {
    id: 2,
    code: "CLO-2",
    description: "Apply supervised learning techniques to solve classification and regression problems",
    bloomLevel: "Applying",
    status: "active",
  },
  {
    id: 3,
    code: "CLO-3",
    description: "Evaluate and compare different machine learning models using appropriate metrics and validation techniques",
    bloomLevel: "Evaluating",
    status: "active",
  },
  {
    id: 4,
    code: "CLO-4",
    description: "Analyze the trade-offs between model complexity, interpretability, and performance",
    bloomLevel: "Analyzing",
    status: "active",
  },
  {
    id: 5,
    code: "CLO-5",
    description: "Create end-to-end machine learning pipelines for data preprocessing, training, and deployment",
    bloomLevel: "Creating",
    status: "active",
  },
]

// Mock uploaded documents
const initialDocs: UploadedDoc[] = [
  {
    id: 1,
    name: "ML_Midterm_Exam_2024.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadedAt: "2 days ago",
    status: "processed",
    questionsExtracted: 15,
  },
  {
    id: 2,
    name: "Assignment_3_Questions.docx",
    type: "docx",
    size: "856 KB",
    uploadedAt: "1 week ago",
    status: "processed",
    questionsExtracted: 8,
  },
]

// Mock processing result with detailed question analysis
const mockProcessingResult: ProcessingResult = {
  totalQuestions: 23,
  successfullyMapped: 19,
  unmappedQuestions: 4,
  processingTimeMs: 8500,
  overallSummary: "Document analysis complete. 19 of 23 questions successfully mapped to CLOs. Most questions align well with CLO-1 and CLO-2. Consider revising 4 questions that couldn't be mapped to any learning outcome.",
  recommendations: [
    "Add more questions targeting CLO-5 (Creating) - currently underrepresented",
    "Questions 8 and 15 are too vague - consider making them more specific",
    "Several questions could better align with Bloom's higher-order thinking",
    "Consider adding practical application questions for CLO-2",
  ],
  extractedQuestions: [
    {
      id: 1,
      questionNumber: 1,
      questionText: "Explain the difference between supervised and unsupervised learning. Provide two real-world examples for each.",
      bloomsAnalysis: {
        detectedLevel: "Understanding",
        reasoning: "The question asks students to explain and provide examples, which requires comprehension and the ability to illustrate concepts.",
      },
      mappedCLOs: [
        {
          cloNumber: "CLO-1",
          cloDescription: "Understand fundamental concepts of machine learning algorithms and their applications",
          relevanceScore: 95,
          reasoning: "Directly tests understanding of core ML concepts and real-world applications.",
        },
      ],
      issues: [],
      source: "ML_Midterm_Exam_2024.pdf",
    },
    {
      id: 2,
      questionNumber: 2,
      questionText: "What is linear regression?",
      bloomsAnalysis: {
        detectedLevel: "Remembering",
        reasoning: "Simple recall question that only asks for a definition without requiring deeper understanding.",
      },
      mappedCLOs: [
        {
          cloNumber: "CLO-1",
          cloDescription: "Understand fundamental concepts of machine learning algorithms",
          relevanceScore: 55,
          reasoning: "Tests basic recall but doesn't fully assess understanding of applications.",
        },
      ],
      issues: [
        "Question is too basic - only tests recall, not understanding",
        "Doesn't require students to demonstrate application knowledge",
        "Could be answered with a memorized definition",
      ],
      improvedQuestion: {
        questionText: "Explain how linear regression works and describe a scenario where you would choose it over polynomial regression. What assumptions must be satisfied for linear regression to be valid?",
        targetCLO: "CLO-1",
        targetBlooms: "Understanding",
        explanation: "The improved question requires students to explain the mechanism, make decisions between approaches, and understand underlying assumptions - testing deeper comprehension.",
      },
      source: "ML_Midterm_Exam_2024.pdf",
    },
    {
      id: 3,
      questionNumber: 3,
      questionText: "Implement a decision tree classifier for the Iris dataset. Evaluate its performance using 5-fold cross-validation and report precision, recall, and F1-score.",
      bloomsAnalysis: {
        detectedLevel: "Applying",
        reasoning: "Requires hands-on implementation and application of evaluation techniques to a specific dataset.",
      },
      mappedCLOs: [
        {
          cloNumber: "CLO-2",
          cloDescription: "Apply supervised learning techniques to solve classification problems",
          relevanceScore: 92,
          reasoning: "Directly tests ability to implement and apply supervised learning methods.",
        },
        {
          cloNumber: "CLO-3",
          cloDescription: "Evaluate and compare ML models using appropriate metrics",
          relevanceScore: 85,
          reasoning: "Requires using evaluation metrics and validation techniques.",
        },
      ],
      issues: [],
      source: "Assignment_3_Questions.docx",
    },
    {
      id: 4,
      questionNumber: 4,
      questionText: "Compare and contrast precision and recall. When would you prioritize one over the other? Provide examples from healthcare and spam detection.",
      bloomsAnalysis: {
        detectedLevel: "Analyzing",
        reasoning: "Requires analysis of trade-offs and contextual decision-making across different domains.",
      },
      mappedCLOs: [
        {
          cloNumber: "CLO-3",
          cloDescription: "Evaluate and compare different machine learning models using appropriate metrics",
          relevanceScore: 90,
          reasoning: "Tests deep understanding of evaluation metrics and their practical implications.",
        },
        {
          cloNumber: "CLO-4",
          cloDescription: "Analyze trade-offs between model complexity, interpretability, and performance",
          relevanceScore: 75,
          reasoning: "Touches on trade-off analysis in different contexts.",
        },
      ],
      issues: [],
      source: "ML_Midterm_Exam_2024.pdf",
    },
    {
      id: 5,
      questionNumber: 5,
      questionText: "List the steps of machine learning.",
      bloomsAnalysis: {
        detectedLevel: "Remembering",
        reasoning: "Simple list recall with no analysis or application required.",
      },
      mappedCLOs: [],
      issues: [
        "Too vague - 'steps of machine learning' is not specific",
        "Only requires memorization, not understanding",
        "Doesn't map to any specific CLO effectively",
        "Consider specifying which ML workflow or pipeline you mean",
      ],
      improvedQuestion: {
        questionText: "Describe the complete machine learning pipeline from data collection to model deployment. For each step, explain potential challenges and best practices. Use a real-world example to illustrate.",
        targetCLO: "CLO-5",
        targetBlooms: "Creating",
        explanation: "Transforms a recall question into one that requires synthesizing knowledge about the entire ML workflow, addressing the underrepresented CLO-5.",
      },
      source: "ML_Midterm_Exam_2024.pdf",
    },
    {
      id: 6,
      questionNumber: 6,
      questionText: "Discuss the bias-variance tradeoff. How does model complexity affect this tradeoff? Illustrate with examples of underfitting and overfitting.",
      bloomsAnalysis: {
        detectedLevel: "Analyzing",
        reasoning: "Requires analysis of relationships between concepts and illustration with examples.",
      },
      mappedCLOs: [
        {
          cloNumber: "CLO-4",
          cloDescription: "Analyze the trade-offs between model complexity, interpretability, and performance",
          relevanceScore: 98,
          reasoning: "Perfectly aligned with CLO about analyzing model trade-offs.",
        },
      ],
      issues: [],
      source: "ML_Midterm_Exam_2024.pdf",
    },
  ],
}

const bloomLevels = [
  "Remembering",
  "Understanding",
  "Applying",
  "Analyzing",
  "Evaluating",
  "Creating",
]

export default function CLOSetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [clos, setClos] = useState<CLO[]>(initialCLOs)
  const [docs, setDocs] = useState<UploadedDoc[]>(initialDocs)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([])
  const [isAddCLOModalOpen, setIsAddCLOModalOpen] = useState(false)
  const [editingCLO, setEditingCLO] = useState<CLO | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<"clos" | "documents" | "analytics">("clos")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [formCode, setFormCode] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formBloomLevel, setFormBloomLevel] = useState("Understanding")

  const toggleQuestion = (id: number) => {
    setExpandedQuestions((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    )
  }

  const handleAddCLO = () => {
    if (!formCode || !formDescription) return

    const newCLO: CLO = {
      id: Date.now(),
      code: formCode,
      description: formDescription,
      bloomLevel: formBloomLevel,
      status: "active",
    }

    setClos((prev) => [...prev, newCLO])
    setIsAddCLOModalOpen(false)
    resetForm()
  }

  const handleEditCLO = () => {
    if (!editingCLO || !formCode || !formDescription) return

    setClos((prev) =>
      prev.map((clo) =>
        clo.id === editingCLO.id
          ? { ...clo, code: formCode, description: formDescription, bloomLevel: formBloomLevel }
          : clo
      )
    )
    setEditingCLO(null)
    resetForm()
  }

  const handleDeleteCLO = (id: number) => {
    setClos((prev) => prev.filter((clo) => clo.id !== id))
  }

  const resetForm = () => {
    setFormCode("")
    setFormDescription("")
    setFormBloomLevel("Understanding")
  }

  const openEditModal = (clo: CLO) => {
    setEditingCLO(clo)
    setFormCode(clo.code)
    setFormDescription(clo.description)
    setFormBloomLevel(clo.bloomLevel)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const newDoc: UploadedDoc = {
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.name.split(".").pop() || "unknown",
        size: `${(file.size / 1024).toFixed(0)} KB`,
        uploadedAt: "Just now",
        status: "processing",
        questionsExtracted: 0,
      }
      setDocs((prev) => [newDoc, ...prev])

      // Simulate processing
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((doc) =>
            doc.id === newDoc.id
              ? { ...doc, status: "processed", questionsExtracted: Math.floor(Math.random() * 10) + 5 }
              : doc
          )
        )
      }, 3000)
    })

    setIsUploadModalOpen(false)
  }

  const handleDeleteDoc = (id: number) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id))
  }

  const startAIProcessing = () => {
    setShowAnalytics(true)
    setIsProcessing(true)
    setProcessingResult(null)

    // Simulate AI processing
    setTimeout(() => {
      setIsProcessing(false)
      setProcessingResult(mockProcessingResult)
      setActiveTab("analytics")
    }, 3000)
  }

  const copyImprovedQuestion = (question: ImprovedQuestion, id: number) => {
    navigator.clipboard.writeText(question.questionText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const getBloomColor = (level: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      Remembering: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
      Understanding: { bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-200" },
      Applying: { bg: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-200" },
      Analyzing: { bg: "bg-amber-100", text: "text-amber-600", border: "border-amber-200" },
      Evaluating: { bg: "bg-violet-100", text: "text-violet-600", border: "border-violet-200" },
      Creating: { bg: "bg-rose-100", text: "text-rose-600", border: "border-rose-200" },
    }
    return colors[level] || colors.Understanding
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200"
    if (score >= 60) return "text-blue-600 bg-blue-50 border-blue-200"
    if (score >= 40) return "text-amber-600 bg-amber-50 border-amber-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  // Categorize questions
  const categorizeQuestions = (questions: ExtractedQuestion[]) => {
    const perfect = questions.filter(
      (q) => q.mappedCLOs.length > 0 && q.mappedCLOs.some((m) => m.relevanceScore >= 80) && q.issues.length === 0
    )
    const good = questions.filter(
      (q) =>
        q.mappedCLOs.length > 0 &&
        q.mappedCLOs.every((m) => m.relevanceScore >= 60 && m.relevanceScore < 80) &&
        q.issues.length <= 2
    )
    const needsImprovement = questions.filter(
      (q) =>
        (q.mappedCLOs.length > 0 && q.mappedCLOs.some((m) => m.relevanceScore < 60)) ||
        q.issues.length > 2
    )
    const unmapped = questions.filter((q) => q.mappedCLOs.length === 0)

    return { perfect, good, needsImprovement, unmapped }
  }

  const categories = processingResult ? categorizeQuestions(processingResult.extractedQuestions) : null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
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
            {/* Back Button & Header */}
            <div className="flex flex-col gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to CLO Sets</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                      {cloSetData.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-600">{cloSetData.courseName}</span>
                      <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {cloSetData.courseCode}
                      </span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={startAIProcessing}
                  className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-200 transition-all border-0"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze Documents
                </Button>
              </div>
            </div>

            {/* Info Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm">
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  {cloSetData.courseName}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Target className="w-4 h-4 text-slate-400" />
                  {clos.length} CLOs defined
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FileText className="w-4 h-4 text-slate-400" />
                  {docs.reduce((acc, doc) => acc + doc.questionsExtracted, 0)} questions extracted
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Created {cloSetData.createdAt}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm">
              <p className="text-slate-600">{cloSetData.description}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("clos")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "clos"
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    CLOs ({clos.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("documents")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "documents"
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileUp className="w-4 h-4" />
                    Documents ({docs.length})
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("analytics")}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === "analytics"
                      ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Brain className="w-4 h-4" />
                    Analytics
                    {processingResult && (
                      <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    )}
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {/* CLOs Tab */}
                {activeTab === "clos" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Course Learning Outcomes</h3>
                      <Button
                        onClick={() => setIsAddCLOModalOpen(true)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      >
                        <Plus className="w-4 h-4" />
                        Add CLO
                      </Button>
                    </div>

                    {clos.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Target className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">No CLOs defined yet</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Add your first Course Learning Outcome to get started
                        </p>
                        <Button onClick={() => setIsAddCLOModalOpen(true)} className="gap-2">
                          <Plus className="w-4 h-4" />
                          Add First CLO
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clos.map((clo) => {
                          const bloomColors = getBloomColor(clo.bloomLevel)

                          return (
                            <div
                              key={clo.id}
                              className="bg-slate-50 rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex items-center gap-3 shrink-0">
                                  <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100 font-mono">
                                    {clo.code}
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-700">{clo.description}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge className={`${bloomColors.bg} ${bloomColors.text} border-0 text-xs`}>
                                      {clo.bloomLevel}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                    onClick={() => openEditModal(clo)}
                                    className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                                  >
                                    <Pencil className="w-4 h-4 text-slate-400" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCLO(clo.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "documents" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
                      <Button
                        onClick={() => setIsUploadModalOpen(true)}
                        size="sm"
                        className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Document
                      </Button>
                    </div>

                    {docs.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <FileUp className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">No documents uploaded</h3>
                        <p className="text-sm text-slate-500 mb-4">
                          Upload PDFs or docs containing questions to analyze
                        </p>
                        <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
                          <Upload className="w-4 h-4" />
                          Upload First Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200"
                          >
                            <div className="p-3 rounded-xl bg-white border border-slate-200">
                              <File className={`w-6 h-6 ${
                                doc.type === "pdf" ? "text-red-500" : "text-blue-500"
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-slate-900 truncate">{doc.name}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500">{doc.size}</span>
                                <span className="text-xs text-slate-400">•</span>
                                <span className="text-xs text-slate-500">{doc.uploadedAt}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {doc.status === "processing" ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Processing
                                </span>
                              ) : doc.status === "processed" ? (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {doc.questionsExtracted} questions
                                </span>
                              ) : (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-full">
                                  <AlertCircle className="w-3 h-3" />
                                  Error
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Analytics Tab */}
                {activeTab === "analytics" && (
                  <div className="space-y-6">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                            <Sparkles className="w-10 h-10 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
                          </div>
                        </div>
                        <p className="text-lg font-medium text-slate-900 mt-6">Analyzing documents...</p>
                        <p className="text-sm text-slate-500 mt-1">AI is extracting questions and mapping to CLOs</p>
                        <div className="flex gap-1 mt-4">
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    ) : !processingResult ? (
                      <div className="text-center py-16">
                        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <Brain className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">No analysis yet</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                          Upload documents and click "Analyze Documents" to extract questions and map them to your CLOs
                        </p>
                        <Button onClick={startAIProcessing} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                          <Sparkles className="w-4 h-4" />
                          Start Analysis
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Warning Banner */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-amber-800">
                                This analysis is not saved automatically
                              </p>
                              <p className="text-sm text-amber-700 mt-1">
                                Download the report before leaving, or the analysis will be lost.
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="shrink-0 gap-2 border-amber-300 text-amber-700 hover:bg-amber-100">
                              <Download className="w-4 h-4" />
                              Download Report
                            </Button>
                          </div>
                        </div>

                        {/* Summary Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100 p-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-2">Analysis Summary</h3>
                              <p className="text-sm text-slate-600 mb-4">{processingResult.overallSummary}</p>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-white rounded-xl p-4 border border-indigo-100">
                                  <p className="text-xs text-slate-500">Total Questions</p>
                                  <p className="text-2xl font-bold text-slate-900">{processingResult.totalQuestions}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-emerald-100">
                                  <p className="text-xs text-emerald-600">Mapped</p>
                                  <p className="text-2xl font-bold text-emerald-600">{processingResult.successfullyMapped}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-red-100">
                                  <p className="text-xs text-red-600">Unmapped</p>
                                  <p className="text-2xl font-bold text-red-600">{processingResult.unmappedQuestions}</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border border-slate-100">
                                  <p className="text-xs text-slate-500">Processing Time</p>
                                  <p className="text-2xl font-bold text-slate-900">{(processingResult.processingTimeMs / 1000).toFixed(1)}s</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Question Quality Breakdown */}
                        {categories && (
                          <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Question Quality Breakdown</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                  <span className="text-3xl font-bold text-emerald-700">{categories.perfect.length}</span>
                                </div>
                                <p className="font-medium text-emerald-800">Perfect Questions</p>
                                <p className="text-xs text-emerald-600 mt-1">High CLO match ≥80%, no issues</p>
                              </div>

                              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <ThumbsUp className="w-6 h-6 text-blue-600" />
                                  <span className="text-3xl font-bold text-blue-700">{categories.good.length}</span>
                                </div>
                                <p className="font-medium text-blue-800">Good Questions</p>
                                <p className="text-xs text-blue-600 mt-1">Decent match 60-79%, minor issues</p>
                              </div>

                              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                                  <span className="text-3xl font-bold text-amber-700">{categories.needsImprovement.length}</span>
                                </div>
                                <p className="font-medium text-amber-800">Needs Improvement</p>
                                <p className="text-xs text-amber-600 mt-1">Low match &lt;60% or multiple issues</p>
                              </div>

                              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                  <XCircle className="w-6 h-6 text-red-600" />
                                  <span className="text-3xl font-bold text-red-700">{categories.unmapped.length}</span>
                                </div>
                                <p className="font-medium text-red-800">Unmapped</p>
                                <p className="text-xs text-red-600 mt-1">No CLO mapping found</p>
                              </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-200">
                              <p className="text-sm text-slate-700">
                                <span className="font-semibold text-emerald-600">{categories.perfect.length}</span> questions are perfectly aligned,{" "}
                                <span className="font-semibold text-blue-600">{categories.good.length}</span> need minor adjustments,{" "}
                                <span className="font-semibold text-amber-600">{categories.needsImprovement.length}</span> need significant improvements, and{" "}
                                <span className="font-semibold text-red-600">{categories.unmapped.length}</span> could not be mapped.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {processingResult.recommendations.length > 0 && (
                          <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                                <Lightbulb className="w-5 h-5" />
                              </div>
                              <h3 className="font-semibold text-slate-900">Recommendations</h3>
                            </div>
                            <ul className="space-y-2">
                              {processingResult.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                                  <Zap className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Detailed Question Analysis */}
                        <div className="space-y-4">
                          <h3 className="font-semibold text-slate-900 text-lg">Detailed Question Analysis</h3>

                          {processingResult.extractedQuestions.map((question) => {
                            const bloomColors = getBloomColor(question.bloomsAnalysis.detectedLevel)
                            const isExpanded = expandedQuestions.includes(question.id)
                            const hasPerfectMatch = question.mappedCLOs.some((m) => m.relevanceScore >= 80)
                            const hasIssues = question.issues.length > 0

                            return (
                              <div
                                key={question.id}
                                className={`bg-white rounded-2xl border overflow-hidden ${
                                  hasIssues
                                    ? "border-amber-200"
                                    : question.mappedCLOs.length === 0
                                    ? "border-red-200"
                                    : "border-slate-200"
                                }`}
                              >
                                {/* Question Header */}
                                <div
                                  className="p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                  onClick={() => toggleQuestion(question.id)}
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="flex items-center gap-3 shrink-0">
                                      <span className="text-lg font-bold text-slate-400">Q{question.questionNumber}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-slate-900 mb-2">{question.questionText}</p>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={`${bloomColors.bg} ${bloomColors.text} border-0 text-xs`}>
                                          {question.bloomsAnalysis.detectedLevel}
                                        </Badge>
                                        {question.mappedCLOs.length > 0 ? (
                                          question.mappedCLOs.map((mapping, idx) => (
                                            <Badge
                                              key={idx}
                                              className={`text-xs border ${getScoreColor(mapping.relevanceScore)}`}
                                            >
                                              {mapping.cloNumber}: {mapping.relevanceScore}%
                                            </Badge>
                                          ))
                                        ) : (
                                          <Badge className="bg-red-50 text-red-600 border-red-200 text-xs">
                                            No CLO mapping
                                          </Badge>
                                        )}
                                        {hasIssues && (
                                          <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-xs gap-1">
                                            <AlertTriangle className="w-3 h-3" />
                                            {question.issues.length} issues
                                          </Badge>
                                        )}
                                        {question.improvedQuestion && (
                                          <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 text-xs gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            AI suggestion
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <button className="p-1.5 shrink-0">
                                      {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                      ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                  <div className="border-t border-slate-100 p-5 bg-slate-50/50 space-y-4">
                                    {/* Bloom's Analysis */}
                                    <div className="bg-white rounded-xl p-4 border border-slate-200">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Brain className="w-4 h-4 text-indigo-500" />
                                        <span className="text-sm font-medium text-slate-700">Bloom's Taxonomy Analysis</span>
                                      </div>
                                      <p className="text-sm text-slate-600">{question.bloomsAnalysis.reasoning}</p>
                                    </div>

                                    {/* CLO Mappings */}
                                    {question.mappedCLOs.length > 0 && (
                                      <div>
                                        <p className="text-sm font-medium text-slate-700 mb-2">CLO Mappings</p>
                                        <div className="space-y-2">
                                          {question.mappedCLOs.map((mapping, idx) => (
                                            <div
                                              key={idx}
                                              className="bg-white rounded-xl p-4 border border-slate-200"
                                            >
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-slate-900">{mapping.cloNumber}</span>
                                                <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${getScoreColor(mapping.relevanceScore)}`}>
                                                  {mapping.relevanceScore}% match
                                                </span>
                                              </div>
                                              <p className="text-sm text-slate-500 italic mb-2">"{mapping.cloDescription}"</p>
                                              <p className="text-sm text-slate-600">{mapping.reasoning}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Issues */}
                                    {question.issues.length > 0 && (
                                      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                        <div className="flex items-center gap-2 mb-2">
                                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                                          <span className="text-sm font-medium text-amber-800">Issues with Current Question</span>
                                        </div>
                                        <ul className="space-y-1">
                                          {question.issues.map((issue, idx) => (
                                            <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                              {issue}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Improved Question */}
                                    {question.improvedQuestion && (
                                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                                        <div className="flex items-center justify-between mb-3">
                                          <div className="flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm font-bold text-emerald-800">AI-Generated Improved Question</span>
                                          </div>
                                          <button
                                            onClick={() => copyImprovedQuestion(question.improvedQuestion!, question.id)}
                                            className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1.5 rounded-lg transition-colors"
                                          >
                                            {copiedId === question.id ? (
                                              <>
                                                <Check className="w-3.5 h-3.5" />
                                                Copied!
                                              </>
                                            ) : (
                                              <>
                                                <Copy className="w-3.5 h-3.5" />
                                                Copy
                                              </>
                                            )}
                                          </button>
                                        </div>

                                        <div className="bg-white rounded-lg p-4 border border-emerald-300 mb-3">
                                          <p className="text-sm text-slate-900 font-medium">
                                            {question.improvedQuestion.questionText}
                                          </p>
                                        </div>

                                        <div className="space-y-1 text-sm">
                                          <div className="flex items-center gap-2">
                                            <span className="text-emerald-700">Target CLO:</span>
                                            <span className="font-medium text-emerald-900">{question.improvedQuestion.targetCLO}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-emerald-700">Target Bloom's:</span>
                                            <span className="font-medium text-emerald-900">{question.improvedQuestion.targetBlooms}</span>
                                          </div>
                                          <p className="text-emerald-700 mt-2">
                                            <span className="font-medium">Why it's better:</span>{" "}
                                            {question.improvedQuestion.explanation}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Source */}
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                      <FileText className="w-3.5 h-3.5" />
                                      Source: {question.source}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit CLO Modal */}
      {(isAddCLOModalOpen || editingCLO) && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
              setIsAddCLOModalOpen(false)
              setEditingCLO(null)
              resetForm()
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {editingCLO ? "Edit CLO" : "Add New CLO"}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {editingCLO ? "Update course learning outcome" : "Define a new learning outcome"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddCLOModalOpen(false)
                      setEditingCLO(null)
                      resetForm()
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    CLO Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="e.g., CLO-1"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe the learning outcome..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Bloom's Taxonomy Level
                  </label>
                  <select
                    value={formBloomLevel}
                    onChange={(e) => setFormBloomLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
                  >
                    {bloomLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddCLOModalOpen(false)
                    setEditingCLO(null)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingCLO ? handleEditCLO : handleAddCLO}
                  disabled={!formCode || !formDescription}
                  className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingCLO ? "Save Changes" : "Add CLO"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsUploadModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">Upload Document</h2>
                      <p className="text-sm text-slate-500">Upload PDFs or docs with questions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsUploadModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-1">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-sm text-slate-500">
                    Supports PDF, DOC, DOCX files
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
                <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
