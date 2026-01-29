# ��� URGENT: Fix CLOManagement.tsx

## Quick Fix - Delete These Exact Lines:

### 1. Delete Lines 309-462 (DocumentUploadModal result display)
   - Find line 309: `{result && (`
   - Delete everything up to and including line 462: `)}` 

### 2. Also delete lines around 605-744 (if they still exist after step 1)
   - Another `{result && (` section
   - Delete up to matching `)}`

### 3. Remove unused imports:
   - Line 20: Remove `, DocumentProcessingResult` from the import

### 4. Remove unused parameters:
   - Line 154: Remove `,onProcessComplete` if it shows as unused

## Or Use This Clean DocumentUploadModal:

Replace the ENTIRE DocumentUploadModal (starting around line 148) with this clean version:

```typescript
const DocumentUploadModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  clos: CourseCLO[]
  courseName: string
  onProcessComplete: () => void
}> = ({ isOpen, onClose, clos, courseName }) => {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const allowedExtensions = ['.txt', '.pdf', '.docx', '.doc', '.xlsx', '.xls', '.csv']
      const fileName = selectedFile.name.toLowerCase()
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext))
      
      if (!isAllowed) {
        setError('Please upload a TXT, PDF, DOCX, XLSX, XLS, or CSV file')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleProcess = async () => {
    if (!file || clos.length === 0) {
      setError('Please select a file and ensure you have created CLOs first')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const extractionResult = await cloMappingService.extractQuestionsFromFile(file)
      
      if (!extractionResult.success || !extractionResult.questions) {
        setError(extractionResult.error || 'Failed to read file')
        setProcessing(false)
        return
      }

      const processingResult = await cloMappingService.processDocument(extractionResult.questions, clos)
      
      onClose()
      navigate('/teacher/clo-analytics', {
        state: {
          result: processingResult,
          courseName: courseName
        }
      })
    } catch (err) {
      console.error('Error processing document:', err)
      setError('Failed to process document. Please try again.')
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Upload Question Document</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {clos.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">No CLOs Found</p>
                <p className="text-sm text-yellow-700 mt-1">Please create CLOs first before uploading questions.</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Question Document
            </label>
            <input
              type="file"
              accept=".txt,.pdf,.docx,.doc,.xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={processing || clos.length === 0}
            />
            <p className="text-xs text-gray-500 mt-2">
              📄 Supported formats: TXT, PDF, DOCX, XLSX, XLS, CSV
            </p>
            <p className="text-xs text-gray-400 mt-1">
              💡 Tip: For Excel/CSV, put questions in the first column
            </p>
          </div>

          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={processing}
            >
              Cancel
            </button>
            <button
              onClick={handleProcess}
              disabled={!file || processing || clos.length === 0}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {processing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Process with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## ✅ When Done:
1. Save the file
2. Refresh your browser
3. Try "Add Questions" - it should navigate to the new analytics page!

## 📊 What You'll Get:
- ✅ Dedicated analytics page with beautiful layout
- ✅ Download as TXT button
- ✅ Print/Save as PDF button  
- ✅ ⚠️ Warning about saving data

No more modal errors! 🎉

