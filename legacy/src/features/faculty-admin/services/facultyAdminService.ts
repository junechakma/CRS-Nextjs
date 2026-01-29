import { supabase } from '../../../lib/supabase'

export interface FacultyDashboardStats {
  totalDepartments: number
  totalTeachers: number
  totalCourses: number
  totalSessions: number
  totalResponses: number
}

export interface RecentActivity {
  id: string
  type: 'department_created' | 'teacher_added' | 'session_completed' | 'course_created'
  message: string
  timestamp: string
  user: string
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  faculty_id: string
  moderator_id?: string
  moderator_name?: string
  moderator_email?: string
  moderator_phone?: string
  stats: {
    total_teachers: number
    total_courses: number
    total_sessions: number
    total_responses: number
  }
  created_at: string
  updated_at: string
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

export interface CreateDepartmentData {
  name: string
  code: string
  description: string
  moderator_name: string
  moderator_email: string
  moderator_phone: string
  temp_password: string
}

export interface CreateTeacherData {
  name: string
  email: string
  initial: string
  phone: string
  department_id: string
  temp_password: string
}

export interface Course {
  id: string
  name: string
  code: string
  description?: string
  teacher_id: string
  teacher_name: string
  department_id: string
  department_name: string
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

export class FacultyAdminService {
  static async getFacultyDashboardStats(facultyId: string): Promise<FacultyDashboardStats> {
    const [
      departmentsResult,
      teachersResult,
      coursesResult,
      sessionsResult,
      responsesResult
    ] = await Promise.all([
      supabase.from('departments').select('id', { count: 'exact' }).eq('faculty_id', facultyId),
      supabase.from('users').select('id', { count: 'exact' }).eq('faculty_id', facultyId).eq('role', 'teacher'),
      supabase.from('courses').select('id', { count: 'exact' }).eq('faculty_id', facultyId),
      supabase.from('response_sessions').select('id', { count: 'exact' }).eq('faculty_id', facultyId),
      supabase.from('responses').select('id', { count: 'exact' }).eq('faculty_id', facultyId)
    ])

    return {
      totalDepartments: departmentsResult.count || 0,
      totalTeachers: teachersResult.count || 0,
      totalCourses: coursesResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalResponses: responsesResult.count || 0
    }
  }

  static async getRecentActivities(facultyId: string, limit: number = 10): Promise<RecentActivity[]> {
    try {
      const { data: recentDepartments } = await supabase
        .from('departments')
        .select('name, created_at, users!created_by(name)')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentTeachers } = await supabase
        .from('users')
        .select('name, created_at, users!approved_by(name)')
        .eq('faculty_id', facultyId)
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
        .limit(4)

      const { data: recentCourses } = await supabase
        .from('courses')
        .select('name, created_at, users!teacher_id(name)')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false })
        .limit(3)

      const activities: RecentActivity[] = []

      recentDepartments?.forEach(department => {
        activities.push({
          id: Math.random().toString(),
          type: 'department_created',
          message: `Department "${department.name}" was created`,
          timestamp: department.created_at,
          user: (department.users as any)?.name || 'System'
        })
      })

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
          message: `Course "${course.name}" was created`,
          timestamp: course.created_at,
          user: (course.users as any)?.name || 'System'
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

