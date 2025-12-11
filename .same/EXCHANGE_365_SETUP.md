# 📧 Exchange 365 Integration Guide

Complete guide for setting up Microsoft Exchange 365 email notifications in the UNRE GE Request System.

---

## 🎯 What This Integration Does

The Exchange 365 integration enables the UNRE Bursary System to send automatic email notifications for:

✅ **New GE Request Submitted** - Notify approvers when a request is created
✅ **Request Approved** - Notify requestor when approved
✅ **Request Rejected** - Notify requestor with reason
✅ **Payment Voucher Created** - Notify bursary team
✅ **Payment Processed** - Notify requestor when payment is complete

All emails are sent from a university mailbox (e.g., `bursary@unre.ac.pg` or `no-reply@unre.ac.pg`).

---

## 📋 Prerequisites

Before starting, ensure you have:

- Access to **Azure Portal** (Microsoft 365 Admin Center)
- A **shared mailbox** or **service account** (e.g., `bursary@unre.ac.pg`)
- **Global Administrator** or **Application Administrator** role in Azure AD

---

## 🔧 Part 1: Azure / Microsoft 365 Setup

### Step 1: Register Application in Azure AD

1. Go to **[Azure Portal](https://portal.azure.com)**
2. Navigate to **Microsoft Entra ID** (formerly Azure AD) > **App registrations**
3. Click **"New registration"**
4. Configure:
   - **Name**: `UNRE Bursary System`
   - **Supported account types**: "Accounts in this organizational directory only (Single tenant)"
   - **Redirect URI**: Leave blank (not needed for daemon apps)
5. Click **"Register"**
6. **Note down** the following values:
   - **Application (client) ID** → This is your `M365_CLIENT_ID`
   - **Directory (tenant) ID** → This is your `M365_TENANT_ID`

### Step 2: Create Client Secret

1. In your app registration, go to **Certificates & secrets**
2. Click **"New client secret"**
3. Add description: `UNRE Bursary System Secret`
4. Set expiration: **24 months** (recommended)
5. Click **"Add"**
6. **IMMEDIATELY COPY THE VALUE** → This is your `M365_CLIENT_SECRET`
   - ⚠️ **Important**: You can only see this value once! Store it securely.

### Step 3: Grant API Permissions

1. Go to **API permissions** in your app
2. Click **"Add a permission"**
3. Select **"Microsoft Graph"**
4. Choose **"Application permissions"** (not delegated)
5. Add the following permissions:
   - ✅ `Mail.Send` - Send mail as any user
   - ✅ (Optional) `Mail.Read` - Read mail in all mailboxes
   - ✅ (Optional) `Calendars.ReadWrite` - For future calendar integration
6. Click **"Add permissions"**
7. **IMPORTANT**: Click **"Grant admin consent for [Your Organization]"**
   - This must be done by a Global Admin
   - Wait for green checkmarks to appear

### Step 4: Configure Sender Mailbox

You need to decide which mailbox will send emails. Options:

**Option A: Shared Mailbox** (Recommended)
- Create a shared mailbox: `bursary@unre.ac.pg`
- No license required for shared mailboxes
- Multiple people can monitor replies

**Option B: Service Account**
- Create a user: `finance.system@unre.ac.pg`
- Requires a license (or use a free account)
- Dedicated for system emails

**To create a shared mailbox:**
1. Go to **Microsoft 365 Admin Center**
2. Navigate to **Teams & groups** > **Shared mailboxes**
3. Click **"Add a shared mailbox"**
4. Name: `UNRE Bursary System`
5. Email: `bursary@unre.ac.pg`
6. **Note down the email address** → This is your `M365_SENDER_USER_ID`

---

## 🔐 Part 2: Configure Environment Variables

### In Production (Netlify/Vercel)

1. Go to your deployment dashboard (Netlify/Vercel)
2. Navigate to **Site settings** > **Environment variables**
3. Add the following variables:

```env
M365_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
M365_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
M365_CLIENT_SECRET=your-long-secret-value-here
M365_SENDER_USER_ID=bursary@unre.ac.pg
```

4. **Redeploy** your application to pick up the new variables

### In Development (Local)

Add to your `.env.local` file (already exists):

```env
# Microsoft 365 / Exchange Online Configuration
M365_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
M365_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
M365_CLIENT_SECRET=your-long-secret-value-here
M365_SENDER_USER_ID=bursary@unre.ac.pg
```

⚠️ **Never commit `.env.local` to Git!** (It's already in `.gitignore`)

---

## 🧪 Part 3: Test the Integration

### Test 1: Check Configuration

Visit: `https://your-domain.com/api/notifications/send-email` (GET request)

Expected response:
```json
{
  "configured": true,
  "message": "Exchange 365 is configured"
}
```

### Test 2: Send a Test Email

Use the API route or integrate into your code:

```typescript
// Example: Send a test email
await fetch('/api/notifications/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'custom',
    to: 'your-email@unre.ac.pg',
    subject: 'Test Email from UNRE Bursary System',
    htmlBody: '<h1>Test Email</h1><p>Exchange 365 integration is working!</p>',
  }),
});
```

### Test 3: Verify Email Sent

1. Check the recipient's inbox
2. Check the **Sent Items** folder of `bursary@unre.ac.pg`
3. Verify the email appears professional and branded

---

## 📨 Part 4: How to Use in Your Code

### Example 1: Send Email When Request is Submitted

```typescript
import { supabase } from '@/lib/supabase';

async function submitGERequest(requestData: any) {
  // 1. Insert request into database
  const { data: request, error } = await supabase
    .from('ge_requests')
    .insert(requestData)
    .select()
    .single();

  if (error) throw error;

  // 2. Send notification email to approver
  await fetch('/api/notifications/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'new_request',
      to: 'hod.agriculture@unre.ac.pg', // Approver's email
      data: {
        requestNumber: request.request_number,
        requestTitle: request.title,
        requesterName: 'John Doe',
        requesterEmail: 'john.doe@unre.ac.pg',
        costCentre: 'Agriculture Department',
        amount: request.total_amount,
        description: request.description,
      },
    }),
  });

  return request;
}
```

### Example 2: Send Email When Request is Approved

```typescript
async function approveRequest(requestId: number, approverId: string) {
  // 1. Update request status
  const { data: request } = await supabase
    .from('ge_requests')
    .update({ status: 'approved', approved_by: approverId })
    .eq('id', requestId)
    .select()
    .single();

  // 2. Get requester details
  const { data: requester } = await supabase
    .from('user_profiles')
    .select('full_name, email')
    .eq('id', request.created_by)
    .single();

  // 3. Get approver details
  const { data: approver } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', approverId)
    .single();

  // 4. Send notification to requester
  await fetch('/api/notifications/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'request_approved',
      to: requester.email,
      data: {
        requestNumber: request.request_number,
        requestTitle: request.title,
        requesterName: requester.full_name,
        costCentre: 'Agriculture Department',
        amount: request.total_amount,
        approverName: approver.full_name,
      },
    }),
  });
}
```

---

## 📧 Available Email Templates

### 1. New Request Submitted
```typescript
type: 'new_request'
```
Sent to approvers when a new GE request is created.

### 2. Request Approved
```typescript
type: 'request_approved'
```
Sent to requestor when their request is approved.

### 3. Request Rejected
```typescript
type: 'request_rejected'
```
Sent to requestor when their request is rejected.

### 4. Payment Voucher Created
```typescript
type: 'payment_voucher_created'
```
Sent to bursary team when a payment voucher is generated.

### 5. Payment Processed
```typescript
type: 'payment_processed'
```
Sent to requestor when payment is completed.

### 6. Custom Email
```typescript
type: 'custom',
subject: 'Your Subject',
htmlBody: '<p>Your HTML content</p>'
```

---

## 🔒 Security Best Practices

1. **Never expose secrets in client-side code**
   - All email sending happens server-side via API routes
   - Secrets are only in environment variables

2. **Use Application Permissions (not Delegated)**
   - Application permissions don't require user interaction
   - More secure for daemon/service scenarios

3. **Rotate secrets regularly**
   - Set expiration on client secrets (24 months recommended)
   - Create a reminder to renew before expiration

4. **Audit email logs**
   - Check Azure AD sign-in logs regularly
   - Monitor for unusual activity

5. **Limit permissions**
   - Only grant `Mail.Send` permission (minimum required)
   - Add other permissions only when needed

---

## 🚀 Part 5: Optional - Microsoft SSO (Future Enhancement)

For "Sign in with Microsoft 365" functionality:

### Overview
Allow staff to log in using their @unre.ac.pg Microsoft accounts.

### Setup Steps (High-level)

1. **Configure Supabase Azure Provider**
   - In Supabase Dashboard → Authentication → Providers
   - Enable "Azure"
   - Add your `CLIENT_ID` and `CLIENT_SECRET`
   - Set redirect URL to Supabase's callback

2. **Update Login Page**
   ```typescript
   const { data, error } = await supabase.auth.signInWithOAuth({
     provider: 'azure',
     options: {
       scopes: 'email openid profile',
       redirectTo: `${window.location.origin}/auth/callback`,
     },
   });
   ```

3. **Benefits**
   - Single sign-on experience
   - No separate passwords
   - Automatic user provisioning
   - Inherits Microsoft security policies

**Note**: This is optional and can be implemented later. The email integration works independently.

---

## 🆘 Troubleshooting

### Issue: "Exchange 365 not configured"

**Solution**: Check that all 4 environment variables are set:
```bash
M365_TENANT_ID
M365_CLIENT_ID
M365_CLIENT_SECRET
M365_SENDER_USER_ID
```

### Issue: "Failed to send email - Unauthorized"

**Possible causes**:
1. Client secret expired or incorrect
2. API permissions not granted
3. Admin consent not given

**Solution**:
- Verify credentials in Azure Portal
- Re-grant admin consent for `Mail.Send` permission
- Check if client secret has expired

### Issue: "The specified object was not found in the store"

**Cause**: The `M365_SENDER_USER_ID` doesn't exist or is incorrect.

**Solution**:
- Verify the email address exists in Microsoft 365
- Use the exact UPN (user principal name)
- For shared mailboxes, use the primary email address

### Issue: Email sent but not received

**Possible causes**:
1. Email in spam/junk folder
2. Email filtering rules
3. External email blocking

**Solution**:
- Check spam folder
- Add `bursary@unre.ac.pg` to safe senders
- Check Exchange transport rules
- Verify no mailbox rules are auto-deleting

---

## 📊 Monitoring & Logs

### View Email Logs

1. **Azure Portal**:
   - Go to **Microsoft Entra ID** > **Sign-in logs**
   - Filter by your application name
   - View successful/failed authentication attempts

2. **Microsoft 365 Admin Center**:
   - Go to **Reports** > **Exchange** > **Mailflow**
   - View sent messages from your service account

3. **Application Logs**:
   - Check your Netlify/Vercel logs
   - Look for "Email sent successfully" messages

---

## ✅ Checklist

- [ ] Azure AD app registered
- [ ] Client secret created and saved securely
- [ ] API permissions (`Mail.Send`) granted
- [ ] Admin consent given
- [ ] Sender mailbox created (`bursary@unre.ac.pg`)
- [ ] Environment variables added (development)
- [ ] Environment variables added (production)
- [ ] Application redeployed
- [ ] Test email sent successfully
- [ ] Email templates reviewed and approved
- [ ] Integration tested end-to-end

---

## 📚 Additional Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/)
- [Microsoft Graph Mail API](https://learn.microsoft.com/en-us/graph/api/user-sendmail)
- [Azure AD App Registration Guide](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Client Credentials Flow](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)

---

## 🎓 For UNRE IT Team

This integration requires:
1. **Azure AD Global Admin** - For app registration and consent
2. **Exchange Admin** - For creating/managing shared mailbox
3. **Application Admin** - For managing the app registration

**Estimated Setup Time**: 30-45 minutes

**Support Contact**: If you need assistance, contact the development team or Microsoft support.

---

**Last Updated**: November 2025
**Version**: 1.0
**Status**: Ready for Implementation
