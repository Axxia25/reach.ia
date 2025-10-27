/**
 * Componente de filtros avançados para veículos
 * Permite filtragem por marca, preço, ano, combustível, etc.
 */

'use client'

import { useState } from 'react'
import { VeiculosFilters } from '@/hooks/useVeiculosConsulta'
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react'

interface AdvancedVehicleFiltersProps {
  filters: VeiculosFilters
  onFiltersChange: (filters: VeiculosFilters) => void
  marcas: string[]
  combustiveis: string[]
  cambios: string[]
}

export default function AdvancedVehicleFilters({
  filters,
  onFiltersChange,
  marcas,
  combustiveis,
  cambios,
}: AdvancedVehicleFiltersProps) {
  const [expanded, setExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState<VeiculosFilters>(filters)

  const handleFilterChange = (key: keyof VeiculosFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilters = () => {
    setLocalFilters({})
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(localFilters).filter(
    (key) => localFilters[key as keyof VeiculosFilters] !== undefined
  ).length

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header com busca rápida */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {/* Campo de busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por marca, modelo ou apelido..."
              value={localFilters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botão expandir */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFiltersCount}
              </span>
            )}
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {/* Limpar filtros */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <X className="h-4 w-4" />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filtros expandidos */}
      {expanded && (
        <div className="p-4 bg-accent/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Marca */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Marca
              </label>
              <select
                value={localFilters.marca || ''}
                onChange={(e) =>
                  handleFilterChange('marca', e.target.value || undefined)
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as marcas</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            {/* Modelo */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Modelo
              </label>
              <input
                type="text"
                placeholder="Ex: Corolla, Civic..."
                value={localFilters.modelo || ''}
                onChange={(e) =>
                  handleFilterChange('modelo', e.target.value || undefined)
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Combustível */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Combustível
              </label>
              <select
                value={localFilters.combustivel || ''}
                onChange={(e) =>
                  handleFilterChange('combustivel', e.target.value || undefined)
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {combustiveis.map((comb) => (
                  <option key={comb} value={comb}>
                    {comb}
                  </option>
                ))}
              </select>
            </div>

            {/* Câmbio */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Câmbio
              </label>
              <select
                value={localFilters.cambio || ''}
                onChange={(e) =>
                  handleFilterChange('cambio', e.target.value || undefined)
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {cambios.map((cambio) => (
                  <option key={cambio} value={cambio}>
                    {cambio}
                  </option>
                ))}
              </select>
            </div>

            {/* Ano mínimo */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ano Mínimo
              </label>
              <input
                type="number"
                placeholder="Ex: 2018"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={localFilters.ano_min || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'ano_min',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ano máximo */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Ano Máximo
              </label>
              <input
                type="number"
                placeholder="Ex: 2024"
                min="1950"
                max={new Date().getFullYear() + 1}
                value={localFilters.ano_max || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'ano_max',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preço mínimo */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Preço Mínimo (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 30000"
                min="0"
                step="1000"
                value={localFilters.preco_min || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'preco_min',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preço máximo */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Preço Máximo (R$)
              </label>
              <input
                type="number"
                placeholder="Ex: 100000"
                min="0"
                step="1000"
                value={localFilters.preco_max || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'preco_max',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )
                }
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filtro Zero KM */}
          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localFilters.zero_km === true}
                onChange={(e) =>
                  handleFilterChange('zero_km', e.target.checked || undefined)
                }
                className="w-4 h-4 text-blue-600 bg-background border-border rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-card-foreground">
                Apenas veículos 0 KM
              </span>
            </label>
          </div>

          {/* Resumo de filtros ativos */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">
                Filtros ativos:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (!value) return null
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
                    >
                      {formatFilterLabel(key as keyof VeiculosFilters, value)}
                      <button
                        onClick={() => handleFilterChange(key as keyof VeiculosFilters, undefined)}
                        className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Formata label de filtro para exibição
 */
function formatFilterLabel(key: keyof VeiculosFilters, value: any): string {
  const labels: Record<string, string> = {
    marca: 'Marca',
    modelo: 'Modelo',
    ano_min: 'Ano ≥',
    ano_max: 'Ano ≤',
    preco_min: 'Preço ≥',
    preco_max: 'Preço ≤',
    combustivel: 'Combustível',
    cambio: 'Câmbio',
    zero_km: '0 KM',
    search: 'Busca',
  }

  const label = labels[key] || key

  if (key === 'preco_min' || key === 'preco_max') {
    return `${label} R$ ${value.toLocaleString('pt-BR')}`
  }

  if (typeof value === 'boolean') {
    return label
  }

  return `${label}: ${value}`
}
