import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  Calendar,
  Users,
  Search,
  Play,
  Square,
  BarChart3,
  Link,
  Copy,
  Check
} from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../../../store/store'
import { Card, Button } from '../../../shared/components/ui'
import { TeacherService, type ResponseSession, type Course, type CreateSessionData, type Question } from '../services/teacherService'

export interface ResponseSessionManagementRef {
  openCreateSessionModal: () => void
}

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  session?: ResponseSession | null
  courses: Course[]
  questions: Question[]
  durations: { id: string; minutes: number; label: string }[]
  onSubmit: (data: CreateSessionData) => Promise<void>
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, session, courses, questions, durations, onSubmit }) => {
  const [formData, setFormData] = useState<CreateSessionData>({
    course_id: '',
    section: '',
    room_number: '',
    session_date: '',
    duration_minutes: 60,
    questions: []
  })
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)


  useEffect(() => {
    if (session) {
      setFormData({
        course_id: session.course_id,
        section: session.section,
        room_number: session.room_number || '',
        session_date: session.session_date,
        duration_minutes: session.duration_minutes,
        questions: session.questions.map(q => q.id)
      })
      setSelectedQuestions(session.questions.map(q => q.id))
    } else {
      const today = new Date().toISOString().split('T')[0]
      setFormData({
        course_id: '',
        section: '',
        room_number: '',
        session_date: today,
        duration_minutes: 60,
        questions: []
      })
      // Auto-select all questions when creating new session
      const allQuestionIds = questions.map(q => q.id)
      setSelectedQuestions(allQuestionIds)
    }
  }, [session, questions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if all required questions are selected
    const requiredQuestions = questions.filter(q => q.required)
    const selectedRequiredQuestions = requiredQuestions.filter(q => selectedQuestions.includes(q.id))
    
    if (requiredQuestions.length > 0 && selectedRequiredQuestions.length !== requiredQuestions.length) {
      alert(`Please select all required questions. ${requiredQuestions.length - selectedRequiredQuestions.length} required questions are missing.`)
      return
    }
    
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question for the session.')
      return
    }
    
    setLoading(true)
    try {
      await onSubmit({
        ...formData,
        questions: selectedQuestions
      })
      onClose()
    } catch (error) {
      console.error('Error submitting session:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleQuestion = (questionId: string) => {
    const question = questions.find(q => q.id === questionId)
    
    // Prevent unchecking required questions
    if (question?.required && selectedQuestions.includes(questionId)) {
      return
    }
    
    setSelectedQuestions(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const selectedCourse = courses.find(c => c.id === formData.course_id)
  const requiredQuestions = questions.filter(q => q.required)
  const selectedRequiredQuestions = requiredQuestions.filter(q => selectedQuestions.includes(q.id))
  const allRequiredSelected = requiredQuestions.length === 0 || selectedRequiredQuestions.length === requiredQuestions.length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
          {session ? 'Edit Response Session' : 'Create New Response Session'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData(prev => ({ ...prev, course_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">
                  {courses.length === 0 ? 'No courses available' : 'Select Course'}
                </option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_title}
                  </option>
                ))}
              </select>
              {courses.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No courses found. Please create a course first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section *
              </label>
              <select
                value={formData.section}
                onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedCourse}
              >
                <option value="">Select Section</option>
                {selectedCourse?.sections.map(section => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Date *
              </label>
              <input
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData(prev => ({ ...prev, session_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Session times will be set automatically when you start the session
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <select
                value={formData.duration_minutes}
                onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Duration</option>
                {durations.length > 0 ? (
                  durations.map(duration => (
                    <option key={duration.id} value={duration.minutes}>
                      {duration.label}
                    </option>
                  ))
                ) : (
                  <>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </>
                )}
              </select>
              {durations.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Using default durations. University admin can add custom durations.
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Number
            </label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => setFormData(prev => ({ ...prev, room_number: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Room 101, Lab A"
            />
          </div>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Questions ({selectedQuestions.length} selected)
              </label>
              {!session && questions.length > 0 && (
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => setSelectedQuestions(questions.map(q => q.id))}
                    className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 border border-blue-300 rounded"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedQuestions(questions.filter(q => q.required).map(q => q.id))}
                    className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1 border border-gray-300 rounded"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
            {requiredQuestions.length > 0 && (
              <div className={`text-xs mb-2 px-2 py-1 rounded ${
                allRequiredSelected 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                Required questions: {selectedRequiredQuestions.length}/{requiredQuestions.length} selected
              </div>
            )}
            <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
              {questions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 mb-2">No questions available</p>
                  <p className="text-xs text-gray-400">
                    Questions will be available once the questions system is set up.
                    You can still create a session without questions for now.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {questions.map(question => (
                    <label key={question.id} className={`flex items-start space-x-2 cursor-pointer p-2 rounded ${
                      question.required ? 'bg-red-50 border border-red-200' : 'hover:bg-gray-50'
                    }`}>
                      <input
                        type="checkbox"
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => toggleQuestion(question.id)}
                        disabled={question.required}
                        className={`mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          question.required ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm text-gray-900">{question.text}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-1">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded">{question.category}</span>
                          <span>{question.type}</span>
                          {question.required && <span className="text-red-600 font-medium">Required (Cannot be unchecked)</span>}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!session && !allRequiredSelected)}
              className={`flex-1 px-4 py-2 rounded-md text-white order-1 sm:order-2 ${
                loading || (!session && !allRequiredSelected)
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Saving...' : session ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


const ResponseSessionManagement = forwardRef<ResponseSessionManagementRef>((_props, ref) => {
  const { user } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<ResponseSession[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [durations, setDurations] = useState<{ id: string; minutes: number; label: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSession, setEditingSession] = useState<ResponseSession | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCourse, setFilterCourse] = useState('')

  // Expose function to parent component
  useImperativeHandle(ref, () => ({
    openCreateSessionModal: () => {
      setEditingSession(null)
      setShowModal(true)
    }
  }))

  useEffect(() => {
    if (user?.id) {
      loadData()
    }
  }, [user])

  // Auto-check for expired sessions every minute
  useEffect(() => {
    const checkExpiredSessions = () => {
      const now = new Date()
      sessions.forEach(session => {
        if (session.status === 'active') {
          const endTime = new Date(session.end_time)
          if (now > endTime) {
            // Session has expired, automatically mark as completed
            handleStatusChange(session.id, 'completed')
          }
        }
      })
    }

    // Check immediately
    checkExpiredSessions()

    // Then check every minute
    const interval = setInterval(checkExpiredSessions, 60000)

    return () => clearInterval(interval)
  }, [sessions])

  const loadData = async () => {
    if (!user?.id || !user.university_id) return

    try {
      setLoading(true)
      const [sessionsData, coursesData, questionsData, durationsData] = await Promise.all([
        TeacherService.getResponseSessions(user.id),
        TeacherService.getCourses(user.id),
        TeacherService.getQuestions(user.university_id),
        TeacherService.getDurations(user.university_id)
      ])

      // Check for expired sessions and update their status
      const now = new Date()
      const updatedSessions = await Promise.all(
        sessionsData.map(async (session) => {
          if (session.status === 'active') {
            const endTime = new Date(session.end_time)
            if (now > endTime) {
              // Session has expired, mark as completed
              const result = await TeacherService.updateSessionStatus(session.id, 'completed')
              if (result.success) {
                return { ...session, status: 'completed' as const }
              }
            }
          }
          return session
        })
      )

      setSessions(updatedSessions)
      setCourses(coursesData.filter(course => course.status === 'active'))
      setQuestions(questionsData)
      setDurations(durationsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (data: CreateSessionData) => {
    if (!user?.id) return

    let result
    if (editingSession) {
      // Update existing session
      result = await TeacherService.updateResponseSession(editingSession.id, data)
    } else {
      // Create new session
      result = await TeacherService.createResponseSession(user.id, data)
    }

    if (result.success) {
      await loadData()
      setShowModal(false)
      setEditingSession(null)
    } else {
      alert(result.error || (editingSession ? 'Failed to update session' : 'Failed to create session'))
    }
  }

  const handleStatusChange = async (sessionId: string, status: ResponseSession['status']) => {
    const result = await TeacherService.updateSessionStatus(sessionId, status)
    if (result.success) {
      await loadData()
    } else {
      alert(result.error || 'Failed to update session status')
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      const result = await TeacherService.deleteResponseSession(sessionId)
      if (result.success) {
        await loadData()
      } else {
        alert(result.error || 'Failed to delete session')
      }
    }
  }

  const handleViewAnalytics = (session: ResponseSession) => {
    navigate(`/teacher/sessions/${session.id}/analytics`)
  }

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.course_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.section.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filterStatus || session.status === filterStatus
    const matchesCourse = !filterCourse || session.course_id === filterCourse

    return matchesSearch && matchesStatus && matchesCourse
  })

  const getStatusColor = (status: ResponseSession['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const SessionCard: React.FC<{
    session: ResponseSession
    onEdit: (session: ResponseSession) => void
    onDelete: (sessionId: string) => void
    onStatusChange: (sessionId: string, status: ResponseSession['status']) => void
    onViewAnalytics: (session: ResponseSession) => void
  }> = ({ session, onEdit, onDelete, onViewAnalytics }) => {
    const [copied, setCopied] = useState(false)
    const [timeRemaining, setTimeRemaining] = useState('')

    // Calculate remaining time for active sessions
    useEffect(() => {
      if (session.status !== 'active') {
        setTimeRemaining('')
        return
      }

      const updateTimer = () => {
        const now = new Date()
        const endTime = new Date(session.end_time)
        const diff = endTime.getTime() - now.getTime()

        if (diff <= 0) {
          setTimeRemaining('Expired')
          return
        }

        const minutes = Math.floor(diff / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')} remaining`)
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)

      return () => clearInterval(interval)
    }, [session.status, session.end_time])

    const handleCopyKey = async () => {
      try {
        await navigator.clipboard.writeText(session.anonymous_key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy text: ', err)
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = session.anonymous_key
        document.body.appendChild(textArea)
        textArea.select()
        try {
          document.execCommand('copy')
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch (fallbackErr) {
          console.error('Fallback copy failed: ', fallbackErr)
        }
        document.body.removeChild(textArea)
      }
    }

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{session.course_code}</h3>
                <p className="text-sm text-gray-600">{session.course_title}</p>
              </div>
            </div>
          </div>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(session.status)}`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </span>
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-medium text-gray-900">{formatDate(session.session_date)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium text-gray-900">
                {session.status === 'pending'
                  ? `${session.duration_minutes} min duration`
                  : `${formatTime(session.start_time)} - ${formatTime(session.end_time)}`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Section & Room</p>
              <p className="font-medium text-gray-900">
                Section {session.section}{session.room_number && ` • ${session.room_number}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="font-medium text-gray-900">{session.questions.length} questions</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Response Progress</span>
            <span className="text-sm text-gray-600">{session.stats.total_responses} responses</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, session.stats.completion_rate)}%`
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {session.stats.completion_rate}% completion rate
          </div>
        </div>

        {/* Anonymous Key and Timer for Active Sessions */}
        {session.status === 'active' && (
          <div className="mb-3 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Anonymous Key: {session.anonymous_key}</span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleCopyKey}
                  className="ml-3 flex items-center"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
            {timeRemaining && (
              <div className={`p-3 border rounded-lg ${
                timeRemaining === 'Expired' 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${
                    timeRemaining === 'Expired' ? 'text-red-600' : 'text-green-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    timeRemaining === 'Expired' ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {timeRemaining}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {session.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleStatusChange(session.id, 'active')}
              className="flex items-center"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Session
            </Button>
          )}
          {session.status === 'active' && (
            <Button
              size="sm"
              variant={timeRemaining === 'Expired' ? 'secondary' : 'primary'}
              onClick={() => handleStatusChange(session.id, 'completed')}
              className="flex items-center"
              disabled={timeRemaining === 'Expired'}
            >
              <Square className="w-4 h-4 mr-1" />
              {timeRemaining === 'Expired' ? 'Session Expired' : 'End Session'}
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewAnalytics(session)}
            className="flex items-center"
          >
            <BarChart3 className="w-4 h-4 mr-1" />
            Analytics
          </Button>
          {/* Show edit button only for pending sessions */}
          {session.status === 'pending' && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onEdit(session)}
              className="flex items-center"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          {/* Show delete button only for pending sessions (before they are started) */}
          {session.status === 'pending' && (
            <Button
              size="sm"
              variant="danger"
              onClick={() => onDelete(session.id)}
              className="flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading sessions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card title={`Response Sessions (${filteredSessions.length})`}>
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.course_code}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="flex-1 sm:flex-initial border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button onClick={() => {
              setEditingSession(null)
              setShowModal(true)
            }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-6 bg-gray-50 rounded-lg">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600 mb-4">
                {sessions.length === 0
                  ? "You haven't created any sessions yet."
                  : "No sessions match your current filters."
                }
              </p>
              {sessions.length === 0 && (
                <Button onClick={() => {
                  setEditingSession(null)
                  setShowModal(true)
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Session
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                onEdit={(session) => {
                  setEditingSession(session)
                  setShowModal(true)
                }}
                onDelete={handleDeleteSession}
                onStatusChange={handleStatusChange}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Session Modal */}
      <SessionModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSession(null)
        }}
        session={editingSession}
        courses={courses}
        questions={questions}
        durations={durations}
        onSubmit={handleCreateSession}
      />
    </div>
  )
})

ResponseSessionManagement.displayName = 'ResponseSessionManagement'

export default ResponseSessionManagement