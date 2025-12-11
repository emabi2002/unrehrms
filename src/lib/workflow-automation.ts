// @ts-nocheck
/**
 * Workflow Automation Service
 * Replicates Power Automate, SharePoint, and Microsoft Lists functionalities
 * for the UNRE GE Request & Budget Control System
 */

import { supabase } from './supabase';
import { sendApprovalNotification, sendQueryNotification, sendApprovedNotification, sendDeniedNotification, sendPaymentConfirmation } from './emailTemplates';

// Approval routing configuration based on amount thresholds
export const APPROVAL_ROUTING = {
  MANAGER: { role: 'Manager', minAmount: 0, maxAmount: Infinity },
  PROVC_PLANNING: { role: 'ProVC - Planning & Development', minAmount: 0, maxAmount: 5000 },
  VICE_CHANCELLOR: { role: 'Vice Chancellor', minAmount: 5001, maxAmount: Infinity },
  ACCOUNTS: { role: 'Accounts/Finance Officer', minAmount: 0, maxAmount: Infinity }
};

// Request statuses
export const REQUEST_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_MANAGER: 'Pending Manager Review',
  PENDING_PROVC: 'Pending ProVC Approval',
  PENDING_VC: 'Pending VC Approval',
  QUERIED: 'Queried',
  APPROVED: 'Approved',
  DENIED: 'Denied',
  PENDING_PAYMENT: 'Pending Payment',
  PROCESSING_PAYMENT: 'Processing Payment',
  PAID: 'Paid',
  CANCELLED: 'Cancelled'
};

// Payment processing SLA (5 business days)
export const PAYMENT_SLA_DAYS = 5;

/**
 * Auto-generate GE Request Number
 * Format: GE-YYYY-XXXXXX
 */
export async function generateRequestNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the latest request number for this year
  const { data, error } = await supabase
    .from('ge_requests')
    .select('request_number')
    .like('request_number', `GE-${year}-%`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching latest request number:', error);
    return `GE-${year}-000001`;
  }

  if (!data || data.length === 0) {
    return `GE-${year}-000001`;
  }

  // Extract the sequence number and increment
  const lastNumber = (data[0] as any).request_number;
  const sequence = parseInt(lastNumber.split('-')[2]) + 1;
  return `GE-${year}-${sequence.toString().padStart(6, '0')}`;
}

/**
 * Determine next approver based on amount and current status
 */
export function getNextApprover(amount: number, currentStatus: string): {
  role: string;
  nextStatus: string;
} {
  if (currentStatus === REQUEST_STATUS.DRAFT || currentStatus === REQUEST_STATUS.SUBMITTED) {
    return {
      role: APPROVAL_ROUTING.MANAGER.role,
      nextStatus: REQUEST_STATUS.PENDING_MANAGER
    };
  }

  if (currentStatus === REQUEST_STATUS.PENDING_MANAGER) {
    // Route based on amount
    if (amount <= APPROVAL_ROUTING.PROVC_PLANNING.maxAmount) {
      return {
        role: APPROVAL_ROUTING.PROVC_PLANNING.role,
        nextStatus: REQUEST_STATUS.PENDING_PROVC
      };
    } else {
      return {
        role: APPROVAL_ROUTING.VICE_CHANCELLOR.role,
        nextStatus: REQUEST_STATUS.PENDING_VC
      };
    }
  }

  if (currentStatus === REQUEST_STATUS.PENDING_PROVC || currentStatus === REQUEST_STATUS.PENDING_VC) {
    return {
      role: APPROVAL_ROUTING.ACCOUNTS.role,
      nextStatus: REQUEST_STATUS.APPROVED
    };
  }

  return { role: '', nextStatus: currentStatus };
}

/**
 * Submit GE Request - Replicate Power Automate submission workflow
 */
