# ✅ Deployment Verification Checklist

Use this checklist to verify each step of the deployment.

---

## Before You Start

- [ ] I have Supabase access
- [ ] I can access: https://app.supabase.com/project/nuyitrqibxdsyfxulrvr
- [ ] Dev server is running: http://localhost:3000
- [ ] I have the files ready:
  - [ ] `unre/.same/aap-schema-v3-safe-inserts.sql`
  - [ ] `unre/.same/budget-commitments-table.sql`

---

## Deployment Step 1: AAP Schema

- [ ] Opened Supabase SQL Editor
- [ ] Clicked "New query"
- [ ] Copied entire `aap-schema-v3-safe-inserts.sql` file
- [ ] Pasted into Supabase editor
- [ ] Clicked "RUN" button
- [ ] Saw output that includes:
  - [ ] Multiple "CREATE TABLE" messages
  - [ ] "CREATE VIEW" messages
  - [ ] "CREATE FUNCTION" messages
  - [ ] "CREATE TRIGGER" messages
  - [ ] "INSERT 0 3" or similar
  - [ ] Final message: "Success. No rows returned" ✅
- [ ] **No red errors** (warnings are OK)

---

## Deployment Step 2: Budget Commitments

- [ ] Clicked "New query" to clear editor
- [ ] Copied entire `budget-commitments-table.sql` file
- [ ] Pasted into Supabase editor
- [ ] Clicked "RUN" button
- [ ] Saw output that includes:
  - [ ] "CREATE TABLE"
  - [ ] "CREATE INDEX" (3 times)
  - [ ] "Success. No rows returned" ✅
- [ ] **No red errors**

---

## Verification Step 1: Check Tables

In Supabase Table Editor, verify these tables exist:

### Master Data Tables:
- [ ] `fiscal_year` (should have 3 rows: 2024, 2025, 2026)
- [ ] `division` (should have 2 rows: FBS, ASS)
- [ ] `department` (should have 2 rows)
- [ ] `program` (should have 2 rows)
- [ ] `activity_project` (should have 2 rows)
- [ ] `chart_of_accounts` (should have 8 rows)
- [ ] `supplier` (should have 3 rows)

### AAP Tables:
- [ ] `aap_header` (empty - ready for data)
- [ ] `aap_line` (empty)
- [ ] `aap_line_schedule` (empty)

### Budget Tables:
- [ ] `budget_version` (empty)
- [ ] `budget_line` (empty)
- [ ] `budget_commitments` (empty - **NEW TABLE**) ✨

### Enhanced GE Tables:
- [ ] `ge_header` (exists or enhanced)
- [ ] `ge_line` (exists or enhanced)

**Total Tables**: Should see 15 tables minimum

---

## Verification Step 2: Test AAP Pages

### AAP Management Page:
- [ ] Navigate to: http://localhost:3000/dashboard/aap
- [ ] Page **loads** without errors ✅
- [ ] **No "Failed to load" message** ✅
- [ ] Shows empty state: "No AAPs yet"
- [ ] Shows statistics: 0 Total, 0 Draft, 0 Submitted, 0 Approved
- [ ] "Create New AAP" button is clickable

### AAP Creation Page:
- [ ] Click "Create New AAP"
- [ ] Division dropdown **populates** with options:
  - [ ] "FBS - Finance & Business Services"
  - [ ] "ASS - Academic Support Services"
- [ ] Program dropdown enables after division selection
- [ ] Shows "Procurement" or "ICT Services" options
- [ ] Activity dropdown enables after program selection
- [ ] Manager and telephone fields are editable
- [ ] "Next" button works

---

## Verification Step 3: Test Budget Pages

### Budget Allocation Page:
- [ ] Navigate to: http://localhost:3000/dashboard/budget/allocation
- [ ] Page **loads** without errors ✅
- [ ] Shows **Fiscal Year: 2025** ✅
- [ ] Shows statistics (all zeros initially)
- [ ] "New Version" button works
- [ ] Can create a budget version

