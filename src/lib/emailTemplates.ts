// src/lib/emailTemplates.ts

interface RequestEmailData {
  requestNumber: string;
  requestTitle: string;
  requesterName: string;
  requesterEmail: string;
  costCentre: string;
  amount: number;
  description?: string;
  approverName?: string;
  rejectionReason?: string;
  systemUrl?: string;
}

interface PaymentEmailData {
  requestNumber: string;
  voucherNumber: string;
  amount: number;
  payeeName: string;
  requestTitle: string;
  systemUrl?: string;
}

// New interfaces for workflow notifications
interface ApprovalNotificationData {
  requestNumber: string;
  requesterName: string;
  title: string;
  amount: number;
  approverRole: string;
  requestId: number;
}

interface QueryNotificationData {
  requestNumber: string;
  requesterId: string;
  title: string;
  queryReason: string;
  approverRole: string;
}

interface ApprovedNotificationData {
  requestNumber: string;
  requesterId: string;
  title: string;
  amount: number;
}

interface DeniedNotificationData {
  requestNumber: string;
  requesterId: string;
  title: string;
  denialReason: string;
  approverRole: string;
}

interface PaymentConfirmationData {
  requestNumber: string;
  requesterId: string;
  title: string;
  amount: number;
  paymentReference: string;
}

const BASE_STYLE = `
  <style>
    body { font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #166534; color: white; padding: 20px; text-align: center; }
    .content { background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; }
    .details { background-color: #f8fafc; padding: 15px; margin: 20px 0; border-left: 4px solid #166534; }
    .detail-row { margin: 10px 0; }
    .detail-label { font-weight: bold; color: #475569; }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background-color: #166534;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      color: #64748b;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
  </style>
`;

/**
 * Email sent when a new GE request is submitted
 */
