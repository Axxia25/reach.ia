'use client'

import { Loader2 } from 'lucide-react'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

export default function Loading({ 
  size = 'md', 
  text, 
  fullScreen = false, 
  className = '' 
}: LoadingProps) {
  const spinner = (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className={`${sizeClasses[size]} text-primary-500 animate-spin`} />
        {text && (
          <p className="text-sm text-gray-600 font-medium">
            {text}
          </p>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Loading skeleton components
export function LoadingSkeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-200 animate-pulse rounded ${className}`} />
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  )
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </div>
        
        {/* Table rows */}
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-6 gap-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
