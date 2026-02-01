'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Copy, Download, Eye, EyeOff, Shield } from 'lucide-react'
import { AuthAPI } from '@/lib/auth-api'
import toast from 'react-hot-toast'

interface BackupCodesProps {
  codes: string[]
  onClose: () => void
}

export function BackupCodesManager({ codes, onClose }: BackupCodesProps) {
  const [showCodes, setShowCodes] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyCode = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedIndex(index)
      toast.success('Code copied to clipboard')
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (error) {
      toast.error('Failed to copy code')
    }
  }

  const copyAllCodes = async () => {
    try {
      const allCodes = codes.join('\n')
      await navigator.clipboard.writeText(allCodes)
      toast.success('All codes copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy codes')
    }
  }

  const downloadCodes = () => {
    const content = `Backup Codes for Two-Factor Authentication\n\nGenerated: ${new Date().toLocaleString()}\n\n${codes.join('\n')}\n\nImportant:\n- Keep these codes safe and secure\n- Each code can only be used once\n- Use these codes if you lose access to your authenticator app`
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Backup codes downloaded')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Backup Codes</h3>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Each code can only be used once. Generate new codes if you run out.
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCodes(!showCodes)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showCodes ? 'Hide codes' : 'Show codes'}</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={copyAllCodes}
                className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
              >
                <Copy className="h-3 w-3" />
                <span>Copy All</span>
              </button>
              <button
                onClick={downloadCodes}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
              >
                <Download className="h-3 w-3" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {codes.map((code, index) => (
              <div
                key={index}
                className="relative bg-gray-50 rounded p-3 font-mono text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className={showCodes ? '' : 'blur-sm select-none'}>
                    {code}
                  </span>
                  <button
                    onClick={() => copyCode(code, index)}
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                  >
                    <Copy className={`h-3 w-3 ${copiedIndex === index ? 'text-green-600' : 'text-gray-500'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            I've Saved These Codes
          </button>
        </div>
      </div>
    </div>
  )
}