export function newRequestSubmittedEmail(data: RequestEmailData): string {
  const systemUrl = data.systemUrl || "https://unre-bursary.netlify.app";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New GE Request Submitted</h1>
        </div>
        <div class="content">
          <p>Dear Approver,</p>

          <p>A new General Expenses (GE) request has been submitted for your review and approval.</p>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.requestTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Requested By:</span> ${data.requesterName} (${data.requesterEmail})
            </div>
            <div class="detail-row">
              <span class="detail-label">Cost Centre:</span> ${data.costCentre}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            ${data.description ? `
            <div class="detail-row">
              <span class="detail-label">Description:</span><br/>
              ${data.description}
            </div>
            ` : ""}
          </div>

          <p>Please log into the UNRE Bursary System to review and process this request.</p>

          <a href="${systemUrl}/dashboard/approvals" class="button">View Request</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated message from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email sent when a GE request is approved
 */
export function requestApprovedEmail(data: RequestEmailData): string {
  const systemUrl = data.systemUrl || "https://unre-bursary.netlify.app";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #16a34a;">
          <h1>✓ GE Request Approved</h1>
        </div>
        <div class="content">
          <p>Dear ${data.requesterName},</p>

          <p>Good news! Your GE request has been approved${data.approverName ? ` by ${data.approverName}` : ""}.</p>

          <div class="details" style="border-left-color: #16a34a;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.requestTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Cost Centre:</span> ${data.costCentre}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <p>Your request will now proceed to the next stage of processing.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #16a34a;">View Request Status</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated message from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email sent when a GE request is rejected
 */
export function requestRejectedEmail(data: RequestEmailData): string {
  const systemUrl = data.systemUrl || "https://unre-bursary.netlify.app";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #dc2626;">
          <h1>GE Request Not Approved</h1>
        </div>
        <div class="content">
          <p>Dear ${data.requesterName},</p>

          <p>Your GE request has not been approved${data.approverName ? ` by ${data.approverName}` : ""}.</p>

          <div class="details" style="border-left-color: #dc2626;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.requestTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Cost Centre:</span> ${data.costCentre}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            ${data.rejectionReason ? `
            <div class="detail-row">
              <span class="detail-label">Reason:</span><br/>
              ${data.rejectionReason}
            </div>
            ` : ""}
          </div>

          <p>Please review the feedback and resubmit your request if necessary.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #dc2626;">View Request</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated message from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email sent when a payment voucher is created
 */
export function paymentVoucherCreatedEmail(data: PaymentEmailData): string {
  const systemUrl = data.systemUrl || "https://unre-bursary.netlify.app";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #0891b2;">
          <h1>Payment Voucher Created</h1>
        </div>
        <div class="content">
          <p>Dear Finance Team,</p>

          <p>A payment voucher has been created and is ready for processing.</p>

          <div class="details" style="border-left-color: #0891b2;">
            <div class="detail-row">
              <span class="detail-label">Voucher Number:</span> ${data.voucherNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Request Title:</span> ${data.requestTitle}
            </div>
            <div class="detail-row">
              <span class="detail-label">Payee Name:</span> ${data.payeeName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <p>Please log into the system to review and process this payment.</p>

          <a href="${systemUrl}/dashboard/payments" class="button" style="background-color: #0891b2;">View Payment</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated message from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Email sent when a payment is processed
 */
export function paymentProcessedEmail(data: PaymentEmailData): string {
  const systemUrl = data.systemUrl || "https://unre-bursary.netlify.app";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #16a34a;">
          <h1>✓ Payment Processed</h1>
        </div>
        <div class="content">
          <p>Dear Requestor,</p>

          <p>Your payment has been processed successfully.</p>

          <div class="details" style="border-left-color: #16a34a;">
            <div class="detail-row">
              <span class="detail-label">Voucher Number:</span> ${data.voucherNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Payee Name:</span> ${data.payeeName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <p>The payment has been completed and recorded in the system.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #16a34a;">View Request</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated message from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send approval notification to next approver (Replaces Teams/Outlook notifications)
 */
export async function sendApprovalNotification(data: ApprovalNotificationData) {
  const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unre-bursary.netlify.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏳ Approval Required</h1>
        </div>
        <div class="content">
          <p>Dear ${data.approverRole},</p>

          <p>A General Expenses (GE) request requires your approval.</p>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Requested By:</span> ${data.requesterName}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div class="detail-row">
              <span class="detail-label">Your Role:</span> ${data.approverRole}
            </div>
          </div>

          <p><strong>Action Required:</strong> Please review and approve or query this request in the system.</p>

          <a href="${systemUrl}/dashboard/approvals" class="button">Review & Approve</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated notification from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via API route
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '', // Will be determined by role in API
        subject: `Approval Required: ${data.requestNumber} - ${data.title}`,
        html: emailHtml,
        recipientRole: data.approverRole
      })
    });

    if (!response.ok) {
      console.error('Failed to send approval notification');
    }
  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
}

/**
 * Send query notification to requester (Replaces Power Automate query email)
 */
export async function sendQueryNotification(data: QueryNotificationData) {
  const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unre-bursary.netlify.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #f59e0b;">
          <h1>❓ Request Requires Clarification</h1>
        </div>
        <div class="content">
          <p>Dear Requestor,</p>

          <p>Your GE request has been queried by ${data.approverRole} and requires corrections or additional information.</p>

          <div class="details" style="border-left-color: #f59e0b;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Queried By:</span> ${data.approverRole}
            </div>
            <div class="detail-row">
              <span class="detail-label">Query/Reason:</span><br/>
              <div style="background-color: #fffbeb; padding: 10px; margin-top: 5px; border-radius: 4px;">
                ${data.queryReason}
              </div>
            </div>
          </div>

          <p><strong>Action Required:</strong> Please review the query, make the necessary corrections, and resubmit your request.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #f59e0b;">View & Correct Request</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated notification from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via API route
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.requesterId,
        subject: `Request Queried: ${data.requestNumber} - ${data.title}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      console.error('Failed to send query notification');
    }
  } catch (error) {
    console.error('Error sending query notification:', error);
  }
}

/**
 * Send approved notification to requester and accounts (Replaces Power Automate approval email)
 */
