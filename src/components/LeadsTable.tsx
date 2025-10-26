"use client";

import { Lead } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Car, Clock, Phone, Search, User } from "lucide-react";
import { useMemo, useState } from "react";

interface LeadsTableProps {
  leads: Lead[];
  loading?: boolean;
  onLeadClick?: (lead: Lead) => void;
}

type StatusType = "novo" | "contato" | "todos";

export default function LeadsTable({
  leads,
  loading,
  onLeadClick,
}: LeadsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType>("todos");
  const [vendorFilter, setVendorFilter] = useState("todos");

  // Obter vendedores únicos para o filtro
  const uniqueVendors = useMemo(() => {
    const vendors = Array.from(
      new Set(
        leads.filter((lead) => lead.vendedor).map((lead) => lead.vendedor!)
      )
    );
    return vendors.sort();
  }, [leads]);

  // Filtrar leads baseado nos filtros
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Filtro de busca
      const searchMatch =
        searchTerm === "" ||
        lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.telefone?.includes(searchTerm) ||
        lead.veiculo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.vendedor?.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de vendedor
      const vendorMatch =
        vendorFilter === "todos" || lead.vendedor === vendorFilter;

      // Filtro de status (simulado baseado na data - leads dos últimos 2 dias são "novos")
      const leadDate = parseISO(lead.timestamps);
      const isRecent =
        Date.now() - leadDate.getTime() < 2 * 24 * 60 * 60 * 1000;
      const statusMatch =
        statusFilter === "todos" ||
        (statusFilter === "novo" && isRecent) ||
        (statusFilter === "contato" && !isRecent);

      return searchMatch && vendorMatch && statusMatch;
    });
  }, [leads, searchTerm, statusFilter, vendorFilter]);

  const getStatusBadge = (lead: Lead) => {
    const leadDate = parseISO(lead.timestamps);
    const isRecent = Date.now() - leadDate.getTime() < 2 * 24 * 60 * 60 * 1000;

    if (isRecent) {
      return (
        <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded-lg">
          Novo
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 bg-warning-50 text-warning-600 text-xs font-semibold rounded-lg">
          Contato
        </span>
      );
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = parseISO(timestamp);
    return format(date, "dd/MM HH:mm", { locale: ptBR });
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return "-";
    // Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
        7
      )}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
        6
      )}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-64 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-accent rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-card border border-border">
      {/* Header com filtros - fixo */}
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="flex flex-col gap-4">
          {/* Filtros responsivos */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusType)}
              className="px-3 py-2 border border-border bg-card text-card-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">Todos Status</option>
              <option value="novo">Novos</option>
              <option value="contato">Em Contato</option>
            </select>

            {/* Filtro de Vendedor */}
            <select
              value={vendorFilter}
              onChange={(e) => setVendorFilter(e.target.value)}
              className="px-3 py-2 border border-border bg-card text-card-foreground rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="todos">Todos Vendedores</option>
              {uniqueVendors.map((vendor) => (
                <option key={vendor} value={vendor}>
                  {vendor}
                </option>
              ))}
            </select>

            {/* Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nome, telefone ou veículo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-border bg-card text-card-foreground placeholder:text-muted-foreground rounded-lg w-full text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-muted-foreground">
            {filteredLeads.length} de {leads.length} leads
            {searchTerm && ` encontrados para "${searchTerm}"`}
          </div>
        </div>
      </div>

      {/* Tabela com scroll independente */}
      <div className="overflow-auto" style={{ maxHeight: '500px' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-card border-b border-border z-10">
              <tr>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Data/Hora</span>
                    <span className="sm:hidden">Data</span>
                  </div>
                </th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome
                  </div>
                </th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span className="hidden md:inline">Telefone</span>
                    <span className="md:hidden">Tel.</span>
                  </div>
                </th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Veículo
                  </div>
                </th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card hidden xl:table-cell">
                  Vendedor
                </th>
                <th className="text-left py-3 px-3 sm:px-4 font-semibold text-muted-foreground text-sm bg-card">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`border-b border-border transition-colors ${
                      onLeadClick
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => onLeadClick?.(lead)}
                  >
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-card-foreground whitespace-nowrap">
                      {formatDateTime(lead.timestamps)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-card-foreground">
                      {lead.nome}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                      {formatPhone(lead.telefone)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                      {lead.veiculo || "-"}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground hidden xl:table-cell">
                      {lead.vendedor || "-"}
                    </td>
                    <td className="py-3 px-3 sm:px-4">{getStatusBadge(lead)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground text-sm"
                  >
                    {searchTerm ||
                    statusFilter !== "todos" ||
                    vendorFilter !== "todos"
                      ? "Nenhum lead encontrado com os filtros aplicados"
                      : "Nenhum lead encontrado"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
