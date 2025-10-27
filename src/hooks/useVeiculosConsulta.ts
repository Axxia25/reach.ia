/**
 * Hook para gerenciar dados da tabela veiculos_consulta
 * Fornece dados em tempo real com filtros e estatísticas
 */

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'

export interface VeiculoConsulta {
  id_veiculos: number
  placa: string | null
  marca: string | null
  marca_apelido: string | null
  modelo: string | null
  modelo_pai: string | null
  ano_fabricacao: string | null
  ano_modelo: string | null
  carroceria: string | null
  combustivel: string | null
  cambio: string | null
  potencia: string | null
  portas: string | null
  cor: string | null
  km: number | null
  zero_km: string | null
  preco: string | null
  preco_promocao: string | null
  preco_formatado: string | null
  conversation_id: string | null
  created_at: string
  updated_at: string
}

export interface VeiculoStats {
  total_veiculos: number
  total_marcas: number
  total_modelos: number
  usuarios_unicos: number
  preco_medio: number
  primeiro_registro: string
  ultimo_registro: string
}

export interface VeiculoAgregado {
  marca: string
  modelo: string
  total_consultas: number
  usuarios_unicos: number
  preco_medio: number
  preco_min: number
  preco_max: number
  ultima_consulta: string
  anos: string[]
  combustiveis: string[]
  cambios: string[]
}

export interface VeiculosFilters {
  marca?: string
  modelo?: string
  ano_min?: number
  ano_max?: number
  preco_min?: number
  preco_max?: number
  combustivel?: string
  cambio?: string
  zero_km?: boolean
  search?: string
}

