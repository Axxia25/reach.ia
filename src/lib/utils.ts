import { type ClassValue, clsx } from 'clsx'
import { format, parseISO, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Merge class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Format phone number to Brazilian format
 * @param phone - Raw phone number
 * @returns Formatted phone number
 */
export function formatPhone(phone: string | null): string {
  if (!phone) return '-'
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    // (XX) XXXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  } else if (cleaned.length === 10) {
    // (XX) XXXX-XXXX
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  
  return phone
}

/**
 * Format date/time for display
 * @param timestamp - ISO timestamp string
 * @param formatString - Format pattern
 * @returns Formatted date string
 */
export function formatDateTime(
  timestamp: string, 
  formatString: string = 'dd/MM/yyyy HH:mm'
): string {
  try {
    const date = parseISO(timestamp)
    return format(date, formatString, { locale: ptBR })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Format relative time (e.g., "2 horas atrás")
 * @param timestamp - ISO timestamp string
 * @returns Relative time string
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp)
    return formatDistanceToNow(date, { 
      addSuffix: true, 
      locale: ptBR 
    })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Format number to Brazilian locale
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 */
export function formatNumber(
  value: number, 
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('pt-BR', options).format(value)
}

/**
 * Format currency to Brazilian Real
 * @param value - Value to format
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return formatNumber(value, {
    style: 'currency',
    currency: 'BRL'
  })
}

/**
 * Format percentage
 * @param value - Decimal value (0.15 = 15%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}

/**
 * Calculate percentage change between two values
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Debounce function
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Generate random color for charts
 * @param index - Index for consistent colors
 * @returns Color string
 */
export function getChartColor(index: number): string {
  const colors = [
    '#007aff', '#5856d6', '#34c759', '#ff9500', 
    '#ff3b30', '#30d158', '#64d2ff', '#bf5af2',
    '#ff6482', '#ffd60a', '#32d74b', '#5e5ce6'
  ]
  return colors[index % colors.length]
}

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Check if value is valid and not empty
 * @param value - Value to check
 * @returns Boolean indicating if value is valid
 */
export function isValidValue(value: any): boolean {
  return value !== null && value !== undefined && value !== ''
}

/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (max 2 chars)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Sleep utility for async functions
 * @param ms - Milliseconds to sleep
 * @returns Promise that resolves after specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Check if running in browser
 * @returns Boolean indicating if in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Local storage utilities with error handling
 */
export const storage = {
  get: (key: string): string | null => {
    if (!isBrowser()) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  
  set: (key: string, value: string): boolean => {
    if (!isBrowser()) return false
    try {
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  },
  
  remove: (key: string): boolean => {
    if (!isBrowser()) return false
    try {
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}
