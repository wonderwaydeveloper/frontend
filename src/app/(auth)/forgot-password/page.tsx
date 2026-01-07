'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { emailSchema, passwordSchema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()

  const validateStep1 = () => {
    try {
      emailSchema.parse(email)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors.map(e => e.message) })
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
        setErrors({ code: error.errors.map(e => e.message) })
      }
      return false
    }
  }

  const validateStep3 = () => {
    try {
      passwordSchema.parse(password)
      if (password !== passwordConfirmation) {
        setErrors({ passwordConfirmation: ['Passwords do not match'] })
        return false
      }
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = handleZodError(error)
        if (password !== passwordConfirmation) {
          zodErrors.passwordConfirmation = ['Passwords do not match']
        }
        setErrors(zodErrors)
      }
      return false
    }
  }

  const forgotMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/password/forgot', { email })
      return response.data
    },
    onSuccess: () => setStep(2),
  })

  const verifyCodeMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await api.post('/auth/password/verify-code', data)
      return response.data
    },
    onSuccess: () => setStep(3),
  })

  const resetMutation = useMutation({
    mutationFn: async (data: { email: string; code: string; password: string; password_confirmation: string }) => {
      const response = await api.post('/auth/password/reset', data)
      return response.data
    },
    onSuccess: () => router.push('/login'),
  })

  if (step === 1) {
    return (
      <AuthCard title="Reset your password" subtitle="Enter your email address and we'll send you a reset code">
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep1()) return; forgotMutation.mutate(email) }} className="space-y-6">
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          
          <AuthButton type="submit" loading={forgotMutation.isPending}>
            Send Reset Code
          </AuthButton>
          
          <div className="text-center">
            <Link href="/login" className="text-green-600 hover:text-green-500">
              Back to login
            </Link>
          </div>
        </form>
      </AuthCard>
    )
  }

  if (step === 2) {
    return (
      <AuthCard title="Enter reset code" subtitle={`Enter the 6-digit code sent to ${email}`}>
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep2()) return; verifyCodeMutation.mutate({ email, code }) }} className="space-y-6">
          <AuthInput
            label="Reset Code"
            type="text"
            maxLength={6}
            placeholder="000000"
            className="text-center text-2xl tracking-widest"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            error={errors.code}
          />
          
          <AuthButton type="submit" loading={verifyCodeMutation.isPending}>
            Verify Code
          </AuthButton>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Set new password" subtitle="Enter your new password">
      <form onSubmit={(e) => { e.preventDefault(); if (!validateStep3()) return; resetMutation.mutate({ email, code, password, password_confirmation: passwordConfirmation }) }} className="space-y-6">
        <AuthInput
          label="New Password"
          type="password"
          placeholder="Enter new password"
          fieldType="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        
        <AuthInput
          label="Confirm Password"
          type="password"
          placeholder="Confirm new password"
          fieldType="password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          error={errors.passwordConfirmation}
        />
        
        <AuthButton type="submit" loading={resetMutation.isPending}>
          Reset Password
        </AuthButton>
      </form>
    </AuthCard>
  )
}