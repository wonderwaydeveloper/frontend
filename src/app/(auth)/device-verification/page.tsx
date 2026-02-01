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
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: authLogin } = useAuth()

  const fingerprint = searchParams.get('fingerprint') || getLocalStorageItem('device_fingerprint', '')

  useEffect(() => {
    const resendTime = getLocalStorageItem('device_resend_time', '0')
    const currentTime = Math.floor(Date.now() / 1000)
    const remaining = Math.max(0, parseInt(resendTime) - currentTime)
    setTimeLeft(remaining)

    if (remaining > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [])

  const verifyMutation = useMutation({
    mutationFn: (code: string) => AuthAPI.verifyDevice(code, fingerprint),
    onSuccess: async (data) => {
      toast.success('Device verified successfully!')
      await authLogin(data.token)
      router.push('/timeline')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        // Handle field-specific errors if needed
        toast.error(error.errors.code?.[0] || error.message || 'Verification failed')
      } else {
        toast.error(error.message || 'Verification failed')
      }
    }
  })

  const resendMutation = useMutation({
    mutationFn: () => AuthAPI.resendDeviceCode(fingerprint),
    onSuccess: (data) => {
      toast.success('New verification code sent')
      const newResendTime = data.resend_available_at || Math.floor(Date.now() / 1000) + 60
      localStorage.setItem('device_resend_time', newResendTime.toString())
      setTimeLeft(60)
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend code')
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === 6) {
      verifyMutation.mutate(code)
    }
  }

  const handleResend = () => {
    if (timeLeft === 0) {
      resendMutation.mutate()
    }
  }

  useEffect(() => {
    if (code.length === 6 && !verifyMutation.isPending) {
      verifyMutation.mutate(code)
    }
  }, [code])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AuthCard 
        title="Device Verification Required" 
        subtitle="We've sent a verification code to your email"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">New Device Detected</h3>
                <p className="mt-1 text-sm text-blue-700">
                  For your security, we need to verify this device before you can continue.
                </p>
              </div>
            </div>
          </div>

          <AuthInput
            label="Verification Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            value={code}
            onChange={(value) => setCode(value.replace(/\D/g, ''))}
            required
          />

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {code.length}/6 digits
            </span>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 0 || resendMutation.isPending}
              className={`font-medium ${
                timeLeft > 0 || resendMutation.isPending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {resendMutation.isPending
                ? 'Sending...'
                : timeLeft > 0
                ? `Resend in ${timeLeft}s`
                : 'Resend Code'
              }
            </button>
          </div>

          <AuthButton
            type="submit"
            loading={verifyMutation.isPending}
            disabled={code.length !== 6}
            className="w-full"
          >
            {verifyMutation.isPending ? 'Verifying...' : 'Verify Device'}
          </AuthButton>

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
      </AuthCard>
    </div>
  )
}