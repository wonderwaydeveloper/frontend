'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { codeSchema } from '@/lib/validation'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ApiError } from '@/types/auth'
import { AuthAPI } from '@/lib/auth-api'

export default function EmailVerifyPage() {
  const [code, setCode] = useState('')
  const [resendTimer, setResendTimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTimer = localStorage.getItem('email-verify-timer')
      if (savedTimer) {
        const remainingTime = parseInt(savedTimer) - Math.floor(Date.now() / 1000)
        if (remainingTime > 0) {
          return remainingTime
        } else {
          localStorage.removeItem('email-verify-timer')
        }
      }
    }
    return 0
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const { user, updateUser } = useAuth()
  const router = useRouter()

  if (!user?.email) {
    router.push('/login')
    return null
  }

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Auto-submit when code is complete
  const handleCodeChange = (value: string) => {
    setCode(value)
    if (value.length === 6 && !verifyMutation.isPending) {
      verifyMutation.mutate(value)
    }
  }

  const validateCode = () => {
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

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      return await AuthAPI.verifyEmail(user?.email!, code)
    },
    onSuccess: () => {
      toast.success('Email verified successfully')
      updateUser({ ...user, email_verified_at: new Date().toISOString() })
      localStorage.removeItem('email-verify-timer')
      router.push('/timeline')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Verification failed')
      }
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.resendEmailVerification(user?.email!)
    },
    onSuccess: (data) => {
      toast.success('New verification code sent')
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      const timerValue = Math.max(0, remainingTime)
      setResendTimer(timerValue)
      if (timerValue > 0) {
        localStorage.setItem('email-verify-timer', data.resend_available_at.toString())
      } else {
        localStorage.removeItem('email-verify-timer')
      }
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        if (error.retry_after) {
          const remainingTime = error.retry_after - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
          if (remainingTime > 0) {
            localStorage.setItem('email-verify-timer', error.retry_after.toString())
          }
        } else if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          const timerValue = Math.max(0, remainingTime)
          setResendTimer(timerValue)
          if (timerValue > 0) {
            localStorage.setItem('email-verify-timer', error.resend_available_at.toString())
          }
        } else if (error.remaining_seconds) {
          const timerValue = error.remaining_seconds
          setResendTimer(timerValue)
          const futureTimestamp = Math.floor(Date.now() / 1000) + timerValue
          localStorage.setItem('email-verify-timer', futureTimestamp.toString())
        }
      } else {
        toast.error(error.message || 'Failed to resend code')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCode()) return
    verifyMutation.mutate(code)
  }

  return (
    <AuthCard title="Verify your email" subtitle={`Enter the 6-digit code sent to ${user?.email || 'your email'}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Verification Code"
          type="text"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest"
          fieldType="code"
          value={code}
          onChange={handleCodeChange}
          error={errors.code}
        />
        
        <AuthButton type="submit" loading={verifyMutation.isPending}>
          Verify Email
        </AuthButton>
        
        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-sm text-gray-500">
              Resend code in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 hover:underline"
            >
              {resendMutation.isPending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>
      </form>
    </AuthCard>
  )
}