import { z } from 'zod'
import { WEAK_PASSWORDS } from './constants'
import { emailSchema, passwordSchema, usernameSchema } from './validation'

// Input sanitization functions matching backend
export const sanitizeInput = {
  login: (value: string): string => {
    return value.toLowerCase().trim()
  },
  
  phone: (value: string): string => {
    return value.replace(/[^\d+\-\s()]/g, '')
  },
  
  code: (value: string): string => {
    return value.replace(/\D/g, '')
  },
  
  username: (value: string): string => {
    return value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '')
  }
}

// Real-time validation functions
export const validateField = {
  email: (value: string): string[] => {
    try {
      emailSchema.parse(value)
      return []
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        return error.errors.map(e => e.message)
      }
      return ['Invalid email']
    }
  },
  
  password: (value: string): string[] => {
    try {
      passwordSchema.parse(value)
      return []
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        return error.errors.map(e => e.message)
      }
      return ['Invalid password']
    }
  },
  
  username: (value: string): string[] => {
    try {
      usernameSchema.parse(value)
      return []
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        return error.errors.map(e => e.message)
      }
      return ['Invalid username']
    }
  }
}

// Password strength calculator (social media optimized)
export const calculatePasswordStrength = (password: string): {
  score: number
  feedback: string[]
} => {
  let score = 0
  const feedback: string[] = []
  
  // Length bonus (more important for social media)
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 20
  if (password.length >= 16) score += 10
  
  // Character variety (optional but recommended)
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^A-Za-z0-9]/.test(password)) score += 15
  
  // Patterns penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 15
    feedback.push('Avoid repeated characters')
  }
  
  if (/123|abc|qwe/i.test(password)) {
    score -= 15
    feedback.push('Avoid sequential patterns')
  }
  
  // Common password penalty (major for social media)
  if (WEAK_PASSWORDS.includes(password.toLowerCase() as any)) {
    score -= 40
    feedback.push('This password is too common')
  }
  
  // Provide helpful feedback
  if (password.length < 12) {
    feedback.push('Consider using a longer password')
  }
  
  const hasVariety = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(regex => regex.test(password)).length
  if (hasVariety < 3) {
    feedback.push('Mix letters, numbers, and symbols for better security')
  }
  
  return {
    score: Math.max(0, Math.min(100, score)),
    feedback
  }
}