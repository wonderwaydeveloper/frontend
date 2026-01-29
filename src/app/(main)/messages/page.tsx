import { MessageCircle, Settings, Mail } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Settings className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="bg-gray-100 rounded-full px-4 py-2 flex items-center">
          <MessageCircle className="h-5 w-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search for people and groups"
            className="w-full bg-transparent outline-none text-15 text-gray-900 placeholder-gray-500"
          />
        </div>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center px-8 py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your inbox!</h2>
        <p className="text-15 text-gray-500 text-center mb-6 leading-5">
          Drop a line, share posts and more with private conversations between you and others on Twitter.
        </p>
        <button className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-15 hover:bg-green-700 transition-colors">
          Write a message
        </button>
      </div>
    </div>
  )
}