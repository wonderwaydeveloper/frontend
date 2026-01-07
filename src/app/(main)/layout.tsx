import Sidebar from '@/components/layout/sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import ProtectedRoute from '@/components/auth/protected-route'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto flex">
          {/* Left Sidebar */}
          <div className="w-64 fixed h-full">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 ml-64 mr-80 min-h-screen border-x border-gray-200">
            {children}
          </div>
          
          {/* Right Sidebar */}
          <div className="w-80 fixed right-0 h-full">
            <RightSidebar />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}