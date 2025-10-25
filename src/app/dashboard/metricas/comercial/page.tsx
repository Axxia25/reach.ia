'use client'

import { useState } from 'react'
import { TrendingUp, Users, Target, BarChart3 } from 'lucide-react'

export default function MetricasComercialPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-600" />
          Métricas Comerciais
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada de conversão, performance de vendas e gestão da pipeline comercial
        </p>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Migração de Componentes Planejada
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Os componentes <code className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">ConversionMetrics.tsx</code> e <code className="bg-green-100 dark:bg-green-900/50 px-2 py-1 rounded">LeadsTable.tsx</code> serão movidos para esta página.
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-card-foreground flex items-center gap-2">
            <Target className="h-5 w-5" />
            Métricas de Conversão
          </h2>
          <span className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200 px-2 py-1 rounded">
            ConversionMetrics.tsx será migrado aqui
          </span>
        </div>
        
        <div className="text-muted-foreground text-center py-8">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">Componente atual com 4 cards de métricas + resumo detalhado</p>
        </div>
      </div>
    </div>
  )
}
