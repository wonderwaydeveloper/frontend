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
    <div className="flex flex-col h-full w-full px-2 py-1">
      {/* Logo */}
      <div className="p-3 mb-2">
        <div className="flex items-center justify-center lg:justify-start">
          <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center hover:bg-green-700 transition-colors cursor-pointer">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-3 rounded-full text-lg transition-all duration-200',
                isActive 
                  ? 'font-bold text-green-600' 
                  : 'font-normal text-gray-700 hover:bg-gray-50'
              )}
            >
              <div className="flex items-center justify-center lg:justify-start w-full">
                <Icon className={cn(
                  'h-6 w-6 flex-shrink-0',
                  isActive ? 'text-green-600' : 'text-gray-700'
                )} />
                <span className={cn(
                  'hidden lg:block ml-5 text-lg',
                  isActive ? 'font-bold text-green-600' : 'font-normal text-gray-700'
                )}>{item.name}</span>
              </div>
            </Link>
          )
        })}
        
        {/* Separator */}
        <div className="mx-3 my-2 border-t border-gray-200"></div>
        
        {/* Logout Button */}
        <button 
          onClick={logout}
          className="group flex items-center w-full px-3 py-3 rounded-full text-lg transition-all duration-200 hover:bg-red-50 text-red-600"
        >
          <div className="flex items-center justify-center lg:justify-start w-full">
            <LogOut className="h-6 w-6 flex-shrink-0 text-red-600" />
            <span className="hidden lg:block ml-5 text-lg font-normal text-red-600">Logout</span>
          </div>
        </button>
      </nav>
    </div>
  )
}