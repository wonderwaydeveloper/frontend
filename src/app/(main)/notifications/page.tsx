'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatRelativeTime } from '@/lib/utils'
import api from '@/lib/api'
import type { Notification } from '@/types'

export default function NotificationsPage() {
  const queryClient = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications')
      return response.data as Notification[]
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
        return '❤️'
      case 'comment':
        return '💬'
      case 'follow':
        return '👤'
      case 'mention':
        return '@'
      case 'repost':
        return '🔄'
      default:
        return '🔔'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Notifications</h1>
          <button
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="divide-y divide-gray-200">
        {notifications?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">🔔</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications?.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                !notification.read_at ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex space-x-3">
                <div className="text-2xl">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">{notification.title}</p>
                    {!notification.read_at && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{notification.message}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {formatRelativeTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}