# ✅ AAP Complete Workflow Testing Checklist

**Version**: 22
**Date**: December 2025
**Purpose**: Verify all AAP features work correctly after schema deployment

---

## 🎯 Testing Objectives

Test all AAP functionality end-to-end:
1. ✅ AAP Creation
2. ✅ AAP Editing
3. ✅ AAP Submission
4. ✅ AAP Approval (Individual & Bulk)
5. ✅ PDF Export
6. ✅ Search & Filtering
7. ✅ Statistics Tracking

---

## 📋 Pre-Test Verification

### ✅ Step 0: Verify Schema Deployment

**Check Supabase Tables**:
1. Go to: https://app.supabase.com/project/nuyitrqibxdsyfxulrvr/table-editor
2. Verify these tables exist:
   - [ ] `fiscal_year` (3 rows: 2024, 2025, 2026)
   - [ ] `division` (2 rows: FBS, ASS)
   - [ ] `department` (2 rows)
   - [ ] `program` (2 rows)
   - [ ] `activity_project` (2 rows)
   - [ ] `chart_of_accounts` (8 rows)
   - [ ] `aap_header` (0 rows initially)
   - [ ] `aap_line` (0 rows initially)

**Expected**: All tables present with sample data ✅

---

## 🧪 Test Suite

### Test 1: AAP Management Page Load

**URL**: http://localhost:3000/dashboard/aap

**Steps**:
1. Navigate to AAP management page
2. Observe the page load

**Expected Results**:
- [ ] Page loads WITHOUT errors
- [ ] Statistics show: 0 Total, 0 Draft, 0 Submitted, 0 Approved, K0 Total Proposed
- [ ] "No AAPs Created Yet" empty state visible
- [ ] "Create New AAP" button visible
- [ ] "Approval Queue" button visible
- [ ] Help card explaining AAP is visible

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 2: Create AAP - Step 1 (Header Information)

**Steps**:
1. Click "Create New AAP" button
2. Should redirect to `/dashboard/aap/new`
3. Verify Step 1 is displayed

**Fill in Step 1**:
- [ ] **Division**: Select "FBS - Finance & Business Services"
  - Dropdown has options? ⬜ Yes / ⬜ No

- [ ] **Program**: Wait for dropdown to populate
  - Program dropdown populates? ⬜ Yes / ⬜ No
  - Select a program

- [ ] **Activity**: Wait for dropdown to populate
  - Activity dropdown populates? ⬜ Yes / ⬜ No
  - Select an activity (e.g., "515-2610-2614 - Coordinate & Implement Activities")

- [ ] **Manager**: Enter "Test Manager"
- [ ] **Telephone**: Enter "325-1234"

- [ ] Click "Next" button

**Expected Results**:
- [ ] All dropdowns populate correctly
- [ ] Progress stepper shows Step 1 complete (green)
- [ ] Advances to Step 2
- [ ] No validation errors

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 3: Create AAP - Step 2 (Activity Line Items)

**Fill in Step 2**:

**Line Item 1**:
1. Click "Add Line Item" button
2. Fill in:
   - [ ] **Item No**: "221"
   - [ ] **Activity Description**: "Travel & Subsistence"
   - [ ] **Specific Output**: "Staff Travel"
   - [ ] **Target Output**: "4 x Travel"
   - [ ] **Proposed Cost**: "10000"
   - [ ] **Economic Item Code**: Select "121 - Travel & Subsistence"
   - [ ] **Manpower (Months)**: "2"

**Line Item 2**:
3. Click "Add Line Item" button again
4. Fill in:
   - [ ] **Item No**: "223"
   - [ ] **Activity Description**: "Office Supplies"
   - [ ] **Specific Output**: "Purchase office materials"
   - [ ] **Target Output**: "Annual supply"
   - [ ] **Proposed Cost**: "5000"
   - [ ] **Economic Item Code**: Select "123 - Office Materials"

**Verify**:
- [ ] Total shows: **K15,000.00**
- [ ] Both line items display correctly
- [ ] Can remove a line item (click trash icon, then undo by adding again)

5. Click "Next" button

**Expected Results**:
- [ ] Line items added successfully
- [ ] Total calculates correctly (K15,000.00)
- [ ] Progress stepper shows Step 2 complete
- [ ] Advances to Step 3
- [ ] Both lines visible on screen

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 4: Create AAP - Step 3 (Monthly Schedule)

**Fill in Step 3**:

**For Line Item 1 (Travel)**:
1. Click months: **Jan, Mar, Jun, Sep, Dec**
   - [ ] Clicked months turn GREEN
   - [ ] Unclicked months stay GRAY

**For Line Item 2 (Office Supplies)**:
2. Click months: **Jan, Apr, Jul, Oct**
   - [ ] Clicked months turn GREEN

