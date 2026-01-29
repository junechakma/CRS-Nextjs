export const validators = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Password validation
  isValidPassword: (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  },

  // Phone number validation
  isValidPhone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // University code validation
  isValidUniversityCode: (code: string): boolean => {
    // 2-10 characters, alphanumeric, no spaces
    const codeRegex = /^[A-Z0-9]{2,10}$/
    return codeRegex.test(code.toUpperCase())
  },

  // Name validation
  isValidName: (name: string): boolean => {
    // At least 2 characters, letters and spaces only
    const nameRegex = /^[a-zA-Z\s]{2,50}$/
    return nameRegex.test(name.trim())
  },

  // Required field validation
  isRequired: (value: any): boolean => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value != null && value !== undefined
  },

  // Length validation
  hasMinLength: (value: string, min: number): boolean => {
    return value.trim().length >= min
  },

  hasMaxLength: (value: string, max: number): boolean => {
    return value.trim().length <= max
  },

  isWithinRange: (value: string, min: number, max: number): boolean => {
    const length = value.trim().length
    return length >= min && length <= max
  },

  // Number validation
  isValidNumber: (value: string): boolean => {
    return !isNaN(Number(value)) && isFinite(Number(value))
  },

  isPositiveNumber: (value: string | number): boolean => {
    const num = typeof value === 'string' ? Number(value) : value
    return !isNaN(num) && num > 0
  },

  isWithinNumericRange: (value: string | number, min: number, max: number): boolean => {
    const num = typeof value === 'string' ? Number(value) : value
    return !isNaN(num) && num >= min && num <= max
  },

  // Date validation
  isValidDate: (date: string): boolean => {
    const dateObj = new Date(date)
    return !isNaN(dateObj.getTime())
  },

  isFutureDate: (date: string): boolean => {
    const dateObj = new Date(date)
    const now = new Date()
    return dateObj > now
  },

  isPastDate: (date: string): boolean => {
    const dateObj = new Date(date)
    const now = new Date()
    return dateObj < now
  },

  // Form validation helper
  validateForm: (data: Record<string, any>, rules: Record<string, any[]>): {
    valid: boolean
    errors: Record<string, string[]>
  } => {
    const errors: Record<string, string[]> = {}
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = data[field]
      const fieldErrors: string[] = []
      
      fieldRules.forEach(rule => {
        if (typeof rule === 'function') {
          const result = rule(value)
          if (typeof result === 'string') {
            fieldErrors.push(result)
          } else if (typeof result === 'object' && !result.valid) {
            fieldErrors.push(...result.errors)
          }
        }
      })
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors
      }
    })
    
    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}