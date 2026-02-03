'use client'

import { useState } from 'react'
import { AuthCard, AuthButton } from './auth-components'
import { Download, Copy, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface BackupCodesManagerProps {
  codes: string[]
  onClose: () => void
}

export function BackupCodesManager({ codes, onClose }: BackupCodesManagerProps) {
  const [showCodes, setShowCodes] = useState(true)
  const [savedConfirmed, setSavedConfirmed] = useState(false)

  const copyAllCodes = () => {
    const codesText = codes.join('\n')
    navigator.clipboard.writeText(codesText)
    toast.success('Backup codes copied to clipboard')
  }

  const downloadCodes = () => {
    const content = `Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup codes downloaded')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <AuthCard title="Save Your Backup Codes" subtitle="Store these codes in a safe place">
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
                  Important: Save These Codes
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  These backup codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Your Backup Codes</h3>
              <button
                type="button"
                onClick={() => setShowCodes(!showCodes)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {showCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{showCodes ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              {showCodes ? (
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {codes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{code}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(code)
                          toast.success('Code copied')
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>Backup codes are hidden</p>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <AuthButton
                onClick={copyAllCodes}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </AuthButton>
              <AuthButton
                onClick={downloadCodes}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </AuthButton>
            </div>

            <div className="space-y-3">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={savedConfirmed}
                  onChange={(e) => setSavedConfirmed(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">
                  I have saved these backup codes in a secure location
                </span>
              </label>
            </div>

            <AuthButton
              onClick={onClose}
              disabled={!savedConfirmed}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue
            </AuthButton>
          </div>
        </div>
      </AuthCard>
    </div>
  )
}