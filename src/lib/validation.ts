import { z } from 'zod'
import { ERROR_MESSAGES, VALIDATION_PATTERNS, WEAK_PASSWORDS } from './constants'

// Base schemas matching backend validation
export const emailSchema = z.string()
  .min(1, ERROR_MESSAGES.EMAIL_REQUIRED)
  .email(ERROR_MESSAGES.EMAIL_INVALID)
  .max(255, ERROR_MESSAGES.EMAIL_MAX_LENGTH)

export const phoneSchema = z.string()
  .min(1, ERROR_MESSAGES.PHONE_REQUIRED)
  .regex(/^09[0-9]{9}$/, ERROR_MESSAGES.PHONE_INVALID)

// Strong password with relaxed rules
export const passwordSchema = z.string()
  .min(8, 'The password must be at least 8 characters.')
  .max(128, 'Password must not exceed 128 characters')
  .refine((password) => {
    // At least one letter (uppercase OR lowercase)
    return /[a-zA-Z]/.test(password)
  }, 'The password must contain at least one letter.')
  .refine((password) => {
    // At least one number
    return /[0-9]/.test(password)
  }, 'The password must contain at least one number.')
  .refine((password) => {
    return !WEAK_PASSWORDS.includes(password.toLowerCase() as any)
  }, 'The password is too weak.')

// Username matching backend regex
export const usernameSchema = z.string()
  .min(4, 'Username must be at least 4 characters')
  .max(15, 'Username must not exceed 15 characters')
  .regex(VALIDATION_PATTERNS.USERNAME, ERROR_MESSAGES.USERNAME_FORMAT)

// 2FA code matching backend validation
export const codeSchema = z.string()
  .length(6, ERROR_MESSAGES.TWO_FACTOR_REQUIRED)
  .regex(VALIDATION_PATTERNS.CODE_NUMERIC, ERROR_MESSAGES.TWO_FACTOR_INVALID)

// Name validation matching backend controller (max 50)
export const nameSchema = z.string()
  .min(1, ERROR_MESSAGES.NAME_REQUIRED)
  .max(50, 'Name must be less than 50 characters')

// Age validation matching backend date validation
export const dateOfBirthSchema = z.string()
  .min(1, ERROR_MESSAGES.DATE_REQUIRED)
  .refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    return birthDate < today
  }, ERROR_MESSAGES.DATE_FUTURE)
  .refine((date) => {
    const birthDate = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 15
    }
    return age >= 15
  }, ERROR_MESSAGES.AGE_MINIMUM)

// Login schemas matching backend LoginRequest
export const loginSchema = z.object({
  login: z.string().min(1, ERROR_MESSAGES.LOGIN_REQUIRED),
  password: z.string().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
  two_factor_code: codeSchema.optional()
})

// Multi-step registration schemas
export const registerStep1Schema = z.object({
  name: nameSchema,
  date_of_birth: dateOfBirthSchema,
  contact: z.string().min(1, 'Contact is required'),
  contact_type: z.enum(['email', 'phone'])
}).refine((data) => {
  if (data.contact_type === 'email') {
    return emailSchema.safeParse(data.contact).success
  } else {
    return phoneSchema.safeParse(data.contact).success
  }
}, {
  message: 'Please enter a valid email or phone number',
  path: ['contact']
})

export const registerStep2Schema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  code: codeSchema
})

// Step 3 matching backend - only username and password needed
export const registerStep3Schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// Phone authentication schemas matching backend
export const phoneVerificationSchema = z.object({
  phone: phoneSchema,
  country_code: z.string().max(5, 'Country code too long').optional()
})

export const phoneLoginStep1Schema = z.object({
  phone: phoneSchema
})

export const phoneLoginStep2Schema = z.object({
  phone: phoneSchema,
  verification_code: codeSchema
})

// Phone registration schema
export const phoneRegisterSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema.optional(),
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'Password confirmation is required'),
  date_of_birth: dateOfBirthSchema,
  verification_code: codeSchema
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// Password reset schemas
export const forgotPasswordStep1Schema = z.object({
  email: emailSchema
})

export const forgotPasswordStep2Schema = z.object({
  email: emailSchema,
  code: codeSchema
})

export const forgotPasswordStep3Schema = z.object({
  email: emailSchema,
  code: codeSchema,
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// Email verification schema
export const emailVerifySchema = z.object({
  email: emailSchema,
  code: codeSchema
})

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: passwordSchema,
  password_confirmation: z.string().min(1, 'Password confirmation is required')
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// 2FA schemas
export const enable2FASchema = z.object({
  password: z.string().min(1, 'Password is required')
})

export const verify2FASchema = z.object({
  code: codeSchema
})

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required')
})

// Age verification schema for social auth
export const ageVerificationSchema = z.object({
  date_of_birth: dateOfBirthSchema
})

// Utility function to handle Zod errors
export const handleZodError = (error: z.ZodError): Record<string, string[]> => {
  const errors: Record<string, string[]> = {}
  if (error.errors) {
    error.errors.forEach((err) => {
      const path = err.path.join('.') || 'general'
      if (!errors[path]) errors[path] = []
      errors[path].push(err.message)
    })
  }
  return errors
}

// Input sanitization utilities
export const sanitizeInput = {
  login: (value: string) => value.trim().toLowerCase(),
  phone: (value: string) => value.replace(/[^0-9]/g, ''),
  code: (value: string) => value.replace(/[^0-9]/g, '').slice(0, 6),
  username: (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
}

// Field validation utilities
export const validateField = {
  email: (value: string) => {
    const result = emailSchema.safeParse(value)
    return result.success ? [] : result.error.issues.map(e => e.message)
  },
  password: (value: string) => {
    const result = passwordSchema.safeParse(value)
    return result.success ? [] : result.error.issues.map(e => e.message)
  },
  username: (value: string) => {
    const result = usernameSchema.safeParse(value)
    return result.success ? [] : result.error.issues.map(e => e.message)
  }
}

// Password strength calculator
export const calculatePasswordStrength = (password: string) => {
  let score = 0
  const feedback: string[] = []
  
  if (password.length >= 8) score += 20
  else feedback.push('Use at least 8 characters')
  
  if (/[a-z]/.test(password)) score += 20
  else feedback.push('Add lowercase letters')
  
  if (/[A-Z]/.test(password)) score += 20
  else feedback.push('Add uppercase letters')
  
  if (/[0-9]/.test(password)) score += 20
  else feedback.push('Add numbers')
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 20
  else feedback.push('Add special characters')
  
  return { score, feedback }
}