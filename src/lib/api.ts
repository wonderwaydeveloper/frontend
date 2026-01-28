import axios from 'axios'
import toast from 'react-hot-toast'
import { AuthStorage } from './auth-storage'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
  withCredentials: true, // Enable cookies
})

// Request interceptor for CSRF and security
api.interceptors.request.use(
  async (config) => {
    // Add Bearer token if available
    const token = AuthStorage.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Get CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      try {
        // Get CSRF token from Laravel Sanctum
        const csrfResponse = await axios.get(`${API_BASE_URL.replace('/api', '')}/sanctum/csrf-cookie`, {
          withCredentials: true
        })
        
        // Extract CSRF token from cookie
        const csrfToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1]
        
        if (csrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(csrfToken)
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error)
      }
    }
    return config
  },
  (error) => {
    toast.error('Request failed')
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors and success messages
api.interceptors.response.use(
  (response) => {
    // Show success message if provided
    if (response.data?.message && response.config.method !== 'get') {
      toast.success(response.data.message)
    }
    return response
  },
  (error) => {
    const { response } = error
    
    if (response?.status === 419) {
      // CSRF token mismatch
      toast.error('Security token expired. Please refresh the page.')
      window.location.reload()
      return Promise.reject(error)
    }
    
    if (response?.status === 401) {
      AuthStorage.clearAuth()
      toast.error('Session expired. Please login again.')
      window.location.href = '/login'
      return Promise.reject(error)
    }
    
    if (response?.status === 422) {
      // Validation errors
      const errors = response.data?.errors
      if (errors) {
        Object.values(errors).flat().forEach((error: any) => {
          toast.error(error)
        })
      } else {
        toast.error(response.data?.error || response.data?.message || 'Validation failed')
      }
    } else if (response?.status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else if (response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    } else if (response?.data?.message) {
      toast.error(response.data.message)
    } else {
      toast.error('Something went wrong')
    }
    
    return Promise.reject(error)
  }
)

export default api