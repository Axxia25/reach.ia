// src/app/dashboard/metricas/produto/page.tsx
"use client";

import TopVeiculosExpandido from "@/components/TopVeiculosExpandido";
import { Car, Database, TrendingUp } from "lucide-react";

export default function MetricasProdutoPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-card-foreground flex items-center gap-3">
          <Car className="h-8 w-8 text-blue-600" />
          Métricas de Produto
        </h1>
        <p className="text-muted-foreground mt-2">
          Análise detalhada dos veículos consultados com dados da tabela
          veiculos_consulta
        </p>
      </div>

      {/* Status da integração */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
            Integração Ativa - Tabela veiculos_consulta
          </h3>
        </div>
        <p className="text-green-700 dark:text-green-300 mb-4">
          Componente integrado com sucesso! Dados em tempo real da tabela criada
          no PASSO 1.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-600 dark:text-green-400">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Dados detalhados de veículos
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Análise de popularidade
          </div>
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Correlação preço x interesse
          </div>
        </div>
      </div>

      {/* Componente Principal - TopVeiculos Expandido */}
      <TopVeiculosExpandido />

      {/* Informações técnicas - Funcionalidades implementadas */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Funcionalidades Implementadas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados e Análises */}
          <div className="space-y-3">
            <h4 className="font-medium text-card-foreground">
              Dados e Análises:
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Integração completa com tabela veiculos_consulta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Score de popularidade (consultas + usuários únicos)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Análise de preços (mín, máx, médio)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Agrupamento por marca e modelo</span>
              </div>
            </div>
          </div>

          {/* Filtros e Visualização */}
          <div className="space-y-3">
            <h4 className="font-medium text-card-foreground">
              Filtros e Interface:
            </h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Busca por modelo ou marca</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Filtro por marca específica</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Filtro por faixa de preço</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Visualização em cards ou lista</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparação com versão dashboard */}
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="font-medium text-card-foreground mb-3">
            Comparação com Dashboard Gerencial:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            {/* Versão Dashboard */}
            <div className="bg-accent p-4 rounded-lg">
              <h5 className="font-medium text-card-foreground mb-2">
                Versão Dashboard (Atual)
              </h5>
              <div className="space-y-1 text-muted-foreground">
                <div>• Baseado na tabela leads</div>
                <div>• Top 8 veículos por campo veiculo</div>
                <div>• Interface compacta</div>
                <div>• Dados limitados (apenas nome)</div>
                <div>• Otimizado para espaço</div>
              </div>
            </div>

            {/* Versão Expandida */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Versão Expandida (Nova)
              </h5>
              <div className="space-y-1 text-blue-700 dark:text-blue-300">
                <div>• Baseado na tabela veiculos_consulta</div>
                <div>• Top 20 veículos + filtros</div>
                <div>• Interface expandida com detalhes</div>
                <div>• Dados ricos (marca, modelo, preço)</div>
                <div>• Análises avançadas e correlações</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Próximos desenvolvimentos */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">
          Próximos Desenvolvimentos Planejados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">
              Análises Avançadas:
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Correlação detalhada preço x conversão</div>
              <div>• Timeline de interesse por modelo</div>
              <div>• Padrões de consulta por região</div>
              <div>• Previsão de demanda (IA)</div>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-card-foreground">
              Integrações Futuras:
            </h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Exportação de relatórios PDF</div>
              <div>• API para sistemas externos</div>
              <div>• Alertas de tendências</div>
              <div>• Dashboard executivo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
