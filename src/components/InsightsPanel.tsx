"use client";

import { Button } from "@/components/ui/Button";
import { Brain, Loader2, Sparkles, X } from "lucide-react";
import { useState } from "react";

interface InsightsPanelProps {
  metrics: any;
  period: number;
}

export default function InsightsPanel({ metrics, period }: InsightsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metrics,
          period,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar insights");
      }

      const data = await response.json();
      setInsights(data.insights);
      setIsOpen(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao gerar insights"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botão Insights em destaque */}
      <Button
        onClick={generateInsights}
        disabled={loading}
        variant="primary"
        size="lg"
        className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gerando Insights...
          </>
        ) : (
          <>
            <Brain className="h-5 w-5" />
            Gerar Insights com IA
            <Sparkles className="h-4 w-4 ml-1" />
          </>
        )}
      </Button>

      {/* Erro */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Panel de Insights */}
      {isOpen && insights && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    Insights com IA
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Análise inteligente dos últimos {period} dias
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {insights}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  💡 Dica: Use esses insights para tomar decisões estratégicas
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={generateInsights}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Atualizar Insights
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