3. Click "Next" button

**Expected Results**:
- [ ] Selected months highlighted in green
- [ ] Can toggle months on/off
- [ ] Progress stepper shows Step 3 complete
- [ ] Advances to Step 4
- [ ] Both line items show with month grids

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 5: Create AAP - Step 4 (Review & Save)

**Review Step 4**:

**Verify Header Info**:
- [ ] Division: "Finance & Business Services" ✓
- [ ] Program: [Selected program] ✓
- [ ] Activity: [Selected activity] ✓
- [ ] Manager: "Test Manager" ✓

**Verify Line Items**:
- [ ] Line 1: "221 - Travel & Subsistence - K10,000.00" ✓
- [ ] Line 2: "223 - Office Supplies - K5,000.00" ✓

**Verify Total**:
- [ ] Total Proposed Budget: **K15,000.00** ✓

**Save as Draft**:
1. Click "Save as Draft" button

**Expected Results**:
- [ ] Success toast: "AAP saved as draft successfully"
- [ ] Redirects to AAP detail page (`/dashboard/aap/[id]`)
- [ ] URL contains AAP ID number
- [ ] No errors

**Status**: ⬜ Pass / ⬜ Fail

**AAP ID Created**: ____________

**Issues Found**:
```
[Write any issues here]
```

---

### Test 6: AAP Detail View

**On the AAP Detail Page**:

**Verify Header Section**:
- [ ] Status badge shows: **"Draft"** (gray)
- [ ] Division displayed correctly
- [ ] Program displayed correctly
- [ ] Activity displayed correctly
- [ ] Manager: "Test Manager"
- [ ] Telephone: "325-1234"
- [ ] Total Proposed Cost: **K15,000.00** (green text)

**Verify Line Items Section**:
- [ ] Shows "Activity Line Items (2)"
- [ ] Line 1 visible with all details
- [ ] Line 2 visible with all details
- [ ] Economic item codes shown
- [ ] Monthly schedules visible (colored grid)

**Verify Status History**:
- [ ] "Created as Draft" with timestamp ✓

**Verify Action Buttons**:
- [ ] **"Edit"** button visible
- [ ] **"Submit for Approval"** button visible
- [ ] **"Export PDF"** button visible
- [ ] No "Approve" or "Reject" buttons (not submitted yet)

**Expected Results**:
- [ ] All information displays correctly
- [ ] Monthly schedules show green/gray months
- [ ] Status is Draft
- [ ] Action buttons appropriate for Draft status

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 7: PDF Export (First Test)

**On AAP Detail Page**:
1. Click **"Export PDF"** button

**Verify**:
- [ ] Button shows "Exporting..." with spinner
- [ ] Success toast appears
- [ ] PDF file downloads to your computer

**Open the Downloaded PDF**:
- [ ] **Page 1 - Header**:
  - [ ] "UNRE" title in green
  - [ ] "ANNUAL ACTIVITY PLAN" title
  - [ ] Fiscal Year shown
  - [ ] Status badge (Draft)
  - [ ] AAP Information table with all fields

- [ ] **Page 1/2 - Line Items**:
  - [ ] "Activity Line Items" section
  - [ ] Table with both line items
  - [ ] Total: K15,000.00 in green

- [ ] **Monthly Schedule**:
  - [ ] Schedule for Line 1 (✓ marks in correct months)
  - [ ] Schedule for Line 2 (✓ marks in correct months)

- [ ] **Footer**:
  - [ ] UNRE footer text
  - [ ] Page numbers
  - [ ] Generation date

**Expected Results**:
- [ ] PDF downloads successfully
- [ ] All information present and correct
- [ ] Professional formatting
- [ ] UNRE branding (green color)
- [ ] Readable and print-ready

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 8: Edit AAP

**On AAP Detail Page**:
1. Click **"Edit"** button
2. Should redirect to `/dashboard/aap/[id]/edit`

**Test Editing - Step 1**:
- [ ] All fields pre-filled with existing data
- [ ] Change **Manager** to: "Updated Manager"
- [ ] Click "Next"

**Test Editing - Step 2**:
- [ ] Both line items shown
- [ ] Change Line 1 **Proposed Cost** to: "12000"
- [ ] Add a third line item:
  - Item No: "224"
  - Description: "Equipment Maintenance"
  - Cost: "8000"
- [ ] Verify new total: **K25,000.00** (12000 + 5000 + 8000)
- [ ] Click "Next"

**Test Editing - Step 3**:
- [ ] All three lines shown
- [ ] Previous schedules still selected
- [ ] Add more months to Line 3
- [ ] Click "Next"

**Test Editing - Step 4**:
- [ ] Verify changes in review
- [ ] Total shows: K25,000.00
- [ ] Click "Save Changes"

