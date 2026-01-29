'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthInput, AuthButton } from '@/components/auth/auth-components'
import { passwordSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export function PasswordChange() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; password: string; password_confirmation: string }) => {
      const response = await api.post('/auth/password/change', data)
      return response.data
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({})
    },
    onError: (error: any) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    }
  })

  const validateForm = () => {
    try {
      passwordSchema.parse(newPassword)
      if (newPassword !== confirmPassword) {
        setErrors({ password_confirmation: ['Passwords do not match'] })
        return false
      }
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors = handleZodError(error)
        if (newPassword !== confirmPassword) {
          zodErrors.password_confirmation = ['Passwords do not match']
        }
        setErrors(zodErrors)
      }
      return false
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    
    changePasswordMutation.mutate({
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword
    })
  }

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Current Password"
          type="password"
          placeholder="Enter current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          error={errors.current_password}
          required
        />
        
        <AuthInput
          label="New Password"
          type="password"
          placeholder="Enter new password"
          fieldType="password"
          showStrength={true}
          value={newPassword}
          onChange={setNewPassword}
          error={errors.password}
          required
        />
        
        <AuthInput
          label="Confirm New Password"
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.password_confirmation}
          required
        />
        
        <AuthButton 
          type="submit" 
          loading={changePasswordMutation.isPending}
          disabled={!currentPassword || !newPassword || !confirmPassword}
        >
          Change Password
        </AuthButton>
      </form>
    </div>
  )
}