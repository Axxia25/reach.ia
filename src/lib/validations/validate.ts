import { z } from 'zod'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Utilitários de Validação para API Routes
 *
 * Fornece funções helper para validar dados de requisições HTTP
 */

/**
 * Tipo de resposta de validação
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError }

/**
 * Estrutura de erro de validação
 */
export interface ValidationError {
  message: string
  errors: Array<{
    field: string
    message: string
  }>
}

/**
 * Valida dados contra um schema Zod
 *
 * @param schema - Schema Zod para validação
 * @param data - Dados a serem validados
 * @returns Resultado da validação com dados tipados ou erro estruturado
 */
export function validate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  try {
    const validatedData = schema.parse(data)
    return {
      success: true,
      data: validatedData,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          message: 'Erro de validação dos dados',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
      }
    }

    // Erro inesperado
    return {
      success: false,
      error: {
        message: 'Erro inesperado durante validação',
        errors: [
          {
            field: 'unknown',
            message: error instanceof Error ? error.message : 'Erro desconhecido',
          },
        ],
      },
    }
  }
}

/**
 * Valida corpo da requisição (JSON) contra um schema
 *
 * @param request - NextRequest
 * @param schema - Schema Zod para validação
 * @returns Dados validados ou NextResponse com erro 400
 */
export async function validateRequestBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T> | NextResponse> {
  try {
    const body = await request.json()
    const result = validate(schema, body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.message,
          details: result.error.errors,
        },
        { status: 400 }
      )
    }

    return result.data
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Corpo da requisição inválido ou não é JSON',
        details: [
          {
            field: 'body',
            message: error instanceof Error ? error.message : 'Erro ao parsear JSON',
          },
        ],
      },
      { status: 400 }
    )
  }
}

/**
 * Valida query parameters da requisição contra um schema
 *
 * @param request - NextRequest
 * @param schema - Schema Zod para validação
 * @returns Dados validados ou NextResponse com erro 400
 */
export function validateQueryParams<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): z.infer<T> | NextResponse {
  const searchParams = request.nextUrl.searchParams
  const params: Record<string, string | number> = {}

  // Converter query params para objeto
  searchParams.forEach((value, key) => {
    // Tentar converter para número se possível
    const numValue = Number(value)
    params[key] = isNaN(numValue) ? value : numValue
  })

  const result = validate(schema, params)

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.message,
        details: result.error.errors,
      },
      { status: 400 }
    )
  }

  return result.data
}

/**
 * Valida path parameters (route params) contra um schema
 *
 * @param params - Route params do Next.js
 * @param schema - Schema Zod para validação
 * @returns Dados validados ou NextResponse com erro 400
 */
export function validatePathParams<T extends z.ZodTypeAny>(
  params: Record<string, string | string[]>,
  schema: T
): z.infer<T> | NextResponse {
  const result = validate(schema, params)

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error.message,
        details: result.error.errors,
      },
      { status: 400 }
    )
  }

  return result.data
}

/**
 * Cria uma resposta de erro de validação padronizada
 *
 * @param error - Erro de validação
 * @param status - Status HTTP (padrão: 400)
 * @returns NextResponse com erro formatado
 */
export function validationErrorResponse(
  error: ValidationError,
  status: number = 400
): NextResponse {
  return NextResponse.json(
    {
      error: error.message,
      details: error.errors,
    },
    { status }
  )
}

/**
 * Sanitiza string removendo caracteres perigosos para XSS
 *
 * @param input - String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, onload=, etc)
    .trim()
}

/**
 * Sanitiza objeto recursivamente
 *
 * @param obj - Objeto a ser sanitizado
 * @returns Objeto sanitizado
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Valida e sanitiza dados de requisição
 *
 * Combina validação de schema com sanitização de strings
 *
 * @param schema - Schema Zod
 * @param data - Dados a serem validados e sanitizados
 * @returns Resultado com dados validados e sanitizados
 */
export function validateAndSanitize<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): ValidationResult<z.infer<T>> {
  const result = validate(schema, data)

  if (!result.success) {
    return result
  }

  // Sanitizar dados validados
  const sanitized = sanitizeObject(result.data)

  return {
    success: true,
    data: sanitized,
  }
}

/**
 * Wrapper para API routes com validação automática
 *
 * Exemplo de uso:
 * ```typescript
 * export const POST = withValidation(createLeadSchema, async (req, data) => {
 *   // data já está validado e tipado
 *   const lead = await createLead(data)
 *   return NextResponse.json(lead)
 * })
 * ```
 */
export function withValidation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (request: NextRequest, data: z.infer<T>) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const validatedData = await validateRequestBody(request, schema)

    // Se a validação retornou um erro (NextResponse), retornar
    if (validatedData instanceof NextResponse) {
      return validatedData
    }

    // Caso contrário, chamar o handler com os dados validados
    return handler(request, validatedData)
  }
}

/**
 * Type guard para verificar se é um NextResponse (erro)
 */
export function isNextResponse(value: any): value is NextResponse {
  return value instanceof NextResponse
}
