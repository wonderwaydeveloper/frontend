'use client'

import { memo } from 'react'
import { Heart, MessageCircle, Repeat2, Share, Bookmark } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  if (!post || !post.user) {
    return null
  }

  return (
    <article className="px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-1">
            <h3 className="font-bold text-gray-900 text-15 hover:underline cursor-pointer">{post.user?.name || 'Unknown User'}</h3>
            {post.user?.verified && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <span className="text-gray-500 text-15">@{post.user?.username || 'unknown'}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-15 hover:underline cursor-pointer">{formatRelativeTime(post.created_at)}</span>
          </div>
          
          {/* Post Content */}
          <div className="mt-1">
            <p className="text-gray-900 text-15 leading-5 whitespace-pre-wrap">{post.content}</p>
            
            {/* Image */}
            {post.image && (
              <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200">
                <img 
                  src={post.image} 
                  alt="Post image" 
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Quoted Post */}
            {post.quoted_post && post.quoted_post.user && (
              <div className="mt-3 border border-gray-200 rounded-2xl p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="font-bold text-gray-900 text-sm hover:underline cursor-pointer">{post.quoted_post.user.name}</span>
                  <span className="text-gray-500 text-sm">@{post.quoted_post.user.username}</span>
                </div>
                <p className="text-gray-900 text-sm leading-4">{post.quoted_post.content}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button className="group flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm tabular-nums">{post.comments_count}</span>
            </button>
            
            <button className="group flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-sm tabular-nums">{post.quotes_count}</span>
            </button>
            
            <button className={`group flex items-center space-x-1 transition-colors ${
              post.is_liked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
            }`}>
              <div className={`p-2 rounded-full transition-colors ${
                post.is_liked ? 'bg-red-50' : 'group-hover:bg-red-50'
              }`}>
                <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-sm tabular-nums">{post.likes_count}</span>
            </button>
            
            <button className="group text-gray-500 hover:text-blue-600 transition-colors">
              <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                <Share className="w-5 h-5" />
              </div>
            </button>
            
            <button className={`group transition-colors ${
              post.is_bookmarked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
            }`}>
              <div className={`p-2 rounded-full transition-colors ${
                post.is_bookmarked ? 'bg-blue-50' : 'group-hover:bg-blue-50'
              }`}>
                <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default memo(PostCard)