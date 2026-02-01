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

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [sessionId, setSessionId] = useState('')
  const [contact, setContact] = useState('')
  const [contactType, setContactType] = useState<'email' | 'phone'>('email')
  const [code, setCode] = useState('')
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState({
    // Step 1 fields (matching backend)
    name: '',
    date_of_birth: '',
    // Step 3 fields
    username: '',
    password: '',
    password_confirmation: '',
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

  // Persist session data in localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('registration_data')
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData)
          if (parsed.step && parsed.step > 1) {
            setStep(parsed.step)
            setSessionId(parsed.sessionId || '')
            setContact(parsed.contact || '')
            setContactType(parsed.contactType || 'email')
            setFormData(prev => ({ ...prev, ...parsed.formData }))
            
            // If we're on step 2, start a shorter timer
            if (parsed.step === 2) {
              setResendTimer(30)
            }
          }
        } catch (error) {
          console.error('Error parsing saved registration data:', error)
          localStorage.removeItem('registration_data')
        }
      }
    }
  }, [])

  // Save session data to localStorage
  const saveSessionData = (data: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('registration_data', JSON.stringify(data))
    }
  }

  // Clear session data
  const clearSessionData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('registration_data')
    }
  }

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
        contact, 
        contact_type: contactType 
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
    mutationFn: async (data: { 
      name: string;
      date_of_birth: string;
      contact: string; 
      contact_type: string 
    }) => {
      return await AuthAPI.registerStep1(data.name, data.date_of_birth, data.contact, data.contact_type as 'email' | 'phone')
    },
    onSuccess: (data) => {
      setSessionId(data.session_id)
      setStep(2)
      
      // Calculate remaining time from backend
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      setResendTimer(Math.max(0, remainingTime))
      
      saveSessionData({
        step: 2,
        sessionId: data.session_id,
        contact,
        contactType,
        formData
      })
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ contact: [error.message || 'Registration failed'] })
      }
    },
  })

  const step2Mutation = useMutation({
    mutationFn: async (data: { session_id: string; code: string }) => {
      return await AuthAPI.registerStep2(data.session_id, data.code)
    },
    onSuccess: () => {
      setStep(3)
      saveSessionData({
        step: 3,
        sessionId,
        contact,
        contactType,
        formData
      })
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
    mutationFn: async (data: {
      session_id: string
      username: string
      password: string
      password_confirmation: string
    }) => {
      return await AuthAPI.registerStep3(data.session_id, data.username, data.password, data.password_confirmation)
    },
    onSuccess: async (data) => {
      clearSessionData()
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
      setSessionId(data.session_id)
      const remainingTime = data.resend_available_at - Math.floor(Date.now() / 1000)
      setResendTimer(Math.max(0, remainingTime))
      setCode('')
    },
    onError: (error: any) => {
      if (error.status === 429) {
        if (error.retry_after) {
          const remainingTime = error.retry_after - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
        } else if (error.resend_available_at) {
          const remainingTime = error.resend_available_at - Math.floor(Date.now() / 1000)
          setResendTimer(Math.max(0, remainingTime))
        } else if (error.remaining_seconds) {
          setResendTimer(error.remaining_seconds)
        }
      }
    },
  })

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep1()) return
    step1Mutation.mutate({ 
      name: formData.name,
      date_of_birth: formData.date_of_birth,
      contact, 
      contact_type: contactType 
    })
  }

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault()
    step2Mutation.mutate({ session_id: sessionId, code })
  }

  const handleStep3 = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sessionId) {
      setErrors({ session: ['Session expired. Please start over.'] })
      return
    }
    if (!validateStep3()) return
    step3Mutation.mutate({
      session_id: sessionId,
      username: formData.username,
      password: formData.password,
      password_confirmation: formData.password_confirmation
    })
  }

  const handleResendCode = () => {
    if (resendTimer === 0) {
      resendCodeMutation.mutate()
    }
  }

  if (step === 1) {
    return (
      <AuthCard title="Create your account" subtitle="Step 1 of 3: Basic information">
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
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Contact Type</label>
            <div className="flex items-center justify-center">
              <div className="relative inline-flex bg-gray-200 rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setContactType('email')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    contactType === 'email'
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
                  onClick={() => setContactType('phone')}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    contactType === 'phone'
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
            label={contactType === 'email' ? 'Email Address' : 'Phone Number'}
            type={contactType === 'email' ? 'email' : 'tel'}
            placeholder={contactType === 'email' ? 'Enter your email' : 'Enter your phone number'}
            fieldType={contactType === 'email' ? 'email' : 'phone'}
            value={contact}
            onChange={(value) => setContact(value)}
            error={errors.contact}
          />
          
          <AuthButton type="submit" loading={step1Mutation.isPending}>
            Send Verification Code
          </AuthButton>
        </form>
        
        <AuthDivider text="Or" />
        
        <SocialButton provider="google" href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/auth/social/google`} />
        
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
      <AuthCard title={`Verify your ${contactType}`} subtitle={`Step 2 of 3: Enter the 6-digit code sent to ${contact}`}>
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
                onClick={() => {
                  setStep(1)
                  setCode('')
                  saveSessionData({
                    step: 1,
                    sessionId: '',
                    contact,
                    contactType,
                    formData
                  })
                }}
                className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
              >
                Change {contactType}
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