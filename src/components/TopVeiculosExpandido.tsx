// src/components/TopVeiculosExpandido.tsx
"use client";

import { supabase } from "@/lib/supabase";
import { Car, DollarSign, Eye, Search, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface VeiculoConsulta {
  id_veiculos: number;
  marca: string;
  modelo: string;
  ano_modelo: string;
  preco: string;
  preco_formatado: string;
  combustivel: string;
  conversation_id: string;
  created_at: string;
}

interface VeiculoAnalysis {
  modelo: string;
  marca: string;
  total_consultas: number;
  usuarios_unicos: number;
  preco_medio: number;
  preco_min: string;
  preco_max: string;
  ultima_consulta: string;
  popularidade_score: number;
}

interface TopVeiculosExpandidoProps {
  className?: string;
}

export default function TopVeiculosExpandido({
  className,
}: TopVeiculosExpandidoProps) {
  const [veiculos, setVeiculos] = useState<VeiculoConsulta[]>([]);
  const [analises, setAnalises] = useState<VeiculoAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroMarca, setFiltroMarca] = useState("todas");
  const [filtroPreco, setFiltroPreco] = useState("todos");
  const [busca, setBusca] = useState("");
  const [visualizacao, setVisualizacao] = useState<"lista" | "cards">("cards");

  // Buscar dados da tabela veiculos_consulta
  const fetchVeiculosData = async () => {
    try {
      setLoading(true);

      // Buscar todos os veículos consultados
      const { data: veiculosData, error: veiculosError } = await supabase
        .from("veiculos_consulta")
        .select("*")
        .order("created_at", { ascending: false });

      if (veiculosError) {
        console.error("Erro ao buscar veículos:", veiculosError);
        return;
      }

      setVeiculos(veiculosData || []);

      // Processar análises dos veículos
      if (veiculosData && veiculosData.length > 0) {
        const analisesProcessadas = processarAnalises(veiculosData);
        setAnalises(analisesProcessadas);
      }
    } catch (error) {
      console.error("Erro geral:", error);
    } finally {
      setLoading(false);
    }
  };

  // Processar dados para análises
  const processarAnalises = (dados: VeiculoConsulta[]): VeiculoAnalysis[] => {
    const agrupados = dados.reduce((acc, veiculo) => {
      const chave = `${veiculo.marca}-${veiculo.modelo}`;

      if (!acc[chave]) {
        acc[chave] = {
          modelo: veiculo.modelo,
          marca: veiculo.marca,
          total_consultas: 0,
          usuarios_unicos: new Set(),
          precos: [],
          consultas: [],
        };
      }

      acc[chave].total_consultas++;
      acc[chave].usuarios_unicos.add(veiculo.conversation_id);

      // Tentar extrair preço numérico
      const precoNumerico = extrairPrecoNumerico(veiculo.preco);
      if (precoNumerico > 0) {
        acc[chave].precos.push(precoNumerico);
      }

      acc[chave].consultas.push(veiculo.created_at);

      return acc;
    }, {} as any);

    // Converter para array e calcular métricas
    return Object.values(agrupados)
      .map((item: any) => {
        const precoMedio =
          item.precos.length > 0
            ? item.precos.reduce((a: number, b: number) => a + b, 0) /
              item.precos.length
            : 0;

        const popularidadeScore =
          item.total_consultas * 0.6 + item.usuarios_unicos.size * 0.4;

        return {
          modelo: item.modelo,
          marca: item.marca,
          total_consultas: item.total_consultas,
          usuarios_unicos: item.usuarios_unicos.size,
          preco_medio: precoMedio,
          preco_min:
            item.precos.length > 0
              ? Math.min(...item.precos).toLocaleString("pt-BR")
              : "N/A",
          preco_max:
            item.precos.length > 0
              ? Math.max(...item.precos).toLocaleString("pt-BR")
              : "N/A",
          ultima_consulta: new Date(
            Math.max(
              ...item.consultas.map((d: string) => new Date(d).getTime())
            )
          ).toISOString(),
          popularidade_score: popularidadeScore,
        } as VeiculoAnalysis;
      })
      .sort((a, b) => b.popularidade_score - a.popularidade_score)
      .slice(0, 20); // Top 20 veículos
  };

  // Extrair preço numérico de string
  const extrairPrecoNumerico = (precoStr: string): number => {
    if (!precoStr) return 0;

    // Remover caracteres não numéricos exceto vírgula e ponto
    const limpo = precoStr.replace(/[^\d,.]/g, "");

    // Converter para número
    const numero = parseFloat(limpo.replace(/\./g, "").replace(",", "."));

    return isNaN(numero) ? 0 : numero;
  };

  // Filtrar análises baseado nos filtros
  const analisesFiltradas = analises.filter((item) => {
    const matchMarca =
      filtroMarca === "todas" ||
      item.marca.toLowerCase().includes(filtroMarca.toLowerCase());

    const matchBusca =
      busca === "" ||
      item.modelo.toLowerCase().includes(busca.toLowerCase()) ||
      item.marca.toLowerCase().includes(busca.toLowerCase());

    const matchPreco =
      filtroPreco === "todos" ||
      (filtroPreco === "baixo" && item.preco_medio < 30000) ||
      (filtroPreco === "medio" &&
        item.preco_medio >= 30000 &&
        item.preco_medio < 60000) ||
      (filtroPreco === "alto" && item.preco_medio >= 60000);

    return matchMarca && matchBusca && matchPreco;
  });

  // Obter marcas únicas para filtro
  const marcasUnicas = Array.from(new Set(analises.map((a) => a.marca))).sort();

  useEffect(() => {
    fetchVeiculosData();
  }, []);

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-8 border border-border">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-accent rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-accent rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com estatísticas gerais */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Car className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-card-foreground">
                Análise Completa de Veículos
              </h2>
              <p className="text-muted-foreground">
                Dados detalhados da tabela veiculos_consulta
              </p>
            </div>
          </div>

          {/* Métricas gerais */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-accent p-3 rounded-lg">
              <div className="text-2xl font-bold text-card-foreground">
                {veiculos.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Consultas
              </div>
            </div>
            <div className="bg-accent p-3 rounded-lg">
              <div className="text-2xl font-bold text-card-foreground">
                {analises.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Modelos Únicos
              </div>
            </div>
            <div className="bg-accent p-3 rounded-lg">
              <div className="text-2xl font-bold text-card-foreground">
                {marcasUnicas.length}
              </div>
              <div className="text-xs text-muted-foreground">Marcas</div>
            </div>
          </div>
        </div>

        {/* Controles de filtro */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar modelo ou marca..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por marca */}
          <select
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas as marcas</option>
            {marcasUnicas.map((marca) => (
              <option key={marca} value={marca}>
                {marca}
              </option>
            ))}
          </select>

          {/* Filtro por preço */}
          <select
            value={filtroPreco}
            onChange={(e) => setFiltroPreco(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-lg text-card-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas as faixas</option>
            <option value="baixo">Até R$ 30.000</option>
            <option value="medio">R$ 30.000 - R$ 60.000</option>
            <option value="alto">Acima de R$ 60.000</option>
          </select>

          {/* Toggle visualização */}
          <div className="flex rounded-lg border border-border bg-background">
            <button
              onClick={() => setVisualizacao("cards")}
              className={`flex-1 py-2 px-3 rounded-l-lg transition-colors ${
                visualizacao === "cards"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setVisualizacao("lista")}
              className={`flex-1 py-2 px-3 rounded-r-lg transition-colors ${
                visualizacao === "lista"
                  ? "bg-blue-600 text-white"
                  : "text-muted-foreground hover:bg-accent"
              }`}
            >
              Lista
            </button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      {analisesFiltradas.length > 0 ? (
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">
              Top Veículos por Popularidade ({analisesFiltradas.length})
            </h3>
            <div className="text-sm text-muted-foreground">
              Ordenado por: consultas + usuários únicos
            </div>
          </div>

          {visualizacao === "cards" ? (
            // Visualização em Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {analisesFiltradas.map((item, index) => (
                <div
                  key={`${item.marca}-${item.modelo}`}
                  className="bg-accent border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-card-foreground mb-1">
                        {item.modelo}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {item.marca}
                      </p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Métricas */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Consultas:
                      </span>
                      <span className="font-medium text-card-foreground">
                        {item.total_consultas}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Usuários únicos:
                      </span>
                      <span className="font-medium text-card-foreground">
                        {item.usuarios_unicos}
                      </span>
                    </div>

                    {item.preco_medio > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Preço médio:
                        </span>
                        <span className="font-medium text-green-600">
                          R$ {item.preco_medio.toLocaleString("pt-BR")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score de popularidade */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        Score:
                      </span>
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded text-xs font-bold">
                        {item.popularidade_score.toFixed(1)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Visualização em Lista
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      #
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      Veículo
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      Consultas
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      Usuários
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      Preço Médio
                    </th>
                    <th className="text-left py-3 text-muted-foreground font-medium">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analisesFiltradas.map((item, index) => (
                    <tr
                      key={`${item.marca}-${item.modelo}`}
                      className="border-b border-border hover:bg-accent transition-colors"
                    >
                      <td className="py-3 text-muted-foreground">
                        #{index + 1}
                      </td>
                      <td className="py-3">
                        <div>
                          <div className="font-medium text-card-foreground">
                            {item.modelo}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.marca}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-card-foreground font-medium">
                        {item.total_consultas}
                      </td>
                      <td className="py-3 text-card-foreground">
                        {item.usuarios_unicos}
                      </td>
                      <td className="py-3 text-green-600 font-medium">
                        {item.preco_medio > 0
                          ? `R$ ${item.preco_medio.toLocaleString("pt-BR")}`
                          : "N/A"}
                      </td>
                      <td className="py-3">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-2 py-1 rounded text-xs font-bold inline-block">
                          {item.popularidade_score.toFixed(1)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card rounded-xl p-8 border border-border text-center">
          <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-muted-foreground">
            Ajuste os filtros para visualizar os dados
          </p>
        </div>
      )}
    </div>
  );
}
