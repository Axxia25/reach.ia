import { LRUCache } from 'lru-cache'

export interface RateLimitOptions {
  interval: number // Janela de tempo em ms
  maxRequests: number // Máximo de requisições na janela
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// Cache para armazenar contadores de requisições por IP
const tokenCache = new LRUCache<string, number[]>({
  max: 500, // Máximo de IPs diferentes no cache
  ttl: 60000, // TTL de 1 minuto
})

/**
 * Rate limiter baseado em token bucket algorithm
 * @param identifier - Identificador único (geralmente IP do cliente)
 * @param options - Configurações de rate limit
 * @returns Resultado do rate limiting
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = { interval: 60000, maxRequests: 10 }
): RateLimitResult {
  const now = Date.now()
  const windowStart = now - options.interval

  // Buscar timestamps de requisições anteriores
  const requestTimestamps = tokenCache.get(identifier) || []

  // Filtrar apenas timestamps dentro da janela atual
  const recentRequests = requestTimestamps.filter(
    (timestamp) => timestamp > windowStart
  )

  // Calcular requisições restantes
  const remaining = Math.max(0, options.maxRequests - recentRequests.length - 1)

  // Calcular quando o limite será resetado
  const oldestTimestamp = recentRequests[0] || now
  const reset = oldestTimestamp + options.interval

  // Verificar se excedeu o limite
  const success = recentRequests.length < options.maxRequests

  if (success) {
    // Adicionar timestamp da requisição atual
    const updatedTimestamps = [...recentRequests, now]
    tokenCache.set(identifier, updatedTimestamps)
  }

  return {
    success,
    limit: options.maxRequests,
    remaining,
    reset,
  }
}

/**
 * Rate limiter específico para autenticação (mais restritivo)
 */
export function authRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // Máximo 5 tentativas
  })
}

/**
 * Rate limiter para API geral
 */
export function apiRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 100, // 100 requisições por minuto
  })
}

/**
 * Rate limiter para ações críticas (criar/atualizar/deletar)
 */
export function writeRateLimit(identifier: string): RateLimitResult {
  return rateLimit(identifier, {
    interval: 60 * 1000, // 1 minuto
    maxRequests: 30, // 30 escritas por minuto
  })
}

/**
 * Extrai o IP do cliente a partir dos headers da requisição
 */
export function getClientIp(headers: Headers): string {
  // Tentar obter o IP real do cliente através de proxies
  const forwardedFor = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const cfConnectingIp = headers.get('cf-connecting-ip') // Cloudflare

  if (cfConnectingIp) return cfConnectingIp
  if (forwardedFor) return forwardedFor.split(',')[0].trim()
  if (realIp) return realIp

  return 'unknown'
}

/**
 * Cria headers de resposta padrão para rate limiting
 */
export function getRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.reset).toISOString(),
  }
}

/**
 * Limpa o cache de rate limiting (útil para testes)
 */
export function clearRateLimitCache(): void {
  tokenCache.clear()
}
