'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { AuthAPI } from '@/lib/auth-api'
import toast from 'react-hot-toast'

export default function SocialCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleAuth = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const provider = searchParams.get('provider') || 'google'

      if (error) {
        toast.error('Social authentication failed')
        router.push('/login')
        return
      }

      if (code) {
        try {
          const result = await AuthAPI.handleSocialCallback(provider, code, state || undefined)
          
          if (result.requires_age_verification) {
            router.push('/age-verification')
          } else {
            await login(result.token)
            router.push('/timeline')
          }
        } catch (authError: any) {
          if (authError.status === 422 && authError.errors) {
            toast.error('Authentication failed: ' + Object.values(authError.errors).flat().join(', '))
          } else {
            toast.error(authError.message || 'Authentication failed')
          }
          router.push('/login')
        }
      } else {
        toast.error('No authorization code received')
        router.push('/login')
      }
    }

    handleAuth()
  }, [searchParams, login, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}