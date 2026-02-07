'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  FileUp,
  FileText,
  Loader2,
  Upload,
  Sparkles,
  Zap,
  Save,
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  History,
  Edit,
  Eye,
} from 'lucide-react'
import {
  uploadAndExtractQuestionsAction,
  extractQuestionsFromTextAction,
  saveExtractedQuestionsAction,
  analyzeCLOMappingsAIAction,
  analyzeCLOMappingsLocalAction,
  deleteAnalysisDocumentAction,
} from '@/lib/actions/clo-analytics'
import type { ExtractedQuestion } from '@/services/questionExtractionAI'
import type { AnalysisDocumentData, CLOData } from '@/lib/supabase/queries/teacher'

interface AnalyticsSectionProps {
  cloSetId: string
  clos: CLOData[]
  initialDocuments: AnalysisDocumentData[]
}

type Step = 'upload' | 'preview' | 'saved'
type UploadMode = 'file' | 'text'

export default function AnalyticsSection({ cloSetId, clos, initialDocuments }: AnalyticsSectionProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('upload')
  const [uploadMode, setUploadMode] = useState<UploadMode>('file')

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedText, setPastedText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  // Preview state
  const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([])
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'text' | null>(null)
  const [summary, setSummary] = useState('')
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState('')

  // Saved documents state
  const [documents, setDocuments] = useState<AnalysisDocumentData[]>(initialDocuments)
  const [analyzingDocId, setAnalyzingDocId] = useState<string | null>(null)

  const hasCLOs = clos.length > 0

  // File handling
  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF or DOCX files.')
      return
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File is too large. Maximum size is 10MB.')
      return
    }

    setSelectedFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSetFile(file)
  }

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
    if (file) validateAndSetFile(file)
  }

  // Extract questions from file
  const handleExtractFromFile = async () => {
    if (!selectedFile) return

    setIsExtracting(true)
    try {
      // Convert file to base64
      const reader = new FileReader()

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1]
          resolve(base64)
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(selectedFile)
      })

      const base64 = await base64Promise

      console.log('File info:', {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
      })

      const result = await uploadAndExtractQuestionsAction({
        cloSetId,
        file: {
          name: selectedFile.name,
          type: selectedFile.type,
          data: base64,
        },
      })

      if (!result.success || !result.data) {
        toast.error(result.error || 'Failed to extract questions')
        return
      }

      setExtractedQuestions(result.data.extractedQuestions)
      setFileName(result.data.fileName)
      setFileType(result.data.fileType as 'pdf' | 'docx')
      setSummary(result.data.summary)
      setCurrentStep('preview')
      toast.success(`Extracted ${result.data.totalQuestions} questions!`)
    } catch (error) {
      console.error('Extract error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract questions'
      toast.error(errorMessage)
    } finally {
      setIsExtracting(false)
    }
  }

  // Extract questions from text
  const handleExtractFromText = async () => {
    if (!pastedText.trim()) {
      toast.error('Please enter some text')
      return
    }

    setIsExtracting(true)
    try {
      const result = await extractQuestionsFromTextAction({
        cloSetId,
        text: pastedText,
      })

      if (!result.success || !result.data) {
        toast.error(result.error || 'Failed to extract questions')
        return
      }

      setExtractedQuestions(result.data.extractedQuestions)
      setFileName(null)
      setFileType('text')
      setSummary(result.data.summary)
      setCurrentStep('preview')
      toast.success(`Extracted ${result.data.totalQuestions} questions!`)
    } catch (error) {
      console.error('Extract error:', error)
      toast.error('Failed to extract questions')
    } finally {
      setIsExtracting(false)
    }
  }

  // Edit question
  const handleStartEdit = (index: number) => {
    setEditingQuestionIndex(index)
    setEditingQuestionText(extractedQuestions[index].questionText)
  }

  const handleSaveEdit = () => {
    if (editingQuestionIndex === null) return

    const updated = [...extractedQuestions]
    updated[editingQuestionIndex].questionText = editingQuestionText
    setExtractedQuestions(updated)
    setEditingQuestionIndex(null)
    setEditingQuestionText('')
    toast.success('Question updated')
  }

  const handleDeleteQuestion = (index: number) => {
    const updated = extractedQuestions.filter((_, i) => i !== index)
    setExtractedQuestions(updated)
    toast.success('Question deleted')
  }

  // Save questions to database
  const handleSaveQuestions = async () => {
    try {
      const result = await saveExtractedQuestionsAction({
        cloSetId,
        questions: extractedQuestions,
        fileName: fileName || undefined,
        fileType: fileType || undefined,
      })

      if (!result.success) {
        toast.error(result.error || 'Failed to save questions')
        return
      }

      toast.success('Questions saved successfully!')
      setCurrentStep('saved')
      setSelectedFile(null)
      setPastedText('')
      setExtractedQuestions([])
      router.refresh()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save questions')
    }
  }

  // Analyze
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

      toast.success('Analysis completed!')
      router.refresh()
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze')
    } finally {
      setAnalyzingDocId(null)
    }
  }

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
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

  const StatusBadge = ({ status }: { status: AnalysisDocumentData['status'] }) => {
    const config = {
      pending: { color: 'bg-slate-100 text-slate-700', icon: Loader2, label: 'Pending' },
      parsing: { color: 'bg-blue-100 text-blue-700', icon: Loader2, label: 'Parsing' },
      parsed: { color: 'bg-green-100 text-green-700', icon: CheckCircle2, label: 'Ready' },
      analyzing: { color: 'bg-purple-100 text-purple-700', icon: Loader2, label: 'Analyzing' },
      completed: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Completed' },
      failed: { color: 'bg-red-100 text-red-700', icon: AlertCircle, label: 'Failed' },
    }

    const { color, icon: Icon, label } = config[status]
    const isAnimating = status === 'parsing' || status === 'analyzing'

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color}`}>
        <Icon className={`w-3 h-3 ${isAnimating ? 'animate-spin' : ''}`} />
        {label}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {!hasCLOs && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900 mb-1">No CLOs Defined</h3>
            <p className="text-sm text-amber-800">
              Please add CLOs to this set before running analysis. Switch to the CLOs tab to add them.
            </p>
          </div>
        </div>
      )}

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            setCurrentStep('upload')
            setSelectedFile(null)
            setPastedText('')
            setExtractedQuestions([])
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            currentStep === 'upload' || currentStep === 'preview'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileUp className="w-4 h-4" />
          {currentStep === 'preview' ? 'Preview Questions' : 'Upload'}
        </button>
        <div className="h-px flex-1 bg-slate-200" />
        <button
          onClick={() => setCurrentStep('saved')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            currentStep === 'saved'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          Saved ({documents.length})
        </button>
      </div>

      {/* Step 1: Upload */}
      {currentStep === 'upload' && (
        <div className="space-y-6">
          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={uploadMode === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMode('file')}
              className="flex-1"
            >
              <FileUp className="w-4 h-4 mr-2" />
              Upload File
            </Button>
            <Button
              variant={uploadMode === 'text' ? 'default' : 'outline'}
              onClick={() => setUploadMode('text')}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Paste Text
            </Button>
          </div>

          {uploadMode === 'file' ? (
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
                    <Button onClick={handleExtractFromFile} disabled={isExtracting || !hasCLOs}>
                      {isExtracting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Extracting with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Extract Questions
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFile(null)}
                      disabled={isExtracting}
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
          ) : (
            <div className="space-y-4">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={`Paste your questions here. The AI will extract and format them automatically.

