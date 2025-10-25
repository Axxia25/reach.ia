import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey)
}

// Cliente principal do Supabase
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)

// Cliente para componentes (recomendado para Next.js 13+)
export const createSupabaseClient = () => {
  const client = createClientComponentClient()
  
  // Debug: Verificar se o cliente foi criado
  console.log('✅ Cliente Supabase criado:', {
    url: client.supabaseUrl,
    hasAuth: !!client.auth
  })
  
  return client
}

// Disponibilizar globalmente para debug (apenas em desenvolvimento)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).supabase = supabase
  console.log('🔧 Cliente Supabase disponível globalmente como window.supabase')
}

// Database types
export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: number
          timestamps: string
          nome: string
          telefone: string | null
          veiculo: string | null
          resumo: string | null
          conversation_id: string | null
          vendedor: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          timestamps: string
          nome: string
          telefone?: string | null
          veiculo?: string | null
          resumo?: string | null
          conversation_id?: string | null
          vendedor?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          timestamps?: string
          nome?: string
          telefone?: string | null
          veiculo?: string | null
          resumo?: string | null
          conversation_id?: string | null
          vendedor?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      leads_daily_summary: {
        Row: {
          data: string
          total_leads: number
          vendedores_ativos: number
          veiculos_diferentes: number
        }
      }
      leads_por_vendedor: {
        Row: {
          vendedor: string
          total_leads: number
          dias_ativos: number
          ultimo_contato: string
        }
      }
    }
  }
}

export type Lead = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']
export type DailySummary = Database['public']['Views']['leads_daily_summary']['Row']
export type VendorSummary = Database['public']['Views']['leads_por_vendedor']['Row']
