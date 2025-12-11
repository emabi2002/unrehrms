# 🔄 UNRE GE Workflow Requirements & System Modifications

Based on the University General Expenses Order Process documentation and use case scenarios.

---

## 📋 Current System vs Required Workflow

### Approval Hierarchy Changes

#### Current System:
```
Requestor → HOD → Dean → Bursar → Registrar
```

#### Required System (Amount-Based Routing):
```
Requestor → Line Manager/HOD → Budget Validation → Amount-Based Routing:

IF amount K1,000 - K10,000:
  → Bursar → Payment

IF amount K15,001 - K100,000:
  → Vice Chancellor → Payment

IF amount ≤ K5,000:
  → ProVC Planning & Development → Payment

IF division-specific:
  → ProVC Academic → Payment
```

---

## 🔑 Key Process Changes

### 1. Request Submission (Step 1)

**Required Fields:**
- ✅ GE Form details (already exists)
- ✅ Amount
- ✅ Purpose/Description
- ✅ Department/Cost Centre
- **NEW**: Item Vote Code (from AAP)
- **NEW**: Specification Item
- **NEW**: 3 Vendor Quotes (mandatory uploads)
- **NEW**: Memo (mandatory upload)
- **NEW**: Line Manager/HOD signature

**Validation Rules:**
- Minimum 3 quotes required
- Memo must be attached
- Item vote code must exist in AAP
- Specification item required

---

### 2. Budget Validation (Step 2) - CRITICAL CHANGE

**Current**: Happens after approvals
**NEW**: **Must happen IMMEDIATELY after submission, BEFORE any approvals**

**Process:**
1. Request submitted
2. **Automatic Budget Check** against AAP (PGAS data)
3. **IF budget available AND item in AAP**: Route for approval
4. **IF budget exhausted**: Auto-reject with reason
5. **IF item not in AAP**: Auto-reject with reason

**Required Data:**
- Annual Activity Plan (AAP) allocations per department
- Current expenditure by budget line
- Committed amounts (pending approvals)
- Available balance = Budget - Expenditure - Commitments

---

### 3. Approval Routing (Step 3) - AMOUNT-BASED

**Approval Matrix:**

| Amount Range | First Approver | Final Approver | Notes |
|-------------|----------------|----------------|-------|
| < K1,000 | Line Manager/HOD | Auto-approve | Fast track |
| K1,000 - K10,000 | Line Manager/HOD | **Bursar** | Standard |
| K10,001 - K15,000 | Line Manager/HOD | **Bursar** + **ProVC P&D** | Dual approval |
| K15,001 - K100,000 | Line Manager/HOD | **Vice Chancellor** | High value |
| > K100,000 | Line Manager/HOD | **VC** + Council | Board level |

**Division-Specific:**
- Academic division requests → **ProVC Academic** endorses
- Planning & Development → **ProVC Planning & Development** endorses
- Infrastructure → **ProVC Planning & Development** endorses

---

### 4. Query/Correction Workflow (NEW)

**New Status: "Queried"**

**Process:**
1. Approver identifies issue (e.g., missing quote, incorrect vote code)
2. Sets status to **"Queried"**
3. Adds query comments/reason
4. System sends notification to requestor
5. Requestor corrects and resubmits
6. Request returns to same approver
7. Approver reviews corrections
8. Approves or queries again

**Query Reasons:**
- Missing vendor quotes
- Incorrect item vote code
- Memo missing or inadequate
- Specification unclear
- Budget allocation mismatch
- Other (specify)

---

### 5. Payment Processing (Step 4)

**Payment Statuses:**
```
Approved → Pending Payment → Processing → Paid
```

**Process:**
1. GE approved → **Pending Payment**
2. Finance receives notification
3. Finance reviews → **Processing**
4. Payment made via **Kundupei** (external banking system)
5. Finance records payment details
6. Finance updates status → **Paid**
7. **Manual entry into PGAS** (record payment)
8. Requestor notified

**Timeline:**
- Standard processing: **5 business days**
- Urgent (flagged): **2 business days**

**Payment Data:**
- Payment date
- Kundupei reference number
- Bank transaction ID
- Payment method (EFT/Cheque)
- PGAS entry confirmation

---

### 6. Status Tracking (Step 6)

**Complete Status Flow:**
```
Draft → Submitted → Budget Validation →
  [IF VALID] → Pending Approval →
    [Line Manager Approval] →
      [Amount-Based Routing] →
        Bursar/VC/ProVC Approval →
          Approved → Pending Payment →
            Processing → Paid → Closed

  [IF INVALID] → Rejected (Budget/AAP issue)

  [IF QUERIED] → Queried → Corrected → Resubmitted → Pending Approval

  [IF DENIED] → Rejected (Approver decision)
```

---

## 👥 New Roles Required

### 1. Vice Chancellor (VC)
- **Permissions**: Approve GEs K15,001 - K100,000
- **Dashboard**: High-value requests pending approval
- **Notifications**: Email for requests > K15,000

