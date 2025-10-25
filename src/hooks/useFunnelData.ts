'use client'

import { createSupabaseClient } from '@/lib/supabase'
import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns'
import { useEffect, useState } from 'react'

interface FunnelDataPoint {
  date: string
  dateFormatted: string
  leadsTotal: number      // Linha vermelha - tabela leads_totais
  leadsDistribuidos: number // Linha azul - tabela leads atual
  vendasRealizadas: number  // Linha verde - lead_status com status fechado
}

interface FunnelMetrics {
  totalLeadsBrutos: number
  totalLeadsDistribuidos: number
  totalVendasRealizadas: number
  taxaQualificacao: number      // (Distribuídos / Brutos) × 100
  taxaConversao: number         // (Vendas / Distribuídos) × 100
  taxaGlobal: number           // (Vendas / Brutos) × 100
  ticketMedio: number          // Valor médio das vendas
}

interface UseFunnelDataReturn {
  chartData: FunnelDataPoint[]
  metrics: FunnelMetrics
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useFunnelData(period: number = 7): UseFunnelDataReturn {
  const [chartData, setChartData] = useState<FunnelDataPoint[]>([])
  const [metrics, setMetrics] = useState<FunnelMetrics>({
    totalLeadsBrutos: 0,
    totalLeadsDistribuidos: 0,
    totalVendasRealizadas: 0,
    taxaQualificacao: 0,
    taxaConversao: 0,
    taxaGlobal: 0,
    ticketMedio: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createSupabaseClient()

  const fetchFunnelData = async () => {
    try {
      setLoading(true)
      setError(null)

      const endDate = new Date()
      const startDate = subDays(endDate, period - 1)
      
      console.log(`🔍 Buscando dados do funil para ${period} dias:`, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      })

      // 1. BUSCAR LEADS TOTAIS (Linha Vermelha)
      const { data: leadsTotal, error: errorTotal } = await supabase
        .from('leads_totais')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })

      if (errorTotal) {
        console.log('⚠️ Tabela leads_totais ainda não tem dados:', errorTotal.message)
        // Se não tem dados em leads_totais, continua com array vazio
      }

      // 2. BUSCAR LEADS DISTRIBUÍDOS (Linha Azul) - Tabela atual
      const { data: leadsDistribuidos, error: errorDistribuidos } = await supabase
        .from('leads')
        .select('*')
        .gte('timestamps', startDate.toISOString())
        .order('timestamps', { ascending: false })

      if (errorDistribuidos) throw errorDistribuidos

      // 3. BUSCAR VENDAS REALIZADAS (Linha Verde)
      const { data: vendasRealizadas, error: errorVendas } = await supabase
        .from('lead_status')
        .select('*, leads!inner(timestamps)')
        .eq('status', 'fechado')
        .gte('leads.timestamps', startDate.toISOString())

      if (errorVendas) {
        console.log('⚠️ Ainda não há vendas realizadas:', errorVendas.message)
        // Se não tem vendas, continua com array vazio
      }

      console.log('📊 Dados coletados:', {
        leadsTotal: leadsTotal?.length || 0,
        leadsDistribuidos: leadsDistribuidos?.length || 0,
        vendasRealizadas: vendasRealizadas?.length || 0
      })

      // 4. PREPARAR DADOS PARA O GRÁFICO
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
      
      // Agrupar leads totais por data
      const totalPorData = (leadsTotal || []).reduce((acc, lead) => {
        const date = format(parseISO(lead.created_at), 'yyyy-MM-dd')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Agrupar leads distribuídos por data
      const distribuidosPorData = (leadsDistribuidos || []).reduce((acc, lead) => {
        const date = format(parseISO(lead.timestamps), 'yyyy-MM-dd')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Agrupar vendas por data (usando timestamp do lead original)
      const vendasPorData = (vendasRealizadas || []).reduce((acc, venda) => {
        const date = format(parseISO(venda.leads.timestamps), 'yyyy-MM-dd')
        acc[date] = (acc[date] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // 5. CRIAR ARRAY PARA O GRÁFICO
      const funnelChartData: FunnelDataPoint[] = dateRange.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd')
        return {
          date: dateKey,
          dateFormatted: format(date, 'dd/MM'),
          leadsTotal: totalPorData[dateKey] || 0,
          leadsDistribuidos: distribuidosPorData[dateKey] || 0,
          vendasRealizadas: vendasPorData[dateKey] || 0
        }
      })

      // 6. CALCULAR MÉTRICAS DO FUNIL
      const totalBrutos = leadsTotal?.length || 0
      const totalDistrib = leadsDistribuidos?.length || 0
      const totalVendas = vendasRealizadas?.length || 0
      
      // Calcular valor total das vendas para ticket médio
      const valorTotalVendas = (vendasRealizadas || []).reduce((sum, venda) => {
        return sum + (parseFloat(venda.valor?.toString() || '0') || 0)
      }, 0)

      const funnelMetrics: FunnelMetrics = {
        totalLeadsBrutos: totalBrutos,
        totalLeadsDistribuidos: totalDistrib,
        totalVendasRealizadas: totalVendas,
        taxaQualificacao: totalBrutos > 0 ? (totalDistrib / totalBrutos) * 100 : 0,
        taxaConversao: totalDistrib > 0 ? (totalVendas / totalDistrib) * 100 : 0,
        taxaGlobal: totalBrutos > 0 ? (totalVendas / totalBrutos) * 100 : 0,
        ticketMedio: totalVendas > 0 ? valorTotalVendas / totalVendas : 0
      }

      console.log('📈 Métricas do funil calculadas:', funnelMetrics)

      setChartData(funnelChartData)
      setMetrics(funnelMetrics)

    } catch (err: any) {
      console.error('❌ Erro ao buscar dados do funil:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFunnelData()

    // Configurar realtime subscription para atualizações automáticas
    const channel = supabase
      .channel('funnel_data_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          console.log('🔄 Dados de leads atualizados, recarregando funil...')
          fetchFunnelData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads_totais'
        },
        () => {
          console.log('🔄 Dados de leads totais atualizados, recarregando funil...')
          fetchFunnelData()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_status'
        },
        () => {
          console.log('🔄 Status de leads atualizado, recarregando funil...')
          fetchFunnelData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [period])

  return {
    chartData,
    metrics,
    loading,
    error,
    refetch: fetchFunnelData
  }
}