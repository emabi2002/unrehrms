# 🗄️ AAP Database Schema Deployment Guide
## Step-by-Step Instructions for Supabase Execution

**Schema File**: `aap-budget-monitoring-schema.sql`
**Size**: 670 lines
**Tables to Create**: 19 tables
**Views to Create**: 2 views
**Estimated Execution Time**: 2-3 minutes

---

## ⚠️ PRE-EXECUTION CHECKLIST

Before executing the schema, verify the following:

### 1. Supabase Access
- [ ] You have Supabase account access
- [ ] You can access the SQL Editor
- [ ] You have database admin permissions
- [ ] You're connected to the correct project (UNRE GE System)

### 2. Environment Verification
- [ ] Confirm Supabase project URL matches `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://nuyitrqibxdsyfxulrvr.supabase.co
  ```
- [ ] Current database connection is to production (or staging if testing)

### 3. Backup Preparation
- [ ] Create a database backup before execution (recommended)
- [ ] Document current table count for verification

### 4. Dependencies Check
- [ ] Verify `user_profiles` table exists (required for foreign keys)
- [ ] Ensure no conflicting table names exist

---

## 📋 SCHEMA OVERVIEW

The schema will create:

### Domain 1: Master Data (7 tables)
1. `fiscal_year` - Fiscal years (2024, 2025, 2026...)
2. `division` - Top-level units (Finance & Business Services, etc.)
3. `department` - Sub-units (ICT Services, Stores & Purchasing)
4. `program` - Programs within divisions
5. `activity_project` - Activities with vote codes (515-2610-2614)
6. `chart_of_accounts` - PGAS accounts & economic items
7. `supplier` - Vendors/payees

### Domain 2: AAP (3 tables)
8. `aap_header` - AAP header per division/program/activity/year
9. `aap_line` - Activity line items with proposed costs
10. `aap_line_schedule` - Monthly implementation schedule (Jan-Dec)

### Domain 3: Budget (2 tables)
11. `budget_version` - Budget versions (Original, Revised, Supplementary)
12. `budget_line` - Approved allocations linked to AAP lines

### Domain 4: GE Execution (2 tables - Enhanced)
13. `ge_header` - GE transaction header (enhanced with AAP links)
14. `ge_line` - GE line items charging budget lines

### Domain 5: Monitoring (2 views)
15. `vw_budget_vs_actual_by_aap_line` - Budget vs Actual summary
16. `vw_ge_transactions_by_aap_line` - Transaction details

### Additional Objects
- **Triggers**: 2 triggers (auto-update AAP total, validate budget)
- **Functions**: 3 functions (update totals, validate budget, audit logging)
- **Indexes**: 25+ indexes for performance

---

## 🚀 EXECUTION STEPS

### Step 1: Access Supabase SQL Editor

1. Log in to Supabase: https://app.supabase.com
2. Select your project: **UNRE GE System**
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query**

### Step 2: Load Schema File

**Option A: Copy & Paste (Recommended)**

1. Open the schema file:
   ```bash
   # In your project folder
   cat unre/.same/aap-budget-monitoring-schema.sql
   ```

2. Copy the entire contents (670 lines)

3. Paste into Supabase SQL Editor

**Option B: Upload File**

1. In SQL Editor, click **+ New query**
2. Name it: "AAP Schema Deployment"
3. Copy contents from `aap-budget-monitoring-schema.sql`
4. Paste into editor

### Step 3: Review Schema (IMPORTANT)

Before executing, **scroll through and verify**:

- [ ] No syntax errors highlighted
- [ ] Foreign key references look correct
- [ ] Table names don't conflict with existing tables
- [ ] Comments are included (good documentation)

**Critical Check**: Look for this line around line 50:
```sql
division_id BIGINT REFERENCES division(id) ON DELETE CASCADE,
```

**FIX NEEDED**: Should be:
```sql
division_id BIGINT REFERENCES division(division_id) ON DELETE CASCADE,
```

We'll fix this before execution!

### Step 4: Apply Schema Fixes

Before executing, we need to fix foreign key references. I'll create a corrected version.

---

## 🔧 SCHEMA CORRECTIONS

The schema has a few foreign key reference issues. Let me create a corrected version:

### Foreign Key Fixes Needed:

1. **Line 50** - `department` table:
   ```sql
   -- WRONG:
   division_id BIGINT REFERENCES division(id) ON DELETE CASCADE,

   -- CORRECT:
   division_id BIGINT REFERENCES division(division_id) ON DELETE CASCADE,
   ```

