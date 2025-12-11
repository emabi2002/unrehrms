# Commitments & Payments Management Guide

## 📋 Overview

This guide covers the Commitments and Payments modules of the UNRE GE Request System. These modules handle the financial commitment tracking and payment processing after GE requests are approved.

---

## 🎯 Commitments Module

### Purpose
The Commitments module tracks budget commitments created from approved GE requests. It ensures:
- Budget is reserved when GE requests are approved
- Real-time tracking of committed vs paid amounts
- Proper budget line updates
- Status management (Open, Partial, Closed)

### Database Schema

**Table**: `commitments`

| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| ge_request_id | bigint | Reference to GE request |
| commitment_number | text | Auto-generated (COM-YYYY-XXXXXX) |
| amount | numeric(18,2) | Total commitment amount |
| budget_line_id | bigint | Reference to budget line |
| cost_centre_id | bigint | Reference to cost centre |
| financial_year | int | Financial year |
| status | text | 'Open', 'Partial', 'Closed' |
| remaining_amount | numeric(18,2) | Unpaid amount |
| created_by | uuid | User who created |
| created_at | timestamptz | Creation timestamp |

### Key Functions

#### 1. **getAllCommitments()**
Fetches all commitments with related data.

```typescript
import { getAllCommitments } from '@/lib/commitments';

const commitments = await getAllCommitments();
// Returns array of commitments with joined data
```

**Returns**: Array of commitment objects with:
- GE request details (request_number, title)
- Budget line details (description, PGAS code)
- Cost centre details (code, name)
- Creator details (full_name)

#### 2. **getCommitmentById(id)**
Fetches a single commitment with full details.

```typescript
import { getCommitmentById } from '@/lib/commitments';

const commitment = await getCommitmentById(123);
```

#### 3. **createCommitment(geRequestId, userId)**
Creates a new commitment after GE request approval.

```typescript
import { createCommitment } from '@/lib/commitments';

const commitment = await createCommitment(geRequestId, userId);
// Automatically generates commitment number
// Links to budget line and cost centre from GE request
```

**Process**:
1. Fetches GE request details
2. Generates unique commitment number (COM-YYYY-XXXXXX)
3. Creates commitment record
4. Updates budget line committed amount (via trigger)

#### 4. **updateCommitmentStatus(commitmentId)**
Updates commitment status based on payments made.

```typescript
import { updateCommitmentStatus } from '@/lib/commitments';

const { remaining, status } = await updateCommitmentStatus(commitmentId);
```

**Status Logic**:
- `Open`: No payments made (remaining = total)
- `Partial`: Some payments made (0 < remaining < total)
- `Closed`: Fully paid (remaining = 0)

#### 5. **getCommitmentStats()**
Gets summary statistics for all commitments.

```typescript
import { getCommitmentStats } from '@/lib/commitments';

const stats = await getCommitmentStats();
// Returns: total_committed, total_paid, total_remaining,
//          open_count, partial_count, closed_count
```

---

## 💳 Payments Module

### Purpose
The Payments module handles payment voucher creation, approval, and processing. It provides:
- Payment voucher generation
- Multi-step approval workflow
- Payment recording (EFT, Cheque, Cash)
- Commitment status updates
- Audit trail logging

### Database Schema

**Table**: `payment_vouchers`

| Column | Type | Description |
|--------|------|-------------|
| id | bigserial | Primary key |
| voucher_number | text | Auto-generated (PV-YYYY-XXXXXX) |
| ge_request_id | bigint | Reference to GE request |
| commitment_id | bigint | Reference to commitment |
| payee_name | text | Name of payee |
| payment_date | date | Scheduled/actual payment date |
| payment_method | text | 'EFT', 'Cheque', 'Cash', 'Pending' |
| bank_name | text | Bank name (for EFT) |
| account_number | text | Account number |
| cheque_number | text | Cheque number (if applicable) |
| bank_reference | text | Bank transaction reference |
| amount | numeric(18,2) | Payment amount |
| description | text | Payment description |
| status | text | 'Pending', 'Approved', 'Paid', 'Cancelled' |
| approved_by | uuid | Approver user ID |
| processed_by | uuid | Processor user ID |
| paid_at | timestamptz | Payment completion timestamp |
| created_at | timestamptz | Creation timestamp |

### Key Functions

#### 1. **getAllPaymentVouchers()**
Fetches all payment vouchers with related data.

```typescript
import { getAllPaymentVouchers } from '@/lib/payments';

const payments = await getAllPaymentVouchers();
```

**Returns**: Array of payment vouchers with:
- GE request details
- Commitment details
- Approver and processor details

#### 2. **createPaymentVoucher(input, userId)**
Creates a new payment voucher.

```typescript
import { createPaymentVoucher } from '@/lib/payments';

const payment = await createPaymentVoucher({
  ge_request_id: 123,
  commitment_id: 45,
  payee_name: "Brian Bell Ltd",
  amount: 15000,
  payment_method: "EFT",
  bank_name: "Bank South Pacific",
  account_number: "1234567890",
  description: "Payment for office supplies",
  payment_date: "2025-01-25"
}, userId);
```

