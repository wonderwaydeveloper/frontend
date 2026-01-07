'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import api from '@/lib/api'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { loginSchema, phoneLoginStep1Schema, phoneLoginStep2Schema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import type { LoginCredentials } from '@/types'

export default function LoginPage() {
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email')
  const [step, setStep] = useState(1) // For phone login steps
  const [credentials, setCredentials] = useState<LoginCredentials>({
    login: '',
    password: '',
  })
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [requires2FA, setRequires2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  
  const router = useRouter()
  const { login } = useAuth()

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
        setErrors({ twoFactorCode: error.errors.map(e => e.message) })
      }
      return false
    }
  }

  const emailLoginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      const response = await api.post('/auth/login', data)
      return response.data
    },
    onSuccess: async (data) => {
      if (data.requires_2fa) {
        setRequires2FA(true)
      } else {
        await login()
      }
    },
  })

  const phoneSendCodeMutation = useMutation({
    mutationFn: async (data: { phone: string }) => {
      console.log('Sending phone code:', data) // Debug log
      const response = await api.post('/auth/phone/send-code', data)
      return response.data
    },
    onSuccess: (data) => {
      console.log('Phone code sent successfully:', data) // Debug log
      setStep(2)
    },
    onError: (error) => {
      console.error('Phone code send error:', error) // Debug log
    }
  })

  const phoneLoginMutation = useMutation({
    mutationFn: async (data: { phone: string; verification_code: string }) => {
      const response = await api.post('/auth/phone/login', data)
      return response.data
    },
    onSuccess: async (data) => {
      await login()
    },
  })

  const verify2FAMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post('/auth/login', {
        ...credentials,
        two_factor_code: code
      })
      return response.data
    },
    onSuccess: async (data) => {
      await login()
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (requires2FA) {
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
        phoneLoginMutation.mutate({ phone, verification_code: verificationCode })
      }
    }
  }

  const resetForm = () => {
    setStep(1)
    setPhone('')
    setVerificationCode('')
    setCredentials({ login: '', password: '' })
    setRequires2FA(false)
    setTwoFactorCode('')
    setErrors({})
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
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
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
              type="password"
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
                onChange={(value) => setPhone(value)}
                error={errors.phone}
              />
            ) : (
              <>
                <div className="text-sm text-gray-600 text-center mb-4">
                  Code sent to {phone}
                </div>
                <AuthInput
                  label="Verification Code"
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="text-center text-2xl tracking-widest"
                  fieldType="code"
                  value={verificationCode}
                  onChange={(value) => setVerificationCode(value)}
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
            <button
              type="button"
              onClick={() => phoneSendCodeMutation.mutate({ phone })}
              disabled={phoneSendCodeMutation.isPending}
              className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              {phoneSendCodeMutation.isPending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        )}
      </form>

      <AuthDivider text="Or continue with" />
      
      <div className="grid grid-cols-2 gap-3">
        <SocialButton 
          provider="google" 
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google`} 
        />
        <SocialButton 
          provider="apple" 
          href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/apple`} 
        />
      </div>

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