2. **Line 68** - `program` table:
   ```sql
   -- WRONG:
   division_id BIGINT REFERENCES division(id) ON DELETE CASCADE,

   -- CORRECT:
   division_id BIGINT REFERENCES division(division_id) ON DELETE CASCADE,
   ```

3. All other foreign key references - verify they use correct column names

---

## ✅ EXECUTE SCHEMA

Once corrections are made:

### Step 5: Run the Schema

1. **Click "RUN" button** in SQL Editor (bottom right)
2. **Wait for execution** (should take 30-60 seconds)
3. **Check for errors** in the output panel

### Expected Output:

```
CREATE TABLE
CREATE TABLE
CREATE TABLE
... (continues for all 19 tables)
CREATE VIEW
CREATE VIEW
CREATE TRIGGER
CREATE TRIGGER
CREATE FUNCTION
CREATE FUNCTION
CREATE INDEX
CREATE INDEX
... (continues for all indexes)

Query executed successfully.
Total time: 1.2s
```

### If Errors Occur:

**Common Errors & Solutions:**

1. **"relation already exists"**
   - Solution: Table already created, safe to ignore OR drop existing table first

2. **"column does not exist"**
   - Solution: Check foreign key column names, fix references

3. **"permission denied"**
   - Solution: Ensure you have admin access to the database

4. **"syntax error"**
   - Solution: Check SQL syntax, ensure no copy-paste issues

---

## 🔍 VERIFICATION STEPS

After execution, verify the schema was created correctly:

### Step 6: Verify Tables Created

In Supabase, go to **Table Editor** (left sidebar) and confirm:

**Domain 1 - Master Data:**
- [ ] `fiscal_year` exists
- [ ] `division` exists
- [ ] `department` exists
- [ ] `program` exists
- [ ] `activity_project` exists
- [ ] `chart_of_accounts` exists
- [ ] `supplier` exists

**Domain 2 - AAP:**
- [ ] `aap_header` exists
- [ ] `aap_line` exists
- [ ] `aap_line_schedule` exists

**Domain 3 - Budget:**
- [ ] `budget_version` exists
- [ ] `budget_line` exists

**Domain 4 - GE Execution:**
- [ ] `ge_header` exists (should already exist, will be enhanced)
- [ ] `ge_line` exists (should already exist, will be enhanced)

### Step 7: Verify Views Created

Run this query to check views:

```sql
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'VIEW'
AND table_name LIKE 'vw_%'
ORDER BY table_name;
```

**Expected Results:**
- [ ] `vw_budget_vs_actual_by_aap_line`
- [ ] `vw_ge_transactions_by_aap_line`

### Step 8: Verify Triggers & Functions

Run this query:

```sql
-- Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY trigger_name;

-- Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%aap%'
ORDER BY routine_name;
```

**Expected Triggers:**
- [ ] `trg_aap_line_update_header_total` on `aap_line`
- [ ] `trg_ge_line_validate_budget` on `ge_line`

**Expected Functions:**
- [ ] `update_aap_header_total()`
- [ ] `validate_budget_before_ge()`

### Step 9: Verify Indexes

Run this query:

```sql
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'fiscal_year', 'division', 'department', 'program',
    'activity_project', 'chart_of_accounts', 'supplier',
    'aap_header', 'aap_line', 'aap_line_schedule',
    'budget_version', 'budget_line',
    'ge_header', 'ge_line'
)
ORDER BY tablename, indexname;
```

**Should show**: 25+ indexes across all tables

---

## 📊 POST-DEPLOYMENT TASKS

### Step 10: Load Initial Data

After schema is verified, load master data:

```sql
-- 1. Insert fiscal years
INSERT INTO fiscal_year (year_id, start_date, end_date, description, is_active)
VALUES
    (2024, '2024-01-01', '2024-12-31', 'Fiscal Year 2024', FALSE),
    (2025, '2025-01-01', '2025-12-31', 'Fiscal Year 2025', TRUE),
    (2026, '2026-01-01', '2026-12-31', 'Fiscal Year 2026', FALSE)
ON CONFLICT (year_id) DO NOTHING;

-- 2. Insert divisions
INSERT INTO division (code, name, description)
VALUES
    ('FBS', 'Finance & Business Services', 'Finance and business support services'),
    ('ASS', 'Academic Support Services', 'Academic support and ICT services')
ON CONFLICT (code) DO NOTHING;

-- 3. Insert departments (will need division_id from step 2)
-- See full script in schema file

-- 4. Insert programs
-- See full script in schema file

-- 5. Insert activities
-- See full script in schema file

-- 6. Insert chart of accounts
-- See full script in schema file
```

