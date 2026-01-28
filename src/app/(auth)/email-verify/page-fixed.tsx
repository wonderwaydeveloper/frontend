'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { emailVerifySchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'

export default function EmailVerifyPage() {
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const { user } = useAuth()

  const validateCode = () => {
    if (!user?.email) return false
    try {
      emailVerifySchema.parse({ email: user.email, code })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const verifyMutation = useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const response = await api.post('/auth/email/verify', data)
      return response.data
    },
    onSuccess: () => {
      window.location.reload()
    },
  })

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/email/resend', { email })
      return response.data
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCode() || !user?.email) return
    verifyMutation.mutate({ email: user.email, code })
  }

  return (
    <AuthCard title="Verify your email" subtitle={`Enter the 6-digit code sent to ${user?.email}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <AuthInput
          label="Verification Code"
          type="text"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest"
          fieldType="code"
          value={code}
          onChange={(value) => setCode(value)}
          error={errors.code}
        />
        
        <AuthButton type="submit" loading={verifyMutation.isPending}>
          Verify Email
        </AuthButton>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => user?.email && resendMutation.mutate(user.email)}
            disabled={resendMutation.isPending || !user?.email}
            className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
          >
            {resendMutation.isPending ? 'Sending...' : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthCard>
  )
}