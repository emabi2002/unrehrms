# 🧪 Version 17 Testing Checklist
## Process Flow Enhancements - Testing Guide

**Date**: December 2025
**Version**: 17
**Tester**: _________________
**Status**: In Progress

---

## 📋 Pre-Testing Setup

### ✅ Prerequisites
- [ ] Dev server is running (`bun run dev`)
- [ ] Database has sample data (GE requests, budget lines, payments)
- [ ] Browser console is open (F12) for debugging
- [ ] You're logged into the dashboard

### 🔗 Quick Navigation URLs
- Main Dashboard: `http://localhost:3000/dashboard`
- M&E Planning: `http://localhost:3000/dashboard/me-planning`
- Internal Audit: `http://localhost:3000/dashboard/audit`
- GE Requests: `http://localhost:3000/dashboard/requests`

---

## 🎯 Test 1: M&E Planning Dashboard

### Location: `/dashboard/me-planning`

#### ✅ Visual Elements to Check

**Header Section:**
- [ ] Page title: "M&E Planning Dashboard"
- [ ] Subtitle: "Monitoring & Evaluation - Budget Performance Analysis"
- [ ] "Export Report" button visible in top-right

**Key Metrics Cards (4 cards):**
- [ ] **Total Requests**: Shows count
- [ ] **Approval Rate**: Shows percentage with green color
- [ ] **Avg Processing Time**: Shows days with blue color
- [ ] **Query Rate**: Shows percentage with orange color

**Automated Feedback Section:**
- [ ] Section title: "Automated Feedback & Recommendations"
- [ ] Alert icon (circle with i) visible
- [ ] Feedback items displayed (or "No critical issues" message)
- [ ] Each feedback item shows:
  - [ ] Priority badge (HIGH/MEDIUM/LOW)
  - [ ] Department name
  - [ ] Message description
  - [ ] Recommendation text
  - [ ] Colored left border (red/orange/green/blue)

**Budget Utilization by Department:**
- [ ] Section title: "Budget Utilization by Department"
- [ ] Each department shows:
  - [ ] Department name and code
  - [ ] Utilization percentage badge
  - [ ] Progress bar (colored: red >90%, orange >75%, green otherwise)
  - [ ] 4 financial metrics: Budget, Spent, Committed, Available
  - [ ] Variance indicator (up/down arrow with amount)

**Monthly Spending Trends:**
- [ ] Section title: "Monthly Spending Trends"
- [ ] 12 months displayed (Jan-Dec)
- [ ] Each month shows:
  - [ ] Progress bar (spending vs budget)
  - [ ] Amount label
  - [ ] Variance (green positive, red negative)

---

#### 🧪 Functional Tests

**Test 1.1: Page Load**
- [ ] Navigate to `/dashboard/me-planning`
- [ ] Page loads without errors
- [ ] Loading spinner appears briefly
- [ ] All sections render correctly

**Test 1.2: Data Display**
- [ ] Metrics cards show actual numbers (not 0 or undefined)
- [ ] Budget utilization shows department data
- [ ] Progress bars are proportional to percentages
- [ ] Colors match utilization levels

**Test 1.3: Automated Feedback Logic**

Test scenarios to verify:

**Scenario A: High Budget Utilization (>90%)**
- Expected: RED feedback item with "Critical level" message
- Recommendation should mention "immediate action" or "freeze"

**Scenario B: Medium Utilization (75-90%)**
- Expected: ORANGE feedback item with "High level" message
- Recommendation should mention "monitor closely"

**Scenario C: On Track (60-75%)**
- Expected: GREEN feedback item with "On track" message
- Recommendation should be positive

**Scenario D: High Query Rate (>20%)**
- Expected: Feedback about training needs
- Recommendation should mention "training sessions"

**Test 1.4: Export Functionality**
- [ ] Click "Export Report" button
- [ ] Toast notification appears ("Exporting M&E Report...")
- [ ] No console errors

**Test 1.5: Responsive Design**
- [ ] Resize browser to mobile size (< 768px)
- [ ] Cards stack vertically
- [ ] Tables are scrollable
- [ ] All content is readable

---

#### 📸 Screenshots to Capture

