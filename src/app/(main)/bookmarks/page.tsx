'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Bookmark, ArrowLeft, MoreHorizontal } from 'lucide-react'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import type { Post } from '@/types'

export default function BookmarksPage() {
  const router = useRouter()
  
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const response = await api.get('/bookmarks')
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.bookmarks || [])
    }
  })
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bookmarks</h1>
              <p className="text-sm text-gray-500">@username</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreHorizontal className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : Array.isArray(bookmarks) && bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Bookmark className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Save posts for later</h2>
            <p className="text-15 text-gray-500 text-center mb-6 leading-5">
              Bookmark posts to easily find them again in the future.
            </p>
            <div className="text-center">
              <p className="text-15 text-gray-500 mb-2">
                To bookmark a post, tap the share icon and select "Add post to Bookmarks".
              </p>
            </div>
          </div>
        ) : (
          Array.isArray(bookmarks) ? bookmarks.map((bookmark: any) => (
            <PostCard key={bookmark.id} post={bookmark.post || bookmark} />
          )) : null
        )}
      </div>
    </div>
  )
}