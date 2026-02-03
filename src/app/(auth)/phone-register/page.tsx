'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { registerStep1Schema, registerStep3Schema, handleZodError } from '@/lib/validation'
import { z } from 'zod'

export default function PhoneRegisterPage() {
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    username: '',
    password: '',
    password_confirmation: '',
    email: ''
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Auto-submit when code is complete
  const handleCodeChange = (value: string) => {
    setCode(value)
    if (value.length === 6 && !step2Mutation.isPending) {
      step2Mutation.mutate({ session_id: sessionId, code: value })
    }
  }

  const validateStep1 = () => {
    try {
      registerStep1Schema.parse({ 
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        contact: phone, 
        contact_type: 'phone' 
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const validateStep3 = () => {
    try {
      registerStep3Schema.parse({
        username: formData.username,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const step1Mutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.phoneRegisterStep1({
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        phone
      })
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setStep(2)
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      setResendTimer(Math.max(0, remainingTime))
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ phone: [error.message || 'Registration failed'] })
      }
    },
  })

  const step2Mutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      return await AuthAPI.phoneRegisterStep2(data.session_id, data.code)
    },
    onSuccess: () => {
      setStep(3)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ code: [error.message || 'Invalid verification code'] })
      }
    },
  })

  const step3Mutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.phoneRegisterStep3({
        session_id: sessionId,
        username: formData.username,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        email: formData.email || undefined
      })
    },
    onSuccess: async (data) => {
      await login(data.token)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ username: [error.message || 'Registration failed'] })
      }
    },
  })

  const resendCodeMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.resendRegistrationCode(sessionId)
    },
    onSuccess: (data) => {
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      setResendTimer(Math.max(0, remainingTime))
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
        }
      }
    },
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    step1Mutation.mutate()
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    step2Mutation.mutate({ session_id: sessionId, code })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    step3Mutation.mutate()
  }

  const handleResendCode = () => {
    if (resendTimer === 0) {
      resendCodeMutation.mutate()
    }
  }

  if (step === 1) {
    return (
      <AuthCard title="Register with Phone" subtitle="Step 1 of 3: Basic information">
        <form onSubmit={handleStep1} className="space-y-6">
          <AuthInput
            label="Name"
            type="text"
            placeholder="Enter your name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            error={errors.name}
          />

          <AuthInput
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
            error={errors.date_of_birth}
          />
          
          <AuthInput
            label="Phone Number"
            type="tel"
            placeholder="Enter your phone number"
            fieldType="phone"
            value={phone}
            onChange={(value) => setPhone(value)}
            error={errors.contact || errors.phone}
          />
          
          <AuthButton type="submit" loading={step1Mutation.isPending}>
            Send Verification Code
          </AuthButton>
        </form>
        
        <AuthDivider text="Or" />
        
        <SocialButton provider="google" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google`} />
        
        <div className="text-center mt-4">
          <Link href="/register" className="text-sm text-green-600 hover:text-green-500 hover:underline">
            Sign up with email instead
          </Link>
        </div>
        
        <div className="text-center">
          <Link href="/login" className="text-sm text-green-600 hover:text-green-500 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </AuthCard>
    )
  }

  if (step === 2) {
    return (
      <AuthCard title="Verify your phone" subtitle={`Step 2 of 3: Enter the 6-digit code sent to ${phone}`}>
        <form onSubmit={handleStep2} className="space-y-6">
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
          
          <AuthButton type="submit" loading={step2Mutation.isPending}>
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
                onClick={handleResendCode}
                disabled={resendCodeMutation.isPending}
                className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50 hover:underline"
              >
                {resendCodeMutation.isPending ? 'Sending...' : 'Resend code'}
              </button>
            )}
            
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Change phone number
              </button>
            </div>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Complete your profile" subtitle="Step 3 of 3: Choose username and password">
      <form onSubmit={handleStep3} className="space-y-6">
        <AuthInput
          label="Username"
          type="text"
          placeholder="Choose a username"
          fieldType="username"
          value={formData.username}
          onChange={(value) => setFormData({ ...formData, username: value })}
          error={errors.username}
        />
        
        <AuthInput
          label="Email (Optional)"
          type="email"
          placeholder="Enter your email (optional)"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={errors.email}
        />
        
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          fieldType="password"
          showStrength={true}
          value={formData.password}
          onChange={(value) => setFormData({ ...formData, password: value })}
          error={errors.password}
        />
        
        <AuthInput
          label="Confirm Password"
          placeholder="Confirm your password"
          fieldType="password"
          value={formData.password_confirmation}
          onChange={(value) => setFormData({ ...formData, password_confirmation: value })}
          error={errors.password_confirmation}
        />
        
        <AuthButton type="submit" loading={step3Mutation.isPending}>
          Create Account
        </AuthButton>
      </form>
    </AuthCard>
  )
}