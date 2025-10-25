'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useResponsive } from '@/hooks/useResponsive'

interface MetricsCardsProps {
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
  loading?: boolean
}

interface MetricCardProps {
  value: number | string
  label: string
  trend: number
  loading?: boolean
}

function MetricCard({ value, label, trend, loading }: MetricCardProps) {
  const isPositive = trend > 0
  const isNeutral = trend === 0
  
  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-16 mb-2"></div>
          <div className="h-4 bg-muted rounded w-24 mb-2"></div>
          <div className="h-4 bg-muted rounded w-32"></div>
        </div>
      </div>
    )
  }

  const formatTrend = (trend: number) => {
    if (isNeutral) return 'Sem alteração'
    const prefix = isPositive ? '+' : ''
    return `${prefix}${trend.toFixed(1)}% vs período anterior`
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-3xl font-bold text-card-foreground mb-1">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </div>
          <div className="text-muted-foreground font-medium mb-2">
            {label}
          </div>
          <div className={`flex items-center text-sm font-semibold ${
            isNeutral 
              ? 'text-muted-foreground' 
              : isPositive 
                ? 'text-success-600 dark:text-success-400' 
                : 'text-danger-600 dark:text-danger-400'
          }`}>
            {!isNeutral && (
              isPositive ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )
            )}
            {formatTrend(trend)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MetricsCards({ metrics, loading }: MetricsCardsProps) {
  const { is3XL, is4XL, is2XL, width, screenSize } = useResponsive()

  // Grid responsivo baseado no tamanho da tela
  const getGridCols = () => {
  const totalCards = cards.length // 4 cards
  
  if (is4XL) {
    // Para ultra wide, máximo 4 colunas (número de cards)
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
  }
  if (is3XL) {
    // Para 27", mantém 4 colunas
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
  }
  if (is2XL) {
    return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4'
  }
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4' // Padrão
}

  const cards = [
    {
      value: metrics.totalLeads,
      label: 'Total Leads',
      trend: metrics.leadsTrend
    },
    {
      value: metrics.activeVendors,
      label: 'Vendedores Ativos',
      trend: metrics.vendorsTrend
    },
    {
      value: metrics.uniqueVehicles,
      label: 'Veículos Consultados',
      trend: metrics.vehiclesTrend
    },
    {
      value: metrics.avgLeadsPerDay,
      label: 'Leads/Dia Média',
      trend: metrics.avgTrend
    }
  ]

  return (
    <div className={`grid ${getGridCols()} gap-6 mb-8`}>
      {cards.map((card, index) => (
        <MetricCard
          key={index}
          value={card.value}
          label={card.label}
          trend={card.trend}
          loading={loading}
        />
      ))}
    </div>
  )
}