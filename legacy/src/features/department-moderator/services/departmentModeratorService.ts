import { supabase } from '../../../lib/supabase'

export interface DepartmentDashboardStats {
  totalTeachers: number
  totalCourses: number
  totalSessions: number
  totalResponses: number
  totalStudents: number
}

export interface RecentActivity {
  id: string
  type: 'teacher_added' | 'session_completed' | 'course_created' | 'response_received'
  message: string
  timestamp: string
  user: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  initial?: string
  phone?: string
  department_id: string
  department_name: string
  faculty_id: string
  faculty_name: string
  status: 'active' | 'blocked'
  stats: {
    total_courses: number
    total_sessions: number
    total_responses: number
  }
  created_at: string
  last_login?: string
}

export interface CreateTeacherData {
  name: string
  email: string
  initial: string
  phone: string
  temp_password: string
}

export interface Course {
  id: string
  name: string
  code: string
  course_title?: string
  course_code?: string
  credit_hours?: number
  teacher_id: string
  teacher_name: string
  department_id: string
  semester_id: string
  semester_name: string
  academic_year: string
  status: 'active' | 'inactive'
  stats: {
    total_sessions: number
    total_responses: number
  }
  created_at: string
  updated_at: string
}

export interface ResponseSession {
  id: string
  title: string
  description?: string
  course_id: string
  course_name: string
  teacher_id: string
  teacher_name: string
  semester_id: string
  status: 'draft' | 'active' | 'closed' | 'completed'
  start_date?: string
  end_date?: string
  response_count: number
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  name: string
  email: string
  student_id?: string
  phone?: string
  department_id: string
  faculty_id: string
  batch?: string
  status: 'active' | 'blocked'
  stats: {
    total_responses: number
    total_courses: number
  }
  created_at: string
  last_login?: string
}

export class DepartmentModeratorService {
  static async getDepartmentDashboardStats(departmentId: string): Promise<DepartmentDashboardStats> {
    const [
      teachersResult,
      coursesResult,
      sessionsResult,
      responsesResult,
      studentsResult
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact' }).eq('department_id', departmentId).eq('role', 'teacher'),
      supabase.from('courses').select('id', { count: 'exact' }).eq('department_id', departmentId),
      supabase.from('response_sessions').select('id', { count: 'exact' }).eq('department_id', departmentId),
      supabase.from('responses').select('id', { count: 'exact' }).eq('department_id', departmentId),
      supabase.from('users').select('id', { count: 'exact' }).eq('department_id', departmentId).eq('role', 'student')
    ])

