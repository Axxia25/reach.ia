-- =====================================================
-- CONFIGURAÇÃO COMPLETA DO SUPABASE PARA DASHBOARD LEADS
-- =====================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Configurar autenticação (caso precise customizar)
-- Por padrão, o Supabase já vem configurado

-- 3. Políticas RLS para a tabela leads
-- Permitir que usuários autenticados vejam todos os leads
CREATE POLICY "Usuários autenticados podem ver todos os leads" ON leads
    FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados insiram leads
CREATE POLICY "Usuários autenticados podem inserir leads" ON leads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir que usuários autenticados atualizem leads
CREATE POLICY "Usuários autenticados podem atualizar leads" ON leads
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Opcional: Permitir delete (caso necessário)
-- CREATE POLICY "Usuários autenticados podem deletar leads" ON leads
--     FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Habilitar Realtime para a tabela leads
ALTER publication supabase_realtime ADD TABLE leads;

-- 5. Função para atualizar timestamp automaticamente
-- (Já criada no script anterior, mas incluindo aqui para completude)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Trigger para updated_at (se ainda não existir)
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Função para limpar dados antigos (opcional - manter apenas últimos 6 meses)
CREATE OR REPLACE FUNCTION cleanup_old_leads()
RETURNS void AS $$
BEGIN
    DELETE FROM leads 
    WHERE created_at < NOW() - INTERVAL '6 months';
END;
$$ language 'plpgsql';

-- 8. Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_leads_nome ON leads(nome);
CREATE INDEX IF NOT EXISTS idx_leads_telefone ON leads(telefone);
CREATE INDEX IF NOT EXISTS idx_leads_veiculo ON leads(veiculo);

-- 9. View para estatísticas em tempo real
CREATE OR REPLACE VIEW leads_stats_realtime AS
SELECT 
    COUNT(*) as total_leads,
    COUNT(DISTINCT vendedor) as total_vendedores,
    COUNT(DISTINCT veiculo) as total_veiculos,
    COUNT(CASE WHEN created_at >= CURRENT_DATE THEN 1 END) as leads_hoje,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as leads_ultimos_7_dias,
    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as leads_ultimos_30_dias
FROM leads;

-- 10. Política RLS para views
CREATE POLICY "Usuários autenticados podem ver estatísticas" ON leads_stats_realtime
    FOR SELECT USING (auth.role() = 'authenticated');

-- 11. Função para busca de leads (com filtros)
CREATE OR REPLACE FUNCTION search_leads(
    search_term TEXT DEFAULT '',
    vendor_filter TEXT DEFAULT 'todos',
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    id BIGINT,
    timestamps TIMESTAMPTZ,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    veiculo TEXT,
    resumo TEXT,
    conversation_id VARCHAR(255),
    vendedor VARCHAR(100),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT l.id, l.timestamps, l.nome, l.telefone, l.veiculo, 
           l.resumo, l.conversation_id, l.vendedor, l.created_at, l.updated_at
    FROM leads l
    WHERE 
        (search_term = '' OR 
         l.nome ILIKE '%' || search_term || '%' OR 
         l.telefone ILIKE '%' || search_term || '%' OR 
         l.veiculo ILIKE '%' || search_term || '%' OR
         l.vendedor ILIKE '%' || search_term || '%')
        AND 
        (vendor_filter = 'todos' OR l.vendedor = vendor_filter)
        AND 
        l.created_at >= NOW() - INTERVAL '1 day' * period_days
    ORDER BY l.timestamps DESC;
END;
$$ language 'plpgsql';

-- 12. Configurações de segurança adicionais
-- Revogar acesso público
REVOKE ALL ON leads FROM PUBLIC;

-- Garantir que apenas usuários autenticados tenham acesso
GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;
GRANT SELECT ON leads_daily_summary TO authenticated;
GRANT SELECT ON leads_por_vendedor TO authenticated;
GRANT SELECT ON leads_stats_realtime TO authenticated;

-- 13. Configurar CORS para o domínio do Netlify (substitua pela sua URL)
-- Isso é feito na interface do Supabase ou via configuração do projeto

-- =====================================================
-- DADOS DE TESTE (OPCIONAL)
-- =====================================================

-- Inserir alguns dados de teste para visualizar o dashboard
-- DELETE FROM leads; -- Descomente se quiser limpar dados existentes

INSERT INTO leads (timestamps, nome, telefone, veiculo, vendedor, resumo) VALUES
('2024-10-17 14:30:00', 'João Silva', '(11) 99999-1234', 'Civic 2020', 'José', 'Cliente interessado em financiamento'),
('2024-10-17 13:15:00', 'Maria Santos', '(11) 98888-5678', 'Corolla Cross', 'Alisson', 'Quer agendar test drive'),
('2024-10-17 11:45:00', 'Pedro Oliveira', '(11) 97777-9012', 'Gol 2019', 'Gustavo', 'Procura carro usado'),
('2024-10-16 16:20:00', 'Ana Costa', '(11) 96666-3456', 'HB20 2021', 'Junior', 'Interessada em troca'),
('2024-10-16 15:10:00', 'Carlos Ferreira', '(11) 95555-7890', 'Onix Plus', 'José', 'Quer desconto à vista'),
('2024-10-16 10:30:00', 'Lucia Mendes', '(11) 94444-1234', 'Saveiro Cross', 'Alisson', 'Primeira compra'),
('2024-10-15 14:45:00', 'Roberto Lima', '(11) 93333-5678', 'Fusion 2018', 'Gustavo', 'Procura sedan executivo'),
('2024-10-15 09:15:00', 'Fernanda Rocha', '(11) 92222-9012', 'Polo 2020', 'Junior', 'Compra para filha')
ON CONFLICT (conversation_id) DO NOTHING;

-- =====================================================
-- COMANDOS PARA EXECUTAR NO SUPABASE
-- =====================================================

/*
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Cole e execute este script
4. Verifique se todas as políticas foram criadas
5. Teste a autenticação criando um usuário
6. Configure as variáveis de ambiente no Netlify
*/
