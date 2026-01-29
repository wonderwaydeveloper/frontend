'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, MessageCircle, UserPlus, Repeat2, Bell, Settings } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import api from '@/lib/api'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'mentions'>('all')
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: async () => {
      const endpoint = activeTab === 'mentions' ? '/notifications/mentions' : '/notifications'
      const response = await api.get(endpoint)
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.notifications || [])
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.post('/notifications/mark-all-read')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-7 h-7 text-red-500 fill-current" />
      case 'comment':
        return <MessageCircle className="w-7 h-7 text-blue-500" />
      case 'follow':
        return <UserPlus className="w-7 h-7 text-green-500" />
      case 'mention':
        return <MessageCircle className="w-7 h-7 text-blue-500" />
      case 'repost':
        return <Repeat2 className="w-7 h-7 text-green-500" />
      default:
        return <Bell className="w-7 h-7 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 py-4 text-center font-medium text-15 transition-colors hover:bg-gray-50 ${
              activeTab === 'all'
                ? 'text-gray-900 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('mentions')}
            className={`flex-1 py-4 text-center font-medium text-15 transition-colors hover:bg-gray-50 ${
              activeTab === 'mentions'
                ? 'text-gray-900 border-b-2 border-green-600'
                : 'text-gray-500'
            }`}
          >
            Mentions
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div>
        {Array.isArray(notifications) && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16">
            <Bell className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Nothing to see here — yet</h2>
            <p className="text-15 text-gray-500 text-center leading-5">
              When someone mentions you, you'll find it here.
            </p>
          </div>
        ) : (
          Array.isArray(notifications) ? notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                !notification.read_at ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-15 text-gray-900 leading-5">
                        <span className="font-bold">{notification.title}</span> {notification.message}
                      </p>
                      <p className="text-15 text-gray-500 mt-1">
                        {formatRelativeTime(notification.created_at)}
                      </p>
                    </div>
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : null
        )}
      </div>
    </div>
  )
}