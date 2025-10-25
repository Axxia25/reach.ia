'use client'

import { BarChart3, ChevronDown, FileText, Settings, Shield, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface AdminDropdownProps {
  userRole: string
}

export default function AdminDropdown({ userRole }: AdminDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Só mostrar para admins e gerentes
  if (!['admin', 'gerente'].includes(userRole)) {
    return null
  }

  const menuItems = [
    {
      icon: Users,
      label: 'Usuários',
      href: '/dashboard/admin/usuarios',
      description: 'Gerenciar vendedores e gerentes',
      adminOnly: false
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      href: '/dashboard/admin/relatorios',
      description: 'Performance e métricas',
      adminOnly: false
    },
    {
      icon: FileText,
      label: 'Logs do Sistema',
      href: '/dashboard/admin/logs',
      description: 'Auditoria e atividades',
      adminOnly: true
    },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/dashboard/admin/configuracoes',
      description: 'Configurações gerais',
      adminOnly: true
    }
  ]

  // Filtrar itens baseado no role
  const filteredItems = menuItems.filter(item => 
    !item.adminOnly || userRole === 'admin'
  )

  const handleItemClick = (href: string) => {
    setIsOpen(false)
    router.push(href)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
      >
        <Shield className="w-4 h-4 text-primary-500" />
        <span>Admin</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Painel Administrativo</p>
            <p className="text-xs text-gray-500">
              {userRole === 'admin' ? 'Administrador' : 'Gerente'}
            </p>
          </div>
          
          <div className="py-1">
            {filteredItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {userRole === 'admin' && (
            <div className="border-t border-gray-100 pt-2 mt-1">
              <div className="px-4 py-2">
                <p className="text-xs text-primary-600 font-medium">
                  🔐 Acesso Total de Administrador
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}