-- ============================================
-- AAP SCHEMA CLEANUP SCRIPT
-- Use this to remove all AAP tables and start fresh
-- ============================================

-- Drop views first (they depend on tables)
DROP VIEW IF EXISTS vw_budget_vs_actual_by_aap_line CASCADE;
DROP VIEW IF EXISTS vw_ge_transactions_by_aap_line CASCADE;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_aap_line_update_header_total ON aap_line CASCADE;
DROP TRIGGER IF EXISTS trg_ge_line_validate_budget ON ge_line CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_aap_header_total() CASCADE;
DROP FUNCTION IF EXISTS validate_budget_before_ge() CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS aap_line_schedule CASCADE;
DROP TABLE IF EXISTS aap_line CASCADE;
DROP TABLE IF EXISTS aap_header CASCADE;
DROP TABLE IF EXISTS budget_line CASCADE;
DROP TABLE IF EXISTS budget_version CASCADE;
DROP TABLE IF EXISTS ge_line CASCADE;
DROP TABLE IF EXISTS ge_header CASCADE;
DROP TABLE IF EXISTS activity_project CASCADE;
DROP TABLE IF EXISTS program CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS division CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS fiscal_year CASCADE;

-- Success message
SELECT 'AAP schema cleanup completed successfully!' AS status;
