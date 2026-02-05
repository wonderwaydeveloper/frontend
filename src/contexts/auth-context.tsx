'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AuthAPI } from '@/lib/auth-api'
import { AuthStorage } from '@/lib/auth-storage'
import type { AuthUser } from '@/types'
import toast from 'react-hot-toast'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  requires2FA: boolean
  requiresAgeVerification: boolean
  login: (token?: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  updateUser: (user: AuthUser) => void
  refreshUser: () => Promise<void>
  setRequires2FA: (value: boolean) => void
  setRequiresAgeVerification: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requires2FA, setRequires2FA] = useState(false)
  const [requiresAgeVerification, setRequiresAgeVerification] = useState(false)
  const router = useRouter()
  
  // Race condition prevention
  const fetchUserRef = useRef<Promise<any> | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isAuthenticated = !!user && !requires2FA && !requiresAgeVerification

  const fetchUser = useCallback(async () => {
    // Prevent concurrent fetchUser calls
    if (fetchUserRef.current) {
      return fetchUserRef.current
    }
    
    try {
      fetchUserRef.current = AuthAPI.getCurrentUser()
      const userData = await fetchUserRef.current
      setUser(userData)
      
      // Check if age verification is needed
      if (!userData.date_of_birth && (userData.google_id || userData.apple_id)) {
        setRequiresAgeVerification(true)
      }
      
      return userData
    } catch (error: any) {
      console.error('fetchUser error:', error)
      if (error.response?.status === 401) {
        console.log('401 error - clearing auth')
        AuthStorage.clearAuth()
        setUser(null)
      } else if (error.response?.status === 429) {
        // Rate limit - don't logout user, just log error
        console.warn('Rate limit exceeded, skipping user refresh')
        return null
      } else if (error.message === 'NEW_DEVICE_DETECTED') {
        // Handle device verification for social login - throw specific error
        const fingerprint = AuthAPI.generateDeviceFingerprint()
        router.push(`/device-verification?fingerprint=${fingerprint}`)
        throw new Error('DEVICE_VERIFICATION_REQUIRED')
      } else {
        // For network errors, clear invalid tokens
        console.log('Network/other error - clearing auth')
        AuthStorage.clearAuth()
        setUser(null)
      }
      throw error
    } finally {
      fetchUserRef.current = null
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    if (!AuthStorage.isAuthenticated()) return
    
    try {
      await fetchUser()
    } catch (error: any) {
      // Don't log rate limit errors to avoid spam
      if (error.response?.status !== 429) {
        console.error('Failed to refresh user:', error)
      }
    }
  }, [fetchUser])

  useEffect(() => {
    const initAuth = async () => {
      // Don't fetch user on device verification page
      if (window.location.pathname.includes('/device-verification')) {
        setIsLoading(false)
        return
      }
      
      if (AuthStorage.isAuthenticated()) {
        try {
          await fetchUser()
        } catch (error: any) {
          if (error.message === 'DEVICE_VERIFICATION_REQUIRED') {
            // Device verification is already handled in fetchUser, just set loading to false
            setIsLoading(false)
            return
          }
          console.error('Auth initialization failed:', error)
          // Clear invalid token
          AuthStorage.clearAuth()
        }
      }
      setIsLoading(false)
    }

    initAuth()
    
    // Listen for storage changes (for social login)
    const handleStorageChange = () => {
      if (window.location.pathname.includes('/device-verification')) {
        return // Don't fetch on device verification page
      }
      if (AuthStorage.isAuthenticated() && !user && !fetchUserRef.current) {
        fetchUser().catch(() => {}) // Silent catch
      }
    }

    // Refresh when user returns to tab (Twitter-style)
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && !fetchUserRef.current) {
        // User returned to tab - refresh user data
        refreshUser()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // DISABLED: Check for token changes - causes rate limiting
    // if (intervalRef.current) {
    //   clearInterval(intervalRef.current)
    // }
    // 
    // intervalRef.current = setInterval(() => {
    //   if (window.location.pathname.includes('/device-verification')) {
    //     return
    //   }
    //   if (AuthStorage.isAuthenticated() && !user && !isLoading && !fetchUserRef.current) {
    //     fetchUser().catch(() => {})
    //   }
    // }, 30000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchUser, user, isLoading])

  // Smart refresh: Only when user becomes active after being idle
  useEffect(() => {
    if (!isAuthenticated) return

    let isIdle = false
    let idleTimer: NodeJS.Timeout

    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      if (isIdle) {
        // User became active after being idle - refresh user data
        isIdle = false
        refreshUser()
      }
      // Set user as idle after 5 minutes of inactivity
      idleTimer = setTimeout(() => {
        isIdle = true
      }, 5 * 60 * 1000)
    }

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    // Initial timer
    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [isAuthenticated, refreshUser])

  const login = async (token?: string) => {
    try {
      setIsLoading(true)
      
      // If token is provided, store it first
      if (token) {
        AuthStorage.setToken(token)
      }
      
      const userData = await fetchUser()
      
      // Check for 2FA requirement
      if (userData.two_factor_enabled && !token) {
        setRequires2FA(true)
        return
      }
      
      // Check for age verification requirement
      if (!userData.date_of_birth && (userData.google_id || userData.apple_id)) {
        setRequiresAgeVerification(true)
        return
      }
      
      setRequires2FA(false)
      setRequiresAgeVerification(false)
      
      // Register device for security
      try {
        const deviceInfo = AuthAPI.getDeviceInfo()
        await AuthAPI.registerAdvancedDevice(deviceInfo)
      } catch (error) {
        console.warn('Device registration failed:', error)
      }
      
      router.push('/timeline')
      toast.success('Welcome!')
    } catch (error: any) {
      AuthStorage.clearAuth()
      setUser(null)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    if (!confirm('Are you sure you want to logout?')) {
      return
    }
    
    try {
      await AuthAPI.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
    
    AuthStorage.clearAuth()
    setUser(null)
    setRequires2FA(false)
    setRequiresAgeVerification(false)
    router.push('/login')
    toast.success('Logged out successfully')
  }

  const logoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices?')) {
      return
    }
    
    try {
      await AuthAPI.logoutAll()
    } catch (error) {
      console.error('Logout all failed:', error)
      toast.error('Failed to logout from all devices')
    }
    
    AuthStorage.clearAuth()
    setUser(null)
    setRequires2FA(false)
    setRequiresAgeVerification(false)
    router.push('/login')
    toast.success('Logged out from all devices')
  }

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
    
    // Update verification states
    if (updatedUser.date_of_birth) {
      setRequiresAgeVerification(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    requires2FA,
    requiresAgeVerification,
    login,
    logout,
    logoutAll,
    updateUser,
    refreshUser,
    setRequires2FA,
    setRequiresAgeVerification
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}