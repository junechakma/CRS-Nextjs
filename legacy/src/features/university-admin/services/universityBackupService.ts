import { supabase } from '../../../lib/supabase'

export interface UniversityBackupData {
  university: any
  faculties: any[]
  departments: any[]
  teachers: any[]
  courses: any[]
  semesters: any[]
  response_sessions: any[]
  responses: any[]
  teacher_feedback: any[]
  users: any[]
  timestamp: string
  version: string
  university_id: string
}

export type ExportFormat = 'json' | 'excel' | 'csv'

export interface BackupOptions {
  includeUsers?: boolean
  includeCourses?: boolean
  includeFeedback?: boolean
  includeSessions?: boolean
  universityId: string
}

export interface BackupStats {
  university: number
  faculties: number
  departments: number
  teachers: number
  courses: number
  semesters: number
  sessions: number
  responses: number
  feedback: number
  users: number
  totalRecords: number
  backupDate: string
}

export class UniversityBackupService {
  private static readonly BACKUP_VERSION = '2.0.0'

  static async createBackup(options: BackupOptions): Promise<UniversityBackupData> {
    const {
      includeUsers = true,
      includeCourses = true,
      includeFeedback = true,
      includeSessions = true,
      universityId
    } = options

    if (!universityId) {
      throw new Error('University ID is required for backup')
    }

    try {
      const backup: UniversityBackupData = {
        university: null,
        faculties: [],
        departments: [],
        teachers: [],
        courses: [],
        semesters: [],
        response_sessions: [],
        responses: [],
        teacher_feedback: [],
        users: [],
        timestamp: new Date().toISOString(),
        version: this.BACKUP_VERSION,
        university_id: universityId
      }

      // 1. Backup university data
      const { data: university, error: universityError } = await supabase
        .from('universities')
        .select('*')
        .eq('id', universityId)
        .single()

      if (universityError) throw universityError
      backup.university = university

      // 2. Backup faculties
      const { data: faculties, error: facultiesError } = await supabase
        .from('faculties')
        .select('*')
        .eq('university_id', universityId)

      if (facultiesError) throw facultiesError
      backup.faculties = faculties || []

      // 3. Backup departments
      const { data: departments, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .eq('university_id', universityId)

      if (departmentsError) throw departmentsError
      backup.departments = departments || []

      // 4. Backup users (if enabled)
      if (includeUsers) {
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, name, email, role, initial, phone, status, created_at, last_login')
          .eq('university_id', universityId)

        if (usersError) throw usersError
        backup.users = users || []

        // Separate teachers for detailed info
        backup.teachers = backup.users.filter(user => user.role === 'teacher')
      }

      // 5. Backup semesters
      const { data: semesters, error: semestersError } = await supabase
        .from('semesters')
        .select('*')
        .eq('university_id', universityId)

      if (semestersError) throw semestersError
      backup.semesters = semesters || []

      // 6. Backup courses (if enabled)
      if (includeCourses) {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select(`
            *,
            semesters!inner(university_id)
          `)
          .eq('semesters.university_id', universityId)

        if (coursesError) throw coursesError
        backup.courses = courses || []
      }

      // 7. Backup response sessions (if enabled)
      if (includeSessions) {
        const { data: sessions, error: sessionsError } = await supabase
          .from('response_sessions')
          .select(`
            *,
            courses!inner(
              *,
              semesters!inner(university_id)
            )
          `)
          .eq('courses.semesters.university_id', universityId)

        if (sessionsError) throw sessionsError
        backup.response_sessions = sessions || []
      }

      // 8. Backup responses and feedback (if enabled)
      if (includeFeedback && backup.response_sessions.length > 0) {
        const sessionIds = backup.response_sessions.map(session => session.id)
        
        if (sessionIds.length > 0) {
          // Backup responses
          const { data: responses, error: responsesError } = await supabase
            .from('responses')
            .select('*')
            .in('session_id', sessionIds)

          if (responsesError) throw responsesError
          backup.responses = responses || []

          // Backup teacher feedback
          const { data: teacherFeedback, error: feedbackError } = await supabase
            .from('teacher_feedback')
            .select('*')
            .in('session_id', sessionIds)

          if (feedbackError) throw feedbackError
          backup.teacher_feedback = teacherFeedback || []
        }
      }

      return backup
    } catch (error) {
      console.error('Error creating university backup:', error)
      throw new Error(`Failed to create backup: ${(error as Error).message}`)
    }
  }

  static getBackupStats(backup: UniversityBackupData): BackupStats {
    return {
      university: backup.university ? 1 : 0,
      faculties: backup.faculties.length,
      departments: backup.departments.length,
      teachers: backup.teachers.length,
      courses: backup.courses.length,
      semesters: backup.semesters.length,
      sessions: backup.response_sessions.length,
      responses: backup.responses.length,
      feedback: backup.teacher_feedback.length,
      users: backup.users.length,
      totalRecords: (backup.university ? 1 : 0) + 
                   backup.faculties.length + 
                   backup.departments.length +
                   backup.teachers.length +
                   backup.courses.length +
                   backup.semesters.length +
                   backup.response_sessions.length +
                   backup.responses.length +
                   backup.teacher_feedback.length +
                   backup.users.length,
      backupDate: backup.timestamp
    }
  }

  static async downloadBackup(backup: UniversityBackupData, format: ExportFormat): Promise<void> {
    const universityName = backup.university?.name || 'University'
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[:.]/g, '-')
    const filename = `${universityName.replace(/[^a-zA-Z0-9]/g, '_')}_backup_${timestamp}`

    try {
      switch (format) {
        case 'json':
          await this.downloadAsJSON(backup, filename)
          break
        case 'excel':
          await this.downloadAsExcel(backup, filename)
          break
        case 'csv':
          await this.downloadAsCSV(backup, filename)
          break
        default:
          throw new Error(`Unsupported format: ${format}`)
      }
    } catch (error) {
      console.error('Error downloading backup:', error)
      throw new Error(`Failed to download backup: ${(error as Error).message}`)
    }
  }

