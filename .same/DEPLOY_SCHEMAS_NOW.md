# 🚀 Deploy AAP & Budget Schemas to Supabase

**Time Required**: 10-15 minutes
**Files to Deploy**: 2 SQL schemas
**Impact**: Enables all AAP and Budget Control features!

---

## 📋 Pre-Deployment Checklist

Before we start, make sure you have:
- ✅ Supabase account access
- ✅ Project URL: `nuyitrqibxdsyfxulrvr.supabase.co`
- ✅ Access to SQL Editor

---

## 🎯 Deployment Steps

### **Step 1: Open Supabase SQL Editor**

1. Go to: https://app.supabase.com/project/nuyitrqibxdsyfxulrvr/sql
2. Click **"New query"** button (top right)
3. You'll see an empty SQL editor

---

### **Step 2: Deploy AAP Schema (Main Schema)**

**File**: `unre/.same/aap-schema-v3-safe-inserts.sql`

**What it creates**:
- 14 tables (fiscal_year, division, department, program, activity_project, etc.)
- 2 views (budget vs actual, GE transactions)
- 4 functions and triggers
- Sample master data

**How to deploy**:

1. **Open the file** in your editor:
   ```
   unre/.same/aap-schema-v3-safe-inserts.sql
   ```

2. **Select ALL** (Ctrl+A or Cmd+A)

3. **Copy** (Ctrl+C or Cmd+C)

4. **Go back to Supabase SQL Editor**

5. **Paste** (Ctrl+V or Cmd+V) into the editor

6. **Click RUN** (bottom right corner)

7. **Wait 30-60 seconds**

8. **Check the output** - you should see:
   ```
   CREATE TABLE
   CREATE TABLE
   ... (repeats 14 times)
   CREATE VIEW
   CREATE VIEW
   CREATE FUNCTION
   CREATE TRIGGER
   INSERT 0 3
   INSERT 0 2
   ...
   Success. No rows returned ✅
   ```

**If you see errors**:
- Tables already exist: That's OK! The script uses `IF NOT EXISTS`
- Duplicate data: That's OK! The script uses `ON CONFLICT DO NOTHING`
- Other errors: Copy the error message and share it

---

### **Step 3: Deploy Budget Commitments Table**

**File**: `unre/.same/budget-commitments-table.sql`

**What it creates**:
- 1 table (budget_commitments)
- 3 indexes
- Trigger documentation

**How to deploy**:

1. **Click "New query"** again in Supabase (to clear the editor)

2. **Open the file** in your editor:
   ```
   unre/.same/budget-commitments-table.sql
   ```

3. **Select ALL** (Ctrl+A or Cmd+A)

4. **Copy** (Ctrl+C or Cmd+C)

5. **Go back to Supabase SQL Editor**

6. **Paste** (Ctrl+V or Cmd+V)

7. **Click RUN**

8. **Check the output** - you should see:
   ```
   CREATE TABLE
   CREATE INDEX
   CREATE INDEX
   CREATE INDEX
   Success. No rows returned ✅
   ```

---

### **Step 4: Verify Deployment**

**Check Tables**:

1. In Supabase, click **"Table Editor"** (left sidebar)

2. You should see these **NEW tables**:
   - `fiscal_year`
   - `division`
   - `department`
   - `program`
   - `activity_project`
   - `chart_of_accounts`
   - `supplier`
   - `aap_header`
   - `aap_line`
   - `aap_line_schedule`
   - `budget_version`
   - `budget_line`
   - `budget_commitments` ✨
   - `ge_header`
   - `ge_line`

3. Click on **`fiscal_year`** - should show 3 rows (2024, 2025, 2026)

4. Click on **`division`** - should show 2 rows (FBS, ASS)

**If tables don't appear**:
- Refresh the page
- Check the SQL output for errors
- The tables might be in a different schema (check "public" schema)

---

### **Step 5: Test AAP Features**

**Test 1: AAP Management Page**
1. Go to: http://localhost:3000/dashboard/aap
2. Should load WITHOUT "Failed to load" errors ✅
3. Should show empty state (no AAPs yet)
4. Click "Create New AAP" - dropdowns should populate! ✅

**Test 2: Budget Allocation Page**
1. Go to: http://localhost:3000/dashboard/budget/allocation
2. Should load without errors ✅
3. Should show fiscal year 2025 ✅
4. Click "New Version" - should work ✅

**Test 3: GE Request Form**
1. Go to: http://localhost:3000/dashboard/requests/new
2. Should show Division dropdown ✅
3. Select "FBS - Finance & Business Services"
4. AAP dropdown should populate (empty if no AAPs created) ✅

---

## ✅ Success Indicators

You'll know it worked when:
- ✅ No "Failed to load" errors on AAP pages
- ✅ Dropdowns populate with divisions and fiscal years
- ✅ Can create budget versions
- ✅ Can view AAP management page
- ✅ TypeScript errors reduce (Supabase types will be inferred)

---

## 🎯 After Deployment: Create Test Data

### **Create a Test AAP** (Optional but recommended)

1. Go to: http://localhost:3000/dashboard/aap/new

