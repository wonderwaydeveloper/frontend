'use client'

import { lazy, Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading'

// Lazy load heavy components
export const LazyCreatePost = lazy(() => import('@/components/post/create-post'))
export const LazyPostCard = lazy(() => import('@/components/post/post-card'))
export const LazyRightSidebar = lazy(() => import('@/components/layout/right-sidebar'))

// Wrapper components with suspense
export function CreatePostWithSuspense() {
  return (
    <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
      <LazyCreatePost />
    </Suspense>
  )
}

export function PostCardWithSuspense({ post }: { post: any }) {
  return (
    <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
      <LazyPostCard post={post} />
    </Suspense>
  )
}

export function RightSidebarWithSuspense() {
  return (
    <Suspense fallback={<div className="p-4"><LoadingSpinner /></div>}>
      <LazyRightSidebar />
    </Suspense>
  )
}