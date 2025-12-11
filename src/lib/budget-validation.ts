/**
 * Budget Validation & Commitment Functions
 * Real-time budget checking for GE requests
 */

import { supabase } from './supabase';
import type { BudgetLine } from './aap-types';

export interface BudgetCheckResult {
  available: boolean;
  message: string;
  details?: {
    approved: number;
    committed: number;
    actual: number;
    available: number;
    requestAmount: number;
    remainingAfter: number;
  };
}

export interface BudgetCommitment {
  commitment_id: number;
  ge_request_id: number;
  budget_line_id: number;
  amount: number;
  status: 'Active' | 'Released' | 'Paid';
  created_at: string;
}

/**
 * Check if sufficient budget is available for a GE request
 */
export async function checkBudgetAvailability(
  aapLineId: number,
  requestAmount: number
): Promise<BudgetCheckResult> {
  try {
    // 1. Get active budget line for this AAP line
    const { data: budgetLine, error: budgetError } = await supabase
      .from('budget_line')
      .select('*')
      .eq('aap_line_id', aapLineId)
      .eq('status', 'Active')
      .maybeSingle();

    if (budgetError) throw budgetError;

    if (!budgetLine) {
      return {
        available: false,
        message: 'No budget allocation found for this activity',
      };
    }

    // 2. Calculate committed amount (pending GE requests)
    const { data: commitments, error: commitmentError } = await supabase
      .from('budget_commitments')
      .select('amount')
      .eq('budget_line_id', budgetLine.budget_line_id)
      .eq('status', 'Active');

    if (commitmentError) throw commitmentError;

    const committedAmount = commitments?.reduce((sum, c) => sum + parseFloat(c.amount as any), 0) || 0;

    // 3. Calculate actual spent (from GE lines)
    const { data: geLinesData, error: geError } = await supabase
      .from('ge_line')
      .select('amount, ge_header!inner(status)')
      .eq('budget_line_id', budgetLine.budget_line_id);

    if (geError) throw geError;

    const actualSpent = geLinesData
      ?.filter((line: any) => line.ge_header?.status === 'Posted')
      .reduce((sum, line) => sum + parseFloat(line.amount as any), 0) || 0;

    // 4. Calculate available
    const approvedBudget = parseFloat(budgetLine.approved_amount as any);
    const availableBudget = approvedBudget - committedAmount - actualSpent;
    const remainingAfter = availableBudget - requestAmount;

    // 5. Check if sufficient
    if (requestAmount > availableBudget) {
      return {
        available: false,
        message: `Insufficient budget. Available: K${availableBudget.toLocaleString()}, Required: K${requestAmount.toLocaleString()}`,
        details: {
          approved: approvedBudget,
          committed: committedAmount,
          actual: actualSpent,
          available: availableBudget,
          requestAmount,
          remainingAfter,
        },
      };
    }

    return {
      available: true,
      message: `Budget available. Remaining after: K${remainingAfter.toLocaleString()}`,
      details: {
        approved: approvedBudget,
        committed: committedAmount,
        actual: actualSpent,
        available: availableBudget,
        requestAmount,
        remainingAfter,
      },
    };
  } catch (error) {
    console.error('Error checking budget availability:', error);
    return {
      available: false,
      message: 'Error checking budget availability',
    };
  }
}

/**
 * Create budget commitment when GE request is approved
 */
export async function commitBudget(
  geRequestId: number,
  budgetLineId: number,
  amount: number
): Promise<BudgetCommitment | null> {
  try {
    const { data, error } = await supabase
      .from('budget_commitments')
      .insert({
        ge_request_id: geRequestId,
        budget_line_id: budgetLineId,
        amount,
        status: 'Active',
      })
      .select()
      .single();

    if (error) throw error;
    return data as BudgetCommitment;
  } catch (error) {
    console.error('Error committing budget:', error);
    return null;
  }
}

/**
 * Release budget commitment when GE request is rejected
 */
export async function releaseBudgetCommitment(geRequestId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('budget_commitments')
      .update({ status: 'Released' })
      .eq('ge_request_id', geRequestId)
      .eq('status', 'Active');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error releasing budget commitment:', error);
    return false;
  }
}

/**
 * Update commitment to paid when payment is processed
 */
export async function markCommitmentAsPaid(geRequestId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('budget_commitments')
      .update({ status: 'Paid' })
      .eq('ge_request_id', geRequestId)
      .eq('status', 'Active');

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking commitment as paid:', error);
    return false;
  }
}

/**
 * Get budget utilization for a budget line
 */
export async function getBudgetUtilization(budgetLineId: number) {
  try {
    // Get budget line
    const { data: budgetLine, error: budgetError } = await supabase
      .from('budget_line')
      .select('approved_amount')
      .eq('budget_line_id', budgetLineId)
      .single();

    if (budgetError) throw budgetError;

    const approvedBudget = parseFloat(budgetLine.approved_amount as any);

    // Get commitments
    const { data: commitments, error: commitmentError } = await supabase
      .from('budget_commitments')
      .select('amount')
      .eq('budget_line_id', budgetLineId)
      .eq('status', 'Active');

    if (commitmentError) throw commitmentError;

    const committedAmount = commitments?.reduce((sum, c) => sum + parseFloat(c.amount as any), 0) || 0;

    // Get actual spent
    const { data: geLinesData, error: geError } = await supabase
      .from('ge_line')
      .select('amount, ge_header!inner(status)')
      .eq('budget_line_id', budgetLineId);

    if (geError) throw geError;

    const actualSpent = geLinesData
      ?.filter((line: any) => line.ge_header?.status === 'Posted')
      .reduce((sum, line) => sum + parseFloat(line.amount as any), 0) || 0;

    const availableBudget = approvedBudget - committedAmount - actualSpent;
    const utilizationPercent = ((committedAmount + actualSpent) / approvedBudget) * 100;

    return {
      approved: approvedBudget,
      committed: committedAmount,
      actual: actualSpent,
      available: availableBudget,
      utilizationPercent,
    };
  } catch (error) {
    console.error('Error getting budget utilization:', error);
    return null;
  }
}

/**
 * Get all commitments for a GE request
 */
export async function getCommitmentsForGE(geRequestId: number): Promise<BudgetCommitment[]> {
  try {
    const { data, error } = await supabase
      .from('budget_commitments')
      .select('*')
      .eq('ge_request_id', geRequestId);

    if (error) throw error;
    return (data as BudgetCommitment[]) || [];
  } catch (error) {
    console.error('Error getting commitments:', error);
    return [];
  }
}
