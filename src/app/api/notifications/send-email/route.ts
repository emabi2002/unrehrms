// src/app/api/notifications/send-email/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sendExchangeEmail, isExchangeConfigured } from "@/lib/microsoftGraph";
import {
  newRequestSubmittedEmail,
  requestApprovedEmail,
  requestRejectedEmail,
  paymentVoucherCreatedEmail,
  paymentProcessedEmail,
} from "@/lib/emailTemplates";

export async function POST(req: NextRequest) {
  try {
    // Check if Exchange is configured
    if (!isExchangeConfigured()) {
      return NextResponse.json(
        {
          error: "Exchange 365 not configured. Please add M365 environment variables.",
          configured: false,
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const { type, to, data, cc, bcc } = body;

    if (!to || !type || !data) {
      return NextResponse.json(
        { error: "Missing required fields: to, type, data" },
        { status: 400 }
      );
    }

    let subject: string;
    let htmlBody: string;

    // Generate email based on type
    switch (type) {
      case "new_request":
        subject = `New GE Request: ${data.requestNumber}`;
        htmlBody = newRequestSubmittedEmail(data);
        break;

      case "request_approved":
        subject = `GE Request Approved: ${data.requestNumber}`;
        htmlBody = requestApprovedEmail(data);
        break;

      case "request_rejected":
        subject = `GE Request Rejected: ${data.requestNumber}`;
        htmlBody = requestRejectedEmail(data);
        break;

      case "payment_voucher_created":
        subject = `Payment Voucher Created: ${data.voucherNumber}`;
        htmlBody = paymentVoucherCreatedEmail(data);
        break;

      case "payment_processed":
        subject = `Payment Processed: ${data.voucherNumber}`;
        htmlBody = paymentProcessedEmail(data);
        break;

      case "custom":
        // Allow custom emails
        if (!body.subject || !body.htmlBody) {
          return NextResponse.json(
            { error: "Custom email requires subject and htmlBody" },
            { status: 400 }
          );
        }
        subject = body.subject;
        htmlBody = body.htmlBody;
        break;

      default:
        return NextResponse.json(
          { error: `Unknown email type: ${type}` },
          { status: 400 }
        );
    }

    // Send the email
    await sendExchangeEmail({
      to,
      subject,
      htmlBody,
      cc,
      bcc,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Error sending Exchange email:", error);
    return NextResponse.json(
      {
        error: "Failed to send email",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check if Exchange is configured
export async function GET() {
  return NextResponse.json({
    configured: isExchangeConfigured(),
    message: isExchangeConfigured()
      ? "Exchange 365 is configured"
      : "Exchange 365 not configured. Add M365 environment variables.",
  });
}
