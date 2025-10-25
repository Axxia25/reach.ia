'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useFunnelData } from '@/hooks/useFunnelData'

interface FunnelChartProps {
  period: number
  loading?: boolean
}

export default function FunnelChart({ period, loading }: FunnelChartProps) {
  const { chartData, metrics, loading: funnelLoading, error } = useFunnelData(period)

  // Calcular valores máximos para escalas dos dois eixos
  const maxLeads = Math.max(
    ...chartData.map(d => Math.max(d.leadsTotal, d.leadsDistribuidos)),
    10 // Mínimo 10 para evitar gráfico muito pequeno
  )
  
  const maxVendas = Math.max(
    ...chartData.map(d => d.vendasRealizadas),
    3 // Mínimo 3 para eixo de vendas
  )

  if (loading || funnelLoading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-80 bg-accent rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="text-center py-8">
          <div className="text-danger-500 mb-2">⚠️ Erro ao carregar dados do funil</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-card-foreground">
          Funil de Vendas Completo
        </h3>
        <span className="text-sm text-muted-foreground">
          Últimos {period} dias
        </span>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {/* Definir gradientes para efeito de onda */}
            <defs>
              <linearGradient id="colorLeadsTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorLeadsDistribuidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007aff" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#007aff" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorVendasRealizadas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34c759" stopOpacity={0.9}/>
                <stop offset="95%" stopColor="#34c759" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            {/* <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> */}
            <XAxis 
              dataKey="dateFormatted" 
              stroke="#8e8e93"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            {/* Eixo Y Esquerdo - Para Leads */}
            <YAxis 
              yAxisId="left"
              stroke="#8e8e93"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, maxLeads + Math.ceil(maxLeads * 0.1)]}
              label={{ value: 'Leads', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            />
            
            {/* Eixo Y Direito - Para Vendas */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#34c759"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, maxVendas + Math.ceil(maxVendas * 0.2)]}
              label={{ value: 'Vendas', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              labelStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: '600', marginBottom: '8px' }}
              formatter={(value: number, name: string) => {
                const formatName = (name: string) => {
                  switch(name) {
                    case 'leadsTotal': return 'Leads Totais'
                    case 'leadsDistribuidos': return 'Leads Distribuídos'  
                    case 'vendasRealizadas': return 'Vendas Realizadas'
                    default: return name
                  }
                }
                
                // Adicionar indicação do eixo
                const axis = name === 'vendasRealizadas' ? ' (eixo direito)' : ' (eixo esquerdo)'
                const unit = name === 'vendasRealizadas' ? 'venda' : 'lead'
                
                return [`${value} ${unit}${value !== 1 ? (unit === 'lead' ? 's' : 's') : ''}${axis}`, formatName(name)]
              }}
              labelFormatter={(label: string) => `Data: ${label}`}
            />
            <Legend 
              verticalAlign="top" 
              height={50}
              iconType="rect"
              wrapperStyle={{ paddingBottom: '20px' }}
              formatter={(value: string) => {
                switch(value) {
                  case 'leadsTotal': return <span style={{ color: '#dc2626' }}>🔴 Leads Totais (eixo ←)</span>
                  case 'leadsDistribuidos': return <span style={{ color: '#007aff' }}>🔵 Leads Distribuídos (eixo ←)</span>
                  case 'vendasRealizadas': return <span style={{ color: '#34c759' }}>🟢 Vendas Realizadas (eixo →)</span>
                  default: return value
                }
              }}
            />
            
            {/* Área Vermelha - Leads Totais (Eixo Esquerdo) */}
            <Area 
              type="monotone" 
              dataKey="leadsTotal" 
              stroke="#dc2626"
              strokeWidth={2}
              fill="url(#colorLeadsTotal)"
              name="leadsTotal"
              yAxisId="left"
            />
            
            {/* Área Azul - Leads Distribuídos (Eixo Esquerdo) */}
            <Area 
              type="monotone" 
              dataKey="leadsDistribuidos" 
              stroke="#007aff"
              strokeWidth={2}
              fill="url(#colorLeadsDistribuidos)"
              name="leadsDistribuidos"
              yAxisId="left"
            />
            
            {/* Área Verde - Vendas Realizadas (Eixo Direito) */}
            <Area 
              type="monotone" 
              dataKey="vendasRealizadas" 
              stroke="#34c759"
              strokeWidth={3}
              fill="url(#colorVendasRealizadas)"
              name="vendasRealizadas"
              yAxisId="right"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Nota sobre duplo eixo */}
      {chartData.length > 0 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-muted-foreground bg-accent rounded-lg p-2">
            💡 <strong>Duplo Eixo:</strong> Leads (eixo esquerdo) e Vendas (eixo direito) em escalas diferentes para melhor visualização
          </div>
        </div>
      )}
      
      {/* Métricas do Funil */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics.totalLeadsBrutos}
            </div>
            <div className="text-sm text-muted-foreground">Leads Totais</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalLeadsDistribuidos}
            </div>
            <div className="text-sm text-muted-foreground">Leads Distribuídos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.totalVendasRealizadas}
            </div>
            <div className="text-sm text-muted-foreground">Vendas Realizadas</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-card-foreground">
              {metrics.taxaGlobal.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">Taxa Global</div>
          </div>
        </div>
      )}
      
      {/* Taxa de Conversão Detalhada */}
      {chartData.length > 0 && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-accent rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-card-foreground">
              {metrics.taxaQualificacao.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Taxa Qualificação</div>
            <div className="text-xs text-muted-foreground opacity-75">Distribuídos / Totais</div>
          </div>
          
          <div className="bg-accent rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-card-foreground">
              {metrics.taxaConversao.toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">Taxa Conversão</div>
            <div className="text-xs text-muted-foreground opacity-75">Vendas / Distribuídos</div>
          </div>
          
          <div className="bg-accent rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-card-foreground">
              R$ {metrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-muted-foreground">Ticket Médio</div>
            <div className="text-xs text-muted-foreground opacity-75">Valor / Venda</div>
          </div>
        </div>
      )}
      
      {/* Mensagem se não há dados */}
      {chartData.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <div className="text-lg mb-2">📊 Configurando funil de vendas...</div>
          <div className="text-sm">
            Importe dados na tabela leads_totais para visualizar o funil completo
          </div>
        </div>
      )}
    </div>
  )
}