### PGAS Import Page:
- [ ] Navigate to: http://localhost:3000/dashboard/pgas
- [ ] Page loads without errors ✅
- [ ] Shows 3-step workflow guide
- [ ] File upload component visible

---

## Verification Step 4: Test GE Request Form

### Enhanced GE Form:
- [ ] Navigate to: http://localhost:3000/dashboard/requests/new
- [ ] Page loads without errors ✅
- [ ] **NEW: Division field visible** ✅
- [ ] **NEW: AAP Activity field visible** ✅
- [ ] **NEW: AAP Line Item field visible** ✅
- [ ] Division dropdown populates with FBS and ASS
- [ ] Fields are functional

---

## Optional: Create Test Data

### Create Test AAP (Optional but Recommended):
- [ ] Created test AAP with:
  - [ ] Division: FBS
  - [ ] Program: Procurement
  - [ ] Activity: 515-2810-2814
  - [ ] Line item: K50,000
  - [ ] Monthly schedule set
- [ ] Saved as draft
- [ ] Submitted for approval
- [ ] Approved (optional)

### Create Test Budget Version (Optional):
- [ ] Created budget version "Original Budget 2025"
- [ ] Added budget line for test AAP
- [ ] Amount: K50,000
- [ ] Activated version

---

## Common Issues & Solutions

### Issue: Tables don't appear in Table Editor
**Solution**:
- [ ] Refresh the page
- [ ] Check SQL output for red errors
- [ ] Verify you're in "public" schema

### Issue: "Failed to load" on AAP page
**Solution**:
- [ ] Check browser console (F12)
- [ ] Verify tables exist in Supabase
- [ ] Restart dev server (Ctrl+C, `bun run dev`)

### Issue: Dropdowns are empty
**Solution**:
- [ ] Check `fiscal_year` table has 3 rows
- [ ] Check `division` table has 2 rows
- [ ] Verify sample data was inserted

### Issue: TypeScript errors in editor
**Solution**:
- [ ] This is NORMAL before types regenerate
- [ ] Runtime should work despite TS errors
- [ ] Restart dev server to refresh types

---

## Final Verification

### All Systems Go? ✅

- [ ] AAP pages load without "Failed to load" errors
- [ ] Budget pages load without errors
- [ ] GE form shows new AAP fields
- [ ] Dropdowns populate with data
- [ ] Can navigate between pages
- [ ] No critical console errors (F12)

### If ALL checkboxes above are checked:
## 🎉 DEPLOYMENT SUCCESSFUL! 🎉

You now have:
- ✅ 15 database tables
- ✅ 2 views for monitoring
- ✅ 4 functions and triggers
- ✅ 20+ rows of master data
- ✅ Complete AAP system
- ✅ Full budget control
- ✅ Budget commitment tracking

**All AAP and Budget features are now operational!**

---

## What to Do Next

1. **Create your first AAP**:
   - Go to /dashboard/aap/new
   - Fill in your organization's actual activity plan
   - Submit and approve

2. **Set up budget allocation**:
   - Go to /dashboard/budget/allocation
   - Create budget version for current year
   - Allocate budget to approved AAPs

3. **Import PGAS data**:
   - Go to /dashboard/pgas
   - Upload your PGAS budget file
   - Map to AAP activities

4. **Test GE workflow**:
   - Create a test GE request
   - Select AAP activity
   - Verify budget checking works
   - Approve and check budget commitment

5. **Train users**:
   - Show department heads how to create AAPs
   - Show managers how to approve
   - Show finance how to allocate budget

---

**Deployment Status**: ⬜ Not Started / ⏳ In Progress / ✅ Complete

**Last Updated**: [Date]

---

**Need Help?** Check `DEPLOY_SCHEMAS_NOW.md` for detailed instructions.
