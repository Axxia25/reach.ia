'use client'

import { VendorSummary } from '@/lib/supabase'
import { BarChart3, ChevronDown, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface VendedorMenuProps {
  vendorSummary: VendorSummary[]
  loading?: boolean
}

export default function VendedorMenu({ vendorSummary, loading }: VendedorMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleVendedorClick = (vendedorNome: string) => {
    // Navegar para a página do vendedor
    const encodedName = encodeURIComponent(vendedorNome)
    router.push(`/dashboard/vendedor/${encodedName}`)
    setIsOpen(false)
  }

  if (loading) {
    return (
      <div className="relative">
        <div className="h-10 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
      </div>
    )
  }

  // Ordenar vendedores por total de leads (maior para menor)
  const sortedVendors = [...vendorSummary].sort((a, b) => b.total_leads - a.total_leads)

  return (
    <div className="relative">
      {/* Botão do dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      >
        <BarChart3 className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          Dashboard Individual
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Overlay para fechar quando clicar fora */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute top-full left-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-2">
              {/* Header do menu */}
              <div className="px-4 py-2 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">
                  Selecionar Vendedor
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Acesse o dashboard individual de cada vendedor
                </p>
              </div>

              {/* Lista de vendedores */}
              <div className="max-h-64 overflow-y-auto">
                {sortedVendors.length > 0 ? (
                  sortedVendors.map((vendor, index) => (
                    <button
                      key={vendor.vendedor}
                      onClick={() => handleVendedorClick(vendor.vendedor)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {/* Posição no ranking */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0 ? 'bg-warning-100 text-warning-700' :
                            index === 1 ? 'bg-gray-100 text-gray-700' :
                            index === 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-primary-100 text-primary-700'
                          }`}>
                            {index + 1}
                          </div>
                          
                          {/* Ícone do usuário */}
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          
                          {/* Info do vendedor */}
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {vendor.vendedor}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vendor.dias_ativos} dia{vendor.dias_ativos !== 1 ? 's' : ''} ativo{vendor.dias_ativos !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        
                        {/* Badge com total de leads */}
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          index === 0 ? 'bg-warning-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-yellow-600 text-white' :
                          'bg-primary-500 text-white'
                        }`}>
                          {vendor.total_leads}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum vendedor encontrado</p>
                  </div>
                )}
              </div>

              {/* Footer do menu */}
              {sortedVendors.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
                  <div className="text-xs text-gray-500 text-center">
                    {sortedVendors.length} vendedor{sortedVendors.length !== 1 ? 'es' : ''} • 
                    Total: {sortedVendors.reduce((sum, v) => sum + v.total_leads, 0)} leads
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}