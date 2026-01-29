import { supabase } from '../../../lib/supabase'

export interface DashboardStats {
  totalUniversities: number
  totalUsers: number
  pendingApprovals: number
  totalResponses: number
  totalSessions: number
  totalFaculties: number
  totalDepartments: number
  totalTeachers: number
}

export interface PendingUser {
  id: string
  name: string
  email: string
  role: string
  university_name?: string
  faculty_name?: string
  department_name?: string
  application_date: string
  status: string
  approval_status: string
}

export interface UniversityApplication {
  user_id: string
  admin_name: string
  admin_email: string
  admin_phone?: string
  university_name: string
  university_code: string
  university_address?: string
  university_city?: string
  university_state?: string
  university_country?: string
  university_postal_code?: string
  university_email?: string
  university_phone?: string
  university_website?: string
  application_date: string
}

export interface CreateSuperAdminRequest {
  email: string
  password: string
  name: string
}

export interface Question {
  id: string
  text: string
  type: 'rating' | 'text' | 'multiple_choice' | 'yes_no'
  scale?: number
  required: boolean
  category: string
  options?: string[]
}

export interface QuestionTemplate {
  id: string
  name: string
  description: string
  questions: Question[]
  is_active?: boolean
  is_default?: boolean
  university_id?: string
  created_by?: string
  creator_name?: string
  creator_role?: string
  usage_count?: number
  created_at?: string
  updated_at?: string
}

export interface CreateQuestionTemplateData {
  name: string
  description: string
  questions: Question[]
}

export interface ApproveUniversityAdminRequest {
  super_admin_id: string
  user_id: string
  university_name: string
  university_code: string
  university_settings?: any
}

