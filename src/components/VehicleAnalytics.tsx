/**
 * Componente de análises e visualizações de veículos
 * Exibe tabela detalhada, gráficos e insights
 */

'use client'

import { useState } from 'react'
import { VeiculoAgregado, formatPreco } from '@/hooks/useVeiculosConsulta'
import {
  TrendingUp,
  Users,
  DollarSign,
  Car,
  Calendar,
  Fuel,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface VehicleAnalyticsProps {
  agregados: VeiculoAgregado[]
  loading?: boolean
}

type SortField = 'total_consultas' | 'usuarios_unicos' | 'preco_medio'
type SortDirection = 'asc' | 'desc'

export default function VehicleAnalytics({
  agregados,
  loading,
}: VehicleAnalyticsProps) {
  const [sortField, setSortField] = useState<SortField>('total_consultas')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const sortedAgregados = [...agregados].sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1
    return (a[sortField] - b[sortField]) * multiplier
  })

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-card-foreground flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-blue-600" />
              Análise de Veículos Consultados
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Top {agregados.length} veículos por popularidade
            </p>
          </div>

          {/* Toggle View */}
          <div className="flex items-center gap-2 bg-accent rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-background text-card-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              Tabela
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-background text-card-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-card-foreground'
              }`}
            >
              Cards
            </button>
          </div>
        </div>
      </div>

      {/* View: Table */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-accent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Veículo
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/80"
                  onClick={() => handleSort('total_consultas')}
                >
                  <div className="flex items-center gap-1">
                    Consultas
                    {sortField === 'total_consultas' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/80"
                  onClick={() => handleSort('usuarios_unicos')}
                >
                  <div className="flex items-center gap-1">
                    Usuários
                    {sortField === 'usuarios_unicos' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-accent/80"
                  onClick={() => handleSort('preco_medio')}
                >
                  <div className="flex items-center gap-1">
                    Preço Médio
                    {sortField === 'preco_medio' &&
                      (sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Faixa de Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {sortedAgregados.map((veiculo, index) => (
                <>
                  <tr
                    key={index}
                    className="hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() =>
                      setExpandedRow(expandedRow === index ? null : index)
                    }
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          <Car className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-card-foreground">
                            {veiculo.modelo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {veiculo.marca}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-card-foreground">
                          {veiculo.total_consultas}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm text-card-foreground">
                          {veiculo.usuarios_unicos}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-card-foreground">
                          {formatPreco(veiculo.preco_medio)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-muted-foreground">
                        <div>{formatPreco(veiculo.preco_min)}</div>
                        <div className="text-xs">até</div>
                        <div>{formatPreco(veiculo.preco_max)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        {expandedRow === index ? 'Ocultar' : 'Ver mais'}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedRow === index && (
                    <tr className="bg-accent/30">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* Anos */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-4 w-4 text-orange-600" />
                              <h4 className="text-sm font-medium text-card-foreground">
                                Anos Disponíveis
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {veiculo.anos.map((ano) => (
                                <span
                                  key={ano}
                                  className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs font-medium"
                                >
                                  {ano}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Combustíveis */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Fuel className="h-4 w-4 text-green-600" />
                              <h4 className="text-sm font-medium text-card-foreground">
                                Combustíveis
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {veiculo.combustiveis.map((comb) => (
                                <span
                                  key={comb}
                                  className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium"
                                >
                                  {comb}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Câmbios */}
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Settings className="h-4 w-4 text-blue-600" />
                              <h4 className="text-sm font-medium text-card-foreground">
                                Câmbios
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {veiculo.cambios.map((cambio) => (
                                <span
                                  key={cambio}
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-medium"
                                >
                                  {cambio}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Última consulta */}
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-muted-foreground">
                            Última consulta:{' '}
                            {new Date(
                              veiculo.ultima_consulta
                            ).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View: Cards */}
      {viewMode === 'cards' && (
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAgregados.map((veiculo, index) => (
            <div
              key={index}
              className="bg-background border border-border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                    <Car className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-card-foreground">
                      {veiculo.modelo}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {veiculo.marca}
                    </p>
                  </div>
                </div>
              </div>

              {/* Métricas principais */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-accent/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      Consultas
                    </span>
                  </div>
                  <p className="text-lg font-bold text-card-foreground">
                    {veiculo.total_consultas}
                  </p>
                </div>

                <div className="bg-accent/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-3 w-3 text-purple-600" />
                    <span className="text-xs text-muted-foreground">
                      Usuários
                    </span>
                  </div>
                  <p className="text-lg font-bold text-card-foreground">
                    {veiculo.usuarios_unicos}
                  </p>
                </div>
              </div>

              {/* Preço */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Preço Médio
                  </span>
                </div>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">
                  {formatPreco(veiculo.preco_medio)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPreco(veiculo.preco_min)} até{' '}
                  {formatPreco(veiculo.preco_max)}
                </p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {veiculo.anos.slice(0, 3).map((ano) => (
                  <span
                    key={ano}
                    className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded text-xs"
                  >
                    {ano}
                  </span>
                ))}
                {veiculo.anos.length > 3 && (
                  <span className="px-2 py-0.5 bg-accent text-muted-foreground rounded text-xs">
                    +{veiculo.anos.length - 3}
                  </span>
                )}
              </div>

              {/* Última consulta */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Última consulta:{' '}
                  {new Date(veiculo.ultima_consulta).toLocaleDateString(
                    'pt-BR'
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {agregados.length === 0 && (
        <div className="p-12 text-center">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            Ajuste os filtros ou aguarde novos dados
          </p>
        </div>
      )}
    </div>
  )
}