  private static async downloadAsJSON(backup: UniversityBackupData, filename: string): Promise<void> {
    const jsonString = JSON.stringify(backup, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    this.triggerDownload(blob, `${filename}.json`)
  }

  private static async downloadAsExcel(backup: UniversityBackupData, filename: string): Promise<void> {
    // For now, create a simple text representation
    // In a full implementation, you'd use a library like xlsx
    const content = this.formatBackupAsText(backup)
    const blob = new Blob([content], { type: 'text/plain' })
    this.triggerDownload(blob, `${filename}.txt`)
  }

  private static async downloadAsCSV(backup: UniversityBackupData, filename: string): Promise<void> {
    const csvContent = this.formatBackupAsCSV(backup)
    const blob = new Blob([csvContent], { type: 'text/csv' })
    this.triggerDownload(blob, `${filename}.csv`)
  }

  private static formatBackupAsText(backup: UniversityBackupData): string {
    let content = `University Backup Report\n`
    content += `Generated: ${new Date(backup.timestamp).toLocaleString()}\n`
    content += `Version: ${backup.version}\n\n`

    content += `UNIVERSITY INFORMATION\n`
    content += `======================\n`
    if (backup.university) {
      content += `Name: ${backup.university.name}\n`
      content += `Code: ${backup.university.code}\n`
      content += `Email: ${backup.university.email || 'N/A'}\n`
      content += `Website: ${backup.university.website || 'N/A'}\n\n`
    }

    content += `STATISTICS\n`
    content += `==========\n`
    const stats = this.getBackupStats(backup)
    Object.entries(stats).forEach(([key, value]) => {
      if (key !== 'backupDate') {
        content += `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`
      }
    })

    content += `\nFACULTIES (${backup.faculties.length})\n`
    content += `=================\n`
    backup.faculties.forEach(faculty => {
      content += `- ${faculty.name} (${faculty.code})\n`
    })

    content += `\nDEPARTMENTS (${backup.departments.length})\n`
    content += `=====================\n`
    backup.departments.forEach(dept => {
      content += `- ${dept.name} (${dept.code})\n`
    })

    content += `\nTEACHERS (${backup.teachers.length})\n`
    content += `=================\n`
    backup.teachers.forEach(teacher => {
      content += `- ${teacher.name} (${teacher.initial || 'N/A'}) - ${teacher.email}\n`
    })

    content += `\nCOURSES (${backup.courses.length})\n`
    content += `================\n`
    backup.courses.forEach(course => {
      content += `- ${course.name} (${course.code})\n`
    })

    content += `\nRESPONSE SESSIONS (${backup.response_sessions.length})\n`
    content += `==========================\n`
    backup.response_sessions.forEach(session => {
      content += `- ${session.session_name} (${session.anonymous_key})\n`
    })

    return content
  }

  private static formatBackupAsCSV(backup: UniversityBackupData): string {
    let csv = 'Data Type,Name,Code,Details,Created Date\n'
    
    if (backup.university) {
      csv += `University,"${backup.university.name}","${backup.university.code}","${backup.university.email || ''}","${backup.university.created_at || ''}"\n`
    }

    backup.faculties.forEach(faculty => {
      csv += `Faculty,"${faculty.name}","${faculty.code}","","${faculty.created_at || ''}"\n`
    })

    backup.departments.forEach(dept => {
      csv += `Department,"${dept.name}","${dept.code}","","${dept.created_at || ''}"\n`
    })

    backup.teachers.forEach(teacher => {
      csv += `Teacher,"${teacher.name}","${teacher.initial || ''}","${teacher.email}","${teacher.created_at || ''}"\n`
    })

    backup.courses.forEach(course => {
      csv += `Course,"${course.name}","${course.code}","","${course.created_at || ''}"\n`
    })

    backup.response_sessions.forEach(session => {
      csv += `Session,"${session.session_name}","${session.anonymous_key}","Active: ${session.is_active}","${session.created_at || ''}"\n`
    })

    return csv
  }

  private static triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}