1. **Full Dashboard View**: Entire page showing all sections
2. **Feedback Items**: Close-up of automated feedback recommendations
3. **Budget Utilization**: Department breakdown with progress bars
4. **Spending Trends**: Monthly chart section
5. **Mobile View**: Dashboard on small screen

---

#### ❓ Testing Notes

**What worked well:**
_________________________________

**Issues found:**
_________________________________

**Suggestions:**
_________________________________

---

## 🔍 Test 2: Internal Audit Dashboard

### Location: `/dashboard/audit`

#### ✅ Visual Elements to Check

**Header Section:**
- [ ] Page title: "Internal Audit Dashboard"
- [ ] Subtitle: "Post-Payment Audit Review & Compliance Monitoring"
- [ ] "Generate Sample" button visible
- [ ] "Export Report" button visible

**Statistics Cards (4 cards):**
- [ ] **Total Audited**: Shows count of paid transactions
- [ ] **Compliance Rate**: Shows percentage with green color
- [ ] **Flagged Items**: Shows count with orange color
- [ ] **High Risk**: Shows count with red color

**Audit Findings Section:**
- [ ] Section title: "Audit Findings & Exceptions"
- [ ] Alert triangle icon visible
- [ ] Either:
  - [ ] Findings displayed (if any exist)
  - [ ] OR "No audit findings" message with green checkmark

**Each Finding Shows:**
- [ ] Severity badge (CRITICAL/HIGH/MEDIUM/LOW)
- [ ] Request number
- [ ] Status badge (OPEN/ACKNOWLEDGED/RESOLVED)
- [ ] Finding type (title)
- [ ] Description
- [ ] Recommendation
- [ ] Auditor name and date

**Audit Queue Table:**
- [ ] Section title: "Audit Queue - Paid Transactions"
- [ ] Search bar with search icon
- [ ] Status filter dropdown
- [ ] Table columns:
  - [ ] Request #
  - [ ] Title
  - [ ] Amount
  - [ ] Risk Level (badge: red/orange/green)
  - [ ] Compliance (progress bar with percentage)
  - [ ] Actions (Review button)

**Audit Review Panel (when item selected):**
- [ ] Panel appears below table
- [ ] Green border (emerald-600)
- [ ] Section title with request number
- [ ] Compliance Checks section (6 checks)
- [ ] Audit Notes textarea
- [ ] Action buttons:
  - [ ] Approve Audit (green)
  - [ ] Flag buttons (Low/Medium/High/Critical)
  - [ ] Cancel button

---

#### 🧪 Functional Tests

**Test 2.1: Page Load**
- [ ] Navigate to `/dashboard/audit`
- [ ] Page loads without errors
- [ ] Loading spinner appears
- [ ] Statistics populate correctly

**Test 2.2: Audit Queue Display**
- [ ] Table shows paid transactions
- [ ] Risk levels calculated correctly:
  - [ ] Amount >K50,000 = HIGH (red)
  - [ ] Amount K15,000-K50,000 = MEDIUM (orange)
  - [ ] Amount <K15,000 = LOW (green)
- [ ] Compliance scores displayed (0-100%)

**Test 2.3: Search Functionality**
- [ ] Type request number in search box
- [ ] Table filters results
- [ ] Only matching items shown
- [ ] Clear search → all items return

**Test 2.4: Filter by Status**
- [ ] Click status dropdown
- [ ] Select "Pending Review"
- [ ] Table filters accordingly
- [ ] Select "All Statuses" → all items return

**Test 2.5: Generate Audit Sample**
- [ ] Click "Generate Sample" button
- [ ] Toast notification appears
- [ ] Message says "Generated audit sample: X requests selected"
- [ ] Table updates to show sample (10% of total)

**Test 2.6: Review Transaction (Main Feature)**

**Step 1: Select Transaction**
- [ ] Click "Review" button on any transaction
- [ ] Audit Review Panel appears below table
- [ ] Panel shows correct request number
- [ ] Panel has green border

**Step 2: Compliance Checks Run**
- [ ] 6 compliance checks displayed:
  1. [ ] 3 Vendor Quotes Required
  2. [ ] Proper Authorization
  3. [ ] Budget Line Valid
  4. [ ] Justification Provided
  5. [ ] Payment Voucher Created
  6. [ ] Within Budget
