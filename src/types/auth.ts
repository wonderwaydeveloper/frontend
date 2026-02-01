// Authentication related types
export interface User {
  id: number
  name: string
  username: string
  email: string
  phone?: string
  email_verified_at?: string
  phone_verified_at?: string
  date_of_birth?: string
  avatar?: string
  is_child?: boolean
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  login: string
  password: string
}

export interface RegistrationData {
  name: string
  username: string
  email?: string
  phone?: string
  password: string
  password_confirmation: string
  date_of_birth: string
}

export interface AuthResponse {
  user: User
  token: string
  message?: string
  requires_2fa?: boolean
  requires_device_verification?: boolean
  requires_age_verification?: boolean
  fingerprint?: string
  resend_available_at?: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
}

export interface Device {
  id: number
  device_name: string
  device_type: string
  browser: string
  os: string
  ip_address: string
  location?: string
  is_current?: boolean
  is_trusted: boolean
  last_activity: string
  created_at: string
}

export interface SecurityEvent {
  id: number
  event_type: string
  ip_address: string
  user_agent: string
  metadata: any
  created_at: string
}

export interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  allow_mentions: boolean
  allow_direct_messages: 'everyone' | 'followers' | 'none'
  show_online_status: boolean
  allow_tagging: boolean
  search_visibility: boolean
  analytics_tracking: boolean
  data_sharing: boolean
}