import { supabase } from './supabase';

export interface Commitment {
  id: number;
  ge_request_id: number;
  commitment_number: string;
  amount: number;
  budget_line_id: number;
  cost_centre_id: number;
  financial_year: number;
  status: string; // 'Open', 'Partial', 'Closed'
  remaining_amount: number | null;
  created_by: string;
  created_at: string;
  // Joined data
  ge_requests?: {
    request_number: string;
    title: string;
    requester_id: string;
  };
  budget_lines?: {
    description: string;
    pgas_vote_code: string;
  };
  cost_centres?: {
    code: string;
    name: string;
  };
  user_profiles?: {
    full_name: string;
  };
}

export interface PaymentVoucher {
  id: number;
  voucher_number: string;
  ge_request_id: number;
  commitment_id: number | null;
  payee_name: string;
  payment_date: string | null;
  payment_method: string; // 'EFT', 'Cheque', 'Cash'
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
}

// Get all commitments with related data
export async function getAllCommitments() {
  const { data, error } = await supabase
    .from('commitments')
    .select(`
      *,
      ge_requests (
        request_number,
        title,
        requester_id
      ),
      budget_lines (
        description,
        pgas_vote_code
      ),
      cost_centres (
        code,
        name
      ),
      user_profiles!commitments_created_by_fkey (
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching commitments:', error);
    throw error;
  }

  return data as Commitment[];
}

// Get commitment by ID
export async function getCommitmentById(id: number) {
  const { data, error } = await supabase
    .from('commitments')
    .select(`
      *,
      ge_requests (
        request_number,
        title,
        description,
        total_amount,
        status
      ),
      budget_lines (
        description,
        pgas_vote_code,
        original_amount,
        available_amount
      ),
      cost_centres (
        code,
        name
      ),
      user_profiles!commitments_created_by_fkey (
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching commitment:', error);
    throw error;
  }

  return data as Commitment;
}

// Create a new commitment (after GE request approval)
export async function createCommitment(geRequestId: number, userId: string) {
  // First, get the GE request details
  const { data: geRequest, error: geError } = await supabase
    .from('ge_requests')
    .select('budget_line_id, cost_centre_id, total_amount')
    .eq('id', geRequestId)
    .single();

  if (geError) throw geError;
  if (!geRequest) throw new Error('GE Request not found');

  // Generate commitment number
  const commitmentNumber = await generateCommitmentNumber();

  const { data, error } = await supabase
    .from('commitments')
    .insert({
      ge_request_id: geRequestId,
      commitment_number: commitmentNumber,
      amount: (geRequest as any).total_amount,
      budget_line_id: (geRequest as any).budget_line_id,
      cost_centre_id: (geRequest as any).cost_centre_id,
      financial_year: new Date().getFullYear(),
      status: 'Open',
      remaining_amount: (geRequest as any).total_amount,
      created_by: userId,
    } as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating commitment:', error);
    throw error;
  }

  return data;
}

// Update commitment status based on payments
export async function updateCommitmentStatus(commitmentId: number) {
  // Get total paid amount for this commitment
  const { data: payments, error: paymentsError } = await supabase
    .from('payment_vouchers')
    .select('amount')
    .eq('commitment_id', commitmentId)
    .eq('status', 'Paid');

  if (paymentsError) throw paymentsError;

  const totalPaid = payments?.reduce((sum, p) => sum + (p as any).amount, 0) || 0;

  // Get commitment amount
  const { data: commitment, error: commitmentError } = await supabase
    .from('commitments')
    .select('amount')
    .eq('id', commitmentId)
    .single();

  if (commitmentError) throw commitmentError;

  const remaining = (commitment as any).amount - totalPaid;
  let status = 'Open';

  if (remaining === 0) {
    status = 'Closed';
  } else if (totalPaid > 0) {
    status = 'Partial';
  }

  // Update commitment
  const { error: updateError } = await supabase
    .from('commitments')
    // @ts-ignore - Database types need to be regenerated
    .update({
      remaining_amount: remaining,
      status: status
    })
    .eq('id', commitmentId);

  if (updateError) throw updateError;

  return { remaining, status };
}

// Generate commitment number
async function generateCommitmentNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { data, error } = await supabase
    .from('commitments')
    .select('commitment_number')
    .like('commitment_number', `COM-${year}-%`)
    .order('commitment_number', { ascending: false })
    .limit(1);

  if (error) throw error;

  let nextNumber = 1;
  if (data && data.length > 0) {
    const lastNumber = (data[0] as any).commitment_number.split('-')[2];
    nextNumber = parseInt(lastNumber) + 1;
  }

  return `COM-${year}-${nextNumber.toString().padStart(6, '0')}`;
}

// Get commitments by cost centre
export async function getCommitmentsByCostCentre(costCentreId: number) {
  const { data, error } = await supabase
    .from('commitments')
    .select(`
      *,
      ge_requests (
        request_number,
        title
      )
    `)
    .eq('cost_centre_id', costCentreId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Commitment[];
}

// Get commitment statistics
export async function getCommitmentStats() {
  const { data: commitments, error } = await supabase
    .from('commitments')
    .select('amount, status, remaining_amount');

  if (error) throw error;

  const stats = {
    total_committed: commitments?.reduce((sum, c: any) => sum + c.amount, 0) || 0,
    total_paid: commitments?.reduce((sum, c: any) => sum + (c.amount - (c.remaining_amount || 0)), 0) || 0,
    total_remaining: commitments?.reduce((sum, c: any) => sum + (c.remaining_amount || 0), 0) || 0,
    open_count: commitments?.filter((c: any) => c.status === 'Open').length || 0,
    partial_count: commitments?.filter((c: any) => c.status === 'Partial').length || 0,
    closed_count: commitments?.filter((c: any) => c.status === 'Closed').length || 0,
  };

  return stats;
}