- [ ] Each check shows:
  - [ ] Check icon (green checkmark or red X)
  - [ ] Check name
  - [ ] Details text
  - [ ] PASS or FAIL badge

**Step 3: Add Audit Notes**
- [ ] Click in "Audit Notes & Observations" textarea
- [ ] Type test note: "Testing audit workflow - all checks passed"
- [ ] Text appears in textarea

**Step 4: Approve Audit**
- [ ] Click "Approve Audit" button (green)
- [ ] Toast notification: "Request [number] audit approved"
- [ ] Panel closes
- [ ] No console errors

**Step 5: Flag Transaction**
- [ ] Click "Review" on a different transaction
- [ ] Add audit notes: "Testing flagging - missing documentation"
- [ ] Click "Flag - High" button
- [ ] Toast notification: "Request [number] flagged for review"
- [ ] New finding appears in Audit Findings section
- [ ] Finding shows:
  - [ ] Severity: HIGH
  - [ ] Request number
  - [ ] Status: OPEN
  - [ ] Description: Your audit notes
  - [ ] Current user as auditor

**Test 2.7: Validation**
- [ ] Click "Review" on transaction
- [ ] DO NOT add audit notes (leave empty)
- [ ] Click any "Flag" button
- [ ] Error toast: "Please add audit notes before flagging"
- [ ] Panel stays open

**Test 2.8: Cancel Review**
- [ ] Click "Review" on transaction
- [ ] Add some notes
- [ ] Click "Cancel" button
- [ ] Panel closes
- [ ] Notes are cleared

**Test 2.9: Export Functionality**
- [ ] Click "Export Report" button
- [ ] Toast notification: "Exporting Audit Report..."
- [ ] No console errors

---

#### 📸 Screenshots to Capture

1. **Full Audit Dashboard**: All sections visible
2. **Audit Queue Table**: With risk levels and compliance scores
3. **Audit Review Panel**: Compliance checks displayed
4. **Flagged Finding**: Audit finding in exceptions section
5. **Mobile View**: Audit dashboard on small screen

---

#### ❓ Testing Notes

**What worked well:**
_________________________________

**Issues found:**
_________________________________

**Suggestions:**
_________________________________

---

## 📊 Test 3: Visual Workflow Diagram

### Location: `/dashboard/requests/[id]` (any request detail page)

#### ✅ Visual Elements to Check

**Page Header:**
- [ ] Back button with arrow icon
- [ ] Request number (e.g., GE-2025-000001)
- [ ] Request title
- [ ] "View Documents" button
- [ ] "Export PDF" button

**Status Cards (4 cards):**
- [ ] Status badge (colored)
- [ ] Total Amount (large text with K prefix)
- [ ] Priority badge
- [ ] Submitted date

**Request Information:**
- [ ] Two cards side-by-side:
  1. [ ] Request Information (requester, cost centre, budget line)
  2. [ ] Description & Justification

**Line Items Table:**
- [ ] Table with columns: Description, Quantity, Unit Price, Total
- [ ] Footer showing Total Amount
- [ ] Proper formatting with K prefix

**Workflow Diagram Section (Main Feature):**
- [ ] Section title: "Approval Workflow & Status"
- [ ] File icon visible
- [ ] Description text about visual representation
- [ ] Blue info box at top showing approval route
- [ ] Workflow steps displayed as cards

**Each Workflow Step Card:**
- [ ] Status icon:
  - [ ] Green checkmark (Completed)
  - [ ] Blue clock animated (In Progress)
  - [ ] Gray circle (Pending)
  - [ ] Red X (Rejected)
- [ ] Step name (e.g., "Request Submitted", "Line Manager Approval")
- [ ] Role name
- [ ] Status badge (✓ Completed / ⏳ In Progress / Pending / etc.)
- [ ] Connecting line between steps (gray vertical line)

**Completed Steps Show:**
- [ ] Approver name
- [ ] Comments (if any)
- [ ] Timestamp

**Feedback Loop Indicators:**
- [ ] Two boxes at bottom:
  1. [ ] M&E Planning Feedback (purple)
  2. [ ] Internal Audit Review (indigo)

