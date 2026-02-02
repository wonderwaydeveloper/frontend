'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/contexts/auth-context'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { ageVerificationSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import { AuthAPI } from '@/lib/auth-api'
import toast from 'react-hot-toast'

export default function AgeVerificationPage() {
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const router = useRouter()
  const { login, updateUser } = useAuth()

  useEffect(() => {
    // Check if we have a temporary token from social auth
    const tempToken = localStorage.getItem('temp_auth_token')
    if (tempToken) {
      // Set the token for API calls
      localStorage.setItem('auth_token', tempToken)
      localStorage.removeItem('temp_auth_token')
    }
  }, [])

  const validateAge = () => {
    try {
      ageVerificationSchema.parse({ date_of_birth: dateOfBirth })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const verifyAgeMutation = useMutation({
    mutationFn: async (dateOfBirth: string) => {
      return await AuthAPI.completeAgeVerification(dateOfBirth)
    },
    onSuccess: async (data) => {
      updateUser(data.user)
      toast.success('Age verification completed!')
      router.push('/timeline')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        setErrors({ general: [error.message || 'Age verification failed'] })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAge()) return
    verifyAgeMutation.mutate(dateOfBirth)
  }

  return (
    <AuthCard 
      title="Complete your profile" 
      subtitle="Please provide your date of birth to complete registration"
    >
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Age Verification Required
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                We need to verify your age to comply with platform policies.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Date of Birth"
            type="date"
            value={dateOfBirth}
            onChange={(value) => setDateOfBirth(value)}
            error={errors.date_of_birth}
          />
          
          {errors.general && (
            <div className="text-sm text-red-600">
              {errors.general.map((err, index) => (
                <div key={index}>{err}</div>
              ))}
            </div>
          )}
          
          <AuthButton type="submit" loading={verifyAgeMutation.isPending}>
            Complete Registration
          </AuthButton>
        </form>
      </div>
    </AuthCard>
  )
}