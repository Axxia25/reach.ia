"use client";

import { useFunnelData } from "@/hooks/useFunnelData";
import {
  DollarSign,
  ShoppingCart,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

interface ConversionMetricsProps {
  period: number;
  loading?: boolean;
}

export default function ConversionMetrics({
  period,
  loading,
}: ConversionMetricsProps) {
  const { metrics, loading: funnelLoading, error } = useFunnelData(period);

  if (loading || funnelLoading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="h-6 bg-muted rounded w-40 mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-accent rounded-lg p-4">
              <div className="h-4 bg-muted rounded w-24 mb-2 animate-pulse"></div>
              <div className="h-8 bg-muted rounded w-16 mb-2 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-32 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="text-center py-8">
          <div className="text-danger-500 mb-2">
            ⚠️ Erro ao carregar métricas
          </div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    );
  }

  // Função para formatar percentual
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Determinar cor e ícone baseado na performance
  const getPerformanceIndicator = (
    value: number,
    type: "conversion" | "qualification"
  ) => {
    const threshold = type === "conversion" ? 2 : 20; // 2% conversão, 20% qualificação
    const isGood = value >= threshold;

    return {
      color: isGood ? "text-success-600" : "text-warning-600",
      bgColor: isGood
        ? "bg-success-50 dark:bg-success-900/20"
        : "bg-warning-50 dark:bg-warning-900/20",
      icon: isGood ? TrendingUp : TrendingDown,
    };
  };

  const qualificationIndicator = getPerformanceIndicator(
    metrics.taxaQualificacao,
    "qualification"
  );
  const conversionIndicator = getPerformanceIndicator(
    metrics.taxaConversao,
    "conversion"
  );

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-card-foreground">
          Métricas de Conversão
        </h3>
        <span className="text-sm text-muted-foreground">
          Últimos {period} dias
        </span>
      </div>

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Taxa de Qualificação */}
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border-l-4 border-l-primary-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-card-foreground">
                Taxa Qualificação
              </span>
            </div>
            <qualificationIndicator.icon
              className={`w-4 h-4 ${qualificationIndicator.color}`}
            />
          </div>
          <div className="text-2xl font-bold text-card-foreground mb-1">
            {formatPercentage(metrics.taxaQualificacao)}
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.totalLeadsDistribuidos} de {metrics.totalLeadsBrutos} leads
          </div>
        </div>

        {/* Taxa de Conversão */}
        <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border-l-4 border-l-success-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-4 h-4 text-success-500" />
              <span className="text-sm font-medium text-card-foreground">
                Taxa Conversão
              </span>
            </div>
            <conversionIndicator.icon
              className={`w-4 h-4 ${conversionIndicator.color}`}
            />
          </div>
          <div className="text-2xl font-bold text-card-foreground mb-1">
            {formatPercentage(metrics.taxaConversao)}
          </div>
          <div className="text-xs text-muted-foreground">
            {metrics.totalVendasRealizadas} de {metrics.totalLeadsDistribuidos}{" "}
            leads
          </div>
        </div>

        {/* Taxa Global */}
        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border-l-4 border-l-warning-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-warning-500" />
              <span className="text-sm font-medium text-card-foreground">
                Taxa Global
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-card-foreground mb-1">
            {formatPercentage(metrics.taxaGlobal)}
          </div>
          <div className="text-xs text-muted-foreground">
            Eficiência geral do funil
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border-l-4 border-l-gray-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-card-foreground">
                Ticket Médio
              </span>
            </div>
          </div>
          <div className="text-2xl font-bold text-card-foreground mb-1">
            {formatCurrency(metrics.ticketMedio)}
          </div>
          <div className="text-xs text-muted-foreground">
            Por venda realizada
          </div>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 border border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {metrics.totalLeadsBrutos}
            </div>
            <div className="text-sm text-muted-foreground">Leads Recebidos</div>
          </div>

          <div>
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {metrics.totalVendasRealizadas}
            </div>
            <div className="text-sm text-muted-foreground">Vendas Fechadas</div>
          </div>

          <div>
            <div className="text-lg font-bold text-card-foreground">
              {formatCurrency(
                metrics.ticketMedio * metrics.totalVendasRealizadas
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              Faturamento Total
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores de Performance */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="text-center p-3 bg-accent rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">
            Potencial de Melhoria
          </div>
          <div className="text-lg font-semibold text-card-foreground">
            {metrics.taxaConversao < 2
              ? "Alta"
              : metrics.taxaConversao < 5
              ? "Média"
              : "Baixa"}
          </div>
          <div className="text-xs text-muted-foreground/70">
            Conversão atual vs mercado (2-5%)
          </div>
        </div>

        <div className="text-center p-3 bg-accent rounded-lg">
          <div className="text-sm text-muted-foreground mb-1">
            Status do Funil
          </div>
          <div className="text-lg font-semibold text-card-foreground">
            {metrics.totalLeadsBrutos > 0 ? "Ativo" : "Configurando"}
          </div>
          <div className="text-xs text-muted-foreground/70">
            {metrics.totalLeadsBrutos > 0
              ? "Dados sendo processados"
              : "Aguardando dados"}
          </div>
        </div>
      </div>

      {/* Mensagem se não há dados */}
      {metrics.totalLeadsBrutos === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <div className="text-lg mb-2">📊 Configurando métricas...</div>
          <div className="text-sm">
            Importe dados para visualizar as métricas de conversão
          </div>
        </div>
      )}
    </div>
  );
}
