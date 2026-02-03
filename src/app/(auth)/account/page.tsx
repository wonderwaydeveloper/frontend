'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton } from '@/components/auth/auth-components'
import { changePasswordSchema, handleZodError } from '@/lib/validation'
import { z } from 'zod'
import { useAuth } from '@/contexts/auth-context'
import { Key, Shield, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    password: '',
    password_confirmation: ''
  })
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [showLogoutAll, setShowLogoutAll] = useState(false)
  const { user, logout } = useAuth()

  const validatePassword = () => {
    try {
      changePasswordSchema.parse(passwordData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(handleZodError(error))
      }
      return false
    }
  }

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      return await AuthAPI.changePassword(
        passwordData.current_password,
        passwordData.password,
        passwordData.password_confirmation
      )
    },
    onSuccess: (data) => {
      toast.success('Password changed successfully!')
      setPasswordData({
        current_password: '',
        password: '',
        password_confirmation: ''
      })
      setErrors({})
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        setErrors(error.errors)
      } else {
        toast.error(error.message || 'Failed to change password')
      }
    }
  })

  const logoutAllMutation = useMutation({
    mutationFn: () => AuthAPI.logoutAll(),
    onSuccess: () => {
      toast.success('Logged out from all devices')
      logout()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to logout from all devices')
    }
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validatePassword()) return
    changePasswordMutation.mutate()
  }

  const handleLogoutAll = () => {
    if (confirm('Are you sure you want to logout from all devices? You will need to sign in again.')) {
      logoutAllMutation.mutate()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account security and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Account Information */}
        <AuthCard title="Account Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <p className="text-gray-900">@{user?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-900">{user?.email}</p>
                  {user?.email_verified_at ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Unverified
                    </span>
                  )}
                </div>
              </div>
              {user?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900">{user.phone}</p>
                    {user?.phone_verified_at && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </AuthCard>

        {/* Change Password */}
        <AuthCard title="Change Password" icon={Key}>
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <AuthInput
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              value={passwordData.current_password}
              onChange={(value) => setPasswordData({ ...passwordData, current_password: value })}
              error={errors.current_password}
            />

            <AuthInput
              label="New Password"
              type="password"
              placeholder="Enter your new password"
              showStrength={true}
              value={passwordData.password}
              onChange={(value) => setPasswordData({ ...passwordData, password: value })}
              error={errors.password}
            />

            <AuthInput
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              value={passwordData.password_confirmation}
              onChange={(value) => setPasswordData({ ...passwordData, password_confirmation: value })}
              error={errors.password_confirmation}
            />

            <AuthButton 
              type="submit" 
              loading={changePasswordMutation.isPending}
              className="w-full"
            >
              Change Password
            </AuthButton>
          </form>
        </AuthCard>

        {/* Security Actions */}
        <AuthCard title="Security Actions" icon={Shield}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">
                  {user?.two_factor_enabled ? 'Enabled' : 'Add an extra layer of security'}
                </p>
              </div>
              <AuthButton
                onClick={() => window.location.href = '/two-factor'}
                className={user?.two_factor_enabled ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {user?.two_factor_enabled ? 'Manage' : 'Enable'}
              </AuthButton>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Device Management</h3>
                <p className="text-sm text-gray-600">Manage devices that have access to your account</p>
              </div>
              <AuthButton onClick={() => window.location.href = '/devices'}>
                Manage Devices
              </AuthButton>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Security Activity</h3>
                <p className="text-sm text-gray-600">View your recent security events</p>
              </div>
              <AuthButton onClick={() => window.location.href = '/security'}>
                View Activity
              </AuthButton>
            </div>

            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h3 className="text-sm font-medium text-red-900">Logout All Devices</h3>
                <p className="text-sm text-red-700">Sign out from all devices except this one</p>
              </div>
              <AuthButton
                onClick={handleLogoutAll}
                loading={logoutAllMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout All
              </AuthButton>
            </div>
          </div>
        </AuthCard>
      </div>
    </div>
  )
}