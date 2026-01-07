'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { sanitizeInput, validateField, calculatePasswordStrength } from '@/lib/validation-helpers'

interface AuthCardProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {subtitle && (
          <p className="mt-3 text-sm text-gray-600">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  )
}

interface AuthInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  error?: string[]
  fieldType?: 'email' | 'password' | 'username' | 'phone' | 'code' | 'login'
  showStrength?: boolean
  onChange?: (value: string) => void
}

export function AuthInput({ 
  label, 
  error, 
  fieldType,
  showStrength = false,
  onChange,
  className = '', 
  value = '',
  ...props 
}: AuthInputProps) {
  const [realTimeErrors, setRealTimeErrors] = useState<string[]>([])
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] })
  const [showPassword, setShowPassword] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e?.target) return
    
    let sanitizedValue = e.target.value
    
    // Apply sanitization based on field type
    if (fieldType === 'login') {
      sanitizedValue = sanitizeInput.login(sanitizedValue)
    } else if (fieldType === 'phone') {
      sanitizedValue = sanitizeInput.phone(sanitizedValue)
    } else if (fieldType === 'code') {
      sanitizedValue = sanitizeInput.code(sanitizedValue)
    } else if (fieldType === 'username') {
      sanitizedValue = sanitizeInput.username(sanitizedValue)
    }
    
    // Real-time validation
    if (fieldType && ['email', 'password', 'username'].includes(fieldType)) {
      const errors = validateField[fieldType as keyof typeof validateField]?.(sanitizedValue) || []
      setRealTimeErrors(errors)
    }
    
    // Password strength calculation
    if (fieldType === 'password' && showStrength) {
      const strength = calculatePasswordStrength(sanitizedValue)
      setPasswordStrength(strength)
    }
    
    onChange?.(sanitizedValue)
  }
  
  const displayErrors = error && error.length > 0 ? error : realTimeErrors
  const hasErrors = displayErrors.length > 0
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <input
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-gray-900 placeholder-gray-400 ${
            hasErrors ? 'border-red-300' : 'border-gray-300'
          } ${fieldType === 'password' ? 'pr-12' : ''} ${className}`}
          type={fieldType === 'password' && !showPassword ? 'password' : props.type || 'text'}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {fieldType === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
      </div>
      
      {/* Password Strength Indicator */}
      {fieldType === 'password' && showStrength && value && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  passwordStrength.score < 30 ? 'bg-red-500' :
                  passwordStrength.score < 60 ? 'bg-yellow-500' :
                  passwordStrength.score < 80 ? 'bg-blue-500' : 'bg-green-500'
                }`}
                style={{ width: `${passwordStrength.score}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {passwordStrength.score < 30 ? 'Weak' :
               passwordStrength.score < 60 ? 'Fair' :
               passwordStrength.score < 80 ? 'Good' : 'Strong'}
            </span>
          </div>
          {passwordStrength.feedback.length > 0 && (
            <div className="text-xs text-gray-500">
              {passwordStrength.feedback.join(', ')}
            </div>
          )}
        </div>
      )}
      
      {/* Error Messages */}
      {hasErrors && (
        <div className="text-sm text-red-600 space-y-1">
          {displayErrors.map((err, index) => (
            <div key={index}>{err}</div>
          ))}
        </div>
      )}
    </div>
  )
}

interface AuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: 'primary' | 'secondary'
}

export function AuthButton({ 
  children, 
  loading, 
  variant = 'primary', 
  className = '', 
  ...props 
}: AuthButtonProps) {
  const baseClasses = 'w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50'
  const variantClasses = {
    primary: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500'
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-3 bg-white text-gray-500">{text}</span>
      </div>
    </div>
  )
}

export function SocialButton({ provider, href }: { provider: 'google' | 'apple'; href: string }) {
  const icons = {
    google: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    apple: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    )
  }

  return (
    <a
      href={href}
      className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {icons[provider]}
      <span className="ml-3">{provider}</span>
    </a>
  )
}