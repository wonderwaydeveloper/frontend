'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Lock, Eye, EyeOff, Users, Globe, Shield } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Breadcrumb } from '@/components/ui/breadcrumb'

interface PrivacySettings {
  profile_visibility: 'public' | 'private'
  allow_mentions: boolean
  allow_direct_messages: 'everyone' | 'followers' | 'none'
  show_online_status: boolean
  allow_tagging: boolean
  search_visibility: boolean
  analytics_tracking: boolean
  data_sharing: boolean
}

export default function PrivacyPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: async () => {
      const response = await api.get('/settings/privacy')
      return response.data as PrivacySettings
    }
  })

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<PrivacySettings>) => {
      const response = await api.put('/settings/privacy', newSettings)
      return response.data
    },
    onSuccess: () => {
      toast.success('Privacy settings updated')
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] })
    },
    onError: () => {
      toast.error('Failed to update privacy settings')
    }
  })

  const handleToggle = (key: keyof PrivacySettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value })
  }

  const privacyOptions = [
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Control who can see your profile',
      icon: Eye,
      type: 'select' as const,
      options: [
        { value: 'public', label: 'Public - Anyone can see your profile' },
        { value: 'private', label: 'Private - Only followers can see your profile' }
      ]
    },
    {
      id: 'allow_mentions',
      title: 'Allow Mentions',
      description: 'Let others mention you in their posts',
      icon: Users,
      type: 'toggle' as const
    },
    {
      id: 'allow_direct_messages',
      title: 'Direct Messages',
      description: 'Control who can send you direct messages',
      icon: Lock,
      type: 'select' as const,
      options: [
        { value: 'everyone', label: 'Everyone' },
        { value: 'followers', label: 'Only people I follow' },
        { value: 'none', label: 'No one' }
      ]
    },
    {
      id: 'show_online_status',
      title: 'Online Status',
      description: 'Show when you\'re online to other users',
      icon: Globe,
      type: 'toggle' as const
    },
    {
      id: 'allow_tagging',
      title: 'Photo Tagging',
      description: 'Allow others to tag you in photos',
      icon: Users,
      type: 'toggle' as const
    },
    {
      id: 'search_visibility',
      title: 'Search Visibility',
      description: 'Allow your profile to appear in search results',
      icon: Eye,
      type: 'toggle' as const
    },
    {
      id: 'analytics_tracking',
      title: 'Analytics Tracking',
      description: 'Allow anonymous usage analytics',
      icon: Shield,
      type: 'toggle' as const
    },
    {
      id: 'data_sharing',
      title: 'Data Sharing',
      description: 'Share anonymized data for service improvement',
      icon: Shield,
      type: 'toggle' as const
    }
  ]

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-8">Loading privacy settings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Privacy Controls</h1>
            <p className="text-sm text-gray-600">Manage your privacy and data settings</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        <Breadcrumb />
        <div className="bg-green-50 border border-green-100 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Privacy Notice</h3>
              <p className="mt-1 text-sm text-green-700">
                These settings control how your information is shared and who can interact with you. 
                Changes take effect immediately.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {privacyOptions.map((option) => {
            const Icon = option.icon
            const currentValue = settings?.[option.id as keyof PrivacySettings]

            return (
              <div key={option.id} className="bg-white rounded-lg border border-gray-100 p-6">
                <div className="flex items-start space-x-4">
                  <Icon className="h-6 w-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 mb-4">{option.description}</p>
                    
                    {option.type === 'toggle' ? (
                      <button
                        onClick={() => handleToggle(option.id as keyof PrivacySettings, !currentValue)}
                        disabled={updateSettingsMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${
                          currentValue ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentValue ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    ) : (
                      <select
                        value={currentValue as string}
                        onChange={(e) => handleToggle(option.id as keyof PrivacySettings, e.target.value)}
                        disabled={updateSettingsMutation.isPending}
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
                      >
                        {option.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">Data Management</h3>
          <p className="text-sm text-gray-600 mb-4">
            For data export and account deletion, visit Account Settings.
          </p>
          <Link href="/settings/account" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium inline-block">
            Go to Account Settings
          </Link>
        </div>
      </div>
    </div>
  )
}