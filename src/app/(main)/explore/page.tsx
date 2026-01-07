'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import type { Post, User } from '@/types'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'users'>('posts')

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery, activeTab],
    queryFn: async () => {
      if (!searchQuery) return null
      const response = await api.get(`/search/${activeTab}?q=${encodeURIComponent(searchQuery)}`)
      return response.data
    },
    enabled: !!searchQuery,
  })

  const { data: trending } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const response = await api.get('/trending/posts')
      return response.data as Post[]
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold mb-4">Explore</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts, people, hashtags..."
            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs */}
        {searchQuery && (
          <div className="flex mt-4 border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'posts'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === 'users'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('users')}
            >
              People
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {searchQuery ? (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {activeTab === 'posts' ? (
                  searchResults?.data?.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))
                ) : (
                  searchResults?.data?.map((user: User) => (
                    <div key={user.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                          <div>
                            <div className="flex items-center space-x-1">
                              <h3 className="font-bold">{user.name}</h3>
                              {user.verified && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-500">@{user.username}</p>
                            {user.bio && <p className="text-gray-700 mt-1">{user.bio}</p>}
                          </div>
                        </div>
                        <button className="bg-black text-white px-4 py-1 rounded-full text-sm font-bold hover:bg-gray-800">
                          Follow
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">Trending now</h2>
            </div>
            {trending?.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}