import api from './api'
import { AuthStorage } from './auth-storage'
import toast from 'react-hot-toast'

// Error handling utility
class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// Handle API errors consistently
const handleApiError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response
    
    // Handle validation errors (422)
    if (status === 422 && data.errors) {
      throw new AuthError('Validation failed', status, data.errors)
    }
    
    // Handle rate limiting (429)
    if (status === 429) {
      const message = data.error || data.message || 'Too many requests'
      const authError = new AuthError(message, status)
      // Add rate limit data to error
      ;(authError as any).retry_after = data.retry_after
      ;(authError as any).resend_available_at = data.resend_available_at
      ;(authError as any).remaining_seconds = data.remaining_seconds
      throw authError
    }
    
    // Handle other errors with message
    const message = data.error || data.message || 'An error occurred'
    throw new AuthError(message, status)
  }
  
  // Network or other errors
  throw new AuthError('Network error. Please check your connection.', 0)
}

export interface MultiStepRegistrationData {
  name: string
  date_of_birth: string
  contact: string
  contact_type: 'email' | 'phone'
}

export interface CompleteRegistrationData {
  session_id: string
  username: string
  password: string
  password_confirmation: string
}

export interface LoginData {
  login: string
  password: string
  two_factor_code?: string
}

export interface PhoneLoginData {
  phone: string
  verification_code: string
}

export interface DeviceInfo {
  fingerprint: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  os: string
  browser: string
}

export interface TwoFactorSetup {
  secret: string
  qr_code_url: string
  backup_codes?: string[]
}

