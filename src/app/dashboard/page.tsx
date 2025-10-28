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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard Leads (Gerencial)
          </h1>
          <p className="text-muted-foreground mt-2">
            Visão geral do desempenho de vendas
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Seletor de período */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="border border-border bg-background text-foreground rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
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

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <svg
              className="h-6 w-6 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
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

      {/* Metrics Cards */}
      <MetricsCards metrics={metrics} loading={loading} />

      {/* Funil de Vendas */}
      <FunnelChart period={period} loading={loading} />
    </div>
  );
}