### 2. Pro Vice Chancellor - Planning & Development
- **Permissions**:
  - Approve GEs ≤ K5,000
  - Endorse Planning & Development division requests
  - Approve K10,001-K15,000 (with Bursar)
- **Dashboard**: P&D division requests
- **Notifications**: Email for P&D requests and ≤ K5,000

### 3. Pro Vice Chancellor - Academic
- **Permissions**: Endorse Academic division requests
- **Dashboard**: Academic division requests
- **Notifications**: Email for Academic division GEs

### 4. Line Manager
- **Permissions**:
  - First-level approval for all requests
  - Can query requests
  - View department budget status
- **Dashboard**: Team requests pending approval
- **Notifications**: Email for team submissions

### 5. Bursar (Updated)
- **Permissions**: Approve K1,000 - K10,000
- **Dashboard**: All requests in approval range
- **Notifications**: Email for K1,000-K10,000 requests

---

## 📊 Database Schema Updates

### New Tables:

#### `approval_matrix`
```sql
CREATE TABLE approval_matrix (
  id BIGSERIAL PRIMARY KEY,
  min_amount NUMERIC(18,2) NOT NULL,
  max_amount NUMERIC(18,2) NOT NULL,
  approval_sequence INTEGER NOT NULL,
  role_id BIGINT REFERENCES roles(id),
  division_id BIGINT REFERENCES divisions(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `ge_queries`
```sql
CREATE TABLE ge_queries (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id),
  queried_by UUID REFERENCES user_profiles(id),
  query_reason TEXT NOT NULL,
  query_details TEXT,
  queried_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES user_profiles(id)
);
```

#### `payment_tracking`
```sql
CREATE TABLE payment_tracking (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id),
  payment_voucher_id BIGINT REFERENCES payment_vouchers(id),
  status TEXT NOT NULL, -- 'pending', 'processing', 'paid'
  kundupei_reference TEXT,
  bank_transaction_id TEXT,
  payment_method TEXT, -- 'EFT', 'Cheque'
  payment_date TIMESTAMPTZ,
  pgas_entry_confirmed BOOLEAN DEFAULT FALSE,
  pgas_entry_date TIMESTAMPTZ,
  processing_started_at TIMESTAMPTZ,
  expected_completion_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `vendor_quotes`
```sql
CREATE TABLE vendor_quotes (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id),
  vendor_name TEXT NOT NULL,
  quote_amount NUMERIC(18,2) NOT NULL,
  quote_file_url TEXT NOT NULL,
  quote_date DATE,
  quote_number TEXT,
  is_selected BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Updated Tables:

#### `ge_requests` (add columns)
```sql
ALTER TABLE ge_requests ADD COLUMN IF NOT EXISTS:
  item_vote_code TEXT, -- From AAP
  specification_item TEXT,
  memo_file_url TEXT,
  quotes_count INTEGER DEFAULT 0,
  budget_validated BOOLEAN DEFAULT FALSE,
  budget_validation_date TIMESTAMPTZ,
  budget_validation_result TEXT,
  query_count INTEGER DEFAULT 0,
  division_id BIGINT REFERENCES divisions(id),
  line_manager_id UUID REFERENCES user_profiles(id),
  line_manager_approved_at TIMESTAMPTZ;
```

#### `ge_approvals` (add columns)
```sql
ALTER TABLE ge_approvals ADD COLUMN IF NOT EXISTS:
  approval_sequence INTEGER,
  is_query BOOLEAN DEFAULT FALSE,
  query_reason TEXT,
  amount_threshold_min NUMERIC(18,2),
  amount_threshold_max NUMERIC(18,2);
```

---

## 🔄 Workflow Logic Implementation

### Budget Validation Function

```typescript
async function validateBudgetBeforeApproval(requestId: number) {
  // 1. Get request details
  const request = await getRequestById(requestId);

  // 2. Check if item vote code exists in AAP
  const aapItem = await checkAAPItemExists(
    request.cost_centre_id,
    request.item_vote_code,
    request.budget_year
  );

  if (!aapItem) {
    return {
      valid: false,
      reason: `Item vote code ${request.item_vote_code} not found in Annual Activity Plan for this department`
    };
  }

  // 3. Get budget line
  const budgetLine = await getBudgetLine(
    request.cost_centre_id,
    request.item_vote_code
  );

  // 4. Calculate available balance
  const available = budgetLine.original_amount
    - budgetLine.ytd_expenditure
    - budgetLine.committed_amount;

  // 5. Check if sufficient budget
  if (request.total_amount > available) {
    return {
      valid: false,
      reason: `Insufficient budget. Available: K${available.toFixed(2)}, Requested: K${request.total_amount.toFixed(2)}`
    };
  }

  // 6. Create commitment
  await createCommitment({
    ge_request_id: requestId,
    budget_line_id: budgetLine.id,
    amount: request.total_amount
  });

  return {
    valid: true,
    available_balance: available,
    committed_amount: request.total_amount
  };
}
```

### Amount-Based Approval Routing

```typescript
async function routeApproval(requestId: number) {
  const request = await getRequestById(requestId);
  const amount = request.total_amount;

  // Get approval matrix for this amount
  const approvers = await getApproversForAmount(amount, request.division_id);

  // Create approval records in sequence
  for (let i = 0; i < approvers.length; i++) {
    await createApprovalRecord({
      ge_request_id: requestId,
      approver_role_id: approvers[i].role_id,
      approval_sequence: i + 1,
      amount_threshold_min: approvers[i].min_amount,
      amount_threshold_max: approvers[i].max_amount,
      status: i === 0 ? 'pending' : 'not_started'
    });
  }

  // Send notification to first approver
  await notifyApprover(requestId, approvers[0]);
}

