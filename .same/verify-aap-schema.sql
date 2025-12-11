-- ============================================
-- AAP SCHEMA VERIFICATION SCRIPT
-- Run this after deploying aap-budget-monitoring-schema.sql
-- ============================================

-- Clear the output
\echo '=========================================='
\echo 'AAP SCHEMA VERIFICATION SCRIPT'
\echo 'Checking database structure...'
\echo '=========================================='
\echo ''

-- ============================================
-- 1. VERIFY TABLES EXIST
-- ============================================

\echo '1. Checking Tables...'
\echo ''

SELECT
    CASE
        WHEN COUNT(*) = 14 THEN '✅ PASS: All 14 AAP tables exist'
        ELSE '❌ FAIL: Expected 14 tables, found ' || COUNT(*)::text
    END AS table_check,
    string_agg(table_name, ', ' ORDER BY table_name) AS tables_found
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
);

\echo ''

-- List any missing tables
SELECT
    table_name AS missing_tables
FROM (
    VALUES
        ('fiscal_year'),
        ('division'),
        ('department'),
        ('program'),
        ('activity_project'),
        ('chart_of_accounts'),
        ('supplier'),
        ('aap_header'),
        ('aap_line'),
        ('aap_line_schedule'),
        ('budget_version'),
        ('budget_line'),
        ('ge_header'),
        ('ge_line')
) AS expected(table_name)
WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND tables.table_name = expected.table_name
);

\echo ''

-- ============================================
-- 2. VERIFY VIEWS EXIST
-- ============================================

\echo '2. Checking Views...'
\echo ''

SELECT
    CASE
        WHEN COUNT(*) = 2 THEN '✅ PASS: All 2 monitoring views exist'
        ELSE '❌ FAIL: Expected 2 views, found ' || COUNT(*)::text
    END AS view_check,
    string_agg(table_name, ', ' ORDER BY table_name) AS views_found
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
    'vw_budget_vs_actual_by_aap_line',
    'vw_ge_transactions_by_aap_line'
);

\echo ''

-- ============================================
-- 3. VERIFY TRIGGERS
-- ============================================

\echo '3. Checking Triggers...'
\echo ''

SELECT
    trigger_name,
    event_object_table AS table_name,
    action_timing AS timing,
    event_manipulation AS event
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND trigger_name IN (
    'trg_aap_line_update_header_total',
    'trg_ge_line_validate_budget'
)
ORDER BY trigger_name;

\echo ''

-- ============================================
-- 4. VERIFY FUNCTIONS
-- ============================================

\echo '4. Checking Functions...'
\echo ''

SELECT
    routine_name AS function_name,
    routine_type AS type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
    'update_aap_header_total',
    'validate_budget_before_ge',
    'audit_log_changes'
)
ORDER BY routine_name;

\echo ''

-- ============================================
-- 5. VERIFY INDEXES
-- ============================================

\echo '5. Checking Indexes...'
\echo ''

SELECT
    tablename,
    COUNT(*) AS index_count
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

\echo ''

-- ============================================
-- 6. VERIFY FOREIGN KEYS
-- ============================================

\echo '6. Checking Foreign Key Constraints...'
\echo ''

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
AND tc.table_name IN (
    'department', 'program', 'activity_project',
    'aap_header', 'aap_line', 'aap_line_schedule',
    'budget_version', 'budget_line',
    'ge_header', 'ge_line'
)
ORDER BY tc.table_name, kcu.column_name;

\echo ''

-- ============================================
-- 7. CHECK FOR DATA
-- ============================================

\echo '7. Checking Initial Data...'
\echo ''

-- Fiscal years
SELECT
    'fiscal_year' AS table_name,
    COUNT(*) AS row_count,
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END AS data_status
FROM fiscal_year

UNION ALL

-- Divisions
SELECT
    'division',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM division

UNION ALL

-- Departments
SELECT
    'department',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM department

UNION ALL

-- Programs
SELECT
    'program',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM program

UNION ALL

-- Activities
SELECT
    'activity_project',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 2 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM activity_project

UNION ALL

-- Chart of Accounts
SELECT
    'chart_of_accounts',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 8 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM chart_of_accounts

UNION ALL

-- Suppliers
SELECT
    'supplier',
    COUNT(*),
    CASE
        WHEN COUNT(*) >= 3 THEN '✅ Sample data loaded'
        WHEN COUNT(*) > 0 THEN '⚠️  Partial data'
        ELSE '❌ No data'
    END
FROM supplier;

\echo ''

-- ============================================
-- 8. TEST BASIC OPERATIONS
-- ============================================

\echo '8. Testing Basic Operations...'
\echo ''

-- Test: Get active fiscal year
\echo 'Test 1: Get active fiscal year...'
SELECT
    year_id,
    description,
    is_active
FROM fiscal_year
WHERE is_active = TRUE;

\echo ''

-- Test: Get organizational hierarchy
\echo 'Test 2: Get organizational hierarchy...'
SELECT
    d.code AS div_code,
    d.name AS division,
    p.program_name,
    a.code AS activity_code,
    a.name AS activity_name
FROM division d
LEFT JOIN program p ON d.division_id = p.division_id
LEFT JOIN activity_project a ON p.program_id = a.program_id
ORDER BY d.code, p.program_name, a.code
LIMIT 10;

\echo ''

-- Test: Views (will be empty but should work)
\echo 'Test 3: Test monitoring views (will be empty initially)...'
SELECT
    'vw_budget_vs_actual_by_aap_line' AS view_name,
    COUNT(*) AS record_count
FROM vw_budget_vs_actual_by_aap_line

UNION ALL

SELECT
    'vw_ge_transactions_by_aap_line',
    COUNT(*)
FROM vw_ge_transactions_by_aap_line;

\echo ''

-- ============================================
-- 9. SUMMARY
-- ============================================

\echo '=========================================='
\echo 'VERIFICATION SUMMARY'
\echo '=========================================='
\echo ''
\echo 'Expected Results:'
\echo '  - 14 tables created'
\echo '  - 2 views created'
\echo '  - 2+ triggers created'
\echo '  - 3 functions created'
\echo '  - 25+ indexes created'
\echo '  - Sample data loaded'
\echo ''
\echo 'If all checks pass (✅), schema deployment was successful!'
\echo ''
\echo 'Next Steps:'
\echo '  1. Test TypeScript database functions (src/lib/aap.ts)'
\echo '  2. Build AAP management UI'
\echo '  3. Create AAP entry form'
\echo '  4. Implement approval workflow'
\echo ''
\echo '=========================================='
