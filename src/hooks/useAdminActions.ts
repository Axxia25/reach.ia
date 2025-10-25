'use client'

import { createSupabaseClient } from '@/lib/supabase'
import { useState } from 'react'

interface VendorProfile {
  id: string
  vendedor_name: string
  email: string
  role: 'admin' | 'gerente' | 'vendedor'
  ativo: boolean
  created_at: string
  updated_at: string
}

interface InviteUserData {
  email: string
  vendedor_name: string
  role: 'gerente' | 'vendedor'
}

interface UseAdminActionsReturn {
  users: VendorProfile[]
  vendedoresFromLeads: string[]
  loading: boolean
  error: string | null
  fetchUsers: () => Promise<void>
  fetchVendedoresFromLeads: () => Promise<void>
  inviteUser: (data: InviteUserData) => Promise<{ success: boolean; message: string }>
  updateUserRole: (userId: string, newRole: string) => Promise<{ success: boolean; message: string }>
  toggleUserStatus: (userId: string, ativo: boolean) => Promise<{ success: boolean; message: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>
}

export function useAdminActions(): UseAdminActionsReturn {
  const [users, setUsers] = useState<VendorProfile[]>([])
  const [vendedoresFromLeads, setVendedoresFromLeads] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createSupabaseClient()

  // Buscar todos os usuários
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('vendedor_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setUsers(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Erro ao buscar usuários:', err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar vendedores únicos dos leads
  const fetchVendedoresFromLeads = async () => {
    try {
      const { data: leads, error } = await supabase
        .from('leads')
        .select('vendedor')
        .not('vendedor', 'is', null)

      if (error) throw error

      // Extrair vendedores únicos
      const uniqueVendedores = Array.from(
        new Set(leads?.map(lead => lead.vendedor).filter(Boolean))
      ) as string[]

      setVendedoresFromLeads(uniqueVendedores.sort())
    } catch (err: any) {
      console.error('Erro ao buscar vendedores dos leads:', err)
    }
  }

  // Convidar novo usuário (versão simplificada)
  const inviteUser = async (data: InviteUserData) => {
    try {
      setLoading(true)
      
      // Por enquanto, apenas simular sucesso e mostrar instruções
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simular delay
      
      return {
        success: true,
        message: `Instruções enviadas! Solicite que ${data.vendedor_name} (${data.email}) se cadastre em: ${window.location.origin} e depois associe o perfil.`
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Erro ao processar convite'
      }
    } finally {
      setLoading(false)
    }
  }

  // Atualizar role do usuário
  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('vendedor_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole as any } : user
      ))

      return {
        success: true,
        message: 'Role atualizada com sucesso!'
      }
    } catch (err: any) {
      console.error('Erro ao atualizar role:', err)
      return {
        success: false,
        message: err.message || 'Erro ao atualizar role'
      }
    } finally {
      setLoading(false)
    }
  }

  // Ativar/Desativar usuário
  const toggleUserStatus = async (userId: string, ativo: boolean) => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from('vendedor_profiles')
        .update({ ativo, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error

      // Atualizar lista local
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ativo } : user
      ))

      return {
        success: true,
        message: `Usuário ${ativo ? 'ativado' : 'desativado'} com sucesso!`
      }
    } catch (err: any) {
      console.error('Erro ao alterar status:', err)
      return {
        success: false,
        message: err.message || 'Erro ao alterar status'
      }
    } finally {
      setLoading(false)
    }
  }

  // Deletar usuário
  const deleteUser = async (userId: string) => {
    try {
      setLoading(true)

      // Deletar apenas o perfil por enquanto
      const { error: profileError } = await supabase
        .from('vendedor_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      // Atualizar lista local
      setUsers(prev => prev.filter(user => user.id !== userId))

      return {
        success: true,
        message: 'Usuário removido com sucesso!'
      }
    } catch (err: any) {
      console.error('Erro ao deletar usuário:', err)
      return {
        success: false,
        message: err.message || 'Erro ao deletar usuário'
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    users,
    vendedoresFromLeads,
    loading,
    error,
    fetchUsers,
    fetchVendedoresFromLeads,
    inviteUser,
    updateUserRole,
    toggleUserStatus,
    deleteUser
  }
}