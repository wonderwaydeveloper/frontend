'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Image, Smile, Calendar, MapPin } from 'lucide-react'
import api from '@/lib/api'

export default function CreatePost() {
  const [content, setContent] = useState('')
  const queryClient = useQueryClient()

  const createPostMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const response = await api.post('/posts', data)
      return response.data
    },
    onSuccess: () => {
      setContent('')
      queryClient.invalidateQueries({ queryKey: ['timeline'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      createPostMutation.mutate({ content })
    }
  }

  return (
    <div className="border-b border-gray-200 px-4 py-3">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
          
          {/* Input */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full text-xl text-gray-900 placeholder-gray-500 border-none outline-none resize-none bg-transparent leading-6"
              rows={3}
              maxLength={280}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-3 pt-3">
              <div className="flex items-center space-x-1">
                <button type="button" className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                  <Image className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                  <Calendar className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                {content.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      content.length > 260 ? 'border-red-500' : 'border-green-600'
                    }`}>
                      <span className={`text-sm font-bold ${
                        content.length > 260 ? 'text-red-500' : 'text-green-600'
                      }`}>
                        {280 - content.length}
                      </span>
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!content.trim() || content.length > 280 || createPostMutation.isPending}
                  className="bg-green-600 text-white px-6 py-1.5 rounded-full font-bold text-15 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}