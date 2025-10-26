/**
 * Error Monitoring Utilities
 *
 * Ferramentas para monitoramento e rastreamento de erros
 */

import { logger } from './logger'
import { AppError, isAppError } from './custom-errors'

/**
 * Interface para métricas de erro
 */
export interface ErrorMetrics {
  totalErrors: number
  errorsByType: Record<string, number>
  errorsByCode: Record<string, number>
  errorsByStatusCode: Record<number, number>
  recentErrors: Array<{
    timestamp: string
    type: string
    message: string
    code?: string
    statusCode?: number
  }>
}

/**
 * Classe para monitoramento de erros
 */
class ErrorMonitor {
  private metrics: ErrorMetrics = {
    totalErrors: 0,
    errorsByType: {},
    errorsByCode: {},
    errorsByStatusCode: {},
    recentErrors: [],
  }

  private maxRecentErrors = 100

  /**
   * Registra um erro
   */
  recordError(error: Error | AppError): void {
    this.metrics.totalErrors++

    // Contagem por tipo
    const errorType = error.constructor.name
    this.metrics.errorsByType[errorType] =
      (this.metrics.errorsByType[errorType] || 0) + 1

    // Contagem por código (se AppError)
    if (isAppError(error) && error.code) {
      this.metrics.errorsByCode[error.code] =
        (this.metrics.errorsByCode[error.code] || 0) + 1

      this.metrics.errorsByStatusCode[error.statusCode] =
        (this.metrics.errorsByStatusCode[error.statusCode] || 0) + 1
    }

    // Adicionar aos erros recentes
    this.metrics.recentErrors.unshift({
      timestamp: new Date().toISOString(),
      type: errorType,
      message: error.message,
      code: isAppError(error) ? error.code : undefined,
      statusCode: isAppError(error) ? error.statusCode : undefined,
    })

    // Limitar tamanho do array
    if (this.metrics.recentErrors.length > this.maxRecentErrors) {
      this.metrics.recentErrors = this.metrics.recentErrors.slice(
        0,
        this.maxRecentErrors
      )
    }

    // Log para análise
    logger.debug('Erro registrado no monitor', {
      errorType,
      totalErrors: this.metrics.totalErrors,
    })
  }

  /**
   * Obtém métricas atuais
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics }
  }

  /**
   * Obtém estatísticas resumidas
   */
  getStats(): Record<string, any> {
    const mostCommonError = Object.entries(this.metrics.errorsByType).reduce(
      (max, [type, count]) => (count > max.count ? { type, count } : max),
      { type: 'none', count: 0 }
    )

    const mostCommonCode = Object.entries(this.metrics.errorsByCode).reduce(
      (max, [code, count]) => (count > max.count ? { code, count } : max),
      { code: 'none', count: 0 }
    )

    return {
      totalErrors: this.metrics.totalErrors,
      mostCommonError,
      mostCommonCode,
      errorTypes: Object.keys(this.metrics.errorsByType).length,
      recentErrorsCount: this.metrics.recentErrors.length,
    }
  }

  /**
   * Reseta métricas
   */
  reset(): void {
    this.metrics = {
      totalErrors: 0,
      errorsByType: {},
      errorsByCode: {},
      errorsByStatusCode: {},
      recentErrors: [],
    }
    logger.info('Métricas de erro resetadas')
  }

  /**
   * Exporta métricas para JSON
   */
  export(): string {
    return JSON.stringify(this.metrics, null, 2)
  }

  /**
   * Verifica se a taxa de erro está alta
   */
  isErrorRateHigh(thresholdPerMinute: number = 10): boolean {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString()
    const recentCount = this.metrics.recentErrors.filter(
      (err) => err.timestamp > oneMinuteAgo
    ).length

    return recentCount > thresholdPerMinute
  }

  /**
   * Obtém erros por período
   */
  getErrorsByPeriod(minutes: number = 5): Array<{
    timestamp: string
    type: string
    message: string
    code?: string
  }> {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString()
    return this.metrics.recentErrors.filter((err) => err.timestamp > cutoff)
  }
}

/**
 * Instância global do monitor
 */
export const errorMonitor = new ErrorMonitor()

/**
 * Health check do sistema baseado em erros
 */
