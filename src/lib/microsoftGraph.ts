// src/lib/microsoftGraph.ts
import "isomorphic-fetch";
import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";

const tenantId = process.env.M365_TENANT_ID;
const clientId = process.env.M365_CLIENT_ID;
const clientSecret = process.env.M365_CLIENT_SECRET;
const senderUserId = process.env.M365_SENDER_USER_ID;

// Check if Exchange 365 is configured
export function isExchangeConfigured(): boolean {
  return !!(tenantId && clientId && clientSecret && senderUserId);
}

// Build an authenticated Microsoft Graph client using client credentials
function getGraphClient() {
  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft 365 credentials not configured");
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);

  return Client.init({
    authProvider: async (done) => {
      try {
        const token = await credential.getToken("https://graph.microsoft.com/.default");
        done(null, token?.token || "");
      } catch (error) {
        done(error as Error, "");
      }
    },
  });
}

export interface EmailParams {
  to: string;
  subject: string;
  htmlBody: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Send an email via Exchange 365 using Microsoft Graph API
 */
export async function sendExchangeEmail(params: EmailParams) {
  if (!isExchangeConfigured()) {
    console.warn("Exchange 365 not configured - email not sent");
    return;
  }

  const client = getGraphClient();

  const message = {
    message: {
      subject: params.subject,
      body: {
        contentType: "HTML",
        content: params.htmlBody,
      },
      toRecipients: [
        {
          emailAddress: { address: params.to },
        },
      ],
      ccRecipients: (params.cc || []).map((addr) => ({
        emailAddress: { address: addr },
      })),
      bccRecipients: (params.bcc || []).map((addr) => ({
        emailAddress: { address: addr },
      })),
    },
    saveToSentItems: true,
  };

  try {
    // Use the configured sender mailbox (shared/service account)
    await client.api(`/users/${senderUserId}/sendMail`).post(message);
    console.log(`Email sent successfully to ${params.to}`);
  } catch (error) {
    console.error("Error sending Exchange email:", error);
    throw error;
  }
}
