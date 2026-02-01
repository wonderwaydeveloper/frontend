'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export function Breadcrumb() {
  const pathname = usePathname()
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      const isLast = index === segments.length - 1
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath
      })
    })
    
    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()
  
  if (breadcrumbs.length <= 1) return null

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="h-4 w-4" />}
          {item.href ? (
            <Link 
              href={item.href}
              className="hover:text-gray-700 transition-colors"
            >
              {index === 0 ? <Home className="h-4 w-4" /> : item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}