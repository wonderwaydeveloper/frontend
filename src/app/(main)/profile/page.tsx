'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Link as LinkIcon, Settings, Bookmark, MoreHorizontal, LogOut } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import api from '@/lib/api'
import PostCard from '@/components/post/post-card'
import { useAuth } from '@/contexts/auth-context'
import type { User, Post } from '@/types'

type TabType = 'posts' | 'replies' | 'media' | 'likes'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<TabType>('posts')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/me')
      return response.data as User
    },
  })

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', user?.id, activeTab],
    queryFn: async () => {
      if (!user?.id) return []
      let endpoint = `/users/${user.id}/posts`
      
      switch (activeTab) {
        case 'replies':
          endpoint = `/users/${user.id}/replies`
          break
        case 'media':
          endpoint = `/users/${user.id}/media`
          break
        case 'likes':
          endpoint = `/users/${user.id}/likes`
          break
        default:
          endpoint = `/users/${user.id}/posts`
      }
      
      const response = await api.get(endpoint)
      const data = response.data
      return Array.isArray(data) ? data : (data?.data || data?.posts || [])
    },
    enabled: !!user?.id,
  })

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-13 text-gray-500">{user.posts_count || 0} posts</p>
            </div>
          </div>
          
          {/* Mobile Menu Button in Header */}
          <div className="sm:hidden relative" ref={menuRef}>
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-9 h-9 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            >
              <MoreHorizontal className="h-5 w-5 text-gray-900" />
            </button>
            
            {showMobileMenu && (
              <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-2xl shadow-xl py-3 w-56 z-50">
                <Link 
                  href="/settings"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Settings className="h-5 w-5 text-gray-700" />
                  <span className="text-15 text-gray-900 font-medium">Settings and privacy</span>
                </Link>
                <Link 
                  href="/bookmarks"
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <Bookmark className="h-5 w-5 text-gray-700" />
                  <span className="text-15 text-gray-900 font-medium">Bookmarks</span>
                </Link>
                <button 
                  onClick={() => {
                    setShowMobileMenu(false)
                    logout()
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3"
                >
                  <LogOut className="h-5 w-5 text-gray-700" />
                  <span className="text-15 text-gray-900 font-medium">Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="h-48 bg-gray-300 relative">
        {user.cover_photo && (
          <img src={user.cover_photo} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>
      
      {/* Profile Section */}
      <div className="px-4 pb-4">
        {/* Avatar & Buttons */}
        <div className="flex items-start justify-between -mt-16 mb-3">
          <div className="w-32 h-32 bg-white rounded-full border-4 border-white relative">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-400 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 mt-3">
            <div className="hidden sm:flex items-center space-x-2">
              <button className="w-9 h-9 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center">
                <MoreHorizontal className="h-5 w-5 text-gray-900" />
              </button>
              <button className="border border-gray-300 px-4 py-1.5 rounded-full font-bold text-15 hover:bg-gray-50 transition-colors text-gray-900">
                Message
              </button>
            </div>
            
            <Link 
              href="/settings"
              className="border border-gray-300 px-4 py-1.5 rounded-full font-bold text-15 hover:bg-gray-50 transition-colors text-gray-900"
            >
              Edit profile
            </Link>
          </div>
        </div>
        
        {/* User Info */}
        <div className="mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            {user.verified && (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          <p className="text-15 text-gray-500 mb-3">@{user.username}</p>
          
          {user.bio && (
            <p className="text-15 text-gray-900 mb-3 leading-5 whitespace-pre-wrap">{user.bio}</p>
          )}
          
          <div className="flex flex-wrap items-center gap-4 text-15 text-gray-500 mb-3">
            {user.location && (
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
            {user.website && (
              <div className="flex items-center space-x-1">
                <LinkIcon className="w-4 h-4" />
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline truncate max-w-48">
                  {user.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.created_at)}</span>
            </div>
          </div>
          
          <div className="flex space-x-5 text-15">
            <button className="hover:underline">
              <span className="font-bold text-gray-900">{user.following_count || 0}</span>
              <span className="text-gray-500 ml-1">Following</span>
            </button>
            <button className="hover:underline">
              <span className="font-bold text-gray-900">{user.followers_count || 0}</span>
              <span className="text-gray-500 ml-1">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            {id: 'posts', label: 'Posts'}, 
            {id: 'replies', label: 'Replies'}, 
            {id: 'media', label: 'Media'}, 
            {id: 'likes', label: 'Likes'}
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex-1 py-4 text-center font-medium text-15 transition-colors hover:bg-gray-50 relative ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-1 bg-green-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {postsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        ) : Array.isArray(posts) && posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-15 mb-2">No {activeTab} yet</p>
            {activeTab === 'posts' && (
              <p className="text-gray-400 text-13">When you post, it'll show up here.</p>
            )}
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