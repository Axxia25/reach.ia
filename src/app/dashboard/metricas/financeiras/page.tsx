'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, CreditCard, PiggyBank } from 'lucide-react'

export default function MetricasFinanceirasPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
          <DollarSign className="h-8 w-8 text-green-600" />
          Métricas Financeiras
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada do desempenho financeiro e faturamento do CRM
        </p>
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
            Em Desenvolvimento
          </h3>
        </div>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          Esta seção está sendo desenvolvida e conterá métricas avançadas de faturamento e performance financeira.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 opacity-60">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <span className="text-xs text-muted-foreground">Em breve</span>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            Faturamento Total
          </h3>
          <p className="text-2xl font-bold text-green-600 mb-1">--</p>
          <p className="text-sm text-muted-foreground">Mês atual</p>
        </div>
      </div>
    </div>
  )
}