Example:
1. Explain the concept of polymorphism in OOP.
2. What are the key differences between REST and GraphQL?
3. Describe the SOLID principles.`}
                className="w-full h-64 px-4 py-3 border border-slate-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={handleExtractFromText}
                  disabled={isExtracting || !pastedText.trim() || !hasCLOs}
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Questions
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPastedText('')}
                  disabled={isExtracting}
                >
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Preview & Edit */}
      {currentStep === 'preview' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              <strong>{summary}</strong>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Review and edit questions below, then click Save to proceed with analysis.
            </p>
          </div>

          <div className="space-y-3">
            {extractedQuestions.map((question, index) => (
              <div key={index} className="border border-slate-200 rounded-xl p-4">
                {editingQuestionIndex === index ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingQuestionText}
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingQuestionIndex(null)
                          setEditingQuestionText('')
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700">
                      Q{question.questionNumber}
                    </span>
                    <p className="flex-1 text-slate-900">{question.questionText}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStartEdit(index)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteQuestion(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={handleSaveQuestions} size="lg" disabled={extractedQuestions.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              Save {extractedQuestions.length} Questions
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCurrentStep('upload')
                setExtractedQuestions([])
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Saved Documents */}
      {currentStep === 'saved' && (
        <div className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">No saved analyses yet</h3>
              <p className="text-slate-600 mb-4">
                Upload a document or paste questions to get started
              </p>
              <Button onClick={() => setCurrentStep('upload')}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Analysis
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Your Analyses</h3>
                <Button onClick={() => setCurrentStep('upload')} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </div>

              {documents.map((doc) => (
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
                                Analytics
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
                                AI Analytics
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {doc.status === 'completed' && (
                        <>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
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
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
