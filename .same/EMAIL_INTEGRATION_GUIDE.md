# 📨 Email Notification Integration Guide

This guide shows exactly where and how to add email notifications to your existing UNRE GE Request workflow.

---

## 🎯 Integration Points

Email notifications should be triggered at these key points in the workflow:

1. **New GE Request Created** → Notify approver
2. **Request Approved** → Notify requestor & next approver
3. **Request Rejected** → Notify requestor
4. **Payment Voucher Created** → Notify bursary team
5. **Payment Processed** → Notify requestor

---

## 📍 Where to Add Email Calls

### Location 1: New Request Creation

**File**: `src/app/dashboard/requests/new/page.tsx` (or wherever you handle request submission)

**Current Code** (example):
```typescript
async function handleSubmit() {
  // Insert into database
  const { data, error } = await supabase
    .from('ge_requests')
    .insert({
      title: formData.title,
      amount: formData.amount,
      // ... other fields
    })
    .select()
    .single();

  if (error) throw error;

  toast.success("Request submitted successfully");
  router.push('/dashboard/requests');
}
```

**Updated Code with Email**:
```typescript
async function handleSubmit() {
  // Insert into database
  const { data: request, error } = await supabase
    .from('ge_requests')
    .insert({
      title: formData.title,
      amount: formData.amount,
      created_by: user.id,
      status: 'pending',
      // ... other fields
    })
    .select()
    .single();

  if (error) throw error;

  // Get approver details
  const { data: approver } = await supabase
    .from('user_profiles')
    .select('email, full_name')
    .eq('id', request.approver_id) // Assuming you have approver_id
    .single();

  // Send email notification to approver
  try {
    await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'new_request',
        to: approver.email,
        data: {
          requestNumber: request.request_number,
          requestTitle: request.title,
          requesterName: user.full_name,
          requesterEmail: user.email,
          costCentre: formData.cost_centre_name,
          amount: request.total_amount,
          description: request.description,
        },
      }),
    });
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
    // Don't fail the request if email fails
  }

  toast.success("Request submitted successfully");
  router.push('/dashboard/requests');
}
```

---

### Location 2: Request Approval

**File**: `src/app/dashboard/approvals/page.tsx` (or approval handler)

**Current Code** (example):
```typescript
async function handleApprove(requestId: number) {
  const { error } = await supabase
    .from('ge_requests')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', requestId);

  if (error) throw error;
  toast.success("Request approved");
  loadRequests();
}
```

**Updated Code with Email**:
```typescript
async function handleApprove(requestId: number) {
  // Update request status
  const { data: request, error } = await supabase
    .from('ge_requests')
    .update({
      status: 'approved',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select(`
      *,
      requester:user_profiles!ge_requests_created_by_fkey(email, full_name),
      cost_centre:cost_centres(name)
    `)
    .single();

  if (error) throw error;

  // Send approval notification to requester
  try {
    await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'request_approved',
        to: request.requester.email,
        data: {
          requestNumber: request.request_number,
          requestTitle: request.title,
          requesterName: request.requester.full_name,
          costCentre: request.cost_centre.name,
          amount: request.total_amount,
          approverName: user.full_name,
        },
      }),
    });
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
  }

  toast.success("Request approved");
  loadRequests();
}
```

---

### Location 3: Request Rejection

**File**: `src/app/dashboard/approvals/page.tsx`

**Add to rejection handler**:
```typescript
async function handleReject(requestId: number, reason: string) {
  // Update request status
  const { data: request, error } = await supabase
    .from('ge_requests')
    .update({
      status: 'rejected',
      rejected_by: user.id,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason,
    })
    .eq('id', requestId)
    .select(`
      *,
      requester:user_profiles!ge_requests_created_by_fkey(email, full_name),
      cost_centre:cost_centres(name)
    `)
    .single();

  if (error) throw error;

  // Send rejection notification
  try {
    await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'request_rejected',
        to: request.requester.email,
        data: {
          requestNumber: request.request_number,
          requestTitle: request.title,
          requesterName: request.requester.full_name,
          costCentre: request.cost_centre.name,
          amount: request.total_amount,
          approverName: user.full_name,
          rejectionReason: reason,
        },
      }),
    });
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
  }

  toast.success("Request rejected");
  loadRequests();
}
```