**Legend:**
- [ ] Gray box at bottom
- [ ] 5 status types with icons:
  - [ ] Completed (green checkmark)
  - [ ] In Progress (blue clock)
  - [ ] Pending (gray circle)
  - [ ] Rejected (red X)
  - [ ] Skipped (gray outline)

**Approval History:**
- [ ] Section title: "Approval History"
- [ ] Chronological list (newest first)
- [ ] Each approval shows:
  - [ ] Action badge (Approved/Denied/Queried/Submitted)
  - [ ] Approver name
  - [ ] Role name
  - [ ] Comments (if any)
  - [ ] Timestamp

---

#### 🧪 Functional Tests

**Test 3.1: Access Request Detail Page**

**Method 1: From Requests List**
- [ ] Navigate to `/dashboard/requests`
- [ ] Click eye icon on any request
- [ ] Detail page opens
- [ ] Workflow diagram is visible

**Method 2: Direct URL**
- [ ] Navigate to `/dashboard/requests/1` (or any valid ID)
- [ ] Page loads
- [ ] All sections render

**Test 3.2: Amount-Based Routing Verification**

Test with different request amounts to verify correct approval paths:

**Scenario A: Amount ≤ K5,000**
- [ ] Find or create request with amount ≤ K5,000
- [ ] View workflow diagram
- [ ] Verify approval path shows:
  1. [ ] Request Submitted
  2. [ ] Line Manager Approval
  3. [ ] ProVC Approval (ProVC Planning & Development)
  4. [ ] Bursary Processing
  5. [ ] Payment Completed
- [ ] Blue info box says: "Amount ≤ K5,000: Originating Desk → Line Manager → ProVC Planning → Bursary"

**Scenario B: Amount K5,001 - K10,000**
- [ ] Find request with amount in this range
- [ ] Verify approval path shows:
  1. [ ] Request Submitted
  2. [ ] Line Manager Approval
  3. [ ] Bursar Approval
  4. [ ] Bursary Processing
  5. [ ] Payment Completed
- [ ] Info box shows correct route

**Scenario C: Amount K10,001 - K15,000**
- [ ] Find request in this range
- [ ] Verify approval path includes both:
  - [ ] Bursar Approval
  - [ ] ProVC Approval

**Scenario D: Amount > K15,000**
- [ ] Find request with high amount
- [ ] Verify approval path shows:
  - [ ] Vice Chancellor Approval (instead of Bursar/ProVC)

**Test 3.3: Status Visualization**

**Test with Pending Request:**
- [ ] Find request with status "Pending Manager Review"
- [ ] Workflow shows:
  - [ ] "Request Submitted" = Completed (green checkmark)
  - [ ] "Line Manager Approval" = In Progress (blue clock, animated)
  - [ ] Remaining steps = Pending (gray circle)

**Test with Approved Request:**
- [ ] Find request with status "Approved"
- [ ] Workflow shows:
  - [ ] All approval steps = Completed (green checkmark)
  - [ ] "Bursary Processing" = In Progress (blue clock)
  - [ ] "Payment Completed" = Pending (gray circle)

**Test with Paid Request:**
- [ ] Find request with status "Paid"
- [ ] All steps should be Completed (green checkmarks)
- [ ] No In Progress steps

**Test with Denied Request:**
- [ ] Find request with status "Denied"
- [ ] Workflow shows:
  - [ ] "Request Submitted" = Completed
  - [ ] Denied step = Rejected (red X)
  - [ ] Remaining steps = Skipped (gray outline)

**Test 3.4: Approval History Integration**
- [ ] View request with multiple approvals
- [ ] Workflow diagram shows completed steps
- [ ] Scroll to "Approval History" section
- [ ] Verify:
  - [ ] Same approvers appear in both sections
  - [ ] Dates match
  - [ ] Comments appear in workflow if present

**Test 3.5: Interactive Elements**
- [ ] Hover over workflow step cards
- [ ] Cards should have subtle hover effect (if implemented)
- [ ] All text is readable
- [ ] Colors are distinct

