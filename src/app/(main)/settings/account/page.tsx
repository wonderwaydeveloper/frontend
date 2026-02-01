'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Download, Trash2, AlertTriangle, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useRetryMutation, NetworkErrorHandler } from '@/hooks/use-retry'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function AccountPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const router = useRouter()
  const { logout } = useAuth()

  const exportDataMutation = useRetryMutation(
    async () => {
      const response = await api.get('/account/export-data')
      return response.data
    },
    {
      onSuccess: (data) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('Account data exported successfully')
      },
      onError: () => {
        toast.error('Failed to export account data')
      }
    }
  )

  const deleteAccountMutation = useRetryMutation(
    async (password: string) => {
      const response = await api.post('/account/delete-account', {
        password
      })
      return response.data
    },
    {
      onSuccess: () => {
        toast.success('Account deleted successfully')
        logout()
        router.push('/')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to delete account')
      }
    }
  )

  const handleDeleteAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!deletePassword.trim()) return
    deleteAccountMutation.mutate(deletePassword)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Account Management</h1>
            <p className="text-sm text-gray-600">Manage your account data and settings</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Breadcrumb />
        <NetworkErrorHandler 
          error={exportDataMutation.error} 
          onRetry={() => exportDataMutation.mutate()} 
        />
        {/* Data Export */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-start space-x-4">
            <Download className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Your Data</h3>
              <p className="text-gray-600 mb-4">
                Download a copy of all your account data including posts, messages, and profile information.
              </p>
              <button
                onClick={() => exportDataMutation.mutate()}
                disabled={exportDataMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {exportDataMutation.isPending ? 'Exporting...' : 'Export Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Account Deactivation */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-start space-x-4">
            <Shield className="h-6 w-6 text-yellow-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Deactivate Account</h3>
              <p className="text-gray-600 mb-4">
                Temporarily deactivate your account. You can reactivate it anytime by logging in.
              </p>
              <button
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white rounded-lg border border-red-100 p-6">
          <div className="flex items-start space-x-4">
            <Trash2 className="h-6 w-6 text-red-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">
                          Are you absolutely sure?
                        </h4>
                        <p className="mt-1 text-sm text-red-700">
                          This will permanently delete your account, posts, messages, and all associated data. 
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter your password to confirm
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteConfirm(false)
                          setDeletePassword('')
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={deleteAccountMutation.isPending || !deletePassword.trim()}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                      >
                        {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}