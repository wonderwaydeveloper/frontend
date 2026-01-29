'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Shield, Smartphone, Monitor, Activity, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { TwoFactorSetup, TwoFactorDisable } from '@/components/auth/two-factor-setup'
import { PasswordChange } from '@/components/settings/password-change'
import { DeviceManagement } from '@/components/settings/device-management'
import { SessionManagement } from '@/components/settings/session-management'
import { SecurityActivity } from '@/components/settings/security-activity'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('security')
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [show2FADisable, setShow2FADisable] = useState(false)
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data
    }
  })

  const tabs = [
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'devices', name: 'Devices', icon: Smartphone },
    { id: 'sessions', name: 'Sessions', icon: Monitor },
    { id: 'activity', name: 'Activity', icon: Activity }
  ]

  if (show2FASetup) {
    return (
      <TwoFactorSetup
        onComplete={() => {
          setShow2FASetup(false)
          window.location.reload()
        }}
        onCancel={() => setShow2FASetup(false)}
      />
    )
  }

  if (show2FADisable) {
    return (
      <TwoFactorDisable
        onComplete={() => {
          setShow2FADisable(false)
          window.location.reload()
        }}
        onCancel={() => setShow2FADisable(false)}
      />
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-4 text-15 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-green-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {activeTab === 'security' && (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-2xl p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
              <p className="text-15 text-gray-500 mb-4">
                {user?.two_factor_enabled 
                  ? 'Two-factor authentication is enabled' 
                  : 'Add an extra layer of security to your account'
                }
              </p>
              <button
                onClick={() => user?.two_factor_enabled ? setShow2FADisable(true) : setShow2FASetup(true)}
                className={`px-4 py-2 rounded-full text-15 font-bold transition-colors ${
                  user?.two_factor_enabled
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {user?.two_factor_enabled ? 'Disable 2FA' : 'Enable 2FA'}
              </button>
            </div>

            <PasswordChange />
          </div>
        )}

        {activeTab === 'devices' && <DeviceManagement />}
        {activeTab === 'sessions' && <SessionManagement />}
        {activeTab === 'activity' && <SecurityActivity />}
      </div>
    </div>
  )
}