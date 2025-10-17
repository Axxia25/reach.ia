'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

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
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
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
    <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </div>
          <div className="text-gray-500 font-medium mb-2">
            {label}
          </div>
          <div className={`flex items-center text-sm font-semibold ${
            isNeutral 
              ? 'text-gray-500' 
              : isPositive 
                ? 'text-success-600' 
                : 'text-danger-600'
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
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