export function getSystemHealth(): {
  status: 'healthy' | 'degraded' | 'unhealthy'
  details: Record<string, any>
} {
  const errorRateHigh = errorMonitor.isErrorRateHigh(10)
  const stats = errorMonitor.getStats()
  const recentErrors = errorMonitor.getErrorsByPeriod(5)

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

  if (errorRateHigh || stats.totalErrors > 100) {
    status = 'unhealthy'
  } else if (recentErrors.length > 5) {
    status = 'degraded'
  }

  return {
    status,
    details: {
      totalErrors: stats.totalErrors,
      recentErrors: recentErrors.length,
      errorRateHigh,
      mostCommonError: stats.mostCommonError,
      mostCommonCode: stats.mostCommonCode,
    },
  }
}

/**
 * Middleware para capturar e registrar erros
 */
export function trackError(error: Error | AppError): void {
  errorMonitor.recordError(error)

  // Alertar se taxa de erro está alta
  if (errorMonitor.isErrorRateHigh()) {
    logger.warn('Taxa de erro alta detectada', {
      stats: errorMonitor.getStats(),
    })
  }
}

/**
 * Gera relatório de erros
 */
export function generateErrorReport(): string {
  const metrics = errorMonitor.getMetrics()
  const stats = errorMonitor.getStats()
  const health = getSystemHealth()

  const report: string[] = []
  report.push('========================================')
  report.push('RELATÓRIO DE ERROS')
  report.push('========================================')
  report.push('')
  report.push(`Status do Sistema: ${health.status.toUpperCase()}`)
  report.push(`Total de Erros: ${stats.totalErrors}`)
  report.push(`Tipos de Erro Únicos: ${stats.errorTypes}`)
  report.push('')
  report.push('Erro Mais Comum:')
  report.push(`  Tipo: ${stats.mostCommonError.type}`)
  report.push(`  Ocorrências: ${stats.mostCommonError.count}`)
  report.push('')
  report.push('Código de Erro Mais Comum:')
  report.push(`  Código: ${stats.mostCommonCode.code}`)
  report.push(`  Ocorrências: ${stats.mostCommonCode.count}`)
  report.push('')
  report.push('Distribuição por Tipo:')
  Object.entries(metrics.errorsByType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([type, count]) => {
      report.push(`  ${type}: ${count}`)
    })
  report.push('')
  report.push('Distribuição por Status Code:')
  Object.entries(metrics.errorsByStatusCode)
    .sort(([, a], [, b]) => b - a)
    .forEach(([code, count]) => {
      report.push(`  ${code}: ${count}`)
    })
  report.push('')
  report.push('Últimos 10 Erros:')
  metrics.recentErrors.slice(0, 10).forEach((err, i) => {
    report.push(`  ${i + 1}. [${err.timestamp}] ${err.type}: ${err.message}`)
    if (err.code) {
      report.push(`     Código: ${err.code} (Status: ${err.statusCode})`)
    }
  })
  report.push('')
  report.push('========================================')

  return report.join('\n')
}

/**
 * Configuração de alertas
 */
export interface AlertConfig {
  errorRateThreshold: number // Erros por minuto
  onAlert: (message: string, details: any) => void
}

let alertConfig: AlertConfig | null = null

export function configureAlerts(config: AlertConfig): void {
  alertConfig = config
}

/**
 * Verifica e dispara alertas se necessário
 */
export function checkAlerts(): void {
  if (!alertConfig) return

  if (errorMonitor.isErrorRateHigh(alertConfig.errorRateThreshold)) {
    const stats = errorMonitor.getStats()
    alertConfig.onAlert('Taxa de erro excedida', {
      threshold: alertConfig.errorRateThreshold,
      current: errorMonitor.getErrorsByPeriod(1).length,
      stats,
    })
  }
}

/**
 * Exemplo de uso:
 *
 * import { trackError, generateErrorReport, getSystemHealth } from '@/lib/errors/monitoring'
 *
 * try {
 *   // código
 * } catch (error) {
 *   trackError(error)
 *   throw error
 * }
 *
 * // Em endpoint de health check
 * const health = getSystemHealth()
 * console.log(health.status) // 'healthy' | 'degraded' | 'unhealthy'
 *
 * // Gerar relatório
 * console.log(generateErrorReport())
 */
