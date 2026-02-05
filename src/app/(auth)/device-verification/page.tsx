'use client'

import { useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { useAuth } from '@/contexts/auth-context'
import { getLocalStorageItem } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DeviceVerificationPage() {
  const [code, setCode] = useState('')
  const [resendTimer, setResendTimer] = useState(() => {
    if (typeof window !== 'undefined') {
      const resendTime = getLocalStorageItem('device_resend_time', '0')
      const currentTime = Math.floor(Date.now() / 1000)
      const remaining = Math.max(0, parseInt(resendTime) - currentTime)
      return remaining
    }
    return 0
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin } = useAuth()

  const fingerprint = searchParams.get('fingerprint') || getLocalStorageItem('device_fingerprint', '')
  const userId = searchParams.get('user_id')

  // Check for session validity on mount
  useEffect(() => {
    if (!fingerprint || !userId) {
      toast.error('Session expired. Please login again.')
      router.push('/login')
    }
  }, [fingerprint, userId, router])

  // Timer countdown effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Remove auto-submit functionality
  const handleCodeChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    setCode(numericValue)
  }
  const verifyMutation = useMutation({
    mutationFn: (code: string) => {
      setIsSubmitting(true)
      return AuthAPI.verifyDevice(code, fingerprint)
    },
    onSuccess: async (data) => {
      setIsSubmitting(false)
      toast.success('Device verified successfully!')
      localStorage.removeItem('device_resend_time')
      await authLogin(data.token)
      router.push('/timeline')
    },
    onError: (error: any) => {
      setIsSubmitting(false)
      
      if (error.status === 422 && error.errors) {
        // Handle validation errors
        const codeError = error.errors.code?.[0]
        if (codeError) {
          toast.error(codeError)
        } else {
          toast.error(error.message || 'Verification failed')
        }
      } else if (error.status === 429) {
        // Handle rate limiting
        const rateLimitError = error.errors?.code?.[0] || error.message || 'Too many attempts. Please wait.'
        toast.error(rateLimitError)
        
        // Set timer if provided
        if (error.remaining_seconds) {
          const futureTimestamp = Math.floor(Date.now() / 1000) + error.remaining_seconds
          localStorage.setItem('device_resend_time', futureTimestamp.toString())
          setResendTimer(error.remaining_seconds)
        }
      } else {
        toast.error(error.message || 'Verification failed')
      }
    }
  })

  const resendMutation = useMutation({
    mutationFn: () => AuthAPI.resendDeviceCode(fingerprint, userId || undefined),
    onSuccess: (data) => {
      toast.success('New verification code sent')
      const newResendTime = data.resend_available_at || Math.floor(Date.now() / 1000) + 30
      localStorage.setItem('device_resend_time', newResendTime.toString())
      setResendTimer(data.resend_cooldown || 30)
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        // Handle rate limiting with proper timer setup
        if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          const timerValue = Math.max(0, remainingTime)
          setResendTimer(timerValue)
          if (timerValue > 0) {
            localStorage.setItem('device_resend_time', error.resend_available_at.toString())
          }
        } else if (error.remaining_seconds) {
          const timerValue = error.remaining_seconds
          setResendTimer(timerValue)
          const futureTimestamp = Math.floor(Date.now() / 1000) + timerValue
          localStorage.setItem('device_resend_time', futureTimestamp.toString())
        } else {
          // Fallback to 30 seconds
          setResendTimer(30)
          const futureTimestamp = Math.floor(Date.now() / 1000) + 30
          localStorage.setItem('device_resend_time', futureTimestamp.toString())
        }
      }
      
      // Show appropriate error message
      if (error.status === 422 && error.errors) {
        const sessionError = error.errors.session?.[0]
        if (sessionError && sessionError.includes('session')) {
          // Session expired - redirect to login
          toast.error('Session expired. Please login again.')
          localStorage.removeItem('device_resend_time')
          localStorage.removeItem('device_fingerprint')
          router.push('/login')
          return
        }
        
        const errorMessage = error.errors.session?.[0] || error.errors.user_id?.[0] || error.message
        toast.error(errorMessage || 'Failed to resend code')
      } else {
        toast.error(error.message || 'Failed to resend code')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6 && !isSubmitting && !verifyMutation.isPending) {
      verifyMutation.mutate(code)
    }
  }

  const handleResend = () => {
    if (resendTimer === 0 && !resendMutation.isPending) {
      resendMutation.mutate()
    }
  }

  return (
    <AuthCard 
      title="Device Verification Required" 
      subtitle="We've sent a verification code to your email"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                New Device Detected
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                For your security, we need to verify this device before you can continue.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Verification Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            value={code}
            onChange={handleCodeChange}
            required
          />

          <AuthButton
            type="submit"
            loading={verifyMutation.isPending || isSubmitting}
            disabled={code.length !== 6 || isSubmitting}
          >
            {verifyMutation.isPending || isSubmitting ? 'Verifying...' : 'Verify Device'}
          </AuthButton>

          <div className="text-center">
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 hover:underline"
              >
                {resendMutation.isPending ? 'Sending...' : 'Resend code'}
              </button>
            )}
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </AuthCard>
  )
}