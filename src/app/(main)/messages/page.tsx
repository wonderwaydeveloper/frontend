'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, Settings, Mail } from 'lucide-react'
import api from '@/lib/api'
import { formatRelativeTime } from '@/lib/utils'

interface Conversation {
  id: number
  user: {
    id: number
    name: string
    username: string
    avatar?: string
  }
  last_message: {
    content: string
    created_at: string
  }
  unread_count: number
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messages/conversations')
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.conversations || [])
    }
  })
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <MessageCircle className="h-5 w-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search for people and groups"
            className="w-full bg-transparent outline-none text-15 text-gray-900 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : Array.isArray(conversations) && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your inbox!</h2>
            <p className="text-15 text-gray-500 text-center mb-6 leading-5">
              Drop a line, share posts and more with private conversations between you and others on Twitter.
            </p>
            <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-15 hover:bg-green-700 transition-colors">
              Write a message
            </button>
          </div>
        ) : (
          Array.isArray(conversations) ? conversations.map((conversation: Conversation) => (
            <div key={conversation.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0">
                  {conversation.user.avatar ? (
                    <img src={conversation.user.avatar} alt={conversation.user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {conversation.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <h3 className="font-bold text-gray-900 text-15 truncate">{conversation.user.name}</h3>
                      <span className="text-gray-500 text-15">@{conversation.user.username}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-sm">
                        {formatRelativeTime(conversation.last_message.created_at)}
                      </span>
                      {conversation.unread_count > 0 && (
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-15 truncate mt-1">
                    {conversation.last_message.content}
                  </p>
                </div>
              </div>
            </div>
          )) : null
        )}
      </div>
    </div>
  )
}