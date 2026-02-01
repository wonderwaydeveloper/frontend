'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { phoneRegisterSchema, registerStep1Schema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import toast from 'react-hot-toast'

export default function PhoneRegisterPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login } = useAuth()

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

  const validateStep2 = () => {
    if (verificationCode.length !== 6) {
      setErrors({ verification_code: ['Verification code must be 6 digits'] })
      return false
    }
    setErrors({})
    return true
  }

  const validateStep3 = () => {
    try {
      phoneRegisterSchema.parse({
        phone,
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        date_of_birth: formData.date_of_birth,
        verification_code: verificationCode
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

  const sendCodeMutation = useMutation({
    mutationFn: async (data: { name: string; date_of_birth: string; phone: string }) => {
      return await AuthAPI.phoneRegisterStep1(data)
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setStep(2)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Failed to send code')
      }
    },
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      return await AuthAPI.phoneRegisterStep2(data.session_id, data.code)
    },
    onSuccess: () => setStep(3),
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Invalid verification code')
      }
    },
  })

  const registerMutation = useMutation({
    mutationFn: async (data: {
      session_id: string
      username: string
      password: string
      password_confirmation: string
      email?: string
    }) => {
      return await AuthAPI.phoneRegisterStep3(data)
    },
    onSuccess: async (data) => {
      await login(data.token)
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Registration failed')
      }
    },
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    sendCodeMutation.mutate({ 
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      phone 
    })
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) {
      toast.error('Session expired. Please start over.')
      return
    }
    if (!validateStep2()) return
    verifyCodeMutation.mutate({ session_id: sessionId, code: verificationCode })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) {
      toast.error('Session expired. Please start over.')
      return
    }
    if (!validateStep3()) return
    registerMutation.mutate({
      session_id: sessionId,
      username: formData.username,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      email: formData.email || undefined
    })
  }

  const handleResendCode = () => {
    sendCodeMutation.mutate({ 
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      phone 
    })
  }

  if (step === 1) {
    return (
      <AuthCard title="Sign up with phone" subtitle="Step 1 of 3: Enter your details">
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
            placeholder="+1234567890"
            fieldType="phone"
            value={phone}
            onChange={(value) => setPhone(value)}
            error={errors.phone}
          />
          
          <AuthButton type="submit" loading={sendCodeMutation.isPending}>
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
            value={verificationCode}
            onChange={(value) => setVerificationCode(value)}
            error={errors.verification_code}
          />
          
          <AuthButton type="submit" loading={verifyCodeMutation.isPending}>
            Verify Code
          </AuthButton>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={sendCodeMutation.isPending}
              className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              {sendCodeMutation.isPending ? 'Sending...' : 'Resend code'}
            </button>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Complete your profile" subtitle="Step 3 of 3: Fill in your details">
      <form onSubmit={handleStep3} className="space-y-6">
        <AuthInput
          label="Name"
          type="text"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(value) => setFormData({ ...formData, name: value })}
          error={errors.name}
        />
        
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
          placeholder="Enter your email"
          fieldType="email"
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
        
        <AuthButton type="submit" loading={registerMutation.isPending}>
          Create Account
        </AuthButton>
      </form>
    </AuthCard>
  )
}