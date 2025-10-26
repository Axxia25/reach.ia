# PRD - Sistema de Fila de Distribuição de Leads (Roleta)

## 📋 Visão Geral

Sistema de gerenciamento de fila para controle de distribuição automática de leads entre vendedores ativos. Cada vendedor poderá ativar/desativar sua participação na fila através de um toggle no header de seu dashboard pessoal.

## 🎯 Objetivos

- Permitir que vendedores controlem sua disponibilidade para receber novos leads
- Implementar sistema de distribuição automática baseado em roleta/round-robin
- Manter histórico de ativações/desativações para auditoria
- Preparar base para regras de distribuição mais complexas no futuro

## 👥 Stakeholders

- **Vendedores**: Controle sobre recebimento de leads
- **Gerentes**: Visibilidade sobre equipe ativa
- **Administradores**: Configuração de regras de distribuição

## 📊 Status Atual (Implementado)

### ✅ Fase 1: Interface de Controle Individual
- [x] Toggle discreto no header da página do vendedor
- [x] Estado local `isActiveInQueue` (default: true)
- [x] Função `handleToggleQueue` com console.log
- [x] UI responsiva com feedback visual (verde/cinza)
- [x] Labels adaptativos por breakpoint
- [x] Tooltips informativos

### 📁 Arquivos Modificados
- `src/app/dashboard/vendedor/[nome]/page.tsx` - Toggle implementado

## 🚀 Roadmap de Implementação

### Fase 2: Persistência no Banco de Dados

#### 2.1 Estrutura de Dados

**Tabela: `vendor_queue_status`**
```sql
CREATE TABLE vendor_queue_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(vendedor)
);

-- Índice para consultas rápidas
CREATE INDEX idx_vendor_queue_active ON vendor_queue_status(is_active, vendedor);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_vendor_queue_status_updated_at
  BEFORE UPDATE ON vendor_queue_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**Tabela: `vendor_queue_history`**
```sql
CREATE TABLE vendor_queue_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT
);

-- Índice para queries de histórico
CREATE INDEX idx_vendor_queue_history_vendedor ON vendor_queue_history(vendedor, changed_at DESC);
```

#### 2.2 Políticas RLS (Row Level Security)

```sql
-- Vendedores podem ler e atualizar seu próprio status
ALTER TABLE vendor_queue_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendedores podem ver seu próprio status"
  ON vendor_queue_status FOR SELECT
  USING (
    vendedor = (
      SELECT vendedor_name FROM vendedor_profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Vendedores podem atualizar seu próprio status"
  ON vendor_queue_status FOR UPDATE
  USING (
    vendedor = (
      SELECT vendedor_name FROM vendedor_profiles
      WHERE id = auth.uid()
    )
  );

-- Gerentes e admins podem ver todos os status
CREATE POLICY "Gerentes e admins podem ver todos os status"
  ON vendor_queue_status FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM vendedor_profiles
      WHERE id = auth.uid()
      AND role IN ('GERENTE', 'ADMIN')
    )
  );
```

#### 2.3 Integração no Frontend

**Atualizar `src/app/dashboard/vendedor/[nome]/page.tsx`:**

```typescript
// Adicionar useEffect para carregar status do banco
useEffect(() => {
  const loadQueueStatus = async () => {
    const { data, error } = await supabase
      .from('vendor_queue_status')
      .select('is_active')
      .eq('vendedor', vendedorNome)
      .single()

    if (data && !error) {
      setIsActiveInQueue(data.is_active)
    }
  }

  if (vendedorNome) {
    loadQueueStatus()
  }
}, [vendedorNome])

