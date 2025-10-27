/**
 * Hook de Notificações em Tempo Real
 * Monitora novos leads e envia notificações push + toast
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSupabaseClient } from '@/lib/supabase'
import { useToast, createToastHelpers } from '@/components/ui/Toast'

export interface Notification {
  id: string
  type: 'new_lead' | 'lead_update' | 'system'
  title: string
  message: string
  lead_id?: number
  lead_name?: string
  vendedor?: string
  timestamp: Date
  read: boolean
}

interface UseNotificationsOptions {
  vendedorName?: string
  enableSound?: boolean
  enableWebNotifications?: boolean
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    vendedorName,
    enableSound = true,
    enableWebNotifications = true,
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const { addToast } = useToast()
  const toast = createToastHelpers(addToast)
  const supabase = createSupabaseClient()

  // Solicitar permissão para notificações Web
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Browser não suporta notificações')
      return
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return
    }

    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission()
      setPermission(perm)
    }
  }, [])

  // Reproduzir som de notificação
  const playNotificationSound = useCallback(() => {
    if (!enableSound) return

    try {
      // Criar som de notificação com Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.value = 0.3

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.1)

      // Segunda nota
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()
        osc2.connect(gain2)
        gain2.connect(audioContext.destination)
        osc2.frequency.value = 1000
        osc2.type = 'sine'
        gain2.gain.value = 0.3
        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.1)
      }, 100)
    } catch (error) {
      console.error('Erro ao reproduzir som:', error)
    }
  }, [enableSound])

  // Enviar notificação Web
  const sendWebNotification = useCallback(
    (title: string, body: string, icon?: string) => {
      if (!enableWebNotifications || permission !== 'granted') return

      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'crm-leads',
          requireInteraction: false,
        })

        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        // Fechar automaticamente após 5 segundos
        setTimeout(() => notification.close(), 5000)
      } catch (error) {
        console.error('Erro ao enviar notificação Web:', error)
      }
    },
    [enableWebNotifications, permission]
  )

  // Adicionar notificação à lista
  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      }

      setNotifications((prev) => [newNotification, ...prev])
      setUnreadCount((prev) => prev + 1)

      // Mostrar toast
      toast.info(notification.title, notification.message)

      // Reproduzir som
      playNotificationSound()

      // Enviar notificação Web
      sendWebNotification(notification.title, notification.message)

      return newNotification
    },
    [toast, playNotificationSound, sendWebNotification]
  )

  // Marcar notificação como lida
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  // Limpar notificações antigas (mais de 24h)
  const clearOldNotifications = useCallback(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    setNotifications((prev) =>
      prev.filter((n) => n.timestamp > oneDayAgo)
    )
  }, [])

  // Configurar listener de Realtime para novos leads
  useEffect(() => {
    // Solicitar permissão ao montar
    if (enableWebNotifications) {
      requestPermission()
    }

    // Configurar canal de Realtime
    const channel = supabase
      .channel('leads-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          const newLead = payload.new as any

          // Se vendedorName está definido, filtrar apenas leads deste vendedor
          if (vendedorName && newLead.vendedor !== vendedorName) {
            return
          }

          // Adicionar notificação
          addNotification({
            type: 'new_lead',
            title: vendedorName
              ? 'Novo Lead Atribuído!'
              : 'Novo Lead no Sistema',
            message: vendedorName
              ? `Lead: ${newLead.nome} - ${newLead.veiculo || 'Veículo não especificado'}`
              : `${newLead.vendedor} recebeu um novo lead: ${newLead.nome}`,
            lead_id: newLead.id,
            lead_name: newLead.nome,
            vendedor: newLead.vendedor,
          })
        }
      )
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [
    supabase,
    vendedorName,
    enableWebNotifications,
    requestPermission,
    addNotification,
  ])

  // Limpar notificações antigas a cada hora
  useEffect(() => {
    const interval = setInterval(clearOldNotifications, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [clearOldNotifications])

  return {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearOldNotifications,
  }
}