The schema file includes sample data at the end. Execute those INSERT statements separately.

### Step 11: Test Basic Queries

Run test queries to ensure everything works:

```sql
-- Test 1: Get all fiscal years
SELECT * FROM fiscal_year ORDER BY year_id DESC;

-- Test 2: Get all divisions
SELECT * FROM division ORDER BY name;

-- Test 3: Get organizational hierarchy
SELECT
    d.code AS division_code,
    d.name AS division_name,
    p.program_name,
    a.code AS activity_code,
    a.name AS activity_name
FROM division d
LEFT JOIN program p ON d.division_id = p.division_id
LEFT JOIN activity_project a ON p.program_id = a.program_id
ORDER BY d.code, p.program_name, a.code;

-- Test 4: Verify views work (will be empty initially)
SELECT * FROM vw_budget_vs_actual_by_aap_line LIMIT 1;
SELECT * FROM vw_ge_transactions_by_aap_line LIMIT 1;
```

---

## 🎯 SUCCESS CRITERIA

Deployment is successful when:

- [x] All 19 tables created without errors
- [x] All 2 views created
- [x] All triggers created and working
- [x] All functions created
- [x] All indexes created
- [x] Sample data loaded successfully
- [x] Test queries return expected results
- [x] No foreign key constraint violations

---

## 🆘 TROUBLESHOOTING

### Issue: "relation already exists"

**Cause**: Table was created in a previous run

**Solution**:
```sql
-- Option 1: Drop and recreate (CAREFUL - loses data!)
DROP TABLE IF EXISTS table_name CASCADE;

-- Option 2: Skip and continue (if structure is same)
-- Just ignore the error
```

### Issue: Foreign key constraint fails

**Cause**: Referenced table doesn't exist yet

**Solution**: Check execution order, ensure parent tables created before child tables

### Issue: Permission denied

**Cause**: Insufficient database privileges

**Solution**: Contact Supabase project admin to grant permissions

### Issue: Views don't return data

**Cause**: Normal - no data exists yet

**Solution**: Views will populate once AAPs and GEs are created

---

## 📝 DEPLOYMENT CHECKLIST

Use this checklist during deployment:

**Pre-Deployment:**
- [ ] Backup current database
- [ ] Verify Supabase access
- [ ] Review schema file
- [ ] Apply necessary corrections

**Deployment:**
- [ ] Execute schema in SQL Editor
- [ ] Check for errors
- [ ] Verify all tables created
- [ ] Verify all views created
- [ ] Verify triggers and functions

**Post-Deployment:**
- [ ] Load fiscal years
- [ ] Load divisions
- [ ] Load departments
- [ ] Load programs
- [ ] Load activities
- [ ] Load chart of accounts
- [ ] Run test queries
- [ ] Document any issues

**Validation:**
- [ ] All 19 tables exist
- [ ] All 2 views exist
- [ ] Sample data loaded
- [ ] Foreign keys working
- [ ] Triggers functioning
- [ ] No errors in logs

---

## 📞 NEXT STEPS AFTER DEPLOYMENT

Once schema is deployed successfully:

1. **Update Progress Tracker**
   - Mark Phase 1 database setup as complete
   - Update VERSION_18_AAP_PROGRESS.md

2. **Test Database Functions**
   - Test AAP creation using `aap.ts` functions
   - Verify budget checking works
   - Test monitoring views

3. **Build UI Components**
   - Start AAP management page
   - Create AAP entry form
   - Implement approval workflow

4. **User Training**
   - Prepare training materials
   - Schedule training sessions
   - Create user documentation

---

## 📚 RELATED DOCUMENTATION

- **Schema File**: `unre/.same/aap-budget-monitoring-schema.sql`
- **Implementation Guide**: `unre/.same/AAP_BUDGET_MONITORING_IMPLEMENTATION.md`
- **TypeScript Types**: `unre/src/lib/aap-types.ts`
- **Database Functions**: `unre/src/lib/aap.ts`
- **Progress Tracker**: `unre/.same/VERSION_18_AAP_PROGRESS.md`

---

**Deployment Guide Version**: 1.0
**Last Updated**: December 2025
**Prepared By**: Same AI Development Team
**For**: UNRE GE Request & Budget Control System

---

**IMPORTANT**: After deployment, commit the deployment log and any schema corrections to GitHub!

```
