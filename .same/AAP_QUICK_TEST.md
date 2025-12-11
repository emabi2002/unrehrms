# ✅ Quick AAP Test (5 Minutes)

**Goal**: Create your first AAP and verify all features work!

---

## 🎯 Test 1: AAP Management Page

**URL**: http://localhost:3000/dashboard/aap

**Expected**:
- ✅ Page loads without "Failed to load" error
- ✅ Shows statistics: 0 Total, 0 Draft, 0 Submitted, 0 Approved
- ✅ Empty state message
- ✅ "Create New AAP" button (green)
- ✅ "Approval Queue" button (blue)

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 2: Create AAP - Step 1

**Click**: "Create New AAP"

**Fill in**:
- Division: **FBS - Finance & Business Services**
- Program: **Should auto-populate with "Procurement"**
- Activity: **515-2810-2814 - Coordinate & Implement Activities**
- Manager: **Your Name**
- Telephone: **325-1234**

**Click**: "Next"

**Expected**:
- ✅ All dropdowns populate
- ✅ No errors
- ✅ Advances to Step 2

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 3: Add Line Items - Step 2

**Click**: "Add Line Item"

**Fill in**:
- Item No: **221**
- Activity Description: **Travel & Subsistence**
- Specific Output: **Staff Travel**
- Target Output: **4 x Travel**
- Proposed Cost: **10000**
- Economic Item Code: **121 - Travel & Subsistence**

**Verify**: Total shows **K10,000.00**

**Click**: "Next"

**Expected**:
- ✅ Line item added
- ✅ Total calculates correctly
- ✅ Advances to Step 3

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 4: Monthly Schedule - Step 3

**For the line item**:
- Click months: **Jan, Mar, Jun, Sep, Dec**

**Expected**:
- ✅ Selected months turn GREEN
- ✅ Unselected months stay GRAY
- ✅ Can toggle on/off

**Click**: "Next"

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 5: Review & Save - Step 4

**Verify**:
- ✅ All entered data is shown
- ✅ Total: K10,000.00
- ✅ Line item visible
- ✅ Manager shown

**Click**: "Save as Draft"

**Expected**:
- ✅ Success toast: "AAP saved as draft successfully"
- ✅ Redirects to AAP detail page
- ✅ Shows all information
- ✅ Status: "Draft" (gray badge)
- ✅ Has "Edit" and "Submit for Approval" buttons

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 6: AAP Detail View

**Verify on detail page**:
- ✅ Header information correct
- ✅ Line item displayed
- ✅ Monthly schedule shows green months
- ✅ Status history timeline
- ✅ "Edit" button works
- ✅ "Submit for Approval" button works

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 7: Submit for Approval

**Click**: "Submit for Approval"

**Expected**:
- ✅ Success toast
- ✅ Status changes to "Submitted" (blue badge)
- ✅ "Edit" button disappears
- ✅ "Approve" and "Reject" buttons appear

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 8: Approval Queue

**Navigate to**: http://localhost:3000/dashboard/aap/approvals

**Expected**:
- ✅ Shows your submitted AAP
- ✅ Statistics: Pending Review = 1
- ✅ Can select with checkbox
- ✅ "Approve" button works

**Click**: "Approve"

**Expected**:
- ✅ Success toast
- ✅ AAP disappears from queue
- ✅ Status changes to "Approved" (green)

**Status**: ⬜ Pass / ⬜ Fail

---

## 🎯 Test 9: PDF Export

**Go back to AAP detail page**

**Click**: "Export PDF"

**Expected**:
- ✅ PDF downloads
- ✅ Opens in PDF viewer
- ✅ Shows UNRE branding
- ✅ All data present
- ✅ Professional formatting

**Status**: ⬜ Pass / ⬜ Fail

---

## ✅ Overall Test Result

**Tests Passed**: _____ / 9

**Status**:
- ✅ All Pass = **AAP Module Working Perfectly!** 🎉
- ⚠️ Some Fail = Report which tests failed
- ❌ Most Fail = Need to troubleshoot

---

**If all tests pass, AAP module is PRODUCTION READY!** 🚀
