import Sidebar from '@/components/layout/sidebar'
import RightSidebar from '@/components/layout/right-sidebar'
import MobileNav from '@/components/layout/mobile-nav'
import ProtectedRoute from '@/components/auth/protected-route'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        {/* Twitter-style container */}
        <div className="max-w-7xl mx-auto flex">
          {/* Left Sidebar - Twitter responsive pattern */}
          <div className="hidden sm:flex sm:w-16 lg:w-64 xl:w-72 sm:fixed sm:h-full">
            <Sidebar />
          </div>
          
          {/* Main Content - Twitter standard 600px max */}
          <div className="flex-1 sm:ml-16 lg:ml-64 xl:ml-72 lg:mr-80 min-h-screen">
            <div className="max-w-xl mx-auto border-x border-gray-200 min-h-screen pb-16 sm:pb-0">
              {children}
            </div>
          </div>
          
          {/* Right Sidebar - Twitter standard 320px */}
          <div className="hidden lg:flex lg:w-80 lg:fixed lg:right-0 lg:h-full lg:justify-center xl:justify-end">
            <div className="w-80 max-w-80">
              <RightSidebar />
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </ProtectedRoute>
  )
}