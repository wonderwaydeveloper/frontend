'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AuthStorage } from '@/lib/auth-storage'
import toast from 'react-hot-toast'

export default function SocialCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token')
      const requiresAgeVerification = searchParams.get('requires_age_verification') === 'true'
      const requiresDeviceVerification = searchParams.get('requires_device_verification') === 'true'
      const fingerprint = searchParams.get('fingerprint')
      const error = searchParams.get('error')
      const provider = searchParams.get('provider') || 'google'

      if (error) {
        if (error === 'social_auth_failed') {
          toast.error('Google authentication failed. Please try again.')
        } else {
          toast.error('Social authentication failed')
        }
        router.push('/login')
        return
      }

      if (requiresDeviceVerification && fingerprint) {
        toast.success('Authentication successful! Please verify your device.')
        router.push(`/device-verification?fingerprint=${fingerprint}`)
        return
      }

      if (token) {
        try {
          // Validate token format before storing
          if (typeof token === 'string' && token.length > 10) {
            AuthStorage.setToken(token)
          } else {
            throw new Error('Invalid token format')
          }
          
          if (requiresAgeVerification) {
            toast.success('Authentication successful! Please complete your profile.')
            router.push('/age-verification')
          } else {
            toast.success('Successfully signed in with Google!')
            router.push('/timeline')
          }
        } catch (authError: any) {
          console.error('Auth error:', authError)
          toast.error('Authentication failed. Please try again.')
          router.push('/login')
        }
      } else {
        toast.error('No authentication token received')
        router.push('/login')
      }
    }

    handleAuth()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google authentication...</p>
        <p className="mt-2 text-sm text-gray-500">Please wait while we sign you in</p>
      </div>
    </div>
  )
}