// Atualizar handleToggleQueue para persistir no banco
const handleToggleQueue = async () => {
  const newStatus = !isActiveInQueue

  try {
    const { error } = await supabase
      .from('vendor_queue_status')
      .upsert({
        vendedor: vendedorNome,
        is_active: newStatus,
        updated_by: user.id
      })

    if (error) throw error

    // Registrar no histórico
    await supabase
      .from('vendor_queue_history')
      .insert({
        vendedor: vendedorNome,
        is_active: newStatus,
        changed_by: user.id
      })

    setIsActiveInQueue(newStatus)
    console.log(`${vendedorNome} ${newStatus ? 'ativado' : 'desativado'} na fila de distribuição`)
  } catch (error) {
    console.error('Erro ao atualizar status na fila:', error)
    alert('Erro ao atualizar status. Tente novamente.')
  }
}
```

### Fase 3: Painel de Gerenciamento (Admin/Gerente)

#### 3.1 Nova Página: `/dashboard/admin/fila-distribuicao`

**Funcionalidades:**
- Visualizar todos os vendedores e seus status (ativo/inativo)
- Ativar/desativar vendedores em massa
- Visualizar histórico de mudanças de status
- Métricas de disponibilidade por vendedor
- Configurar regras de distribuição

**UI Components:**
- Tabela com toggle para cada vendedor
- Filtros: Todos / Ativos / Inativos
- Gráfico de disponibilidade ao longo do tempo
- Timeline de histórico de mudanças

#### 3.2 Wireframe Sugerido

```
┌─────────────────────────────────────────────────────────┐
│ Gerenciamento de Fila de Distribuição                  │
├─────────────────────────────────────────────────────────┤
│ [Todos ▼] [Buscar...]                   15 Ativos / 20  │
├─────────────────────────────────────────────────────────┤
│ Vendedor          │ Status    │ Última Mudança │ Ações  │
├───────────────────┼───────────┼────────────────┼────────┤
│ 🥇 João Silva     │ [●⚪ ON]  │ Há 2 horas     │ [📊]   │
│ 🥈 Maria Santos   │ [⚪● OFF] │ Há 1 dia       │ [📊]   │
│ 🥉 Pedro Costa    │ [●⚪ ON]  │ Há 30 min      │ [📊]   │
└─────────────────────────────────────────────────────────┘
```

### Fase 4: Sistema de Distribuição Automática

#### 4.1 Algoritmo de Distribuição (Round-Robin)

**Função Supabase: `distribute_lead_to_next_vendor()`**

```sql
CREATE OR REPLACE FUNCTION distribute_lead_to_next_vendor(
  lead_id INTEGER
) RETURNS VARCHAR AS $$
DECLARE
  next_vendor VARCHAR;
BEGIN
  -- Buscar próximo vendedor ativo em ordem alfabética
  -- (pode ser ajustado para lógica mais complexa)
  SELECT vendedor INTO next_vendor
  FROM vendor_queue_status
  WHERE is_active = true
  ORDER BY
    (SELECT COUNT(*) FROM leads WHERE vendedor = vendor_queue_status.vendedor) ASC,
    vendedor ASC
  LIMIT 1;

  IF next_vendor IS NULL THEN
    RAISE EXCEPTION 'Nenhum vendedor ativo na fila';
  END IF;

  -- Atualizar lead com vendedor
  UPDATE leads
  SET vendedor = next_vendor
  WHERE id = lead_id;

  RETURN next_vendor;
