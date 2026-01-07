'use client'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]} ${className}`} />
  )
}

interface LoadingCardProps {
  count?: number
}

export function LoadingCard({ count = 1 }: LoadingCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 animate-pulse">
          <div className="flex space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export function LoadingPage() {
  return (
    <div className="flex justify-center items-center h-64">
      <LoadingSpinner size="lg" />
    </div>
  )
}