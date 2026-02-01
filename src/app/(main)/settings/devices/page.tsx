'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Smartphone, Monitor, Tablet, Shield, AlertTriangle, Clock, MapPin } from 'lucide-react'
import { AuthAPI } from '@/lib/auth-api'
import { DeviceListSkeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface Device {
  id: number
  device_name: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  is_current?: boolean
  is_trusted: boolean
  last_used_at: string
  created_at: string
}

export default function DevicesPage() {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [passwordModal, setPasswordModal] = useState<{ action: string; deviceId?: string } | null>(null)
  const [password, setPassword] = useState('')
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => AuthAPI.getDevices()
  })

  const { data: suspiciousActivity } = useQuery({
    queryKey: ['suspicious-activity'],
    queryFn: () => AuthAPI.checkSuspiciousActivity()
  })

  const trustDeviceMutation = useMutation({
    mutationFn: ({ deviceId, password }: { deviceId: string; password: string }) => AuthAPI.trustDevice(deviceId, password),
    onSuccess: () => {
      toast.success('Device trusted successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      setPasswordModal(null)
      setPassword('')
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
    }
  })

  const revokeAllMutation = useMutation({
    mutationFn: (password: string) => AuthAPI.revokeAllDevices(password),
    onSuccess: () => {
      toast.success('All devices revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
      setPasswordModal(null)
      setPassword('')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to revoke devices')
    }
  })

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-6 w-6" />
      case 'tablet': return <Tablet className="h-6 w-6" />
      case 'desktop': return <Monitor className="h-6 w-6" />
      default: return <Monitor className="h-6 w-6" />
    }
  }

  const getDeviceActivity = async (deviceId: string) => {
    try {
      const activity = await AuthAPI.getDeviceActivity(deviceId)
      setSelectedDevice({ ...devices?.find((d: Device) => d.id.toString() === deviceId), activity })
    } catch (error) {
      toast.error('Failed to load device activity')
    }
  }

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
            <h1 className="text-xl font-bold text-gray-900">Device Management</h1>
            <p className="text-sm text-gray-600">Manage your trusted devices and sessions</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Breadcrumb />
        {suspiciousActivity?.alerts?.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Alert</h3>
                <p className="text-gray-600 mb-4">
                  {suspiciousActivity.alerts.length} suspicious activities detected
                </p>
                <button
                  onClick={() => setPasswordModal({ action: 'revokeAll' })}
                  disabled={revokeAllMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {revokeAllMutation.isPending ? 'Revoking...' : 'Revoke All Devices'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <DeviceListSkeleton />
        ) : (
          <div className="space-y-4">
            {devices?.map((device: Device) => (
              <div key={device.id} className="bg-white rounded-lg border border-gray-100 p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-green-600 mt-1">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{device.device_name}</h3>
                      <div className="flex space-x-2">
                        {device.is_current && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            Current Device
                          </span>
                        )}
                        {device.is_trusted && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            <Shield className="h-3 w-3 inline mr-1" />
                            Trusted
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {device.browser} on {device.os}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{device.ip_address}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Last active: {new Date(device.last_used_at).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => getDeviceActivity(device.id.toString())}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        View Activity
                      </button>
                      {!device.is_current && !device.is_trusted && (
                        <button
                          onClick={() => setPasswordModal({ action: 'trust', deviceId: device.id.toString() })}
                          disabled={trustDeviceMutation.isPending}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          Trust Device
                        </button>
                      )}
                      {!device.is_current && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to revoke access for this device? This action cannot be undone.')) {
                              revokeDeviceMutation.mutate(device.id.toString())
                            }
                          }}
                          disabled={revokeDeviceMutation.isPending}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          {revokeDeviceMutation.isPending ? 'Revoking...' : 'Revoke Access'}
                        </button>
                      )}
                      {device.is_current && (
                        <div className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm">
                          Current device cannot be revoked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
          </div>
        )}

        {!devices?.length && !isLoading && (
          <div className="text-center py-8 text-gray-500">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No devices found</p>
          </div>
        )}
      </div>

      {/* Password Modal */}
      {passwordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {passwordModal.action === 'trust' ? 'Trust This Device' : 'Revoke All Other Devices'}
            </h3>
            <p className="text-gray-600 mb-4">
              {passwordModal.action === 'trust' 
                ? 'Trusting this device will allow future logins without verification. Please enter your password to confirm.' 
                : 'This will log you out from all other devices and revoke their access. You will remain logged in on this device. Please enter your password to confirm.'}
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && password) {
                  if (passwordModal.action === 'trust' && passwordModal.deviceId) {
                    trustDeviceMutation.mutate({ deviceId: passwordModal.deviceId, password })
                  } else if (passwordModal.action === 'revokeAll') {
                    revokeAllMutation.mutate(password)
                  }
                }
              }}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (passwordModal.action === 'trust' && passwordModal.deviceId) {
                    trustDeviceMutation.mutate({ deviceId: passwordModal.deviceId, password })
                  } else if (passwordModal.action === 'revokeAll') {
                    revokeAllMutation.mutate(password)
                  }
                }}
                disabled={!password || trustDeviceMutation.isPending || revokeAllMutation.isPending}
                className={`flex-1 py-2 rounded-lg font-medium disabled:opacity-50 ${
                  passwordModal.action === 'trust' 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {(trustDeviceMutation.isPending || revokeAllMutation.isPending) 
                  ? 'Processing...' 
                  : passwordModal.action === 'trust' 
                    ? 'Trust Device' 
                    : 'Revoke All Other Devices'
                }
              </button>
              <button
                onClick={() => {
                  setPasswordModal(null)
                  setPassword('')
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Device Activity</h3>
              <button
                onClick={() => setSelectedDevice(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Activity details for {selectedDevice.device_name}
              </p>
              {selectedDevice.activity ? (
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(selectedDevice.activity, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Loading activity...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}