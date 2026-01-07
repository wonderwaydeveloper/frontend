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
    <div className="border-b border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gray-300 rounded-full flex-shrink-0"></div>
          
          {/* Input */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's happening?"
              className="w-full text-xl placeholder-gray-500 border-none outline-none resize-none"
              rows={3}
              maxLength={280}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <button type="button" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                  <Image className="w-5 h-5" />
                </button>
                <button type="button" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                  <Calendar className="w-5 h-5" />
                </button>
                <button type="button" className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${content.length > 260 ? 'text-red-500' : 'text-gray-500'}`}>
                  {280 - content.length}
                </span>
                <button
                  type="submit"
                  disabled={!content.trim() || createPostMutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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