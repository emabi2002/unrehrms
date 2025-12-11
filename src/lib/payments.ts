import { supabase } from './supabase';
import { updateCommitmentStatus } from './commitments';

export interface PaymentVoucher {
  id: number;
  voucher_number: string;
  ge_request_id: number;
  commitment_id: number | null;
  payee_name: string;
  payment_date: string | null;
  payment_method: string; // 'EFT', 'Cheque', 'Cash', 'Pending'
  bank_name: string | null;
  account_number: string | null;
  cheque_number: string | null;
  bank_reference: string | null;
  amount: number;
  description: string | null;
  approved_by: string | null;
  processed_by: string | null;
  status: string; // 'Pending', 'Approved', 'Paid', 'Cancelled'
  paid_at: string | null;
  created_at: string;
  // Joined data
  ge_requests?: {
    request_number: string;
    title: string;
  };
  commitments?: {
    commitment_number: string;
  };
  cost_centres?: {
    name: string;
  };
  approver_profile?: {
    full_name: string;
  };
  processor_profile?: {
    full_name: string;
  };
}

export interface CreatePaymentVoucherInput {
  ge_request_id: number;
  commitment_id: number;
  payee_name: string;
  amount: number;
  payment_method: string;
  bank_name?: string;
  account_number?: string;
  description?: string;
  payment_date?: string;
}

