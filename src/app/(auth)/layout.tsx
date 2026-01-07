import ProtectedRoute from '@/components/auth/protected-route'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h6a2 2 0 002-2V8M9 12h6" />
                </svg>
              </div>
              <h1 className="mt-4 text-2xl font-bold text-gray-900">Microblogging</h1>
            </div>
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}