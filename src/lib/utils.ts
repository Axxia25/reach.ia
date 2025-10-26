import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDateTime(timestamp: string) {
  const date = parseISO(timestamp)
  return format(date, "dd/MM HH:mm", { locale: ptBR })
}

export function formatPhone(phone: string | null) {
  if (!phone) return "-"
  // Formato: (XX) XXXX-XXXX ou (XX) XXXXX-XXXX
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}
