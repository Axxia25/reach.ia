'use client'

import { useAdminActions } from '@/hooks/useAdminActions'
import { createSupabaseClient } from '@/lib/supabase'
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface InviteModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (data: any) => void
  vendedoresFromLeads: string[]
  loading: boolean
}

function InviteModal({ isOpen, onClose, onInvite, vendedoresFromLeads, loading }: InviteModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    vendedor_name: '',
    role: 'vendedor' as 'vendedor' | 'gerente'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onInvite(formData)
    setFormData({ email: '', vendedor_name: '', role: 'vendedor' })
  }

  const handleVendedorSelect = (vendedor: string) => {
    setFormData(prev => ({ ...prev, vendedor_name: vendedor }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Convidar Usuário</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="usuario@empresa.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Vendedor
            </label>
            <input
              type="text"
              value={formData.vendedor_name}
              onChange={(e) => setFormData(prev => ({ ...prev, vendedor_name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Nome do vendedor"
              required
            />
          </div>

          {vendedoresFromLeads.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ou selecione um vendedor dos leads:
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                {vendedoresFromLeads.map((vendedor) => (
                  <button
                    key={vendedor}
                    type="button"
                    onClick={() => handleVendedorSelect(vendedor)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm border-b border-gray-100 last:border-b-0"
                  >
                    {vendedor}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cargo
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="vendedor">Vendedor</option>
              <option value="gerente">Gerente</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enviando...' : 'Enviar Convite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createSupabaseClient()

  const {
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
  } = useAdminActions()

  // Verificar se é admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/')
        return
      }

      const { data: profile } = await supabase
        .from('vendedor_profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (!profile || !['admin', 'gerente'].includes(profile.role)) {
        router.push('/dashboard')
        return
      }

      setUserProfile(profile)
    }

    checkAdminAccess()
  }, [router, supabase])

  // Carregar dados
  useEffect(() => {
    if (userProfile) {
      fetchUsers()
      fetchVendedoresFromLeads()
    }
  }, [userProfile])

  const handleInviteUser = async (data: any) => {
    const result = await inviteUser(data)
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    })
    
    if (result.success) {
      setShowInviteModal(false)
    }

    // Limpar mensagem após 5 segundos
    setTimeout(() => setMessage(null), 5000)
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    const result = await toggleUserStatus(userId, !currentStatus)
    setMessage({
      type: result.success ? 'success' : 'error',
      text: result.message
    })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Tem certeza que deseja deletar o usuário ${userName}?`)) {
      const result = await deleteUser(userId)
      setMessage({
        type: result.success ? 'success' : 'error',
        text: result.message
      })
      setTimeout(() => setMessage(null), 5000)
    }
  }

  const getRoleBadge = (role: string) => {
    const styles = {
      admin: 'bg-red-100 text-red-800',
      gerente: 'bg-blue-100 text-blue-800',
      vendedor: 'bg-green-100 text-green-800'
    }
    const labels = {
      admin: 'Admin',
      gerente: 'Gerente',
      vendedor: 'Vendedor'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${styles[role as keyof typeof styles]}`}>
        {labels[role as keyof typeof labels]}
      </span>
    )
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Gestão de Usuários</h1>
                <p className="text-sm text-gray-500">Gerenciar vendedores e gerentes do sistema</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Convidar Usuário</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast de Sucesso/Erro */}
        {message && (
          <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-out">
            <div className={`rounded-xl shadow-lg p-4 max-w-md border ${
              message.type === 'success' 
                ? 'bg-white border-success-200' 
                : 'bg-white border-red-200'
            }`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    message.type === 'success' 
                      ? 'bg-success-100' 
                      : 'bg-red-100'
                  }`}>
                    {message.type === 'success' ? (
                      <svg className="w-4 h-4 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {message.type === 'success' ? 'Convite enviado com sucesso!' : 'Erro no convite'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {message.text}
                  </p>
                </div>
                <button
                  onClick={() => setMessage(null)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-primary-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Admins/Gerentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => ['admin', 'gerente'].includes(u.role)).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-card border border-gray-100">
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Vendedores nos Leads</p>
                <p className="text-2xl font-bold text-gray-900">{vendedoresFromLeads.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-card border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Usuários do Sistema</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.vendedor_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.ativo ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mr-2" />
                        )}
                        <span className={`text-sm ${user.ativo ? 'text-green-700' : 'text-red-700'}`}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.ativo)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.ativo 
                              ? 'text-red-600 hover:bg-red-50' 
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {user.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        
                        {userProfile.role === 'admin' && user.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.vendedor_name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Deletar usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendedores dos Leads */}
        {vendedoresFromLeads.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-card border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Vendedores nos Leads ({vendedoresFromLeads.length})
              </h3>
              <p className="text-sm text-gray-500">
                Vendedores que aparecem nos leads mas ainda não têm conta no sistema
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {vendedoresFromLeads
                  .filter(vendedor => !users.some(user => user.vendedor_name === vendedor))
                  .map((vendedor) => (
                    <div 
                      key={vendedor}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {vendedor}
                      </span>
                      <Plus 
                        className="w-4 h-4 text-primary-500 cursor-pointer hover:text-primary-600" 
                        onClick={() => {
                          setShowInviteModal(true)
                          // Poderia pre-preencher o nome aqui
                        }}
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteUser}
        vendedoresFromLeads={vendedoresFromLeads}
        loading={loading}
      />
    </div>
  )
}