/**
 * Componente de métricas gerais de veículos consultados
 * Exibe KPIs principais da tabela veiculos_consulta
 */

'use client'

import { VeiculoStats, formatPreco } from '@/hooks/useVeiculosConsulta'
import { Car, Database, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'

interface VeiculosStatsProps {
  stats: VeiculoStats | null
  loading?: boolean
}

export default function VeiculosStats({ stats, loading }: VeiculosStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const cards = [
    {
      title: 'Total de Veículos',
      value: stats.total_veiculos.toLocaleString('pt-BR'),
      subtitle: `${stats.total_marcas} marcas • ${stats.total_modelos} modelos`,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Usuários Únicos',
      value: stats.usuarios_unicos.toLocaleString('pt-BR'),
      subtitle: 'Leads que consultaram veículos',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Preço Médio',
      value: formatPreco(stats.preco_medio),
      subtitle: 'Média de todos os veículos',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Período de Dados',
      value: formatDateRange(stats.primeiro_registro, stats.ultimo_registro),
      subtitle: `Última consulta: ${formatRelativeTime(stats.ultimo_registro)}`,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`${card.bgColor} p-3 rounded-lg`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>

          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            {card.title}
          </h3>

          <p className="text-2xl font-bold text-card-foreground mb-2">
            {card.value}
          </p>

          <p className="text-xs text-muted-foreground">{card.subtitle}</p>
        </div>
      ))}
    </div>
  )
}

/**
 * Formata range de datas
 */
function formatDateRange(inicio: string, fim: string): string {
  const diffDays = Math.floor(
    (new Date(fim).getTime() - new Date(inicio).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (diffDays < 30) {
    return `${diffDays} dias`
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)
    return `${months} ${months === 1 ? 'mês' : 'meses'}`
  } else {
    const years = Math.floor(diffDays / 365)
    return `${years} ${years === 1 ? 'ano' : 'anos'}`
  }
}

/**
 * Formata data relativa (ex: "há 2 horas")
 */
function formatRelativeTime(date: string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'agora'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 30) return `há ${diffDays} dias`

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(past)
}
