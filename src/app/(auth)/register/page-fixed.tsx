'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import api from '@/lib/api'
import { AuthCard, AuthInput, AuthButton, AuthDivider, SocialButton } from '@/components/auth/auth-components'
import { registerStep1Schema, registerStep3Schema, handleZodError } from '@/lib/validation'
import { z } from 'zod'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState('')
  const [formData, setFormData] = useState({
    // Step 1 data (matching backend)
    name: '',
    date_of_birth: '',
    contact: '',
    contact_type: 'email' as 'email' | 'phone',
    // Step 2 data
    code: '',
    // Step 3 data
    username: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login } = useAuth()

  // Auto-submit when code is complete
  const handleCodeChange = (value: string) => {
    setFormData({ ...formData, code: value })
    if (value.length === 6) {
      setTimeout(() => {
        step2Mutation.mutate({ session_id: sessionId, code: value })
      }, 100)
    }
  }

  const validateStep1 = () => {
    try {
      // Validate all step 1 fields as per backend
      const step1Data = {
        name: formData.name,
        date_of_birth: formData.date_of_birth,
        contact: formData.contact,
        contact_type: formData.contact_type
      }
      registerStep1Schema.parse(step1Data)
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
      const step3Data = {
        username: formData.username,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      }
      registerStep3Schema.parse(step3Data)
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
    mutationFn: async (data: {
      name: string
      date_of_birth: string
      contact: string
      contact_type: string
    }) => {
      const response = await api.post('/auth/register/step1', data)
      return response.data
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setStep(2)
    },
  })

  const step2Mutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      const response = await api.post('/auth/register/step2', data)
      return response.data
    },
    onSuccess: () => setStep(3),
  })

  const step3Mutation = useMutation({
    mutationFn: async (data: {
      session_id: string
      username: string
      password: string
      password_confirmation: string
    }) => {
      const response = await api.post('/auth/register/step3', data)
      return response.data
    },
    onSuccess: async (data) => {
      await login(data.token)
    },
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    step1Mutation.mutate({
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      contact: formData.contact,
      contact_type: formData.contact_type
    })
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    step2Mutation.mutate({ session_id: sessionId, code: formData.code })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep3()) return
    step3Mutation.mutate({
      session_id: sessionId,
      username: formData.username,
      password: formData.password,
      password_confirmation: formData.password_confirmation
    })
  }

  if (step === 1) {
    return (
      <AuthCard title="Create your account" subtitle="Step 1 of 3: Basic information">
        <form onSubmit={handleStep1} className="space-y-6">
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
            label="Date of Birth"
            type="date"
            value={formData.date_of_birth}
            onChange={(value) => setFormData({ ...formData, date_of_birth: value })}
            error={errors.date_of_birth}
          />
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Contact Type</label>
            <div className="flex items-center justify-center">
              <div className="relative inline-flex bg-gray-200 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, contact_type: 'email' })}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    formData.contact_type === 'email'
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
                  onClick={() => setFormData({ ...formData, contact_type: 'phone' })}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    formData.contact_type === 'phone'
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
          
          <AuthInput
            label={formData.contact_type === 'email' ? 'Email Address' : 'Phone Number'}
            type={formData.contact_type === 'email' ? 'email' : 'tel'}
            placeholder={formData.contact_type === 'email' ? 'Enter your email' : 'Enter your phone number'}
            fieldType={formData.contact_type === 'email' ? 'email' : 'phone'}
            value={formData.contact}
            onChange={(value) => setFormData({ ...formData, contact: value })}
            error={errors.contact}
          />
          
          <AuthButton type="submit" loading={step1Mutation.isPending}>
            Send Verification Code
          </AuthButton>
        </form>
        
        <AuthDivider text="Or sign up with" />
        
        <div className="grid grid-cols-2 gap-3">
          <SocialButton provider="google" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google`} />
          <SocialButton provider="apple" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/apple`} />
        </div>
        
        <div className="text-center mt-4">
          <Link href="/login" className="text-sm text-green-600 hover:text-green-500 hover:underline">
            Already have an account? Sign in
          </Link>
        </div>
      </AuthCard>
    )
  }

  if (step === 2) {
    return (
      <AuthCard title={`Verify your ${formData.contact_type}`} subtitle={`Step 2 of 3: Enter the 6-digit code sent to ${formData.contact}`}>
        <form onSubmit={handleStep2} className="space-y-6">
          <AuthInput
            label="Verification Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            fieldType="code"
            value={formData.code}
            onChange={handleCodeChange}
          />
          
          <AuthButton type="submit" loading={step2Mutation.isPending}>
            Verify Code
          </AuthButton>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => step1Mutation.mutate({
                name: formData.name,
                date_of_birth: formData.date_of_birth,
                contact: formData.contact,
                contact_type: formData.contact_type
              })}
              disabled={step1Mutation.isPending}
              className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
            >
              {step1Mutation.isPending ? 'Sending...' : 'Resend code'}
            </button>
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