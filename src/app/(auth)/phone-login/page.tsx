'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { phoneSchema, codeSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'

export default function PhoneLoginPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
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

  const sendCodeMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await api.post('/auth/phone/send-code', { phone })
      return response.data
    },
    onSuccess: () => setStep(2),
  })

  const loginMutation = useMutation({
    mutationFn: async (data: { phone: string; verification_code: string }) => {
      const response = await api.post('/auth/phone/login', data)
      return response.data
    },
    onSuccess: (data) => {
      login(data.token)
      router.push('/timeline')
    },
  })

  if (step === 1) {
    return (
      <AuthCard title="Sign in with phone" subtitle="Enter your phone number to receive a verification code">
        <form onSubmit={(e) => { e.preventDefault(); if (!validateStep1()) return; sendCodeMutation.mutate(phone) }} className="space-y-6">
          <AuthInput
            label="Phone Number"
            type="tel"
            placeholder="+1234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />
          
          <AuthButton type="submit" loading={sendCodeMutation.isPending}>
            Send Code
          </AuthButton>
          
          <div className="text-center space-y-3">
            <Link href="/login" className="text-green-600 hover:text-green-500 block">
              Sign in with email instead
            </Link>
            <Link href="/phone-register" className="text-green-600 hover:text-green-500 block">
              Don't have an account? Sign up with phone
            </Link>
          </div>
        </form>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Enter verification code" subtitle={`Enter the 6-digit code sent to ${phone}`}>
      <form onSubmit={(e) => { e.preventDefault(); if (!validateStep2()) return; loginMutation.mutate({ phone, verification_code: code }) }} className="space-y-6">
        <AuthInput
          label="Verification Code"
          type="text"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={errors.code}
        />
        
        <AuthButton type="submit" loading={loginMutation.isPending}>
          Sign In
        </AuthButton>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="text-green-600 hover:text-green-500"
          >
            Use different phone number
          </button>
        </div>
      </form>
    </AuthCard>
  )
}