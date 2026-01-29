'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import CreatePost from '@/components/post/create-post'
import { LoadingCard, LoadingPage } from '@/components/ui/loading'
import type { Post } from '@/types'

export default function TimelinePage() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['timeline'],
    queryFn: async () => {
      const response = await api.get('/timeline')
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.posts || [])
    },
  })

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Unable to load timeline</h3>
          <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">Home</h1>
      </div>

      {/* Create Post */}
      <CreatePost />

      {/* Timeline */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <LoadingCard count={5} />
        ) : Array.isArray(posts) && posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No posts yet. Start following people to see their posts!</p>
          </div>
        ) : (
          Array.isArray(posts) ? posts.map((post) => (
            <PostCard key={post.id} post={post} />
          )) : null
        )}
      </div>
    </div>
  )
}