'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  user: any
  userProfile: any
  onSignOut: () => void
}

export default function DashboardLayout({ 
  children, 
  user, 
  userProfile, 
  onSignOut 
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar fixa */}
      <Sidebar 
        user={user}
        userProfile={userProfile}
        onSignOut={onSignOut}
      />
      
      {/* Conteúdo principal */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-6">
          {children}
        </div>
      </main>
    </div>
  )
}