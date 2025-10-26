/**
 * Centralized Logger
 *
 * Sistema de logging estruturado com níveis e contexto
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  error?: {
    name?: string
    message?: string
    stack?: string
    [key: string]: any
  }
}

/**
 * Configuração do logger
 */
interface LoggerConfig {
  minLevel: LogLevel
  enableConsole: boolean
  enableFile: boolean
  prettyPrint: boolean
}

const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enableConsole: true,
  enableFile: false,
  prettyPrint: process.env.NODE_ENV !== 'production',
}

/**
 * Mapa de níveis de log para prioridade
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
}

/**
 * Cores para console (apenas desenvolvimento)
 */
const LOG_COLORS: Record<LogLevel, string> = {
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.WARN]: '\x1b[33m', // Yellow
  [LogLevel.INFO]: '\x1b[36m', // Cyan
  [LogLevel.DEBUG]: '\x1b[35m', // Magenta
}

const RESET_COLOR = '\x1b[0m'

/**
 * Ícones para cada nível de log
 */
const LOG_ICONS: Record<LogLevel, string> = {
  [LogLevel.ERROR]: '❌',
  [LogLevel.WARN]: '⚠️',
  [LogLevel.INFO]: 'ℹ️',
  [LogLevel.DEBUG]: '🐛',
}

class Logger {
  private config: LoggerConfig

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Verifica se deve logar baseado no nível mínimo configurado
   */
  private shouldLog(level: LogLevel): boolean {
    return (
      LOG_LEVEL_PRIORITY[level] <= LOG_LEVEL_PRIORITY[this.config.minLevel]
    )
  }

  /**
   * Formata a entrada de log
   */
  private formatLogEntry(entry: LogEntry): string {
    if (this.config.prettyPrint) {
      return this.formatPretty(entry)
    }
    return JSON.stringify(entry)
  }

  /**
   * Formata log de forma legível (desenvolvimento)
   */
  private formatPretty(entry: LogEntry): string {
    const color = LOG_COLORS[entry.level]
    const icon = LOG_ICONS[entry.level]
    const level = entry.level.toUpperCase().padEnd(5)

    let output = `${color}${icon} [${level}]${RESET_COLOR} ${entry.timestamp} - ${entry.message}`

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name || 'Error'}: ${entry.error.message}`
      if (entry.error.stack) {
        output += `\n${entry.error.stack}`
      }
    }

    return output
  }

  /**
   * Escreve log no console
   */
  private writeToConsole(entry: LogEntry): void {
    const formatted = this.formatLogEntry(entry)

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
    }
  }

  /**
   * Escreve log em arquivo (futuro: integração com serviço de logging)
   */
  private async writeToFile(entry: LogEntry): Promise<void> {
    // TODO: Implementar escrita em arquivo ou envio para serviço de logging
    // Exemplos: Winston file transport, Pino file transport, ou serviços como:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - CloudWatch (AWS)
    // - Stackdriver (GCP)
  }

  /**
   * Método principal de logging
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>
  ): void {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    }

    if (this.config.enableConsole) {
      this.writeToConsole(entry)
    }

    if (this.config.enableFile) {
      this.writeToFile(entry).catch((err) => {
        console.error('Falha ao escrever log em arquivo:', err)
      })
    }
  }

  /**
   * Log de erro
   */
  error(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context)
  }

  /**
   * Log de aviso
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context)
  }

  /**
   * Log informativo
   */
  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context)
  }

  /**
   * Log de debug
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context)
  }

  /**
   * Log de início de requisição HTTP
   */
  httpRequest(
    method: string,
    path: string,
    statusCode?: number,
    duration?: number
  ): void {
    const level =
      statusCode && statusCode >= 500
        ? LogLevel.ERROR
        : statusCode && statusCode >= 400
        ? LogLevel.WARN
        : LogLevel.INFO

    this.log(level, `HTTP ${method} ${path}`, {
      method,
      path,
      statusCode,
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  /**
   * Log de query do banco de dados
   */
  dbQuery(query: string, duration: number, error?: Error): void {
    if (error) {
      this.error('Database query failed', {
        query,
        duration: `${duration}ms`,
        error: {
          name: error.name,
          message: error.message,
        },
      })
    } else {
      this.debug('Database query executed', {
        query,
        duration: `${duration}ms`,
      })
    }
  }

  /**
   * Log de autenticação
   */
  auth(action: string, userId?: string, success: boolean = true): void {
    const level = success ? LogLevel.INFO : LogLevel.WARN

    this.log(level, `Auth: ${action}`, {
      action,
      userId,
      success,
    })
  }

  /**
   * Log de performance
   */
  performance(operation: string, duration: number, metadata?: Record<string, any>): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG

    this.log(level, `Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      ...metadata,
    })
  }

  /**
   * Cria um logger filho com contexto adicional
   */
  child(context: Record<string, any>): ChildLogger {
    return new ChildLogger(this, context)
  }

  /**
   * Atualiza configuração do logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

/**
 * Logger filho com contexto adicional
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private childContext: Record<string, any>
  ) {}

  private mergeContext(context?: Record<string, any>): Record<string, any> {
    return { ...this.childContext, ...context }
  }

  error(message: string, context?: Record<string, any>): void {
    this.parent.error(message, this.mergeContext(context))
  }

  warn(message: string, context?: Record<string, any>): void {
    this.parent.warn(message, this.mergeContext(context))
  }

  info(message: string, context?: Record<string, any>): void {
    this.parent.info(message, this.mergeContext(context))
  }

  debug(message: string, context?: Record<string, any>): void {
    this.parent.debug(message, this.mergeContext(context))
  }
}

/**
 * Instância global do logger
 */
export const logger = new Logger()

/**
 * Exemplo de uso:
 *
 * import { logger } from '@/lib/errors/logger'
 *
 * logger.info('Aplicação iniciada', { port: 3000 })
 * logger.error('Falha ao conectar ao banco', { error: err })
 * logger.httpRequest('GET', '/api/users', 200, 45)
 * logger.auth('login', 'user123', true)
 *
 * // Logger filho com contexto
 * const requestLogger = logger.child({ requestId: 'abc123' })
 * requestLogger.info('Processando requisição') // Inclui requestId automaticamente
 */
