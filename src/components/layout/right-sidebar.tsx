'use client'

import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import api from '@/lib/api'
import type { User, Hashtag } from '@/types'

export default function RightSidebar() {
  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: async () => {
      const response = await api.get('/hashtags/trending')
      return response.data as Hashtag[]
    },
  })

  const { data: suggestions } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const response = await api.get('/suggestions/users')
      return response.data as User[]
    },
  })

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Search */}
      <div className="sticky top-0 bg-white pb-3">
        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <Search className="h-5 w-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search Twitter"
            className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500 text-15"
          />
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">What's happening</h2>
        </div>
        <div>
          {trending?.slice(0, 5).map((hashtag, index) => (
            <div key={hashtag.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
              <p className="text-13 text-gray-500">Trending</p>
              <p className="font-bold text-gray-900 text-15 mt-0.5">#{hashtag.name}</p>
              <p className="text-13 text-gray-500 mt-0.5">{hashtag.posts_count} posts</p>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
          <p className="text-green-600 text-15">Show more</p>
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-2 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Who to follow</h2>
        </div>
        <div>
          {suggestions?.slice(0, 3).map((user) => (
            <div key={user.id} className="px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <p className="font-bold text-gray-900 text-15 truncate">{user.name}</p>
                      {user.verified && (
                        <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-500 text-13 truncate">@{user.username}</p>
                  </div>
                </div>
                <button className="border border-gray-300 text-gray-900 px-3 py-1 rounded-full text-13 font-bold hover:bg-gray-50 transition-colors flex-shrink-0">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-t border-gray-100">
          <p className="text-green-600 text-15">Show more</p>
        </div>
      </div>
    </div>
  )
}