import { supabase } from '../../../lib/supabase'

export interface DashboardStats {
  totalFaculties: number
  totalDepartments: number
  totalTeachers: number
  totalStudents: number
  totalCourses: number
  totalSessions: number
  totalResponses: number
  totalSemesters: number
  currentSemester: string
}

export interface RecentActivity {
  id: string
  type: 'faculty_created' | 'department_created' | 'teacher_added' | 'session_completed'
  message: string
  timestamp: string
  user: string
}

export interface Faculty {
  id: string
  name: string
  code: string
  description?: string
  admin_id?: string
  admin_name?: string
  admin_email?: string
  admin_phone?: string
  stats: {
    total_departments: number
    total_teachers: number
    total_courses: number
    total_responses: number
  }
  created_at: string
  updated_at: string
}

export interface Department {
  id: string
  name: string
  code: string
  description?: string
  faculty_id: string
  faculty_name: string
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

export interface Question {
  id: string
  text: string
  type: 'rating' | 'multiple_choice' | 'text' | 'yes_no'
  category: 'instructor' | 'content' | 'delivery' | 'assessment' | 'overall'
  scale?: number
  options?: string[]
  required: boolean
  priority?: number
  is_active: boolean
  created_at: string
}

export interface QuestionTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
  is_default: boolean
  is_active: boolean
  university_id?: string
  created_by?: string
  creator_name?: string
  creator_role?: string
  usage_count: number
  created_at: string
  updated_at?: string
}

export interface CreateFacultyData {
  name: string
  code: string
  description: string
  admin_name: string
  admin_email: string
  admin_phone: string
  temp_password: string
}

export interface CreateDepartmentData {
  name: string
  code: string
  description: string
  faculty_id: string
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

export interface Semester {
  id: string
  name: 'Spring' | 'Summer' | 'Autumn' | 'Year'
  academic_year: string
  status: 'active' | 'inactive' | 'completed'
  start_date?: string
  end_date?: string
  registration_start?: string
  registration_end?: string
  is_current: boolean
  stats: {
    total_courses: number
    total_sessions: number
    total_responses: number
    total_teachers: number
  }
  created_at: string
  updated_at: string
}

export interface CreateSemesterData {
  name: 'Spring' | 'Summer' | 'Autumn' | 'Year'
  academic_year: string
  start_date?: string
  end_date?: string
  registration_start?: string
  registration_end?: string
  is_current?: boolean
}

export interface Duration {
  id: string
  minutes: number
  label: string
  university_id: string
  created_at: string
  created_by: string
}

export interface CreateDurationData {
  minutes: string
  label: string
}

export class UniversityAdminService {
  static async getDashboardStats(universityId: string): Promise<DashboardStats> {
    const [
      facultiesResult,
      departmentsResult,
      teachersResult,
      studentsResult,
      coursesResult,
      sessionsResult,
      responsesResult,
      semestersResult,
      currentSemesterResult
    ] = await Promise.all([
      supabase.from('faculties').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('departments').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('users').select('id', { count: 'exact' }).eq('university_id', universityId).eq('role', 'teacher'),
      supabase.from('users').select('id', { count: 'exact' }).eq('university_id', universityId).eq('role', 'student'),
      supabase.from('courses').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('response_sessions').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('responses').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('semesters').select('id', { count: 'exact' }).eq('university_id', universityId),
      supabase.from('semesters').select('name, academic_year').eq('university_id', universityId).eq('is_current', true).single()
    ])

    return {
      totalFaculties: facultiesResult.count || 0,
      totalDepartments: departmentsResult.count || 0,
      totalTeachers: teachersResult.count || 0,
      totalStudents: studentsResult.count || 0,
      totalCourses: coursesResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalResponses: responsesResult.count || 0,
      totalSemesters: semestersResult.count || 0,
      currentSemester: currentSemesterResult.data 
        ? `${currentSemesterResult.data.name} ${currentSemesterResult.data.academic_year}`
        : 'Not Set'
    }
  }

