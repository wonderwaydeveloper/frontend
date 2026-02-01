'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Shield, Smartphone, User, Lock, ArrowLeft } from 'lucide-react'
import api from '@/lib/api'
import { TwoFactorSetup, TwoFactorDisable } from '@/components/auth/two-factor-setup'
import Link from 'next/link'

export default function SettingsPage() {
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

  const quickActions = [
    { 
      id: 'security-detail', 
      name: 'Security Activity', 
      description: 'View detailed security events',
      icon: Shield, 
      href: '/settings/security',
      color: 'text-green-600'
    },
    { 
      id: 'devices-detail', 
      name: 'Device Management', 
      description: 'Manage trusted devices',
      icon: Smartphone, 
      href: '/settings/devices',
      color: 'text-green-600'
    },
    { 
      id: 'account-management', 
      name: 'Account Settings', 
      description: 'Export data, delete account',
      icon: User, 
      href: '/settings/account',
      color: 'text-green-600'
    },
    { 
      id: 'privacy-settings', 
      name: 'Privacy Controls', 
      description: 'Manage privacy settings',
      icon: Lock, 
      href: '/settings/privacy',
      color: 'text-green-600'
    },
    {
      id: 'two-factor-auth',
      name: 'Two-Factor Authentication',
      description: user?.two_factor_enabled ? 'Manage 2FA settings' : 'Enable extra security',
      icon: Shield,
      action: () => user?.two_factor_enabled ? setShow2FADisable(true) : setShow2FASetup(true),
      color: 'text-green-600'
    }
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
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            const baseClasses = "flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all duration-200"
            
            const content = (
              <>
                <Icon className={`h-6 w-6 ${action.color}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base">{action.name}</h3>
                  <p className="text-sm text-gray-600 mt-0.5">{action.description}</p>
                </div>
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )
            
            if (action.href) {
              return (
                <Link key={action.id} href={action.href} className={baseClasses}>
                  {content}
                </Link>
              )
            }
            
            return (
              <button key={action.id} onClick={action.action} className={`${baseClasses} text-left w-full`}>
                {content}
              </button>
            )
          })}
        </div>
      </div>


    </div>
  )
}