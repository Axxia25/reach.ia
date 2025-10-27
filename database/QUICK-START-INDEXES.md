# Quick Start - Aplicar Índices Compostos

## 🚀 Aplicação Rápida (3 minutos)

### Passo 1: Acesse o Supabase Dashboard
1. Vá para https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** no menu lateral

### Passo 2: Execute a Migration
1. Clique em **New Query**
2. Cole TODO o conteúdo do arquivo `database/migrations/002_add_composite_indexes.sql`
3. Clique em **Run** (ou pressione `Ctrl/Cmd + Enter`)
4. Aguarde a execução (~30-60 segundos)

### Passo 3: Verifique
Execute esta query para confirmar:

```sql
SELECT indexname, tablename
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'vendedor_profiles', 'vendor_queue_status')
ORDER BY tablename, indexname;
```

Você deve ver **16 novos índices** listados.

## ✅ Resultado Esperado

```
indexname                              | tablename
---------------------------------------+---------------------
idx_leads_conversation_timestamps      | leads
idx_leads_created_at_vendedor          | leads
idx_leads_created_updated              | leads
idx_leads_nome_telefone                | leads
idx_leads_recent                       | leads
idx_leads_search_gin                   | leads
idx_leads_timestamps_vendedor          | leads
idx_leads_veiculo_created              | leads
idx_leads_vendedor_covering            | leads
idx_leads_vendedor_created_at          | leads
idx_leads_vendedor_veiculo             | leads
idx_leads_with_phone                   | leads
idx_vendedor_profiles_email_role       | vendedor_profiles
idx_vendedor_profiles_role_name        | vendedor_profiles
idx_vendor_queue_active_vendedor       | vendor_queue_status
idx_vendor_queue_vendedor_updated      | vendor_queue_status
```

## 📊 Teste de Performance

Execute este benchmark ANTES e DEPOIS:

```sql
-- Teste 1: Dashboard de vendedor
EXPLAIN ANALYZE
SELECT * FROM leads
WHERE vendedor = 'João Silva'
ORDER BY created_at DESC
LIMIT 100;

-- Teste 2: Busca de duplicata
EXPLAIN ANALYZE
SELECT * FROM leads
WHERE nome = 'João Silva'
  AND telefone = '11988887777';

-- Teste 3: Busca de texto
EXPLAIN ANALYZE
SELECT * FROM leads
WHERE nome ILIKE '%Toyota%'
   OR veiculo ILIKE '%Toyota%';
```

**ANTES**: Você verá `Seq Scan` (Sequential Scan)
**DEPOIS**: Você verá `Index Scan` ou `Index Only Scan`

## ⚡ Performance Esperada

| Query | Antes | Depois | Melhoria |
|-------|-------|--------|----------|
| Dashboard Vendedor | ~450ms | ~90ms | **80%** ⬇️ |
| Busca Duplicata | ~800ms | ~8ms | **99%** ⬇️ |
| Busca Texto (LIKE) | ~1200ms | ~60ms | **95%** ⬇️ |

## 🔧 Troubleshooting

### Erro: "relation already exists"
Alguns índices já existem. Tudo bem! O `IF NOT EXISTS` garante que não há erro.

### Erro: "permission denied"
Você precisa de permissões de superusuário. Use a role `postgres` no Supabase.

### Índices não aparecem
Execute `ANALYZE leads;` para atualizar as estatísticas.

### Performance não melhorou
1. Verifique se o índice está sendo usado: `EXPLAIN ANALYZE sua_query`
2. Atualize estatísticas: `ANALYZE leads;`
3. Aguarde alguns minutos para o cache "esquentar"

## 📝 Rollback (se necessário)

Se precisar remover os índices:

```sql
-- Remove todos os índices criados
DROP INDEX IF EXISTS idx_leads_vendedor_created_at;
DROP INDEX IF EXISTS idx_leads_created_at_vendedor;
DROP INDEX IF EXISTS idx_leads_timestamps_vendedor;
DROP INDEX IF EXISTS idx_leads_vendedor_veiculo;
DROP INDEX IF EXISTS idx_leads_nome_telefone;
DROP INDEX IF EXISTS idx_leads_created_updated;
DROP INDEX IF EXISTS idx_leads_veiculo_created;
DROP INDEX IF EXISTS idx_leads_conversation_timestamps;
DROP INDEX IF EXISTS idx_leads_vendedor_covering;
DROP INDEX IF EXISTS idx_leads_recent;
DROP INDEX IF EXISTS idx_leads_with_phone;
DROP INDEX IF EXISTS idx_leads_search_gin;
DROP INDEX IF EXISTS idx_vendedor_profiles_role_name;
DROP INDEX IF EXISTS idx_vendedor_profiles_email_role;
DROP INDEX IF EXISTS idx_vendor_queue_active_vendedor;
DROP INDEX IF EXISTS idx_vendor_queue_vendedor_updated;
```

## 📈 Monitoramento Contínuo

Execute semanalmente para ver uso dos índices:

```sql
SELECT
  indexname,
  idx_scan as scans,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename = 'leads'
ORDER BY idx_scan DESC;
```

**Interpretação**:
- `scans > 1000` → Índice importante ✅
- `scans < 10` → Considere remover ⚠️
- `size > 100MB` → Monitore crescimento 👀

---

**Próximos Passos**: Ver documentação completa em `DATABASE-INDEXES-DOCS.md`
