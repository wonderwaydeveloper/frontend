'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { emailSchema, passwordSchema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import { AuthAPI } from '@/lib/auth-api'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('forgot-password-step') || '1')
    }
    return 1
  })
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('forgot-password-email') || ''
    }
    return ''
  })
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [resendTimer, setResendTimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTimer = localStorage.getItem('forgot-password-timer')
      if (savedTimer) {
        const remainingTime = parseInt(savedTimer) - Math.floor(Date.now() / 1000)
        if (remainingTime > 0) {
          return remainingTime
        } else {
          localStorage.removeItem('forgot-password-timer')
        }
      }
    }
    return 0
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Remove auto-submit functionality
  const handleCodeChange = (value: string) => {
    setCode(value)
  }

  const validateStep1 = () => {
    try {
      emailSchema.parse(email)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.issues.map(e => e.message) })
      }
      return false
    }
  }

  const validateStep2 = () => {
    try {
      codeSchema.parse(code)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ code: error.issues.map(e => e.message) })
      }
      return false
    }
  }

  const validateStep3 = () => {
    try {
      passwordSchema.parse(password)
      if (password !== passwordConfirmation) {
        setErrors({ passwordConfirmation: ['Passwords do not match'] })
        return false
      }
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = handleZodError(error)
        if (password !== passwordConfirmation) {
          zodErrors.passwordConfirmation = ['Passwords do not match']
        }
        setErrors(zodErrors)
      }
      return false
    }
  }

  const forgotMutation = useMutation({
    mutationFn: async (email: string) => {
      return await AuthAPI.forgotPassword(email)
    },
    onSuccess: (data) => {
      setStep(2)
      localStorage.setItem('forgot-password-step', '2')
      localStorage.setItem('forgot-password-email', email)
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      const timerValue = Math.max(0, remainingTime)
      setResendTimer(timerValue)
      if (timerValue > 0) {
        localStorage.setItem('forgot-password-timer', data.resend_available_at.toString())
      }
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ email: [error.message || 'Failed to send reset code'] })
      }
    },
  })

  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.resendPasswordReset(email)
    },
    onSuccess: (data) => {
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      const timerValue = Math.max(0, remainingTime)
      setResendTimer(timerValue)
      if (timerValue > 0) {
        localStorage.setItem('forgot-password-timer', data.resend_available_at.toString())
      } else {
        localStorage.removeItem('forgot-password-timer')
      }
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        if (error.retry_after) {
          const remainingTime = error.retry_after - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
          if (remainingTime > 0) {
            localStorage.setItem('forgot-password-timer', error.retry_after.toString())
          }
        } else if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          const timerValue = Math.max(0, remainingTime)
          setResendTimer(timerValue)
          if (timerValue > 0) {
            localStorage.setItem('forgot-password-timer', error.resend_available_at.toString())
          }
        } else if (error.remaining_seconds) {
          const timerValue = error.remaining_seconds
          setResendTimer(timerValue)
          const futureTimestamp = Math.floor(Date.now() / 1000) + timerValue
          localStorage.setItem('forgot-password-timer', futureTimestamp.toString())
        }
      }
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      return await AuthAPI.verifyPasswordResetCode(data.email, data.code)
    },
    onSuccess: () => {
      setStep(3)
      localStorage.setItem('forgot-password-step', '3')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ code: [error.message || 'Invalid verification code'] })
      }
    },
  })

  const resetMutation = useMutation({
    mutationFn: async (data: { email: string; code: string; password: string; password_confirmation: string }) => {
      return await AuthAPI.resetPassword(data.email, data.code, data.password, data.password_confirmation)
    },
    onSuccess: () => {
      localStorage.removeItem('forgot-password-step')
      localStorage.removeItem('forgot-password-email')
      localStorage.removeItem('forgot-password-timer')
      router.push('/login')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ password: [error.message || 'Failed to reset password'] })
      }
    },
  })

  if (step === 1) {
    return (
      <AuthCard title="Reset your password" subtitle="Enter your email address. If registered, you'll receive a reset code.">
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep1()) return; forgotMutation.mutate(email) }} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            fieldType="email"
            value={email}
            onChange={(value) => setEmail(value)}
            error={errors.email}
          />
          
          <AuthButton type="submit" loading={forgotMutation.isPending}>
            Send Reset Code
          </AuthButton>
          
          <div className="text-center">
            <Link href="/login" className="text-green-600 hover:text-green-500">
              Back to login
            </Link>
          </div>
        </form>
      </AuthCard>
    )
  }

  if (step === 2) {
    return (
      <AuthCard title="Enter reset code" subtitle={`Step 2 of 3: Check your email for the reset code`}>
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep2()) return; verifyCodeMutation.mutate({ email, code }) }} className="space-y-6">
          <AuthInput
            label="Reset Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            fieldType="code"
            value={code}
            onChange={handleCodeChange}
            error={errors.code}
          />
          
          <AuthButton type="submit" loading={verifyCodeMutation.isPending}>
            Verify Code
          </AuthButton>
          
          <div className="text-center space-y-2">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => resendCodeMutation.mutate()}
                disabled={resendCodeMutation.isPending}
                className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 hover:underline"
              >
                {resendCodeMutation.isPending ? 'Sending...' : 'Resend code'}
              </button>
            )}
            
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setCode('')
                  setResendTimer(0)
                  localStorage.removeItem('forgot-password-step')
                  localStorage.removeItem('forgot-password-email')
                  localStorage.removeItem('forgot-password-timer')
                }}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Change email
              </button>
            </div>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set new password" subtitle="Step 3 of 3: Enter your new password">
      <form onSubmit={(e) => { e.preventDefault(); if (!validateStep3()) return; resetMutation.mutate({ email, code, password, password_confirmation: passwordConfirmation }) }} className="space-y-6">
        <AuthInput
          label="New Password"
          placeholder="Enter new password"
          fieldType="password"
          showStrength={true}
          value={password}
          onChange={(value) => setPassword(value)}
          error={errors.password}
        />
        
        <AuthInput
          label="Confirm Password"
          placeholder="Confirm new password"
          fieldType="password"
          value={passwordConfirmation}
          onChange={(value) => setPasswordConfirmation(value)}
          error={errors.passwordConfirmation}
        />
        
        <AuthButton type="submit" loading={resetMutation.isPending}>
          Reset Password
        </AuthButton>
      </form>
    </AuthCard>
  )
}