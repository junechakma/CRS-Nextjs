"use client"

import Link from "next/link"
import {
  Download,
  ArrowLeft,
  FileText,
  Sparkles,
  CheckCircle,
  Lightbulb,
  AlertTriangle,
} from "lucide-react"
import { Card } from "@/components/ui/card"

const demoResult = {
  courseName: "Machine Learning Fundamentals",
  total_questions: 8,
  successfully_mapped: 7,
  unmapped_questions: 1,
  processing_time_ms: 4200,
  overall_summary:
    "This exam demonstrates strong alignment with course learning outcomes. Most questions effectively assess higher-order thinking skills. However, CLO 3 (Problem Solving) could benefit from additional coverage.",
  recommendations: [
    "Add 1-2 questions targeting CLO 3 to balance coverage",
    "Refine Question 5 to better align with Apply level",
    "Keep the strong Evaluate and Create level prompts",
    "Review the unmapped question for CLO alignment",
  ],
  extracted_questions: [
    {
      question_number: 1,
      question_text:
        "Explain the differences between supervised and unsupervised learning, providing examples of each.",
      blooms_level: "Understand",
      mapped_clos: [
        {
          clo_number: 1,
          clo_description:
            "Understand fundamental concepts of machine learning and artificial intelligence",
          relevance_score: 92,
        },
      ],
      issues: [],
    },
    {
      question_number: 2,
      question_text: "What is a neural network?",
      blooms_level: "Remember",
      mapped_clos: [
        {
          clo_number: 1,
          clo_description:
            "Understand fundamental concepts of machine learning and artificial intelligence",
          relevance_score: 65,
        },
      ],
      issues: [
        "Question is too simplistic for university level",
        "Does not assess understanding, only memorization",
      ],
    },
    {
      question_number: 3,
      question_text:
        "Design and implement a decision tree algorithm to classify customer data. Justify your choice of splitting criteria and explain how you would prevent overfitting.",
      blooms_level: "Create",
      mapped_clos: [
        {
          clo_number: 2,
          clo_description: "Apply machine learning algorithms to solve real-world problems",
          relevance_score: 95,
        },
        {
          clo_number: 3,
          clo_description:
            "Analyze and evaluate the performance of different ML models",
          relevance_score: 78,
        },
      ],
      issues: [],
    },
    {
      question_number: 4,
      question_text:
        "Compare the effectiveness of K-means clustering versus hierarchical clustering for customer segmentation. Which would you recommend and why?",
      blooms_level: "Evaluate",
      mapped_clos: [
        {
          clo_number: 3,
          clo_description:
            "Analyze and evaluate the performance of different ML models",
          relevance_score: 88,
        },
      ],
      issues: [],
    },
  ],
}

const formatTime = (ms: number) => `${(ms / 1000).toFixed(1)}s`

export default function CLOAnalyticsDemoPage() {
  const handleDownloadText = () => {
    const content = `CLO ANALYSIS REPORT\nCourse: ${demoResult.courseName}\nGenerated: ${new Date().toLocaleDateString()}\n\nSummary:\n${demoResult.overall_summary}\n\nTotal Questions: ${demoResult.total_questions}\nMapped: ${demoResult.successfully_mapped}\nUnmapped: ${demoResult.unmapped_questions}\nProcessing Time: ${formatTime(demoResult.processing_time_ms)}\n\nRecommendations:\n${demoResult.recommendations
      .map((rec, idx) => `${idx + 1}. ${rec}`)
      .join("\n")}\n`

    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `clo-analysis-demo-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to home
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CLO Analysis Report</h1>
                <p className="text-sm text-gray-600">{demoResult.courseName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleDownloadText}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <FileText className="w-4 h-4 mr-2" />
                Download TXT
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Print/Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border-b border-yellow-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Demo data: This analysis is not saved to the database
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Use the download buttons to export the sample report.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="analytics-content">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Executive Summary</h2>
                <p className="text-sm text-gray-500">Overall CLO alignment snapshot</p>
              </div>
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{demoResult.overall_summary}</p>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Total Questions</p>
                <p className="text-2xl font-bold text-gray-900">{demoResult.total_questions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mapped to CLOs</p>
                <p className="text-2xl font-bold text-emerald-600">{demoResult.successfully_mapped}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Unmapped</p>
                <p className="text-2xl font-bold text-amber-600">{demoResult.unmapped_questions}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Processing Time</p>
                <p className="text-sm font-medium text-gray-700">{formatTime(demoResult.processing_time_ms)}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommendations</h2>
              <p className="text-sm text-gray-500">Suggested improvements from the AI model</p>
            </div>
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <ul className="grid gap-3 text-sm text-gray-700">
            {demoResult.recommendations.map((rec) => (
              <li key={rec} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-6">
          {demoResult.extracted_questions.map((question) => (
            <Card key={question.question_number} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Question {question.question_number}
                  </p>
                  <h3 className="text-base font-semibold text-gray-900 mt-1">
                    {question.question_text}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  Bloom's: {question.blooms_level}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">CLO Mappings</p>
                  <div className="space-y-2">
                    {question.mapped_clos.map((mapping) => (
                      <div
                        key={`${question.question_number}-${mapping.clo_number}`}
                        className="rounded-md border border-gray-200 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-800">
                            CLO {mapping.clo_number}
                          </p>
                          <span className="text-xs font-medium text-emerald-600">
                            {mapping.relevance_score}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{mapping.clo_description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Issues</p>
                  {question.issues.length ? (
                    <ul className="space-y-2 text-sm text-amber-700">
                      {question.issues.map((issue) => (
                        <li key={issue} className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-emerald-600">No issues detected.</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
