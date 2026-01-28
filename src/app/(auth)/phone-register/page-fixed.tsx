'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { phoneSchema, nameSchema, usernameSchema, emailSchema, passwordSchema, dateOfBirthSchema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'

// Schema matching backend PhoneRegisterRequest exactly
const phoneRegisterSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema, // REQUIRED in backend
  phone: phoneSchema,
  password: passwordSchema,
  password_confirmation: z.string(),
  date_of_birth: dateOfBirthSchema,
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation']
})

export default function PhoneRegisterPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '', // Required field
    password: '',
    password_confirmation: '',
    date_of_birth: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login } = useAuth()

  const validateStep1 = () => {
    try {
      phoneSchema.parse(phone)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ phone: error.errors.map(e => e.message) })
      }
      return false
    }
  }

  const validateStep2 = () => {
    try {
      codeSchema.parse(verificationCode)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ verification_code: error.errors.map(e => e.message) })
      }
      return false
    }
  }

  const validateStep3 = () => {
    try {
      phoneRegisterSchema.parse({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: phone,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        date_of_birth: formData.date_of_birth,
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
    mutationFn: async (phone: string) => {
      const response = await api.post('/auth/phone/send-code', { phone })
      return response.data
    },
    onSuccess: () => setStep(2),
  })

  // Step 2: Just verify the code (don't register yet)
  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { phone: string; verification_code: string }) => {
      const response = await api.post('/auth/phone/verify', data)
      return response.data
    },
    onSuccess: () => setStep(3),
  })

  // Step 3: Complete registration with all data
  const registerMutation = useMutation({
    mutationFn: async (data: {
      name: string
      username: string
      email: string
      phone: string
      password: string
      password_confirmation: string
      date_of_birth: string
    }) => {
      const response = await api.post('/auth/phone/register', data)
      return response.data
    },
    onSuccess: async (data) => {
      await login(data.token)
    },
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    sendCodeMutation.mutate(phone)
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep2()) return
    verifyCodeMutation.mutate({ phone, verification_code: verificationCode })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    registerMutation.mutate({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      phone: phone,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      date_of_birth: formData.date_of_birth,
    })
  }

  if (step === 1) {
    return (
      <AuthCard title="Sign up with phone" subtitle="Step 1 of 3: Enter your phone number">
        <form onSubmit={handleStep1} className="space-y-6">
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
        
        <AuthDivider text="Or sign up with" />
        
        <div className="grid grid-cols-2 gap-3">
          <SocialButton provider="google" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google`} />
          <SocialButton provider="apple" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/apple`} />
        </div>
        
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
              onClick={() => sendCodeMutation.mutate(phone)}
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
          label="Full Name"
          type="text"
          placeholder="Enter your full name"
          fieldType="text"
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
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          fieldType="email"
          value={formData.email}
          onChange={(value) => setFormData({ ...formData, email: value })}
          error={errors.email}
        />
        
        <AuthInput
          label="Date of Birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
          error={errors.date_of_birth}
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