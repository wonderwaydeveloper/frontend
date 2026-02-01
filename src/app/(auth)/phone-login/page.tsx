'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { phoneSchema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import toast from 'react-hot-toast'

export default function PhoneLoginPage() {
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('phone-login-step') || '1')
    }
    return 1
  })
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phone-login-session') || ''
    }
    return ''
  })
  const [phone, setPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('phone-login-phone') || ''
    }
    return ''
  })
  const [code, setCode] = useState('')
  const [resendTimer, setResendTimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTimer = localStorage.getItem('phone-login-timer')
      if (savedTimer) {
        const remainingTime = parseInt(savedTimer) - Math.floor(Date.now() / 1000)
        if (remainingTime > 0) {
          return remainingTime
        } else {
          localStorage.removeItem('phone-login-timer')
        }
      }
    }
    return 0
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login } = useAuth()

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
    if (value.length === 6 && !loginMutation.isPending) {
      loginMutation.mutate({ session_id: sessionId, code: value })
    }
  }

  const validateStep1 = () => {
    try {
      phoneSchema.parse(phone)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
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

  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      return await AuthAPI.phoneLoginSendCode(phone)
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setStep(2)
      localStorage.setItem('phone-login-step', '2')
      localStorage.setItem('phone-login-session', data.session_id)
      localStorage.setItem('phone-login-phone', phone)
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      const timerValue = Math.max(0, remainingTime)
      setResendTimer(timerValue)
      if (timerValue > 0) {
        localStorage.setItem('phone-login-timer', data.resend_available_at.toString())
      }
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Failed to send code')
      }
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      return await AuthAPI.phoneLoginVerifyCode(data.session_id, data.code)
    },
    onSuccess: async (data) => {
      localStorage.removeItem('phone-login-step')
      localStorage.removeItem('phone-login-session')
      localStorage.removeItem('phone-login-phone')
      localStorage.removeItem('phone-login-timer')
      await login(data.token)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Login failed')
      }
    },
  })

  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.phoneLoginResendCode(sessionId)
    },
    onSuccess: (data) => {
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      const timerValue = Math.max(0, remainingTime)
      setResendTimer(timerValue)
      if (timerValue > 0) {
        localStorage.setItem('phone-login-timer', data.resend_available_at.toString())
      } else {
        localStorage.removeItem('phone-login-timer')
      }
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        if (error.retry_after) {
          const remainingTime = error.retry_after - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
          if (remainingTime > 0) {
            localStorage.setItem('phone-login-timer', error.retry_after.toString())
          }
        } else if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          const timerValue = Math.max(0, remainingTime)
          setResendTimer(timerValue)
          if (timerValue > 0) {
            localStorage.setItem('phone-login-timer', error.resend_available_at.toString())
          }
        } else if (error.remaining_seconds) {
          const timerValue = error.remaining_seconds
          setResendTimer(timerValue)
          const futureTimestamp = Math.floor(Date.now() / 1000) + timerValue
          localStorage.setItem('phone-login-timer', futureTimestamp.toString())
        }
      }
    },
  })

  if (step === 1) {
    return (
      <AuthCard title="Sign in with phone" subtitle="Enter your phone number to receive a verification code">
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep1()) return; sendCodeMutation.mutate(phone) }} className="space-y-6">
          <AuthInput
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            fieldType="phone"
            value={phone}
            onChange={(value) => setPhone(value)}
            error={errors.phone}
          />
          
          <AuthButton type="submit" loading={sendCodeMutation.isPending}>
            Send Code
          </AuthButton>
          
          <div className="text-center space-y-3">
            <Link href="/login" className="text-green-600 hover:text-green-500 block">
              Sign in with email instead
            </Link>
            <Link href="/phone-register" className="text-green-600 hover:text-green-500 block">
              Don't have an account? Sign up with phone
            </Link>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Enter verification code" subtitle={`Enter the 6-digit code sent to ${phone}`}>
      <form onSubmit={(e) => { e.preventDefault(); if (!validateStep2()) return; loginMutation.mutate({ session_id: sessionId, code }) }} className="space-y-6">
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
        
        <AuthButton type="submit" loading={loginMutation.isPending}>
          Sign In
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
                localStorage.removeItem('phone-login-step')
                localStorage.removeItem('phone-login-session')
                localStorage.removeItem('phone-login-phone')
                localStorage.removeItem('phone-login-timer')
              }}
              className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
            >
              Use different phone number
            </button>
          </div>
        </div>
      </form>
    </AuthCard>
  )
}