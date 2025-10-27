-- =====================================================
-- Migration: Composite Indexes for Performance Optimization
-- Description: Adds composite indexes to improve query performance
-- Author: Axxia25
-- Date: 2025-10-26
-- =====================================================

-- =====================================================
-- LEADS TABLE COMPOSITE INDEXES
-- =====================================================

-- Index 1: vendedor + created_at (DESC)
-- Used by: Dashboard queries filtering by vendor and ordering by date
-- Query pattern: WHERE vendedor = 'X' ORDER BY created_at DESC
-- Benefit: Speeds up vendor-specific lead listings (most common query)
CREATE INDEX IF NOT EXISTS idx_leads_vendedor_created_at
ON leads(vendedor, created_at DESC)
WHERE vendedor IS NOT NULL;

-- Index 2: created_at + vendedor
-- Used by: Time-based queries with vendor aggregation
-- Query pattern: WHERE created_at >= 'date' GROUP BY vendedor
-- Benefit: Optimizes period-based reports and metrics
CREATE INDEX IF NOT EXISTS idx_leads_created_at_vendedor
ON leads(created_at DESC, vendedor)
WHERE created_at IS NOT NULL;

-- Index 3: timestamps + vendedor (for frontend filtering)
-- Used by: useLeads hook with period filtering
-- Query pattern: WHERE timestamps >= 'date' AND vendedor = 'X'
-- Benefit: Faster real-time dashboard updates
CREATE INDEX IF NOT EXISTS idx_leads_timestamps_vendedor
ON leads(timestamps DESC, vendedor)
WHERE timestamps IS NOT NULL;

-- Index 4: vendedor + veiculo (for analytics)
-- Used by: Vehicle preference analysis per vendor
-- Query pattern: WHERE vendedor = 'X' AND veiculo LIKE '%search%'
-- Benefit: Speeds up vehicle analytics and search
CREATE INDEX IF NOT EXISTS idx_leads_vendedor_veiculo
ON leads(vendedor, veiculo)
WHERE vendedor IS NOT NULL AND veiculo IS NOT NULL;

-- Index 5: nome + telefone (for duplicate detection)
-- Used by: Lead deduplication and search
-- Query pattern: WHERE nome = 'X' AND telefone = 'Y'
-- Benefit: Fast duplicate lead detection
CREATE INDEX IF NOT EXISTS idx_leads_nome_telefone
ON leads(nome, telefone)
WHERE nome IS NOT NULL AND telefone IS NOT NULL;

-- Index 6: created_at + updated_at (for change tracking)
-- Used by: Audit queries and recent activity tracking
-- Query pattern: WHERE created_at >= 'date' ORDER BY updated_at DESC
-- Benefit: Optimizes activity feeds and audit logs
CREATE INDEX IF NOT EXISTS idx_leads_created_updated
ON leads(created_at DESC, updated_at DESC);

-- Index 7: veiculo + created_at (for vehicle trend analysis)
-- Used by: Vehicle popularity reports over time
-- Query pattern: WHERE veiculo LIKE '%X%' AND created_at >= 'date'
-- Benefit: Faster vehicle trend analytics
CREATE INDEX IF NOT EXISTS idx_leads_veiculo_created
ON leads(veiculo, created_at DESC)
WHERE veiculo IS NOT NULL;

-- Index 8: conversation_id + timestamps (for chat history)
-- Used by: Retrieving conversation chronology
-- Query pattern: WHERE conversation_id = 'uuid' ORDER BY timestamps
-- Benefit: Fast conversation thread retrieval
CREATE INDEX IF NOT EXISTS idx_leads_conversation_timestamps
ON leads(conversation_id, timestamps ASC)
WHERE conversation_id IS NOT NULL;

-- =====================================================
-- VENDEDOR_PROFILES TABLE COMPOSITE INDEXES
-- =====================================================

-- Index 9: role + vendedor_name
-- Used by: Authorization queries and vendor listings
-- Query pattern: WHERE role = 'vendedor' ORDER BY vendedor_name
-- Benefit: Fast role-based access control
CREATE INDEX IF NOT EXISTS idx_vendedor_profiles_role_name
ON vendedor_profiles(role, vendedor_name)
WHERE role IS NOT NULL;

-- Index 10: email + role (for authentication)
-- Used by: Login and permission checks
-- Query pattern: WHERE email = 'X' AND role IN ('admin', 'gerente')
-- Benefit: Faster authentication and authorization
CREATE INDEX IF NOT EXISTS idx_vendedor_profiles_email_role
ON vendedor_profiles(email, role);

-- =====================================================
-- VENDOR_QUEUE_STATUS TABLE COMPOSITE INDEXES (Future)
-- =====================================================

-- Index 11: is_active + vendedor (for queue distribution)
-- Used by: Finding active vendors for lead distribution
-- Query pattern: WHERE is_active = true ORDER BY vendedor
-- Benefit: Fast round-robin distribution
CREATE INDEX IF NOT EXISTS idx_vendor_queue_active_vendedor
ON vendor_queue_status(is_active, vendedor)
WHERE is_active = true;

-- Index 12: vendedor + updated_at (for queue history)
-- Used by: Tracking vendor availability changes
-- Query pattern: WHERE vendedor = 'X' ORDER BY updated_at DESC
-- Benefit: Fast availability timeline queries
CREATE INDEX IF NOT EXISTS idx_vendor_queue_vendedor_updated
ON vendor_queue_status(vendedor, updated_at DESC);

-- =====================================================
-- COVERING INDEXES (Include columns for index-only scans)
-- =====================================================

