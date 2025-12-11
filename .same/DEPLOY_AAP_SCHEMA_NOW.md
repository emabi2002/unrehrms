# 🚀 Deploy AAP Schema to Supabase - Quick Start

**Status**: ✅ Ready for Deployment
**Time Required**: 5-10 minutes
**Difficulty**: Easy

---

## 📝 What You're About to Do

Execute the AAP (Annual Activity Plan) database schema on your Supabase database to enable:
- Annual activity planning by departments
- Government budget tracking
- Real-time budget control
- Budget vs Actual monitoring

---

## ⚡ Quick Deployment (3 Steps)

### Step 1: Access Supabase SQL Editor (1 min)

1. Go to: https://app.supabase.com
2. Sign in to your account
3. Select project: **UNRE GE System**
4. Click **SQL Editor** in left sidebar
5. Click **New Query**

### Step 2: Execute Schema (2 mins)

1. **Copy the schema file**:
   - Open: `unre/.same/aap-budget-monitoring-schema.sql`
   - Select all (Ctrl+A / Cmd+A)
   - Copy (Ctrl+C / Cmd+C)

2. **Paste into Supabase**:
   - Paste into SQL Editor (Ctrl+V / Cmd+V)
   - Name the query: "AAP Schema Deployment"

3. **Click RUN** (bottom-right corner)

4. **Wait for completion**:
   - Should complete in 30-60 seconds
   - Look for: "Success. No rows returned"

### Step 3: Verify Deployment (2 mins)

1. **Quick Verification**:
   - Copy queries from: `unre/.same/supabase-verify-aap.sql`
   - Run Query 1 (verify tables) - should show 14 tables
   - Run Query 2 (verify views) - should show 2 views
   - Run Query 7 (check data) - should show row counts

2. **Check Table Editor**:
   - Click **Table Editor** in left sidebar
   - Scroll down - you should see new tables:
     - `fiscal_year`
     - `division`
     - `department`
     - `program`
     - `activity_project`
     - `aap_header`
     - `aap_line`
     - `budget_version`
     - `budget_line`
     - And more...

---

## ✅ Success Checklist

After deployment, you should have:

- [x] 14 new tables created
- [x] 2 monitoring views created
- [x] Sample data loaded (fiscal years, divisions, etc.)
- [x] No error messages in SQL Editor
- [x] Tables visible in Table Editor

---

## 🆘 If Something Goes Wrong

### Error: "relation already exists"

**Meaning**: Table was already created in a previous run

**Solution**: Safe to ignore OR:
```sql
-- Drop all AAP tables and recreate (CAUTION: loses data)
DROP TABLE IF EXISTS aap_line_schedule CASCADE;
DROP TABLE IF EXISTS aap_line CASCADE;
DROP TABLE IF EXISTS aap_header CASCADE;
DROP TABLE IF EXISTS budget_line CASCADE;
DROP TABLE IF EXISTS budget_version CASCADE;
DROP TABLE IF EXISTS activity_project CASCADE;
DROP TABLE IF EXISTS program CASCADE;
DROP TABLE IF EXISTS department CASCADE;
DROP TABLE IF EXISTS division CASCADE;
DROP TABLE IF EXISTS chart_of_accounts CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS fiscal_year CASCADE;

-- Then re-run the schema
```

### Error: Foreign key constraint fails

**Meaning**: Referenced table doesn't exist

**Solution**: Ensure you executed the ENTIRE schema file (all 670 lines)

### Error: Permission denied

**Meaning**: Insufficient database access

**Solution**: Contact your Supabase project admin

---

## 📊 What Gets Created

### Tables (14)
1. `fiscal_year` - Fiscal years (2024, 2025, 2026)
2. `division` - Organizational divisions
3. `department` - Departments within divisions
4. `program` - Programs within divisions
5. `activity_project` - Activities with vote codes
6. `chart_of_accounts` - PGAS accounts
7. `supplier` - Vendors
8. `aap_header` - AAP headers
9. `aap_line` - AAP line items
10. `aap_line_schedule` - Monthly schedules
11. `budget_version` - Budget versions
12. `budget_line` - Budget allocations
13. `ge_header` - Enhanced GE headers
14. `ge_line` - Enhanced GE lines

### Views (2)
1. `vw_budget_vs_actual_by_aap_line` - Budget summary
2. `vw_ge_transactions_by_aap_line` - Transaction details

### Triggers (2)
- Auto-update AAP totals
- Validate budget before GE approval

### Sample Data Included
- 3 Fiscal years (2024, 2025, 2026)
- 2 Divisions (Finance & Business Services, Academic Support)
- 2 Departments (ICT, Stores & Purchasing)
- 2 Programs
- 2 Activities
- 8 Chart of accounts (PGAS economic items)
- 3 Suppliers

---

## 🎯 After Deployment

Once schema is deployed successfully:

### Immediate Next Steps:
1. ✅ Run verification queries (supabase-verify-aap.sql)
2. ✅ Test basic operations (query fiscal years, divisions)
3. ✅ Verify foreign keys work

### Within 1 Hour:
1. Test TypeScript database functions:
   ```typescript
   // In browser console or test file
   import { getFiscalYears, getDivisions } from '@/lib/aap';

   const years = await getFiscalYears();
   console.log('Fiscal years:', years);

   const divisions = await getDivisions();
   console.log('Divisions:', divisions);
   ```

2. Update progress tracker:
   - Mark "Execute AAP database schema" as complete
   - Mark "Run verification queries" as complete

### Within 1 Day:
1. Begin UI development:
   - Create AAP management page
   - Build AAP entry form
   - Implement approval workflow

---

## 📞 Support

**Documentation**:
- Full Deployment Guide: `unre/.same/AAP_SCHEMA_DEPLOYMENT_GUIDE.md`
- Verification Script: `unre/.same/supabase-verify-aap.sql`
- Progress Tracker: `unre/.same/VERSION_18_AAP_PROGRESS.md`

**If You Need Help**:
1. Check the full deployment guide first
2. Review error messages carefully
3. Run verification queries to diagnose
4. Check Supabase logs (Dashboard → Logs)

---

## 🎉 You're Ready!

The schema is error-free and ready to deploy.

**Just follow the 3 steps above and you'll have the AAP database running in 5-10 minutes!**

---

**Deployment Prepared**: December 2025
**Version**: 18.0
**Status**: ✅ Ready to Execute

---

**Pro Tip**: Keep the Supabase SQL Editor tab open after deployment so you can easily run verification queries!

Good luck! 🚀
