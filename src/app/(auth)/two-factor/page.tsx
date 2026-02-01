'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { TwoFactorSetup, TwoFactorDisable } from '@/components/auth/two-factor-setup'
import { AuthCard, AuthButton } from '@/components/auth/auth-components'
import { Shield, ShieldCheck, ShieldX } from 'lucide-react'

export default function TwoFactorPage() {
  const [mode, setMode] = useState<'view' | 'enable' | 'disable'>('view')
  const { user, updateUser } = useAuth()

  const handleSetupComplete = () => {
    if (user?.id) {
      updateUser({ ...user, two_factor_enabled: true })
    }
    setMode('view')
  }

  const handleDisableComplete = () => {
    if (user?.id) {
      updateUser({ ...user, two_factor_enabled: false })
    }
    setMode('view')
  }

  const handleCancel = () => {
    setMode('view')
  }

  if (mode === 'enable') {
    return (
      <TwoFactorSetup 
        onComplete={handleSetupComplete}
        onCancel={handleCancel}
      />
    )
  }

  if (mode === 'disable') {
    return (
      <TwoFactorDisable 
        onComplete={handleDisableComplete}
        onCancel={handleCancel}
      />
    )
  }

  return (
    <AuthCard 
      title="Two-Factor Authentication" 
      subtitle="Add an extra layer of security to your account"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {user?.two_factor_enabled ? (
              <ShieldCheck className="w-8 h-8 text-green-600" />
            ) : (
              <ShieldX className="w-8 h-8 text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">
              Two-Factor Authentication
            </h3>
            <p className="text-sm text-gray-600">
              {user?.two_factor_enabled 
                ? 'Your account is protected with 2FA'
                : 'Add an extra layer of security to your account'
              }
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user?.two_factor_enabled 
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {user?.two_factor_enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">How it works</h4>
              <p className="text-sm text-gray-600">
                Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app in addition to your password.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Supported apps</h4>
              <p className="text-sm text-gray-600">
                Google Authenticator, Authy, 1Password, or any TOTP-compatible authenticator app.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          {user?.two_factor_enabled ? (
            <AuthButton 
              onClick={() => setMode('disable')}
              className="w-full bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Disable Two-Factor Authentication
            </AuthButton>
          ) : (
            <AuthButton 
              onClick={() => setMode('enable')}
              className="w-full"
            >
              Enable Two-Factor Authentication
            </AuthButton>
          )}
        </div>
      </div>
    </AuthCard>
  )
}