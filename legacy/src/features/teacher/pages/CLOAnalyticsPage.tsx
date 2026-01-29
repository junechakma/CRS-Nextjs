import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Download, AlertTriangle, ArrowLeft, FileText, Sparkles, CheckCircle, Lightbulb } from 'lucide-react'
import { Button, Card } from '../../../shared/components/ui'
import type { DocumentProcessingResult } from '../services/cloMappingService'

const CLOAnalyticsPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as DocumentProcessingResult | undefined
  const courseName = location.state?.courseName as string | undefined

  useEffect(() => {
    // Redirect if no data
    if (!result) {
      navigate(-1)
    }
  }, [result, navigate])

  const downloadAsPDF = () => {
    // Create printable content
    const printContent = document.getElementById('analytics-content')
    if (!printContent) return

    // Open print dialog
    window.print()
  }

  const downloadAsText = () => {
    if (!result) return

    // Categorize questions
    const perfectQuestions = result.extracted_questions.filter(q => 
      q.mapped_clos.length > 0 && 
      q.mapped_clos.some(m => m.relevance_score >= 80) && 
      (!q.issues || q.issues.length === 0)
    )
    const needsMinorImprovement = result.extracted_questions.filter(q => 
      q.mapped_clos.length > 0 && 
      q.mapped_clos.every(m => m.relevance_score >= 60 && m.relevance_score < 80) &&
      (!q.issues || q.issues.length <= 2)
    )
    const needsMajorImprovement = result.extracted_questions.filter(q => 
      (q.mapped_clos.length > 0 && q.mapped_clos.some(m => m.relevance_score < 60)) ||
      (q.issues && q.issues.length > 2)
    )
    const unmappedQuestions = result.extracted_questions.filter(q => q.mapped_clos.length === 0)

    let content = `CLO ANALYSIS REPORT\n`
    content += `Course: ${courseName || 'Unknown'}\n`
    content += `Generated: ${new Date().toLocaleDateString()}\n`
    content += `\n${'='.repeat(80)}\n\n`

    content += `SUMMARY\n${'-'.repeat(80)}\n`
    content += `${result.overall_summary}\n\n`
    content += `Total Questions: ${result.total_questions}\n`
    content += `Successfully Mapped: ${result.successfully_mapped}\n`
    content += `Unmapped: ${result.unmapped_questions}\n`
    content += `Processing Time: ${(result.processing_time_ms / 1000).toFixed(1)}s\n\n`

    content += `QUESTION QUALITY BREAKDOWN\n${'-'.repeat(80)}\n`
    content += `✅ Perfect Questions: ${perfectQuestions.length} (High CLO match ≥80%, no issues)\n`
    content += `👍 Good Questions: ${needsMinorImprovement.length} (Decent match 60-79%, minor issues)\n`
    content += `⚠️  Needs Improvement: ${needsMajorImprovement.length} (Low match <60% or multiple issues)\n`
    content += `❌ Unmapped: ${unmappedQuestions.length} (No CLO mapping found)\n\n`

    if (result.recommendations.length > 0) {
      content += `RECOMMENDATIONS\n${'-'.repeat(80)}\n`
      result.recommendations.forEach((rec, idx) => {
        content += `${idx + 1}. ${rec}\n`
      })
      content += '\n'
    }

    content += `DETAILED QUESTION ANALYSIS\n${'='.repeat(80)}\n\n`

    result.extracted_questions.forEach((question) => {
      content += `QUESTION ${question.question_number}\n${'-'.repeat(80)}\n`
      content += `Text: ${question.question_text}\n`
      content += `Bloom's Level: ${question.blooms_analysis.detected_level}\n`
      content += `Reasoning: ${question.blooms_analysis.reasoning}\n\n`

      if (question.mapped_clos.length > 0) {
        content += `CLO Mappings:\n`
        question.mapped_clos.forEach((mapping) => {
          content += `  - CLO ${mapping.clo_number} (${mapping.relevance_score}% match)\n`
          content += `    "${mapping.clo_description}"\n`
          content += `    Reasoning: ${mapping.reasoning}\n`
        })
        content += '\n'
      }

      if (question.issues && question.issues.length > 0) {
        content += `Issues:\n`
        question.issues.forEach((issue) => {
          content += `  - ${issue}\n`
        })
        content += '\n'
      }

      if (question.improved_question) {
        content += `Improved Question:\n`
        content += `  "${question.improved_question.question_text}"\n`
        content += `  Target CLO: ${question.improved_question.target_clo}\n`
        content += `  Target Bloom's: ${question.improved_question.target_blooms}\n`
        content += `  Explanation: ${question.improved_question.explanation}\n`
      }

      content += '\n\n'
    })

    // Download as text file
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clo-analysis-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!result) {
    return null
  }

  // Categorize questions
  const perfectQuestions = result.extracted_questions.filter(q => 
    q.mapped_clos.length > 0 && 
    q.mapped_clos.some(m => m.relevance_score >= 80) && 
    (!q.issues || q.issues.length === 0)
  )
  const needsMinorImprovement = result.extracted_questions.filter(q => 
    q.mapped_clos.length > 0 && 
    q.mapped_clos.every(m => m.relevance_score >= 60 && m.relevance_score < 80) &&
    (!q.issues || q.issues.length <= 2)
  )
  const needsMajorImprovement = result.extracted_questions.filter(q => 
    (q.mapped_clos.length > 0 && q.mapped_clos.some(m => m.relevance_score < 60)) ||
    (q.issues && q.issues.length > 2)
  )
  const unmappedQuestions = result.extracted_questions.filter(q => q.mapped_clos.length === 0)

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* No-Print Header */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CLO Analysis Report</h1>
                <p className="text-sm text-gray-600">{courseName}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={downloadAsText}
              >
                <FileText className="w-4 h-4 mr-2" />
                Download TXT
              </Button>
              <Button onClick={downloadAsPDF}>
                <Download className="w-4 h-4 mr-2" />
                Print/Save PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                ⚠️ Important: This analysis is not saved in the database
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Please download this report before leaving the page, or the analysis will be lost.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="analytics-content">
        {/* Print-only Header */}
        <div className="hidden print:block mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CLO Analysis Report</h1>
          <p className="text-lg text-gray-600 mt-2">{courseName}</p>
          <p className="text-sm text-gray-500 mt-1">Generated: {new Date().toLocaleString()}</p>
        </div>

        {/* Summary Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-start space-x-2 mb-4">
            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Analysis Summary</h2>
              <p className="text-sm text-gray-700 mb-4">{result.overall_summary}</p>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">Total Questions</p>
                  <p className="text-2xl font-bold text-blue-900">{result.total_questions}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700">Mapped</p>
                  <p className="text-2xl font-bold text-green-900">{result.successfully_mapped}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-700">Processing Time</p>
                  <p className="text-2xl font-bold text-gray-900">{(result.processing_time_ms / 1000).toFixed(1)}s</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Quality Breakdown */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Question Quality Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-3xl font-bold text-green-900">{perfectQuestions.length}</span>
              </div>
              <p className="text-sm font-medium text-green-900">Perfect Questions</p>
              <p className="text-xs text-green-700 mt-1">High CLO match (≥80%), no issues</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">👍</span>
                <span className="text-3xl font-bold text-blue-900">{needsMinorImprovement.length}</span>
              </div>
              <p className="text-sm font-medium text-blue-900">Good Questions</p>
              <p className="text-xs text-blue-700 mt-1">Decent match (60-79%), minor issues</p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-3xl font-bold text-yellow-900">{needsMajorImprovement.length}</span>
              </div>
              <p className="text-sm font-medium text-yellow-900">Needs Improvement</p>
              <p className="text-xs text-yellow-700 mt-1">Low match (&lt;60%) or multiple issues</p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">❌</span>
                <span className="text-3xl font-bold text-red-900">{unmappedQuestions.length}</span>
              </div>
              <p className="text-sm font-medium text-red-900">Unmapped</p>
              <p className="text-xs text-red-700 mt-1">No CLO mapping found</p>
            </div>
          </div>

          {/* Quick Summary Text */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-green-700">{perfectQuestions.length}</span> questions are perfectly aligned with CLOs, 
              <span className="font-semibold text-blue-700"> {needsMinorImprovement.length}</span> need minor adjustments, 
              <span className="font-semibold text-yellow-700"> {needsMajorImprovement.length}</span> need significant improvements, 
              and <span className="font-semibold text-red-700">{unmappedQuestions.length}</span> could not be mapped to any CLO.
            </p>
          </div>
        </Card>

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-medium text-gray-900">Recommendations</h2>
            </div>
            <ul className="space-y-2">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Questions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Detailed Question Analysis</h2>

          {result.extracted_questions.map((question, idx) => (
            <Card key={idx} className="p-6 print:break-inside-avoid">
              {/* Question Header */}
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-gray-200">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      Question {question.question_number}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      Bloom's: {question.blooms_analysis.detected_level}
                    </span>
                  </div>
                  <p className="text-base text-gray-900 font-medium">{question.question_text}</p>
                  <p className="text-sm text-gray-600 mt-1">{question.blooms_analysis.reasoning}</p>
                </div>
              </div>

              {/* CLO Mappings */}
              {question.mapped_clos.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">📊 CLO Mappings</p>
                  <div className="space-y-3">
                    {question.mapped_clos.map((mapping, mIdx) => (
                      <div key={mIdx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            CLO {mapping.clo_number}
                          </span>
                          <span className={`text-sm font-bold ${mapping.relevance_score >= 80 ? 'text-green-600' :
                              mapping.relevance_score >= 60 ? 'text-blue-600' :
                                mapping.relevance_score >= 40 ? 'text-yellow-600' :
                                  'text-orange-600'
                            }`}>
                            {mapping.relevance_score}% match
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 italic mb-1">
                          "{mapping.clo_description}"
                        </p>
                        <p className="text-sm text-gray-700">{mapping.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Issues */}
              {question.issues && question.issues.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-3 mb-4">
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    ⚠️ Issues with Current Question
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {question.issues.map((issue, iIdx) => (
                      <li key={iIdx} className="text-sm text-yellow-800">{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Improved Question */}
              {question.improved_question && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-bold text-green-900">
                      ✨ AI-Generated Perfect Question
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 mb-3 border border-green-300">
                    <p className="text-base text-gray-900 font-medium">
                      {question.improved_question.question_text}
                    </p>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700">Target CLO:</span>
                      <span className="font-medium text-green-900">
                        CLO {question.improved_question.target_clo}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-700">Target Bloom's:</span>
                      <span className="font-medium text-green-900 capitalize">
                        {question.improved_question.target_blooms}
                      </span>
                    </div>
                    <p className="text-green-800 mt-2">
                      <span className="font-medium">Why it's better:</span>{' '}
                      {question.improved_question.explanation}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}

export default CLOAnalyticsPage

