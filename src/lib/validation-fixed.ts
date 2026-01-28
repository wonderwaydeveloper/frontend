import { z } from 'zod'
import { ERROR_MESSAGES, VALIDATION_PATTERNS, WEAK_PASSWORDS } from './constants'

// Base schemas matching backend validation
export const emailSchema = z.string()
  .min(1, ERROR_MESSAGES.EMAIL_REQUIRED)
  .email(ERROR_MESSAGES.EMAIL_INVALID)
  .max(255, ERROR_MESSAGES.EMAIL_MAX_LENGTH)

export const phoneSchema = z.string()
  .min(1, ERROR_MESSAGES.PHONE_REQUIRED)
  .regex(VALIDATION_PATTERNS.PHONE, ERROR_MESSAGES.PHONE_INVALID)
  .refine((phone) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    return cleanPhone.length >= 10 && cleanPhone.length <= 15
  }, 'Phone number must be between 10-15 digits')

// Social media standard password (Twitter-like)
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must not exceed 128 characters')
  .refine((password) => {
    return !WEAK_PASSWORDS.includes(password.toLowerCase() as any)
  }, 'This password is too common. Please choose a different one.')
  .refine((password) => {
    // For social media: encourage but don't enforce complexity
    // Only require complexity if password is short
    if (password.length >= 12) return true
    
    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    
    const complexity = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length
    return complexity >= 2
  }, 'Password should be longer or include a mix of letters, numbers, and symbols.')

// Username matching backend regex
export const usernameSchema = z.string()
  .min(1, ERROR_MESSAGES.USERNAME_REQUIRED)
  .max(255, ERROR_MESSAGES.USERNAME_MAX_LENGTH)
  .regex(VALIDATION_PATTERNS.USERNAME, ERROR_MESSAGES.USERNAME_FORMAT)

// 2FA code matching backend validation
export const codeSchema = z.string()
  .length(6, ERROR_MESSAGES.TWO_FACTOR_REQUIRED)
  .regex(VALIDATION_PATTERNS.CODE_NUMERIC, ERROR_MESSAGES.TWO_FACTOR_INVALID)

// Name validation
export const nameSchema = z.string()
  .min(1, ERROR_MESSAGES.NAME_REQUIRED)
  .max(255, ERROR_MESSAGES.NAME_MAX_LENGTH)

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
      return age - 1 >= 13
    }
    return age >= 13
  }, ERROR_MESSAGES.AGE_MINIMUM)

// Login schemas matching backend LoginRequest
export const loginSchema = z.object({
  login: z.string().min(1, ERROR_MESSAGES.LOGIN_REQUIRED),
  password: z.string().min(1, ERROR_MESSAGES.PASSWORD_REQUIRED),
  two_factor_code: codeSchema.optional()
})

// Multi-step registration schemas (FIXED to match backend exactly)
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

// Step 3 matching backend (only username and password)
export const registerStep3Schema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// Phone registration schemas matching backend PhoneRegisterRequest
export const phoneRegisterSchema = z.object({
  phone: phoneSchema,
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema.optional(),
  password: passwordSchema,
  password_confirmation: z.string(),
  date_of_birth: dateOfBirthSchema,
  verification_code: codeSchema
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
  password_confirmation: z.string()
}).refine((data) => data.password === data.password_confirmation, {
  message: ERROR_MESSAGES.PASSWORD_MISMATCH,
  path: ['password_confirmation']
})

// Email verification schema (FIXED to match backend)
export const emailVerifySchema = z.object({
  email: emailSchema,
  code: codeSchema
})

// Change password schema
export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  password: passwordSchema,
  password_confirmation: z.string()
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
      const path = err.path.join('.')
      if (!errors[path]) errors[path] = []
      errors[path].push(err.message)
    })
  }
  return errors
}