export function useVeiculosConsulta(filters?: VeiculosFilters) {
  const supabase = createSupabaseClient()
  const [veiculos, setVeiculos] = useState<VeiculoConsulta[]>([])
  const [stats, setStats] = useState<VeiculoStats | null>(null)
  const [agregados, setAgregados] = useState<VeiculoAgregado[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para buscar estatísticas gerais
  const fetchStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('veiculos_stats')
        .select('*')
        .single()

      if (error) throw error
      setStats(data)
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err)
    }
  }, [supabase])

  // Função para buscar veículos com filtros
  const fetchVeiculos = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('veiculos_consulta')
        .select('*')
        .order('created_at', { ascending: false })

      // Aplicar filtros
      if (filters?.marca) {
        query = query.eq('marca', filters.marca)
      }

      if (filters?.modelo) {
        query = query.ilike('modelo', `%${filters.modelo}%`)
      }

      if (filters?.ano_min) {
        query = query.gte('ano_modelo', filters.ano_min.toString())
      }

      if (filters?.ano_max) {
        query = query.lte('ano_modelo', filters.ano_max.toString())
      }

      if (filters?.combustivel) {
        query = query.eq('combustivel', filters.combustivel)
      }

      if (filters?.cambio) {
        query = query.eq('cambio', filters.cambio)
      }

      if (filters?.zero_km !== undefined) {
        query = query.eq('zero_km', filters.zero_km ? 'S' : 'N')
      }

      if (filters?.search) {
        query = query.or(
          `marca.ilike.%${filters.search}%,modelo.ilike.%${filters.search}%,marca_apelido.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      // Filtrar por preço (client-side devido ao formato VARCHAR)
      let filteredData = data || []

      if (filters?.preco_min || filters?.preco_max) {
        filteredData = filteredData.filter((v) => {
          const preco = parsePreco(v.preco)
          if (preco === null) return false
          if (filters.preco_min && preco < filters.preco_min) return false
          if (filters.preco_max && preco > filters.preco_max) return false
          return true
        })
      }

      setVeiculos(filteredData)
    } catch (err) {
      console.error('Erro ao buscar veículos:', err)
      setError('Falha ao carregar veículos')
    } finally {
      setLoading(false)
    }
  }, [filters, supabase])

  // Função para agregar dados por marca/modelo
  const fetchAgregados = useCallback(async () => {
    try {
      // Usar a mesma lógica de filtros que fetchVeiculos
      let query = supabase
        .from('veiculos_consulta')
        .select('*')

      // Aplicar os mesmos filtros
      if (filters?.marca) {
        query = query.eq('marca', filters.marca)
      }

      if (filters?.modelo) {
        query = query.ilike('modelo', `%${filters.modelo}%`)
      }

      if (filters?.ano_min) {
        query = query.gte('ano_modelo', filters.ano_min.toString())
      }

      if (filters?.ano_max) {
        query = query.lte('ano_modelo', filters.ano_max.toString())
      }

      if (filters?.combustivel) {
        query = query.eq('combustivel', filters.combustivel)
      }

      if (filters?.cambio) {
        query = query.eq('cambio', filters.cambio)
      }

      if (filters?.zero_km !== undefined) {
        query = query.eq('zero_km', filters.zero_km ? 'S' : 'N')
      }

      if (filters?.search) {
        query = query.or(
          `marca.ilike.%${filters.search}%,modelo.ilike.%${filters.search}%,marca_apelido.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      // Filtrar por preço (client-side devido ao formato VARCHAR)
      let filteredData = data || []

      if (filters?.preco_min || filters?.preco_max) {
        filteredData = filteredData.filter((v) => {
          const preco = parsePreco(v.preco)
          if (preco === null) return false
          if (filters.preco_min && preco < filters.preco_min) return false
          if (filters.preco_max && preco > filters.preco_max) return false
          return true
        })
      }

      // Agregar dados manualmente
      const grouped = filteredData.reduce((acc, veiculo) => {
        const key = `${veiculo.marca}|||${veiculo.modelo}`

        if (!acc[key]) {
          acc[key] = {
            marca: veiculo.marca || 'Não informado',
            modelo: veiculo.modelo || 'Não informado',
            total_consultas: 0,
            usuarios_unicos: new Set(),
            precos: [],
            anos: new Set(),
            combustiveis: new Set(),
            cambios: new Set(),
            ultima_consulta: veiculo.created_at,
          }
        }

        acc[key].total_consultas++
        if (veiculo.conversation_id) {
          acc[key].usuarios_unicos.add(veiculo.conversation_id)
        }

        const preco = parsePreco(veiculo.preco)
        if (preco !== null) {
          acc[key].precos.push(preco)
        }

        if (veiculo.ano_modelo) {
          acc[key].anos.add(veiculo.ano_modelo)
        }

        if (veiculo.combustivel) {
          acc[key].combustiveis.add(veiculo.combustivel)
        }

        if (veiculo.cambio) {
          acc[key].cambios.add(veiculo.cambio)
        }

        if (new Date(veiculo.created_at) > new Date(acc[key].ultima_consulta)) {
          acc[key].ultima_consulta = veiculo.created_at
        }

        return acc
      }, {} as Record<string, any>)

      // Converter para array e calcular estatísticas
      const agregadosArray: VeiculoAgregado[] = Object.values(grouped).map(
        (item: any) => ({
          marca: item.marca,
          modelo: item.modelo,
          total_consultas: item.total_consultas,
          usuarios_unicos: item.usuarios_unicos.size,
          preco_medio:
            item.precos.length > 0
              ? item.precos.reduce((a: number, b: number) => a + b, 0) /
                item.precos.length
              : 0,
          preco_min:
            item.precos.length > 0 ? Math.min(...item.precos) : 0,
          preco_max:
            item.precos.length > 0 ? Math.max(...item.precos) : 0,
          ultima_consulta: item.ultima_consulta,
          anos: Array.from(item.anos),
          combustiveis: Array.from(item.combustiveis),
          cambios: Array.from(item.cambios),
        })
      )

      // Ordenar por total de consultas
      agregadosArray.sort((a, b) => b.total_consultas - a.total_consultas)

      setAgregados(agregadosArray)
    } catch (err) {
      console.error('Erro ao agregar dados:', err)
    }
  }, [filters, supabase])

  // Buscar dados iniciais
  useEffect(() => {
    fetchStats()
    fetchVeiculos()
    fetchAgregados()
  }, [fetchStats, fetchVeiculos, fetchAgregados])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('veiculos_consulta_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'veiculos_consulta',
        },
        () => {
          fetchStats()
          fetchVeiculos()
          fetchAgregados()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchStats, fetchVeiculos, fetchAgregados])

  // Funções auxiliares
  const getMarcas = useCallback(() => {
    const marcas = new Set<string>()
    veiculos.forEach((v) => {
      if (v.marca) marcas.add(v.marca)
    })
    return Array.from(marcas).sort()
  }, [veiculos])

  const getCombustiveis = useCallback(() => {
    const combustiveis = new Set<string>()
    veiculos.forEach((v) => {
      if (v.combustivel) combustiveis.add(v.combustivel)
    })
    return Array.from(combustiveis).sort()
  }, [veiculos])

  const getCambios = useCallback(() => {
    const cambios = new Set<string>()
    veiculos.forEach((v) => {
      if (v.cambio) cambios.add(v.cambio)
    })
    return Array.from(cambios).sort()
  }, [veiculos])

  return {
    veiculos,
    stats,
    agregados,
    loading,
    error,
    getMarcas,
    getCombustiveis,
    getCambios,
    refetch: fetchVeiculos,
  }
}

/**
 * Utilitário para parsear preço em formato VARCHAR para número
 */
function parsePreco(preco: string | null): number | null {
  if (!preco) return null

  // Remove R$, espaços, pontos e substitui vírgula por ponto
  const cleaned = preco
    .replace(/R\$/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

/**
 * Utilitário para formatar preço
 */
export function formatPreco(preco: number | null): string {
  if (preco === null || preco === 0) return 'Não informado'

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(preco)
}
