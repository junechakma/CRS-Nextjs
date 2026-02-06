'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Upload,
  FileText,
  History,
  ChevronLeft,
  Loader2,
  FileUp,
  Play,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Download,
  Trash2,
  Save,
  Brain,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  createAnalysisDocumentAction,
  parseDocumentAction,
  createQuestionsFromTextAction,
  analyzeCLOMappingsAIAction,
  analyzeCLOMappingsLocalAction,
  deleteAnalysisDocumentAction,
} from '@/lib/actions/clo-analytics'
import type { CLOSetData, CLOData } from '@/lib/supabase/queries/teacher'
import type { AnalysisDocumentData } from '@/lib/supabase/queries/teacher'

interface CLOAnalyticsClientProps {
  cloSet: CLOSetData
  clos: CLOData[]
  initialDocuments: AnalysisDocumentData[]
  userId: string
}

type Tab = 'upload' | 'paste' | 'history'

export default function CLOAnalyticsClient({
  cloSet,
  clos,
  initialDocuments,
  userId,
}: CLOAnalyticsClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [documents, setDocuments] = useState<AnalysisDocumentData[]>(initialDocuments)

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Paste state
  const [pastedText, setPastedText] = useState('')
  const [isPasting, setIsPasting] = useState(false)

  // Analysis state
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null)

  // CLO check
  const hasCLOs = clos.length > 0

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  const validateAndSetFile = (file: File) => {
    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF or DOCX files.')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 10MB.')
      return
    }

    setSelectedFile(file)
  }

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      validateAndSetFile(file)
    }
  }

  // Upload file handler
  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // Step 1: Create document record and get upload URL
      const fileType = selectedFile.type.includes('pdf') ? 'pdf' : 'docx'
      const createResult = await createAnalysisDocumentAction({
        cloSetId: cloSet.id,
        fileName: selectedFile.name,
        fileType,
        fileSize: selectedFile.size,
      })

      if (!createResult.success || !createResult.data) {
        toast.error(createResult.error || 'Failed to create document')
        return
      }

      const { documentId, uploadUrl } = createResult.data

      // Step 2: Upload file to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      })

      if (!uploadResponse.ok) {
        toast.error('Failed to upload file')
        return
      }

      // Step 3: Parse document
      toast.loading('Parsing document...', { id: 'parse' })
      const parseResult = await parseDocumentAction(documentId)
      toast.dismiss('parse')

      if (!parseResult.success) {
        toast.error(parseResult.error || 'Failed to parse document')
        return
      }

      toast.success(
        `Successfully extracted ${parseResult.data?.totalQuestions} questions!`,
        {
          description: parseResult.data?.warnings?.[0],
        }
      )

      // Clear file and refresh documents
      setSelectedFile(null)
      refreshDocuments()
      setActiveTab('history')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload file')
    } finally {
      setIsUploading(false)
    }
  }

  // Paste questions handler
  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
      toast.error('Please enter some questions')
      return
    }

    setIsPasting(true)
    try {
      const result = await createQuestionsFromTextAction({
        cloSetId: cloSet.id,
        questionsText: pastedText,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to parse questions')
        return
      }

      toast.success(
        `Successfully parsed ${result.data?.totalQuestions} questions!`,
        {
          description: result.data?.warnings?.[0],
        }
      )

      setPastedText('')
      refreshDocuments()
      setActiveTab('history')
    } catch (error) {
      console.error('Paste error:', error)
      toast.error('Failed to process questions')
    } finally {
      setIsPasting(false)
    }
  }

  // Analyze handler
  const handleAnalyze = async (documentId: string, method: 'ai' | 'local') => {
    setAnalyzingDocId(documentId)
    const toastId = `analyze-${documentId}`

    try {
      toast.loading(`Analyzing with ${method === 'ai' ? 'AI' : 'Quick Analysis'}...`, {
        id: toastId,
      })

      const result =
        method === 'ai'
          ? await analyzeCLOMappingsAIAction(documentId)
          : await analyzeCLOMappingsLocalAction(documentId)

      toast.dismiss(toastId)

      if (!result.success) {
        toast.error(result.error || 'Analysis failed')
        return
      }

      toast.success('Analysis completed!', {
        description: `${result.data?.questions?.length || 0} questions analyzed`,
      })

      refreshDocuments()
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze')
    } finally {
      setAnalyzingDocId(null)
    }
  }

  // Delete handler
  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) return

    try {
      const result = await deleteAnalysisDocumentAction(documentId)
      if (!result.success) {
        toast.error(result.error || 'Failed to delete')
        return
      }

      toast.success('Analysis deleted')
      setDocuments((prev) => prev.filter((d) => d.id !== documentId))
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete')
    }
  }

  // Refresh documents
  const refreshDocuments = useCallback(() => {
    router.refresh()
  }, [router])

  // Status badge component
  const StatusBadge = ({ status }: { status: AnalysisDocumentData['status'] }) => {
    const config = {
      pending: { color: 'bg-slate-100 text-slate-700', icon: Clock, label: 'Pending' },
      parsing: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Parsing' },
      parsed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Parsed' },
      analyzing: { color: 'bg-purple-100 text-purple-700', icon: Loader2, label: 'Analyzing' },
      completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Failed' },
    }

    const { color, icon: Icon, label } = config[status]
    const isAnimating = status === 'parsing' || status === 'analyzing'

    return (
      <Badge variant="secondary" className={`${color} gap-1.5`}>
        <Icon className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href={`/teacher/clo-mapping/${cloSet.id}`}
          className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to CLO Set
        </Link>

        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-${cloSet.color}-100 rounded-xl flex items-center justify-center`}>
            <Brain className={`w-6 h-6 text-${cloSet.color}-600`} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{cloSet.name} - Analytics</h1>
            <p className="text-slate-600">
              Analyze questions against {clos.length} CLOs
            </p>
          </div>
        </div>
      </div>

      {/* Warning if no CLOs */}
      {!hasCLOs && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">No CLOs Defined</h3>
            <p className="text-sm text-amber-800">
              Please add CLOs to this set before running analysis.{' '}
              <Link
                href={`/teacher/clo-mapping/${cloSet.id}`}
                className="underline hover:no-underline"
              >
                Add CLOs now
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 flex">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'upload'
                ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileUp className="w-5 h-5 inline-block mr-2" />
            Upload Document
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'paste'
                ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-5 h-5 inline-block mr-2" />
            Paste Questions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-slate-50 text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <History className="w-5 h-5 inline-block mr-2" />
            Past Analyses ({documents.length})
          </button>
        </div>

        <div className="p-6">
          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Upload Document
                </h2>
                <p className="text-slate-600">
                  Upload a PDF or DOCX file containing questions to analyze
                </p>
              </div>

              {/* Drag and Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{selectedFile.name}</p>
                      <p className="text-sm text-slate-600">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={handleUpload} disabled={isUploading || !hasCLOs}>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload & Parse
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedFile(null)}
                        disabled={isUploading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                      <FileUp className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900 mb-1">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-slate-600">
                        Supports PDF and DOCX files (max 10MB)
                      </p>
                    </div>
                    <Button onClick={() => fileInputRef.current?.click()} disabled={!hasCLOs}>
                      <FileUp className="w-4 h-4 mr-2" />
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === 'paste' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  Paste Questions
                </h2>
                <p className="text-slate-600">
                  Paste your questions directly. One question per line or numbered.
                </p>
              </div>

              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Enter your questions here. Examples:

1. Explain the concept of polymorphism in OOP.
2. What are the key differences between REST and GraphQL?
3. Describe the SOLID principles.

Or simply:

Explain the concept of polymorphism in OOP.
What are the key differences between REST and GraphQL?
Describe the SOLID principles.`}
                className="w-full h-64 px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handlePasteSubmit}
                  disabled={isPasting || !pastedText.trim() || !hasCLOs}
                >
                  {isPasting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Parse Questions
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPastedText('')}
                  disabled={isPasting}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-semibold text-slate-900 mb-1">No analyses yet</h3>
                  <p className="text-slate-600">
                    Upload a document or paste questions to get started
                  </p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border border-slate-200 rounded-xl p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-slate-900">
                            {doc.fileName || 'Pasted Questions'}
                          </h3>
                          <StatusBadge status={doc.status} />
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                          <p>
                            {doc.totalQuestions} questions •{' '}
                            {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                          {doc.errorMessage && (
                            <p className="text-red-600">Error: {doc.errorMessage}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {doc.status === 'parsed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnalyze(doc.id, 'local')}
                              disabled={analyzingDocId === doc.id || !hasCLOs}
                            >
                              {analyzingDocId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Zap className="w-4 h-4 mr-2" />
                                  Quick Analyze
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAnalyze(doc.id, 'ai')}
                              disabled={analyzingDocId === doc.id || !hasCLOs}
                            >
                              {analyzingDocId === doc.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 mr-2" />
                                  AI Analyze
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        {doc.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                router.push(
                                  `/teacher/clo-mapping/${cloSet.id}/analytics/${doc.id}`
                                )
                              }
                            >
                              View Results
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAnalyze(doc.id, 'local')}
                              disabled={analyzingDocId === doc.id}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Re-analyze (Quick)
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleAnalyze(doc.id, 'ai')}
                              disabled={analyzingDocId === doc.id}
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
                              Re-analyze (AI)
                            </Button>
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(doc.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