2. **Step 1: Basic Information**
   - Division: Finance & Business Services
   - Program: Stores & Purchasing - Procurement
   - Activity: 515-2810-2814 - Coordinate & Implement Activities
   - Manager: Your Name
   - Telephone: 325-1234
   - Click "Next"

3. **Step 2: Add Line Items**
   - Click "Add Line Item"
   - Item No: 221
   - Activity: Travel & Subsistence
   - Specific Output: Staff Travel
   - Target Output: 4 x Travel
   - Proposed Cost: 50000
   - Economic Item: 121 - Travel & Subsistence
   - Click "Next"

4. **Step 3: Monthly Schedule**
   - Click months: Jan, Mar, Jun, Sep, Dec
   - Click "Next"

5. **Step 4: Review**
   - Click "Save as Draft"
   - Click "Submit for Approval"
   - Click "Approve" (if you want to approve it)

Now you have a test AAP to use!

---

### **Create a Test Budget Version** (Optional)

1. Go to: http://localhost:3000/dashboard/budget/allocation

2. Click "New Version"
   - Name: Original Budget 2025
   - Description: Initial budget allocation
   - Click "Create Version"

3. Click "Add Budget Line"
   - Select the AAP you created
   - Select the AAP line (221 - Travel)
   - Budget Amount: 50000
   - Fund Source: GoPNG
   - Click "Add Budget Line"

4. Click "Activate" on the budget version

Now you have budget allocated and can test GE requests!

---

## 🧪 Test Complete Workflow

### **End-to-End Test**:

1. **Create GE Request**:
   - Go to: /dashboard/requests/new
   - Select Division: Finance & Business Services
   - Select AAP (if you created one)
   - Select AAP Line: 221 - Travel
   - Add line items totaling K10,000
   - System should show: "✓ Budget Available"
   - Submit request

2. **Approve GE Request**:
   - Go to: /dashboard/approvals
   - Find your request
   - Should show budget status
   - Click "Approve"
   - Should show: "Budget committed: K10,000"

3. **Check Budget**:
   - Go to: /dashboard/budget/allocation
   - View budget lines
   - Should show:
     - Committed: K10,000
     - Available: K40,000 (reduced)

**If this works, everything is operational!** ✅

---

## ⚠️ Troubleshooting

### **Error: "relation already exists"**
**Solution**: This is OK! The schema uses `CREATE TABLE IF NOT EXISTS`. Tables were already created.

### **Error: "duplicate key value"**
**Solution**: This is OK! The schema uses `ON CONFLICT DO NOTHING`. Sample data already exists.

### **AAP page shows "Failed to load"**
**Check**:
1. Are the tables created? (Check Table Editor)
2. Are there errors in browser console? (F12)
3. Try refreshing the page

### **Dropdowns are empty**
**Check**:
1. Was sample data inserted? (Check fiscal_year table - should have 3 rows)
2. Are you in the right fiscal year? (Check fiscal_year.is_active)

### **TypeScript errors persist**
**Solution**:
1. Restart dev server (Ctrl+C, then `bun run dev`)
2. TypeScript errors for AAP tables are expected until Supabase types regenerate
3. Runtime functionality should work despite TS errors

---

## 📊 What You Just Deployed

### **Tables Created**: 15
1. fiscal_year (3 rows)
2. division (2 rows)
3. department (2 rows)
4. program (2 rows)
5. activity_project (2 rows)
6. chart_of_accounts (8 rows)
7. supplier (3 rows)
8. aap_header (for AAP plans)
9. aap_line (for AAP line items)
10. aap_line_schedule (for monthly schedule)
11. budget_version (for budget versions)
12. budget_line (for budget allocations)
13. budget_commitments (for GE commitments) ✨
14. ge_header (enhanced for AAP)
15. ge_line (enhanced for budget)

### **Views Created**: 2
1. vw_budget_vs_actual_by_aap_line
2. vw_ge_transactions_by_aap_line

### **Functions**: 4
1. update_aap_header_total_v2()
2. validate_budget_before_ge_v2()
3. (Plus 2 triggers)

### **Master Data**: 20+ rows
- Fiscal years: 2024, 2025, 2026
- Divisions: Finance & Business Services, Academic Support Services
- Departments: Stores & Purchasing, ICT Services
- Programs: Procurement, ICT Services
- Activities: 2 sample activities
- Chart of Accounts: 8 economic items
- Suppliers: 3 sample suppliers

---

## 🎉 Success!

If you've completed all steps, you now have:
- ✅ Complete AAP database structure
- ✅ Budget control system
- ✅ Budget commitment tracking
- ✅ All features enabled
- ✅ Sample data for testing

**Next Steps**:
1. Test the features
2. Create real AAPs for your organization
3. Import PGAS budget data
4. Start using the system!

---

## 📞 Need Help?

**If you encounter issues**:
1. Check the troubleshooting section above
2. Share the error message
3. Check browser console (F12) for errors
4. Verify tables exist in Supabase Table Editor

---

**Time to Deploy**: 10-15 minutes
**Difficulty**: Easy (Copy & Paste)
**Impact**: Unlocks all AAP and Budget features! 🚀

---

**Ready? Let's deploy!** 🎯
