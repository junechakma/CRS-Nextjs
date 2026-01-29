import { supabase } from '../../../lib/supabase'
import type { User } from '../../../types/auth'

export class AuthCallbackService {
  static async handleEmailConfirmation(): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Get the current session after email confirmation
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) throw sessionError
      if (!session?.user) {
        return { success: false, error: 'No authenticated user found' }
      }

      // Check if user profile already exists
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (existingProfile) {
        // Profile already exists, just return current user
        const user = await this.getCurrentUser()
        if (!user) {
          return { success: false, error: 'Failed to retrieve user profile' }
        }
        return { success: true, user }
      }

      // Get user metadata from auth
      const authUser = session.user
      const metadata = authUser.user_metadata || {}

      let universityId = null

      // Step 1: If super admin, create university first
      if (metadata.role === 'super_admin' && metadata.university_name) {
        // Generate a unique university code
        const baseCode = (metadata.university_code || 'UNI').toUpperCase()
        let uniqueCode = baseCode
        let counter = 1

        // Check if code exists and generate unique one
        while (true) {
          const {  error: checkError } = await supabase
            .from('universities')
            .select('id')
            .eq('code', uniqueCode)
            .single()

          if (checkError && checkError.code === 'PGRST116') {
            // No row found, code is unique
            break
          } else if (checkError) {
            console.error('Code check error:', checkError)
            throw new Error(`Failed to check university code: ${checkError.message}`)
          } else {
            // Code exists, try next one
            uniqueCode = baseCode + counter
            counter++
          }
        }

        const { data: universityData, error: universityError } = await supabase
          .from('universities')
          .insert({
            name: metadata.university_name,
            code: uniqueCode,
            created_by: authUser.id
          })
          .select('id')
          .single()
        
        if (universityError) {
          console.error('University creation error:', universityError)
          throw new Error(`Failed to create university: ${universityError.message}`)
        }
        
        universityId = universityData.id
      }

      // Step 2: Create user profile
      const userProfile = {
        id: authUser.id,
        email: authUser.email!,
        role: metadata.role || 'student',
        name: metadata.name || '',
        status: metadata.role === 'super_admin' ? 'active' : 'pending',
        approval_status: metadata.role === 'super_admin' ? 'approved' : 'pending',
        university_id: universityId,
        faculty_id: null,
        department_id: null
      }

      const { error: profileError } = await supabase
        .from('users')
        .insert(userProfile)
        
      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }

      // Get the complete user profile
      const user = await this.getCurrentUser()
      if (!user) {
        return { success: false, error: 'Failed to retrieve user profile' }
      }
      return { success: true, user }

    } catch (error) {
      console.error('Email confirmation error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to complete email confirmation' 
      }
    }
  }

  private static async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) return null

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error || !userProfile) return null

    return {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      role: userProfile.role,
      status: userProfile.status,
      approval_status: userProfile.approval_status,
      university_id: userProfile.university_id,
      faculty_id: userProfile.faculty_id,
      department_id: userProfile.department_id,
      initial: userProfile.initial,
      phone: userProfile.phone,
      application_date: userProfile.application_date,
      approved_by: userProfile.approved_by,
      approval_date: userProfile.approval_date,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
      last_login: userProfile.last_login,
    }
  }
}