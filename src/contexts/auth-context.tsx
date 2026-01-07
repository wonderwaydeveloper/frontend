'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { AuthStorage } from '@/lib/auth-storage'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: () => void
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (AuthStorage.isAuthenticated()) {
      fetchUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
    } catch (error) {
      AuthStorage.clearAuth()
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data)
      router.push('/timeline')
    } catch (error) {
      AuthStorage.clearAuth()
      throw error
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Continue with logout even if API call fails
    }
    AuthStorage.clearAuth()
    setUser(null)
    router.push('/login')
  }

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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