  static async getRecentActivities(universityId: string, limit: number = 10): Promise<RecentActivity[]> {
    // This would typically come from an activity log table
    // For now, we'll return mock data based on recent creations
    try {
      const { data: recentFaculties } = await supabase
        .from('faculties')
        .select('name, created_at, created_by')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentDepartments } = await supabase
        .from('departments')
        .select('name, created_at, created_by')
        .eq('university_id', universityId)
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: recentTeachers } = await supabase
        .from('users')
        .select('name, created_at, approved_by')
        .eq('university_id', universityId)
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })
        .limit(4)

      const activities: RecentActivity[] = []

      recentFaculties?.forEach(faculty => {
        activities.push({
          id: Math.random().toString(),
          type: 'faculty_created',
          message: `Faculty "${faculty.name}" was created`,
          timestamp: faculty.created_at,
          user: 'Admin'
        })
      })

      recentDepartments?.forEach(department => {
        activities.push({
          id: Math.random().toString(),
          type: 'department_created',
          message: `Department "${department.name}" was created`,
          timestamp: department.created_at,
          user: 'Admin'
        })
      })

      recentTeachers?.forEach(teacher => {
        activities.push({
          id: Math.random().toString(),
          type: 'teacher_added',
          message: `Teacher "${teacher.name}" was added`,
          timestamp: teacher.created_at,
          user: 'Admin'
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

  static async getFaculties(universityId: string): Promise<Faculty[]> {
    // Get faculties first
    const { data: facultiesData, error: facultiesError } = await supabase
      .from('faculties')
      .select(`
        id,
        name,
        code,
        description,
        admin_id,
        created_at,
        updated_at
      `)
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })

    if (facultiesError) throw facultiesError
    if (!facultiesData) return []

    // Get all faculty admins for this university to handle both:
    // 1. Admins linked via faculty.admin_id
    // 2. Admins who registered with faculty_id but faculty.admin_id wasn't set
    const facultyIds = facultiesData.map(f => f.id)
    const { data: allFacultyAdmins } = await supabase
      .from('users')
      .select('id, name, email, phone, faculty_id')
      .eq('university_id', universityId)
      .eq('role', 'faculty_admin')
      .in('faculty_id', facultyIds)

    // Create a map of faculty_id -> admin info
    const adminsByFacultyId = new Map((allFacultyAdmins || []).map(a => [a.faculty_id, a]))
    // Also create a map of admin_id -> admin info for direct lookups
    const adminsById = new Map((allFacultyAdmins || []).map(a => [a.id, a]))

    // Get stats for each faculty dynamically
    const facultiesWithStats = await Promise.all(
      facultiesData.map(async (faculty) => {
        const [departmentsResult, teachersResult, coursesResult, responsesResult] = await Promise.all([
          supabase.from('departments').select('id', { count: 'exact' }).eq('faculty_id', faculty.id),
          supabase.from('users').select('id', { count: 'exact' }).eq('faculty_id', faculty.id).eq('role', 'teacher'),
          supabase.from('courses').select('id', { count: 'exact' }).eq('faculty_id', faculty.id),
          supabase.from('responses').select('id', { count: 'exact' }).eq('faculty_id', faculty.id)
        ])

        // Try to find admin by admin_id first, then by faculty_id
        let admin = faculty.admin_id ? adminsById.get(faculty.admin_id) : null
        if (!admin) {
          admin = adminsByFacultyId.get(faculty.id)
        }

        return {
          ...faculty,
          admin_id: admin?.id || faculty.admin_id,
          admin_name: admin?.name,
          admin_email: admin?.email,
          admin_phone: admin?.phone,
          stats: {
            total_departments: departmentsResult.count || 0,
            total_teachers: teachersResult.count || 0,
            total_courses: coursesResult.count || 0,
            total_responses: responsesResult.count || 0
          }
        }
      })
    )

    return facultiesWithStats
  }

  static async createFacultyWithAdmin(
    universityAdminId: string,
    facultyData: CreateFacultyData
  ): Promise<{ success: boolean; error?: string; faculty_id?: string; admin_id?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      // Check if faculty code already exists
      const { data: existingFaculty } = await supabase
        .from('faculties')
        .select('id')
        .eq('university_id', adminData.university_id)
        .eq('code', facultyData.code.toUpperCase())
        .maybeSingle()

      if (existingFaculty) {
        throw new Error('Faculty code already exists')
      }

      // Check if admin email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', facultyData.admin_email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Admin email already exists')
      }

      // First, create the faculty
      const { data: faculty, error: facultyError } = await supabase
        .from('faculties')
        .insert({
          name: facultyData.name,
          code: facultyData.code.toUpperCase(),
          description: facultyData.description,
          university_id: adminData.university_id,
          created_by: universityAdminId
        })
        .select()
        .single()

      if (facultyError) throw facultyError

      console.log('✅ Faculty created:', faculty.id)

      // Create faculty admin using Supabase Auth (same as teacher registration)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: facultyData.admin_email.toLowerCase().trim(),
        password: facultyData.temp_password,
        options: {
          data: {
            name: facultyData.admin_name.trim(),
            role: 'faculty_admin',
            university_id: adminData.university_id,
            faculty_id: faculty.id,
            phone: facultyData.admin_phone || null,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        // Rollback: delete the faculty
        await supabase.from('faculties').delete().eq('id', faculty.id)
        throw new Error(authError.message || 'Failed to create faculty admin account')
      }

      if (!authData.user) {
        // Rollback: delete the faculty
        await supabase.from('faculties').delete().eq('id', faculty.id)
        throw new Error('Failed to create faculty admin account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait for the trigger to create the user profile (with retry logic)
      let adminProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!adminProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role, status, approval_status')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          adminProfile = data
          console.log('✅ Admin profile found:', {
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

      if (!adminProfile) {
        console.error('❌ Admin profile was not created after', maxAttempts, 'attempts')
        // Rollback: delete the faculty
        await supabase.from('faculties').delete().eq('id', faculty.id)
        throw new Error('Admin profile was not created automatically. Please try again or contact support.')
      }

      // Update to set status, approval status, and approved_by
      const { data: updatedProfile, error: approvalError } = await supabase
        .from('users')
        .update({
          status: 'active',
          approval_status: 'approved',
          approved_by: universityAdminId,
          approval_date: new Date().toISOString()
        })
        .eq('id', adminProfile.id)
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

      // Update faculty with admin_id
      const { error: updateError } = await supabase
        .from('faculties')
        .update({ admin_id: adminProfile.id })
        .eq('id', faculty.id)

      if (updateError) {
        console.error('❌ Error updating faculty with admin_id:', updateError)
        throw updateError
      }

      console.log('✅ Faculty created with admin successfully')
      return {
        success: true,
        faculty_id: faculty.id,
        admin_id: adminProfile.id
      }
    } catch (error: any) {
      console.error('❌ createFacultyWithAdmin error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create faculty with admin'
      }
    }
  }

  // Alias for backward compatibility
  static async createFaculty(
    universityAdminId: string,
    facultyData: Omit<CreateFacultyData, 'admin_name' | 'admin_email' | 'admin_phone' | 'temp_password'>
  ): Promise<{ success: boolean; error?: string; faculty_id?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      const { data, error } = await supabase
        .from('faculties')
        .insert({
          name: facultyData.name,
          code: facultyData.code.toUpperCase(),
          description: facultyData.description,
          university_id: adminData.university_id,
          created_by: universityAdminId
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        faculty_id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create faculty'
      }
    }
  }

  static async updateFaculty(facultyId: string, updates: Partial<Faculty>) {
    const { data, error } = await supabase
      .from('faculties')
      .update(updates)
      .eq('id', facultyId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteFaculty(facultyId: string) {
    const { error } = await supabase
      .from('faculties')
      .delete()
      .eq('id', facultyId)

    if (error) throw error
  }

  static async getDepartments(universityId: string): Promise<Department[]> {
    // Get departments first
    const { data: departmentsData, error: departmentsError } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        code,
        description,
        faculty_id,
        moderator_id,
        created_at,
        updated_at
      `)
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })

    if (departmentsError) throw departmentsError
    if (!departmentsData) return []

    // Get faculty names and moderator details separately to avoid ambiguous column reference
    const facultyIds = [...new Set(departmentsData.filter(d => d.faculty_id).map(d => d.faculty_id))]
    const moderatorIds = departmentsData.filter(d => d.moderator_id).map(d => d.moderator_id)

    const [facultiesResult, moderatorsResult] = await Promise.all([
      facultyIds.length > 0
        ? supabase.from('faculties').select('id, name').in('id', facultyIds)
        : { data: [] },
      moderatorIds.length > 0
        ? supabase.from('users').select('id, name, email, phone').in('id', moderatorIds)
        : { data: [] }
    ])

    const facultiesMap = new Map((facultiesResult.data || []).map(f => [f.id, f.name]))
    const moderatorsMap = new Map((moderatorsResult.data || []).map(m => [m.id, m]))

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
          faculty_name: department.faculty_id ? facultiesMap.get(department.faculty_id) || '' : '',
          moderator_name: department.moderator_id ? moderatorsMap.get(department.moderator_id)?.name : undefined,
          moderator_email: department.moderator_id ? moderatorsMap.get(department.moderator_id)?.email : undefined,
          moderator_phone: department.moderator_id ? moderatorsMap.get(department.moderator_id)?.phone : undefined,
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
    universityAdminId: string,
    departmentData: Omit<CreateDepartmentData, 'moderator_name' | 'moderator_email' | 'moderator_phone' | 'temp_password'>
  ): Promise<{ success: boolean; error?: string; department_id?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      const { data, error } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          code: departmentData.code.toUpperCase(),
          description: departmentData.description,
          faculty_id: departmentData.faculty_id,
          university_id: adminData.university_id,
          created_by: universityAdminId
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
    universityAdminId: string,
    departmentData: CreateDepartmentData
  ): Promise<{ success: boolean; error?: string; department_id?: string; moderator_id?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      // Verify faculty belongs to this university
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculties')
        .select('university_id')
        .eq('id', departmentData.faculty_id)
        .eq('university_id', adminData.university_id)
        .single()

      if (facultyError || !facultyData) {
        throw new Error('Faculty not found in this university')
      }

      // Check if department code already exists in this faculty
      const { data: existingDept } = await supabase
        .from('departments')
        .select('id')
        .eq('faculty_id', departmentData.faculty_id)
        .eq('code', departmentData.code.toUpperCase())
        .maybeSingle()

      if (existingDept) {
        throw new Error('Department code already exists in this faculty')
      }

      // Check if moderator email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', departmentData.moderator_email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Moderator email already exists')
      }

      // First, create the department
      const { data: department, error: deptError } = await supabase
        .from('departments')
        .insert({
          name: departmentData.name,
          code: departmentData.code.toUpperCase(),
          description: departmentData.description,
          faculty_id: departmentData.faculty_id,
          university_id: adminData.university_id,
          created_by: universityAdminId
        })
        .select()
        .single()

      if (deptError) throw deptError

      console.log('✅ Department created:', department.id)

      // Create department moderator using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: departmentData.moderator_email.toLowerCase().trim(),
        password: departmentData.temp_password,
        options: {
          data: {
            name: departmentData.moderator_name.trim(),
            role: 'department_moderator',
            university_id: adminData.university_id,
            faculty_id: departmentData.faculty_id,
            department_id: department.id,
            phone: departmentData.moderator_phone || null,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        // Rollback: delete the department
        await supabase.from('departments').delete().eq('id', department.id)
        throw new Error(authError.message || 'Failed to create department moderator account')
      }

      if (!authData.user) {
        // Rollback: delete the department
        await supabase.from('departments').delete().eq('id', department.id)
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
        // Rollback: delete the department
        await supabase.from('departments').delete().eq('id', department.id)
        throw new Error('Moderator profile was not created automatically. Please try again or contact support.')
      }

      // Update to set status, approval status, and approved_by
      const { data: updatedProfile, error: approvalError } = await supabase
        .from('users')
        .update({
          status: 'active',
          approval_status: 'approved',
          approved_by: universityAdminId,
          approval_date: new Date().toISOString()
        })
        .eq('id', moderatorProfile.id)
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

      // Update department with moderator_id
      const { error: updateError } = await supabase
        .from('departments')
        .update({ moderator_id: moderatorProfile.id })
        .eq('id', department.id)

      if (updateError) {
        console.error('❌ Error updating department with moderator_id:', updateError)
        throw updateError
      }

      console.log('✅ Department created with moderator successfully')
      return {
        success: true,
        department_id: department.id,
        moderator_id: moderatorProfile.id
      }
    } catch (error: any) {
      console.error('❌ createDepartmentWithModerator error:', error)
      return {
        success: false,
        error: error.message || 'Failed to create department with moderator'
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

  static async getTeachers(universityId: string): Promise<Teacher[]> {
    console.log('🔍 getTeachers called with universityId:', universityId)
    
    // First, get teachers without joins to avoid ambiguous column issues
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
      .eq('university_id', universityId)
      .eq('role', 'teacher')
      .order('created_at', { ascending: false })

    console.log('📊 Teachers query result:', { data: teachersData, error: teachersError })
    
    if (teachersError) {
      console.error('❌ Teachers query error:', teachersError)
      throw teachersError
    }

    if (!teachersData || teachersData.length === 0) {
      console.log('📭 No teachers found')
      return []
    }

    // Get department and faculty names separately
    const departmentIds = [...new Set(teachersData.filter(t => t.department_id).map(t => t.department_id))]
    const facultyIds = [...new Set(teachersData.filter(t => t.faculty_id).map(t => t.faculty_id))]

    const [departmentsResult, facultiesResult] = await Promise.all([
      departmentIds.length > 0 ? supabase
        .from('departments')
        .select('id, name')
        .in('id', departmentIds) : { data: [] },
      facultyIds.length > 0 ? supabase
        .from('faculties')
        .select('id, name')
        .in('id', facultyIds) : { data: [] }
    ])

    const departmentMap = new Map((departmentsResult.data || []).map(d => [d.id, d.name]))
    const facultyMap = new Map((facultiesResult.data || []).map(f => [f.id, f.name]))

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
          faculty_name: facultyMap.get(teacher.faculty_id) || '',
          stats: {
            total_courses: coursesResult.count || 0,
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0
          }
        }
      })
    )

    console.log('✅ Final teachers with stats:', teachersWithStats)
    return teachersWithStats
  }

  static async createTeacher(
    universityAdminId: string,
    teacherData: CreateTeacherData
  ): Promise<{ success: boolean; error?: string; teacher_id?: string }> {
    try {
      console.log('📝 Creating teacher:', {
        name: teacherData.name,
        email: teacherData.email,
        department_id: teacherData.department_id
      })

      // Get university admin's university and verify permissions
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('id, university_id, role')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData) {
        throw new Error('University admin not found')
      }

      if (adminData.role !== 'university_admin') {
        throw new Error('Only university admins can create teachers')
      }

      if (!adminData.university_id) {
        throw new Error('University admin not assigned to university')
      }

      // Get department details to verify it belongs to the university and get faculty_id
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('faculty_id, university_id')
        .eq('id', teacherData.department_id)
        .single()

      if (deptError || !deptData) {
        throw new Error('Department not found')
      }

      if (deptData.university_id !== adminData.university_id) {
        throw new Error('Department does not belong to your university')
      }

      // Check if teacher email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', teacherData.email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Teacher email already exists')
      }

      // Check if initial already exists in this department
      if (teacherData.initial) {
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
      }

      // Create teacher using Supabase Auth (same as registration)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacherData.email.toLowerCase().trim(),
        password: teacherData.temp_password,
        options: {
          data: {
            name: teacherData.name.trim(),
            role: 'teacher',
            university_id: adminData.university_id,
            faculty_id: deptData.faculty_id,
            department_id: teacherData.department_id,
            initial: teacherData.initial?.toUpperCase(),
            phone: teacherData.phone || null,
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
      // The trigger automatically sets teachers as approved and active
      let teacherProfile = null
      let attempts = 0
      const maxAttempts = 10 // Increased attempts for reliability

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
          // PGRST116 is "not found" which is expected during retries
          console.warn(`Profile check attempt ${attempts + 1} error:`, profileError)
        }

        attempts++
      }

      if (!teacherProfile) {
        console.error('❌ Teacher profile was not created after', maxAttempts, 'attempts')
        throw new Error('Teacher profile was not created automatically. Please try again or contact support.')
      }

      // Update to set approved_by (trigger auto-approves but doesn't set who approved)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          approved_by: universityAdminId,
          approval_date: new Date().toISOString()
        })
        .eq('id', teacherProfile.id)

      if (updateError) {
        console.warn('Warning: Could not update approved_by field:', updateError)
        // Don't fail the entire operation for this
      }

      console.log('✅ Teacher created and approved successfully:', teacherProfile.id)
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
    try {
      // Get current user to verify they're an admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Use the database function to update teacher (bypasses RLS)
      const { data, error } = await supabase.rpc('update_teacher_by_admin', {
        p_university_admin_id: user.id,
        p_teacher_id: teacherId,
        p_teacher_name: updates.name || null,
        p_teacher_email: updates.email || null,
        p_teacher_initial: updates.initial || null,
        p_teacher_phone: updates.phone || null,
        p_department_id: updates.department_id || null
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)

      return data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update teacher')
    }
  }

  static async updateTeacherStatus(teacherId: string, status: 'active' | 'blocked') {
    try {
      // Get current user to verify they're an admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Use the database function to update teacher status (bypasses RLS)
      const { data, error } = await supabase.rpc('update_teacher_status_by_admin', {
        p_university_admin_id: user.id,
        p_teacher_id: teacherId,
        p_status: status
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)

      return data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update teacher status')
    }
  }

  static async deleteTeacher(teacherId: string) {
    try {
      // Get current user to verify they're an admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Use the database function to delete teacher (bypasses RLS)
      const { data, error } = await supabase.rpc('delete_teacher_by_admin', {
        p_university_admin_id: user.id,
        p_teacher_id: teacherId
      })

      if (error) throw error
      if (!data.success) throw new Error(data.error)

      return data
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete teacher')
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

  static async bulkUploadTeachers(
    universityAdminId: string,
    csvFile: File
  ): Promise<{ success: boolean; error?: string; created_count?: number }> {
    try {
      // Parse CSV file
      const text = await csvFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim())

      if (headers.length < 6 || !headers.includes('name') || !headers.includes('email') || !headers.includes('department_code') || !headers.includes('temp_password')) {
        throw new Error('Invalid CSV format. Required columns: name, email, initial, phone, department_code, temp_password')
      }

      const teachers = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const teacher: any = {}
        headers.forEach((header, index) => {
          teacher[header] = values[index] || ''
        })
        return teacher
      })

      // Get university admin data
      const { data: adminData } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (!adminData) throw new Error('University admin not found')

      const { data: departments } = await supabase
        .from('departments')
        .select('id, code')
        .eq('university_id', adminData.university_id)

      const departmentMap = new Map(departments?.map(d => [d.code, d.id]) || [])

      let createdCount = 0
      const errors: string[] = []

      for (const teacher of teachers) {
        try {
          const departmentId = departmentMap.get(teacher.department_code.toUpperCase())
          if (!departmentId) {
            errors.push(`Department code "${teacher.department_code}" not found for teacher ${teacher.name}`)
            continue
          }

          const tempPassword = teacher.temp_password || Math.random().toString(36).slice(-8)

          const result = await this.createTeacher(universityAdminId, {
            name: teacher.name,
            email: teacher.email,
            initial: teacher.initial,
            phone: teacher.phone,
            department_id: departmentId,
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

  static async getQuestions(universityId: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .or(`university_id.eq.${universityId},is_default.eq.true`)
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createQuestion(universityId: string, questionData: Omit<Question, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        ...questionData,
        university_id: universityId,
        is_default: false,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateQuestion(questionId: string, updates: Partial<Question>) {
    const { data, error } = await supabase
      .from('questions')
      .update(updates)
      .eq('id', questionId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteQuestion(questionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, delete from template_questions (remove from all templates)
      const { error: unlinkError } = await supabase
        .from('template_questions')
        .delete()
        .eq('question_id', questionId)

      if (unlinkError) {
        console.error('Error unlinking question from templates:', unlinkError)
        // Continue anyway - the question might not be linked to any template
      }

      // Then delete the actual question
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting question:', error)
      return { success: false, error: error.message || 'Failed to delete question' }
    }
  }

  static async getQuestionTemplates(universityId: string): Promise<QuestionTemplate[]> {
    try {
      // Fetch both default (system) templates and university-specific templates
      const { data, error } = await supabase
        .from('question_templates')
        .select(`
          id,
          name,
          description,
          is_default,
          is_active,
          university_id,
          created_by,
          usage_count,
          created_at,
          updated_at,
          template_questions (
            order_index,
            is_required,
            custom_priority,
            questions (*)
          )
        `)
        .or(`university_id.eq.${universityId},and(university_id.is.null,is_default.eq.true)`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching templates:', error)
        throw error
      }

      console.log('Fetched templates:', data?.length || 0)

      // Fetch activation status for this university
      const { data: activations, error: activationError } = await supabase
        .from('university_template_activations')
        .select('template_id, is_active')
        .eq('university_id', universityId)

      if (activationError) {
        console.error('Error fetching activations:', activationError)
      }

      const activationMap = new Map(
        (activations || []).map(a => [a.template_id, a.is_active])
      )

      // Get unique creator IDs to fetch creator info separately
      const creatorIds = Array.from(new Set(
        (data || [])
          .map(t => t.created_by)
          .filter(id => id !== null)
      ))

      // Fetch creator info separately if there are any creators
      let creatorsMap = new Map()
      if (creatorIds.length > 0) {
        const { data: creatorsData } = await supabase
          .from('users')
          .select('id, name, email, role')
          .in('id', creatorIds)

        creatorsMap = new Map((creatorsData || []).map(c => [c.id, c]))
      }

      return data?.map((template: any) => {
        const creator = template.created_by ? creatorsMap.get(template.created_by) : null

        // Determine activation status:
        // - For default templates: check university_template_activations, default to true if no record
        // - For custom templates: use template.is_active
        let isActiveForUniversity: boolean
        if (template.is_default && template.university_id === null) {
          // Default template: check activation map, default to true
          isActiveForUniversity = activationMap.has(template.id)
            ? activationMap.get(template.id)!
            : true
        } else {
          // Custom template: use template's is_active field
          isActiveForUniversity = template.is_active
        }

        return {
          id: template.id,
          name: template.name,
          description: template.description,
          is_default: template.is_default,
          is_active: isActiveForUniversity,
          university_id: template.university_id,
          created_by: template.created_by,
          creator_name: creator?.name,
          creator_role: creator?.role,
          usage_count: template.usage_count,
          created_at: template.created_at,
          updated_at: template.updated_at,
          questions: template.template_questions
            ?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((tq: any) => ({
              ...tq.questions,
              required: tq.is_required !== null ? tq.is_required : tq.questions.required,
              priority: tq.order_index || 0
            })) || []
        }
      }) || []
    } catch (error) {
      console.error('Error fetching question templates:', error)
      return []
    }
  }

  static async createQuestionTemplate(
    universityId: string, 
    templateData: { name: string; description: string; questions: any[] }
  ): Promise<{ success: boolean; error?: string; template_id?: string }> {
    try {
      // Start a transaction by creating the template first
      const { data: template, error: templateError } = await supabase
        .from('question_templates')
        .insert({
          name: templateData.name,
          description: templateData.description,
          is_default: false,
          is_active: true,
          university_id: universityId
        })
        .select('id')
        .single()

      if (templateError) throw templateError

      const templateId = template.id

      // Create questions and link them to the template
      for (let i = 0; i < templateData.questions.length; i++) {
        const question = templateData.questions[i]
        
        // Create the question
        const { data: questionData, error: questionError } = await supabase
          .from('questions')
          .insert({
            text: question.text,
            type: question.type,
            category: question.category,
            scale: question.scale,
            options: question.options,
            required: question.required,
            is_active: true,
            is_default: false,
            university_id: universityId
          })
          .select('id')
          .single()

        if (questionError) throw questionError

        // Link question to template
        const { error: linkError } = await supabase
          .from('template_questions')
          .insert({
            template_id: templateId,
            question_id: questionData.id,
            order_index: i + 1,
            is_required: question.required
          })

        if (linkError) throw linkError
      }

      return {
        success: true,
        template_id: templateId
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create question template'
      }
    }
  }

  static async copyDefaultTemplate(
    universityId: string,
    templateId?: string,
    newTemplateName?: string
  ): Promise<{ success: boolean; error?: string; template_id?: string }> {
    try {
      const user = await supabase.auth.getUser()
      const { data, error } = await supabase.rpc('copy_default_template_to_university', {
        p_university_id: universityId,
        p_template_id: templateId,
        p_new_template_name: newTemplateName,
        p_created_by: user.data.user?.id
      })

      if (error) throw error

      return {
        success: true,
        template_id: data
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to copy default template'
      }
    }
  }

  static async updateQuestionTemplate(
    templateId: string,
    templateData: { name: string; description: string; questions: any[] }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Update template basic info
      const { error: templateError } = await supabase
        .from('question_templates')
        .update({
          name: templateData.name,
          description: templateData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (templateError) throw templateError

      // Get existing template questions to see what needs to be updated
      const { data: existingTemplateQuestions, error: existingError } = await supabase
        .from('template_questions')
        .select(`
          id,
          question_id,
          order_index,
          questions(id, text, type, category, scale, options, required)
        `)
        .eq('template_id', templateId)
        .order('order_index')

      if (existingError) throw existingError

      // Delete all existing template questions (cascade will handle cleanup)
      const { error: deleteError } = await supabase
        .from('template_questions')
        .delete()
        .eq('template_id', templateId)

      if (deleteError) throw deleteError

      // Create new questions and link them to template
      for (let i = 0; i < templateData.questions.length; i++) {
        const question = templateData.questions[i]
        
        // Check if this question already exists (by matching text and type)
        const existingQuestion = existingTemplateQuestions?.find((etq: any) => 
          etq.questions.text === question.text && 
          etq.questions.type === question.type &&
          etq.questions.category === question.category
        )

        let questionId: string

        if (existingQuestion) {
          // Update existing question
          const { error: updateError } = await supabase
            .from('questions')
            .update({
              text: question.text,
              type: question.type,
              category: question.category,
              scale: question.scale,
              options: question.options,
              required: question.required,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingQuestion.question_id)

          if (updateError) throw updateError
          questionId = existingQuestion.question_id
        } else {
          // Create new question
          const { data: newQuestion, error: questionError } = await supabase
            .from('questions')
            .insert({
              text: question.text,
              type: question.type,
              category: question.category,
              scale: question.scale,
              options: question.options,
              required: question.required,
              is_active: true,
              is_default: false,
              university_id: (await supabase.from('question_templates').select('university_id').eq('id', templateId).single()).data?.university_id
            })
            .select('id')
            .single()

          if (questionError) throw questionError
          questionId = newQuestion.id
        }

        // Link question to template
        const { error: linkError } = await supabase
          .from('template_questions')
          .insert({
            template_id: templateId,
            question_id: questionId,
            order_index: i + 1,
            is_required: question.required
          })

        if (linkError) throw linkError
      }

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update question template'
      }
    }
  }

  static async deleteQuestionTemplate(templateId: string) {
    const { error } = await supabase.rpc('delete_template_with_cleanup', {
      p_template_id: templateId
    })

    if (error) throw error
  }

  static async setTemplateActiveStatus(
    templateId: string,
    isActive: boolean,
    universityId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!universityId) {
        throw new Error('University ID is required')
      }

      // First, check if the template is a default template
      const { data: template, error: templateError } = await supabase
        .from('question_templates')
        .select('is_default, university_id')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError

      // For default templates (system-wide), use university_template_activations
      if (template.is_default && template.university_id === null) {
        const { data: currentUser } = await supabase.auth.getUser()

        // Upsert activation record
        const { error: upsertError } = await supabase
          .from('university_template_activations')
          .upsert({
            university_id: universityId,
            template_id: templateId,
            is_active: isActive,
            activated_by: currentUser?.user?.id,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'university_id,template_id'
          })

        if (upsertError) throw upsertError
      } else {
        // For custom university templates, update the template directly
        const { error: updateError } = await supabase
          .from('question_templates')
          .update({ is_active: isActive })
          .eq('id', templateId)
          .eq('university_id', universityId)

        if (updateError) throw updateError
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error updating template status:', error)
      return {
        success: false,
        error: error.message || 'Failed to update template status'
      }
    }
  }

  static async getActiveTemplatesForUniversity(universityId: string) {
    const { data, error } = await supabase.rpc('get_active_templates_for_university', {
      p_university_id: universityId
    })

    if (error) throw error
    return data || []
  }

  static async incrementTemplateUsage(templateId: string) {
    const { error } = await supabase.rpc('increment_template_usage', {
      p_template_id: templateId
    })

    if (error) throw error
  }

  static async getTemplateWithQuestions(templateId: string) {
    const { data, error } = await supabase.rpc('get_template_with_questions', {
      p_template_id: templateId
    })

    if (error) throw error

    // Group results by template info and questions
    const templateInfo = data?.[0]
    if (!templateInfo) return null

    return {
      id: templateInfo.template_id,
      name: templateInfo.template_name,
      description: templateInfo.template_description,
      is_default: templateInfo.is_default,
      usage_count: templateInfo.usage_count,
      created_at: templateInfo.created_at,
      questions: data
        .filter((row: any) => row.question_id)
        .map((row: any) => ({
          id: row.question_id,
          text: row.question_text,
          type: row.question_type,
          category: row.question_category,
          scale: row.question_scale,
          options: row.question_options,
          required: row.template_question_required !== null ? row.template_question_required : row.question_required,
          priority: row.template_question_order || 0,
          is_active: row.question_is_active,
          order_index: row.template_question_order
        }))
        .sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
    }
  }

  static async reorderTemplateQuestions(
    templateId: string,
    questionOrders: { question_id: string; order_index: number }[]
  ) {
    const { error } = await supabase.rpc('reorder_template_questions', {
      p_template_id: templateId,
      p_question_orders: questionOrders
    })

    if (error) throw error
  }

  static async getApplicationStatus(userId?: string): Promise<{
    status: 'pending' | 'approved' | 'rejected'
    university_name: string
    university_code: string
    applied_date: string
    review_date?: string
    rejection_reason?: string
  }> {
    if (!userId) throw new Error('User ID is required')

    console.log('🔍 Fetching application status for user:', userId)

    const { data, error } = await supabase
      .from('university_applications')
      .select('*')
      .eq('user_id', userId)
      .single()

    console.log('📊 Application query result:', { data, error })

    if (error) {
      console.error('❌ Error fetching application:', error)
      throw error
    }

    if (!data) {
      console.error('❌ No application data found')
      throw new Error('Application not found')
    }

    return {
      status: data.application_status,
      university_name: data.university_name,
      university_code: data.university_code,
      applied_date: data.created_at,
      review_date: data.review_date,
      rejection_reason: data.rejection_reason
    }
  }

  // ==========================================
  // SEMESTER MANAGEMENT METHODS
  // ==========================================

  static async getSemesters(universityId: string): Promise<Semester[]> {
    console.log('🔍 getSemesters called with universityId:', universityId)
    
    const { data, error } = await supabase
      .from('semesters')
      .select('*')
      .eq('university_id', universityId)
      .order('created_at', { ascending: false })

    console.log('📊 Semesters query result:', { data, error })
    
    if (error) {
      console.error('❌ Semesters query error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log('📭 No semesters found')
      return []
    }

    // Get semester stats for each semester
    const semestersWithStats = await Promise.all(
      data.map(async (semester) => {
        const [coursesResult, sessionsResult, responsesResult, teachersResult] = await Promise.all([
          supabase.from('courses').select('id', { count: 'exact' }).eq('semester_id', semester.id),
          supabase.from('response_sessions').select('id', { count: 'exact' }).eq('semester_id', semester.id),
          supabase.from('responses').select('id', { count: 'exact' }).eq('university_id', universityId),
          supabase.from('users').select('id', { count: 'exact' }).eq('university_id', universityId).eq('role', 'teacher')
        ])

        return {
          ...semester,
          stats: {
            total_courses: coursesResult.count || 0,
            total_sessions: sessionsResult.count || 0,
            total_responses: responsesResult.count || 0,
            total_teachers: teachersResult.count || 0
          }
        }
      })
    )

    console.log('✅ Final semesters with stats:', semestersWithStats)
    return semestersWithStats
  }

  static async createSemester(
    universityAdminId: string,
    semesterData: CreateSemesterData
  ): Promise<{ success: boolean; error?: string; semester_id?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      // Check if semester already exists for this university
      const { data: existingSemester } = await supabase
        .from('semesters')
        .select('id')
        .eq('university_id', adminData.university_id)
        .eq('name', semesterData.name)
        .eq('academic_year', semesterData.academic_year)
        .single()

      if (existingSemester) {
        throw new Error('Semester already exists for this academic year')
      }

      // If this semester is set as current, unset all other current semesters
      if (semesterData.is_current) {
        await supabase
          .from('semesters')
          .update({ is_current: false })
          .eq('university_id', adminData.university_id)
      }

      // Create semester
      const { data, error } = await supabase
        .from('semesters')
        .insert({
          university_id: adminData.university_id,
          name: semesterData.name,
          academic_year: semesterData.academic_year,
          start_date: semesterData.start_date || null,
          end_date: semesterData.end_date || null,
          registration_start: semesterData.registration_start || null,
          registration_end: semesterData.registration_end || null,
          is_current: semesterData.is_current || false,
          created_by: universityAdminId
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        semester_id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create semester'
      }
    }
  }

  static async updateSemester(semesterId: string, updates: Partial<Semester>) {
    const { data, error } = await supabase
      .from('semesters')
      .update(updates)
      .eq('id', semesterId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async setCurrentSemester(
    universityAdminId: string,
    semesterId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get university admin's university
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('university_id')
        .eq('id', universityAdminId)
        .single()

      if (adminError || !adminData?.university_id) {
        throw new Error('University admin not found or not assigned to university')
      }

      // Verify semester belongs to this university
      const { data: semesterData } = await supabase
        .from('semesters')
        .select('id')
        .eq('id', semesterId)
        .eq('university_id', adminData.university_id)
        .single()

      if (!semesterData) {
        throw new Error('Semester not found in this university')
      }

      // Unset all current semesters for this university
      await supabase
        .from('semesters')
        .update({ is_current: false })
        .eq('university_id', adminData.university_id)

      // Set the specified semester as current
      await supabase
        .from('semesters')
        .update({ is_current: true })
        .eq('id', semesterId)

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to set current semester'
      }
    }
  }

  static async deleteSemester(semesterId: string) {
    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', semesterId)

    if (error) throw error
  }

  // ==========================================
  // FACULTY ADMIN MANAGEMENT METHODS
  // ==========================================

  static async assignFacultyAdmin(
    facultyId: string,
    adminData: {
      admin_name: string
      admin_email: string
      admin_phone?: string
      temp_password: string
    }
  ): Promise<{ success: boolean; error?: string; admin_id?: string }> {
    try {
      // Get current user ID BEFORE creating new user (signUp may change auth context)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const approverId = currentUser?.id

      // Check if admin email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminData.admin_email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Admin email already exists')
      }

      // Get faculty details to get university_id
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculties')
        .select('university_id')
        .eq('id', facultyId)
        .single()

      if (facultyError || !facultyData) {
        throw new Error('Faculty not found')
      }

      // Create faculty admin using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.admin_email.toLowerCase().trim(),
        password: adminData.temp_password,
        options: {
          data: {
            name: adminData.admin_name.trim(),
            role: 'faculty_admin',
            university_id: facultyData.university_id,
            faculty_id: facultyId,
            phone: adminData.admin_phone || null,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message || 'Failed to create faculty admin account')
      }

      if (!authData.user) {
        throw new Error('Failed to create faculty admin account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait for the trigger to create the user profile (with retry logic)
      let adminProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!adminProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role, status, approval_status')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          adminProfile = data
          console.log('✅ Admin profile found:', {
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

      if (!adminProfile) {
        console.error('❌ Admin profile was not created after', maxAttempts, 'attempts')
        throw new Error('Admin profile was not created automatically. Please try again or contact support.')
      }

      // Update to set approved_by using RPC function (bypasses RLS since auth context may have changed)
      if (approverId) {
        const { error: approvalError } = await supabase.rpc('set_user_approved_by', {
          p_user_id: adminProfile.id,
          p_approved_by: approverId
        })

        if (approvalError) {
          console.warn('Warning: Could not update approval fields:', approvalError)
        }
      }

      // Update faculty with admin_id
      const { error: updateError } = await supabase
        .from('faculties')
        .update({ admin_id: adminProfile.id })
        .eq('id', facultyId)

      if (updateError) throw updateError

      console.log('✅ Faculty admin assigned successfully:', adminProfile.id)
      return {
        success: true,
        admin_id: adminProfile.id
      }
    } catch (error: any) {
      console.error('❌ assignFacultyAdmin error:', error)
      return {
        success: false,
        error: error.message || 'Failed to assign faculty admin'
      }
    }
  }

  static async getFacultyAdmins(universityId: string): Promise<{
    id: string
    name: string
    email: string
    created_at: string
    status: 'active' | 'inactive'
  }[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, created_at, status')
      .eq('university_id', universityId)
      .eq('role', 'faculty_admin')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async addFacultyAdmin(
    universityId: string,
    adminData: {
      admin_name: string
      admin_email: string
      admin_phone?: string
      temp_password: string
    }
  ): Promise<{ success: boolean; error?: string; admin_id?: string }> {
    try {
      // Get current user ID BEFORE creating new user (signUp may change auth context)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      const approverId = currentUser?.id

      // Check if admin email already exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', adminData.admin_email.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        throw new Error('Admin email already exists')
      }

      // Create faculty admin using Supabase Auth
      // Not assigned to specific faculty yet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.admin_email.toLowerCase().trim(),
        password: adminData.temp_password,
        options: {
          data: {
            name: adminData.admin_name.trim(),
            role: 'faculty_admin',
            university_id: universityId,
            phone: adminData.admin_phone || null,
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        throw new Error(authError.message || 'Failed to create faculty admin account')
      }

      if (!authData.user) {
        throw new Error('Failed to create faculty admin account')
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Wait for the trigger to create the user profile (with retry logic)
      let adminProfile = null
      let attempts = 0
      const maxAttempts = 10

      while (!adminProfile && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300))

        const { data, error: profileError } = await supabase
          .from('users')
          .select('id, name, email, role, status, approval_status')
          .eq('auth_user_id', authData.user.id)
          .maybeSingle()

        if (data) {
          adminProfile = data
          console.log('✅ Admin profile found:', {
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

      if (!adminProfile) {
        console.error('❌ Admin profile was not created after', maxAttempts, 'attempts')
        throw new Error('Admin profile was not created automatically. Please try again or contact support.')
      }

      // Update to set approved_by using RPC function (bypasses RLS since auth context may have changed)
      if (approverId) {
        const { error: approvalError } = await supabase.rpc('set_user_approved_by', {
          p_user_id: adminProfile.id,
          p_approved_by: approverId
        })

        if (approvalError) {
          console.warn('Warning: Could not update approval fields:', approvalError)
        }
      }

      console.log('✅ Faculty admin added successfully:', adminProfile.id)
      return {
        success: true,
        admin_id: adminProfile.id
      }
    } catch (error: any) {
      console.error('❌ addFacultyAdmin error:', error)
      return {
        success: false,
        error: error.message || 'Failed to add faculty admin'
      }
    }
  }

  static async removeFacultyAdmin(adminId: string) {
    // First, remove admin assignment from any faculties
    const { error: updateError } = await supabase
      .from('faculties')
      .update({ admin_id: null })
      .eq('admin_id', adminId)

    if (updateError) throw updateError

    // Then delete the admin user
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', adminId)
      .eq('role', 'faculty_admin')

    if (error) throw error
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

  static async getDepartmentModerators(universityId: string): Promise<{
    id: string
    name: string
    email: string
    department_name?: string
    created_at: string
    status: 'active' | 'inactive'
  }[]> {
    // Get moderators first
    const { data: moderatorsData, error: moderatorsError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        created_at,
        status,
        department_id
      `)
      .eq('university_id', universityId)
      .eq('role', 'department_moderator')
      .order('created_at', { ascending: false })

    if (moderatorsError) throw moderatorsError
    if (!moderatorsData) return []

    // Get department names separately to avoid ambiguous column reference
    const departmentIds = moderatorsData.filter(m => m.department_id).map(m => m.department_id)
    const { data: departmentsData } = departmentIds.length > 0
      ? await supabase.from('departments').select('id, name').in('id', departmentIds)
      : { data: [] }

    const departmentsMap = new Map((departmentsData || []).map(d => [d.id, d.name]))

    return moderatorsData.map(moderator => ({
      id: moderator.id,
      name: moderator.name,
      email: moderator.email,
      created_at: moderator.created_at,
      status: moderator.status as 'active' | 'inactive',
      department_name: moderator.department_id ? departmentsMap.get(moderator.department_id) : undefined
    }))
  }

  static async addDepartmentModerator(
    universityId: string,
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

      // Create department moderator using Supabase Auth
      // Not assigned to specific department yet
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: moderatorData.moderator_email.toLowerCase().trim(),
        password: moderatorData.temp_password,
        options: {
          data: {
            name: moderatorData.moderator_name.trim(),
            role: 'department_moderator',
            university_id: universityId,
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

      console.log('✅ Department moderator added successfully:', moderatorProfile.id)
      return {
        success: true,
        moderator_id: moderatorProfile.id
      }
    } catch (error: any) {
      console.error('❌ addDepartmentModerator error:', error)
      return {
        success: false,
        error: error.message || 'Failed to add department moderator'
      }
    }
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

  // ==========================================
  // DURATION MANAGEMENT METHODS
  // ==========================================

  static async getDurations(universityId: string): Promise<Duration[]> {
    const { data, error } = await supabase
      .from('durations')
      .select('*')
      .eq('university_id', universityId)
      .order('minutes', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createDuration(
    universityId: string,
    durationData: CreateDurationData,
    createdBy?: string
  ): Promise<{ success: boolean; error?: string; duration_id?: string }> {
    try {
      const minutes = parseInt(durationData.minutes)
      if (isNaN(minutes) || minutes <= 0) {
        throw new Error('Invalid duration minutes')
      }

      // Check if duration already exists for this university
      const { data: existingDuration } = await supabase
        .from('durations')
        .select('id')
        .eq('university_id', universityId)
        .eq('minutes', minutes)
        .single()

      if (existingDuration) {
        throw new Error('Duration already exists for this university')
      }

      const { data, error } = await supabase
        .from('durations')
        .insert({
          university_id: universityId,
          minutes: minutes,
          label: durationData.label,
          created_by: createdBy || null
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        duration_id: data.id
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create duration'
      }
    }
  }

  static async updateDuration(
    durationId: string,
    durationData: CreateDurationData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const minutes = parseInt(durationData.minutes)
      if (isNaN(minutes) || minutes <= 0) {
        throw new Error('Invalid duration minutes')
      }

      const { error } = await supabase
        .from('durations')
        .update({
          minutes: minutes,
          label: durationData.label
        })
        .eq('id', durationId)
        .select()
        .single()

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update duration'
      }
    }
  }

  static async deleteDuration(durationId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('durations')
        .delete()
        .eq('id', durationId)

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete duration'
      }
    }
  }

  // ==========================================
  // LOGO MANAGEMENT METHODS
  // ==========================================

  static async updateUniversityLogo(
    universityId: string,
    logoPath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.rpc('update_university_logo', {
        p_university_id: universityId,
        p_logo_path: logoPath
      })

      if (error) throw error

      return data
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update university logo'
      }
    }
  }

  static async getPublicUniversityInfo(universityCode: string) {
    try {
      const { data, error } = await supabase.rpc('get_public_university_info', {
        p_university_code: universityCode
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching public university info:', error)
      throw error
    }
  }

  static async getAllPublicUniversities() {
    try {
      const { data, error } = await supabase.rpc('get_all_public_universities')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching all public universities:', error)
      throw error
    }
  }
}

export const universityAdminService = UniversityAdminService