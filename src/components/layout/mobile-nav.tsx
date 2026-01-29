'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, Bell, Mail, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const mobileNavigation = [
  { name: 'Home', href: '/timeline', icon: Home },
  { name: 'Search', href: '/explore', icon: Search },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: Mail },
  { name: 'Profile', href: '/profile', icon: User },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <nav className="flex justify-around items-center h-16">
        {mobileNavigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-0 flex-1',
                isActive
                  ? 'text-green-600'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-normal truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}