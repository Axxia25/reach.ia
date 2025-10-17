import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client component helper
export const createSupabaseClient = () => createClientComponentClient()

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
