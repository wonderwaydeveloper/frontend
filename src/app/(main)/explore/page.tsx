'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Settings } from 'lucide-react'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import type { Post, User } from '@/types'

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'top' | 'latest' | 'people' | 'photos' | 'videos'>('top')

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchQuery, activeTab],
    queryFn: async () => {
      if (!searchQuery) return null
      let endpoint = '/search/all'
      if (activeTab === 'people') endpoint = '/search/users'
      else if (activeTab === 'top' || activeTab === 'latest') endpoint = '/search/posts'
      
      const response = await api.get(`${endpoint}?q=${encodeURIComponent(searchQuery)}`)
      return response.data
    },
    enabled: !!searchQuery,
  })

  const { data: trending } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const response = await api.get('/trending/posts')
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.posts || [])
    },
  })

  const tabs = [
    { id: 'top', label: 'Top' },
    { id: 'latest', label: 'Latest' },
    { id: 'people', label: 'People' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' }
  ]

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Explore</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search Twitter"
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-green-500 text-15 text-gray-900 placeholder-gray-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      {searchQuery && (
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-4 text-15 font-medium whitespace-nowrap transition-colors hover:bg-gray-50 ${
                  activeTab === tab.id
                    ? 'text-gray-900 border-b-2 border-green-600'
                    : 'text-gray-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {searchQuery ? (
          <div>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div>
                {activeTab === 'people' ? (
                  searchResults?.data?.map((user: User) => (
                    <div key={user.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1">
                              <h3 className="font-bold text-gray-900 text-15 truncate">{user.name}</h3>
                              {user.verified && (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-500 text-15 truncate">@{user.username}</p>
                            {user.bio && <p className="text-gray-700 text-15 mt-1 line-clamp-2">{user.bio}</p>}
                          </div>
                        </div>
                        <button className="border border-gray-300 text-gray-900 px-4 py-1.5 rounded-full text-15 font-bold hover:bg-gray-50 transition-colors flex-shrink-0">
                          Follow
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="divide-y divide-gray-100">
                    {searchResults?.data?.map((post: Post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Trending for you</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {Array.isArray(trending) ? trending.map((post) => (
                <PostCard key={post.id} post={post} />
              )) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}