import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics, period } = body;

    // Gerar insights usando OpenAI
    const insights = await generateInsightsWithAI(metrics, period);

    return NextResponse.json({ insights }, { status: 200 });
  } catch (error) {
    console.error("Erro ao gerar insights:", error);
    return NextResponse.json(
      { error: "Erro ao gerar insights com IA" },
      { status: 500 }
    );
  }
}

async function generateInsightsWithAI(
  metrics: any,
  period: number
): Promise<string> {
  const {
    totalLeads = 0,
    totalVendedores = 0,
    totalVeiculos = 0,
    mediaPorDia = 0,
    taxaConversao = 0,
    leadsPorVendedor = [],
    veiculosMaisVendidos = [],
  } = metrics;

  // Preparar dados para a IA
  const topVendedores = leadsPorVendedor
    .slice(0, 5)
    .map((v: any) => `${v.vendedor}: ${v.total} leads`)
    .join(", ");

  const topVeiculos = veiculosMaisVendidos
    .slice(0, 5)
    .map((v: any) => `${v.veiculo}: ${v.total} leads`)
    .join(", ");

  const prompt = `Você é um analista de vendas especializado em concessionárias de veículos. Analise os dados abaixo e gere insights estratégicos, acionáveis e detalhados.

**DADOS DOS ÚLTIMOS ${period} DIAS:**

📊 **Métricas Gerais:**
- Total de leads: ${totalLeads}
- Média diária: ${mediaPorDia.toFixed(1)} leads/dia
- Vendedores ativos: ${totalVendedores}
- Veículos diferentes: ${totalVeiculos}
- Taxa de conversão: ${taxaConversao.toFixed(1)}%

👥 **Top 5 Vendedores:**
${topVendedores || "Sem dados"}

🚗 **Top 5 Veículos Mais Procurados:**
${topVeiculos || "Sem dados"}

**INSTRUÇÕES:**
1. Analise a performance geral e identifique pontos fortes e fracos
2. Avalie a taxa de conversão e sugira melhorias específicas
3. Analise a distribuição de leads entre vendedores
4. Identifique padrões nos veículos mais procurados
5. Forneça recomendações práticas de curto, médio e longo prazo
6. Calcule um score de saúde do negócio (0-100)
7. Identifique tendências e oportunidades

**FORMATO:**
Use markdown, emojis, e organize em seções claras. Seja objetivo, específico e acionável.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um analista de vendas expert em concessionárias de veículos. Forneça insights práticos, acionáveis e baseados em dados. Use linguagem profissional mas acessível.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    return completion.choices[0]?.message?.content || "Erro ao gerar insights";
  } catch (error) {
    console.error("Erro na API da OpenAI:", error);
    // Fallback para insights estáticos se a API falhar
    return generateInsightsFallback(metrics, period);
  }
}

// Função fallback caso a OpenAI falhe
function generateInsightsFallback(metrics: any, period: number): string {
  const { totalLeads = 0, mediaPorDia = 0, taxaConversao = 0 } = metrics;

  return `📊 **ANÁLISE RÁPIDA - ÚLTIMOS ${period} DIAS**

⚠️ *Insights básicos (modo offline)*

**Performance Geral:**
- Total de leads: ${totalLeads}
- Média diária: ${mediaPorDia.toFixed(1)} leads/dia
- Taxa de conversão: ${taxaConversao.toFixed(1)}%

**Status:** ${mediaPorDia >= 10 ? "✅ Bom" : "⚠️ Abaixo do esperado"}

💡 **Recomendação:** Clique em "Atualizar Insights" para obter análise completa com IA.`;
}
