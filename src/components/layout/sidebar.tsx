'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Search, 
  Bell, 
  Mail, 
  Bookmark, 
  User, 
  Settings,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

const navigation = [
  { name: 'Home', href: '/timeline', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex flex-col h-full p-4">
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">Microblogging</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-full text-lg font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <Icon className="h-6 w-6" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Post Button */}
      <button className="w-full bg-blue-600 text-white py-3 rounded-full font-bold text-lg hover:bg-blue-700 transition-colors mb-4">
        Post
      </button>

      {/* Logout */}
      <button 
        onClick={logout}
        className="flex items-center space-x-3 px-4 py-3 rounded-full text-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <LogOut className="h-6 w-6" />
        <span>Logout</span>
      </button>
    </div>
  )
}