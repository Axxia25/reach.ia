"use client";

import { Lead, VendorSummary } from "@/lib/supabase";
import { Users } from "lucide-react";
import { useState } from "react";

interface FilaComercialProps {
  vendorSummary: VendorSummary[];
  leads: Lead[];
  loading?: boolean;
  onVendorClick?: (vendedor: string) => void;
}

interface VendorItemProps {
  vendor: VendorSummary;
  rank: number;
  isActive: boolean;
  onToggle: (vendedor: string, active: boolean) => void;
  onVendorClick?: (vendedor: string) => void;
  loading?: boolean;
}

function VendorItem({
  vendor,
  rank,
  isActive,
  onToggle,
  onVendorClick,
  loading,
}: VendorItemProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between py-3 px-4 bg-accent rounded-lg animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-muted rounded"></div>
          <div>
            <div className="h-4 bg-muted rounded w-20 mb-1"></div>
            <div className="h-3 bg-muted rounded w-16"></div>
          </div>
        </div>
        <div className="w-10 h-6 bg-muted rounded-full"></div>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    const colors = {
      1: "bg-yellow-500 text-white",
      2: "bg-gray-400 text-white",
      3: "bg-yellow-600 text-white",
    };
    return colors[rank as keyof typeof colors] || "bg-primary-500 text-white";
  };

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 rounded-lg transition-all border ${
        isActive
          ? "bg-card border-primary-200 shadow-sm"
          : "bg-accent border-border opacity-60"
      }`}
    >
      <div className="flex items-center space-x-3">
        {/* Rank Badge */}
        <div
          className={`flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${getRankBadge(
            rank
          )}`}
        >
          {rank}
        </div>

        {/* Vendor Info */}
        <div
          className={`cursor-pointer ${
            isActive ? "hover:text-primary-600" : ""
          }`}
          onClick={() => onVendorClick?.(vendor.vendedor)}
        >
          <div className="font-medium text-card-foreground">
            {vendor.vendedor}
          </div>
          <div className="text-sm text-muted-foreground">
            {vendor.total_leads} leads
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center">
        <button
          onClick={() => onToggle(vendor.vendedor, !isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            isActive ? "bg-primary-500" : "bg-muted"
          }`}
          aria-label={`${isActive ? "Desativar" : "Ativar"} ${vendor.vendedor}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}

export default function FilaComercial({
  vendorSummary,
  leads,
  loading,
  onVendorClick,
}: FilaComercialProps) {
  // Estado para controlar quais vendedores estão ativos
  const [activeVendors, setActiveVendors] = useState<Record<string, boolean>>(
    () => {
      // Por padrão, todos os vendedores ficam ativos
      const initial: Record<string, boolean> = {};
      vendorSummary.forEach((vendor) => {
        initial[vendor.vendedor] = true;
      });
      return initial;
    }
  );

  const handleVendorToggle = (vendedor: string, active: boolean) => {
    setActiveVendors((prev) => ({
      ...prev,
      [vendedor]: active,
    }));

    // Log para debug -
    console.log(
      `Vendedor ${vendedor} ${active ? "ativado" : "desativado"} na fila`
    );
  };

  // Mostrar apenas top 6 vendedores
  const topVendors = vendorSummary.slice(0, 6);
  const activeCount = Object.values(activeVendors).filter(Boolean).length;

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="h-6 bg-muted rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <VendorItem
              key={i}
              vendor={{} as VendorSummary}
              rank={i + 1}
              isActive={true}
              onToggle={() => {}}
              loading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-500" />
          <h3 className="text-xl font-semibold text-card-foreground">
            Fila Comercial
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {activeCount} ativo{activeCount !== 1 ? "s" : ""}
        </span>
      </div>

      {topVendors.length > 0 ? (
        <div className="space-y-3">
          {topVendors.map((vendor, index) => (
            <VendorItem
              key={vendor.vendedor}
              vendor={vendor}
              rank={index + 1}
              isActive={activeVendors[vendor.vendedor] ?? true}
              onToggle={handleVendorToggle}
              onVendorClick={onVendorClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum vendedor encontrado</p>
        </div>
      )}

      {topVendors.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Total vendedores:</span>
            <span className="font-medium text-card-foreground">
              {vendorSummary.length}
            </span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-1">
            <span>Leads distribuídos:</span>
            <span className="font-medium text-card-foreground">
              {vendorSummary.reduce((sum, v) => sum + v.total_leads, 0)}
            </span>
          </div>
        </div>
      )}

      {/* Nota sobre funcionalidade futura */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="text-xs text-blue-600 dark:text-blue-200">
          💡 <strong>Controle de Fila:</strong> Use os botões para
          ativar/desativar vendedores na distribuição de leads
        </div>
      </div>
    </div>
  );
}
