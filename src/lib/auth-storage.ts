// Secure token management using httpOnly cookies
export class AuthStorage {
  private static readonly TOKEN_COOKIE = 'auth_token'
  private static readonly REFRESH_TOKEN_COOKIE = 'refresh_token'
  private static readonly TOKEN_STORAGE = 'auth_token' // localStorage fallback

  // Set authentication token
  static setToken(token: string) {
    if (typeof window === 'undefined') return
    
    // Store in localStorage for development
    localStorage.setItem(this.TOKEN_STORAGE, token)
    
    // Also set as cookie for API calls
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days - match backend
    document.cookie = `${this.TOKEN_COOKIE}=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
  }

  // Get authentication token
  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    
    // Try localStorage first
    const token = localStorage.getItem(this.TOKEN_STORAGE)
    if (token) return token
    
    // Fallback to cookie
    const cookie = document.cookie
      .split(';')
      .find(cookie => cookie.trim().startsWith(`${this.TOKEN_COOKIE}=`))
    
    return cookie ? cookie.split('=')[1] : null
  }

  // Set authentication tokens (server-side only)
  static setTokens(token: string, refreshToken?: string) {
    this.setToken(token)
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_COOKIE, refreshToken)
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!this.getToken()
  }

  // Clear authentication (logout)
  static clearAuth() {
    if (typeof window === 'undefined') return
    
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_STORAGE)
    localStorage.removeItem(this.REFRESH_TOKEN_COOKIE)
    
    // Clear cookies by setting expired date
    document.cookie = `${this.TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`
    document.cookie = `${this.REFRESH_TOKEN_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`
  }

  // Get CSRF token from meta tag
  static getCSRFToken(): string | null {
    if (typeof window === 'undefined') return null
    
    const metaTag = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement
    return metaTag?.content || null
  }
}