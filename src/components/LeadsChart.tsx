'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Lead, DailySummary } from '@/lib/supabase'

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
      <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
        <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Leads por Data
        </h3>
        <span className="text-sm text-gray-500">
          Últimos {period} dias
        </span>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
                backgroundColor: 'white',
                border: '1px solid #e5e5ea',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              labelStyle={{ color: '#1c1c1e', fontWeight: '600' }}
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
        <div className="mt-4 flex justify-between text-sm text-gray-500">
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
