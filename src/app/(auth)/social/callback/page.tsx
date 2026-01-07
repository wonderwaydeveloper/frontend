'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function SocialCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')

    if (error) {
      router.push('/login?error=social_auth_failed')
      return
    }

    if (token) {
      login(token)
      router.push('/timeline')
    } else {
      router.push('/login')
    }
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}