'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthAPI, TwoFactorSetup } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton } from './auth-components'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { BackupCodesManager } from './backup-codes-manager'
import toast from 'react-hot-toast'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'password' | 'setup' | 'verify' | 'backup'>('password')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [twoFactorData, setTwoFactorData] = useState<TwoFactorSetup | null>(null)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const enableMutation = useMutation({
    mutationFn: (password: string) => AuthAPI.enable2FA(password),
    onSuccess: (data) => {
      setTwoFactorData(data)
      setStep('setup')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        toast.error(Object.values(error.errors).flat().join(', '))
      } else {
        toast.error(error.message || 'Failed to enable 2FA')
      }
    }
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => AuthAPI.verify2FA(code),
    onSuccess: (data) => {
      setBackupCodes(data.backup_codes)
      setStep('backup')
      toast.success('Two-factor authentication enabled successfully!')
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        toast.error(Object.values(error.errors).flat().join(', '))
      } else {
        toast.error(error.message || 'Invalid verification code')
      }
    }
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    enableMutation.mutate(password)
  }

  const handleVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (verificationCode.length !== 6) return
    verifyMutation.mutate(verificationCode)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  const downloadBackupCodes = () => {
    const content = `Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${backupCodes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (step === 'password') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Enable Two-Factor Authentication</h1>
              <p className="text-sm text-gray-600">Enter your password to continue</p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-6">
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <AuthInput
              label="Current Password"
              type="password"
              placeholder="Enter your current password"
              value={password}
              onChange={setPassword}
              required
            />
            
            <div className="flex space-x-3">
              <AuthButton 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </AuthButton>
              <AuthButton 
                type="submit" 
                loading={enableMutation.isPending}
                className="flex-1"
              >
                Continue
              </AuthButton>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'setup' && twoFactorData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onCancel}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Set up Authenticator App</h1>
              <p className="text-sm text-gray-600">Scan the QR code with your authenticator app</p>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-6 space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <QRCodeSVG value={twoFactorData.qr_code_url} size={200} />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Or enter this code manually:
            </label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono">
                {twoFactorData.secret}
              </code>
              <button
                type="button"
                onClick={() => copyToClipboard(twoFactorData.secret)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <AuthInput
              label="Verification Code"
              type="text"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest"
              value={verificationCode}
              onChange={(value) => setVerificationCode(value.replace(/\D/g, ''))}
              required
            />
            
            <div className="flex space-x-3">
              <AuthButton 
                type="button" 
                variant="secondary" 
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </AuthButton>
              <AuthButton 
                type="submit" 
                loading={verifyMutation.isPending}
                disabled={verificationCode.length !== 6}
                className="flex-1"
              >
                Verify & Enable
              </AuthButton>
            </div>
          </form>
        </div>
      </div>
    )
  }

  if (step === 'backup' && backupCodes.length > 0) {
    return (
      <BackupCodesManager
        codes={backupCodes}
        onClose={onComplete}
      />
    )
  }

  return null
}

interface TwoFactorDisableProps {
  onComplete: () => void
  onCancel: () => void
}

export function TwoFactorDisable({ onComplete, onCancel }: TwoFactorDisableProps) {
  const [password, setPassword] = useState('')

  const disableMutation = useMutation({
    mutationFn: (password: string) => AuthAPI.disable2FA(password),
    onSuccess: () => {
      toast.success('Two-factor authentication disabled')
      onComplete()
    },
    onError: (error: any) => {
      if (error.status === 422 && error.errors) {
        toast.error(Object.values(error.errors).flat().join(', '))
      } else {
        toast.error(error.message || 'Failed to disable 2FA')
      }
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    disableMutation.mutate(password)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Disable Two-Factor Authentication</h1>
            <p className="text-sm text-gray-600">Enter your password to disable 2FA</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Security Warning
              </h3>
              <p className="mt-1 text-sm text-red-700">
                Disabling two-factor authentication will make your account less secure.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Current Password"
            type="password"
            placeholder="Enter your current password"
            value={password}
            onChange={setPassword}
            required
          />
          
          <div className="flex space-x-3">
            <AuthButton 
              type="button" 
              variant="secondary" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </AuthButton>
            <AuthButton 
              type="submit" 
              loading={disableMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Disable 2FA
            </AuthButton>
          </div>
        </form>
      </div>
    </div>
  )
}