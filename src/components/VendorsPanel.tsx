'use client'

import { VendorSummary, Lead } from '@/lib/supabase'
import { User, Award } from 'lucide-react'

interface VendorsPanelProps {
  vendorSummary: VendorSummary[]
  leads: Lead[]
  loading?: boolean
}

interface VendorItemProps {
  vendor: VendorSummary
  vehicles: string[]
  rank: number
  loading?: boolean
}

function VendorItem({ vendor, vehicles, rank, loading }: VendorItemProps) {
  if (loading) {
    return (
      <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
        </div>
        <div className="w-8 h-6 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    )
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Award className="w-5 h-5 text-warning-500" />
    if (rank === 2) return <Award className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Award className="w-5 h-5 text-yellow-600" />
    return <User className="w-5 h-5 text-gray-400" />
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-warning-500'
    if (rank === 2) return 'bg-gray-400'
    if (rank === 3) return 'bg-yellow-600'
    return 'bg-primary-500'
  }

  return (
    <div className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
          {getRankIcon(rank)}
        </div>
        <div>
          <div className="font-medium text-card-foreground">
            {vendor.vendedor}
          </div>
          <div className="text-sm text-muted-foreground">
            {vehicles.length > 0 ? vehicles.slice(0, 2).join(', ') : 'Sem veículos'}
            {vehicles.length > 2 && ` +${vehicles.length - 2}`}
          </div>
        </div>
      </div>
      <div className={`${getRankColor(rank)} text-white px-3 py-1 rounded-full text-sm font-semibold`}>
        {vendor.total_leads}
      </div>
    </div>
  )
}

export default function VendorsPanel({ vendorSummary, leads, loading }: VendorsPanelProps) {
  // Obter veículos únicos por vendedor dos leads
  const getVehiclesByVendor = (vendorName: string): string[] => {
    const vendorLeads = leads.filter(lead => lead.vendedor === vendorName && lead.veiculo)
    const uniqueVehicles = Array.from(new Set(vendorLeads.map(lead => lead.veiculo!)))
    return uniqueVehicles
  }

  // Mostrar apenas top 5 vendedores
  const topVendors = vendorSummary.slice(0, 5)

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <VendorItem 
              key={i} 
              vendor={{} as VendorSummary} 
              vehicles={[]} 
              rank={i + 1} 
              loading={true} 
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <h3 className="text-xl font-semibold text-card-foreground mb-6">
        Top Vendedores
      </h3>
      
      {topVendors.length > 0 ? (
        <div className="space-y-1">
          {topVendors.map((vendor, index) => (
            <VendorItem
              key={vendor.vendedor}
              vendor={vendor}
              vehicles={getVehiclesByVendor(vendor.vendedor)}
              rank={index + 1}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
        </div>
      )}
      
      {topVendors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total vendedores:</span>
            <span className="font-medium">{vendorSummary.length}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Total leads:</span>
            <span className="font-medium">
              {vendorSummary.reduce((sum, v) => sum + v.total_leads, 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
