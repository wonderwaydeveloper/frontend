'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
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

  const isAuthenticated = !!user && !requires2FA && !requiresAgeVerification

  const fetchUser = useCallback(async () => {
    try {
      const userData = await AuthAPI.getCurrentUser()
      setUser(userData)
      
      // Check if age verification is needed
      if (!userData.date_of_birth && (userData.google_id || userData.apple_id)) {
        setRequiresAgeVerification(true)
      }
      
      return userData
    } catch (error: any) {
      if (error.response?.status === 401) {
        AuthStorage.clearAuth()
        setUser(null)
      }
      throw error
    }
  }, [])

  const refreshUser = useCallback(async () => {
    if (!AuthStorage.isAuthenticated()) return
    
    try {
      await fetchUser()
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [fetchUser])

  useEffect(() => {
    const initAuth = async () => {
      if (AuthStorage.isAuthenticated()) {
        try {
          await fetchUser()
        } catch (error) {
          console.error('Auth initialization failed:', error)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [fetchUser])

  // Auto-refresh user data periodically
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(refreshUser, 5 * 60 * 1000) // 5 minutes
    return () => clearInterval(interval)
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