  static async getDepartments(facultyId: string): Promise<Department[]> {
    const { data: departmentsData, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        code,
        description,
        faculty_id,
        moderator_id,
        created_at,
        updated_at,
        users!moderator_id (
          name,
          email,
          phone
        )
      `)
      .eq('faculty_id', facultyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!departmentsData) return []

    // Get stats for each department dynamically
    const departmentsWithStats = await Promise.all(
      departmentsData.map(async (department) => {
        const [teachersResult, coursesResult, sessionsResult, responsesResult] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact' }).eq('department_id', department.id).eq('role', 'teacher'),
          supabase.from('courses').select('id', { count: 'exact' }).eq('department_id', department.id),
          supabase.from('response_sessions').select('id', { count: 'exact' }).eq('department_id', department.id),
          supabase.from('responses').select('id', { count: 'exact' }).eq('department_id', department.id)
        ])

        return {
          ...department,
          moderator_name: (department.users as any)?.name,
          moderator_email: (department.users as any)?.email,
          moderator_phone: (department.users as any)?.phone,
          users: undefined,
          stats: {
            total_teachers: teachersResult.count || 0,
            total_courses: coursesResult.count || 0,
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0
          }
        }
      })
    )

    return departmentsWithStats
  }

  static async createDepartment(
    facultyAdminId: string,
    departmentData: Omit<CreateDepartmentData, 'moderator_name' | 'moderator_email' | 'moderator_phone' | 'temp_password'>
  ): Promise<{ success: boolean; error?: string; department_id?: string }> {
    try {
      // Get faculty admin's university and faculty
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id, faculty_id')
        .eq('id', facultyAdminId)
        .single()

      if (adminError || !adminData?.university_id || !adminData?.faculty_id) {
        throw new Error('Faculty admin not found or not assigned to faculty')
      }

      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          code: departmentData.code.toUpperCase(),
          description: departmentData.description,
          faculty_id: adminData.faculty_id,
          university_id: adminData.university_id,
          created_by: facultyAdminId
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        department_id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create department'
      }
    }
  }

  static async createDepartmentWithModerator(
    facultyAdminId: string,
    departmentData: CreateDepartmentData
  ): Promise<{ success: boolean; error?: string; department_id?: string; moderator_id?: string }> {
    try {
      // Get faculty admin's university and faculty
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id, faculty_id')
        .eq('id', facultyAdminId)
        .single()

      if (adminError || !adminData?.university_id || !adminData?.faculty_id) {
        throw new Error('Faculty admin not found or not assigned to faculty')
      }

      const { data, error } = await supabase.rpc('create_department', {
        p_university_admin_id: facultyAdminId,
        p_faculty_id: adminData.faculty_id,
        p_department_name: departmentData.name,
        p_department_code: departmentData.code,
        p_department_description: departmentData.description,
        p_moderator_name: departmentData.moderator_name,
        p_moderator_email: departmentData.moderator_email,
        p_moderator_phone: departmentData.moderator_phone,
        p_temp_password: departmentData.temp_password
      })

      if (error) throw error

      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create department'
      }
    }
  }

  static async updateDepartment(departmentId: string, updates: Partial<Department>) {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', departmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDepartment(departmentId: string) {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', departmentId)

    if (error) throw error
  }

  static async getTeachers(facultyId: string): Promise<Teacher[]> {
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
      .eq('faculty_id', facultyId)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    if (teachersError) throw teachersError
    if (!teachersData || teachersData.length === 0) return []

    // Get department names separately
    const departmentIds = [...new Set(teachersData.filter(t => t.department_id).map(t => t.department_id))]

    const { data: departmentsData } = departmentIds.length > 0 
      ? await supabase
          .from('departments')
          .select('id, name')
          .in('id', departmentIds)
      : { data: [] }

    const departmentMap = new Map((departmentsData || []).map(d => [d.id, d.name]))

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
          department_name: departmentMap.get(teacher.department_id) || '',
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
    facultyAdminId: string,
    teacherData: CreateTeacherData
  ): Promise<{ success: boolean; error?: string; teacher_id?: string }> {
    try {
      console.log('📝 Creating teacher (by faculty admin):', {
        name: teacherData.name,
        email: teacherData.email
      })

      // Get faculty admin's university and faculty details
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id, faculty_id')
        .eq('id', facultyAdminId)
        .single()

      if (adminError || !adminData?.university_id || !adminData?.faculty_id) {
        throw new Error('Faculty admin not found or not assigned to faculty')
      }

      // Verify department belongs to this faculty
      const { data: departmentData, error: deptError } = await supabase
        .from('departments')
        .select('faculty_id, university_id')
        .eq('id', teacherData.department_id)
        .eq('faculty_id', adminData.faculty_id)
        .single()

      if (deptError || !departmentData) {
        throw new Error('Department not found in this faculty')
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
        .eq('department_id', teacherData.department_id)
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
            university_id: adminData.university_id,
            faculty_id: adminData.faculty_id,
            department_id: teacherData.department_id,
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
          approved_by: facultyAdminId,
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

  static async getCourses(facultyId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id,
        name,
        code,
        description,
        teacher_id,
        department_id,
        semester_id,
        status,
        created_at,
        updated_at,
        users!teacher_id (
          name
        ),
        departments!department_id (
          name
        ),
        semesters!semester_id (
          name,
          academic_year
        )
      `)
      .eq('faculty_id', facultyId)
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
          teacher_name: (course.users as any)?.name || '',
          department_name: (course.departments as any)?.name || '',
          semester_name: (course.semesters as any)?.name || '',
          academic_year: (course.semesters as any)?.academic_year || '',
          stats: {
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0
          },
          users: undefined,
          departments: undefined,
          semesters: undefined
        }
      })
    )

    return coursesWithStats
  }

  // ==========================================
  // DEPARTMENT MODERATOR MANAGEMENT METHODS
  // ==========================================

  static async assignDepartmentModerator(
    departmentId: string,
    moderatorData: {
      moderator_name: string
      moderator_email: string
      moderator_phone?: string
      temp_password: string
    }
  ): Promise<{ success: boolean; error?: string; moderator_id?: string }> {
    try {
      // Get current user ID BEFORE creating new user (signUp may change auth context)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const approverId = currentUser?.id

      // Check if moderator email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', moderatorData.moderator_email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Moderator email already exists')
      }

      // Get department details to get university_id and faculty_id
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('university_id, faculty_id')
        .eq('id', departmentId)
        .single()

      if (deptError || !deptData) {
        throw new Error('Department not found')
      }

      // Create department moderator using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: moderatorData.moderator_email.toLowerCase().trim(),
        password: moderatorData.temp_password,
        options: {
          data: {
            name: moderatorData.moderator_name.trim(),
            role: 'department_moderator',
            university_id: deptData.university_id,
            faculty_id: deptData.faculty_id,
            department_id: departmentId,
            phone: moderatorData.moderator_phone || null,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message || 'Failed to create department moderator account')
      }

      if (!authData.user) {
        throw new Error('Failed to create department moderator account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait for the trigger to create the user profile (with retry logic)
      let moderatorProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!moderatorProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role, status, approval_status')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          moderatorProfile = data
          console.log('✅ Moderator profile found:', {
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

      if (!moderatorProfile) {
        console.error('❌ Moderator profile was not created after', maxAttempts, 'attempts')
        throw new Error('Moderator profile was not created automatically. Please try again or contact support.')
      }

      // Update to set approved_by using RPC function (bypasses RLS since auth context may have changed)
      if (approverId) {
        const { error: approvalError } = await supabase.rpc('set_user_approved_by', {
          p_user_id: moderatorProfile.id,
          p_approved_by: approverId
        })

        if (approvalError) {
          console.warn('Warning: Could not update approval fields:', approvalError)
        }
      }

      // Update department with moderator_id
      const { error: updateError } = await supabase
        .from('departments')
        .update({ moderator_id: moderatorProfile.id })
        .eq('id', departmentId)

      if (updateError) throw updateError

      console.log('✅ Department moderator assigned successfully:', moderatorProfile.id)
      return {
        success: true,
        moderator_id: moderatorProfile.id
      }
    } catch (error: any) {
      console.error('❌ assignDepartmentModerator error:', error)
      return {
        success: false,
        error: error.message || 'Failed to assign department moderator'
      }
    }
  }

  static async getDepartmentModerators(facultyId: string): Promise<{
    id: string
    name: string
    email: string
    department_name?: string
    created_at: string
    status: 'active' | 'inactive'
  }[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        status,
        departments!department_id (
          name
        )
      `)
      .eq('faculty_id', facultyId)
      .eq('role', 'department_moderator')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data?.map(moderator => ({
      ...moderator,
      department_name: (() => {
        if (Array.isArray(moderator.departments) && moderator.departments.length > 0) {
          return moderator.departments[0]?.name
        }
        return (moderator.departments as any)?.name
      })(),
      departments: undefined
    })) || []
  }

  static async removeDepartmentModerator(moderatorId: string) {
    // First, remove moderator assignment from any departments
    const { error: updateError } = await supabase
      .from('departments')
      .update({ moderator_id: null })
      .eq('moderator_id', moderatorId)

    if (updateError) throw updateError

    // Then delete the moderator user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', moderatorId)
      .eq('role', 'department_moderator')

    if (error) throw error
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