END;
$$ LANGUAGE plpgsql;
```

#### 4.2 Webhook/Trigger para Novos Leads

**Opção 1: Database Trigger**
```sql
CREATE OR REPLACE FUNCTION auto_distribute_lead()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.vendedor IS NULL THEN
    NEW.vendedor := distribute_lead_to_next_vendor(NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_distribute_lead
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_distribute_lead();
```

**Opção 2: Edge Function (Mais flexível)**
```typescript
// supabase/functions/distribute-lead/index.ts
Deno.serve(async (req) => {
  const { leadId } = await req.json()

  // Lógica de distribuição
  const activeVendors = await getActiveVendors()
  const nextVendor = selectNextVendor(activeVendors)

  await assignLeadToVendor(leadId, nextVendor)

  return new Response(JSON.stringify({ vendor: nextVendor }))
})
```

### Fase 5: Regras Avançadas de Distribuição

#### 5.1 Configurações Adicionais

**Tabela: `vendor_queue_settings`**
```sql
CREATE TABLE vendor_queue_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendedor VARCHAR(255) NOT NULL UNIQUE,
  max_leads_per_day INTEGER,
  priority_level INTEGER DEFAULT 1,
  working_hours JSONB, -- Ex: {"start": "08:00", "end": "18:00"}
  days_of_week INTEGER[], -- Ex: [1,2,3,4,5] (Seg-Sex)
  lead_types VARCHAR[] -- Ex: ["novo", "retorno"]
);
```

#### 5.2 Algoritmos de Distribuição

1. **Round-Robin Simples**: Reveza entre vendedores ativos
2. **Baseado em Carga**: Distribui para vendedor com menos leads
3. **Baseado em Performance**: Prioriza vendedores com maior taxa de conversão
4. **Horário Comercial**: Respeita horários de trabalho configurados
5. **Especialização**: Distribui tipos específicos de leads para vendedores especializados

## 📈 Métricas de Sucesso

### KPIs a Monitorar
- Taxa de disponibilidade média dos vendedores (% de tempo ativo)
- Tempo médio entre ativação/desativação
- Distribuição de leads por vendedor (equidade)
- Taxa de conversão por status de fila (ativo vs inativo)
- Tempo de resposta do primeiro contato

### Dashboard de Métricas
```
┌─────────────────────────────────────┐
│ Disponibilidade Média: 87%         │
│ Vendedores Ativos Agora: 15/20     │
│ Leads Distribuídos Hoje: 145       │
│ Equidade de Distribuição: 92%      │
└─────────────────────────────────────┘
```

## 🔐 Segurança e Permissões

### Níveis de Acesso
- **VENDEDOR**:
  - Pode ativar/desativar apenas seu próprio status
  - Ver apenas seu próprio histórico

- **GERENTE**:
  - Ver status de todos os vendedores da equipe
  - Ativar/desativar vendedores (com registro de ação)
  - Acessar relatórios de disponibilidade

- **ADMIN**:
  - Acesso total ao sistema
  - Configurar regras de distribuição
  - Modificar configurações avançadas

## 🧪 Testes

### Cenários de Teste
1. **Toggle Básico**: Vendedor ativa/desativa status
2. **Persistência**: Status mantido após refresh
3. **Concorrência**: Múltiplos vendedores alterando status simultaneamente
4. **Distribuição**: Leads distribuídos apenas para vendedores ativos
5. **Histórico**: Registro correto de todas as mudanças
6. **Performance**: Sistema suporta 100+ vendedores ativos

## 📝 Documentação

### Para Vendedores
- Como ativar/desativar participação na fila
- Impacto no recebimento de leads
- Boas práticas de uso

### Para Gerentes
- Como monitorar disponibilidade da equipe
- Como interpretar métricas de distribuição
- Como intervir quando necessário

### Para Desenvolvedores
- Arquitetura do sistema
- API endpoints
- Modelos de dados
- Guia de contribuição

## 🔄 Integrações Futuras

- **CRM Externo**: Sincronizar status com sistemas externos
- **Calendário**: Ativar/desativar automaticamente baseado em agenda
- **WhatsApp/Slack**: Notificações de mudança de status
- **BI/Analytics**: Export de dados para ferramentas de análise

## 📅 Cronograma Estimado

- **Fase 2**: 2-3 dias (Persistência no banco)
- **Fase 3**: 3-4 dias (Painel de gerenciamento)
- **Fase 4**: 3-5 dias (Distribuição automática)
- **Fase 5**: 5-7 dias (Regras avançadas)

**Total Estimado**: 13-19 dias de desenvolvimento

## ✅ Critérios de Aceitação

### MVP (Fases 2-3)
- [ ] Status de vendedor persiste no banco de dados
- [ ] Toggle funciona sem erros
- [ ] Histórico de mudanças registrado
- [ ] Painel admin mostra todos os vendedores
- [ ] RLS implementado corretamente

### Produto Completo (Fases 4-5)
- [ ] Distribuição automática funcional
- [ ] Leads distribuídos apenas para ativos
- [ ] Regras configuráveis por admin
- [ ] Métricas disponíveis em dashboard
- [ ] Documentação completa

---

**Versão**: 1.0
**Data de Criação**: 2025-10-26
**Última Atualização**: 2025-10-26
**Autor**: Claude Code AI Assistant
**Status**: Em Desenvolvimento (Fase 1 Concluída)
