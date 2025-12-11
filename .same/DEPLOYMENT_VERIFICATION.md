# ✅ AAP Schema Deployment Verification

**Status**: Deployment Complete!
**Next**: Verify & Test

---

## Quick Verification Checklist

### 1. Check Supabase Tables (1 minute)

1. Go to Supabase: https://app.supabase.com/project/nuyitrqibxdsyfxulrvr
2. Click **Table Editor** (left sidebar)
3. Scroll down and verify these tables exist:
   - [ ] `fiscal_year`
   - [ ] `division`
   - [ ] `department`
   - [ ] `program`
   - [ ] `activity_project`
   - [ ] `chart_of_accounts`
   - [ ] `supplier`
   - [ ] `aap_header`
   - [ ] `aap_line`
   - [ ] `aap_line_schedule`
   - [ ] `budget_version`
   - [ ] `budget_line`

4. Click on **`fiscal_year`** table
   - Should show **3 rows** (2024, 2025, 2026)

5. Click on **`division`** table
   - Should show **2 rows** (FBS, ASS)

**If you see all tables with data**: ✅ Deployment Successful!

---

## Test AAP Features

### 2. Test AAP Management Page (2 minutes)

1. **Open**: http://localhost:3000/dashboard/aap

**Expected**:
- ✅ Page loads WITHOUT errors
- ✅ Shows "No AAPs Created Yet" empty state
- ✅ Statistics show: 0 Total, 0 Draft, 0 Submitted, 0 Approved
- ✅ "Create New AAP" button visible

**If page shows error**: Check browser console (F12) for details

---

### 3. Test AAP Creation (5 minutes)

1. Click **"Create New AAP"**
2. Should redirect to `/dashboard/aap/new`

**Step 1: Header Information**
- [ ] Division dropdown has options (FBS, ASS)
- [ ] Select **"FBS - Finance & Business Services"**
- [ ] Program dropdown populates
- [ ] Select a program
- [ ] Activity dropdown populates
- [ ] Select an activity
- [ ] Enter Manager: "Test User"
- [ ] Click **"Next"**

**Step 2: Activity Line Items**
- [ ] Click **"Add Line Item"**
- [ ] Item No: **"221"**
- [ ] Activity Description: **"Test Activity"**
- [ ] Proposed Cost: **5000**
- [ ] Select Economic Item Code (e.g., 121)
- [ ] Total shows: **K5,000.00**
- [ ] Click **"Next"**

**Step 3: Monthly Schedule**
- [ ] See the activity line
- [ ] Click a few months (should turn green)
- [ ] Click **"Next"**

**Step 4: Review & Submit**
- [ ] See summary of entered data
- [ ] Total: K5,000.00
- [ ] Click **"Save as Draft"**

**Expected**:
- ✅ Success toast: "AAP saved as draft successfully"
- ✅ Redirects to AAP detail page
- ✅ Shows all entered information
- ✅ Status badge: "Draft"
- ✅ Has "Edit" and "Submit for Approval" buttons

---

### 4. Test AAP Detail View (1 minute)

On the AAP detail page:
- [ ] Header information displays correctly
- [ ] Activity line items shown
- [ ] Monthly schedule grid visible
- [ ] Status history timeline present
- [ ] Action buttons work

---

### 5. Test AAP Edit (3 minutes)

1. Click **"Edit"** button
2. Should go to `/dashboard/aap/[id]/edit`

**Verify**:
- [ ] All fields pre-filled with existing data
- [ ] Can change division, program, activity
- [ ] Can edit line items
- [ ] Can add new line items
- [ ] Can remove line items
- [ ] Can edit monthly schedule
- [ ] Total updates in real-time

3. Make a change (e.g., change proposed cost to 6000)
4. Click **"Save Changes"**

**Expected**:
- ✅ Success toast
- ✅ Redirects to detail page
- ✅ Changes are saved and visible

---

### 6. Test Submit for Approval (1 minute)

1. On AAP detail page, click **"Submit for Approval"**

**Expected**:
- ✅ Success toast: "AAP submitted for approval successfully"
- ✅ Status changes to "Submitted"
- ✅ "Edit" button disappears
- ✅ "Approve" and "Reject" buttons appear

---

### 7. Test Approval Queue (3 minutes)

1. Go to **Approval Queue**: http://localhost:3000/dashboard/aap/approvals
   - OR click "Approval Queue" button on AAP management page

**Expected**:
- ✅ Page loads
- ✅ Shows your submitted AAP
- ✅ Statistics: Pending Review = 1
- ✅ Can select AAP with checkbox
- ✅ "Approve" and "Reject" buttons visible

2. Click **"Approve"** on your AAP

**Expected**:
- ✅ Success toast
- ✅ AAP disappears from queue (or page refreshes)

3. Go back to **AAP Management** page

**Expected**:
- ✅ Statistics show: 1 Approved
- ✅ AAP card shows "Approved" status badge

---

### 8. Test Bulk Operations (2 minutes)

1. Create 2-3 more AAPs and submit them
2. Go to **Approval Queue**
3. Select multiple AAPs with checkboxes
4. Click **"Approve (X)"** bulk button

**Expected**:
- ✅ Success toast: "X AAPs approved successfully"
- ✅ All selected AAPs approved
- ✅ Queue updates

---

## ✅ Verification Complete!

If all tests pass:
- ✅ **Schema deployed correctly**
- ✅ **All AAP features functional**
- ✅ **Ready for production use**

---

## 🐛 If You Encounter Issues

### TypeScript Errors Still Showing
- **Restart the dev server**: Stop and run `bun run dev` again
- **Clear Next.js cache**: Delete `.next` folder and restart

### "Failed to load AAPs" Error
- **Check Supabase connection**: Verify `.env.local` has correct credentials
- **Check browser console**: Look for specific error messages
- **Check Supabase logs**: Go to Supabase → Logs

### Dropdowns Not Populating
- **Check master data**: Verify `division`, `program`, `activity_project` tables have data
- **Check foreign keys**: Ensure relationships are correct

### Can't Save AAPs
- **Check browser console** for errors
- **Check Supabase permissions**: RLS policies may need adjustment

---

## 📞 Report Results

Please let me know:
1. ✅ Which tests passed
2. ❌ Which tests failed (if any)
3. 🐛 Any errors you encountered

Then we'll continue with:
- PDF Export functionality
- Budget Allocation module
- Email notifications
- Or fix any issues discovered

---

**Ready to test!** 🚀
