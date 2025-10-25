'use client'

import { useState, useEffect } from 'react'
import { createSupabaseClient, Lead, DailySummary, VendorSummary } from '@/lib/supabase'
import { subDays, format, parseISO } from 'date-fns'

interface UseLeadsReturn {
  leads: Lead[]
  dailySummary: DailySummary[]
  vendorSummary: VendorSummary[]
  metrics: {
    totalLeads: number
    activeVendors: number
    uniqueVehicles: number
    avgLeadsPerDay: number
    leadsTrend: number
    vendorsTrend: number
    vehiclesTrend: number
    avgTrend: number
  }
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useLeads(period: number = 7): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([])
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([])
  const [vendorSummary, setVendorSummary] = useState<VendorSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createSupabaseClient()

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Iniciando busca de dados...')

      const startDate = subDays(new Date(), period)
      console.log('📅 Período:', `${period} dias atrás = ${startDate.toISOString()}`)
      
      // 1. Buscar todos os leads (sem filtro de data primeiro para debug)
      console.log('🔍 Buscando todos os leads...')
      const { data: allLeads, error: allLeadsError } = await supabase
        .from('leads')
        .select('*')
        .order('timestamps', { ascending: false })

      if (allLeadsError) {
        console.error('❌ Erro ao buscar todos os leads:', allLeadsError)
        throw allLeadsError
      }

      console.log('✅ Total de leads na base:', allLeads?.length || 0)

      // 2. Filtrar leads do período no frontend (para debug)
      const currentLeads = allLeads?.filter(lead => {
        const leadDate = parseISO(lead.timestamps)
        return leadDate >= startDate
      }) || []

      console.log('✅ Leads no período selecionado:', currentLeads.length)

      // 3. Buscar resumo diário
      console.log('🔍 Buscando resumo diário...')
      const { data: dailyData, error: dailyError } = await supabase
        .from('leads_daily_summary')
        .select('*')
        .gte('data', format(startDate, 'yyyy-MM-dd'))
        .order('data', { ascending: false })

      if (dailyError) {
        console.warn('⚠️ Erro ao buscar resumo diário (continuando):', dailyError)
      }

      console.log('✅ Resumo diário:', dailyData?.length || 0, 'registros')

      // 4. Buscar resumo por vendedor
      console.log('🔍 Buscando resumo por vendedor...')
      const { data: vendorData, error: vendorError } = await supabase
        .from('leads_por_vendedor')
        .select('*')
        .order('total_leads', { ascending: false })

      if (vendorError) {
        console.warn('⚠️ Erro ao buscar resumo vendedor (continuando):', vendorError)
      }

      console.log('✅ Resumo vendedor:', vendorData?.length || 0, 'registros')

      // 5. Atualizar estado
      setLeads(currentLeads)
      setDailySummary(dailyData || [])
      setVendorSummary(vendorData || [])

      console.log('✅ Dados atualizados no estado')

    } catch (err: any) {
      console.error('❌ Erro geral:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Calcular métricas com logs detalhados
  const calculateMetrics = () => {
    console.log('🧮 Calculando métricas...')
    console.log('📊 Leads disponíveis:', leads.length)
    
    // Métricas básicas
    const totalLeads = leads.length
    
    // Vendedores ativos (filtrando valores nulos/vazios)
    const vendedoresComNome = leads.filter(l => l.vendedor && l.vendedor.trim() !== '')
    const activeVendors = new Set(vendedoresComNome.map(l => l.vendedor)).size
    
    // Veículos únicos (filtrando valores nulos/vazios)
    const veiculosComNome = leads.filter(l => l.veiculo && l.veiculo.trim() !== '')
    const uniqueVehicles = new Set(veiculosComNome.map(l => l.veiculo)).size
    
    // Média por dia
    const avgLeadsPerDay = period > 0 ? Number((totalLeads / period).toFixed(1)) : 0

    // Trends simulados (em uma implementação real, você buscaria dados do período anterior)
    const leadsTrend = totalLeads > 0 ? 10.5 : 0  // Simulando crescimento de 10.5%
    const vendorsTrend = activeVendors > 0 ? 5.2 : 0  // Simulando crescimento
    const vehiclesTrend = uniqueVehicles > 0 ? -2.1 : 0  // Simulando decréscimo
    const avgTrend = avgLeadsPerDay > 0 ? 8.3 : 0  // Simulando crescimento

    const metrics = {
      totalLeads,
      activeVendors,
      uniqueVehicles,
      avgLeadsPerDay,
      leadsTrend,
      vendorsTrend,
      vehiclesTrend,
      avgTrend
    }

    console.log('📊 Métricas calculadas:', metrics)
    return metrics
  }

  useEffect(() => {
    console.log('🚀 useLeads effect triggered, period:', period)
    fetchData()

    // Configurar realtime subscription
    const channel = supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          console.log('🔴 Realtime update received:', payload)
          // Refetch data when changes occur
          fetchData()
        }
      )
      .subscribe((status) => {
        console.log('🔴 Realtime subscription status:', status)
      })

    return () => {
      console.log('🔄 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [period])

  const metrics = calculateMetrics()

  return {
    leads,
    dailySummary,
    vendorSummary,
    metrics,
    loading,
    error,
    refetch: fetchData
  }
}
