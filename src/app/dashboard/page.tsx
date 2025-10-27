"use client";

import FunnelChart from "@/components/FunnelChart";
import MetricsCards from "@/components/MetricsCards";
import NotificationBell from "@/components/NotificationBell";
import { useLeads } from "@/hooks/useLeads";
import { Calendar, RefreshCw } from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const [period, setPeriod] = useState(7);

  const {
    metrics,
    loading,
    error,
    refetch,
  } = useLeads(period);

  const periodOptions = [
    { value: 7, label: "Últimos 7 dias" },
    { value: 30, label: "Últimos 30 dias" },
    { value: 90, label: "Últimos 90 dias" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
        {/* Header Responsivo */}
        <header className="bg-card shadow-sm border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 sm:py-0 sm:h-16 gap-3 sm:gap-0">
              <div className="flex items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Dashboard Leads (Gerencial)
                </h1>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-3 sm:space-x-4">
                {/* Seletor de período */}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground hidden sm:inline" />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="border border-border bg-background text-foreground rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sino de Notificações */}
                <NotificationBell />

                {/* Botão de refresh */}
                <button
                  onClick={refetch}
                  disabled={loading}
                  className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
                  title="Atualizar dados"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {error && (
            <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">
                    Erro ao carregar dados
                  </h3>
                  <div className="mt-1 text-sm">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <MetricsCards metrics={metrics} loading={loading} />

          {/* Funil de Vendas - Largura Total */}
          <FunnelChart period={period} loading={loading} />
        </main>
    </div>
  );
}
