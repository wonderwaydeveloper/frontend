'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { codeSchema } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'

export default function EmailVerifyPage() {
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const { user } = useAuth()

  const validateCode = () => {
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

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await api.post('/auth/email/verify', { code })
      return response.data
    },
    onSuccess: () => {
      window.location.reload()
    },
  })

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/email/resend')
      return response.data
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateCode()) return
    verifyMutation.mutate(code)
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
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={errors.code}
        />
        
        <AuthButton type="submit" loading={verifyMutation.isPending}>
          Verify Email
        </AuthButton>
        
        <div className="text-center">
          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="text-sm text-green-600 hover:text-green-500 disabled:opacity-50"
          >
            {resendMutation.isPending ? 'Sending...' : 'Resend code'}
          </button>
        </div>
      </form>
    </AuthCard>
  )
}