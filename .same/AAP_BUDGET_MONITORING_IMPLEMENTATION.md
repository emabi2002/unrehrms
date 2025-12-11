# AAP & Budget Monitoring System Implementation Guide
## Complete Integration with UNRE GE Request System

**Document Version**: 1.0
**Date**: December 2025
**Status**: Implementation Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Flow & Process](#data-flow--process)
3. [Database Architecture](#database-architecture)
4. [Spreadsheet Mapping](#spreadsheet-mapping)
5. [Implementation Plan](#implementation-plan)
6. [UI Components](#ui-components)
7. [Integration Points](#integration-points)
8. [Testing Strategy](#testing-strategy)

---

## 1. System Overview

### 1.1 Purpose

The AAP & Budget Monitoring System extends the existing UNRE GE Request system to provide:

1. **Annual Activity Planning (AAP)** - Bottom-up planning by divisions/departments
2. **Budget Appropriation** - Government-approved budget allocations
3. **Execution Tracking** - Link GE transactions to AAP activities and budget lines
4. **Monitoring & Evaluation** - Budget vs Actual reports with detailed transaction tracking

### 1.2 Key Benefits

- ✅ **Budget Control**: Real-time checking against approved budget
- ✅ **AAP Alignment**: Ensure all expenditures link to approved activities
- ✅ **Transparency**: Complete audit trail from planning to execution
- ✅ **Monitoring**: Budget vs Actual reporting at any time
- ✅ **Compliance**: Meets PNG government requirements (PGAS integration)

### 1.3 System Components

| Component | Purpose | Users |
|-----------|---------|-------|
| **AAP Module** | Capture annual activity plans | Dept Heads, Planning Officers |
| **Budget Module** | Record government appropriations | Finance, Budget Officers |
| **Enhanced GE Module** | Link GE to AAP & Budget | All staff (existing users) |
| **Monitoring Module** | Budget vs Actual reports | Management, M&E, Finance |

---

## 2. Data Flow & Process

### 2.1 High-Level Process

```
1. AAP PREPARATION (Bottom-Up)
   ├─ Divisions prepare AAPs with activities & costs
   ├─ Submit for review & approval
   └─ University consolidates all AAPs

2. GOVERNMENT BUDGET (PGAS)
   ├─ Submit consolidated AAP to government
   ├─ Receive approved budget (may differ from AAP)
   └─ Record appropriations in system

3. IN-YEAR EXECUTION
   ├─ Staff raise GE requisitions
   ├─ System checks: AAP exists? Budget available?
   ├─ If yes: GE approved & processed
   └─ Actual expenditure recorded against budget

4. MONITORING & EVALUATION
   ├─ Generate Budget vs Actual reports
   ├─ View transaction details by activity
   └─ Track budget balance & utilization
```

### 2.2 Detailed Workflow

**Phase 1: AAP Preparation (Jan-Feb)**

```
Department → Creates AAP Header (Division, Program, Activity)
          → Adds AAP Lines (Items with proposed costs)
          → Schedules activities by month (Jan-Dec)
          → Submits AAP for approval

Planning  → Reviews all department AAPs
          → Consolidates into University AAP
          → Approves AAPs
```

**Phase 2: Budget Appropriation (Mar-Apr)**

```
Finance → Receives government appropriation (PGAS)
        → Creates Budget Version (e.g. "Original 2025")
        → Maps approved amounts to AAP Lines
        → Creates Budget Lines

NOTE: Approved budget may differ from AAP proposed cost
```

**Phase 3: Execution (Year-Round)**

```
Staff → Raises GE Request
      → Selects AAP Activity & Line Item

System → Checks if AAP exists & approved
       → Checks budget availability:
          Available = Approved Budget - (Committed + Actual)
       → If sufficient: Approve GE
       → If insufficient: Reject with message

Finance → Processes approved GE
        → Creates GE Header & Lines
        → Links to Budget Line (CRITICAL)
        → Posts transaction

System → Updates:
        - Budget utilized
        - Remaining balance
        - Transaction history
```

**Phase 4: Monitoring (Continuous)**

```
Management → Views Budget vs Actual by Activity
M&E        → Generates detailed reports
Finance    → Tracks expenditure against budget
Auditors   → Reviews transaction audit trail
```

---

## 3. Database Architecture

### 3.1 Five-Domain Model

The system is organized into 5 logical domains:

**Domain 1: Core Master Data**
- `fiscal_year` - Fiscal years (2024, 2025, 2026...)
- `division` - Top-level units (Finance & Business Services, etc.)
- `department` - Sub-units (ICT Services, Stores & Purchasing)
- `program` - Programs within divisions
- `activity_project` - Activities with vote codes (515-2610-2614)
- `chart_of_accounts` - PGAS accounts & economic items
- `supplier` - Vendors/payees

**Domain 2: AAP (Plan)**
- `aap_header` - AAP header per division/program/activity/year
- `aap_line` - Activity line items with proposed costs
- `aap_line_schedule` - Monthly implementation schedule

**Domain 3: Budget (Appropriation)**
- `budget_version` - Budget versions (Original, Revised)
- `budget_line` - Approved allocations linked to AAP lines

**Domain 4: Execution (Actuals)**
- `ge_header` - GE transaction header (existing + enhanced)
- `ge_line` - GE line items charging budget lines

**Domain 5: Monitoring (Views)**
- `vw_budget_vs_actual_by_aap_line` - Budget vs Actual summary
- `vw_ge_transactions_by_aap_line` - Transaction details

### 3.2 Critical Relationships

```
AAP Line → Budget Line → GE Line
   ↓           ↓            ↓
(Plan)     (Approved)   (Actual)

The link from GE Line to Budget Line is CRITICAL:
- Enables budget checking before GE approval
- Enables Budget vs Actual reporting
- Enables tracking of remaining budget
```

### 3.3 Key Fields by Entity

**aap_line**
- `item_no` - Item number (221, 223, 224...)
- `activity_description` - Activity name
- `specific_output` - What will be delivered
- `target_output` - Quantity/target
- `proposed_cost` - Requested amount
- `economic_item_code` - PGAS classification (121, 123...)

**budget_line**
- `aap_line_id` - Links to planned activity
- `account_id` - PGAS account
- `approved_amount` - Government-approved budget
- `fund_source` - GoPNG, Donor, etc.
- `status` - Active, Frozen, etc.

**ge_line**
- `budget_line_id` - CRITICAL link to budget
- `account_id` - PGAS account (should match budget line)
- `payee_id` - Supplier/vendor
- `amount` - Payment amount
- `detail` - Transaction description
- `cheque_batch_no` - Payment reference

---

## 4. Spreadsheet Mapping

### 4.1 AAP Template (Green Spreadsheet)

**Header Section → `aap_header` table:**
- DIVISION → `division.name`
- MAIN PROGRAM → `program.main_program_name`
- PROGRAM → `program.program_name`
- ACTIVITY/PROJECT NAME → `activity_project.name`
- ACTIVITY/PROJECT VOTE → `activity_project.code` (e.g. 515-2610-2614)
- Head of Activity → `aap_header.head_of_activity`
- Manager → `aap_header.manager`
- Telephone/Fax → `aap_header.telephone`, `fax`
- AAP → `aap_header.year_id` (e.g. 2025)

**Activity Rows → `aap_line` table:**
- PROJECT ACTIVITY → `aap_line.activity_description`
- ITEM → `aap_line.item_no` (economic item code)
- SPECIFIC OUTPUT → `aap_line.specific_output`
- Target Output → `aap_line.target_output`
- Manpower Months → `aap_line.manpower_months`
- Cost (PNG Kina) → `aap_line.proposed_cost`
- Economic Item (121, 123...) → `aap_line.economic_item_code`

**Monthly Schedule → `aap_line_schedule` table:**
- Jan, Feb, Mar... Dec columns → `aap_line_schedule` records
- Orange/yellow cells → `is_scheduled = TRUE`
- Month with activity → `month` (1-12)

### 4.2 Monitoring & Evaluating Expenses (Blue Spreadsheet)

**Left Side (Budget & Plan) → View: `vw_budget_vs_actual_by_aap_line`**
- DIVISION → `division.name`
- MAIN PROGRAM → `program.main_program_name`
- PROGRAM → `program.program_name`
- ACTIVITY/PROJECT → `activity_project.name`
- Item No → `aap_line.item_no`
- Activity/Project Activity → `aap_line.activity_description`
- Specific Output → `aap_line.specific_output`
- Target Output → `aap_line.target_output`
- Cost → `budget_line.approved_amount` (sum)
- **Expense** → `SUM(ge_line.amount)` (COMPUTED)
- **Balance** → Cost - Expense (COMPUTED)
- Achievement → `aap_line.achievement`

**Right Side (Accounts Records) → View: `vw_ge_transactions_by_aap_line`**
- No → `ge_line.line_no`
- Date → `ge_header.ge_date`
- GE No → `ge_header.ge_number` (e.g. 38322)
- Account → `chart_of_accounts.account_code` (e.g. 1000688041)
- Payee → `supplier.name` (e.g. Swift IT Solution)
- Detail → `ge_line.detail` (e.g. Toner for printer)
- Chq No/Batch Number → `ge_line.cheque_batch_no` (e.g. 486)
- Amount → `ge_line.amount` (e.g. 9,585.04)
- **Actual Balance** → Running balance (COMPUTED in report)
- REMARKS → `ge_line.remark`

### 4.3 Data Examples from Spreadsheets

**Example 1: Office Stationaries (Item 223)**

From spreadsheets:
- Activity: Office Stationaries & Supplies
- Specific Output: Purchase Supplies
- Target: Assorted
- Cost: K20,000
- Expense: K9,585.04
- Balance: K10,414.96
- Transaction: GE 38322, 13/05/2025, Swift IT Solution, Toner for printer, K9,585.04

Database records:
```sql
-- AAP Line
INSERT INTO aap_line (aap_id, item_no, activity_description, specific_output, target_output, proposed_cost, economic_item_code)
VALUES (1, '223', 'Office Stationaries & Supplies', 'Purchase Supplies', 'Assorted', 20000.00, '123');

-- Budget Line (government approved same amount)
INSERT INTO budget_line (budget_version_id, aap_line_id, account_id, approved_amount)
VALUES (1, 1, 2, 20000.00);

-- GE Line (actual expense)
INSERT INTO ge_line (ge_id, line_no, budget_line_id, account_id, payee_id, detail, cheque_batch_no, amount)
VALUES (1, 223, 1, 2, 1, 'Toner for printer', '486', 9585.04);
```

Result in monitoring report:
- Cost: K20,000.00
- Expense: K9,585.04
- Balance: K10,414.96 ✅

---

## 5. Implementation Plan

### 5.1 Phase 1: Database Setup (Week 1)

**Tasks:**
1. Execute `aap-budget-monitoring-schema.sql` on Supabase
2. Verify all tables created (19 tables)
3. Verify views created (2 views)
4. Verify triggers & functions working
5. Load initial master data (divisions, departments, programs)
6. Load chart of accounts (PGAS economic items)

**Deliverables:**
- All tables created
- Sample data loaded
- Views returning data
- Triggers tested

### 5.2 Phase 2: AAP Module (Week 2-3)

**UI Components to Build:**

1. **AAP Management Page** (`/dashboard/aap`)
   - List all AAPs by year
   - Filter by division, status
   - Create new AAP
   - View/Edit AAP details

2. **AAP Entry Form** (`/dashboard/aap/new`)
   - Step 1: Header (Division, Program, Activity, Manager, etc.)
   - Step 2: Add Line Items (activity, output, target, cost)
   - Step 3: Monthly Schedule (Jan-Dec planning)
   - Step 4: Review & Submit

3. **AAP Approval Workflow**
   - Planning officer reviews submitted AAPs
   - Approve/Reject with comments
   - Email notifications

**API Functions:**
- `createAAP()` - Create AAP header
- `addAAPLine()` - Add activity line
- `setMonthlySchedule()` - Set implementation months
- `submitAAP()` - Submit for approval
- `approveAAP()` - Approve AAP

### 5.3 Phase 3: Budget Module (Week 4)

**UI Components to Build:**

1. **Budget Allocation Page** (`/dashboard/budget/allocation`)
   - Select budget version (Original, Revised)
   - Import PGAS appropriation (CSV/Excel)
   - Map approved amounts to AAP lines
   - View budget by division/program

2. **Budget Import Tool**
   - Upload CSV/Excel with government appropriations
   - Map columns to AAP lines & accounts
   - Validate data
   - Create budget lines

**API Functions:**
- `createBudgetVersion()` - Create budget version
- `importBudgetAllocations()` - Import from PGAS
- `createBudgetLine()` - Create individual allocation
- `getBudgetSummary()` - Get budget overview

### 5.4 Phase 4: Enhanced GE Module (Week 5-6)

**Enhancements to Existing GE Request Form:**

Add fields:
- Activity/Project dropdown (from AAP)
- AAP Line Item dropdown (filtered by activity)
- Budget availability check (real-time)

**Changes to GE Approval:**

Before approval:
1. Check if AAP line exists
2. Check if budget line exists
3. Check available budget:
   ```
   Available = Approved Budget - (Committed + Actual)
   ```
4. If insufficient: Reject with message
5. If sufficient: Approve & create commitment

**Enhanced `ge_header` and `ge_line`:**
- Add `aap_line_id` to `ge_header`
- Add `budget_line_id` to `ge_line` (CRITICAL)
- Enforce budget checking via trigger

**API Functions:**
- `checkAAP()` - Verify AAP exists & approved
- `checkBudgetAvailability()` - Calculate available budget
- `createGEWithBudgetLink()` - Create GE linked to budget
- `postGETransaction()` - Post transaction & update budget

### 5.5 Phase 5: Monitoring Module (Week 7-8)

**UI Components to Build:**

1. **Budget vs Actual Report** (`/dashboard/monitoring/budget-vs-actual`)
   - Select year, division, program
   - Show summary by AAP line (left side of monitoring sheet)
   - Click to view transactions (right side)
   - Export to Excel

2. **Detailed Transaction Report**
   - Filter by AAP line, date range
   - Show all GE transactions
   - Running balance column
   - Drill-down to GE details

3. **Budget Dashboard** (`/dashboard/monitoring/dashboard`)
   - Overall budget utilization
   - Budget by division (pie chart)
   - Top spending activities (bar chart)
   - Budget alerts (>90% utilized)

**API Functions:**
- `getBudgetVsActual()` - Get summary from view
- `getTransactionsByAAP()` - Get transaction details
- `getBudgetDashboard()` - Get dashboard metrics
- `exportMonitoringReport()` - Export to Excel/PDF

---

## 6. UI Components

### 6.1 AAP Entry Screen

**Header Section:**
```
┌─────────────────────────────────────────┐
│ Create Annual Activity Plan (AAP)      │
├─────────────────────────────────────────┤
│ Fiscal Year:  [2025 ▼]                 │
│ Division:     [Academic Support Svcs ▼] │
│ Department:   [ICT Services ▼]          │
│ Main Program: [Academic ▼]              │
│ Program:      [ICT Services ▼]          │
│ Activity:     [Coordinate & Impl... ▼]  │
│ Manager:      [ICT MANAGER]             │
│ Telephone:    [983-9144]                │
└─────────────────────────────────────────┘
```

**Activity Lines Section:**
```
┌───┬──────────────────┬───────────┬──────────┬──────────┬───────┐
│ # │ Activity         │ Output    │ Target   │ Economic │ Cost  │
├───┼──────────────────┼───────────┼──────────┼──────────┼───────┤
│223│Office Stationery │Purchase   │Assorted  │  123     │20,000 │
│   │& Supplies        │Supplies   │          │          │       │
├───┼──────────────────┼───────────┼──────────┼──────────┼───────┤
│224│Students Supplies │Toiletries │300 bales │  123     │100,000│
├───┼──────────────────┼───────────┼──────────┼──────────┼───────┤
│   │ [+ Add Line]                                Total: 120,000 │
└────────────────────────────────────────────────────────────────┘
```

**Monthly Schedule (per line):**
```
Activity: Office Stationery & Supplies
Schedule implementation months:

Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec
[✓] [✓] [ ] [✓] [✓] [ ] [✓] [✓] [ ] [✓] [✓] [ ]
```

### 6.2 Budget Allocation Screen

```
┌─────────────────────────────────────────────────────┐
│ Budget Allocation - 2025 Original                   │
├─────────────────────────────────────────────────────┤
│ AAP Line                     │ Proposed │ Approved  │
├──────────────────────────────┼──────────┼───────────┤
│ 223 - Office Stationery      │  20,000  │ [20,000]  │
│ 224 - Students Supplies      │ 100,000  │ [100,000] │
│ 225 - Fuel & Lubricants      │ 350,000  │ [300,000] │← Different!
├──────────────────────────────┼──────────┼───────────┤
│ Total                        │ 470,000  │  420,000  │
└─────────────────────────────────────────────────────┘

Note: Government may approve different amounts than proposed
```

### 6.3 Enhanced GE Request Form

**Additional Fields:**
```
┌─────────────────────────────────────────┐
│ General Expense Request                 │
├─────────────────────────────────────────┤
│ ... existing fields ...                 │
├─────────────────────────────────────────┤
│ AAP Activity: [Coordinate & Impl... ▼]  │← NEW
│ AAP Line Item:[Office Stationery ▼]     │← NEW
│                                          │
│ Budget Check:                            │← NEW
│ ┌─────────────────────────────────────┐ │
│ │ ✓ AAP Approved                      │ │
│ │ ✓ Budget Available: K10,414.96      │ │
│ │   (Budget: K20,000, Spent: K9,585)  │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 6.4 Monitoring Report (Replicates Spreadsheet)

**Left Side - Budget Summary:**
```
┌───┬────────────────┬────────┬────────┬─────────┬─────────┐
│Item│ Activity       │ Cost   │Expense │ Balance │Achievement│
├───┼────────────────┼────────┼────────┼─────────┼───────────┤
│223│Office Stat...  │ 20,000 │ 9,585  │ 10,415  │Purchased  │
│224│Student Sup...  │100,000 │44,000  │ 56,000  │Toiletries │
│225│Fuel & Lubr...  │350,000 │ 5,062  │344,938  │Petrol & Z │
└───┴────────────────┴────────┴────────┴─────────┴───────────┘
```

**Right Side - Transaction Details (Click to expand):**
```
Transactions for Item 223 - Office Stationery:

┌────┬──────────┬───────┬──────────┬──────────┬────────┬───────┐
│No  │ Date     │ GE No │ Payee    │ Detail   │ Amount │Balance│
├────┼──────────┼───────┼──────────┼──────────┼────────┼───────┤
│223 │13/05/2025│ 38322 │Swift IT  │Toner for │ 9,585  │10,415 │
│    │          │       │Solution  │printer   │        │       │
└────┴──────────┴───────┴──────────┴──────────┴────────┴───────┘
```

---

## 7. Integration Points

### 7.1 With Existing GE System

**Shared Tables:**
- `user_profiles` - User management
- `cost_centres` - May map to `department`
- `suppliers` - Same supplier/payee table

**Enhanced Tables:**
- `ge_requests` → Becomes `ge_header`
- Add fields: `aap_line_id`, `activity_id`

**New Workflow:**
```
Old: Staff → GE Request → Approval → Payment
New: Staff → Select AAP Item → Check Budget → GE Request → Approval → Payment
                    ↑                  ↑
              (Links to AAP)    (Validates budget)
```

### 7.2 With PGAS (External System)

**Import from PGAS:**
- Budget appropriations (CSV/Excel)
- Chart of accounts (economic items)
- Expenditure data (for reconciliation)

**Export to PGAS:**
- GE transactions (for posting)
- Payment details
- Budget utilization reports

**Integration Method:**
- Phase 1: Manual CSV/Excel import (current)
- Phase 2: API integration (future)

### 7.3 Budget Checking Logic

**Before GE Approval:**

```typescript
async function checkBudgetAvailability(aapLineId: number, amount: number) {
    // 1. Get budget line
    const budgetLine = await getBudgetLine(aapLineId);

    if (!budgetLine) {
        return {
            available: false,
            message: "No budget allocation found for this AAP item"
        };
    }

    // 2. Calculate actual expenditure
    const actualSpent = await sumGELinesByBudgetLine(budgetLine.id);

    // 3. Calculate committed (pending GEs)
    const committed = await sumPendingGEsByBudgetLine(budgetLine.id);

    // 4. Calculate available
    const available = budgetLine.approved_amount - actualSpent - committed;

    // 5. Check if sufficient
    if (amount > available) {
        return {
            available: false,
            message: `Insufficient budget. Available: K${available}, Requested: K${amount}`,
            details: {
                budget: budgetLine.approved_amount,
                spent: actualSpent,
                committed: committed,
                available: available
            }
        };
    }

    return {
        available: true,
        message: `Budget available: K${available}`,
        details: {
            budget: budgetLine.approved_amount,
            spent: actualSpent,
            committed: committed,
            available: available
        }
    };
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Database Functions:**
- Test budget calculation (approved - spent - committed)
- Test trigger: update AAP total when line added
- Test trigger: validate budget before GE posting
- Test views: Budget vs Actual calculation

**API Functions:**
- Test AAP creation
- Test budget allocation
- Test budget availability check
- Test GE posting with budget link

### 8.2 Integration Tests

**End-to-End Workflows:**

**Test 1: AAP to Budget to GE**
```
1. Create AAP with 1 line item (K20,000)
2. Approve AAP
3. Create budget version
4. Allocate budget (K20,000)
5. Create GE request (K5,000)
6. Check budget availability → Should pass
7. Post GE
8. Create another GE (K16,000)
9. Check budget availability → Should fail (only K15,000 left)
```

**Test 2: Monitoring Report**
```
1. Create AAP with 3 line items
2. Allocate budget
3. Post 5 GE transactions across 3 items
4. Generate Budget vs Actual report
5. Verify:
   - Cost = Budget allocated
   - Expense = Sum of GE amounts
   - Balance = Cost - Expense
6. Click on item to view transactions
7. Verify all 5 GEs listed
```

### 8.3 User Acceptance Testing

**Test Scenarios:**

1. **Planning Officer**
   - Create AAP for ICT department
   - Add 10 activity lines
   - Schedule activities across year
   - Submit for approval

2. **Finance Officer**
   - Import PGAS budget allocation
   - Map to AAP lines
   - Verify totals match government appropriation

3. **Department Staff**
   - Raise GE request
   - Select AAP activity
   - See budget availability
   - Submit request

4. **Management**
   - View Budget vs Actual report
   - Filter by division
   - Export to Excel
   - Review detailed transactions

---

## 9. Data Migration

### 9.1 Existing Data

If you have historical GE data in the current system:

**Option 1: Link to AAP Retroactively**
- Create AAPs for previous years (2024, 2023)
- Create budget lines for historical budgets
- Update existing GE records with `aap_line_id` and `budget_line_id`

**Option 2: Start Fresh**
- Keep historical data as-is
- Start AAP/Budget system from 2025 onwards
- Historical data remains queryable but not linked to AAP

### 9.2 Migration Steps

If retroactively linking:

1. Export existing GE data
2. Create AAPs for past years (manual or import)
3. Create budget lines matching actual expenditure
4. Script to match GE transactions to AAP lines based on:
   - Department/Division
   - Economic item code
   - Transaction date
5. Update `ge_header.aap_line_id`
6. Update `ge_line.budget_line_id`
7. Verify Budget vs Actual totals match

---

## 10. Next Steps

### 10.1 Immediate Actions

1. **Review Schema**
   - Review `aap-budget-monitoring-schema.sql`
   - Confirm table structure meets needs
   - Identify any missing fields

2. **Execute Schema**
   - Run schema on Supabase
   - Verify all objects created
   - Test views return data

3. **Load Master Data**
   - Import divisions, departments, programs
   - Load chart of accounts
   - Add suppliers

4. **Build First Module**
   - Start with AAP Module
   - Create AAP management page
   - Build AAP entry form
   - Test AAP creation & approval

### 10.2 Implementation Order

**Week 1:** Database + Master Data
**Week 2-3:** AAP Module
**Week 4:** Budget Module
**Week 5-6:** Enhanced GE Module
**Week 7-8:** Monitoring Module
**Week 9:** Testing & Refinement
**Week 10:** Training & Deployment

---

## 11. Success Criteria

The implementation will be successful when:

✅ All AAPs can be created and approved electronically
✅ Government budget allocations are recorded and linked to AAPs
✅ All GE requests check budget availability before approval
✅ GE transactions are linked to AAP lines and budget lines
✅ Budget vs Actual reports match spreadsheet format
✅ Transaction details can be drilled down by AAP item
✅ System prevents over-expenditure of budget
✅ Reports can be exported to Excel/PDF
✅ Users trained and system in production

---

## 12. Appendices

### Appendix A: Glossary

**AAP**: Annual Activity Plan - Bottom-up planning document
**PGAS**: Provincial Government Accounting System - PNG government accounting
**Economic Item**: Classification code (121, 123, etc.) for expense types
**Budget Line**: Approved budget allocation for a specific activity/account
**Commitment**: Pending GE request that reserves budget
**Actual**: Posted GE transaction that consumes budget

### Appendix B: Key Reports

1. **Budget vs Actual by Division**
2. **Budget vs Actual by Program**
3. **Budget vs Actual by Activity**
4. **Transaction Detail by AAP Line**
5. **Budget Utilization Summary**
6. **Over/Under Budget Report**
7. **Budget Balance Report**

### Appendix C: File References

- Schema: `aap-budget-monitoring-schema.sql`
- Supabase Credentials: `.env.local`
- Spreadsheets: Attached images (AAP template, Monitoring sheet)

---

**END OF IMPLEMENTATION GUIDE**

**Prepared By**: Same AI Development Team
**For**: University of Natural Resources & Environment (UNRE)
**Date**: December 2025
**Version**: 1.0
