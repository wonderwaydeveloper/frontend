'use client'

import { useQuery } from '@tanstack/react-query'
import { Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import type { User, Post } from '@/types'

export default function ProfilePage() {
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data as User
    },
  })

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const response = await api.get(`/users/${user.id}/posts`)
      return response.data as Post[]
    },
    enabled: !!user?.id,
  })

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <div>
          <h1 className="text-xl font-bold">{user.name}</h1>
          <p className="text-gray-500 text-sm">{user.posts_count} posts</p>
        </div>
      </div>

      {/* Profile Info */}
      <div>
        {/* Cover Photo */}
        <div className="h-48 bg-gray-300"></div>
        
        {/* Profile Details */}
        <div className="px-4 pb-4">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 bg-gray-400 rounded-full border-4 border-white"></div>
          </div>
          
          {/* Edit Profile Button */}
          <div className="flex justify-end mb-4">
            <button className="border border-gray-300 px-4 py-2 rounded-full font-bold hover:bg-gray-50">
              Edit profile
            </button>
          </div>
          
          {/* User Info */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="text-xl font-bold">{user.name}</h1>
                {user.verified && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-gray-500">@{user.username}</p>
            </div>
            
            {user.bio && (
              <p className="text-gray-900">{user.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <LinkIcon className="w-4 h-4" />
                  <a href={user.website} className="text-blue-500 hover:underline">
                    {user.website}
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.created_at)}</span>
              </div>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-bold">{user.following_count}</span>
                <span className="text-gray-500 ml-1">Following</span>
              </div>
              <div>
                <span className="font-bold">{user.followers_count}</span>
                <span className="text-gray-500 ml-1">Followers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          <button className="flex-1 py-4 text-center font-medium text-blue-600 border-b-2 border-blue-600">
            Posts
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-700">
            Replies
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-700">
            Media
          </button>
          <button className="flex-1 py-4 text-center font-medium text-gray-500 hover:text-gray-700">
            Likes
          </button>
        </div>
      </div>

      {/* Posts */}
      <div className="divide-y divide-gray-200">
        {postsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : posts?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No posts yet</p>
          </div>
        ) : (
          posts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>
    </div>
  )
}