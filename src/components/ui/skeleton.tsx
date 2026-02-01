'use client'

export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  )
}

export function DeviceListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <SkeletonLoader className="h-6 w-6" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-5 w-32" />
              <SkeletonLoader className="h-4 w-48" />
              <SkeletonLoader className="h-3 w-64" />
            </div>
            <div className="flex space-x-2">
              <SkeletonLoader className="h-8 w-16" />
              <SkeletonLoader className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SecurityEventsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-4">
          <div className="flex items-start space-x-3">
            <SkeletonLoader className="h-5 w-5 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-4 w-40" />
              <SkeletonLoader className="h-3 w-32" />
              <SkeletonLoader className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function SettingsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <SkeletonLoader className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
              <SkeletonLoader className="h-6 w-6" />
              <div className="flex-1 space-y-1">
                <SkeletonLoader className="h-4 w-32" />
                <SkeletonLoader className="h-3 w-48" />
              </div>
              <SkeletonLoader className="h-5 w-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}