import { z } from 'zod'

/**
 * Schemas de Validação para Leads
 *
 * Usa Zod para validação type-safe de dados de entrada
 */

// Regex para validação de telefone brasileiro
const phoneRegex = /^(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?(?:9\s?)?\d{4}[-\s]?\d{4}$/

// Regex para validação de timestamps ISO 8601
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/

/**
 * Schema base para criação de leads
 */
export const createLeadSchema = z.object({
  // Campos obrigatórios
  nome: z
    .string({ message: 'Nome deve ser uma string' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .refine((val) => val.length > 0, {
      message: 'Nome não pode ser vazio',
    }),

  timestamps: z
    .string({ message: 'Timestamps deve ser uma string ISO 8601' })
    .regex(isoDateRegex, 'Timestamps deve estar no formato ISO 8601 (ex: 2025-01-01T12:00:00Z)')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Timestamps deve ser uma data válida',
    }),

  // Campos opcionais
  telefone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido. Use formato: (11) 98888-7777 ou +55 11 98888-7777')
    .optional()
    .nullable()
    .transform((val) => {
      // Normalizar telefone removendo caracteres especiais
      if (!val) return null
      return val.replace(/\D/g, '')
    }),

  veiculo: z
    .string()
    .min(2, 'Veículo deve ter pelo menos 2 caracteres')
    .max(255, 'Veículo deve ter no máximo 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  resumo: z
    .string()
    .max(5000, 'Resumo deve ter no máximo 5000 caracteres')
    .trim()
    .optional()
    .nullable(),

  conversation_id: z
    .string()
    .uuid('conversation_id deve ser um UUID válido')
    .optional()
    .nullable(),

  vendedor: z
    .string()
    .min(2, 'Nome do vendedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do vendedor deve ter no máximo 255 caracteres')
    .trim()
    .optional()
    .nullable(),
})

/**
 * Schema para atualização de leads (todos os campos opcionais)
 */
export const updateLeadSchema = z.object({
  id: z
    .number({ message: 'ID deve ser um número' })
    .int('ID deve ser um número inteiro')
    .positive('ID deve ser positivo'),

  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .trim()
    .optional(),

  timestamps: z
    .string()
    .regex(isoDateRegex, 'Timestamps deve estar no formato ISO 8601')
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Timestamps deve ser uma data válida',
    })
    .optional(),

  telefone: z
    .string()
    .regex(phoneRegex, 'Telefone inválido')
    .optional()
    .nullable()
    .transform((val) => {
      if (!val) return null
      return val.replace(/\D/g, '')
    }),

  veiculo: z
    .string()
    .min(2, 'Veículo deve ter pelo menos 2 caracteres')
    .max(255, 'Veículo deve ter no máximo 255 caracteres')
    .trim()
    .optional()
    .nullable(),

  resumo: z
    .string()
    .max(5000, 'Resumo deve ter no máximo 5000 caracteres')
    .trim()
    .optional()
    .nullable(),

  conversation_id: z
    .string()
    .uuid('conversation_id deve ser um UUID válido')
    .optional()
    .nullable(),

  vendedor: z
    .string()
    .min(2, 'Nome do vendedor deve ter pelo menos 2 caracteres')
    .max(255, 'Nome do vendedor deve ter no máximo 255 caracteres')
    .trim()
    .optional()
    .nullable(),
})

/**
 * Schema para busca/filtro de leads
 */
export const searchLeadsSchema = z.object({
  search: z
    .string()
    .max(255, 'Termo de busca deve ter no máximo 255 caracteres')
    .optional(),

  vendedor: z
    .string()
    .max(255, 'Nome do vendedor deve ter no máximo 255 caracteres')
    .optional(),

  period: z
    .number()
    .int('Período deve ser um número inteiro')
    .positive('Período deve ser positivo')
    .max(365, 'Período máximo é 365 dias')
    .default(30)
    .optional(),

  limit: z
    .number()
    .int('Limite deve ser um número inteiro')
    .positive('Limite deve ser positivo')
    .max(1000, 'Limite máximo é 1000 registros')
    .default(100)
    .optional(),

  offset: z
    .number()
    .int('Offset deve ser um número inteiro')
    .min(0, 'Offset deve ser maior ou igual a zero')
    .default(0)
    .optional(),
})

/**
 * Schema para deleção de lead
 */
export const deleteLeadSchema = z.object({
  id: z
    .number({ message: 'ID deve ser um número' })
    .int('ID deve ser um número inteiro')
    .positive('ID deve ser positivo'),
})

/**
 * Schema para atualização de status do lead
 */
export const updateLeadStatusSchema = z.object({
  id: z
    .number({ message: 'ID deve ser um número' })
    .int('ID deve ser um número inteiro')
    .positive('ID deve ser positivo'),

  status: z.enum(
    ['novo', 'contatado', 'qualificado', 'negociacao', 'ganho', 'perdido'],
    {
      message: 'Status deve ser: novo, contatado, qualificado, negociacao, ganho ou perdido',
    }
  ),

  observacao: z
    .string()
    .max(1000, 'Observação deve ter no máximo 1000 caracteres')
    .optional()
    .nullable(),
})

/**
 * Schema para importação em lote de leads
 */
export const bulkCreateLeadsSchema = z.object({
  leads: z
    .array(createLeadSchema)
    .min(1, 'Deve haver pelo menos 1 lead para importar')
    .max(100, 'Máximo de 100 leads por importação'),
})

// Tipos TypeScript inferidos dos schemas
export type CreateLeadInput = z.infer<typeof createLeadSchema>
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>
export type SearchLeadsInput = z.infer<typeof searchLeadsSchema>
export type DeleteLeadInput = z.infer<typeof deleteLeadSchema>
export type UpdateLeadStatusInput = z.infer<typeof updateLeadStatusSchema>
export type BulkCreateLeadsInput = z.infer<typeof bulkCreateLeadsSchema>