**Test 3.6: Feedback Loop Indicators**
- [ ] Scroll to bottom of workflow diagram
- [ ] Two boxes visible:
  - [ ] Purple box: "M&E Planning Feedback"
  - [ ] Indigo box: "Internal Audit Review"
- [ ] Arrow icons visible
- [ ] Text explains automatic reporting

**Test 3.7: Legend Display**
- [ ] Legend box at bottom is visible
- [ ] All 5 status types shown
- [ ] Icons match those used in workflow
- [ ] Colors are consistent

**Test 3.8: Mobile Responsiveness**
- [ ] Resize browser to mobile (< 768px)
- [ ] Workflow cards stack vertically
- [ ] All content remains readable
- [ ] Status badges don't overflow
- [ ] Connecting lines still visible

---

#### 📸 Screenshots to Capture

1. **Full Request Detail Page**: Entire page with workflow
2. **Workflow for Small Amount**: ≤K5,000 showing ProVC path
3. **Workflow for Large Amount**: >K15,000 showing VC path
4. **In Progress Step**: Blue clock animation
5. **Completed Workflow**: All green checkmarks
6. **Denied Workflow**: Red X with skipped steps
7. **Mobile View**: Workflow on small screen
8. **Feedback Loop Indicators**: Bottom section with purple/indigo boxes

---

#### ❓ Testing Notes

**Workflow Accuracy:**
- [ ] Approval paths match amount thresholds
- [ ] Status colors are correct
- [ ] Animation works smoothly

**Issues found:**
_________________________________

**Suggestions:**
_________________________________

---

## 📚 Test 4: Review Summary Document

### Location: `unre/.same/PROCESS_FLOW_COMPLETION_SUMMARY.md`

#### ✅ Document Review Checklist

**Opening the Document:**
- [ ] Navigate to `unre/.same/` folder
- [ ] Locate file: `PROCESS_FLOW_COMPLETION_SUMMARY.md`
- [ ] Open in VS Code or markdown viewer
- [ ] Markdown renders correctly

**Content Sections:**
- [ ] Title and metadata (Version, Date, Status)
- [ ] Overview section
- [ ] Process Flow Diagram Comparison table
- [ ] Step 1: M&E Planning Dashboard details
- [ ] Step 2: Internal Audit Dashboard details
- [ ] Step 3: Visual Workflow Diagram details
- [ ] Step 4: Automated Feedback Loops details
- [ ] Completion Checklist
- [ ] How to Use the New Features
- [ ] System Benefits (Before/After)
- [ ] Training Materials outline
- [ ] Next Steps for UNRE
- [ ] Achievement Summary

**Quality Checks:**
- [ ] All code blocks are properly formatted
- [ ] Screenshots placeholders (if any) are noted
- [ ] Links to files are correct
- [ ] No typos or formatting errors
- [ ] Examples are clear and helpful

**Comprehensiveness:**
- [ ] All 4 steps are thoroughly documented
- [ ] Technical details are accurate
- [ ] User guides are clear
- [ ] Training outlines are useful

---

#### ❓ Document Review Notes

**Helpful sections:**
_________________________________

**Missing information:**
_________________________________

**Suggestions for improvement:**
_________________________________

---

## 🎓 Test 5: User Training Planning

### Training Session Outlines

#### **Session 1: Department Heads - M&E Feedback**

**Duration**: 30 minutes
**Participants**: Heads of Department, Deans, Directors
**Location**: TBD

**Objectives:**
- [ ] Understand budget utilization reports
- [ ] Interpret automated feedback recommendations
- [ ] Learn how to respond to critical warnings
- [ ] Plan budget reallocation when needed

**Agenda:**
1. [ ] Introduction to M&E Planning Dashboard (5 min)
2. [ ] Reading Budget Utilization Reports (10 min)
3. [ ] Understanding Feedback Recommendations (10 min)
4. [ ] Taking Action on Warnings (5 min)

**Materials Needed:**
- [ ] Sample dashboard screenshots
- [ ] Example feedback scenarios
- [ ] Response workflow guide
- [ ] Q&A handout

**Pre-Training Tasks:**
- [ ] Create training account with sample data
- [ ] Prepare 3 example scenarios (critical, warning, good)
- [ ] Print handouts
- [ ] Set up projector/screen