---

### Location 4: Payment Voucher Creation

**File**: `src/app/dashboard/payments/page.tsx` or `src/components/payments/CreatePaymentVoucherDialog.tsx`

**Add after creating payment voucher**:
```typescript
async function createPaymentVoucher(commitmentId: number, paymentData: any) {
  // Create payment voucher
  const { data: voucher, error } = await supabase
    .from('payment_vouchers')
    .insert({
      commitment_id: commitmentId,
      voucher_number: generateVoucherNumber(),
      amount: paymentData.amount,
      payee_name: paymentData.payeeName,
      status: 'pending',
      // ... other fields
    })
    .select(`
      *,
      commitment:commitments(
        ge_request:ge_requests(
          request_number,
          title
        )
      )
    `)
    .single();

  if (error) throw error;

  // Get bursary team email (could be from settings or hardcoded)
  const bursaryEmail = 'bursary@unre.ac.pg';

  // Send notification to bursary team
  try {
    await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment_voucher_created',
        to: bursaryEmail,
        data: {
          voucherNumber: voucher.voucher_number,
          requestNumber: voucher.commitment.ge_request.request_number,
          requestTitle: voucher.commitment.ge_request.title,
          payeeName: voucher.payee_name,
          amount: voucher.amount,
        },
      }),
    });
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
  }

  return voucher;
}
```

---

### Location 5: Payment Processing

**File**: `src/components/payments/PaymentDetailModal.tsx` (in the processPayment function)

**Current Code** (around line 250):
```typescript
async function handleProcessPayment() {
  // ... existing payment processing code ...

  const result = await processPayment(paymentId, {
    bank_reference: bankReference,
    cheque_number: chequeNumber,
  });

  toast.success("Payment processed successfully");
  onClose();
}
```

**Updated Code**:
```typescript
async function handleProcessPayment() {
  // ... existing payment processing code ...

  const result = await processPayment(paymentId, {
    bank_reference: bankReference,
    cheque_number: chequeNumber,
  });

  // Get payment details for email
  const { data: paymentDetails } = await supabase
    .from('payment_vouchers')
    .select(`
      voucher_number,
      amount,
      payee_name,
      commitment:commitments(
        ge_request:ge_requests(
          request_number,
          title,
          requester:user_profiles!ge_requests_created_by_fkey(email, full_name)
        )
      )
    `)
    .eq('id', paymentId)
    .single();

  // Send notification to requester
  if (paymentDetails) {
    try {
      await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment_processed',
          to: paymentDetails.commitment.ge_request.requester.email,
          data: {
            voucherNumber: paymentDetails.voucher_number,
            requestNumber: paymentDetails.commitment.ge_request.request_number,
            requestTitle: paymentDetails.commitment.ge_request.title,
            payeeName: paymentDetails.payee_name,
            amount: paymentDetails.amount,
          },
        }),
      });
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }
  }

  toast.success("Payment processed successfully");
  onClose();
}
```

---

## 🛠️ Helper Function (Optional)

Create a reusable helper to simplify email sending:

**File**: `src/lib/notifications.ts` (new file)

```typescript
import { toast } from 'sonner';

export async function sendNotificationEmail(
  type: string,
  to: string,
  data: any
): Promise<boolean> {
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        to,
        data,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Email notification failed:', error);
      return false;
    }

    console.log(`Email notification sent: ${type} to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

// Usage example:
// await sendNotificationEmail('new_request', approver.email, requestData);
```

Then use it in your code:

```typescript
import { sendNotificationEmail } from '@/lib/notifications';

