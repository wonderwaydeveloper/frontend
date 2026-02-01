'use client'

import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface RetryOptions {
  maxRetries?: number
  retryDelay?: number
  onSuccess?: (data: any) => void
  onError?: (error: any) => void
}

export function useRetryMutation<T, V>(
  mutationFn: (variables: V) => Promise<T>,
  options: RetryOptions = {}
) {
  const { maxRetries = 3, retryDelay = 1000, onSuccess, onError } = options
  const [retryCount, setRetryCount] = useState(0)

  const mutation = useMutation({
    mutationFn,
    onSuccess: (data) => {
      setRetryCount(0)
      onSuccess?.(data)
    },
    onError: (error) => {
      if (retryCount < maxRetries) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          mutation.mutate(mutation.variables as V)
        }, retryDelay * Math.pow(2, retryCount))
        toast.error(`Request failed. Retrying... (${retryCount + 1}/${maxRetries})`)
      } else {
        setRetryCount(0)
        onError?.(error)
      }
    }
  })

  const mutateWithRetry = useCallback((variables: V) => {
    setRetryCount(0)
    mutation.mutate(variables)
  }, [mutation])

  return {
    ...mutation,
    mutate: mutateWithRetry,
    retryCount,
    isRetrying: retryCount > 0
  }
}

export function NetworkErrorHandler({ error, onRetry }: { error: any; onRetry: () => void }) {
  const isNetworkError = error?.message?.includes('Network') || error?.code === 'NETWORK_ERROR'
  
  if (!isNetworkError) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
          <p className="mt-1 text-sm text-red-700">
            Unable to connect to the server. Please check your internet connection.
          </p>
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}