export async function submitGERequest(requestData: {
  requester_id: string;
  cost_centre_id: number;
  budget_line_id: number;
  expense_type_id: number;
  supplier_id?: number;
  title: string;
  description: string;
  justification: string;
  required_date?: string;
  total_amount: number;
  priority: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  quote_files?: File[];
}) {
  try {
    // Step 1: Auto-generate GE ID
    const requestNumber = await generateRequestNumber();

    // Step 2: Validate quote requirements (3 quotes needed)
    if (!requestData.quote_files || requestData.quote_files.length < 3) {
      throw new Error('Please upload 3 vendor quotes as required');
    }

    // Step 3: Determine next approver
    const { role: nextApproverRole, nextStatus } = getNextApprover(
      requestData.total_amount,
      REQUEST_STATUS.SUBMITTED
    );

    // Step 4: Create request in database
    const { data: request, error: requestError } = await supabase
      .from('ge_requests')
      .insert({
        request_number: requestNumber,
        requester_id: requestData.requester_id,
        cost_centre_id: requestData.cost_centre_id,
        budget_line_id: requestData.budget_line_id,
        expense_type_id: requestData.expense_type_id,
        supplier_id: requestData.supplier_id || null,
        title: requestData.title,
        description: requestData.description,
        justification: requestData.justification,
        required_date: requestData.required_date || null,
        total_amount: requestData.total_amount,
        status: nextStatus,
        current_approver_role: nextApproverRole,
        priority: requestData.priority,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (requestError) throw requestError;

    // Step 5: Add line items
    const itemsToInsert = requestData.items.map((item, index) => ({
      ge_request_id: request.id,
      item_number: index + 1,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_amount: item.quantity * item.unit_price,
      notes: null
    }));

    const { error: itemsError } = await supabase
      .from('ge_request_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // Step 6: Upload quote documents to storage
    // This would be handled by the file upload component

    // Step 7: Create initial approval record
    const { error: approvalError } = await supabase
      .from('ge_approvals')
      .insert({
        ge_request_id: request.id,
        approver_id: requestData.requester_id,
        role_name: 'Requester',
        approval_level: 0,
        action: 'Submitted',
        comments: 'Request submitted for approval',
        actioned_at: new Date().toISOString()
      });

    if (approvalError) throw approvalError;

    // Step 8: Send notification to next approver (replicate Teams/Outlook)
    await sendApprovalNotification({
      requestNumber,
      requesterName: '', // Will be fetched from user profile
      title: requestData.title,
      amount: requestData.total_amount,
      approverRole: nextApproverRole,
      requestId: request.id
    });

    // Step 9: Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: request.id,
      action: 'CREATE',
      user_id: requestData.requester_id,
      changes: { status: nextStatus, request_number: requestNumber }
    });

    return {
      success: true,
      requestNumber,
      requestId: request.id,
      nextApprover: nextApproverRole
    };

  } catch (error) {
    console.error('Error submitting GE request:', error);
    throw error;
  }
}

/**
 * Approve GE Request - Replicate Power Automate approval workflow
 */
export async function approveRequest(
  requestId: number,
  approverId: string,
  approverRole: string,
  comments?: string
) {
  try {
    // Step 1: Get current request
    const { data: request, error: fetchError } = await supabase
      .from('ge_requests')
      .select('*, ge_request_items(*)')
      .eq('id', requestId)
      .single();

    if (fetchError) throw fetchError;

    // Step 2: Determine next approver
    const { role: nextApproverRole, nextStatus } = getNextApprover(
      request.total_amount,
      request.status
    );

    // Step 3: Update request status
    const { error: updateError } = await supabase
      .from('ge_requests')
      .update({
        status: nextStatus,
        current_approver_role: nextApproverRole,
        approved_at: nextStatus === REQUEST_STATUS.APPROVED ? new Date().toISOString() : null
      })
      .eq('id', requestId);

    if (updateError) throw updateError;

    // Step 4: Record approval action
    const { error: approvalError } = await supabase
      .from('ge_approvals')
      .insert({
        ge_request_id: requestId,
        approver_id: approverId,
        role_name: approverRole,
        approval_level: getApprovalLevel(approverRole),
        action: 'Approved',
        comments: comments || 'Approved',
        actioned_at: new Date().toISOString()
      });

    if (approvalError) throw approvalError;

    // Step 5: Send notification to next approver or requester
    if (nextStatus === REQUEST_STATUS.APPROVED) {
      // Notify requester and accounts
      await sendApprovedNotification({
        requestNumber: request.request_number,
        requesterId: request.requester_id,
        title: request.title,
        amount: request.total_amount
      });

      // Auto-forward to accounts for payment processing
      await initiatePaymentProcessing(requestId);
    } else {
      // Notify next approver
      await sendApprovalNotification({
        requestNumber: request.request_number,
        requesterName: '', // Will be fetched
        title: request.title,
        amount: request.total_amount,
        approverRole: nextApproverRole,
        requestId
      });
    }

    // Step 6: Update budget line committed amount
    await updateBudgetCommitment(request.budget_line_id, request.total_amount, 'add');

    // Step 7: Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: requestId,
      action: 'UPDATE',
      user_id: approverId,
      changes: { status: nextStatus, approved_by: approverRole }
    });

    return { success: true, nextStatus, nextApprover: nextApproverRole };

  } catch (error) {
    console.error('Error approving request:', error);
    throw error;
  }
}

