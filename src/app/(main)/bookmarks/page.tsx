'use client'

import { useRouter } from 'next/navigation'
import { Bookmark, ArrowLeft, MoreHorizontal } from 'lucide-react'

export default function BookmarksPage() {
  const router = useRouter()
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

      {/* Empty State */}
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
    </div>
  )
}