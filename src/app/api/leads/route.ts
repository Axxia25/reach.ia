import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import {
  createLeadSchema,
  searchLeadsSchema,
  validateRequestBody,
  validateQueryParams,
  withValidation,
} from '@/lib/validations'
import {
  asyncHandler,
  UnauthorizedError,
  fromSupabaseError,
  logger,
} from '@/lib/errors'

/**
 * GET /api/leads
 *
 * Lista leads com filtros opcionais
 *
 * Query params:
 * - search: string (opcional) - Termo de busca
 * - vendedor: string (opcional) - Filtrar por vendedor
 * - period: number (opcional) - Período em dias (padrão: 30)
 * - limit: number (opcional) - Limite de resultados (padrão: 100)
 * - offset: number (opcional) - Offset para paginação (padrão: 0)
 */
export const GET = asyncHandler(async (request: NextRequest) => {
  const startTime = Date.now()
  const supabase = createSupabaseClient()

  // Verificar autenticação
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new UnauthorizedError('Você precisa estar autenticado para acessar este recurso')
  }

  // Validar query params
  const params = validateQueryParams(request, searchLeadsSchema)
  if (params instanceof NextResponse) {
    return params // Retornar erro de validação
  }

  // Construir query
  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Aplicar filtros
  if (params.vendedor) {
    query = query.eq('vendedor', params.vendedor)
  }

  if (params.search) {
    query = query.or(
      `nome.ilike.%${params.search}%,telefone.ilike.%${params.search}%,veiculo.ilike.%${params.search}%`
    )
  }

  if (params.period) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - params.period)
    query = query.gte('created_at', startDate.toISOString())
  }

  // Paginação
  if (params.limit) {
    query = query.limit(params.limit)
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 100) - 1)
  }

  const { data: leads, error, count } = await query

  if (error) {
    throw fromSupabaseError(error)
  }

  const duration = Date.now() - startTime
  logger.httpRequest('GET', '/api/leads', 200, duration)

  return NextResponse.json({
    success: true,
    data: leads,
    pagination: {
      total: count || 0,
      limit: params.limit || 100,
      offset: params.offset || 0,
    },
  })
})

/**
 * POST /api/leads
 *
 * Cria um novo lead
 *
 * Body (JSON):
 * - nome: string (obrigatório)
 * - timestamps: string ISO 8601 (obrigatório)
 * - telefone: string (opcional)
 * - veiculo: string (opcional)
 * - resumo: string (opcional)
 * - conversation_id: string UUID (opcional)
 * - vendedor: string (opcional)
 */
export const POST = asyncHandler(
  withValidation(createLeadSchema, async (request, validatedData) => {
    const startTime = Date.now()
    const supabase = createSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      throw new UnauthorizedError('Você precisa estar autenticado para criar leads')
    }

    // Buscar perfil do usuário para verificar permissões
    const { data: profile, error: profileError } = await supabase
      .from('vendedor_profiles')
      .select('role, vendedor_name')
      .eq('id', session.user.id)
      .single()

    if (profileError) {
      throw fromSupabaseError(profileError)
    }

    // Se não especificou vendedor e é vendedor (não admin/gerente), usar nome do próprio vendedor
    if (!validatedData.vendedor && profile?.role === 'vendedor') {
      validatedData.vendedor = profile.vendedor_name
    }

    // Inserir lead
    const { data: lead, error } = await supabase
      .from('leads')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      throw fromSupabaseError(error)
    }

    const duration = Date.now() - startTime
    logger.httpRequest('POST', '/api/leads', 201, duration)
    logger.info('Lead criado', {
      leadId: lead.id,
      vendedor: lead.vendedor,
      userId: session.user.id,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Lead criado com sucesso',
        data: lead,
      },
      { status: 201 }
    )
  })
)