/**
 * Query/Return GE Request - Replicate Power Automate query workflow
 */
export async function queryRequest(
  requestId: number,
  approverId: string,
  approverRole: string,
  queryReason: string
) {
  try {
    // Step 1: Update request status to Queried
    const { data: request, error: updateError } = await supabase
      .from('ge_requests')
      .update({
        status: REQUEST_STATUS.QUERIED,
        current_approver_role: 'Requester'
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Step 2: Record query action
    await supabase.from('ge_approvals').insert({
      ge_request_id: requestId,
      approver_id: approverId,
      role_name: approverRole,
      approval_level: getApprovalLevel(approverRole),
      action: 'Queried',
      comments: queryReason,
      actioned_at: new Date().toISOString()
    });

    // Step 3: Send query notification to requester
    await sendQueryNotification({
      requestNumber: request.request_number,
      requesterId: request.requester_id,
      title: request.title,
      queryReason,
      approverRole
    });

    // Step 4: Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: requestId,
      action: 'UPDATE',
      user_id: approverId,
      changes: { status: REQUEST_STATUS.QUERIED, queried_by: approverRole }
    });

    return { success: true };

  } catch (error) {
    console.error('Error querying request:', error);
    throw error;
  }
}

/**
 * Deny GE Request - Replicate Power Automate denial workflow
 */
export async function denyRequest(
  requestId: number,
  approverId: string,
  approverRole: string,
  denialReason: string
) {
  try {
    // Step 1: Update request status to Denied
    const { data: request, error: updateError } = await supabase
      .from('ge_requests')
      .update({
        status: REQUEST_STATUS.DENIED,
        current_approver_role: null
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Step 2: Record denial action
    await supabase.from('ge_approvals').insert({
      ge_request_id: requestId,
      approver_id: approverId,
      role_name: approverRole,
      approval_level: getApprovalLevel(approverRole),
      action: 'Denied',
      comments: denialReason,
      actioned_at: new Date().toISOString()
    });

    // Step 3: Send denial notification to requester
    await sendDeniedNotification({
      requestNumber: request.request_number,
      requesterId: request.requester_id,
      title: request.title,
      denialReason,
      approverRole
    });

    // Step 4: Release budget commitment if any
    if (request.budget_line_id) {
      await updateBudgetCommitment(request.budget_line_id, request.total_amount, 'subtract');
    }

    // Step 5: Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: requestId,
      action: 'UPDATE',
      user_id: approverId,
      changes: { status: REQUEST_STATUS.DENIED, denied_by: approverRole }
    });

    return { success: true };

  } catch (error) {
    console.error('Error denying request:', error);
    throw error;
  }
}

/**
 * Initiate Payment Processing - Auto-forward to Accounts
 */
async function initiatePaymentProcessing(requestId: number) {
  try {
    // Update status to pending payment
    await supabase
      .from('ge_requests')
      .update({
        status: REQUEST_STATUS.PENDING_PAYMENT,
        current_approver_role: APPROVAL_ROUTING.ACCOUNTS.role
      })
      .eq('id', requestId);

    // Calculate payment due date (5 business days)
    const dueDate = addBusinessDays(new Date(), PAYMENT_SLA_DAYS);

    // Create payment tracking record
    // This would integrate with your payments system

    return { success: true, paymentDueDate: dueDate };

  } catch (error) {
    console.error('Error initiating payment:', error);
    throw error;
  }
}

/**
 * Process Payment - Update status to Processing
 */