**Process**:
1. Generates unique voucher number (PV-YYYY-XXXXXX)
2. Creates payment voucher with status 'Pending'
3. Logs audit trail

#### 3. **approvePaymentVoucher(voucherId, userId)**
Approves a pending payment voucher.

```typescript
import { approvePaymentVoucher } from '@/lib/payments';

const payment = await approvePaymentVoucher(voucherId, userId);
// Changes status from 'Pending' to 'Approved'
```

#### 4. **processPayment(voucherId, userId, bankReference?, chequeNumber?)**
Processes an approved payment (marks as paid).

```typescript
import { processPayment } from '@/lib/payments';

const payment = await processPayment(
  voucherId,
  userId,
  "EFT20250125-001", // bank reference
  null // cheque number (if applicable)
);
```

**Process**:
1. Updates payment status to 'Paid'
2. Records payment timestamp
3. Updates commitment status
4. Updates GE request status to 'paid'
5. Logs audit trail

#### 5. **cancelPaymentVoucher(voucherId, userId, reason)**
Cancels a payment voucher.

```typescript
import { cancelPaymentVoucher } from '@/lib/payments';

const payment = await cancelPaymentVoucher(
  voucherId,
  userId,
  "Supplier changed, new voucher created"
);
```

#### 6. **getPaymentStats()**
Gets summary statistics for all payments.

```typescript
import { getPaymentStats } from '@/lib/payments';

const stats = await getPaymentStats();
// Returns: total_count, total_paid, total_pending,
//          paid_count, pending_count, approved_count,
//          eft_count, cheque_count, cash_count
```

---

## 🔄 Workflow Integration

### Complete GE Request → Payment Flow

```mermaid
graph LR
    A[GE Request Created] --> B[Multi-level Approval]
    B --> C[Approved]
    C --> D[Create Commitment]
    D --> E[Budget Reserved]
    E --> F[Create Payment Voucher]
    F --> G[Approve Payment]
    G --> H[Process Payment]
    H --> I[Update Commitment Status]
    I --> J[Complete]
```

### Integration Points

#### 1. **After GE Request Approval**
When a GE request reaches final approval:

```typescript
// In approval workflow
if (finalApproval) {
  // Create commitment
  const commitment = await createCommitment(geRequestId, userId);

  // Update GE request status
  await supabase
    .from('ge_requests')
    .update({ status: 'committed', commitment_id: commitment.id })
    .eq('id', geRequestId);
}
```

#### 2. **Creating Payment Voucher**
After commitment is created:

```typescript
// Fetch commitment details
const commitment = await getCommitmentById(commitmentId);

// Create payment voucher
const payment = await createPaymentVoucher({
  ge_request_id: commitment.ge_request_id,
  commitment_id: commitment.id,
  payee_name: supplierName,
  amount: commitment.amount,
  payment_method: "EFT",
  // ... other details
}, userId);
```

#### 3. **Processing Payment**
When payment is made:

```typescript
// Process the payment
const payment = await processPayment(
  voucherId,
  userId,
  bankReference,
  chequeNumber
);

// Commitment status automatically updates
// GE request status automatically updates to 'paid'
```

---

## 📊 UI Components

### Commitments Page (`/dashboard/commitments`)

**Features**:
- Summary cards showing total committed, paid, remaining
- Filterable commitment list
- Search by commitment number, GE request number, or title
- Status filtering (Open, Partial, Closed)
- Commitment status summary breakdown

**Data Flow**:
```typescript
// Page loads commitments on mount
useEffect(() => {
  loadCommitments();
  loadStats();
}, []);

async function loadCommitments() {
  const data = await getAllCommitments();
  setCommitments(data);
}

async function loadStats() {
  const data = await getCommitmentStats();
  setStats(data);
}
```

### Payments Page (`/dashboard/payments`)

**Features**:
- Summary cards showing total payments, paid, pending
- Payment voucher list with filtering
- Search by voucher number, GE request number, payee
- Status filtering (Paid, Approved, Pending)
- Payment method breakdown (EFT, Cheque, Cash)
- Quick actions (View, Process)

**Data Flow**:
```typescript
// Page loads payments on mount
useEffect(() => {
  loadPayments();
  loadStats();
}, []);

async function loadPayments() {
  const data = await getAllPaymentVouchers();
  setPayments(data);
}

async function loadStats() {
  const data = await getPaymentStats();
  setStats(data);
}
```

---

## 🔐 Security & Permissions

### Role-Based Access

| Role | Commitments | Payments |
|------|-------------|----------|
| System Admin | Full access | Full access |
| Bursar | View all, Create | Approve, Process |
| Bursary Clerk | View own cost centre | Create, Process |
| Budget Officer | View all, Stats | View only |
| Requestor | View own | View own |
| Auditor | View all (read-only) | View all (read-only) |