export class SuperAdminService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const [
      universitiesResult,
      usersResult,
      pendingApplicationsResult,
      pendingUsersResult,
      responsesResult,
      sessionsResult,
      facultiesResult,
      departmentsResult,
      teachersResult
    ] = await Promise.all([
      supabase.from('universities').select('id', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }),
      supabase.from('university_applications').select('id', { count: 'exact' }).eq('application_status', 'pending'),
      supabase.from('users').select('id', { count: 'exact' }).eq('approval_status', 'pending'),
      supabase.from('responses').select('id', { count: 'exact' }),
      supabase.from('response_sessions').select('id', { count: 'exact' }),
      supabase.from('faculties').select('id', { count: 'exact' }),
      supabase.from('departments').select('id', { count: 'exact' }),
      supabase.from('users').select('id', { count: 'exact' }).eq('role', 'teacher')
    ])

    const pendingApprovals = (pendingApplicationsResult.count || 0) + (pendingUsersResult.count || 0)

    return {
      totalUniversities: universitiesResult.count || 0,
      totalUsers: usersResult.count || 0,
      pendingApprovals,
      totalResponses: responsesResult.count || 0,
      totalSessions: sessionsResult.count || 0,
      totalFaculties: facultiesResult.count || 0,
      totalDepartments: departmentsResult.count || 0,
      totalTeachers: teachersResult.count || 0
    }
  }

  static async getPendingUsers(limit: number = 10): Promise<PendingUser[]> {
    // Get pending users who are NOT university admins (or university admins without applications)
    // University admins with applications are shown in the "Pending University Applications" section
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        application_date,
        status,
        approval_status,
        application_id,
        universities!fk_users_university_id (name),
        faculties!fk_users_faculty_id (name),
        departments!fk_users_department_id (name)
      `)
      .eq('approval_status', 'pending')
      .or('role.neq.university_admin,application_id.is.null') // Exclude university admins who have submitted applications
      .order('application_date', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(user => ({
      ...user,
      university_name: (user.universities as any)?.name || 'N/A',
      faculty_name: (user.faculties as any)?.name || 'N/A',
      department_name: (user.departments as any)?.name || 'N/A'
    })) || []
  }

  static async getPendingUniversityApplications(): Promise<UniversityApplication[]> {
    try {
      // First, try to check if the table exists by doing a simple count
      const { count, error: countError } = await supabase
        .from('university_applications')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        console.error('university_applications table not found or accessible:', countError)
        return []
      }

      console.log('Found', count, 'total university applications')

      // Get pending university admin applications from the dedicated table
      const { data, error } = await supabase
        .from('university_applications')
        .select(`
          *,
          users!university_applications_user_id_fkey (
            id,
            name,
            email,
            phone,
            application_date
          )
        `)
        .eq('application_status', 'pending')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending applications:', error)
        // Try without the join if the foreign key is the issue
        const { data: simpleData, error: simpleError } = await supabase
          .from('university_applications')
          .select('*')
          .eq('application_status', 'pending')
          .order('created_at', { ascending: false })

        if (simpleError) throw simpleError

        console.log('Fallback query returned:', simpleData)
        
        // Transform without user data
        return (simpleData || []).map(app => ({
          user_id: app.user_id,
          admin_name: app.admin_name,
          admin_email: app.admin_email,
          admin_phone: app.admin_phone,
          university_name: app.university_name,
          university_code: app.university_code,
          university_address: app.university_address,
          university_city: app.university_city,
          university_state: app.university_state,
          university_country: app.university_country,
          university_postal_code: app.university_postal_code,
          university_email: app.university_email,
          university_phone: app.university_phone,
          university_website: app.university_website,
          application_date: app.created_at
        }))
      }
      
      console.log('Successfully loaded applications with user data:', data)
      
      // Transform the data to UniversityApplication format
      return (data || []).map(app => ({
        user_id: app.user_id,
        admin_name: app.admin_name,
        admin_email: app.admin_email,
        admin_phone: app.admin_phone,
        university_name: app.university_name,
        university_code: app.university_code,
        university_address: app.university_address,
        university_city: app.university_city,
        university_state: app.university_state,
        university_country: app.university_country,
        university_postal_code: app.university_postal_code,
        university_email: app.university_email,
        university_phone: app.university_phone,
        university_website: app.university_website,
        application_date: app.users?.application_date || app.created_at
      }))
    } catch (error) {
      console.error('Error in getPendingUniversityApplications:', error)
      return []
    }
  }

  // Create initial Super Admin (should only be called once)
  static async createSuperAdmin(request: CreateSuperAdminRequest) {
    try {
      const { data, error } = await supabase.rpc('create_super_admin', {
        p_email: request.email,
        p_password: request.password,
        p_name: request.name
      })

      if (error) {
        console.error('Create super admin RPC error:', error)
        throw error
      }
      return data
    } catch (rpcError) {
      console.error('RPC call failed, trying direct insert:', rpcError)
      
      // Fallback: Direct database insertion
      const { data, error } = await supabase
        .from('users')
        .insert({
          email: request.email,
          password_hash: `temp_${Date.now()}`, // Temporary - should be hashed
          role: 'super_admin',
          name: request.name,
          approval_status: 'approved',
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, admin_id: data.id, message: 'Super admin created successfully' }
    }
  }

  // Approve University Admin and create University
  static async approveUniversityAdmin(superAdminId: string, application: UniversityApplication) {
    // First, find the application ID
    const { data: appData, error: appError } = await supabase
      .from('university_applications')
      .select('id')
      .eq('user_id', application.user_id)
      .single()

    if (appError) throw appError

    const { data, error } = await supabase.rpc('approve_university_application', {
      p_super_admin_id: superAdminId,
      p_application_id: appData.id,
      p_university_settings: {
        address: application.university_address,
        city: application.university_city,
        state: application.university_state,
        country: application.university_country,
        postal_code: application.university_postal_code,
        email: application.university_email,
        phone: application.university_phone,
        website: application.university_website
      }
    })

    if (error) throw error

    // Check if the RPC function returned success
    if (!data?.success) {
      // RPC function returned an error - need to update users table directly
      console.warn('RPC approve_university_application returned:', data)
      
      // Get the application details to create university and update user
      const { data: appDetails, error: detailsError } = await supabase
        .from('university_applications')
        .select('*')
        .eq('id', appData.id)
        .single()
      
      if (detailsError) throw detailsError
      
      // Create the university
      const { data: universityData, error: uniError } = await supabase
        .from('universities')
        .insert({
          name: appDetails.university_name,
          code: appDetails.university_code,
          address: appDetails.university_address,
          city: appDetails.university_city,
          state: appDetails.university_state,
          country: appDetails.university_country,
          postal_code: appDetails.university_postal_code,
          email: appDetails.university_email,
          phone: appDetails.university_phone,
          website: appDetails.university_website,
          created_by: superAdminId,
          admin_id: application.user_id
        })
        .select('id')
        .single()
      
      if (uniError) throw uniError
      
      // Update the user with university assignment and approval
      const { error: userError } = await supabase
        .from('users')
        .update({
          university_id: universityData.id,
          approved_by: superAdminId,
          approval_date: new Date().toISOString(),
          approval_status: 'approved',
          status: 'active'
        })
        .eq('id', application.user_id)
      
      if (userError) throw userError
      
      // Update application status
      const { error: appUpdateError } = await supabase
        .from('university_applications')
        .update({ 
          application_status: 'approved',
          reviewed_by: superAdminId,
          review_date: new Date().toISOString()
        })
        .eq('id', appData.id)
      
      if (appUpdateError) throw appUpdateError
      
      return { success: true, university_id: universityData.id, admin_id: application.user_id }
    }

    // RPC succeeded - application is already updated by the RPC function
    return data
  }

  static async rejectUser(userId: string, rejectedBy: string, reason?: string) {
    // Update user status
    const { error: userError } = await supabase
      .from('users')
      .update({
        approval_status: 'rejected',
        approved_by: rejectedBy,
        approval_date: new Date().toISOString()
      })
      .eq('id', userId)

    if (userError) throw userError

    // Also update the application status if it's a university admin
    const { error: appError } = await supabase
      .from('university_applications')
      .update({
        application_status: 'rejected',
        reviewed_by: rejectedBy,
        review_date: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('user_id', userId)

    // Don't throw error if no application exists (for non-university admin users)
    if (appError && !appError.message.includes('0 rows')) {
      throw appError
    }
  }

  // Process university application (approve or reject)
  static async processUniversityApplication(
    userId: string, 
    superAdminId: string, 
    action: 'approve' | 'reject', 
    reason?: string
  ) {
    // First, check if this is a university admin application
    const { data: application, error: appError } = await supabase
      .from('university_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('application_status', 'pending')
      .maybeSingle()

    if (appError) throw appError

    if (application) {
      // This is a university admin application
      if (action === 'approve') {
        return await this.approveUniversityAdmin(superAdminId, {
          user_id: application.user_id,
          admin_name: application.admin_name,
          admin_email: application.admin_email,
          admin_phone: application.admin_phone,
          university_name: application.university_name,
          university_code: application.university_code,
          university_address: application.university_address,
          university_city: application.university_city,
          university_state: application.university_state,
          university_country: application.university_country,
          university_postal_code: application.university_postal_code,
          university_email: application.university_email,
          university_phone: application.university_phone,
          university_website: application.university_website,
          application_date: application.created_at
        })
      } else {
        return await this.rejectUser(userId, superAdminId, reason)
      }
    } else {
      // This is a regular user (not university admin)
      if (action === 'approve') {
        // For regular users, just update their approval status
        const { error } = await supabase
          .from('users')
          .update({
            approval_status: 'approved',
            approved_by: superAdminId,
            approval_date: new Date().toISOString(),
            status: 'active'
          })
          .eq('id', userId)

        if (error) throw error
        return { success: true, message: 'User approved successfully' }
      } else {
        return await this.rejectUser(userId, superAdminId, reason)
      }
    }
  }

  static async getAllUsers(filters?: {
    role?: string
    status?: string
    university_id?: string
    search?: string
  }) {
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        status,
        application_date,
        approval_status,
        last_login,
        universities!fk_users_university_id (name),
        faculties!fk_users_faculty_id (name),
        departments!fk_users_department_id (name)
      `)

    if (filters?.role) {
      query = query.eq('role', filters.role)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.university_id) {
      query = query.eq('university_id', filters.university_id)
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Register a new University Admin (for self-registration)
  static async registerUniversityAdmin(userData: {
    name: string
    email: string
    password: string
    phone?: string
  }) {
    // Hash password and create user with pending status
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          role: 'university_admin'
        }
      }
    })

    if (error) throw error

    // Insert into users table with pending status
    const { data: userRecord, error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user?.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        role: 'university_admin',
        status: 'pending',
        approval_status: 'pending',
        password_hash: 'handled_by_auth' // Auth handles password
      })
      .select()
      .single()

    if (insertError) throw insertError
    return userRecord
  }

  static async getAllUniversities() {
    const { data, error } = await supabase
      .from('universities')
      .select(`
        id,
        name,
        code,
        address,
        city,
        state,
        country,
        postal_code,
        email,
        phone,
        website,
        settings,
        stats,
        status,
        created_at,
        updated_at,
        admin:users!fk_universities_admin_id(id, name, email),
        created_by_user:users!fk_universities_created_by(id, name, email)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Fetch real-time stats for each university
    if (data) {
      const universitiesWithStats = await Promise.all(
        data.map(async (university) => {
          try {
            // Get faculty count
            const { count: facultyCount } = await supabase
              .from('faculties')
              .select('id', { count: 'exact', head: true })
              .eq('university_id', university.id)

            // Get department count
            const { count: departmentCount } = await supabase
              .from('departments')
              .select('id', { count: 'exact', head: true })
              .eq('university_id', university.id)

            // Get teacher count
            const { count: teacherCount } = await supabase
              .from('users')
              .select('id', { count: 'exact', head: true })
              .eq('university_id', university.id)
              .eq('role', 'teacher')

            // Get student count
            const { count: studentCount } = await supabase
              .from('users')
              .select('id', { count: 'exact', head: true })
              .eq('university_id', university.id)
              .eq('role', 'student')

            return {
              ...university,
              stats: {
                total_faculties: facultyCount || 0,
                total_departments: departmentCount || 0,
                total_teachers: teacherCount || 0,
                total_students: studentCount || 0
              }
            }
          } catch (err) {
            console.error(`Error fetching stats for university ${university.id}:`, err)
            return university
          }
        })
      )

      return universitiesWithStats
    }

    return data
  }

  static async updateUniversity(universityId: string, updates: any) {
    const { data, error } = await supabase
      .from('universities')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', universityId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteUniversity(universityId: string) {
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', universityId)

    if (error) throw error
  }

  // Block/Unblock users
  static async toggleUserStatus(userId: string, status: 'active' | 'blocked') {
    const { error } = await supabase
      .from('users')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) throw error
  }

  static async updateUser(userId: string, updates: {
    name?: string
    email?: string
    phone?: string
    role?: string
    status?: string
    university_id?: string
    faculty_id?: string
    department_id?: string
  }) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteUser(userId: string, newAdminId?: string) {
    // First check if user is a super admin
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, auth_user_id')
      .eq('id', userId)
      .single()

    if (userError) throw userError

    if (user.role === 'super_admin') {
      throw new Error('Cannot delete super admin users')
    }

    // Check if user is admin of any universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, name')
      .eq('admin_id', userId)

    if (uniError) throw uniError

    if (universities && universities.length > 0) {
      // User is admin of universities
      if (!newAdminId) {
        throw new Error(
          `This user is admin of ${universities.length} ${universities.length === 1 ? 'university' : 'universities'}. Please transfer ownership first.`
        )
      }

      // Transfer university ownership to new admin
      for (const uni of universities) {
        const { error: transferError } = await supabase
          .from('universities')
          .update({
            admin_id: newAdminId,
            updated_at: new Date().toISOString()
          })
          .eq('id', uni.id)

        if (transferError) throw transferError
      }
    }

    // Delete from database first (this will cascade delete related records)
    const { error: dbError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) throw dbError

    // Delete from Supabase Auth if auth_user_id exists
    if (user.auth_user_id) {
      try {
        // Call the delete_auth_user function to delete user from auth.users
        const { error: authError } = await supabase.rpc('delete_auth_user', {
          user_id: user.auth_user_id
        })

        if (authError) {
          console.error('Failed to delete user from Supabase Auth:', authError)
          // Don't throw error here as the database record is already deleted
          // Log the error for admin review
        }
      } catch (authErr) {
        console.error('Error deleting from Supabase Auth:', authErr)
        // Continue even if auth deletion fails
      }
    }
  }

  static async getUserUniversities(userId: string) {
    const { data, error } = await supabase
      .from('universities')
      .select('id, name')
      .eq('admin_id', userId)

    if (error) throw error
    return data || []
  }

  static async getEligibleAdmins(universityId?: string) {
    let query = supabase
      .from('users')
      .select('id, name, email, role')
      .eq('role', 'university_admin')
      .eq('status', 'active')
      .eq('approval_status', 'approved')

    if (universityId) {
      query = query.eq('university_id', universityId)
    }

    const { data, error } = await query.order('name')

    if (error) throw error
    return data || []
  }

  static async createUniversityAdminBySuperAdmin(
    superAdminId: string,
    adminData: {
      email: string
      password: string
      name: string
      phone?: string
    }
  ) {
    try {
      // Step 1: Create auth user using Supabase Auth
      // Note: Email confirmation is handled automatically by Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            name: adminData.name,
            phone: adminData.phone,
            role: 'university_admin'
          },
          emailRedirectTo: `${window.location.origin}/login`,
          // Auto-confirm email for super admin created accounts
          // This requires email confirmation to be disabled in Supabase settings
          // or the admin will need to confirm their email before logging in
        }
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error('Failed to create auth user')
      }

      // Step 2: Create user record in database (no university)
      // NOTE: Parameters must match the exact order in the SQL function definition:
      // (p_super_admin_id, p_auth_user_id, p_email, p_name, p_phone)
      const { data, error } = await supabase.rpc('create_university_admin_by_super_admin', {
        p_super_admin_id: superAdminId,
        p_auth_user_id: authData.user.id,
        p_email: adminData.email,
        p_name: adminData.name,
        p_phone: adminData.phone || null
      })

      if (error) {
        // If user record creation fails, we should ideally delete the auth user
        // But Supabase doesn't allow that from client side, so we just report the error
        console.error('Failed to create user record, but auth user was created:', authData.user.id)
        throw error
      }

      return data
    } catch (error: any) {
      console.error('Error creating university admin:', error)
      throw error
    }
  }

  static async getSuperAdminEmails(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'super_admin')
        .eq('status', 'active')
        .eq('approval_status', 'approved')

      if (error) {
        console.error('Error fetching super admin emails:', error)
        return []
      }

      return data?.map(user => user.email).filter(email => email) || []
    } catch (error) {
      console.error('Error in getSuperAdminEmails:', error)
      return []
    }
  }

  // Backward compatibility method
  static async getSuperAdminEmail(): Promise<string | null> {
    const emails = await this.getSuperAdminEmails()
    return emails.length > 0 ? emails[0] : null
  }

  static async getSystemAnalytics() {
    try {
      // Get overall metrics
      const { data: overallMetrics, error: overallError } = await supabase
        .rpc('get_overall_system_metrics')

      if (overallError) throw overallError

      // Get users by role
      const { data: usersByRole, error: roleError } = await supabase
        .rpc('get_users_by_role')

      if (roleError) throw roleError

      // Get growth trends
      const { data: trends, error: trendsError } = await supabase
        .rpc('get_growth_trends')

      if (trendsError) throw trendsError

      // Get university usage metrics
      const { data: universityMetrics, error: uniError } = await supabase
        .rpc('get_university_usage_metrics')

      if (uniError) throw uniError

      return {
        overview: overallMetrics?.[0] || {},
        usersByRole: (usersByRole || []).reduce((acc: any, item: any) => {
          acc[item.role] = item.user_count
          return acc
        }, {}),
        trends: (trends || []).reduce((acc: any, item: any) => {
          acc[item.metric_name] = {
            current: item.current_value,
            previous: item.previous_value,
            growth: item.growth_percentage,
            direction: item.trend_direction
          }
          return acc
        }, {}),
        universityMetrics: universityMetrics || []
      }
    } catch (error) {
      console.error('Error fetching system analytics:', error)
      throw error
    }
  }

  static async getMonthlyBillingReport(year?: number, month?: number) {
    try {
      const { data, error } = await supabase.rpc('get_monthly_billing_report', {
        p_year: year || null,
        p_month: month || null
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching billing report:', error)
      throw error
    }
  }

  static async getUniversityUsageMetrics(startDate?: string, endDate?: string) {
    try {
      const { data, error } = await supabase.rpc('get_university_usage_metrics', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching university usage metrics:', error)
      throw error
    }
  }

  // ==========================================
  // QUESTION TEMPLATE MANAGEMENT METHODS
  // ==========================================

  static async getQuestionTemplates(): Promise<QuestionTemplate[]> {
    try {
      // Query the normalized database structure without the creator join
      // This gets only default system templates
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
          created_at,
          template_questions(
            order_index,
            is_required,
            questions(
              id,
              text,
              type,
              category,
              scale,
              options,
              required
            )
          )
        `)
        .is('university_id', null) // Only get templates with NULL university_id (system-wide templates)
        .eq('is_default', true) // Only get default templates
        .order('created_at', { ascending: false })

      if (error) throw error

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

      // Transform the data to match the expected QuestionTemplate interface
      const templates: QuestionTemplate[] = (data || []).map((template: any) => {
        const creator = template.created_by ? creatorsMap.get(template.created_by) : null

        return {
          id: template.id,
          name: template.name,
          description: template.description || '',
          is_active: template.is_active,
          is_default: template.is_default,
          university_id: template.university_id,
          created_by: template.created_by,
          creator_name: creator?.name,
          creator_role: creator?.role,
          questions: (template.template_questions || [])
            .sort((a: any, b: any) => a.order_index - b.order_index)
            .map((tq: any) => ({
              id: tq.questions.id,
              text: tq.questions.text,
              type: tq.questions.type,
              scale: tq.questions.scale,
              required: tq.is_required !== null ? tq.is_required : tq.questions.required,
              category: tq.questions.category,
              options: tq.questions.options
            }))
        }
      })

      return templates
    } catch (error) {
      console.error('Error fetching question templates:', error)
      return []
    }
  }

  static async createQuestionTemplate(
    templateData: CreateQuestionTemplateData
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
          university_id: null // For super admin templates
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
            university_id: null // For super admin questions
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

  static async updateQuestionTemplate(
    templateId: string,
    templateData: CreateQuestionTemplateData
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
              university_id: null
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

  static async deleteQuestionTemplate(templateId: string): Promise<void> {
    try {
      // Check if template exists and is not a default template
      const { data: template, error: checkError } = await supabase
        .from('question_templates')
        .select('id, is_default')
        .eq('id', templateId)
        .single()

      if (checkError) throw checkError

      if (template.is_default) {
        throw new Error('Cannot delete default templates')
      }

      // Delete the template (CASCADE will handle template_questions deletion)
      const { error } = await supabase
        .from('question_templates')
        .delete()
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting question template:', error)
      throw error
    }
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

  static async toggleQuestionTemplateStatus(templateId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_templates')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error toggling question template status:', error)
      throw error
    }
  }

  static async getQuestionTemplate(templateId: string): Promise<QuestionTemplate | null> {
    try {
      const { data, error } = await supabase
        .from('question_templates')
        .select(`
          id,
          name,
          description,
          template_questions(
            order_index,
            is_required,
            questions(
              id,
              text,
              type,
              category,
              scale,
              options,
              required
            )
          )
        `)
        .eq('id', templateId)
        .eq('is_active', true)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match the expected QuestionTemplate interface
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        questions: (data.template_questions || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((tq: any) => ({
            id: tq.questions.id,
            text: tq.questions.text,
            type: tq.questions.type,
            scale: tq.questions.scale,
            required: tq.is_required !== null ? tq.is_required : tq.questions.required,
            category: tq.questions.category,
            options: tq.questions.options
          }))
      }
    } catch (error) {
      console.error('Error fetching question template:', error)
      return null
    }
  }
}