'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { LoadingPage } from '@/components/ui/loading'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !user) {
        router.replace(redirectTo)
      } else if (!requireAuth && user) {
        router.replace('/timeline')
      }
    }
  }, [user, isLoading, requireAuth, redirectTo, router])

  if (isLoading) {
    return <LoadingPage />
  }

  if (requireAuth && !user) {
    return <LoadingPage />
  }

  if (!requireAuth && user) {
    return <LoadingPage />
  }

  return <>{children}</>
}