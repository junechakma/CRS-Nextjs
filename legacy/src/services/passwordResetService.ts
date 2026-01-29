import { supabase } from '../lib/supabase'

export interface PasswordResetRequest {
  email: string
  ipAddress?: string
  userAgent?: string
}

export interface PasswordResetResponse {
  success: boolean
  message: string
  userName?: string
  userRole?: string
}


export interface ChangePasswordRequest {
  userId: string
  currentPassword: string
  newPassword: string
  ipAddress?: string
  userAgent?: string
}


export class PasswordResetService {
  /**
   * Request a password reset for a user by email
   * Uses Supabase Auth's built-in password reset flow
   * No authentication required - anyone can request a password reset
   */
  static async requestPasswordReset({
    email
  }: PasswordResetRequest): Promise<PasswordResetResponse> {
    try {
      const emailLower = email.toLowerCase().trim()

      // Use Supabase's built-in password reset directly
      // No need to check if user exists - Supabase handles this internally
      // This is a public API that doesn't require authentication
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin
      console.log('Password reset - Redirect URL:', `${redirectUrl}/update-password`)

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(emailLower, {
        redirectTo: `${redirectUrl}/update-password`
      })

      if (resetError) {
        console.error('Supabase Auth reset error:', resetError)
        console.error('Error details:', JSON.stringify(resetError, null, 2))
        
        // Don't reveal specific errors to the user for security
        // But log them for debugging
        return {
          success: true,
          message: 'If an account exists with this email, you will receive password reset instructions.'
        }
      }

      console.log('Password reset email sent successfully for:', emailLower)

      return {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      }
    } catch (error: any) {
      console.error('Password reset request error:', error)
      // Still return success to not reveal if email exists
      return {
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions.'
      }
    }
  }


  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean
    errors: string[]
    strength: 'weak' | 'medium' | 'strong'
  } {
    const errors: string[] = []
    let score = 0

    // Length check
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    } else {
      score += 1
    }

    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    } else {
      score += 1
    }

    // Lowercase check
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    } else {
      score += 1
    }

    // Number check
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    } else {
      score += 1
    }

    // Special character check
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character')
    } else {
      score += 1
    }

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak'
    if (score >= 4) strength = 'strong'
    else if (score >= 3) strength = 'medium'

    return {
      isValid: errors.length === 0 && password.length >= 8,
      errors,
      strength
    }
  }

  /**
   * Change password for authenticated user using Supabase Auth
   */
  static async changePassword({
    userId,
    currentPassword,
    newPassword,
    ipAddress,
    userAgent
  }: ChangePasswordRequest): Promise<PasswordResetResponse> {
    try {
      if (!userId || !currentPassword || !newPassword) {
        return {
          success: false,
          message: 'User ID, current password, and new password are required'
        }
      }

      // Validate password strength
      const validation = this.validatePasswordStrength(newPassword)
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', ')
        }
      }

      // Get user profile to find their email
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('email, name, auth_user_id')
        .eq('id', userId)
        .single()

      if (profileError || !userProfile) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      if (!userProfile.auth_user_id) {
        return {
          success: false,
          message: 'This account needs to be migrated. Please use password reset to upgrade your account.'
        }
      }

      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userProfile.email,
        password: currentPassword
      })

      if (signInError) {
        return {
          success: false,
          message: 'Current password is incorrect'
        }
      }

      // Current password is correct, now update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        console.error('Password update error:', updateError)
        return {
          success: false,
          message: updateError.message || 'Failed to update password'
        }
      }

      // Log the password change activity
      try {
        await supabase.from('activity_logs').insert({
          user_id: userId,
          action_type: 'password_change',
          resource_type: 'user',
          resource_id: userId,
          details: {
            ip_address: ipAddress,
            user_agent: userAgent,
            changed_at: new Date().toISOString()
          },
          ip_address: ipAddress,
          user_agent: userAgent
        })
      } catch (logError) {
        console.error('Failed to log password change:', logError)
        // Don't fail if logging fails
      }

      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error: any) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: error.message || 'An error occurred while changing your password'
      }
    }
  }
}