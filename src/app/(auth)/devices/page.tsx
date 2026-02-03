'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AuthAPI } from '@/lib/auth-api'
import { AuthCard, AuthButton, AuthInput } from '@/components/auth/auth-components'
import { Monitor, Smartphone, Tablet, Shield, ShieldCheck, Trash2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Device {
  id: number
  device_name: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  is_trusted: boolean
  last_used_at: string
  created_at: string
}

const deviceIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  web: Monitor
}

export default function DevicesPage() {
  const [showRevokeAll, setShowRevokeAll] = useState(false)
  const [password, setPassword] = useState('')
  const queryClient = useQueryClient()

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => AuthAPI.getDevices(),
    refetchInterval: 30000
  })

  const trustDeviceMutation = useMutation({
    mutationFn: ({ deviceId, password }: { deviceId: string; password: string }) => 
      AuthAPI.trustDevice(deviceId, password),
    onSuccess: () => {
      toast.success('Device trusted successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to trust device')
    }
  })

  const revokeDeviceMutation = useMutation({
    mutationFn: (deviceId: string) => AuthAPI.revokeDevice(deviceId),
    onSuccess: () => {
      toast.success('Device revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke device')
    }
  })

  const revokeAllMutation = useMutation({
    mutationFn: (password: string) => AuthAPI.revokeAllDevices(password),
    onSuccess: () => {
      toast.success('All devices revoked successfully')
      setShowRevokeAll(false)
      setPassword('')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke all devices')
    }
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${Math.floor(diffInHours)} hours ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const handleRevokeAll = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    revokeAllMutation.mutate(password)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Device Management</h1>
        <p className="text-gray-600 mt-2">Manage devices that have access to your account</p>
      </div>

      {isLoading ? (
        <AuthCard title="Loading...">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </AuthCard>
      ) : (
        <div className="space-y-6">
          {devices && devices.length > 0 ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Connected Devices ({devices.length})
                </h2>
                <AuthButton
                  onClick={() => setShowRevokeAll(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Revoke All Devices
                </AuthButton>
              </div>

              {devices.map((device: Device) => {
                const DeviceIcon = deviceIcons[device.device_type as keyof typeof deviceIcons] || Monitor
                
                return (
                  <div key={device.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-gray-100 rounded-full">
                          <DeviceIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {device.device_name}
                            </h3>
                            {device.is_trusted ? (
                              <ShieldCheck className="w-5 h-5 text-green-600" />
                            ) : (
                              <Shield className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          
                          <div className="mt-1 space-y-1 text-sm text-gray-600">
                            <p>{device.browser} on {device.os}</p>
                            <p>IP: {device.ip_address}</p>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Last used {formatDate(device.last_used_at)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              device.is_trusted 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {device.is_trusted ? 'Trusted' : 'Untrusted'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!device.is_trusted && (
                          <AuthButton
                            onClick={() => {
                              const password = prompt('Enter your password to trust this device:')
                              if (password) {
                                trustDeviceMutation.mutate({ deviceId: device.id.toString(), password })
                              }
                            }}
                            loading={trustDeviceMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Trust
                          </AuthButton>
                        )}
                        
                        <AuthButton
                          onClick={() => {
                            if (confirm('Are you sure you want to revoke this device?')) {
                              revokeDeviceMutation.mutate(device.id.toString())
                            }
                          }}
                          loading={revokeDeviceMutation.isPending}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </AuthButton>
                      </div>
                    </div>
                  </div>
                )
              })}
            </>
          ) : (
            <AuthCard title="No Devices Found">
              <div className="text-center py-8">
                <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No devices found for your account.</p>
              </div>
            </AuthCard>
          )}
        </div>
      )}

      {showRevokeAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revoke All Devices
            </h3>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                This will sign you out of all devices except the current one. You'll need to sign in again on other devices.
              </p>
            </div>
            
            <form onSubmit={handleRevokeAll} className="space-y-4">
              <AuthInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                required
              />
              
              <div className="flex space-x-3">
                <AuthButton
                  type="button"
                  onClick={() => {
                    setShowRevokeAll(false)
                    setPassword('')
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </AuthButton>
                <AuthButton
                  type="submit"
                  loading={revokeAllMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Revoke All
                </AuthButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}