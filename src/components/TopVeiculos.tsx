"use client";

import { Lead } from "@/lib/supabase";
import { Car } from "lucide-react";

interface TopVeiculosProps {
  leads: Lead[];
  loading?: boolean;
}

interface VeiculoData {
  veiculo: string;
  count: number;
  percentage: number;
}

export default function TopVeiculos({ leads = [], loading }: TopVeiculosProps) {
  const prepareVeiculosData = (): VeiculoData[] => {
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return [];
    }

    // Filtrar leads que têm veículo informado
    const leadsComVeiculo = leads.filter(
      (lead) => lead.veiculo && lead.veiculo.trim() !== ""
    );

    if (leadsComVeiculo.length === 0) {
      return [];
    }

    // Contar veículos
    const veiculoCount = leadsComVeiculo.reduce((acc, lead) => {
      const veiculo = lead.veiculo!.trim();
      acc[veiculo] = (acc[veiculo] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Preparar dados com percentual
    const totalComVeiculo = leadsComVeiculo.length;
    const veiculosData = Object.entries(veiculoCount)
      .map(([veiculo, count]) => ({
        veiculo,
        count,
        percentage: (count / totalComVeiculo) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Top 8 veículos

    return veiculosData;
  };

  const veiculosData = prepareVeiculosData();
  const totalVeiculosUnicos = veiculosData.length;
  const totalLeadsComVeiculo = leads.filter(
    (lead) => lead.veiculo && lead.veiculo.trim() !== ""
  ).length;

  // Cores de fundo suaves (usando variações de accent para dark mode)
  const getBackgroundColor = (index: number) => {
    const colors = [
      "bg-blue-100 dark:bg-blue-900/20",
      "bg-green-100 dark:bg-green-900/20",
      "bg-yellow-100 dark:bg-yellow-900/20",
      "bg-purple-100 dark:bg-purple-900/20",
      "bg-pink-100 dark:bg-pink-900/20",
      "bg-indigo-100 dark:bg-indigo-900/20",
      "bg-teal-100 dark:bg-teal-900/20",
      "bg-orange-100 dark:bg-orange-900/20",
    ];
    return colors[index % colors.length];
  };

  // Cores dos badges (adaptadas para dark mode)
  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-blue-200 text-blue-700 dark:bg-blue-800/50 dark:text-blue-200",
      "bg-green-200 text-green-700 dark:bg-green-800/50 dark:text-green-200",
      "bg-yellow-200 text-yellow-700 dark:bg-yellow-800/50 dark:text-yellow-200",
      "bg-purple-200 text-purple-700 dark:bg-purple-800/50 dark:text-purple-200",
      "bg-pink-200 text-pink-700 dark:bg-pink-800/50 dark:text-pink-200",
      "bg-indigo-200 text-indigo-700 dark:bg-indigo-800/50 dark:text-indigo-200",
      "bg-teal-200 text-teal-700 dark:bg-teal-800/50 dark:text-teal-200",
      "bg-orange-200 text-orange-700 dark:bg-orange-800/50 dark:text-orange-200",
    ];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="h-6 bg-muted rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between items-center py-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-muted rounded-lg animate-pulse"></div>
                <div>
                  <div className="h-4 bg-muted rounded w-20 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-muted rounded w-16 animate-pulse"></div>
                </div>
              </div>
              <div className="w-8 h-6 bg-muted rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center space-x-2 mb-6">
        <Car className="w-5 h-5 text-primary-500" />
        <h3 className="text-xl font-semibold text-card-foreground">
          Top Veículos
        </h3>
      </div>

      {veiculosData.length > 0 ? (
        <div className="space-y-3">
          {veiculosData.map((item, index) => (
            <div
              key={item.veiculo}
              className={`flex justify-between items-center p-3 rounded-lg ${getBackgroundColor(
                index
              )} border border-border hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center space-x-3">
                {/* Placeholder visual sem ícone */}
                <div
                  className={`w-10 h-10 rounded-lg ${getBackgroundColor(
                    index
                  )} border-2 border-card flex items-center justify-center`}
                >
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                </div>

                <div>
                  <div className="font-medium text-card-foreground">
                    {item.veiculo}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.count} lead{item.count !== 1 ? "s" : ""} consultado
                    {item.count !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              {/* Badge com número */}
              <div
                className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(
                  index
                )}`}
              >
                {item.count}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum veículo informado</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Total de leads: {leads.length}
          </p>
        </div>
      )}

      {veiculosData.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Total de veículos únicos:</span>
              <span className="font-medium text-card-foreground">
                {totalVeiculosUnicos}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Leads com veículo informado:</span>
              <span className="font-medium text-card-foreground">
                {totalLeadsComVeiculo}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
