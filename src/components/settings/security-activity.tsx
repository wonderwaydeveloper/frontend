'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

interface SecurityEvent {
  id: number
  event_type: string
  ip_address: string
  user_agent: string
  metadata: any
  created_at: string
}

export function SecurityActivity() {
  const { data: events, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: async () => {
      const response = await api.get('/security/events')
      return response.data as SecurityEvent[]
    }
  })

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'successful_login': return '✅'
      case 'suspicious_login_attempt': return '⚠️'
      case 'password_changed': return '🔑'
      case '2fa_enabled': return '🔐'
      case '2fa_disabled': return '🔓'
      case 'device_verified': return '📱'
      default: return '📋'
    }
  }

  const getEventMessage = (eventType: string) => {
    const messages = {
      'successful_login': 'Successful login',
      'suspicious_login_attempt': 'Suspicious login attempt',
      'password_changed': 'Password changed',
      '2fa_enabled': 'Two-factor authentication enabled',
      '2fa_disabled': 'Two-factor authentication disabled',
      'device_verified': 'New device verified'
    }
    return messages[eventType] || eventType
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'successful_login': return 'text-green-600'
      case 'suspicious_login_attempt': return 'text-red-600'
      case 'password_changed': return 'text-blue-600'
      case '2fa_enabled': return 'text-green-600'
      case '2fa_disabled': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading security activity...</div>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Security Activity</h2>
      
      <div className="space-y-3">
        {events?.map((event) => (
          <div key={event.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">{getEventIcon(event.event_type)}</span>
              <div className="flex-1">
                <h3 className={`font-medium ${getEventColor(event.event_type)}`}>
                  {getEventMessage(event.event_type)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(event.created_at).toLocaleString()}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <p>IP: {event.ip_address}</p>
                  {event.user_agent && (
                    <p className="truncate">Device: {event.user_agent}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!events?.length && (
        <div className="text-center py-8 text-gray-500">
          No security events found
        </div>
      )}
    </div>
  )
}