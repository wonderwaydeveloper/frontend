'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { AuthAPI, TwoFactorSetup } from '@/lib/auth-api'
import { AuthCard, AuthInput, AuthButton } from './auth-components'
import { QRCodeSVG } from 'qrcode.react'
import { Copy, Download, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface TwoFactorSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'password' | 'setup' | 'verify'>('password')
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
    }
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => AuthAPI.verify2FA(code),
    onSuccess: (data) => {
      setBackupCodes(data.backup_codes)
      setStep('verify')
      toast.success('Two-factor authentication enabled successfully!')
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
      <AuthCard 
        title="Enable Two-Factor Authentication" 
        subtitle="Enter your password to continue"
      >
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
      </AuthCard>
    )
  }

  if (step === 'setup' && twoFactorData) {
    return (
      <AuthCard 
        title="Set up Authenticator App" 
        subtitle="Scan the QR code with your authenticator app"
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
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
      </AuthCard>
    )
  }

  if (step === 'verify' && backupCodes.length > 0) {
    return (
      <AuthCard 
        title="Save Your Backup Codes" 
        subtitle="Store these codes safely. Each can only be used once."
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important: Save these backup codes
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  If you lose access to your authenticator app, these codes are the only way to regain access to your account.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Backup Codes
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                  className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  {showBackupCodes ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showBackupCodes ? 'Hide' : 'Show'}
                </button>
                <button
                  type="button"
                  onClick={downloadBackupCodes}
                  className="flex items-center text-sm text-green-600 hover:text-green-500"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 bg-gray-100 rounded font-mono text-sm ${
                    showBackupCodes ? '' : 'filter blur-sm'
                  }`}
                >
                  <span>{code}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(code)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <AuthButton onClick={onComplete}>
            I've Saved My Backup Codes
          </AuthButton>
        </div>
      </AuthCard>
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
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return
    disableMutation.mutate(password)
  }

  return (
    <AuthCard 
      title="Disable Two-Factor Authentication" 
      subtitle="Enter your password to disable 2FA"
    >
      <div className="space-y-6">
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
    </AuthCard>
  )
}