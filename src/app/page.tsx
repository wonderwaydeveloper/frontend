'use client'

import { useAuth } from '@/contexts/auth-context'
import { redirect } from 'next/navigation'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (user) {
    redirect('/timeline')
  } else {
    redirect('/login')
  }
}