---

#### **Session 2: Internal Auditors - Audit Dashboard**

**Duration**: 1 hour
**Participants**: Internal Audit Team
**Location**: TBD

**Objectives:**
- [ ] Navigate the audit dashboard effectively
- [ ] Perform compliance checks
- [ ] Use the flagging system
- [ ] Generate audit samples
- [ ] Write audit findings

**Agenda:**
1. [ ] Dashboard Overview (10 min)
2. [ ] Audit Queue Management (10 min)
3. [ ] Compliance Checks Walkthrough (15 min)
4. [ ] Flagging Transactions (10 min)
5. [ ] Generating Samples (5 min)
6. [ ] Writing Findings (5 min)
7. [ ] Hands-on Practice (5 min)

**Materials Needed:**
- [ ] Audit checklist template
- [ ] Compliance standards document
- [ ] Sample transactions for practice
- [ ] Flagging severity guidelines

**Pre-Training Tasks:**
- [ ] Load test data (10 paid transactions)
- [ ] Create sample finding scenarios
- [ ] Prepare compliance checklist
- [ ] Set up demo environment

---

#### **Session 3: All Staff - Request Tracking**

**Duration**: 15 minutes
**Participants**: All staff who submit GE requests
**Location**: TBD (can be online/video)

**Objectives:**
- [ ] Learn how to access request detail page
- [ ] Understand the workflow diagram
- [ ] Interpret approval status
- [ ] Respond to queries

**Agenda:**
1. [ ] Accessing Your Requests (3 min)
2. [ ] Reading the Workflow Diagram (5 min)
3. [ ] Understanding Status Colors (3 min)
4. [ ] What to Do When Queried (4 min)

**Materials Needed:**
- [ ] Quick reference card (one-pager)
- [ ] Status color legend
- [ ] Common query responses guide

**Pre-Training Tasks:**
- [ ] Create simple video tutorial (optional)
- [ ] Design quick reference card
- [ ] Prepare FAQ document

---

### 📅 Training Schedule Template

| **Date** | **Session** | **Audience** | **Duration** | **Trainer** | **Status** |
|----------|-------------|--------------|--------------|-------------|------------|
| TBD | M&E Feedback | Dept Heads | 30 min | TBD | ⏳ Planned |
| TBD | Audit Dashboard | Auditors | 1 hour | TBD | ⏳ Planned |
| TBD | Request Tracking | All Staff | 15 min | TBD | ⏳ Planned |

---

### ✅ Training Preparation Checklist

**Before First Session:**
- [ ] Schedule all 3 training sessions
- [ ] Send calendar invites
- [ ] Book training room/setup online meeting
- [ ] Prepare training materials
- [ ] Create test accounts for participants
- [ ] Load sample data in test environment
- [ ] Test all features on projector/screen
- [ ] Prepare backup plan (if tech fails)

**After Each Session:**
- [ ] Collect feedback forms
- [ ] Answer follow-up questions
- [ ] Share training materials
- [ ] Schedule refresher (if needed)

---

## ✅ Overall Testing Summary

### **Version 17 - Final Checklist**

**All Features Tested:**
- [ ] M&E Planning Dashboard - TESTED ✅
- [ ] Internal Audit Dashboard - TESTED ✅
- [ ] Visual Workflow Diagram - TESTED ✅
- [ ] Summary Document - REVIEWED ✅
- [ ] Training Plan - CREATED ✅

**Issues Found:**
_________________________________
_________________________________
_________________________________

**Overall Assessment:**
- [ ] All features working as expected
- [ ] No critical bugs
- [ ] Ready for production
- [ ] Documentation is complete
- [ ] Training is planned

**Next Steps:**
1. _________________________________
2. _________________________________
3. _________________________________

---

**Tested By**: _________________
**Date**: _________________
**Sign-off**: _________________

---

## 📞 Support

If you encounter any issues during testing:

1. Check browser console for errors (F12)
2. Review `.same/PROCESS_FLOW_COMPLETION_SUMMARY.md`
3. Check server logs in terminal
4. Document the issue with screenshots
5. Contact development team

---

**End of Testing Checklist**