### Implementation Example

```typescript
// Check user role before allowing payment approval
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('roles(name)')
  .eq('user_id', userId);

const hasApprovalRole = userRoles.some(
  r => ['Bursar', 'System Admin'].includes(r.roles.name)
);

if (hasApprovalRole) {
  await approvePaymentVoucher(voucherId, userId);
} else {
  throw new Error('Unauthorized');
}
```

---

## 📈 Reporting Features

### Commitment Reports

```typescript
// Get commitments by cost centre
const commitments = await getCommitmentsByCostCentre(costCentreId);

// Calculate utilization
const utilization = commitments.reduce((sum, c) => {
  return sum + ((c.amount - c.remaining_amount) / c.amount) * 100;
}, 0) / commitments.length;
```

### Payment Reports

```typescript
// Get payments by date range
const { data: payments } = await supabase
  .from('payment_vouchers')
  .select('*')
  .gte('paid_at', startDate)
  .lte('paid_at', endDate)
  .eq('status', 'Paid');

// Group by payment method
const byMethod = payments.reduce((acc, p) => {
  acc[p.payment_method] = (acc[p.payment_method] || 0) + p.amount;
  return acc;
}, {});
```

---

## ⚠️ Error Handling

### Common Errors

#### 1. **Insufficient Budget**
```typescript
// Check before creating commitment
const budgetLine = await supabase
  .from('budget_lines')
  .select('available_amount')
  .eq('id', budgetLineId)
  .single();

if (budgetLine.available_amount < requestAmount) {
  throw new Error('Insufficient budget balance');
}
```

#### 2. **Invalid Status Transition**
```typescript
// Validate payment status before processing
if (payment.status !== 'Approved') {
  throw new Error('Payment must be approved before processing');
}
```

#### 3. **Duplicate Payment**
```typescript
// Check if commitment already fully paid
if (commitment.status === 'Closed') {
  throw new Error('Commitment already fully paid');
}
```

---

## 🧪 Testing Guide

### Test Scenarios

#### Commitment Creation
1. Create GE request
2. Approve through workflow
3. Verify commitment created automatically
4. Check budget line committed_amount updated
5. Verify commitment number format (COM-2025-XXXXXX)

#### Payment Processing
1. Create payment voucher
2. Verify status = 'Pending'
3. Approve payment
4. Verify status = 'Approved'
5. Process payment
6. Verify status = 'Paid'
7. Check commitment remaining_amount updated
8. Check GE request status = 'paid'

#### Partial Payments
1. Create commitment for K 10,000
2. Create payment voucher for K 6,000
3. Process payment
4. Verify commitment status = 'Partial'
5. Verify remaining_amount = K 4,000

---

## 🔧 Maintenance

### Database Maintenance

```sql
-- Recalculate all commitment statuses
UPDATE commitments c
SET
  remaining_amount = c.amount - COALESCE(
    (SELECT SUM(pv.amount)
     FROM payment_vouchers pv
     WHERE pv.commitment_id = c.id
     AND pv.status = 'Paid'),
    0
  ),
  status = CASE
    WHEN c.amount = COALESCE(
      (SELECT SUM(pv.amount)
       FROM payment_vouchers pv
       WHERE pv.commitment_id = c.id
       AND pv.status = 'Paid'),
      0
    ) THEN 'Closed'
    WHEN COALESCE(
      (SELECT SUM(pv.amount)
       FROM payment_vouchers pv
       WHERE pv.commitment_id = c.id
       AND pv.status = 'Paid'),
      0
    ) > 0 THEN 'Partial'
    ELSE 'Open'
  END;
```

### Audit Log Queries

```sql
-- View all payment processing activities
SELECT
  al.*,
  up.full_name as user_name,
  pv.voucher_number
FROM audit_logs al
JOIN user_profiles up ON al.user_id = up.id
LEFT JOIN payment_vouchers pv ON al.entity_id = pv.id
WHERE al.entity_type = 'payment_vouchers'
  AND al.action = 'PROCESS_PAYMENT'
ORDER BY al.created_at DESC;
```

---

## 📝 Notes

### Type Assertions
The current implementation uses TypeScript type assertions (`as any`) to work around missing database type definitions. To fix:

```bash
# Generate Supabase types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
```

### Future Enhancements
1. **Batch Payments**: Process multiple payments at once
2. **Payment Scheduling**: Schedule future payments
3. **Recurring Payments**: Set up automatic recurring payments
4. **Payment Reversals**: Handle payment cancellations/reversals
5. **Payment Reconciliation**: Match bank statements with payments
6. **Multi-currency Support**: Handle payments in different currencies

---

## 🆘 Support

For issues or questions:
- Check audit logs for transaction history
- Review database triggers and functions
- Contact system administrator
- Email: support@unre.ac.pg

---

**Last Updated**: January 2025
**Version**: 7.0
**Status**: Production Ready ✅