async function getApproversForAmount(amount: number, divisionId?: number) {
  const approvers = [];

  // Always start with Line Manager
  approvers.push({ role: 'Line Manager', sequence: 1 });

  // Amount-based routing
  if (amount < 1000) {
    // Auto-approve after Line Manager
    return approvers;
  } else if (amount >= 1000 && amount <= 10000) {
    approvers.push({ role: 'Bursar', sequence: 2 });
  } else if (amount > 10000 && amount <= 15000) {
    approvers.push({ role: 'Bursar', sequence: 2 });
    approvers.push({ role: 'ProVC Planning & Development', sequence: 3 });
  } else if (amount > 15000 && amount <= 100000) {
    approvers.push({ role: 'Vice Chancellor', sequence: 2 });
  } else {
    approvers.push({ role: 'Vice Chancellor', sequence: 2 });
    approvers.push({ role: 'Council', sequence: 3 });
  }

  return approvers;
}
```

---

## 📧 Email Notification Updates

### New Email Types:

1. **Budget Validation Failed**
   - To: Requestor
   - Content: Reason for validation failure (not in AAP / budget exhausted)

2. **Query Issued**
   - To: Requestor
   - Content: Query reason, required corrections, resubmission link

3. **Payment Processing Started**
   - To: Requestor, Finance
   - Content: Payment initiated, expected completion date

4. **Payment Completed**
   - To: Requestor, Line Manager, Finance
   - Content: Payment confirmation, Kundupei reference

5. **PGAS Entry Required**
   - To: Finance Officer
   - Content: Reminder to enter payment in PGAS

---

## ✅ Implementation Checklist

### Phase 1: Database & Roles
- [ ] Create new roles (VC, ProVC P&D, ProVC Academic, Line Manager)
- [ ] Update database schema (new tables + columns)
- [ ] Create approval matrix configuration
- [ ] Seed test data for AAP items

### Phase 2: Budget Validation
- [ ] Implement budget validation logic
- [ ] Move validation to Step 2 (before approval)
- [ ] Add AAP item checking
- [ ] Create commitment tracking

### Phase 3: Approval Workflow
- [ ] Implement amount-based routing logic
- [ ] Add division-based routing
- [ ] Create query/correction workflow
- [ ] Update approval UI

### Phase 4: Document Management
- [ ] Add vendor quotes upload (min 3)
- [ ] Add memo upload
- [ ] Enforce mandatory documents
- [ ] Validate file uploads

### Phase 5: Payment Processing
- [ ] Add payment status tracking (Pending → Processing → Paid)
- [ ] Create Kundupei integration placeholder
- [ ] Add PGAS entry confirmation
- [ ] Implement 5-day timeline tracking

### Phase 6: Notifications
- [ ] Update email templates for new workflow
- [ ] Add budget validation failure emails
- [ ] Add query notification emails
- [ ] Add payment status emails

### Phase 7: UI Updates
- [ ] Update request form (new fields)
- [ ] Create query management interface
- [ ] Update approval dashboards
- [ ] Add payment tracking dashboard

---

## 🔌 External System Integration

### PGAS (Provincial Government Accounting System)
**Type**: Read-only (for now)
**Purpose**:
- Validate item vote codes
- Check AAP allocations
- Verify budget balances

**Integration Method**:
- Manual CSV import (initial)
- API integration (future)

### Kundupei (Online Banking System)
**Type**: External
**Purpose**: Payment processing

**Integration Method**:
- Manual entry (current process)
- Store Kundupei reference numbers
- API integration (future enhancement)

---

## 📊 Reporting Requirements

### New Reports:

1. **Budget vs Actual by Department**
   - AAP allocation
   - YTD expenditure
   - Committed (pending GEs)
   - Available balance

2. **GE Processing Time Analysis**
   - Average approval time by amount
   - Bottleneck identification
   - Query rate by department

3. **Payment Tracking Report**
   - Pending payments
   - Overdue payments (> 5 days)
   - PGAS entry status

4. **Query Analysis**
   - Most common query reasons
   - Query resolution time
   - Repeat queries by user

---

**Version**: 1.0
**Date**: December 2025
**Status**: Requirements Documented - Ready for Implementation
