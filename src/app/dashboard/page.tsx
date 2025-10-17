'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useLeads } from '@/hooks/useLeads'
import MetricsCards from '@/components/MetricsCards'
import LeadsChart from '@/components/LeadsChart'
import VendorsPanel from '@/components/VendorsPanel'
import LeadsTable from '@/components/LeadsTable'
import { LogOut, RefreshCw, Calendar } from 'lucide-react'

export default function DashboardPage() {
  const [period, setPeriod] = useState(7)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()
  
  const { leads, dailySummary, vendorSummary, metrics, loading, error, refetch } = useLeads(period)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
    }

    checkAuth()

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/')
      } else {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const periodOptions = [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 90 dias' }
  ]

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Leads
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Seletor de período */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botão de refresh */}
              <button
                onClick={refetch}
                disabled={loading}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Atualizar dados"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* User info e logout */}
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium">Erro ao carregar dados</h3>
                <div className="mt-1 text-sm">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Metrics Cards */}
        <MetricsCards metrics={metrics} loading={loading} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <LeadsChart 
              leads={leads} 
              dailySummary={dailySummary} 
              period={period} 
              loading={loading} 
            />
          </div>
          <div className="lg:col-span-1">
            <VendorsPanel 
              vendorSummary={vendorSummary} 
              leads={leads} 
              loading={loading} 
            />
          </div>
        </div>

        {/* Leads Table */}
        <LeadsTable leads={leads} loading={loading} />
      </main>
    </div>
  )
}
