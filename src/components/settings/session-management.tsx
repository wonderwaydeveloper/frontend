'use client'

import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export function SessionManagement() {
  const router = useRouter()

  const logoutAllMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/logout-all')
      return response.data
    },
    onSuccess: () => {
      toast.success('Logged out from all devices')
      localStorage.clear()
      router.push('/login')
    }
  })

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Session Management</h2>
      
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <span className="text-2xl">🖥️</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Current Session</h3>
            <p className="text-sm text-gray-600 mt-1">
              This is your current active session. You are logged in on this device.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Started: {new Date().toLocaleString()}
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
              Active
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Security Action
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              If you suspect unauthorized access to your account, you can log out from all devices immediately.
            </p>
            <div className="mt-3">
              <button
                onClick={() => logoutAllMutation.mutate()}
                disabled={logoutAllMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {logoutAllMutation.isPending ? 'Logging out...' : 'Logout from All Devices'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Session Security Tips</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Always log out from public or shared computers</li>
          <li>• Use two-factor authentication for extra security</li>
          <li>• Regularly review your active sessions</li>
          <li>• Report any suspicious activity immediately</li>
        </ul>
      </div>
    </div>
  )
}