export class AuthAPI {
  // Multi-step registration
  static async registerStep1(name: string, dateOfBirth: string, contact: string, contactType: 'email' | 'phone') {
    try {
      const response = await api.post('/auth/register/step1', {
        name,
        date_of_birth: dateOfBirth,
        contact,
        contact_type: contactType
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async registerStep2(sessionId: string, code: string) {
    try {
      const response = await api.post('/auth/register/step2', {
        session_id: sessionId,
        code
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async registerStep3(sessionId: string, username: string, password: string, passwordConfirmation: string) {
    try {
      const response = await api.post('/auth/register/step3', {
        session_id: sessionId,
        username,
        password,
        password_confirmation: passwordConfirmation
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async resendRegistrationCode(sessionId: string) {
    try {
      const response = await api.post('/auth/register/resend-code', { session_id: sessionId })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Login methods
  static async login(data: LoginData) {
    try {
      const response = await api.post('/auth/login', data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Phone login methods
  static async phoneLoginSendCode(phone: string) {
    try {
      const response = await api.post('/auth/phone/login/send-code', { phone })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async phoneLoginVerifyCode(sessionId: string, code: string) {
    try {
      const response = await api.post('/auth/phone/login/verify-code', {
        session_id: sessionId,
        code: code
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async phoneLoginResendCode(sessionId: string) {
    try {
      const response = await api.post('/auth/phone/login/resend-code', { session_id: sessionId })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Social authentication
  static getSocialAuthUrl(provider: 'google') {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/social/${provider}`
  }

  static async handleSocialCallback(provider: string, code: string, state?: string) {
    try {
      const response = await api.get(`/auth/social/${provider}/callback`, {
        params: { code, state }
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async completeAgeVerification(dateOfBirth: string) {
    try {
      const response = await api.post('/auth/social/complete-age-verification', {
        date_of_birth: dateOfBirth
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Password management
  static async forgotPassword(email: string) {
    try {
      const response = await api.post('/auth/password/forgot', { email })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async verifyPasswordResetCode(email: string, code: string) {
    try {
      const response = await api.post('/auth/password/verify-code', { email, code })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async resendPasswordReset(email: string) {
    try {
      const response = await api.post('/auth/password/resend', { email })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async resetPassword(email: string, code: string, password: string, passwordConfirmation: string) {
    try {
      const response = await api.post('/auth/password/reset', {
        email,
        code,
        password,
        password_confirmation: passwordConfirmation
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async changePassword(currentPassword: string, password: string, passwordConfirmation: string) {
    try {
      const response = await api.post('/auth/password/change', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Email verification
  static async verifyEmail(email: string, code: string) {
    try {
      const response = await api.post('/auth/email/verify', { email, code })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async resendEmailVerification(email: string) {
    try {
      const response = await api.post('/auth/email/resend', { email })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async getEmailVerificationStatus() {
    try {
      const response = await api.get('/auth/email/status')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Two-factor authentication
  static async enable2FA(password: string): Promise<TwoFactorSetup> {
    try {
      const response = await api.post('/auth/2fa/enable', { password })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async verify2FA(code: string): Promise<{ backup_codes: string[] }> {
    try {
      const response = await api.post('/auth/2fa/verify', { code })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async disable2FA(password: string) {
    try {
      const response = await api.post('/auth/2fa/disable', { password })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Phone registration - using multi-step registration instead
  static async phoneRegisterStep1(data: {
    name: string
    date_of_birth: string
    phone: string
  }) {
    try {
      const response = await api.post('/auth/register/step1', {
        name: data.name,
        date_of_birth: data.date_of_birth,
        contact: data.phone,
        contact_type: 'phone'
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async phoneRegisterStep2(sessionId: string, code: string) {
    try {
      const response = await api.post('/auth/register/step2', {
        session_id: sessionId,
        code
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async phoneRegisterStep3(data: {
    session_id: string
    username: string
    password: string
    password_confirmation: string
    email?: string
  }) {
    try {
      const response = await api.post('/auth/register/step3', data)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Device verification
  static async verifyDevice(code: string, fingerprint: string) {
    try {
      const response = await api.post('/auth/verify-device', {
        code,
        fingerprint
      })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async resendDeviceCode(fingerprint: string, userId?: string) {
    try {
      const payload: any = { fingerprint }
      
      // Try to get user_id from URL params or localStorage
      if (userId) {
        payload.user_id = userId
      } else {
        // Try to get from URL params
        const urlParams = new URLSearchParams(window.location.search)
        const userIdFromUrl = urlParams.get('user_id')
        if (userIdFromUrl) {
          payload.user_id = parseInt(userIdFromUrl)
        }
      }
      
      const response = await api.post('/auth/resend-device-code', payload)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Security events
  static async getSecurityEvents() {
    try {
      const response = await api.get('/auth/security/events')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async getDevices() {
    try {
      const response = await api.get('/devices/list')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async trustDevice(deviceId: string, password: string) {
    try {
      const response = await api.post(`/devices/${deviceId}/trust`, { password })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async revokeDevice(deviceId: string) {
    try {
      const response = await api.delete(`/devices/${deviceId}/revoke`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async revokeAllDevices(password: string) {
    try {
      const response = await api.post('/devices/revoke-all', { password })
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Advanced device management
  static async registerAdvancedDevice(deviceInfo: DeviceInfo) {
    try {
      const response = await api.post('/devices/advanced/register', deviceInfo)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async getDeviceActivity(deviceId: string) {
    try {
      const response = await api.get(`/devices/${deviceId}/activity`)
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async checkSuspiciousActivity() {
    try {
      const response = await api.get('/devices/security-check')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Session management
  static async getCurrentUser() {
    try {
      const response = await api.get('/auth/me')
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async logout() {
    try {
      const response = await api.post('/auth/logout')
      AuthStorage.clearAuth()
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  static async logoutAll() {
    try {
      const response = await api.post('/auth/logout-all')
      AuthStorage.clearAuth()
      return response.data
    } catch (error) {
      return handleApiError(error)
    }
  }

  // Security utilities
  static generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx?.fillText('Device fingerprint', 10, 10)
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|')
    
    return btoa(fingerprint).slice(0, 32)
  }

  static getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent
    
    return {
      fingerprint: this.generateDeviceFingerprint(),
      name: this.getDeviceName(),
      type: this.getDeviceType(),
      os: this.getOS(),
      browser: this.getBrowser()
    }
  }

  private static getDeviceName(): string {
    const userAgent = navigator.userAgent
    if (/iPhone/.test(userAgent)) return 'iPhone'
    if (/iPad/.test(userAgent)) return 'iPad'
    if (/Android/.test(userAgent)) return 'Android Device'
    if (/Mac/.test(userAgent)) return 'Mac'
    if (/Windows/.test(userAgent)) return 'Windows PC'
    return 'Unknown Device'
  }

  private static getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const userAgent = navigator.userAgent
    if (/Mobile|Android|iPhone/.test(userAgent)) return 'mobile'
    if (/iPad|Tablet/.test(userAgent)) return 'tablet'
    return 'desktop'
  }

  private static getOS(): string {
    const userAgent = navigator.userAgent
    if (/Windows/.test(userAgent)) return 'Windows'
    if (/Mac/.test(userAgent)) return 'macOS'
    if (/Linux/.test(userAgent)) return 'Linux'
    if (/Android/.test(userAgent)) return 'Android'
    if (/iOS/.test(userAgent)) return 'iOS'
    return 'Unknown'
  }

  private static getBrowser(): string {
    const userAgent = navigator.userAgent
    if (/Chrome/.test(userAgent)) return 'Chrome'
    if (/Firefox/.test(userAgent)) return 'Firefox'
    if (/Safari/.test(userAgent)) return 'Safari'
    if (/Edge/.test(userAgent)) return 'Edge'
    return 'Unknown'
  }
}