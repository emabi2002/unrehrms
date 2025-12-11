# Interactive Workflow Automation Test Guide

## 🎮 How to Access the Workflow Test Demo

### Option 1: Direct URL
Navigate to: `http://localhost:3000/demo/workflow-test`

### Option 2: From Demo Page
1. Go to `http://localhost:3000/demo`
2. Click the **"Test Workflow Automation"** button (amber colored)

---

## 📋 ICT Printer Purchase Scenario

The demo tests your exact use case scenario:

**Request Details:**
- **Request Number**: GE-2025-000125
- **Title**: New Printer for ICT Department
- **Requester**: John Kola (ICT Officer)
- **Amount**: K4,800
- **Budget Line**: Capital - IT Equipment
- **Available Budget**: K500,000
- **3 Vendor Quotes**:
  - Brian Bell Ltd: K4,800
  - Stop & Shop: K4,950
  - PNG Office Supplies: K4,700

---

## 🛤️ Three Test Scenarios

### 1. ✅ Normal Approval Path (Happy Path)

**What Happens:**
1. ICT Officer submits request with 3 quotes
2. System auto-generates GE-2025-000125
3. Routes to Department Manager
4. Manager approves → Routes to ProVC (≤K5,000)
5. ProVC approves → Forwards to Accounts
6. Accounts processes payment
7. Payment completed successfully

**Steps in Demo:** 8 steps
**Final Status:** Paid ✓
**Emails Sent:** 4 notifications

---

### 2. ❓ Query Path (Missing Quote)

**What Happens:**
1-4. Same as normal path
5. ProVC finds missing third quote
6. Clicks "Query" with reason
7. System returns to ICT Officer
8. ICT Officer uploads missing quote
9. Clicks "Resubmit"
10. Workflow restarts from Manager

**Steps in Demo:** 7 steps
**Final Status:** Resubmitted - Pending Manager Review
**Emails Sent:** 3 notifications
**Key Feature:** Query handling with corrections

---

### 3. ❌ Denial Path (Budget Exceeded)

**What Happens:**
1-4. Same as normal path
5. ProVC denies request
6. Enters denial reason: "Exceeds annual IT equipment budget allocation"
7. Status: Denied
8. Budget commitment released
9. Workflow terminated

**Steps in Demo:** 6 steps
**Final Status:** Denied
**Emails Sent:** 2 notifications
**Key Feature:** Budget control and denial workflow

---

## 🎯 How to Use the Demo

### Step 1: Select a Scenario
Click one of the three scenario buttons at the top:
- **✅ Normal Approval Path** (green)
- **❓ Query Path** (amber)
- **❌ Denial Path** (red)

### Step 2: Progress Through Workflow
Use the control panel on the right:
- **Next Step** - Advance to next workflow step
- **Previous Step** - Go back to review
- **Reset Demo** - Start over from beginning

### Step 3: Observe Each Step
Watch for these details in each step:

**Actor Information:**
- Who performs the action
- Their role in the workflow

**Automated Actions:**
- Status updates
- Budget checks
- Routing decisions
- Commitment tracking

**Email Notifications:**
- When emails are sent
- Who receives them
- Email content preview

**Request Status:**
- Current status badge
- Status changes over time

### Step 4: Track Progress
- Progress bar shows completion percentage
- Step counter (e.g., "Step 3 of 8")
- Completed steps show ✓ with timestamp

---

## 🔍 What to Look For

### Power Automate Replacement Features

1. **Auto-Generation** (Step 1)
   - Request number: GE-2025-000125
   - Automatic ID assignment

2. **Amount-Based Routing** (Steps 3-4)
   - K4,800 ≤ K5,000
   - Routes to ProVC (not VC)
   - Intelligent decision-making

3. **3 Quotes Validation** (Step 1)
   - System checks for 3 quotes
   - Prevents submission without them

4. **Email Notifications** (Multiple steps)
   - Blue boxes show when emails sent
   - Lists recipients
   - Replicates Teams/Outlook

5. **Status Tracking** (All steps)
   - Real-time status updates
   - Badge color changes
   - Microsoft Lists equivalent

