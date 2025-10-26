'use client'

import LeadsChart from '@/components/LeadsChart'
import LeadsTable from '@/components/LeadsTable'
import LeadStatusModal from '@/components/LeadStatusModal'
import MetaModal from '@/components/MetaModal'
import { useLeads } from '@/hooks/useLeads'
import { createSupabaseClient, Lead } from '@/lib/supabase'
import { ArrowLeft, Calendar, DollarSign, LogOut, Target } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function VendedorPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [period, setPeriod] = useState(7)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [leadStatuses, setLeadStatuses] = useState<Record<number, { status: string, valor: number }>>({})
  const [isMetaModalOpen, setIsMetaModalOpen] = useState(false)
  const [vendedorMeta, setVendedorMeta] = useState<{valor: number, quantidade: number} | null>(null)
  const [isActiveInQueue, setIsActiveInQueue] = useState(true) // Estado para controle da fila
  const supabase = createSupabaseClient()

  // Decodificar nome do vendedor da URL
  const vendedorNome = decodeURIComponent(params.nome as string)
  
  // Buscar todos os leads e filtrar pelo vendedor
  const { leads: allLeads, loading, error, refetch } = useLeads(period)
  
  // Filtrar leads do vendedor específico
  const vendedorLeads = allLeads.filter(lead => lead.vendedor === vendedorNome)
  
  const handleMetaModalOpen = () => {
  setIsMetaModalOpen(true)
  }

  const handleMetaModalClose = () => {
  setIsMetaModalOpen(false)
  }

  const handleMetaSave = (metaValor: number, metaQuantidade: number) => {
  setVendedorMeta({ valor: metaValor, quantidade: metaQuantidade })
  console.log(`Meta definida: R$ ${metaValor}, ${metaQuantidade} vendas`)
  }

  // Calcular métricas específicas do vendedor
  const vendedorMetrics = {
    totalLeads: vendedorLeads.length,
    activeVendors: 1, // Sempre 1 para página individual
    uniqueVehicles: new Set(vendedorLeads.filter(l => l.veiculo).map(l => l.veiculo)).size,
    avgLeadsPerDay: Number((vendedorLeads.length / period).toFixed(1)),
    leadsTrend: 0, // Placeholder - calcular depois
    vendorsTrend: 0,
    vehiclesTrend: 0,
    avgTrend: 0
  }

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

  const handleBackToDashboard = () => {
    router.push('/dashboard')
  }

  const handleToggleQueue = () => {
    setIsActiveInQueue(!isActiveInQueue)
    // TODO: Futuramente, sincronizar com a tabela de roleta no banco de dados
    console.log(`${vendedorNome} ${!isActiveInQueue ? 'ativado' : 'desativado'} na fila de distribuição`)
  }

  const periodOptions = [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 90 dias' }
  ]

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead)
    setIsModalOpen(true)
  }

  const handleModalSave = (leadId: number, status: string, valor: number) => {
    setLeadStatuses(prev => ({
    ...prev,
    [leadId]: { status, valor }
  }))
  console.log(`Lead ${leadId} atualizado: ${status}, R$ ${valor}`)
  }

  const handleModalClose = () => {
    setSelectedLead(null)
    setIsModalOpen(false)
  }

  // Calcular métricas baseadas nos status
  const calculateStatusMetrics = () => {
  const statuses = Object.values(leadStatuses)
  const fechados = statuses.filter(s => s.status === 'fechado').length
  const perdidos = statuses.filter(s => s.status === 'perdido').length
  const andamento = statuses.filter(s => s.status === 'andamento').length
  const valorTotal = statuses
    .filter(s => s.status === 'fechado')
    .reduce((sum, s) => sum + s.valor, 0)
  
  const taxaConversao = vendedorLeads.length > 0 
    ? ((fechados / vendedorLeads.length) * 100).toFixed(1)
    : '0'
    
    return { fechados, perdidos, andamento, valorTotal, taxaConversao }
  }

  const statusMetrics = calculateStatusMetrics()

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Botão voltar */}
              <button
                onClick={handleBackToDashboard}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-foreground">
                    Dashboard - {vendedorNome}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Gestão pessoal de leads e metas
                  </p>
                </div>

                {/* Toggle de Status na Fila - Discreto */}
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={handleToggleQueue}
                    className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      isActiveInQueue ? 'bg-success-500' : 'bg-muted'
                    }`}
                    aria-label={`${isActiveInQueue ? 'Desativar' : 'Ativar'} na fila de distribuição`}
                    title={isActiveInQueue ? 'Ativo na fila de distribuição' : 'Inativo na fila de distribuição'}
                  >
                    <span
                      className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                        isActiveInQueue ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs hidden md:inline ${
                    isActiveInQueue ? 'text-success-600' : 'text-muted-foreground'
                  }`}>
                    {isActiveInQueue ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
              {/* Seletor de período */}
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground hidden sm:block" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(Number(e.target.value))}
                  className="border border-border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {periodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* User info e logout */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="text-xs sm:text-sm hidden md:block">
                  <div className="font-medium text-foreground">
                    {user.email}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
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

        {/* Cards de métricas personalizadas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Meus Leads */}
          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-card-foreground mb-1">
                  {vendedorMetrics.totalLeads}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium mb-1 sm:mb-2">
                  Meus Leads
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Últimos {period} dias
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
              </div>
            </div>
          </div>

          {/* Veículos Únicos */}
          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-card-foreground mb-1">
                  {vendedorMetrics.uniqueVehicles}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium mb-1 sm:mb-2">
                  Veículos Únicos
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Modelos consultados
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-secondary-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Meta Mensal */}
          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl font-bold text-card-foreground mb-1">
                  {vendedorMeta ?
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(vendedorMeta.valor)
                    : '--'
                  }
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium mb-1 sm:mb-2">
                  Meta Mensal
                </div>
                <div className="text-xs sm:text-sm text-warning-600 font-medium">
                  Configurar meta
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-warning-500" />
              </div>
            </div>
          </div>

          {/* Valor Vendido */}
          <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl sm:text-3xl font-bold text-card-foreground mb-1">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(statusMetrics.valorTotal)}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium mb-1 sm:mb-2">
                  Valor Vendido
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  Período atual
                </div>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-success-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico dos Meus Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="lg:col-span-2">
            <LeadsChart
              leads={vendedorLeads}
              dailySummary={[]} // Será calculado baseado nos leads filtrados
              period={period}
              loading={loading}
            />
          </div>

          {/* Painel de Performance */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl p-4 sm:p-6 shadow-card border border-border">
              <h3 className="text-lg sm:text-xl font-semibold text-card-foreground mb-4 sm:mb-6">
                Minha Performance
              </h3>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Taxa de Conversão</span>
                  <span className="text-sm sm:text-base font-semibold text-card-foreground">{statusMetrics.taxaConversao}%</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Leads/Dia Média</span>
                  <span className="text-sm sm:text-base font-semibold text-card-foreground">{vendedorMetrics.avgLeadsPerDay}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Negócios Fechados</span>
                  <span className="text-sm sm:text-base font-semibold text-success-600">{statusMetrics.fechados}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Em Andamento</span>
                  <span className="text-sm sm:text-base font-semibold text-warning-600">{statusMetrics.andamento}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground">Perdidos</span>
                  <span className="text-sm sm:text-base font-semibold text-danger-600">{statusMetrics.perdidos}</span>
                </div>
              </div>

              <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-muted-foreground font-medium">Valor Total Vendido</span>
                  <span className="text-sm sm:text-base font-bold text-success-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(statusMetrics.valorTotal)}
                  </span>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-border">
                <button
                  onClick={handleMetaModalOpen}
                  className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-primary-600 transition-colors"
                >
                  Configurar Meta Mensal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Meus Leads */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 px-4 sm:px-0">
            <h3 className="text-lg sm:text-xl font-semibold text-card-foreground">
              Meus Leads ({vendedorMetrics.totalLeads})
            </h3>
            <div className="text-xs sm:text-sm text-muted-foreground">
              Clique em um lead para gerenciar status
            </div>
          </div>

          {/* Modal de Meta */}
          <MetaModal
            vendedorNome={vendedorNome}
            isOpen={isMetaModalOpen}
            onClose={handleMetaModalClose}
            onSave={handleMetaSave}
          />
          
          <LeadsTable leads={vendedorLeads} loading={loading} onLeadClick={handleLeadClick} />
        </div>
      </main>
        {/* Modal de Status */}
          <LeadStatusModal
          lead={selectedLead}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      </div>
    ) 
}