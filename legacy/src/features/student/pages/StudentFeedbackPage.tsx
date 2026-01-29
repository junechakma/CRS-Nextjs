import React, { useState } from 'react'
import SessionAccess from '../components/SessionAccess'
import FeedbackForm from '../components/FeedbackForm'
import type { SessionAccessData } from '../services/studentService'

const StudentFeedbackPage: React.FC = () => {
  const [currentSession, setCurrentSession] = useState<SessionAccessData | null>(null)
  const [studentId, setStudentId] = useState<string>('')

  const handleSessionAccess = (session: SessionAccessData, student_id: string) => {
    setCurrentSession(session)
    setStudentId(student_id)
  }

  const handleBackToAccess = () => {
    setCurrentSession(null)
    setStudentId('')
  }

  const handleSubmitComplete = () => {
    // After successful submission, go back to access page
    setCurrentSession(null)
    setStudentId('')
  }

  return (
    <>
      {!currentSession ? (
        <SessionAccess onSessionAccess={handleSessionAccess} />
      ) : (
        <FeedbackForm
          session={currentSession}
          studentId={studentId}
          onBack={handleBackToAccess}
          onSubmit={handleSubmitComplete}
        />
      )}
    </>
  )
}

export default StudentFeedbackPage