6. **Budget Commitment** (Step 5)
   - Auto-creates commitment
   - Updates available budget
   - Real-time calculations

7. **Query Workflow** (Query scenario)
   - Return for corrections
   - Resubmission capability
   - Workflow restart

8. **5-Day SLA** (Step 6)
   - Payment processing timeline
   - SLA tracking started
   - Automatic monitoring

---

## 📊 Microsoft 365 Services Demonstrated

The demo shows ALL these services working together:

### ✅ Power Automate
- Workflow routing
- Automated actions
- Conditional logic
- Status updates

### ✅ Microsoft Forms
- Request submission
- Field validation
- Document uploads
- Auto-numbering

### ✅ SharePoint
- Document storage
- 3 vendor quotes
- File management
- Access controls

### ✅ Microsoft Lists
- Status tracking
- Request history
- Real-time updates
- Filterable views

### ✅ Teams/Outlook
- Email notifications
- Approval alerts
- Query notifications
- Confirmation emails

---

## 💡 Testing Tips

### Test All Three Scenarios
Don't just test the normal path! The query and denial paths show important features:
- Error handling
- User corrections
- Budget controls
- Workflow flexibility

### Pay Attention to Details
Look for:
- Automatic routing decisions
- Email notification triggers
- Status badge changes
- Budget updates
- Approval history

### Use the Progress Bar
The progress bar helps you understand:
- How many steps in total
- Where you are in the process
- How much is left

### Reset and Compare
Reset the demo and try different scenarios to see:
- Different routing paths
- Various email notifications
- Alternative outcomes

---

## 🎓 Real-World Application

This demo shows EXACTLY what happens in production:

1. **ICT Officer** uses the real GE request form
2. **System** automatically processes (just like demo)
3. **Approvers** receive real emails
4. **Status** updates in real-time
5. **Accounts** gets notification automatically
6. **Payment** tracked with 5-day SLA

**No manual intervention needed!** Everything is automated.

---

## 📈 Key Metrics Shown

The demo highlights these important metrics:

- **Request Number**: Auto-generated
- **Amount**: K4,800
- **Budget Available**: K500,000
- **Routing Decision**: Based on ≤K5,000 threshold
- **Approval Levels**: 2 (Manager + ProVC)
- **Email Count**: 4 notifications
- **Processing Time**: 5-day SLA for payment
- **Status Changes**: 8 different statuses

---

## 🔧 Technical Details

### What's Actually Happening
Each "Next Step" click simulates:
1. User action (approve, query, submit)
2. System processing (routing logic)
3. Database updates (status changes)
4. Email sending (notifications)
5. Budget calculations (commitments)

### Real vs Demo
**Demo**: Uses mock data and simulates actions
**Real System**: Uses Supabase database and real email API
**Logic**: IDENTICAL in both!

The workflow automation code in `src/lib/workflow-automation.ts` powers both the demo and the real system.

---

## ✅ Success Indicators

You've successfully tested when you:

- [ ] Tested all 3 scenarios
- [ ] Observed automated routing (≤K5000 → ProVC)
- [ ] Saw email notifications at correct steps
- [ ] Watched status changes in real-time
- [ ] Understood the query workflow
- [ ] Saw denial and budget release
- [ ] Noticed 5-day SLA tracking
- [ ] Understood the complete workflow

---

## 🎯 Next Steps After Testing

Once you've tested the workflow:

1. **Set up Supabase database** (see DATABASE_SETUP_STEPS.md)
2. **Configure email notifications** (see EXCHANGE_365_SETUP.md)
3. **Deploy to production** (see DEPLOYMENT_GUIDE.md)
4. **Train users** (see TESTING_GUIDE.md)

---

## 📞 Questions?

If you have questions about:
- **How routing works**: See WORKFLOW_AUTOMATION_GUIDE.md
- **Email setup**: See EMAIL_INTEGRATION_GUIDE.md
- **Database**: See DATABASE_SETUP_STEPS.md
- **Deployment**: See DEPLOYMENT_GUIDE.md

---

**Version**: 14.0
**Demo URL**: `/demo/workflow-test`
**Status**: ✅ Fully Functional
**Last Updated**: December 2025