// Get all payment vouchers with related data
export async function getAllPaymentVouchers() {
  const { data, error } = await supabase
    .from('payment_vouchers')
    .select(`
      *,
      ge_requests (
        request_number,
        title,
        cost_centre_id
      ),
      commitments (
        commitment_number
      ),
      approver:user_profiles!payment_vouchers_approved_by_fkey (
        full_name
      ),
      processor:user_profiles!payment_vouchers_processed_by_fkey (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching payment vouchers:', error);
    throw error;
  }

  return data as PaymentVoucher[];
}

// Get payment voucher by ID
export async function getPaymentVoucherById(id: number) {
  const { data, error } = await supabase
    .from('payment_vouchers')
    .select(`
      *,
      ge_requests (
        request_number,
        title,
        description,
        total_amount
      ),
      commitments (
        commitment_number,
        amount,
        remaining_amount
      ),
      approver:user_profiles!payment_vouchers_approved_by_fkey (
        full_name,
        email
      ),
      processor:user_profiles!payment_vouchers_processed_by_fkey (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching payment voucher:', error);
    throw error;
  }

  return data as PaymentVoucher;
}

// Create a new payment voucher
export async function createPaymentVoucher(input: CreatePaymentVoucherInput, userId: string) {
  // Generate voucher number
  const voucherNumber = await generateVoucherNumber();

  const { data, error } = await supabase
    .from('payment_vouchers')
    .insert({
      voucher_number: voucherNumber,
      ge_request_id: input.ge_request_id,
      commitment_id: input.commitment_id,
      payee_name: input.payee_name,
      amount: input.amount,
      payment_method: input.payment_method,
      bank_name: input.bank_name || null,
      account_number: input.account_number || null,
      description: input.description || null,
      payment_date: input.payment_date || null,
      status: 'Pending',
      approved_by: null,
      processed_by: null,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating payment voucher:', error);
    throw error;
  }

  // Log audit trail
  await supabase.from('audit_logs').insert({
    entity_type: 'payment_vouchers',
    entity_id: (data as any).id,
    user_id: userId,
    action: 'CREATE',
    new_data: data as any,
  } as any);

  return data;
}

// Approve payment voucher
export async function approvePaymentVoucher(voucherId: number, userId: string) {
  const { data, error } = await supabase
    .from('payment_vouchers')
    // @ts-ignore - Database types need to be regenerated
    .update({
      status: 'Approved',
      approved_by: userId,
    })
    .eq('id', voucherId)
    .select()
    .single();

  if (error) {
    console.error('Error approving payment voucher:', error);
    throw error;
  }

  // Log audit trail
  await supabase.from('audit_logs').insert({
    entity_type: 'payment_vouchers',
    entity_id: voucherId,
    user_id: userId,
    action: 'APPROVE',
    new_data: { status: 'Approved' } as any,
  } as any);

  return data;
}

// Process payment (mark as paid)
export async function processPayment(
  voucherId: number,
  userId: string,
  bankReference?: string,
  chequeNumber?: string
) {
  const { data, error } = await supabase
    .from('payment_vouchers')
    // @ts-ignore - Database types need to be regenerated
    .update({
      status: 'Paid',
      processed_by: userId,
      paid_at: new Date().toISOString(),
      bank_reference: bankReference || null,
      cheque_number: chequeNumber || null,
    })
    .eq('id', voucherId)
    .select()
    .single();

  if (error) {
    console.error('Error processing payment:', error);
    throw error;
  }

  // Update commitment status
  if ((data as any).commitment_id) {
    await updateCommitmentStatus((data as any).commitment_id);
  }

  // Update GE request status
  await supabase
    .from('ge_requests')
    // @ts-ignore - Database types need to be regenerated
    .update({ status: 'paid' })
    .eq('id', (data as any).ge_request_id);

  // Log audit trail
  await supabase.from('audit_logs').insert({
    entity_type: 'payment_vouchers',
    entity_id: voucherId,
    user_id: userId,
    action: 'PROCESS_PAYMENT',
    new_data: { status: 'Paid', paid_at: (data as any).paid_at } as any,
  } as any);

  return data;
}

// Cancel payment voucher
export async function cancelPaymentVoucher(voucherId: number, userId: string, reason: string) {
  const { data, error} = await supabase
    .from('payment_vouchers')
    // @ts-ignore - Database types need to be regenerated
    .update({
      status: 'Cancelled',
    })
    .eq('id', voucherId)
    .select()
    .single();

  if (error) {
    console.error('Error cancelling payment voucher:', error);
    throw error;
  }

  // Log audit trail
  await supabase.from('audit_logs').insert({
    entity_type: 'payment_vouchers',
    entity_id: voucherId,
    user_id: userId,
    action: 'CANCEL',
    new_data: { status: 'Cancelled', reason } as any,
  } as any);

  return data;
}

// Generate voucher number
async function generateVoucherNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from('payment_vouchers')
    .select('voucher_number')
    .like('voucher_number', `PV-${year}-%`)
    .order('voucher_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = (data[0] as any).voucher_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `PV-${year}-${nextNumber.toString().padStart(6, '0')}`;
}

// Get payment statistics
export async function getPaymentStats() {
  const { data: payments, error } = await supabase
    .from('payment_vouchers')
    .select('amount, status, payment_method');

  if (error) throw error;

  const stats = {
    total_count: payments?.length || 0,
    total_paid: payments?.filter((p: any) => p.status === 'Paid').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
    total_pending: payments?.filter((p: any) => p.status !== 'Paid').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
    paid_count: payments?.filter((p: any) => p.status === 'Paid').length || 0,
    pending_count: payments?.filter((p: any) => p.status === 'Pending').length || 0,
    approved_count: payments?.filter((p: any) => p.status === 'Approved').length || 0,
    eft_count: payments?.filter((p: any) => p.payment_method === 'EFT').length || 0,
    cheque_count: payments?.filter((p: any) => p.payment_method === 'Cheque').length || 0,
    cash_count: payments?.filter((p: any) => p.payment_method === 'Cash').length || 0,
  };

  return stats;
}

// Get payments by GE request
export async function getPaymentsByGERequest(geRequestId: number) {
  const { data, error } = await supabase
    .from('payment_vouchers')
    .select('*')
    .eq('ge_request_id', geRequestId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PaymentVoucher[];
}

// Get payments by commitment
export async function getPaymentsByCommitment(commitmentId: number) {
  const { data, error } = await supabase
    .from('payment_vouchers')
    .select('*')
    .eq('commitment_id', commitmentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PaymentVoucher[];
}