**Expected Results**:
- [ ] Success toast: "AAP updated successfully"
- [ ] Redirects to detail page
- [ ] Manager shows: "Updated Manager"
- [ ] Line 1 cost shows: K12,000.00
- [ ] Line 3 added successfully
- [ ] Total shows: K25,000.00

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 9: Submit AAP for Approval

**On AAP Detail Page (after edit)**:
1. Click **"Submit for Approval"** button
2. Confirm if prompted

**Expected Results**:
- [ ] Success toast: "AAP submitted for approval successfully"
- [ ] Status badge changes to: **"Submitted"** (blue)
- [ ] "Edit" button disappears
- [ ] "Submit for Approval" button disappears
- [ ] **"Approve"** button appears
- [ ] **"Reject"** button appears
- [ ] Status history shows "Submitted" entry with timestamp

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 10: AAP Management Page Statistics

**Navigate back to AAP Management**:
1. Go to: http://localhost:3000/dashboard/aap

**Verify Statistics**:
- [ ] Total AAPs: **1**
- [ ] Draft: **0**
- [ ] Submitted: **1**
- [ ] Approved: **0**
- [ ] Total Proposed: **K25k** (K25,000)

**Verify AAP Card**:
- [ ] Your AAP visible in list
- [ ] Status badge: "Submitted" (blue)
- [ ] Shows correct activity name
- [ ] Shows total: K25,000
- [ ] Manager shows: "Updated Manager"
- [ ] "View" button visible

**Expected Results**:
- [ ] Statistics update correctly
- [ ] AAP card displays with Submitted status
- [ ] All information accurate

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 11: Approval Queue

**Navigate to Approval Queue**:
1. Click **"Approval Queue"** button (shows badge with "1")
2. Should go to: `/dashboard/aap/approvals`

**Verify Approval Queue**:
- [ ] Page title: "AAP Approval Queue"
- [ ] Statistics:
  - Pending Review: **1**
  - Selected: **0**
  - Total Budget: **K25k**

- [ ] Your submitted AAP visible
- [ ] Status badge: "Submitted" (blue)
- [ ] Checkbox present
- [ ] **"Review"** button visible
- [ ] **"Approve"** button visible
- [ ] **"Reject"** button visible

**Expected Results**:
- [ ] Approval queue loads correctly
- [ ] Submitted AAP appears
- [ ] All action buttons present
- [ ] Statistics accurate

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 12: Individual Approval

**On Approval Queue Page**:
1. Click **"Approve"** button on your AAP

**Expected Results**:
- [ ] Success toast: "AAP approved successfully"
- [ ] AAP disappears from queue (or page refreshes)
- [ ] Statistics update:
  - Pending Review: **0**
  - Total Budget: **K0**

**Navigate back to AAP Management**:
2. Go to: `/dashboard/aap`

**Verify**:
- [ ] Statistics:
  - Approved: **1**
  - Submitted: **0**
- [ ] AAP card shows status: **"Approved"** (green)

**Click on AAP to view details**:
- [ ] Status badge: "Approved" (green)
- [ ] Status history shows "Approved" with timestamp
- [ ] No "Edit" or "Submit" buttons
- [ ] "Export PDF" button still works

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 13: Bulk Operations

**Create Multiple AAPs**:
1. Create **3 more AAPs** using the creation flow
   - AAP 2: Different division/activity, K30,000
   - AAP 3: Different activity, K20,000
   - AAP 4: Different activity, K15,000

2. **Submit all 3** for approval

**Go to Approval Queue**:
3. Navigate to: `/dashboard/aap/approvals`

**Verify**:
- [ ] Pending Review: **3**
- [ ] Total Budget: **K65k** (30k + 20k + 15k)
- [ ] All 3 AAPs visible

**Test Bulk Select**:
4. Click **"Select All"** button
   - [ ] All 3 AAPs get checkboxes checked
   - [ ] Selected count: **3**
   - [ ] Selected Budget: **K65k**
   - [ ] "Approve (3)" button appears
   - [ ] "Reject (3)" button appears

5. Click **"Deselect All"**
   - [ ] All checkboxes unchecked
   - [ ] Bulk buttons disappear

6. **Manually select 2 AAPs** (check their boxes)
   - [ ] Selected: **2**
   - [ ] Selected Budget updates correctly
   - [ ] "Approve (2)" button visible

**Test Bulk Approve**:
7. Click **"Approve (2)"** button

**Expected Results**:
- [ ] Success toast: "2 AAPs approved successfully"
- [ ] 2 AAPs disappear from queue
- [ ] Pending Review: **1** (remaining)
- [ ] Statistics update correctly

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 14: Search & Filtering

**On AAP Management Page**:

**Test Search**:
1. Enter a search term (e.g., part of activity name)
   - [ ] Results filter in real-time
   - [ ] Only matching AAPs show
   - [ ] Statistics update

2. Clear search
   - [ ] All AAPs reappear

**Test Division Filter**:
3. Select a division from dropdown
   - [ ] Only AAPs from that division show
   - [ ] Statistics update

4. Select "All Divisions"
   - [ ] All AAPs reappear

**Test Status Filter**:
5. Select "Approved" status
   - [ ] Only approved AAPs show
   - [ ] Count matches approved stat

6. Select "All Statuses"
   - [ ] All AAPs reappear

**Test Combined Filters**:
7. Use search + division + status together
   - [ ] Filters work together correctly
   - [ ] Results accurate

**Expected Results**:
- [ ] All filters work independently
- [ ] Filters work together
- [ ] Statistics update with filters
- [ ] Results accurate

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 15: PDF Export (Approved AAP)

**View an Approved AAP**:
1. Click on an approved AAP
2. Click **"Export PDF"**

**Verify PDF**:
- [ ] Downloads successfully
- [ ] Status badge shows "Approved" (green)
- [ ] **Status History** section includes:
  - Created timestamp
  - Submitted timestamp
  - **Approved timestamp** ✓
- [ ] All other information correct

**Expected Results**:
- [ ] PDF includes approval timeline
- [ ] Status shown as Approved
- [ ] Professional formatting maintained

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 16: Edge Cases & Validation

**Test Empty Line Items**:
1. Try to create AAP with NO line items
   - [ ] Cannot proceed to Step 3
   - [ ] Error message shown

**Test Invalid Data**:
2. Try to enter **negative cost**
   - [ ] Prevented or shows error

3. Try to enter **text in cost field**
   - [ ] Prevented or shows error

**Test Required Fields**:
4. Try to save without selecting Activity
   - [ ] Error message shown
   - [ ] Cannot proceed

**Test Monthly Schedule Toggle**:
5. Click same month multiple times
   - [ ] Toggles on/off correctly
   - [ ] Visual feedback immediate

**Expected Results**:
- [ ] Validation works correctly
- [ ] Error messages clear
- [ ] Cannot save invalid data

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 17: Mobile Responsiveness

**Test on Mobile/Tablet**:
1. Resize browser window to mobile size (or use dev tools)

**Verify**:
- [ ] AAP management page responsive
- [ ] Statistics cards stack vertically
- [ ] AAP creation form usable on mobile
- [ ] Monthly schedule grid scrollable/usable
- [ ] Buttons appropriately sized
- [ ] Text readable
- [ ] No horizontal scrolling

**Expected Results**:
- [ ] All pages responsive
- [ ] Usable on small screens
- [ ] No layout breaks

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

### Test 18: Performance & Loading States

**Test Loading States**:
1. Refresh AAP management page
   - [ ] Shows loading spinner
   - [ ] Then loads data smoothly

2. Click "Create New AAP"
   - [ ] Dropdowns show loading states
   - [ ] Data loads progressively

3. Save AAP
   - [ ] Button shows "Saving..." during save
   - [ ] Disabled during save (can't double-click)

4. Export PDF
   - [ ] Button shows "Exporting..." with spinner
   - [ ] Disabled during export

**Expected Results**:
- [ ] Loading states visible
- [ ] No blank screens
- [ ] Smooth transitions

**Status**: ⬜ Pass / ⬜ Fail

**Issues Found**:
```
[Write any issues here]
```

---

## 📊 Overall Test Results

### Summary Statistics

**Tests Completed**: _____ / 18

**Tests Passed**: ✅ _____

**Tests Failed**: ❌ _____

**Tests Skipped**: ⏭️ _____

### Pass Rate: _____%

---

## 🐛 Issues Summary

**Critical Issues** (Blocking functionality):
```
1. [List critical issues]
2.
3.
```

**Major Issues** (Significant problems):
```
1. [List major issues]
2.
3.
```

**Minor Issues** (Small bugs, UI issues):
```
1. [List minor issues]
2.
3.
```

**Enhancements** (Nice-to-have improvements):
```
1. [List enhancement ideas]
2.
3.
```

---

## ✅ Sign-Off

**Tester**: ___________________

**Date**: ___________________

**Overall Status**: ⬜ Ready for Production / ⬜ Needs Fixes / ⬜ Major Issues

**Next Steps**:
```
[What needs to happen next]
```

---

## 📞 Support

If you encounter any issues:
1. Check browser console (F12) for errors
2. Check Supabase logs
3. Document the exact steps to reproduce
4. Share error messages
5. Note which test failed

Report issues and I'll help fix them immediately!

---

**Testing Complete!** 🎉

Once all tests pass, the AAP module is **production-ready** and we can proceed to Phase 3 (Budget Allocation Module).
