import api from './api'
import { AuthStorage } from './auth-storage'

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
  session_id: string
  code: string
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
  static async registerStep1(data: MultiStepRegistrationData) {
    const response = await api.post('/auth/register/step1', data)
    return response.data
  }

  static async registerStep2(sessionId: string, code: string) {
    const response = await api.post('/auth/register/step2', {
      session_id: sessionId,
      code
    })
    return response.data
  }

  static async registerStep3(data: CompleteRegistrationData) {
    const response = await api.post('/auth/register/step3', data)
    return response.data
  }

  static async registerResendCode(sessionId: string) {
    const response = await api.post('/auth/register/resend-code', { session_id: sessionId })
    return response.data
  }

  // Login methods
  static async login(data: LoginData) {
    const response = await api.post('/auth/login', data)
    return response.data
  }

  // Phone authentication - CORRECTED
  static async phoneLoginSendCode(phone: string) {
    const response = await api.post('/auth/phone/login/send-code', { phone })
    return response.data
  }

  static async phoneLoginVerifyCode(sessionId: string, code: string) {
    const response = await api.post('/auth/phone/login/verify-code', {
      session_id: sessionId,
      code
    })
    return response.data
  }

  static async phoneLoginResendCode(sessionId: string) {
    const response = await api.post('/auth/phone/login/resend-code', { session_id: sessionId })
    return response.data
  }

  // Social authentication
  static getSocialAuthUrl(provider: 'google' | 'apple') {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/social/${provider}`
  }

  static async handleSocialCallback(provider: string, code: string, state?: string) {
    const response = await api.get(`/auth/social/${provider}/callback`, {
      params: { code, state }
    })
    return response.data
  }

  static async completeAgeVerification(dateOfBirth: string) {
    const response = await api.post('/auth/social/complete-age-verification', {
      date_of_birth: dateOfBirth
    })
    return response.data
  }

  // Password management
  static async forgotPassword(email: string) {
    const response = await api.post('/auth/password/forgot', { email })
    return response.data
  }

  static async resendResetCode(email: string) {
    const response = await api.post('/auth/password/resend', { email })
    return response.data
  }

  static async verifyResetCode(email: string, code: string) {
    const response = await api.post('/auth/password/verify-code', { email, code })
    return response.data
  }

  static async resetPassword(email: string, code: string, password: string, passwordConfirmation: string) {
    const response = await api.post('/auth/password/reset', {
      email,
      code,
      password,
      password_confirmation: passwordConfirmation
    })
    return response.data
  }

  static async changePassword(currentPassword: string, password: string, passwordConfirmation: string) {
    const response = await api.post('/auth/password/change', {
      current_password: currentPassword,
      password,
      password_confirmation: passwordConfirmation
    })
    return response.data
  }

  // Email verification (FIXED)
  static async verifyEmail(email: string, code: string) {
    const response = await api.post('/auth/email/verify', { email, code })
    return response.data
  }

  static async resendEmailVerification(email: string) {
    const response = await api.post('/auth/email/resend', { email })
    return response.data
  }

  static async getEmailVerificationStatus() {
    const response = await api.get('/auth/email/status')
    return response.data
  }

  // Two-factor authentication
  static async enable2FA(password: string): Promise<TwoFactorSetup> {
    const response = await api.post('/auth/2fa/enable', { password })
    return response.data
  }

  static async verify2FA(code: string): Promise<{ backup_codes: string[] }> {
    const response = await api.post('/auth/2fa/verify', { code })
    return response.data
  }

  static async disable2FA(password: string) {
    const response = await api.post('/auth/2fa/disable', { password })
    return response.data
  }

  // Device management
  static async registerDevice(deviceInfo: DeviceInfo) {
    const response = await api.post('/devices/advanced/register', deviceInfo)
    return response.data
  }

  static async getDevices() {
    const response = await api.get('/devices/list')
    return response.data
  }

  static async getDeviceActivity(deviceId: string) {
    const response = await api.get(`/devices/${deviceId}/activity`)
    return response.data
  }

  static async trustDevice(deviceId: string) {
    const response = await api.post(`/devices/${deviceId}/trust`)
    return response.data
  }

  static async revokeDevice(deviceId: string) {
    const response = await api.delete(`/devices/${deviceId}/revoke`)
    return response.data
  }

  static async revokeAllDevices() {
    const response = await api.post('/devices/revoke-all')
    return response.data
  }

  static async checkSuspiciousActivity() {
    const response = await api.get('/devices/security-check')
    return response.data
  }

  // Device verification
  static async verifyDevice(code: string, fingerprint: string) {
    const response = await api.post('/auth/verify-device', { code, fingerprint })
    return response.data
  }

  // Security events
  static async getSecurityEvents() {
    const response = await api.get('/auth/security/events')
    return response.data
  }

  // Session management
  static async getCurrentUser() {
    const response = await api.get('/auth/me')
    return response.data
  }

  static async logout() {
    const response = await api.post('/auth/logout')
    AuthStorage.clearAuth()
    return response.data
  }

  static async logoutAll() {
    const response = await api.post('/auth/logout-all')
    AuthStorage.clearAuth()
    return response.data
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