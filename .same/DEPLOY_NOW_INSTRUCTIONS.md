# 🚀 Deploy AAP Schema NOW - Step-by-Step

**Time Required**: 10-15 minutes
**Difficulty**: Easy
**Status**: ✅ Ready to Execute

---

## 📋 Pre-Deployment Checklist

Before you start, make sure you have:
- [x] Supabase account access
- [x] UNRE GE System project access
- [x] Admin permissions on the database

---

## 🎯 Step-by-Step Deployment

### Step 1: Open Supabase (30 seconds)

1. **Open your browser**
2. **Navigate to**: https://app.supabase.com
3. **Sign in** to your account
4. **Click** on your **UNRE GE System** project

### Step 2: Open SQL Editor (30 seconds)

1. In the left sidebar, look for **"SQL Editor"**
2. **Click** on **SQL Editor**
3. You'll see the SQL editor interface
4. **Click** the **"New query"** button (top right)

### Step 3: Copy the Schema (1 minute)

1. **In your code editor**, navigate to:
   ```
   unre/.same/aap-budget-monitoring-schema.sql
   ```

2. **Open the file**

3. **Select all content** (Ctrl+A on Windows/Linux, Cmd+A on Mac)
   - The file is 670 lines long
   - Should include CREATE TABLE statements, INSERT statements, etc.

4. **Copy** (Ctrl+C or Cmd+C)

### Step 4: Paste and Execute (2 minutes)

1. **Return to Supabase SQL Editor**

2. **Click in the query editor** (the big text area)

3. **Paste** the schema (Ctrl+V or Cmd+V)
   - All 670 lines should appear

4. **Optional**: Name your query (top left) "AAP Schema Deployment"

5. **Click the RUN button** (bottom right corner)
   - Button says "RUN" or might have a play icon ▶

6. **Wait** for execution (30-60 seconds)

### Step 5: Verify Success (2 minutes)

**Expected Output**:
```
CREATE TABLE
CREATE TABLE
... (multiple times)
CREATE VIEW
CREATE VIEW
CREATE TRIGGER
CREATE FUNCTION
INSERT 0 3
INSERT 0 2
... (etc)

Success. No rows returned
Query executed in XXX ms
```

**If you see errors**: Read them carefully and check the troubleshooting section below.

**If you see "Success"**: Continue to Step 6!

### Step 6: Verify Tables Created (2 minutes)

1. **In Supabase left sidebar**, click **"Table Editor"**

2. **Scroll down** in the tables list

3. **You should see these NEW tables**:
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

4. **Click on `fiscal_year`** table
   - Should show 3 rows (2024, 2025, 2026)

5. **Click on `division`** table
   - Should show 2 rows (FBS, ASS)

**If you see the tables**: ✅ Deployment successful!

### Step 7: Test AAP UI (5 minutes)

1. **Open the app**: http://localhost:3000/dashboard/aap

2. **You should see**:
   - Empty state (no AAPs yet)
   - "Create New AAP" button
   - No error messages

3. **Click "Create New AAP"**

4. **Fill in Step 1**:
   - Select Division: "FBS - Finance & Business Services"
   - Select Program: (one should appear)
   - Select Activity: (one should appear)
   - Enter Manager: "Your Name"
   - Click "Next"

5. **Fill in Step 2**:
   - Click "Add Line Item"
   - Item No: "221"
   - Activity Description: "Travel & Subsistence"
   - Proposed Cost: 10000
   - Click "Next"

6. **Fill in Step 3**:
   - Click a few months (they should turn green)
   - Click "Next"

7. **Step 4**:
   - Review information
   - Click "Save as Draft"

8. **You should be redirected** to the AAP detail page
   - Shows all your entered information
   - Status badge shows "Draft"
   - Has "Edit" and "Submit for Approval" buttons

9. **Go back to** `/dashboard/aap`
   - Your AAP should appear in the list
   - Statistics should show: 1 Total, 1 Draft

**If everything works**: 🎉 **SUCCESS!**

---

## 🐛 Troubleshooting

### Error: "relation already exists"

**Cause**: Table was created before

**Solution**:
- Safe to ignore if this is expected
- OR drop tables first with:
  ```sql
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
  ```
- Then re-run the full schema

### Error: "permission denied"

**Cause**: Insufficient database access

**Solution**:
- Contact your Supabase project admin
- Ensure you're logged in with correct account
- Check project permissions

### Error: "column does not exist" or "relation does not exist"

**Cause**: Schema didn't execute completely

**Solution**:
- Scroll up in the error output
- Find the first error (there might be many)
- Fix that error first
- Re-run the schema

### AAP UI shows "Failed to load AAPs"

**Causes**:
1. Schema not deployed yet
2. Tables created with wrong names
3. Supabase connection issue

**Solutions**:
1. Check Table Editor - are the tables there?
2. Check browser console for errors (F12)
3. Verify `.env.local` has correct Supabase URL

### No data in tables

**Cause**: INSERT statements didn't run

**Solution**:
- Scroll through the SQL output
- Look for "INSERT 0 X" messages
- If missing, manually run the INSERT statements from the schema file

---

## ✅ Success Checklist

After deployment, you should have:

- [x] 14 tables in Supabase Table Editor
- [x] `fiscal_year` has 3 rows
- [x] `division` has 2 rows
- [x] `department` has 2 rows
- [x] AAP page loads without errors
- [x] Can create new AAP
- [x] Can save AAP as draft
- [x] Can view AAP details
- [x] Statistics update correctly

---

## 🎉 Next Steps After Successful Deployment

1. **Test the complete workflow**:
   - Create multiple AAPs
   - Edit a draft AAP
   - Submit for approval
   - Approve an AAP
   - Reject an AAP

2. **Test edge cases**:
   - Create AAP with many line items (10+)
   - Schedule activities in all 12 months
   - Test with very large costs
   - Test validation errors

3. **Continue development**:
   - AAP edit page (in progress)
   - Approval queue page
   - PDF export
   - Budget allocation module

---

## 📞 Need Help?

**Common Questions**:

**Q: How long should deployment take?**
A: 30-60 seconds for the SQL to execute, plus a few minutes for verification.

**Q: Will this affect existing data?**
A: No, this creates NEW tables. Existing GE requests, users, etc. are not affected.

**Q: Can I undo this?**
A: Yes, you can drop all the tables using the DROP statements in troubleshooting.

**Q: What if I get timeout errors?**
A: Break the schema into smaller parts and execute separately (tables first, then views, then inserts).

---

## 📊 What Gets Created

```
Tables (14):
  Master Data:
    - fiscal_year (3 rows)
    - division (2 rows)
    - department (2 rows)
    - program (2 rows)
    - activity_project (2 rows)
    - chart_of_accounts (8 rows)
    - supplier (3 rows)

  AAP:
    - aap_header (0 rows initially)
    - aap_line (0 rows initially)
    - aap_line_schedule (0 rows initially)

  Budget:
    - budget_version (0 rows initially)
    - budget_line (0 rows initially)

  GE (Enhanced):
    - ge_header (enhanced version)
    - ge_line (enhanced version)

Views (2):
  - vw_budget_vs_actual_by_aap_line
  - vw_ge_transactions_by_aap_line

Triggers (2):
  - trg_aap_line_update_header_total
  - trg_ge_line_validate_budget

Functions (2+):
  - update_aap_header_total()
  - validate_budget_before_ge()
```

---

**Ready? Let's deploy! 🚀**

1. Open Supabase
2. Open SQL Editor
3. Copy the schema
4. Paste and RUN
5. Verify tables
6. Test AAP UI

**Good luck! You've got this!** 💪