    return {
      totalTeachers: teachersResult.count || 0,
      totalCourses: coursesResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalResponses: responsesResult.count || 0,
      totalStudents: studentsResult.count || 0
    }
  }

  static async getRecentActivities(departmentId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: recentTeachers } = await supabase
        .from('users')
        .select('name, created_at, users!approved_by(name)')
        .eq('department_id', departmentId)
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentCourses } = await supabase
        .from('courses')
        .select('course_title, created_at, users!teacher_id(name)')
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentSessions } = await supabase
        .from('response_sessions')
        .select('title, created_at, users!teacher_id(name)')
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false })
        .limit(4)

      const activities: RecentActivity[] = []

      recentTeachers?.forEach(teacher => {
        activities.push({
          id: Math.random().toString(),
          type: 'teacher_added',
          message: `Teacher "${teacher.name}" was added`,
          timestamp: teacher.created_at,
          user: (teacher.users as any)?.name || 'System'
        })
      })

      recentCourses?.forEach(course => {
        activities.push({
          id: Math.random().toString(),
          type: 'course_created',
          message: `Course "${course.course_title}" was created`,
          timestamp: course.created_at,
          user: (course.users as any)?.name || 'System'
        })
      })

      recentSessions?.forEach(session => {
        activities.push({
          id: Math.random().toString(),
          type: 'session_completed',
          message: `Response session "${session.title}" was created`,
          timestamp: session.created_at,
          user: (session.users as any)?.name || 'System'
        })
      })

      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit)
    } catch (error) {
      console.error('Error fetching recent activities:', error)
      return []
    }
  }

  static async getTeachers(departmentId: string): Promise<Teacher[]> {
    // Get teachers without joins to avoid ambiguous column issues
    const { data: teachersData, error: teachersError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        initial,
        phone,
        department_id,
        faculty_id,
        status,
        created_at,
        last_login
      `)
      .eq('department_id', departmentId)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    if (teachersError) throw teachersError
    if (!teachersData || teachersData.length === 0) return []

    // Get teacher stats (courses, sessions, responses)
    const teachersWithStats = await Promise.all(
      teachersData.map(async (teacher) => {
        const [coursesResult, sessionsResult, responsesResult] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact' }).eq('teacher_id', teacher.id),
          supabase.from('response_sessions').select('id', { count: 'exact' }).eq('teacher_id', teacher.id),
          supabase.from('responses').select('id', { count: 'exact' }).eq('teacher_id', teacher.id)
        ])

        return {
          ...teacher,
          department_name: '', // Will need to be fetched from departments table
          faculty_name: '', // Will need to be fetched from faculties table
          stats: {
            total_courses: coursesResult.count || 0,
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0
          }
        }
      })
    )

    return teachersWithStats
  }

  static async createTeacher(
    moderatorId: string,
    teacherData: CreateTeacherData
  ): Promise<{ success: boolean; error?: string; teacher_id?: string }> {
    try {
      console.log('📝 Creating teacher (by moderator):', {
        name: teacherData.name,
        email: teacherData.email
      })

      // Get moderator's university, faculty, and department details
      const { data: moderatorData, error: moderatorError } = await supabase
        .from('users')
        .select('university_id, faculty_id, department_id')
        .eq('id', moderatorId)
        .single()

      if (moderatorError || !moderatorData?.university_id || !moderatorData?.faculty_id || !moderatorData?.department_id) {
        throw new Error('Department moderator not found or not assigned to department')
      }

      // Check if teacher email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', teacherData.email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Teacher email already exists')
      }

      // Check if initial already exists in this department
      const { data: existingInitial } = await supabase
        .from('users')
        .select('id')
        .eq('department_id', moderatorData.department_id)
        .eq('initial', teacherData.initial.toUpperCase())
        .eq('role', 'teacher')
        .maybeSingle()

      if (existingInitial) {
        throw new Error('Teacher initial already exists in this department')
      }

      // Create teacher using Supabase Auth (same as university admin)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacherData.email.toLowerCase().trim(),
        password: teacherData.temp_password,
        options: {
          data: {
            name: teacherData.name.trim(),
            role: 'teacher',
            university_id: moderatorData.university_id,
            faculty_id: moderatorData.faculty_id,
            department_id: moderatorData.department_id,
            initial: teacherData.initial.toUpperCase(),
            phone: teacherData.phone || null
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message || 'Failed to create teacher account')
      }

      if (!authData.user) {
        throw new Error('Failed to create teacher account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait for the trigger to create the user profile (with retry logic)
      let teacherProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!teacherProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role, status, approval_status')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          teacherProfile = data
          console.log('✅ Teacher profile found:', {
            id: data.id,
            status: data.status,
            approval_status: data.approval_status
          })
          break
        }

        if (profileError && profileError.code !== 'PGRST116') {
          console.warn(`Profile check attempt ${attempts + 1} error:`, profileError)
        }

        attempts++
      }

      if (!teacherProfile) {
        console.error('❌ Teacher profile was not created after', maxAttempts, 'attempts')
        throw new Error('Teacher profile was not created automatically. Please try again or contact support.')
      }

      // Update to set status, approval status, and approved_by
      const { data: updatedProfile, error: approvalError } = await supabase
        .from('users')
        .update({
          status: 'active',
          approval_status: 'approved',
          approved_by: moderatorId,
          approval_date: new Date().toISOString()
        })
        .eq('id', teacherProfile.id)
        .select()
        .single()

      if (approvalError) {
        console.error('❌ Error updating approval fields:', approvalError)
        throw new Error('Failed to set account as approved. Please contact support.')
      }

      console.log('✅ Approval status updated:', {
        status: updatedProfile.status,
        approval_status: updatedProfile.approval_status
      })

      console.log('✅ Teacher created successfully:', teacherProfile.id)
      return {
        success: true,
        teacher_id: teacherProfile.id
      }
    } catch (error: any) {
      console.error('❌ createTeacher error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create teacher'
      }
    }
  }

  static async updateTeacher(teacherId: string, updates: Partial<Teacher>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTeacherStatus(teacherId: string, status: 'active' | 'blocked') {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', teacherId)
      .eq('role', 'teacher')
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteTeacher(teacherId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', teacherId)
      .eq('role', 'teacher')

    if (error) throw error
  }

  static async getCourses(departmentId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        course_title,
        course_code,
        credit_hours,
        teacher_id,
        department_id,
        semester_id,
        status,
        created_at,
        updated_at,
        users!teacher_id (
          name
        ),
        semesters!semester_id (
          name,
          academic_year
        )
      `)
      .eq('department_id', departmentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get course stats
    const coursesWithStats = await Promise.all(
      (data || []).map(async (course) => {
        const [sessionsResult, responsesResult] = await Promise.all([
          supabase.from('response_sessions').select('id', { count: 'exact' }).eq('course_id', course.id),
          supabase.from('responses').select('id', { count: 'exact' }).eq('course_id', course.id)
        ])

        return {
          ...course,
          name: course.course_title,
          code: course.course_code,
          teacher_name: (course.users as any)?.name || '',
          semester_name: (course.semesters as any)?.name || '',
          academic_year: (course.semesters as any)?.academic_year || '',
          stats: {
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0
          },
          users: undefined,
          semesters: undefined
        }
      })
    )

    return coursesWithStats
  }

  static async getResponseSessions(departmentId: string): Promise<ResponseSession[]> {
    const { data, error } = await supabase
      .from('response_sessions')
      .select(`
        id,
        title,
        description,
        course_id,
        teacher_id,
        semester_id,
        status,
        start_date,
        end_date,
        response_count,
        created_at,
        updated_at,
        courses!course_id (
          course_title
        ),
        users!teacher_id (
          name
        )
      `)
      .eq('department_id', departmentId)
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(session => ({
      ...session,
      course_name: (session.courses as any)?.course_title || '',
      teacher_name: (session.users as any)?.name || '',
      courses: undefined,
      users: undefined
    })) || []
  }

  static async getStudents(departmentId: string): Promise<Student[]> {
    // Get students without joins to avoid ambiguous column issues
    const { data: studentsData, error: studentsError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        student_id,
        phone,
        department_id,
        faculty_id,
        batch,
        status,
        created_at,
        last_login
      `)
      .eq('department_id', departmentId)
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (studentsError) throw studentsError
    if (!studentsData || studentsData.length === 0) return []

    // Get student stats (responses, courses)
    const studentsWithStats = await Promise.all(
      studentsData.map(async (student) => {
        const [responsesResult, coursesResult] = await Promise.all([
          supabase.from('responses').select('id', { count: 'exact' }).eq('student_id', student.id),
          supabase.from('courses').select('id', { count: 'exact' }).eq('department_id', departmentId)
        ])

        return {
          ...student,
          stats: {
            total_responses: responsesResult.count || 0,
            total_courses: coursesResult.count || 0
          }
        }
      })
    )

    return studentsWithStats
  }

  static async updateStudentStatus(studentId: string, status: 'active' | 'blocked') {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('id', studentId)
      .eq('role', 'student')
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async bulkUploadTeachers(
    moderatorId: string,
    csvFile: File
  ): Promise<{ success: boolean; error?: string; created_count?: number }> {
    try {
      // Parse CSV file
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      if (headers.length < 4 || !headers.includes('name') || !headers.includes('email')) {
        throw new Error('Invalid CSV format. Required columns: name, email, initial, phone')
      }

      const teachers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const teacher: any = {}
        headers.forEach((header, index) => {
          teacher[header] = values[index] || ''
        })
        return teacher
      })

      let createdCount = 0
      const errors: string[] = []

      for (const teacher of teachers) {
        try {
          const tempPassword = Math.random().toString(36).slice(-8)

          const result = await this.createTeacher(moderatorId, {
            name: teacher.name,
            email: teacher.email,
            initial: teacher.initial,
            phone: teacher.phone,
            temp_password: tempPassword
          })

          if (result.success) {
            createdCount++
          } else {
            errors.push(`Failed to create teacher ${teacher.name}: ${result.error}`)
          }
        } catch (error: any) {
          errors.push(`Error creating teacher ${teacher.name}: ${error.message}`)
        }
      }

      if (errors.length > 0 && createdCount === 0) {
        throw new Error(errors.join('; '))
      }

      return {
        success: true,
        created_count: createdCount,
        error: errors.length > 0 ? `${createdCount} teachers created, ${errors.length} errors: ${errors.join('; ')}` : undefined
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to upload teachers'
      }
    }
  }

  // ==========================================
  // RESPONSE ANALYTICS METHODS
  // ==========================================

  static async getResponseAnalytics(departmentId: string, dateRange?: { start: string; end: string }) {
    try {
      let query = supabase
        .from('responses')
        .select(`
          id,
          created_at,
          rating,
          response_sessions!session_id (
            title,
            courses!course_id (
              course_title,
              users!teacher_id (
                name
              )
            )
          )
        `)
        .eq('department_id', departmentId)

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.start)
          .lte('created_at', dateRange.end)
      }

      const { data, error } = await query

      if (error) throw error

      // Process analytics data
      const totalResponses = data?.length || 0
      const averageRating = data?.reduce((sum, r) => sum + (r.rating || 0), 0) / totalResponses || 0

      // Group by course
      const courseAnalytics = data?.reduce((acc: any, response: any) => {
        const courseName = (response.response_sessions as any)?.courses?.course_title || 'Unknown Course'
        const teacherName = (response.response_sessions as any)?.courses?.users?.name || 'Unknown Teacher'
        
        if (!acc[courseName]) {
          acc[courseName] = {
            course_name: courseName,
            teacher_name: teacherName,
            total_responses: 0,
            average_rating: 0,
            ratings: []
          }
        }
        
        acc[courseName].total_responses++
        acc[courseName].ratings.push(response.rating || 0)
        acc[courseName].average_rating = acc[courseName].ratings.reduce((sum: number, r: number) => sum + r, 0) / acc[courseName].ratings.length
        
        return acc
      }, {}) || {}

      return {
        totalResponses,
        averageRating: Math.round(averageRating * 100) / 100,
        courseAnalytics: Object.values(courseAnalytics),
        responsesByDate: data?.reduce((acc: any, response: any) => {
          const date = new Date(response.created_at).toISOString().split('T')[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {}) || {}
      }
    } catch (error) {
      console.error('Error fetching response analytics:', error)
      throw error
    }
  }

  static async exportResponseData(departmentId: string, format: 'csv' | 'json' = 'csv') {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          id,
          created_at,
          rating,
          text_response,
          response_sessions!session_id (
            title,
            courses!course_id (
              course_title,
              course_code,
              users!teacher_id (
                name,
                initial
              )
            )
          ),
          users!student_id (
            name,
            student_id
          )
        `)
        .eq('department_id', departmentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (format === 'csv') {
        const headers = ['Date', 'Course', 'Teacher', 'Student', 'Rating', 'Comment', 'Session']
        const rows = data?.map(response => [
          new Date(response.created_at).toLocaleDateString(),
          (response.response_sessions as any)?.courses?.course_title || '',
          (response.response_sessions as any)?.courses?.users?.name || '',
          (response.users as any)?.name || '',
          response.rating || '',
          response.text_response || '',
          (response.response_sessions as any)?.title || ''
        ]) || []

        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n')

        return csvContent
      } else {
        return JSON.stringify(data, null, 2)
      }
    } catch (error) {
      console.error('Error exporting response data:', error)
      throw error
    }
  }

  static async getTeacherCourses(teacherId: string): Promise<{
    id: string
    course_code: string
    course_title: string
    credit_hours: number
    sections: string[]
    semester_id: string
    semester_name: string
    academic_year: string
    department_name: string
    faculty_name: string
    university_name: string
    status: 'active' | 'inactive' | 'completed' | 'cancelled'
    settings: {
      allow_responses: boolean
      response_deadline?: string
      require_attendance: boolean
      min_response_count: number
    }
    stats: {
      total_sessions: number
      total_responses: number
      completion_rate: number
    }
    created_at: string
    updated_at: string
  }[]> {
    try {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          course_code,
          course_title,
          sections,
          status,
          created_at,
          semesters!semester_id (
            name,
            academic_year
          )
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false })

      if (coursesError) {
        console.error('❌ Courses query error:', coursesError)
        throw coursesError
      }

      if (!coursesData || coursesData.length === 0) {
        console.log('📭 No courses found for teacher:', teacherId)
        return []
      }

      console.log('📊 Raw courses data:', JSON.stringify(coursesData, null, 2))

      // Get stats for each course
      const coursesWithStats = await Promise.all(
        coursesData.map(async (course) => {
          const [sessionsResult, responsesResult] = await Promise.all([
            supabase.from('response_sessions')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id),
            supabase.from('responses')
              .select('id', { count: 'exact' })
              .eq('course_id', course.id)
          ])

          // Calculate completion rate (could be based on expected vs actual responses)
          const totalSessions = sessionsResult.count || 0
          const totalResponses = responsesResult.count || 0
          const completionRate = totalSessions > 0 ? Math.round((totalResponses / (totalSessions * 30)) * 100) : 0 // Assuming 30 students per session

          const semesterInfo = Array.isArray(course.semesters) ? course.semesters[0] : course.semesters || {}
          const semesterName = semesterInfo?.name || 'Not Set'
          const academicYear = semesterInfo?.academic_year || new Date().getFullYear().toString()
          const year = academicYear.includes('-') ? parseInt(academicYear.split('-')[0]) : parseInt(academicYear)

          console.log(`📋 Course ${course.course_code} semester info:`, { semesterInfo, semesterName, academicYear, year })

          return {
            id: course.id,
            course_code: course.course_code,
            course_title: course.course_title,
            credit_hours: 3, // Default value
            sections: course.sections || [],
            semester_id: '', // semester_id not available in this query
            semester_name: semesterName,
            academic_year: academicYear,
            department_name: '', // Will need to be fetched
            faculty_name: '', // Will need to be fetched
            university_name: '', // Will need to be fetched
            status: course.status as 'active' | 'inactive' | 'completed' | 'cancelled',
            settings: {
              allow_responses: true,
              response_deadline: undefined,
              require_attendance: false,
              min_response_count: 1
            },
            stats: {
              total_sessions: totalSessions,
              total_responses: totalResponses,
              completion_rate: Math.min(100, completionRate)
            },
            created_at: course.created_at,
            updated_at: course.created_at // Using created_at as fallback
          }
        })
      )

      return coursesWithStats
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
      throw error
    }
  }
}