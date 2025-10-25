"use client";

import ConversionMetrics from "@/components/ConversionMetrics";
import FilaComercial from "@/components/FilaComercial";
import FunnelChart from "@/components/FunnelChart";
import LeadsTable from "@/components/LeadsTable";
import MetricsCards from "@/components/MetricsCards";
import Sidebar from "@/components/Sidebar";
import TopVeiculos from "@/components/TopVeiculos";
import { useLeads } from "@/hooks/useLeads";
import { createSupabaseClient } from "@/lib/supabase";
import { Calendar, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [period, setPeriod] = useState(7);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  const {
    leads,
    dailySummary,
    vendorSummary,
    metrics,
    loading,
    error,
    refetch,
  } = useLeads(period);

  // Verificar autenticação e buscar perfil
  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
        return;
      }

      setUser(session.user);

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from("vendedor_profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Erro ao buscar perfil:", profileError);
      } else {
        setUserProfile(profile);
      }
    };

    checkAuthAndProfile();

    // Listener para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleVendorClick = (vendedor: string) => {
    router.push(`/dashboard/vendedor/${vendedor}`);
  };

  const periodOptions = [
    { value: 7, label: "Últimos 7 dias" },
    { value: 30, label: "Últimos 30 dias" },
    { value: 90, label: "Últimos 90 dias" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        user={user}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        vendedores={vendorSummary}
      />

      {/* Main Content com margem para sidebar */}
      <div className="flex-1 flex flex-col">
        {/* Header Simplificado */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-foreground">
                  Dashboard Leads (Gerencial)
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                {/* Seletor de período */}
                <div className="flex items-center space-x-2">
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
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="mb-8">
            <FunnelChart period={period} loading={loading} />
          </div>

          {/* Grid 3 Componentes Embaixo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            {/* Fila Comercial */}
            <div className="lg:col-span-1">
              <FilaComercial
                vendorSummary={vendorSummary}
                leads={leads}
                loading={loading}
                onVendorClick={handleVendorClick}
              />
            </div>

            {/* Top Veículos */}
            <div className="lg:col-span-1">
              <TopVeiculos leads={leads} loading={loading} />
            </div>

            {/* Métricas de Conversão */}
            <div className="lg:col-span-2">
              <ConversionMetrics period={period} loading={loading} />
            </div>
          </div>

          {/* Leads Table */}
          <LeadsTable leads={leads} loading={loading} />
        </main>
      </div>
    </div>
  );
}
