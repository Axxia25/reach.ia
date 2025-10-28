'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseClient, Lead } from '@/lib/supabase'
import { useFunnelData } from '@/hooks/useFunnelData'
import { useLeads } from '@/hooks/useLeads'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  TrendingUp,
  Users,
  Target,
  ShoppingCart,
  DollarSign,
  TrendingDown,
  Calendar,
  ArrowLeft,
  Search,
  Clock,
  User,
  Phone,
  Car,
} from 'lucide-react'

export default function MetricasComercialPage() {
  const [period, setPeriod] = useState(30)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'novo' | 'contato' | 'todos'>('todos')
  const [vendorFilter, setVendorFilter] = useState('todos')

  const router = useRouter()
  const supabase = createSupabaseClient()

  const { metrics, loading: metricsLoading, error: metricsError } = useFunnelData(period)
  const { leads, loading: leadsLoading } = useLeads(period)

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }
      setUser(session.user)
    }
    checkAuth()
  }, [router, supabase])

  // Obter vendedores únicos para o filtro
  const uniqueVendors = useMemo(() => {
    const vendors = Array.from(
      new Set(
        leads.filter((lead) => lead.vendedor).map((lead) => lead.vendedor!)
      )
    )
    return vendors.sort()
  }, [leads])

  // Filtrar leads baseado nos filtros
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Filtro de busca
      const searchMatch =
        searchTerm === '' ||
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.veiculo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.vendedor?.toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro de vendedor
      const vendorMatch =
        vendorFilter === 'todos' || lead.vendedor === vendorFilter

      // Filtro de status (simulado baseado na data - leads dos últimos 2 dias são "novos")
      const leadDate = parseISO(lead.timestamps)
      const isRecent =
        Date.now() - leadDate.getTime() < 2 * 24 * 60 * 60 * 1000
      const statusMatch =
        statusFilter === 'todos' ||
        (statusFilter === 'novo' && isRecent) ||
        (statusFilter === 'contato' && !isRecent)

      return searchMatch && vendorMatch && statusMatch
    })
  }, [leads, searchTerm, statusFilter, vendorFilter])

  // Função para formatar percentual
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  }

  const formatDateTime = (timestamp: string) => {
    const date = parseISO(timestamp)
    return format(date, 'dd/MM HH:mm', { locale: ptBR })
  }

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-'
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const getStatusBadge = (lead: Lead) => {
    const leadDate = parseISO(lead.timestamps)
    const isRecent = Date.now() - leadDate.getTime() < 2 * 24 * 60 * 60 * 1000

    if (isRecent) {
      return (
        <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-lg">
          Novo
        </span>
      )
    } else {
      return (
        <span className="px-2 py-1 bg-warning-50 text-warning-600 text-xs font-semibold rounded-lg">
          Contato
        </span>
      )
    }
  }

  // Determinar cor e ícone baseado na performance
  const getPerformanceIndicator = (
    value: number,
    type: 'conversion' | 'qualification'
  ) => {
    const threshold = type === 'conversion' ? 2 : 20
    const isGood = value >= threshold

    return {
      color: isGood ? 'text-success-600' : 'text-warning-600',
      icon: isGood ? TrendingUp : TrendingDown,
    }
  }

  const qualificationIndicator = metrics
    ? getPerformanceIndicator(metrics.taxaQualificacao, 'qualification')
    : null
  const conversionIndicator = metrics
    ? getPerformanceIndicator(metrics.taxaConversao, 'conversion')
    : null

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 text-muted-foreground hover:text-card-foreground hover:bg-accent rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              Métricas Comerciais
            </h1>
            <p className="text-muted-foreground mt-2">
              Análise detalhada de conversão e leads em tempo real
            </p>
          </div>
        </div>

        {/* Seletor de Período */}
        <div className="flex items-center gap-2 bg-accent rounded-lg p-1">
          <Calendar className="w-4 h-4 text-muted-foreground ml-2" />
          <button
            onClick={() => setPeriod(7)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === 7
                ? 'bg-primary-500 text-white'
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            7 dias
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === 30
                ? 'bg-primary-500 text-white'
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            30 dias
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === 90
                ? 'bg-primary-500 text-white'
                : 'text-muted-foreground hover:text-card-foreground'
            }`}
          >
            90 dias
          </button>
        </div>
      </div>
        {/* Seção de Métricas de Conversão */}
        {metricsLoading ? (
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="h-6 bg-muted rounded w-40 mb-6 animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-accent rounded-lg p-4">
                  <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse"></div>
                  <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ) : metricsError ? (
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="text-center py-8">
              <div className="text-danger-500 mb-2">
                ⚠️ Erro ao carregar métricas
              </div>
              <div className="text-sm text-muted-foreground">{metricsError}</div>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 shadow-card border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-card-foreground">
                Métricas de Conversão
              </h3>
              <span className="text-sm text-muted-foreground">
                Últimos {period} dias
              </span>
            </div>

            {/* Grid de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Taxa de Qualificação */}
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border-l-4 border-l-primary-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium text-card-foreground">
                      Taxa Qualificação
                    </span>
                  </div>
                  {qualificationIndicator && (
                    <qualificationIndicator.icon
                      className={`w-4 h-4 ${qualificationIndicator.color}`}
                    />
                  )}
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">
                  {formatPercentage(metrics.taxaQualificacao)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.totalLeadsDistribuidos} de {metrics.totalLeadsBrutos} leads
                </div>
              </div>

              {/* Taxa de Conversão */}
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-l-success-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="w-4 h-4 text-success-500" />
                    <span className="text-sm font-medium text-card-foreground">
                      Taxa Conversão
                    </span>
                  </div>
                  {conversionIndicator && (
                    <conversionIndicator.icon
                      className={`w-4 h-4 ${conversionIndicator.color}`}
                    />
                  )}
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">
                  {formatPercentage(metrics.taxaConversao)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.totalVendasRealizadas} de {metrics.totalLeadsDistribuidos} leads
                </div>
              </div>

              {/* Taxa Global */}
              <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border-l-4 border-l-warning-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-warning-500" />
                    <span className="text-sm font-medium text-card-foreground">
                      Taxa Global
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">
                  {formatPercentage(metrics.taxaGlobal)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Eficiência geral do funil
                </div>
              </div>

              {/* Ticket Médio */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-l-gray-500">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-card-foreground">
                      Ticket Médio
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-foreground mb-1">
                  {formatCurrency(metrics.ticketMedio)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Por venda realizada
                </div>
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-border">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {metrics.totalLeadsBrutos}
                  </div>
                  <div className="text-sm text-muted-foreground">Leads Recebidos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {metrics.totalVendasRealizadas}
                  </div>
                  <div className="text-sm text-muted-foreground">Vendas Fechadas</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-card-foreground">
                    {formatCurrency(metrics.ticketMedio * metrics.totalVendasRealizadas)}
                  </div>
                  <div className="text-sm text-muted-foreground">Faturamento Total</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seção de Tabela de Leads com Scroll Independente */}
        <div className="bg-card rounded-xl shadow-card border border-border">
          {/* Header da Tabela (fixo) */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              <h3 className="text-xl font-semibold text-card-foreground">
                Leads Recentes
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filtros */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 border border-border bg-card text-card-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todos">Todos Status</option>
                  <option value="novo">Novos</option>
                  <option value="contato">Em Contato</option>
                </select>

                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="px-3 py-2 border border-border bg-card text-card-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="todos">Todos Vendedores</option>
                  {uniqueVendors.map((vendor) => (
                    <option key={vendor} value={vendor}>
                      {vendor}
                    </option>
                  ))}
                </select>

                {/* Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nome, telefone ou veículo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border bg-card text-card-foreground placeholder:text-muted-foreground rounded-lg w-full sm:w-80 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Contador de resultados */}
            <div className="mt-4 text-sm text-muted-foreground">
              {filteredLeads.length} de {leads.length} leads
              {searchTerm && ` encontrados para "${searchTerm}"`}
            </div>
          </div>

          {/* Tabela com scroll independente */}
          <div className="overflow-auto" style={{ maxHeight: '600px' }}>
            {leadsLoading ? (
              <div className="space-y-4 p-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-accent rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-card border-b border-border z-10">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Data/Hora
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Nome
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Telefone
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          Veículo
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        Vendedor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-muted-foreground text-sm bg-card">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length > 0 ? (
                      filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b border-border transition-colors hover:bg-accent"
                        >
                          <td className="py-3 px-4 text-sm text-card-foreground">
                            {formatDateTime(lead.timestamps)}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-card-foreground">
                            {lead.nome}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {formatPhone(lead.telefone)}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {lead.veiculo || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {lead.vendedor || '-'}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(lead)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-muted-foreground"
                        >
                          {searchTerm || statusFilter !== 'todos' || vendorFilter !== 'todos'
                            ? 'Nenhum lead encontrado com os filtros aplicados'
                            : 'Nenhum lead encontrado'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
