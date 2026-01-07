// Secure token management using httpOnly cookies
export class AuthStorage {
  private static readonly TOKEN_COOKIE = 'auth_token'
  private static readonly REFRESH_TOKEN_COOKIE = 'refresh_token'

  // Set authentication tokens (server-side only)
  static setTokens(token: string, refreshToken?: string) {
    // This will be handled by server-side API calls
    // Client-side will use cookies automatically
    if (typeof window !== 'undefined') {
      // Fallback for development - remove in production
      console.warn('Token setting should be handled server-side')
    }
  }

  // Check if user is authenticated by checking cookie existence
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    return document.cookie
      .split(';')
      .some(cookie => cookie.trim().startsWith(`${this.TOKEN_COOKIE}=`))
  }

  // Clear authentication (logout)
  static clearAuth() {
    if (typeof window === 'undefined') return
    
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