import { supabase } from '../../../lib/supabase'
import type { User } from '../../../types/auth'
import { hashPassword, comparePassword, validatePasswordStrength } from '../../../shared/utils/password'
import { PasswordResetService } from '../../../services/passwordResetService'

export class AuthService {
  // Validate password strength before authentication
  static validatePassword(password: string) {
    return validatePasswordStrength(password)
  }

  static async signIn(email: string, password: string) {
    try {
      // Sign in with Supabase Auth first
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      })

      if (error) {
        // Check for specific error types
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
        }
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        throw new Error(error.message || 'Invalid email or password')
      }

      if (!data.user) {
        throw new Error('Invalid email or password')
      }

      // Check if email is verified
      if (!data.user.email_confirmed_at) {
        await supabase.auth.signOut()
        throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.')
      }

      // Now that we're authenticated, get user profile (RLS allows this)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single()

      if (profileError || !userProfile) {
        // User authenticated but no profile exists - shouldn't happen with triggers
        await supabase.auth.signOut()
        throw new Error('User profile not found. Please contact support.')
      }

      // Check if user is active (allow pending university_admin to login to see pending page)
      if (userProfile.status !== 'active') {
        // Allow university_admin with pending status to login (they'll see the pending page)
        if (userProfile.role === 'university_admin' && userProfile.status === 'pending') {
          // Let them through - they'll be redirected to pending page
        } else {
          await supabase.auth.signOut()
          throw new Error('Account is inactive. Please contact an administrator.')
        }
      }

      // Check if user is approved (allow pending university_admin to login to see pending page)
      if (userProfile.approval_status !== 'approved') {
        // Allow university_admin with pending approval to login (they'll see the pending page)
        if (userProfile.role === 'university_admin' && userProfile.approval_status === 'pending') {
          // Let them through - they'll be redirected to pending page
        } else {
          await supabase.auth.signOut()
          throw new Error('Account is pending approval. You will be notified when your account is approved.')
        }
      }

      // Update last login
      await supabase
        .from('users')
        .update({
          last_login: new Date().toISOString(),
          login_count: (userProfile.login_count || 0) + 1
        })
        .eq('auth_user_id', data.user.id)

      // Get updated user profile
      const { data: updatedProfile } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single()

      return {
        user: updatedProfile || userProfile,
        session: data.session
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  static async signUp(email: string, password: string, userData: Partial<User> & { university_name?: string, university_code?: string }) {
    // Validate password strength
    const passwordValidation = this.validatePassword(password)
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message)
    }

    try {
      // Create user in Supabase Auth with metadata
      // Supabase Auth will check if email already exists
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password,
        options: {
          data: {
            name: userData.name?.trim() || '',
            role: userData.role || 'student',
            university_id: userData.university_id,
            faculty_id: userData.faculty_id,
            department_id: userData.department_id,
            phone: userData.phone,
            initial: userData.initial,
          }
        }
      })

      if (error) {
        // Handle specific error messages
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          throw new Error('Email already registered')
        }
        throw new Error(error.message || 'Registration failed')
      }

      if (!data.user) {
        throw new Error('Registration failed')
      }

      // The trigger will automatically create the user profile in public.users
      // Wait a bit for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Sign out immediately after registration (they need to login)
      await supabase.auth.signOut()

      return {
        user: { id: data.user.id, email: data.user.email, role: userData.role } as User,
        needsApproval: userData.role !== 'super_admin',
        message: userData.role === 'super_admin'
          ? 'Super Admin account created successfully! You can now login.'
          : 'Account created successfully! Your application is pending approval.'
      }
    } catch (error: any) {
      console.error('SignUp error:', error)
      throw error
    }
  }

  static async signOut() {
    try {
      // Sign out from Supabase Auth
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase signOut error:', error)
        throw error
      }

      // Clear any legacy local storage
      localStorage.removeItem('crs_auth_user')
      localStorage.removeItem('crs_auth_session')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // Get current session from Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        return null
      }

      // Get user profile from public.users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()

      if (profileError || !userProfile) {
        console.error('Failed to get user profile:', profileError)
        return null
      }

      // Verify user is still active (allow pending university_admin to stay logged in)
      if (userProfile.status !== 'active' || userProfile.approval_status !== 'approved') {
        // Allow university_admin with pending status to stay logged in
        if (userProfile.role === 'university_admin' &&
            userProfile.status === 'pending' &&
            userProfile.approval_status === 'pending') {
          // Let them stay logged in - they'll see the pending page
        } else {
          await this.signOut()
          return null
        }
      }

      return {
        id: userProfile.id,
        auth_user_id: userProfile.auth_user_id,
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
    } catch (error) {
      console.error('Get current user error:', error)
      return null
    }
  }

  static async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async resetPassword(email: string) {
    return await PasswordResetService.requestPasswordReset({
      email
    })
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    try {
      // Validate new password strength
      const passwordValidation = this.validatePassword(newPassword)
      if (!passwordValidation.isValid) {
        return {
          success: false,
          message: passwordValidation.message
        }
      }

      // Get current user to verify current password
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single()

      if (userError || !user) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      // Verify current password
      const passwordMatch = await comparePassword(currentPassword, user.password_hash)
      if (!passwordMatch) {
        return {
          success: false,
          message: 'Current password is incorrect'
        }
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword)

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({
          password_hash: hashedPassword,
          password_change_required: false,
          password_changed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        return {
          success: false,
          message: 'Failed to update password'
        }
      }

      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: error.message || 'An error occurred while changing password'
      }
    }
  }

  // Utility methods for password operations (for custom implementations)
  static async hashPasswordClient(password: string): Promise<string> {
    return await hashPassword(password)
  }

  static async comparePasswordClient(password: string, hashedPassword: string): Promise<boolean> {
    return await comparePassword(password, hashedPassword)
  }

  // Method to create super admin with bcrypt hash (matches SQL migration)
  static async createSuperAdminWithHash(email: string, password: string, name: string) {
    // Hash password using bcrypt (similar to SQL: crypt('password', gen_salt('bf')))
    const hashedPassword = await hashPassword(password, 12)
    
    // This would be used if you implement custom user creation instead of Supabase Auth
    return {
      email,
      password_hash: hashedPassword,
      name,
      role: 'super_admin',
      approval_status: 'approved',
      status: 'active'
    }
  }
}