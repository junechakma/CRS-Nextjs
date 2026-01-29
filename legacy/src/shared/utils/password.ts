import bcrypt from 'bcryptjs'

/**
 * Password hashing utilities using bcrypt
 */

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise that resolves to hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 12): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns Promise that resolves to boolean indicating if passwords match
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
  } catch (error) {
    console.error('Error comparing passwords:', error)
    throw new Error('Failed to compare passwords')
  }
}

/**
 * Generate a random salt
 * @param saltRounds - Number of salt rounds (default: 12)
 * @returns Promise that resolves to salt string
 */
export const generateSalt = async (saltRounds: number = 12): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(saltRounds)
    return salt
  } catch (error) {
    console.error('Error generating salt:', error)
    throw new Error('Failed to generate salt')
  }
}

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export const validatePasswordStrength = (password: string): { isValid: boolean; message: string } => {
  const minLength = 8
  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters long` }
  }

  if (!hasUppercase) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' }
  }

  if (!hasLowercase) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' }
  }

  if (!hasNumbers) {
    return { isValid: false, message: 'Password must contain at least one number' }
  }

  if (!hasSpecialChars) {
    return { isValid: false, message: 'Password must contain at least one special character' }
  }

  return { isValid: true, message: 'Password is strong' }
}