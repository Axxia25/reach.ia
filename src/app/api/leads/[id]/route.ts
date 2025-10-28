import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase'
import { updateLeadSchema, deleteLeadSchema, validateRequestBody } from '@/lib/validations'
import { z } from 'zod'

// Schema para validar o ID do path
const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID deve ser um número'),
})

/**
 * GET /api/leads/[id]
 *
 * Busca um lead específico por ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Validar ID
    const validationResult = idParamSchema.safeParse(params)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'ID inválido',
          details: validationResult.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      )
    }

    const leadId = parseInt(params.id, 10)

    // Buscar lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error || !lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Verificar permissões (vendedor só vê seus próprios leads)
    const { data: profile } = await supabase
      .from('vendedor_profiles')
      .select('role, vendedor_name')
      .eq('id', session.user.id)
      .single()

    if (profile?.role === 'vendedor' && lead.vendedor !== profile.vendedor_name) {
      return NextResponse.json(
        { error: 'Sem permissão para visualizar este lead' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: lead,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/leads/[id]
 *
 * Atualiza um lead existente
 *
 * Body (JSON):
 * - nome: string (opcional)
 * - timestamps: string ISO 8601 (opcional)
 * - telefone: string (opcional)
 * - veiculo: string (opcional)
 * - resumo: string (opcional)
 * - conversation_id: string UUID (opcional)
 * - vendedor: string (opcional)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Validar ID do path
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.error.errors },
        { status: 400 }
      )
    }

    const leadId = parseInt(params.id, 10)

    // Validar corpo da requisição
    const body = await validateRequestBody(request, updateLeadSchema.partial())
    if (body instanceof NextResponse) {
      return body // Retornar erro de validação
    }

    // Verificar se lead existe
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (fetchError || !existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('vendedor_profiles')
      .select('role, vendedor_name')
      .eq('id', session.user.id)
      .single()

    // Vendedor só pode editar seus próprios leads
    if (profile?.role === 'vendedor' && existingLead.vendedor !== profile.vendedor_name) {
      return NextResponse.json(
        { error: 'Sem permissão para editar este lead' },
        { status: 403 }
      )
    }

    // Atualizar lead
    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', leadId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar lead:', updateError)
      return NextResponse.json(
        { error: 'Erro ao atualizar lead', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead atualizado com sucesso',
      data: updatedLead,
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/leads/[id]
 *
 * Deleta um lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createSupabaseClient()

    // Verificar autenticação
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    // Validar ID
    const idValidation = idParamSchema.safeParse(params)
    if (!idValidation.success) {
      return NextResponse.json(
        { error: 'ID inválido', details: idValidation.error.errors },
        { status: 400 }
      )
    }

    const leadId = parseInt(params.id, 10)

    // Verificar se lead existe
    const { data: existingLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (fetchError || !existingLead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    // Verificar permissões
    const { data: profile } = await supabase
      .from('vendedor_profiles')
      .select('role, vendedor_name')
      .eq('id', session.user.id)
      .single()

    // Apenas admin e gerente podem deletar leads
    if (profile?.role === 'vendedor') {
      return NextResponse.json(
        { error: 'Sem permissão para deletar leads' },
        { status: 403 }
      )
    }

    // Deletar lead
    const { error: deleteError } = await supabase.from('leads').delete().eq('id', leadId)

    if (deleteError) {
      console.error('Erro ao deletar lead:', deleteError)
      return NextResponse.json(
        { error: 'Erro ao deletar lead', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deletado com sucesso',
    })
  } catch (error) {
    console.error('Erro inesperado:', error)
    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
