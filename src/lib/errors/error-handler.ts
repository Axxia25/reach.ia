import { NextResponse } from 'next/server'
import { AppError, isAppError, isOperationalError, ERROR_MESSAGES } from './custom-errors'
import { logger } from './logger'

/**
 * Error Handler Centralizado
 *
 * Trata todos os erros da aplicação de forma consistente
 */

/**
 * Interface para resposta de erro padronizada
 */
export interface ErrorResponse {
  success: false
  error: {
    message: string
    code?: string
    statusCode: number
    details?: any
    timestamp: string
    path?: string
    requestId?: string
  }
}

/**
 * Gera ID único para requisição (para rastreamento)
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Cria resposta de erro padronizada
 */
export function createErrorResponse(
  error: AppError | Error,
  path?: string,
  requestId?: string
): ErrorResponse {
  const timestamp = new Date().toISOString()

  if (isAppError(error)) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        timestamp,
        path,
        requestId,
      },
    }
  }

  // Erro genérico (não é AppError)
  return {
    success: false,
    error: {
      message: 'Erro interno do servidor',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      timestamp,
      path,
      requestId,
    },
  }
}

/**
 * Handler principal de erros
 *
 * @param error - Erro capturado
 * @param path - Caminho da requisição (opcional)
 * @returns NextResponse com erro formatado
 */
export function handleError(error: unknown, path?: string): NextResponse {
  const requestId = generateRequestId()

  // Converter para Error se não for
  let err: Error
  if (error instanceof Error) {
    err = error
  } else if (typeof error === 'string') {
    err = new Error(error)
  } else {
    err = new Error('Erro desconhecido')
  }

  // Log do erro
  if (isOperationalError(err)) {
    // Erro operacional (esperado) - log como warning
    logger.warn('Erro operacional', {
      requestId,
      path,
      error: {
        name: err.name,
        message: err.message,
        code: isAppError(err) ? err.code : undefined,
        statusCode: isAppError(err) ? err.statusCode : 500,
        details: isAppError(err) ? err.details : undefined,
      },
    })
  } else {
    // Erro não operacional (bug) - log como error com stack trace
    logger.error('Erro não operacional', {
      requestId,
      path,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: isAppError(err) ? err.code : undefined,
      },
    })
  }

  // Criar resposta de erro
  const errorResponse = createErrorResponse(
    isAppError(err) ? err : new AppError(err.message),
    path,
    requestId
  )

  // Em produção, não expor detalhes de erros não operacionais
  if (process.env.NODE_ENV === 'production' && !isOperationalError(err)) {
    errorResponse.error.message = ERROR_MESSAGES.INTERNAL_SERVER_ERROR
    delete errorResponse.error.details
  }

  // Retornar NextResponse com status code apropriado
  return NextResponse.json(errorResponse, {
    status: errorResponse.error.statusCode,
    headers: {
      'X-Request-Id': requestId,
    },
  })
}

/**
 * Wrapper assíncrono para rotas de API
 *
 * Captura erros automaticamente e retorna resposta formatada
 *
 * @example
 * export const GET = asyncHandler(async (request) => {
 *   const data = await fetchData()
 *   return NextResponse.json(data)
 * })
 */
export function asyncHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      // Extrair path da requisição se disponível
      const request = args[0]
      const path =
        request && typeof request === 'object' && 'nextUrl' in request
          ? (request as any).nextUrl.pathname
          : undefined

      return handleError(error, path)
    }
  }
}

/**
 * Middleware de tratamento de erros para API routes
 *
 * Captura erros síncronos e assíncronos
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => NextResponse | Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      const result = handler(...args)
      return result instanceof Promise ? await result : result
    } catch (error) {
      const request = args[0]
      const path =
        request && typeof request === 'object' && 'nextUrl' in request
          ? (request as any).nextUrl.pathname
          : undefined

      return handleError(error, path)
    }
  }
}

/**
 * Handler de erros não capturados (global)
 *
 * Deve ser configurado no início da aplicação
 */
export function setupGlobalErrorHandlers() {
  // Erros não capturados
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception', {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      })

      // Em produção, dar tempo para logs serem salvos antes de encerrar
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
          process.exit(1)
        }, 1000)
      }
    })

    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error('Unhandled Rejection', {
        reason: reason instanceof Error ? {
          name: reason.name,
          message: reason.message,
          stack: reason.stack,
        } : reason,
        promise: promise.toString(),
      })
    })
  }
}

/**
 * Extrai mensagem de erro amigável
 */
export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  return 'Erro desconhecido'
}

/**
 * Verifica se o erro deve ser relatado ao usuário
 */
export function shouldReportToUser(error: unknown): boolean {
  if (isAppError(error)) {
    return error.isOperational
  }

  return false
}

/**
 * Formata erro para logging
 */
export function formatErrorForLogging(error: unknown): Record<string, any> {
  if (isAppError(error)) {
    return {
      type: 'AppError',
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      details: error.details,
      stack: error.stack,
    }
  }

  if (error instanceof Error) {
    return {
      type: 'Error',
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    type: typeof error,
    value: String(error),
  }
}