export async function sendApprovedNotification(data: ApprovedNotificationData) {
  const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unre-bursary.netlify.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #16a34a;">
          <h1>✅ Request Approved!</h1>
        </div>
        <div class="content">
          <p>Dear Requestor,</p>

          <p><strong>Great news!</strong> Your GE request has been fully approved and is now being forwarded to Accounts for payment processing.</p>

          <div class="details" style="border-left-color: #16a34a;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span> <span style="color: #16a34a; font-weight: bold;">Approved - Forwarded to Accounts</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expected Payment:</span> Within 5 business days
            </div>
          </div>

          <p>The Finance team will process your payment within the next 5 business days. You will receive a confirmation email once the payment is completed.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #16a34a;">Track Request Status</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated notification from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email to requester and accounts
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.requesterId,
        subject: `✅ Request Approved: ${data.requestNumber} - ${data.title}`,
        html: emailHtml,
        ccRoles: ['Accounts/Finance Officer'] // CC to accounts team
      })
    });

    if (!response.ok) {
      console.error('Failed to send approved notification');
    }
  } catch (error) {
    console.error('Error sending approved notification:', error);
  }
}

/**
 * Send denied notification to requester (Replaces Power Automate denial email)
 */
export async function sendDeniedNotification(data: DeniedNotificationData) {
  const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unre-bursary.netlify.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #dc2626;">
          <h1>❌ Request Not Approved</h1>
        </div>
        <div class="content">
          <p>Dear Requestor,</p>

          <p>Your GE request has not been approved by ${data.approverRole}.</p>

          <div class="details" style="border-left-color: #dc2626;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Denied By:</span> ${data.approverRole}
            </div>
            <div class="detail-row">
              <span class="detail-label">Reason for Denial:</span><br/>
              <div style="background-color: #fef2f2; padding: 10px; margin-top: 5px; border-radius: 4px; color: #991b1b;">
                ${data.denialReason}
              </div>
            </div>
          </div>

          <p>If you believe this decision should be reconsidered, please contact ${data.approverRole} or submit a new request with the necessary adjustments.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #dc2626;">View Request</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated notification from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via API route
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.requesterId,
        subject: `❌ Request Denied: ${data.requestNumber} - ${data.title}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      console.error('Failed to send denied notification');
    }
  } catch (error) {
    console.error('Error sending denied notification:', error);
  }
}

/**
 * Send payment confirmation to requester (Replaces Teams notification)
 */
export async function sendPaymentConfirmation(data: PaymentConfirmationData) {
  const systemUrl = process.env.NEXT_PUBLIC_APP_URL || "https://unre-bursary.netlify.app";

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      ${BASE_STYLE}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background-color: #16a34a;">
          <h1>💰 Payment Completed!</h1>
        </div>
        <div class="content">
          <p>Dear Requestor,</p>

          <p><strong>Great news!</strong> Your payment has been successfully processed and completed.</p>

          <div class="details" style="border-left-color: #16a34a;">
            <div class="detail-row">
              <span class="detail-label">Request Number:</span> ${data.requestNumber}
            </div>
            <div class="detail-row">
              <span class="detail-label">Title:</span> ${data.title}
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span> PGK ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Reference:</span> <span style="font-family: monospace; background-color: #f0fdf4; padding: 2px 8px; border-radius: 4px;">${data.paymentReference}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Date:</span> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <p>The payment has been completed and all records have been updated in the system. Please keep this email for your records.</p>

          <a href="${systemUrl}/dashboard/requests" class="button" style="background-color: #16a34a;">View Request Details</a>

          <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
            This is an automated confirmation from the UNRE GE Request & Budget Control System.
          </p>
        </div>
        <div class="footer">
          <p>University of Natural Resources & Environment of PNG</p>
          <p>GE Request & Budget Control System v1.0</p>
          <p style="margin-top: 10px; color: #94a3b8;">
            For payment queries, contact: accounts@unre.ac.pg
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Send email via API route
  try {
    const response = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: data.requesterId,
        subject: `💰 Payment Completed: ${data.requestNumber} - ${data.title}`,
        html: emailHtml
      })
    });

    if (!response.ok) {
      console.error('Failed to send payment confirmation');
    }
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}
