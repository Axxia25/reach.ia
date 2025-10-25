'use client'

import { DailySummary, Lead } from '@/lib/supabase'
import { eachDayOfInterval, format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface LeadsChartProps {
  leads: Lead[]
  dailySummary: DailySummary[]
  period: number
  loading?: boolean
}

interface ChartDataPoint {
  date: string
  dateFormatted: string
  leads: number
}

export default function LeadsChart({ leads, dailySummary, period, loading }: LeadsChartProps) {
  
  const prepareChartData = (): ChartDataPoint[] => {
    const endDate = new Date()
    const startDate = subDays(endDate, period - 1)
    
    // Criar array com todas as datas do período
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate })
    
    // Agrupar leads por data
    const leadsByDate = leads.reduce((acc, lead) => {
      const date = format(parseISO(lead.timestamps), 'yyyy-MM-dd')
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Criar dados do gráfico
    return dateRange.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd')
      return {
        date: dateKey,
        dateFormatted: format(date, 'dd/MM', { locale: ptBR }),
        leads: leadsByDate[dateKey] || 0
      }
    })
  }

  const chartData = prepareChartData()
  const maxLeads = Math.max(...chartData.map(d => d.leads), 10)

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 shadow-card border border-border">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-80 bg-accent rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-card border border-border">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-card-foreground">
          Leads por Data
        </h3>
        <span className="text-sm text-muted-foreground">
          Últimos {period} dias
        </span>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            {/* <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" /> */}
            <XAxis 
              dataKey="dateFormatted" 
              stroke="#8e8e93"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#8e8e93"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, maxLeads + 2]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--card-foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              labelStyle={{ color: 'hsl(var(--card-foreground))', fontWeight: '600' }}
              formatter={(value: number) => [
                `${value} lead${value !== 1 ? 's' : ''}`, 
                'Leads'
              ]}
              labelFormatter={(label: string) => `Data: ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="leads" 
              stroke="#007aff"
              strokeWidth={3}
              dot={{ fill: '#007aff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#007aff', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {chartData.length > 0 && (
        <div className="mt-4 flex justify-between text-sm text-muted-foreground">
          <span>
            Total no período: {chartData.reduce((sum, d) => sum + d.leads, 0)} leads
          </span>
          <span>
            Média diária: {(chartData.reduce((sum, d) => sum + d.leads, 0) / chartData.length).toFixed(1)}
          </span>
        </div>
      )}
    </div>
  )
}