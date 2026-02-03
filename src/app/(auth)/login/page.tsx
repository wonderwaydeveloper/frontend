'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { loginSchema, phoneLoginStep1Schema, phoneLoginStep2Schema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import toast from 'react-hot-toast'
import type { LoginCredentials } from '@/types/auth'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'email' | 'phone'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('loginType') as 'email' | 'phone') || 'email'
    }
    return 'email'
  })
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('loginStep') || '1')
    }
    return 1
  })
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: '',
    password: '',
  })
  const [phone, setPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('loginPhone') || ''
    }
    return ''
  })
  const [sessionId, setSessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('loginSessionId') || ''
    }
    return ''
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [codeExpiresAt, setCodeExpiresAt] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('loginCodeExpiresAt')
      return stored ? parseInt(stored) : null
    }
    return null
  })
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('loginResendAvailableAt')
      return stored ? parseInt(stored) : null
    }
    return null
  })
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [resendTimeLeft, setResendTimeLeft] = useState<number>(0)
  const [rateLimitEndTime, setRateLimitEndTime] = useState<number | null>(null)
  const [rateLimitTimeLeft, setRateLimitTimeLeft] = useState<number>(0)
  const [requires2FA, setRequires2FA] = useState(false)
  const [requiresDeviceVerification, setRequiresDeviceVerification] = useState(false)
  const [deviceFingerprint, setDeviceFingerprint] = useState('')
  const [deviceVerificationCode, setDeviceVerificationCode] = useState('')
  const [deviceResendAvailableAt, setDeviceResendAvailableAt] = useState<number | null>(null)
  const [deviceResendTimeLeft, setDeviceResendTimeLeft] = useState<number>(0)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  
  const router = useRouter()
  const { login } = useAuth()

  // Countdown timers
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      
      if (codeExpiresAt) {
        const remaining = codeExpiresAt - now
        setTimeLeft(Math.max(0, remaining))
      }
      
      if (resendAvailableAt) {
        const remaining = resendAvailableAt - now
        setResendTimeLeft(Math.max(0, remaining))
      }
      
      if (rateLimitEndTime) {
        const remaining = rateLimitEndTime - now
        setRateLimitTimeLeft(Math.max(0, remaining))
      }
      
      if (deviceResendAvailableAt) {
        const remaining = deviceResendAvailableAt - now
        setDeviceResendTimeLeft(Math.max(0, remaining))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [codeExpiresAt, resendAvailableAt, rateLimitEndTime, deviceResendAvailableAt])

  // Auto-submit when code is complete
  useEffect(() => {
    if (loginType === 'phone' && step === 2 && verificationCode.length === 6) {
      if (validatePhoneStep2()) {
        phoneLoginMutation.mutate({ session_id: sessionId, code: verificationCode })
      }
    }
  }, [verificationCode, loginType, step, sessionId])

  const validateEmailLogin = () => {
    try {
      loginSchema.parse(credentials)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const validatePhoneStep1 = () => {
    try {
      phoneLoginStep1Schema.parse({ phone })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const validatePhoneStep2 = () => {
    try {
      phoneLoginStep2Schema.parse({ phone, verification_code: verificationCode })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const validate2FA = () => {
    try {
      codeSchema.parse(twoFactorCode)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ twoFactorCode: error.issues.map(e => e.message) })
      }
      return false
    }
  }

  const validateDeviceVerification = () => {
    try {
      codeSchema.parse(deviceVerificationCode)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ deviceVerificationCode: error.issues.map(e => e.message) })
      }
      return false
    }
  }

  const emailLoginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      return await AuthAPI.login(data)
    },
    onSuccess: async (data) => {
      if (data.requires_2fa) {
        setRequires2FA(true)
      } else if (data.requires_device_verification) {
        localStorage.setItem('device_fingerprint', data.fingerprint)
        localStorage.setItem('device_resend_time', data.resend_available_at?.toString() || '0')
        router.push(`/device-verification?fingerprint=${data.fingerprint}`)
        return
      } else {
        await login(data.token)
      }
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Login failed')
      }
    },
  })

  const phoneSendCodeMutation = useMutation({
    mutationFn: async (data: { phone: string }) => {
      return await AuthAPI.phoneLoginSendCode(data.phone)
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setCodeExpiresAt(data.code_expires_at)
      setResendAvailableAt(data.resend_available_at)
      setStep(2)
      
      // Save to localStorage
      localStorage.setItem('loginSessionId', data.session_id)
      localStorage.setItem('loginCodeExpiresAt', data.code_expires_at.toString())
      localStorage.setItem('loginResendAvailableAt', data.resend_available_at.toString())
      localStorage.setItem('loginStep', '2')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Failed to send code')
      }
    },
  })

  const phoneLoginMutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      return await AuthAPI.phoneLoginVerifyCode(data.session_id, data.code)
    },
    onSuccess: async (data) => {
      if (data.requires_2fa) {
        setRequires2FA(true)
      } else if (data.requires_device_verification) {
        localStorage.setItem('device_fingerprint', data.fingerprint)
        localStorage.setItem('device_resend_time', data.resend_available_at?.toString() || '0')
        router.push(`/device-verification?fingerprint=${data.fingerprint}`)
        return
      } else {
        // Clear login data on successful login
        localStorage.removeItem('loginStep')
        localStorage.removeItem('loginPhone')
        localStorage.removeItem('loginSessionId')
        localStorage.removeItem('loginCodeExpiresAt')
        localStorage.removeItem('loginResendAvailableAt')
        localStorage.removeItem('loginType')
        await login(data.token)
      }
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Login failed')
      }
    },
  })

  const phoneResendCodeMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.phoneLoginResendCode(sessionId)
    },
    onSuccess: (data) => {
      setCodeExpiresAt(data.code_expires_at)
      setResendAvailableAt(data.resend_available_at)
      
      // Update localStorage
      localStorage.setItem('loginCodeExpiresAt', data.code_expires_at.toString())
      localStorage.setItem('loginResendAvailableAt', data.resend_available_at.toString())
    },
    onError: (error: any) => {
      if (error.status === 429 && error.retry_after) {
        setRateLimitEndTime(error.retry_after)
      }
    },
  })

  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      return await AuthAPI.login({
        ...credentials,
        two_factor_code: code
      })
    },
    onSuccess: async (data) => {
      if (data.requires_device_verification) {
        setRequires2FA(false)
        setRequiresDeviceVerification(true)
        setDeviceFingerprint(data.fingerprint)
      } else {
        await login(data.token)
      }
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || '2FA verification failed')
      }
    },
  })

  const verifyDeviceMutation = useMutation({
    mutationFn: async (code: string) => {
      return await AuthAPI.verifyDevice(code, deviceFingerprint)
    },
    onSuccess: async (data) => {
      await login(data.token)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Device verification failed')
      }
    },
  })

  const resendDeviceCodeMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.resendDeviceCode(deviceFingerprint)
    },
    onSuccess: (data) => {
      if (data.resend_available_at) {
        setDeviceResendAvailableAt(data.resend_available_at)
      }
      toast.success('New verification code sent')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Failed to send code')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (requiresDeviceVerification) {
      if (!validateDeviceVerification()) return
      verifyDeviceMutation.mutate(deviceVerificationCode)
    } else if (requires2FA) {
      if (!validate2FA()) return
      verify2FAMutation.mutate(twoFactorCode)
    } else if (loginType === 'email') {
      if (!validateEmailLogin()) return
      emailLoginMutation.mutate(credentials)
    } else if (loginType === 'phone') {
      if (step === 1) {
        if (!validatePhoneStep1()) return
        phoneSendCodeMutation.mutate({ phone })
      } else {
        if (!validatePhoneStep2()) return
        phoneLoginMutation.mutate({ session_id: sessionId, code: verificationCode })
      }
    }
  }

  const resetForm = () => {
    setStep(1)
    setPhone('')
    setSessionId('')
    setVerificationCode('')
    setCodeExpiresAt(null)
    setResendAvailableAt(null)
    setTimeLeft(0)
    setResendTimeLeft(0)
    setRateLimitEndTime(null)
    setRateLimitTimeLeft(0)
    setCredentials({ login: '', password: '' })
    setRequires2FA(false)
    setRequiresDeviceVerification(false)
    setDeviceFingerprint('')
    setDeviceVerificationCode('')
    setDeviceResendAvailableAt(null)
    setDeviceResendTimeLeft(0)
    setTwoFactorCode('')
    setErrors({})
    
    // Clear localStorage
    localStorage.removeItem('loginStep')
    localStorage.removeItem('loginPhone')
    localStorage.removeItem('loginSessionId')
    localStorage.removeItem('loginCodeExpiresAt')
    localStorage.removeItem('loginResendAvailableAt')
  }

  if (requiresDeviceVerification) {
    return (
      <AuthCard 
        title="Device Verification" 
        subtitle="We've sent a verification code to your email for this new device"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Verification Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            fieldType="code"
            value={deviceVerificationCode}
            onChange={(value) => setDeviceVerificationCode(value.replace(/\D/g, ''))}
            error={errors.deviceVerificationCode}
          />
          
          <AuthButton type="submit" loading={verifyDeviceMutation.isPending}>
            Verify Device
          </AuthButton>
          
          <div className="text-center space-y-2">
            <button
              type="button"
              onClick={() => resendDeviceCodeMutation.mutate()}
              disabled={resendDeviceCodeMutation.isPending || deviceResendTimeLeft > 0}
              className="text-green-600 hover:text-green-500 text-sm disabled:opacity-50"
            >
              {resendDeviceCodeMutation.isPending 
                ? 'Sending...' 
                : deviceResendTimeLeft > 0 
                  ? `Resend in ${deviceResendTimeLeft}s`
                  : 'Resend code'
              }
            </button>
            
            <div>
              <button
                type="button"
                onClick={resetForm}
                className="text-green-600 hover:text-green-500 text-sm"
              >
                Back to login
              </button>
            </div>
          </div>
        </form>
      </AuthCard>
    )
  }

  if (requires2FA) {
    return (
      <AuthCard 
        title="Two-Factor Authentication" 
        subtitle="Enter the 6-digit code from your authenticator app"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Authentication Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            fieldType="code"
            value={twoFactorCode}
            onChange={(value) => setTwoFactorCode(value.replace(/\D/g, ''))}
            error={errors.twoFactorCode}
          />
          
          <AuthButton type="submit" loading={verify2FAMutation.isPending}>
            Verify
          </AuthButton>
          
          <div className="text-center">
            <button
              type="button"
              onClick={resetForm}
              className="text-green-600 hover:text-green-500 text-sm"
            >
              Back to login
            </button>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Sign in to your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Login Method</label>
          <div className="flex items-center justify-center">
            <div className="relative inline-flex bg-gray-200 rounded-full p-1">
              <button
                type="button"
                onClick={() => {
                  setLoginType('email')
                  localStorage.setItem('loginType', 'email')
                  resetForm()
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  loginType === 'email'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginType('phone')
                  localStorage.setItem('loginType', 'phone')
                  resetForm()
                }}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  loginType === 'phone'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Phone
              </button>
            </div>
          </div>
        </div>
        
        {loginType === 'email' ? (
          <>
            <AuthInput
              label="Email or Username"
              type="text"
              placeholder="Enter your email or username"
              fieldType="login"
              value={credentials.login}
              onChange={(value) => setCredentials({ ...credentials, login: value })}
              error={errors.login}
            />
            
            <AuthInput
              label="Password"
              placeholder="Enter your password"
              fieldType="password"
              value={credentials.password}
              onChange={(value) => setCredentials({ ...credentials, password: value })}
              error={errors.password}
            />
          </>
        ) : (
          <>
            {step === 1 ? (
              <AuthInput
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                fieldType="phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value)
                  localStorage.setItem('loginPhone', value)
                }}
                error={errors.phone}
              />
            ) : (
              <>
                <div className="text-sm text-gray-600 text-center mb-4">
                  Code sent to {phone}
                  {timeLeft > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Code expires in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
                <AuthInput
                  label="Verification Code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  fieldType="code"
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value.replace(/\D/g, ''))}
                  error={errors.verification_code}
                />
              </>
            )}
          </>
        )}

        <AuthButton type="submit" loading={emailLoginMutation.isPending || phoneSendCodeMutation.isPending || phoneLoginMutation.isPending}>
          {loginType === 'email' 
            ? 'Sign in' 
            : step === 1 
              ? 'Send Code' 
              : 'Verify & Sign in'
          }
        </AuthButton>
        
        {loginType === 'phone' && step === 2 && (
          <div className="text-center">
            {rateLimitTimeLeft > 0 ? (
              <div className="text-sm text-red-500">
                Rate limited. Try again in {Math.floor(rateLimitTimeLeft / 60)}:{(rateLimitTimeLeft % 60).toString().padStart(2, '0')}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => phoneResendCodeMutation.mutate()}
                disabled={phoneResendCodeMutation.isPending || resendTimeLeft > 0}
                className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
              >
                {phoneResendCodeMutation.isPending 
                  ? 'Sending...' 
                  : resendTimeLeft > 0 
                    ? `Resend in ${resendTimeLeft}s`
                    : 'Resend code'
                }
              </button>
            )}
          </div>
        )}
      </form>

      <AuthDivider text="Or" />
      
      <SocialButton 
        provider="google" 
        href={AuthAPI.getSocialAuthUrl('google')} 
      />

      <div className="mt-6 space-y-4">
        <div className="text-center">
          <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-500 hover:underline">
            Forgot your password?
          </Link>
        </div>
        
        <div className="text-center">
          <Link href="/register" className="text-sm text-green-600 hover:text-green-500 hover:underline">
            Don't have an account? Create one
          </Link>
        </div>
      </div>
    </AuthCard>
  )
}