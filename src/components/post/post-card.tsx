'use client'

import { memo } from 'react'
import { Heart, MessageCircle, Repeat2, Share, Bookmark } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { Post } from '@/types'

interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  return (
    <article className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="flex space-x-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900">{post.user.name}</h3>
            {post.user.verified && (
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
            )}
            <span className="text-gray-500">@{post.user.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500">{formatRelativeTime(post.created_at)}</span>
          </div>
          
          {/* Post Content */}
          <div className="mt-2">
            <p className="text-gray-900 whitespace-pre-wrap">{post.content}</p>
            
            {/* Image */}
            {post.image && (
              <div className="mt-3 rounded-2xl overflow-hidden">
                <img 
                  src={post.image} 
                  alt="Post image" 
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            )}
            
            {/* Quoted Post */}
            {post.quoted_post && (
              <div className="mt-3 border border-gray-200 rounded-2xl p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-bold text-sm">{post.quoted_post.user.name}</span>
                  <span className="text-gray-500 text-sm">@{post.quoted_post.user.username}</span>
                </div>
                <p className="text-gray-900 text-sm">{post.quoted_post.content}</p>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mt-3 max-w-md">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">{post.comments_count}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
              <Repeat2 className="w-5 h-5" />
              <span className="text-sm">{post.quotes_count}</span>
            </button>
            
            <button className={`flex items-center space-x-2 transition-colors ${
              post.is_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}>
              <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes_count}</span>
            </button>
            
            <button className="text-gray-500 hover:text-blue-500 transition-colors">
              <Share className="w-5 h-5" />
            </button>
            
            <button className={`transition-colors ${
              post.is_bookmarked ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
            }`}>
              <Bookmark className={`w-5 h-5 ${post.is_bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

export default memo(PostCard)