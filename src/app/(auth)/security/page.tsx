'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard } from '@/components/auth/auth-components'
import { Shield, Clock, MapPin, Monitor } from 'lucide-react'

interface SecurityEvent {
  id: number
  event_type: string
  ip_address: string
  user_agent: string
  metadata: any
  created_at: string
}

const eventTypeLabels: Record<string, string> = {
  'successful_login': 'Successful Login',
  'suspicious_login_attempt': 'Suspicious Login Attempt',
  'password_changed': 'Password Changed',
  '2fa_enabled': '2FA Enabled',
  '2fa_disabled': '2FA Disabled',
  'social_login_success': 'Social Login',
  'social_registration': 'Social Registration',
  'device_verified': 'Device Verified'
}

const eventTypeColors: Record<string, string> = {
  'successful_login': 'text-green-600 bg-green-100',
  'suspicious_login_attempt': 'text-red-600 bg-red-100',
  'password_changed': 'text-blue-600 bg-blue-100',
  '2fa_enabled': 'text-green-600 bg-green-100',
  '2fa_disabled': 'text-yellow-600 bg-yellow-100',
  'social_login_success': 'text-purple-600 bg-purple-100',
  'social_registration': 'text-purple-600 bg-purple-100',
  'device_verified': 'text-blue-600 bg-blue-100'
}

export default function SecurityPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => AuthAPI.getSecurityEvents(),
    refetchInterval: 30000
  })

  const getDeviceInfo = (userAgent: string) => {
    if (userAgent.includes('Mobile')) return 'Mobile Device'
    if (userAgent.includes('Chrome')) return 'Chrome Browser'
    if (userAgent.includes('Firefox')) return 'Firefox Browser'
    if (userAgent.includes('Safari')) return 'Safari Browser'
    return 'Unknown Device'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Activity</h1>
        <p className="text-gray-600 mt-2">Monitor your account security events and login activity</p>
      </div>

      {isLoading ? (
        <AuthCard title="Loading...">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </AuthCard>
      ) : (
        <div className="space-y-6">
          {events && events.length > 0 ? (
            events.map((event: SecurityEvent) => {
              const colorClass = eventTypeColors[event.event_type] || 'text-gray-600 bg-gray-100'
              
              return (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                          {eventTypeLabels[event.event_type] || event.event_type}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatDate(event.created_at)}
                        </span>
                      </div>
                      
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.ip_address}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Monitor className="w-4 h-4" />
                            <span>{getDeviceInfo(event.user_agent)}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(event.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                          <details className="mt-2">
                            <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                              View details
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded text-sm">
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(event.metadata, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <AuthCard title="No Security Events">
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No security events found for your account.</p>
              </div>
            </AuthCard>
          )}
        </div>
      )}
    </div>
  )
}