-- Index 13: Covering index for common lead queries
-- Includes frequently accessed columns to avoid table lookups
-- Query pattern: SELECT id, nome, telefone, vendedor FROM leads WHERE vendedor = 'X'
-- Benefit: Index-only scans reduce I/O
CREATE INDEX IF NOT EXISTS idx_leads_vendedor_covering
ON leads(vendedor, created_at DESC)
INCLUDE (id, nome, telefone, veiculo)
WHERE vendedor IS NOT NULL;

-- =====================================================
-- PARTIAL INDEXES (Filtered indexes for specific conditions)
-- =====================================================

-- Index 14: Recent leads only (last 90 days)
-- Used by: Dashboard and active lead management
-- Query pattern: WHERE created_at >= NOW() - INTERVAL '90 days'
-- Benefit: Smaller index size, faster queries on recent data
CREATE INDEX IF NOT EXISTS idx_leads_recent
ON leads(created_at DESC, vendedor)
WHERE created_at >= NOW() - INTERVAL '90 days';

-- Index 15: Leads with phone numbers (for follow-up)
-- Used by: Contact campaigns and follow-up lists
-- Query pattern: WHERE telefone IS NOT NULL ORDER BY created_at DESC
-- Benefit: Fast retrieval of contactable leads
CREATE INDEX IF NOT EXISTS idx_leads_with_phone
ON leads(created_at DESC, vendedor, telefone)
WHERE telefone IS NOT NULL AND telefone != '';

-- =====================================================
-- TEXT SEARCH INDEXES (for full-text search)
-- =====================================================

-- Index 16: GIN index for full-text search on nome, telefone, veiculo
-- Used by: Search functionality
-- Query pattern: WHERE nome ILIKE '%search%' OR telefone ILIKE '%search%'
-- Benefit: Much faster text searches
CREATE INDEX IF NOT EXISTS idx_leads_search_gin
ON leads USING GIN (to_tsvector('portuguese',
  COALESCE(nome, '') || ' ' ||
  COALESCE(telefone, '') || ' ' ||
  COALESCE(veiculo, '')
));

-- =====================================================
-- STATISTICS UPDATES
-- =====================================================

-- Update table statistics for query planner
ANALYZE leads;
ANALYZE vendedor_profiles;
ANALYZE vendor_queue_status;

-- =====================================================
-- INDEX USAGE MONITORING QUERY (for future optimization)
-- =====================================================

-- Run this query periodically to check index usage:
/*
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND tablename IN ('leads', 'vendedor_profiles', 'vendor_queue_status')
ORDER BY idx_scan DESC;
*/

-- =====================================================
-- UNUSED INDEX DETECTION (for cleanup)
-- =====================================================

-- Run this query to find unused indexes:
/*
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan = 0
  AND indexname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
*/

-- =====================================================
-- COMMENTS ON INDEXES
-- =====================================================

COMMENT ON INDEX idx_leads_vendedor_created_at IS
  'Composite index for vendor-specific lead listings ordered by date';

COMMENT ON INDEX idx_leads_created_at_vendedor IS
  'Composite index for time-based queries with vendor aggregation';

COMMENT ON INDEX idx_leads_timestamps_vendedor IS
  'Composite index for frontend period filtering with vendor';

COMMENT ON INDEX idx_leads_vendedor_veiculo IS
  'Composite index for vehicle preference analysis per vendor';

COMMENT ON INDEX idx_leads_nome_telefone IS
  'Composite index for duplicate lead detection';

COMMENT ON INDEX idx_leads_created_updated IS
  'Composite index for change tracking and audit queries';

COMMENT ON INDEX idx_leads_veiculo_created IS
  'Composite index for vehicle trend analysis over time';

COMMENT ON INDEX idx_leads_conversation_timestamps IS
  'Composite index for conversation thread chronology';

COMMENT ON INDEX idx_vendedor_profiles_role_name IS
  'Composite index for role-based vendor listings';

COMMENT ON INDEX idx_vendedor_profiles_email_role IS
  'Composite index for authentication and permission checks';

COMMENT ON INDEX idx_vendor_queue_active_vendedor IS
  'Composite index for active vendor queue distribution';

COMMENT ON INDEX idx_vendor_queue_vendedor_updated IS
  'Composite index for vendor availability timeline';

COMMENT ON INDEX idx_leads_vendedor_covering IS
  'Covering index including frequently accessed columns';

COMMENT ON INDEX idx_leads_recent IS
  'Partial index for recent leads (last 90 days)';

COMMENT ON INDEX idx_leads_with_phone IS
  'Partial index for leads with contact information';

COMMENT ON INDEX idx_leads_search_gin IS
  'GIN index for full-text search on nome, telefone, veiculo';

-- =====================================================
-- PERFORMANCE EXPECTATIONS
-- =====================================================

/*
EXPECTED IMPROVEMENTS:

1. Vendor Dashboard Queries: 60-80% faster
   - Before: Full table scan on leads table
   - After: Index-only scan on idx_leads_vendedor_created_at

2. Time-based Reports: 70-90% faster
   - Before: Sequential scan with date filtering
   - After: Index scan on idx_leads_created_at_vendedor

3. Search Queries: 90-95% faster
   - Before: LIKE queries with sequential scan
   - After: GIN index full-text search

4. Duplicate Detection: 95-99% faster
   - Before: Sequential scan comparing nome + telefone
   - After: B-tree index lookup on idx_leads_nome_telefone

5. Lead Distribution: 80-90% faster
   - Before: Full scan filtering active vendors
   - After: Partial index scan on idx_vendor_queue_active_vendedor

DISK SPACE:
- Estimated additional space: 15-25% of table size
- For 100K leads: ~5-10 MB additional indexes
- Trade-off: Write performance -5-10%, Read performance +60-90%
*/
