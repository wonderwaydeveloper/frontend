'use client'

import { useQuery } from '@tanstack/react-query'
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
    <div className="p-4 space-y-6">
      {/* Search */}
      <div className="bg-gray-50 rounded-full p-3">
        <input
          type="text"
          placeholder="Search"
          className="w-full bg-transparent outline-none text-gray-900 placeholder-gray-500"
        />
      </div>

      {/* Trending */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">What's happening</h2>
        <div className="space-y-3">
          {trending?.slice(0, 5).map((hashtag) => (
            <div key={hashtag.id} className="cursor-pointer hover:bg-gray-100 p-2 rounded">
              <p className="text-sm text-gray-500">Trending</p>
              <p className="font-bold">#{hashtag.name}</p>
              <p className="text-sm text-gray-500">{hashtag.posts_count} posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who to follow */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-4">Who to follow</h2>
        <div className="space-y-3">
          {suggestions?.slice(0, 3).map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
              </div>
              <button className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-800">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}