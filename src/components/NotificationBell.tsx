/**
 * Componente NotificationBell
 * Sino de notificações com badge de contador e dropdown de notificações
 */

'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { useNotifications, type Notification } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  vendedorName?: string
  className?: string
}

export default function NotificationBell({
  vendedorName,
  className,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ vendedorName })

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Solicitar permissão ao clicar pela primeira vez
  const handleBellClick = () => {
    if (permission === 'default') {
      requestPermission()
    }
    setIsOpen(!isOpen)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Agora mesmo'
    if (minutes < 60) return `${minutes}m atrás`
    if (hours < 24) return `${hours}h atrás`
    return `${days}d atrás`
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_lead':
        return '🎯'
      case 'lead_update':
        return '✏️'
      case 'system':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5" />

        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-2xl z-50 max-h-[500px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-card-foreground">
                Notificações
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                  {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Botão Marcar todas como lidas */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                title="Marcar todas como lidas"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista de notificações */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">
                  Nenhuma notificação
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Você será notificado sobre novos leads
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'p-4 hover:bg-accent/50 transition-colors cursor-pointer relative',
                      !notification.read && 'bg-blue-50/50 dark:bg-blue-900/10'
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {/* Indicador de não lida */}
                    {!notification.read && (
                      <div className="absolute top-4 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}

                    <div className="flex gap-3 ml-2">
                      {/* Ícone */}
                      <div className="flex-shrink-0 text-2xl">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Conteúdo */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-card-foreground">
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="flex-shrink-0 text-muted-foreground hover:text-foreground p-1"
                            title="Marcar como lida"
                          >
                            {notification.read ? (
                              <CheckCheck className="h-3 w-3" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>

                          {notification.vendedor && (
                            <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                              {notification.vendedor}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Permissões */}
          {permission !== 'granted' && (
            <div className="p-3 border-t border-border bg-yellow-50 dark:bg-yellow-900/20">
              <button
                onClick={requestPermission}
                className="w-full text-xs text-yellow-800 dark:text-yellow-200 hover:underline flex items-center justify-center gap-1"
              >
                <Bell className="h-3 w-3" />
                Ativar notificações do navegador
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