export async function processPayment(requestId: number, financeOfficerId: string) {
  try {
    await supabase
      .from('ge_requests')
      .update({
        status: REQUEST_STATUS.PROCESSING_PAYMENT
      })
      .eq('id', requestId);

    // Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: requestId,
      action: 'UPDATE',
      user_id: financeOfficerId,
      changes: { status: REQUEST_STATUS.PROCESSING_PAYMENT }
    });

    return { success: true };

  } catch (error) {
    console.error('Error processing payment:', error);
    throw error;
  }
}

/**
 * Complete Payment - Mark as Paid and notify requester
 */
export async function completePayment(
  requestId: number,
  financeOfficerId: string,
  paymentReference: string
) {
  try {
    // Step 1: Update request to Paid
    const { data: request, error: updateError } = await supabase
      .from('ge_requests')
      .update({
        status: REQUEST_STATUS.PAID,
        paid_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Step 2: Send payment confirmation (replicate Teams notification)
    await sendPaymentConfirmation({
      requestNumber: request.request_number,
      requesterId: request.requester_id,
      title: request.title,
      amount: request.total_amount,
      paymentReference
    });

    // Step 3: Log audit trail
    await supabase.from('audit_logs').insert({
      table_name: 'ge_requests',
      record_id: requestId,
      action: 'UPDATE',
      user_id: financeOfficerId,
      changes: { status: REQUEST_STATUS.PAID, payment_reference: paymentReference }
    });

    return { success: true };

  } catch (error) {
    console.error('Error completing payment:', error);
    throw error;
  }
}

/**
 * Helper: Update budget commitment
 */
async function updateBudgetCommitment(
  budgetLineId: number,
  amount: number,
  operation: 'add' | 'subtract'
) {
  try {
    const { data: budgetLine } = await supabase
      .from('budget_lines')
      .select('committed_amount, available_amount')
      .eq('id', budgetLineId)
      .single();

    if (!budgetLine) return;

    const newCommitted = operation === 'add'
      ? budgetLine.committed_amount + amount
      : budgetLine.committed_amount - amount;

    const newAvailable = operation === 'add'
      ? budgetLine.available_amount - amount
      : budgetLine.available_amount + amount;

    await supabase
      .from('budget_lines')
      .update({
        committed_amount: newCommitted,
        available_amount: newAvailable
      })
      .eq('id', budgetLineId);

  } catch (error) {
    console.error('Error updating budget commitment:', error);
  }
}

/**
 * Helper: Get approval level number
 */
function getApprovalLevel(role: string): number {
  const levels: { [key: string]: number } = {
    'Requester': 0,
    'Manager': 1,
    'ProVC - Planning & Development': 2,
    'Vice Chancellor': 2,
    'Accounts/Finance Officer': 3
  };
  return levels[role] || 0;
}

/**
 * Helper: Add business days to a date
 */
function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    result.setDate(result.getDate() + 1);
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (result.getDay() !== 0 && result.getDay() !== 6) {
      addedDays++;
    }
  }

  return result;
}

/**
 * Resubmit Queried Request - After corrections
 */
export async function resubmitQueriedRequest(
  requestId: number,
  corrections: string,
  newQuoteFiles?: File[]
) {
  try {
    // Step 1: Get request details
    const { data: request } = await supabase
      .from('ge_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request || request.status !== REQUEST_STATUS.QUERIED) {
      throw new Error('Request is not in Queried status');
    }

    // Step 2: Determine next approver (restart approval flow)
    const { role: nextApproverRole, nextStatus } = getNextApprover(
      request.total_amount,
      REQUEST_STATUS.SUBMITTED
    );

    // Step 3: Update request
    await supabase
      .from('ge_requests')
      .update({
        status: nextStatus,
        current_approver_role: nextApproverRole,
        submitted_at: new Date().toISOString()
      })
      .eq('id', requestId);

    // Step 4: Record resubmission
    await supabase.from('ge_approvals').insert({
      ge_request_id: requestId,
      approver_id: request.requester_id,
      role_name: 'Requester',
      approval_level: 0,
      action: 'Resubmitted',
      comments: `Resubmitted with corrections: ${corrections}`,
      actioned_at: new Date().toISOString()
    });

    // Step 5: Notify next approver
    await sendApprovalNotification({
      requestNumber: request.request_number,
      requesterName: '',
      title: request.title,
      amount: request.total_amount,
      approverRole: nextApproverRole,
      requestId
    });

    return { success: true };

  } catch (error) {
    console.error('Error resubmitting request:', error);
    throw error;
  }
}
