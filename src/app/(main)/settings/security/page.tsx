'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, AlertTriangle, Clock, MapPin } from 'lucide-react'
import { AuthAPI } from '@/lib/auth-api'
import { SecurityEventsSkeleton } from '@/components/ui/skeleton'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface SecurityEvent {
  id: number
  event_type: string
  ip_address: string
  user_agent: string
  metadata: any
  created_at: string
}

export default function SecurityPage() {
  const [filter, setFilter] = useState<string>('all')
  const router = useRouter()

  const { data: events, isLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => AuthAPI.getSecurityEvents()
  })

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'successful_login': return '✅'
      case 'suspicious_login_attempt': return '⚠️'
      case 'password_changed': return '🔑'
      case '2fa_enabled': return '🔐'
      case '2fa_disabled': return '🔓'
      case 'device_trusted': return '📱'
      default: return '📋'
    }
  }

  const getEventMessage = (event: SecurityEvent) => {
    const messages = {
      'successful_login': 'Successful login',
      'suspicious_login_attempt': 'Suspicious login attempt detected',
      'password_changed': 'Password was changed',
      '2fa_enabled': 'Two-factor authentication enabled',
      '2fa_disabled': 'Two-factor authentication disabled',
      'device_trusted': 'Device was trusted'
    }
    return messages[event.event_type as keyof typeof messages] || event.event_type
  }

  const getEventSeverity = (eventType: string) => {
    const critical = ['suspicious_login_attempt', '2fa_disabled']
    const warning = ['password_changed', 'device_trusted']
    
    if (critical.includes(eventType)) return 'critical'
    if (warning.includes(eventType)) return 'warning'
    return 'info'
  }

  const filteredEvents = events?.filter((event: SecurityEvent) => {
    if (filter === 'all') return true
    return getEventSeverity(event.event_type) === filter
  })

  const filters = [
    { id: 'all', name: 'All Events', count: events?.length || 0 },
    { id: 'critical', name: 'Critical', count: events?.filter((e: SecurityEvent) => getEventSeverity(e.event_type) === 'critical').length || 0 },
    { id: 'warning', name: 'Warning', count: events?.filter((e: SecurityEvent) => getEventSeverity(e.event_type) === 'warning').length || 0 },
    { id: 'info', name: 'Info', count: events?.filter((e: SecurityEvent) => getEventSeverity(e.event_type) === 'info').length || 0 }
  ]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Security Activity</h1>
            <p className="text-sm text-gray-600">Monitor your account security events</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Breadcrumb />
        <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Filters</h3>
              <div className="flex space-x-2 overflow-x-auto">
                {filters.map((filterOption) => (
                  <button
                    key={filterOption.id}
                    onClick={() => setFilter(filterOption.id)}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      filter === filterOption.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span>{filterOption.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      filter === filterOption.id ? 'bg-white/20 text-white' : 'bg-white text-gray-600'
                    }`}>
                      {filterOption.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <SecurityEventsSkeleton />
        ) : (
          <div className="space-y-4">
            {filteredEvents?.map((event: SecurityEvent, index: number) => {
              const severity = getEventSeverity(event.event_type)
              return (
                <div 
                  key={event.id || index} 
                  className="bg-white rounded-lg border border-gray-100 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-xl">{getEventIcon(event.event_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{getEventMessage(event)}</h3>
                        {severity === 'critical' && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                            Critical
                          </span>
                        )}
                        {severity === 'warning' && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                            Warning
                          </span>
                        )}
                      </div>
                      
                      <div className="text-gray-600 mb-4">
                        <div className="flex items-center space-x-4 text-sm mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>IP: {event.ip_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(event.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        
                        {event.metadata && (
                          <details className="text-sm text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700 font-medium">
                              View details
                            </summary>
                            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto whitespace-pre-wrap">
                              {JSON.stringify(
                                typeof event.metadata === 'string' 
                                  ? JSON.parse(event.metadata) 
                                  : event.metadata, 
                                null, 2
                              )}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          }
          </div>
        )}

        {!filteredEvents?.length && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No security events found</p>
          </div>
        )}
      </div>
    </div>
  )
}