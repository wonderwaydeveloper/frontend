'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'

interface Device {
  id: number
  device_name: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  location: string
  is_current?: boolean
  is_trusted: boolean
  last_activity: string
  created_at: string
}

export function DeviceManagement() {
  const queryClient = useQueryClient()

  const { data: devices, isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const response = await api.get('/devices/list')
      return response.data as Device[]
    }
  })

  const trustDeviceMutation = useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await api.post(`/devices/${deviceId}/trust`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Device trusted successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    }
  })

  const revokeDeviceMutation = useMutation({
    mutationFn: async (deviceId: number) => {
      const response = await api.delete(`/devices/${deviceId}/revoke`)
      return response.data
    },
    onSuccess: () => {
      toast.success('Device revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    }
  })

  const revokeAllMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/devices/revoke-all')
      return response.data
    },
    onSuccess: () => {
      toast.success('All devices revoked successfully')
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    }
  })

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile': return '📱'
      case 'tablet': return '📱'
      case 'desktop': return '🖥️'
      default: return '💻'
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading devices...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Device Management</h2>
        <button
          onClick={() => revokeAllMutation.mutate()}
          disabled={revokeAllMutation.isPending}
          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
        >
          {revokeAllMutation.isPending ? 'Revoking...' : 'Revoke All Devices'}
        </button>
      </div>

      <div className="space-y-4">
        {devices?.map((device) => (
          <div key={device.id} className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{getDeviceIcon(device.device_type)}</span>
                <div>
                  <h3 className="font-medium flex items-center space-x-2">
                    <span>{device.device_name}</span>
                    {device.is_current && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                        Current Device
                      </span>
                    )}
                    {device.is_trusted && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        Trusted
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {device.browser} on {device.os}
                  </p>
                  <p className="text-sm text-gray-500">
                    {device.location} • {device.ip_address}
                  </p>
                  <p className="text-xs text-gray-400">
                    Last active: {new Date(device.last_activity).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {!device.is_current && (
                <div className="flex space-x-2">
                  {!device.is_trusted && (
                    <button
                      onClick={() => trustDeviceMutation.mutate(device.id)}
                      disabled={trustDeviceMutation.isPending}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      Trust
                    </button>
                  )}
                  <button
                    onClick={() => revokeDeviceMutation.mutate(device.id)}
                    disabled={revokeDeviceMutation.isPending}
                    className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 disabled:opacity-50"
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!devices?.length && (
        <div className="text-center py-8 text-gray-500">
          No devices found
        </div>
      )}
    </div>
  )
}