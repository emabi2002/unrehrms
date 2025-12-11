-- ============================================
-- AAP SCHEMA VERIFICATION - SUPABASE VERSION
-- Copy each query below and run in Supabase SQL Editor
-- ============================================

-- ============================================
-- QUERY 1: Verify All Tables Exist
-- ============================================

SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'fiscal_year',
    'division',
    'department',
    'program',
    'activity_project',
    'chart_of_accounts',
    'supplier',
    'aap_header',
    'aap_line',
    'aap_line_schedule',
    'budget_version',
    'budget_line',
    'ge_header',
    'ge_line'
)
ORDER BY table_name;

-- Expected: 14 rows

-- ============================================
-- QUERY 2: Verify Views Exist
-- ============================================

SELECT
    table_name AS view_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'vw_budget_vs_actual_by_aap_line',
    'vw_ge_transactions_by_aap_line'
)
ORDER BY table_name;

-- Expected: 2 rows

-- ============================================
-- QUERY 3: Verify Triggers
-- ============================================

SELECT
    trigger_name,
    event_object_table AS on_table,
    action_timing AS when_trigger,
    event_manipulation AS on_event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Expected: At least 2 triggers (trg_aap_line_update_header_total, trg_ge_line_validate_budget)

-- ============================================
-- QUERY 4: Verify Functions
-- ============================================

SELECT
    routine_name AS function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Expected: At least 3 functions

-- ============================================
-- QUERY 5: Count Indexes by Table
-- ============================================

SELECT
    tablename,
    COUNT(*) AS index_count,
    string_agg(indexname, ', ') AS indexes
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'fiscal_year', 'division', 'department', 'program',
    'activity_project', 'chart_of_accounts', 'supplier',
    'aap_header', 'aap_line', 'aap_line_schedule',
    'budget_version', 'budget_line',
    'ge_header', 'ge_line'
)
GROUP BY tablename
ORDER BY tablename;

-- Expected: 14 rows with varying index counts

-- ============================================
-- QUERY 6: Verify Foreign Keys
-- ============================================

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS references_table,
    ccu.column_name AS references_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'department', 'program', 'activity_project',
    'aap_header', 'aap_line', 'aap_line_schedule',
    'budget_version', 'budget_line',
    'ge_header', 'ge_line'
)
ORDER BY tc.table_name, kcu.column_name;

-- Expected: Multiple rows showing foreign key relationships

-- ============================================
-- QUERY 7: Check Row Counts (Initial Data)
-- ============================================

SELECT
    'fiscal_year' AS table_name,
    COUNT(*) AS row_count
FROM fiscal_year

UNION ALL
SELECT 'division', COUNT(*) FROM division

UNION ALL
SELECT 'department', COUNT(*) FROM department

UNION ALL
SELECT 'program', COUNT(*) FROM program

UNION ALL
SELECT 'activity_project', COUNT(*) FROM activity_project

UNION ALL
SELECT 'chart_of_accounts', COUNT(*) FROM chart_of_accounts

UNION ALL
SELECT 'supplier', COUNT(*) FROM supplier

UNION ALL
SELECT 'aap_header', COUNT(*) FROM aap_header

UNION ALL
SELECT 'aap_line', COUNT(*) FROM aap_line

UNION ALL
SELECT 'budget_version', COUNT(*) FROM budget_version

UNION ALL
SELECT 'budget_line', COUNT(*) FROM budget_line

ORDER BY table_name;

-- Expected:
-- - fiscal_year: 3 rows (2024, 2025, 2026)
-- - division: 2 rows (FBS, ASS)
-- - department: 2 rows (ICT, Stores & Purchasing)
-- - Others: Sample data counts

-- ============================================
-- QUERY 8: Test Active Fiscal Year
-- ============================================

SELECT
    year_id,
    start_date,
    end_date,
    description,
    is_active
FROM fiscal_year
ORDER BY year_id DESC;

-- Expected: 3 rows, one with is_active = TRUE

-- ============================================
-- QUERY 9: Test Organizational Hierarchy
-- ============================================

SELECT
    d.code AS division_code,
    d.name AS division_name,
    dept.code AS dept_code,
    dept.name AS dept_name,
    p.program_name,
    a.code AS activity_code,
    a.name AS activity_name
FROM division d
LEFT JOIN department dept ON d.division_id = dept.division_id
LEFT JOIN program p ON d.division_id = p.division_id
LEFT JOIN activity_project a ON p.program_id = a.program_id
ORDER BY d.code, dept.code, p.program_name, a.code;

-- Expected: Hierarchical view of org structure

-- ============================================
-- QUERY 10: Test Monitoring Views (Will Be Empty)
-- ============================================

-- Budget vs Actual view
SELECT * FROM vw_budget_vs_actual_by_aap_line LIMIT 5;

-- GE Transactions view
SELECT * FROM vw_ge_transactions_by_aap_line LIMIT 5;

-- Expected: 0 rows (normal - no AAPs or GEs yet)

-- ============================================
-- QUERY 11: Verify Chart of Accounts
-- ============================================

SELECT
    account_code,
    account_name,
    economic_item_code,
    economic_item_name
FROM chart_of_accounts
ORDER BY economic_item_code, account_code;

-- Expected: At least 8 rows with PGAS economic items

-- ============================================
-- VERIFICATION COMPLETE
-- ============================================

/*

✅ CHECKLIST - Mark as complete:

[ ] Query 1: 14 tables found
[ ] Query 2: 2 views found
[ ] Query 3: 2+ triggers found
[ ] Query 4: 3+ functions found
[ ] Query 5: Indexes created for all tables
[ ] Query 6: Foreign keys configured correctly
[ ] Query 7: Sample data loaded
[ ] Query 8: Active fiscal year = 2025
[ ] Query 9: Organizational hierarchy displays
[ ] Query 10: Views execute (even if empty)
[ ] Query 11: Chart of accounts loaded

If all checks pass, proceed to:
1. Test TypeScript functions (src/lib/aap.ts)
2. Build AAP management UI
3. Update VERSION_18_AAP_PROGRESS.md

*/
