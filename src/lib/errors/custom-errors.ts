/**
 * Custom Error Classes
 *
 * Hierarquia de erros personalizada para tratamento consistente
 */

/**
 * Classe base para todos os erros customizados da aplicação
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string
  public readonly details?: any

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: any
  ) {
    super(message)
    Object.setPrototypeOf(this, new.target.prototype)

    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details

    Error.captureStackTrace(this)
  }
}

/**
 * Erro 400 - Bad Request
 * Usado quando a requisição é inválida
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Requisição inválida', details?: any) {
    super(message, 400, true, 'BAD_REQUEST', details)
  }
}

/**
 * Erro 401 - Unauthorized
 * Usado quando o usuário não está autenticado
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autenticado', details?: any) {
    super(message, 401, true, 'UNAUTHORIZED', details)
  }
}

/**
 * Erro 403 - Forbidden
 * Usado quando o usuário não tem permissão
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado', details?: any) {
    super(message, 403, true, 'FORBIDDEN', details)
  }
}

/**
 * Erro 404 - Not Found
 * Usado quando o recurso não é encontrado
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso não encontrado', details?: any) {
    super(message, 404, true, 'NOT_FOUND', details)
  }
}

/**
 * Erro 409 - Conflict
 * Usado quando há conflito (ex: email já existe)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflito de dados', details?: any) {
    super(message, 409, true, 'CONFLICT', details)
  }
}

/**
 * Erro 422 - Unprocessable Entity
 * Usado quando a validação de negócio falha
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Erro de validação', details?: any) {
    super(message, 422, true, 'VALIDATION_ERROR', details)
  }
}

/**
 * Erro 429 - Too Many Requests
 * Usado quando o rate limit é excedido
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Muitas requisições', details?: any) {
    super(message, 429, true, 'RATE_LIMIT_EXCEEDED', details)
  }
}

/**
 * Erro 500 - Internal Server Error
 * Usado para erros internos do servidor
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', details?: any) {
    super(message, 500, false, 'INTERNAL_SERVER_ERROR', details)
  }
}

/**
 * Erro 503 - Service Unavailable
 * Usado quando um serviço externo está indisponível
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Serviço temporariamente indisponível', details?: any) {
    super(message, 503, true, 'SERVICE_UNAVAILABLE', details)
  }
}

/**
 * Erro de Database
 * Usado para erros relacionados ao banco de dados
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Erro no banco de dados', details?: any) {
    super(message, 500, false, 'DATABASE_ERROR', details)
  }
}

/**
 * Erro de Autenticação
 * Usado para problemas específicos de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Erro de autenticação', details?: any) {
    super(message, 401, true, 'AUTHENTICATION_ERROR', details)
  }
}

/**
 * Erro de Autorização
 * Usado para problemas específicos de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão para esta ação', details?: any) {
    super(message, 403, true, 'AUTHORIZATION_ERROR', details)
  }
}

/**
 * Erro de Timeout
 * Usado quando uma operação excede o tempo limite
 */
export class TimeoutError extends AppError {
  constructor(message: string = 'Operação excedeu o tempo limite', details?: any) {
    super(message, 504, true, 'TIMEOUT', details)
  }
}

/**
 * Erro de Integração Externa
 * Usado quando uma API externa falha
 */
export class ExternalAPIError extends AppError {
  constructor(
    message: string = 'Erro ao comunicar com serviço externo',
    details?: any
  ) {
    super(message, 502, true, 'EXTERNAL_API_ERROR', details)
  }
}

/**
 * Type guard para verificar se é um AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

/**
 * Type guard para verificar se é um erro operacional
 */
export function isOperationalError(error: any): boolean {
  if (error instanceof AppError) {
    return error.isOperational
  }
  return false
}

/**
 * Converte erros do Supabase para AppError
 */
export function fromSupabaseError(error: any): AppError {
  // Erros comuns do Supabase
  if (error.code === '23505') {
    // Unique violation
    return new ConflictError('Registro já existe', { originalError: error })
  }

  if (error.code === '23503') {
    // Foreign key violation
    return new BadRequestError('Referência inválida', { originalError: error })
  }

  if (error.code === '42501') {
    // Insufficient privilege (RLS)
    return new ForbiddenError('Sem permissão para acessar este recurso', {
      originalError: error,
    })
  }

  if (error.code === 'PGRST116') {
    // No rows returned
    return new NotFoundError('Registro não encontrado', { originalError: error })
  }

  if (error.message?.includes('JWT')) {
    return new UnauthorizedError('Token inválido ou expirado', {
      originalError: error,
    })
  }

  // Erro genérico do database
  return new DatabaseError(error.message || 'Erro no banco de dados', {
    originalError: error,
  })
}

/**
 * Converte erros do Zod para ValidationError
 */
export function fromZodError(error: any): ValidationError {
  const details = error.errors?.map((err: any) => ({
    field: err.path.join('.'),
    message: err.message,
  }))

  return new ValidationError('Erro de validação dos dados', details)
}

/**
 * Mapa de códigos de erro para mensagens amigáveis
 */
export const ERROR_MESSAGES: Record<string, string> = {
  BAD_REQUEST: 'A requisição enviada é inválida',
  UNAUTHORIZED: 'Você precisa estar autenticado para acessar este recurso',
  FORBIDDEN: 'Você não tem permissão para realizar esta ação',
  NOT_FOUND: 'O recurso solicitado não foi encontrado',
  CONFLICT: 'Já existe um registro com estas informações',
  VALIDATION_ERROR: 'Os dados fornecidos são inválidos',
  RATE_LIMIT_EXCEEDED: 'Você excedeu o limite de requisições. Tente novamente mais tarde',
  INTERNAL_SERVER_ERROR: 'Ocorreu um erro inesperado. Nossa equipe foi notificada',
  SERVICE_UNAVAILABLE: 'O serviço está temporariamente indisponível. Tente novamente em alguns instantes',
  DATABASE_ERROR: 'Erro ao acessar o banco de dados',
  AUTHENTICATION_ERROR: 'Falha na autenticação',
  AUTHORIZATION_ERROR: 'Você não tem permissão para acessar este recurso',
  TIMEOUT: 'A operação demorou muito tempo e foi cancelada',
  EXTERNAL_API_ERROR: 'Erro ao comunicar com serviço externo',
}
