'use client'

import { createSupabaseClient, Lead } from '@/lib/supabase'
import { formatDateTime, formatPhone } from '@/lib/utils'
import { CheckCircle, Clock, DollarSign, X, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LeadStatusModalProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
  onSave: (leadId: number, status: string, valor: number) => void
}

type StatusType = 'fechado' | 'perdido' | 'andamento'

interface LeadStatus {
  id?: number
  lead_id: number
  vendedor: string
  status: StatusType
  valor: number
  created_at?: string
  updated_at?: string
}

export default function LeadStatusModal({ lead, isOpen, onClose, onSave }: LeadStatusModalProps) {
  const [status, setStatus] = useState<StatusType>('andamento')
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(false)
  const [existingStatus, setExistingStatus] = useState<LeadStatus | null>(null)
  const supabase = createSupabaseClient()

  // Buscar status existente do lead quando modal abrir
  useEffect(() => {
    if (isOpen && lead) {
      fetchExistingStatus()
    }
  }, [isOpen, lead])

  const fetchExistingStatus = async () => {
    if (!lead) return

    try {
      const { data, error } = await supabase
        .from('lead_status')
        .select('*')
        .eq('lead_id', lead.id)
        .eq('vendedor', lead.vendedor)
        .single()

      if (data && !error) {
        setExistingStatus(data)
        setStatus(data.status as StatusType)
        setValor(data.valor ? data.valor.toString() : '')
      } else {
        // Reset para valores padrão se não há status existente
        setExistingStatus(null)
        setStatus('andamento')
        setValor('')
      }
    } catch (error) {
      console.log('Nenhum status encontrado para este lead')
      setExistingStatus(null)
      setStatus('andamento')
      setValor('')
    }
  }

  const handleSave = async () => {
    if (!lead) return

    setLoading(true)
    try {
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0

      const statusData = {
        lead_id: lead.id,
        vendedor: lead.vendedor || '',
        status,
        valor: valorNumerico
      }

      let result
      if (existingStatus) {
        // Atualizar status existente
        result = await supabase
          .from('lead_status')
          .update(statusData)
          .eq('id', existingStatus.id)
      } else {
        // Criar novo status
        result = await supabase
          .from('lead_status')
          .insert([statusData])
      }

      if (result.error) {
        throw result.error
      }

      // Callback para atualizar a UI
      onSave(lead.id, status, valorNumerico)
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar status:', error)
      alert('Erro ao salvar status: ' + error.message)
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
    setValor(formattedValue)
  }

  const getStatusColor = (statusType: StatusType) => {
    switch (statusType) {
      case 'fechado':
        return 'text-success-600 bg-success-50 border-success-200'
      case 'perdido':
        return 'text-danger-600 bg-danger-50 border-danger-200'
      case 'andamento':
        return 'text-warning-600 bg-warning-50 border-warning-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (statusType: StatusType) => {
    switch (statusType) {
      case 'fechado':
        return <CheckCircle className="w-5 h-5" />
      case 'perdido':
        return <XCircle className="w-5 h-5" />
      case 'andamento':
        return <Clock className="w-5 h-5" />
    }
  }

  if (!isOpen || !lead) return null

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
              Gerenciar Status do Lead
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
            {/* Informações do Lead */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">{lead.nome}</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>📞 {formatPhone(lead.telefone)}</div>
                <div>🚗 {lead.veiculo || 'Não informado'}</div>
                <div>📅 {formatDateTime(lead.timestamps)}</div>
              </div>
            </div>

            {/* Seletor de Status */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Status do Negócio
              </label>
              <div className="space-y-3">
                {(['fechado', 'perdido', 'andamento'] as StatusType[]).map((statusOption) => (
                  <label
                    key={statusOption}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      status === statusOption
                        ? getStatusColor(statusOption)
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={statusOption}
                      checked={status === statusOption}
                      onChange={(e) => setStatus(e.target.value as StatusType)}
                      className="sr-only"
                    />
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(statusOption)}
                      <div>
                        <div className="font-medium capitalize">
                          {statusOption === 'fechado' ? 'Negócio Fechado' :
                           statusOption === 'perdido' ? 'Negócio Perdido' :
                           'Em Andamento'}
                        </div>
                        <div className="text-xs opacity-75">
                          {statusOption === 'fechado' ? 'Venda concluída com sucesso' :
                           statusOption === 'perdido' ? 'Cliente desistiu ou não converteu' :
                           'Negociação em progresso'}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Campo Valor (apenas para negócios fechados ou em andamento) */}
            {(status === 'fechado' || status === 'andamento') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {status === 'fechado' ? 'Valor da Venda' : 'Valor Estimado'}
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={valor}
                    onChange={handleValorChange}
                    placeholder="R$ 0,00"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {status === 'fechado' 
                    ? 'Informe o valor final da venda realizada'
                    : 'Valor estimado para este negócio'
                  }
                </p>
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
              disabled={loading}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{loading ? 'Salvando...' : 'Salvar Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}