// Instead of fetch('/api/notifications/send-email', ...)
await sendNotificationEmail('new_request', approver.email, {
  requestNumber: request.request_number,
  requestTitle: request.title,
  // ... other data
});
```

---

## ✅ Testing Checklist

After adding email integrations, test each flow:

- [ ] Create a new GE request → Check if approver receives email
- [ ] Approve a request → Check if requester receives approval email
- [ ] Reject a request → Check if requester receives rejection email
- [ ] Create payment voucher → Check if bursary team receives email
- [ ] Process payment → Check if requester receives payment confirmation

---

## 🎨 Customizing Email Templates

To customize email templates, edit: `src/lib/emailTemplates.ts`

You can modify:
- **Colors**: Change the green theme color in `BASE_STYLE`
- **Logo**: Add university logo image
- **Content**: Adjust wording and structure
- **Footer**: Update contact information

Example customization:
```typescript
const BASE_STYLE = `
  <style>
    .header { background-color: #0066cc; } /* Change to UNRE brand color */
    .button { background-color: #0066cc; } /* Match button color */
  </style>
`;
```

---

## 🔔 Email Notification Settings

Consider adding a settings page where users can control their notification preferences:

```typescript
interface NotificationPreferences {
  email_on_request_submitted: boolean;
  email_on_request_approved: boolean;
  email_on_request_rejected: boolean;
  email_on_payment_created: boolean;
  email_on_payment_processed: boolean;
  email_on_budget_alert: boolean;
}
```

Store these in `user_profiles` table and check before sending emails.

---

## 📊 Monitoring Email Activity

### View Sent Emails

1. Check **Microsoft 365 Admin Center** → **Reports** → **Mail flow**
2. View **Sent Items** in the `bursary@unre.ac.pg` mailbox
3. Check application logs for "Email sent successfully" messages

### Track Email Delivery

- Most emails arrive within 1-2 minutes
- Check spam/junk folders if not received
- Verify recipient email addresses are correct

---

## 🚨 Error Handling Best Practices

1. **Always wrap email calls in try-catch**
   ```typescript
   try {
     await sendNotificationEmail(...);
   } catch (error) {
     console.error('Email failed:', error);
     // Don't throw - email failure shouldn't break the main flow
   }
   ```

2. **Don't block main operations**
   - Email is supplementary, not critical
   - If email fails, the request should still be created/updated

3. **Log email failures**
   ```typescript
   console.error('Failed to send email:', {
     type: 'new_request',
     to: approver.email,
     error: error.message,
   });
   ```

4. **Provide fallback**
   - Still show success toast even if email fails
   - Users can check the dashboard for updates

---

## 🎓 For Developers

### Email Flow Summary

```
User Action → Database Update → Email Notification
     ↓              ↓                    ↓
  Submit        ge_requests        Approver Email
  Approve       status update      Requester Email
  Reject        status update      Requester Email
  Create PV     payment_vouchers   Bursary Email
  Process PV    status update      Requester Email
```

### File Structure

```
src/
├── lib/
│   ├── microsoftGraph.ts       # Graph API client
│   ├── emailTemplates.ts       # Email HTML templates
│   └── notifications.ts        # Helper functions (optional)
├── app/
│   └── api/
│       └── notifications/
│           └── send-email/
│               └── route.ts    # API endpoint
```

---

## 📚 Next Steps

1. ✅ Complete Azure AD setup (see `EXCHANGE_365_SETUP.md`)
2. ✅ Add environment variables
3. ✅ Integrate email calls at the 5 key points above
4. ✅ Test each notification type
5. ✅ Customize email templates if needed
6. ✅ Monitor email delivery
7. ✅ (Optional) Add user notification preferences

---

**Need Help?**
- Check `EXCHANGE_365_SETUP.md` for Azure configuration
- Review `src/lib/emailTemplates.ts` for template customization
- Test using `/api/notifications/send-email` endpoint

---

**Last Updated**: November 2025
**Version**: 1.0
