'use client'

import { createSupabaseClient } from '@/lib/supabase'
import { DollarSign, Hash, Target, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface MetaModalProps {
  vendedorNome: string
  isOpen: boolean
  onClose: () => void
  onSave: (metaValor: number, metaQuantidade: number) => void
}

interface VendedorMeta {
  id?: number
  vendedor: string
  mes_ano: string
  meta_valor: number
  meta_quantidade: number
  created_at?: string
  updated_at?: string
}

export default function MetaModal({ vendedorNome, isOpen, onClose, onSave }: MetaModalProps) {
  const [metaValor, setMetaValor] = useState('')
  const [metaQuantidade, setMetaQuantidade] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingMeta, setExistingMeta] = useState<VendedorMeta | null>(null)
  const supabase = createSupabaseClient()

  // Obter mês/ano atual
  const currentDate = new Date()
  const mesAno = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  const mesAnoFormatted = currentDate.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  })

  // Buscar meta existente quando modal abrir
  useEffect(() => {
    if (isOpen && vendedorNome) {
      fetchExistingMeta()
    }
  }, [isOpen, vendedorNome])

  const fetchExistingMeta = async () => {
    try {
      const { data, error } = await supabase
        .from('vendedor_metas')
        .select('*')
        .eq('vendedor', vendedorNome)
        .eq('mes_ano', mesAno)
        .single()

      if (data && !error) {
        setExistingMeta(data)
        setMetaValor(data.meta_valor ? formatCurrency(data.meta_valor.toString()) : '')
        setMetaQuantidade(data.meta_quantidade ? data.meta_quantidade.toString() : '')
      } else {
        // Reset para valores padrão se não há meta existente
        setExistingMeta(null)
        setMetaValor('')
        setMetaQuantidade('')
      }
    } catch (error) {
      console.log('Nenhuma meta encontrada para este mês')
      setExistingMeta(null)
      setMetaValor('')
      setMetaQuantidade('')
    }
  }

  const handleSave = async () => {
    if (!vendedorNome) return

    setLoading(true)
    try {
      const valorNumerico = parseFloat(metaValor.replace(/[^\d,]/g, '').replace(',', '.')) || 0
      const quantidadeNumerica = parseInt(metaQuantidade) || 0

      if (valorNumerico <= 0 || quantidadeNumerica <= 0) {
        alert('Por favor, informe valores válidos para meta de valor e quantidade.')
        return
      }

      const metaData = {
        vendedor: vendedorNome,
        mes_ano: mesAno,
        meta_valor: valorNumerico,
        meta_quantidade: quantidadeNumerica
      }

      let result
      if (existingMeta) {
        // Atualizar meta existente
        result = await supabase
          .from('vendedor_metas')
          .update(metaData)
          .eq('id', existingMeta.id)
      } else {
        // Criar nova meta
        result = await supabase
          .from('vendedor_metas')
          .insert([metaData])
      }

      if (result.error) {
        throw result.error
      }

      // Callback para atualizar a UI
      onSave(valorNumerico, quantidadeNumerica)
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar meta:', error)
      alert('Erro ao salvar meta: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Converte para número e formata
    const amount = parseInt(numbers) / 100
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const formattedValue = formatCurrency(inputValue)
    setMetaValor(formattedValue)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Configurar Meta Mensal
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Informações do período */}
            <div className="bg-primary-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{vendedorNome}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    Meta para {mesAnoFormatted}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta de Valor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta de Faturamento Mensal
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={metaValor}
                  onChange={handleValorChange}
                  placeholder="R$ 0,00"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Valor total que deseja faturar neste mês
              </p>
            </div>

            {/* Meta de Quantidade */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta de Vendas (Quantidade)
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  value={metaQuantidade}
                  onChange={(e) => setMetaQuantidade(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Número de negócios que deseja fechar neste mês
              </p>
            </div>

            {/* Preview da meta */}
            {metaValor && metaQuantidade && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Resumo da Meta:</h5>
                <div className="space-y-1 text-sm text-gray-600">
                  <div>💰 Faturamento: {metaValor}</div>
                  <div>🎯 Quantidade: {metaQuantidade} vendas</div>
                  <div>📊 Ticket médio: {
                    metaValor && metaQuantidade ? 
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(
                      (parseFloat(metaValor.replace(/[^\d,]/g, '').replace(',', '.')) || 0) / 
                      (parseInt(metaQuantidade) || 1)
                    ) : 'R$ 0,00'
                  }</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !metaValor || !metaQuantidade}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Salvando...' : (existingMeta ? 'Atualizar Meta' : 'Definir Meta')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}