/**
 * Página de Métricas de Produto - Análise de Veículos Consultados
 * Integrado com a tabela veiculos_consulta (FASE 5A)
 */

'use client'

import { useState } from 'react'
import { useVeiculosConsulta, VeiculosFilters } from '@/hooks/useVeiculosConsulta'
import VeiculosStats from '@/components/VeiculosStats'
import AdvancedVehicleFilters from '@/components/AdvancedVehicleFilters'
import VehicleAnalytics from '@/components/VehicleAnalytics'
import { Car, AlertCircle } from 'lucide-react'

export default function MetricasProdutoPage() {
  const [filters, setFilters] = useState<VeiculosFilters>({})

  const {
    veiculos,
    stats,
    agregados,
    loading,
    error,
    getMarcas,
    getCombustiveis,
    getCambios,
  } = useVeiculosConsulta(filters)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
          <Car className="h-8 w-8 text-blue-600" />
          Métricas de Produto
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada dos veículos consultados em tempo real
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                Erro ao carregar dados
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPIs - Métricas Gerais */}
      <VeiculosStats stats={stats} loading={loading} />

      {/* Filtros Avançados */}
      <AdvancedVehicleFilters
        filters={filters}
        onFiltersChange={setFilters}
        marcas={getMarcas()}
        combustiveis={getCombustiveis()}
        cambios={getCambios()}
      />

      {/* Análises e Tabela/Cards */}
      <VehicleAnalytics agregados={agregados} loading={loading} />
    </div>
  )
}
