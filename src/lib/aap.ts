/**
 * AAP & Budget Monitoring Database Functions
 * Complete CRUD operations for Annual Activity Plan management
 */

import { supabase } from './supabase';
import type {
  AAPHeader,
  AAPLine,
  AAPLineSchedule,
  BudgetLine,
  BudgetVersion,
  BudgetVsActualByAAPLine,
  GETransactionsByAAPLine,
  CreateAAPHeaderInput,
  AddAAPLineInput,
  SetMonthlyScheduleInput,
  CreateBudgetVersionInput,
  CreateBudgetLineInput,
  BudgetAvailabilityCheck,
  Division,
  Department,
  Program,
  ActivityProject,
  ChartOfAccounts,
  FiscalYear,
} from './aap-types';

// ============================================
// MASTER DATA FUNCTIONS
// ============================================

/**
 * Get all fiscal years
 */
export async function getFiscalYears(): Promise<FiscalYear[]> {
  const { data, error } = await supabase
    .from('fiscal_year')
    .select('*')
    .order('year_id', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get active fiscal year
 */
export async function getActiveFiscalYear(): Promise<FiscalYear | null> {
  const { data, error } = await supabase
    .from('fiscal_year')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Get all divisions
 */
export async function getDivisions(): Promise<Division[]> {
  const { data, error } = await supabase
    .from('division')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Get departments by division
 */
export async function getDepartmentsByDivision(divisionId: number): Promise<Department[]> {
  const { data, error } = await supabase
    .from('department')
    .select('*, division(*)')
    .eq('division_id', divisionId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Get programs by division
 */
export async function getProgramsByDivision(divisionId: number): Promise<Program[]> {
  const { data, error } = await supabase
    .from('program')
    .select('*, division(*)')
    .eq('division_id', divisionId)
    .eq('is_active', true)
    .order('program_name');

  if (error) throw error;
  return data || [];
}

/**
 * Get activities by program
 */
export async function getActivitiesByProgram(programId: number): Promise<ActivityProject[]> {
  const { data, error} = await supabase
    .from('activity_project')
    .select('*, program(*)')
    .eq('program_id', programId)
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data || [];
}

/**
 * Get all chart of accounts
 */
export async function getChartOfAccounts(): Promise<ChartOfAccounts[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('is_active', true)
    .order('account_code');

  if (error) throw error;
  return data || [];
}

/**
 * Get accounts by economic item code
 */
export async function getAccountsByEconomicItem(economicItemCode: string): Promise<ChartOfAccounts[]> {
  const { data, error } = await supabase
    .from('chart_of_accounts')
    .select('*')
    .eq('economic_item_code', economicItemCode)
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}

// ============================================
// AAP FUNCTIONS
// ============================================

/**
 * Get all AAPs for a fiscal year
 */
export async function getAAPsByYear(yearId: number): Promise<AAPHeader[]> {
  const { data, error } = await supabase
    .from('aap_header')
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .eq('year_id', yearId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as AAPHeader[];
}

/**
 * Get AAP by ID with all details
 */
export async function getAAPById(aapId: number): Promise<AAPHeader | null> {
  const { data, error } = await supabase
    .from('aap_header')
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*),
      aap_lines:aap_line(
        *,
        chart_of_accounts(*),
        aap_line_schedule(*)
      )
    `)
    .eq('aap_id', aapId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AAPHeader | null;
}

/**
 * Create new AAP
 */
export async function createAAP(input: CreateAAPHeaderInput, userId: string): Promise<AAPHeader> {
  const { data, error } = await supabase
    .from('aap_header')
    .insert({
      ...input,
      status: 'Draft',
      created_by: userId,
      total_proposed_cost: 0,
    })
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPHeader;
}

/**
 * Update AAP header
 */
export async function updateAAPHeader(aapId: number, updates: Partial<CreateAAPHeaderInput>): Promise<AAPHeader> {
  const { data, error } = await supabase
    .from('aap_header')
    .update(updates)
    .eq('aap_id', aapId)
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPHeader;
}

/**
 * Add AAP line
 */
export async function addAAPLine(input: AddAAPLineInput): Promise<AAPLine> {
  const { data, error } = await supabase
    .from('aap_line')
    .insert(input)
    .select(`
      *,
      chart_of_accounts(*),
      aap_header(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPLine;
}

/**
 * Update AAP line
 */
export async function updateAAPLine(aapLineId: number, updates: Partial<AddAAPLineInput>): Promise<AAPLine> {
  const { data, error } = await supabase
    .from('aap_line')
    .update(updates)
    .eq('aap_line_id', aapLineId)
    .select(`
      *,
      chart_of_accounts(*),
      aap_header(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPLine;
}

/**
 * Delete AAP line
 */
export async function deleteAAPLine(aapLineId: number): Promise<void> {
  const { error } = await supabase
    .from('aap_line')
    .delete()
    .eq('aap_line_id', aapLineId);

  if (error) throw error;
}

/**
 * Get AAP lines for an AAP
 */
export async function getAAPLinesByAAP(aapId: number): Promise<AAPLine[]> {
  const { data, error } = await supabase
    .from('aap_line')
    .select(`
      *,
      chart_of_accounts(*),
      aap_line_schedule(*)
    `)
    .eq('aap_id', aapId)
    .order('item_no');

  if (error) throw error;
  return data as AAPLine[];
}

/**
 * Set monthly schedule for AAP line
 */
export async function setMonthlySchedule(input: SetMonthlyScheduleInput): Promise<AAPLineSchedule> {
  // Upsert (insert or update)
  const { data, error } = await supabase
    .from('aap_line_schedule')
    .upsert({
      aap_line_id: input.aap_line_id,
      month: input.month,
      is_scheduled: input.is_scheduled,
      planned_quantity: input.planned_quantity,
      planned_cost: input.planned_cost,
      notes: input.notes,
    }, {
      onConflict: 'aap_line_id,month',
    })
    .select()
    .single();

  if (error) throw error;
  return data as AAPLineSchedule;
}

/**
 * Get monthly schedule for AAP line
 */
export async function getMonthlySchedule(aapLineId: number): Promise<AAPLineSchedule[]> {
  const { data, error } = await supabase
    .from('aap_line_schedule')
    .select('*')
    .eq('aap_line_id', aapLineId)
    .order('month');

  if (error) throw error;
  return data || [];
}

/**
 * Submit AAP for approval
 */
export async function submitAAP(aapId: number): Promise<AAPHeader> {
  const { data, error } = await supabase
    .from('aap_header')
    .update({
      status: 'Submitted',
      submitted_date: new Date().toISOString(),
    })
    .eq('aap_id', aapId)
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPHeader;
}

/**
 * Approve AAP
 */
export async function approveAAP(aapId: number, userId: string): Promise<AAPHeader> {
  const { data, error } = await supabase
    .from('aap_header')
    .update({
      status: 'Approved',
      approved_date: new Date().toISOString(),
      approved_by: userId,
    })
    .eq('aap_id', aapId)
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPHeader;
}

/**
 * Reject AAP
 */
export async function rejectAAP(aapId: number): Promise<AAPHeader> {
  const { data, error } = await supabase
    .from('aap_header')
    .update({
      status: 'Rejected',
    })
    .eq('aap_id', aapId)
    .select(`
      *,
      fiscal_year(*),
      division(*),
      department(*),
      program(*),
      activity_project(*)
    `)
    .single();

  if (error) throw error;
  return data as AAPHeader;
}

// ============================================
// BUDGET FUNCTIONS
// ============================================

/**
 * Get all budget versions for a fiscal year
 */
export async function getBudgetVersions(yearId: number): Promise<BudgetVersion[]> {
  const { data, error } = await supabase
    .from('budget_version')
    .select('*')
    .eq('year_id', yearId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new budget version
 */
export async function createBudgetVersion(
  yearId: number,
  name: string,
  description?: string,
  userId?: string
): Promise<BudgetVersion> {
  // Deactivate all existing versions for this year first
  await supabase
    .from('budget_version')
    .update({ is_active: false })
    .eq('year_id', yearId);

  // Create new version as active
  const { data, error } = await supabase
    .from('budget_version')
    .insert({
      year_id: yearId,
      name,
      description,
      is_active: true,
      created_by: userId || 'system',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Activate a budget version (deactivates all others for the year)
 */
export async function activateBudgetVersion(budgetVersionId: number): Promise<BudgetVersion> {
  // Get the version to find its year
  const { data: version, error: fetchError } = await supabase
    .from('budget_version')
    .select('year_id')
    .eq('budget_version_id', budgetVersionId)
    .single();

  if (fetchError) throw fetchError;

  // Deactivate all versions for this year
  await supabase
    .from('budget_version')
    .update({ is_active: false })
    .eq('year_id', version.year_id);

  // Activate the selected version
  const { data, error } = await supabase
    .from('budget_version')
    .update({ is_active: true })
    .eq('budget_version_id', budgetVersionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all budget lines for a budget version
 */
export async function getBudgetLinesByVersion(budgetVersionId: number): Promise<BudgetLine[]> {
  const { data, error } = await supabase
    .from('budget_line')
    .select(`
      *,
      aap_line:aap_line_id (
        aap_line_id,
        item_no,
        activity_description,
        specific_output,
        proposed_cost
      ),
      budget_version:budget_version_id (
        budget_version_id,
        name
      )
    `)
    .eq('budget_version_id', budgetVersionId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a budget line
 */
export async function createBudgetLine(input: CreateBudgetLineInput): Promise<BudgetLine> {
  const { data, error } = await supabase
    .from('budget_line')
    .insert({
      budget_version_id: input.budget_version_id,
      aap_line_id: input.aap_line_id,
      account_id: input.account_id,
      approved_amount: input.approved_amount,
      fund_source: input.fund_source,
      status: input.status || 'Active',
      remarks: input.remarks,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a budget line
 */
export async function updateBudgetLine(
  budgetLineId: number,
  updates: Partial<CreateBudgetLineInput>
): Promise<BudgetLine> {
  const { data, error } = await supabase
    .from('budget_line')
    .update(updates)
    .eq('budget_line_id', budgetLineId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a budget line
 */
export async function deleteBudgetLine(budgetLineId: number): Promise<void> {
  const { error } = await supabase
    .from('budget_line')
    .delete()
    .eq('budget_line_id', budgetLineId);

  if (error) throw error;
}

/**
 * Get budget line by AAP line
 */
export async function getBudgetLineByAAP(aapLineId: number): Promise<BudgetLine | null> {
  const { data, error } = await supabase
    .from('budget_line')
    .select(`
      *,
      budget_version(*),
      aap_line(*),
      chart_of_accounts(*)
    `)
    .eq('aap_line_id', aapLineId)
    .eq('status', 'Active')
    .maybeSingle();

  if (error) throw error;
  return data as BudgetLine | null;
}

// ============================================
// BUDGET CHECKING FUNCTIONS
// ============================================

/**
 * Check budget availability for an AAP line
 */
export async function checkBudgetAvailability(
  aapLineId: number,
  amount: number
): Promise<BudgetAvailabilityCheck> {
  try {
    // 1. Get budget line
    const budgetLine = await getBudgetLineByAAP(aapLineId);

    if (!budgetLine) {
      return {
        available: false,
        message: 'No budget allocation found for this AAP item',
      };
    }

    // 2. Calculate actual expenditure
    const { data: actualData, error: actualError } = await supabase
      .from('ge_line')
      .select('amount')
      .eq('budget_line_id', budgetLine.budget_line_id)
      .eq('is_posted_to_pgas', true); // Only count posted transactions

    if (actualError) throw actualError;

    const actualSpent = actualData?.reduce((sum, line) => sum + parseFloat(line.amount as any), 0) || 0;

    // 3. Calculate committed (pending GEs - would need to add commitment tracking)
    // For now, assume 0 committed
    const committed = 0;

    // 4. Calculate available
    const available = budgetLine.approved_amount - actualSpent - committed;

    // 5. Check if sufficient
    if (amount > available) {
      return {
        available: false,
        message: `Insufficient budget. Available: K${available.toFixed(2)}, Requested: K${amount.toFixed(2)}`,
        details: {
          budget: budgetLine.approved_amount,
          spent: actualSpent,
          committed,
          available,
        },
      };
    }

    return {
      available: true,
      message: `Budget available: K${available.toFixed(2)}`,
      details: {
        budget: budgetLine.approved_amount,
        spent: actualSpent,
        committed,
        available,
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

// ============================================
// MONITORING FUNCTIONS
// ============================================

/**
 * Get Budget vs Actual report
 */
export async function getBudgetVsActual(
  yearId: number,
  divisionId?: number,
  programId?: number
): Promise<BudgetVsActualByAAPLine[]> {
  let query = supabase
    .from('vw_budget_vs_actual_by_aap_line')
    .select('*')
    .eq('year_id', yearId);

  if (divisionId) {
    query = query.eq('division_code', divisionId);
  }

  if (programId) {
    query = query.eq('program_name', programId);
  }

  const { data, error } = await query.order('division_name').order('item_no');

  if (error) throw error;
  return data as BudgetVsActualByAAPLine[];
}

/**
 * Get GE transactions by AAP line
 */
export async function getGETransactionsByAAP(aapLineId: number): Promise<GETransactionsByAAPLine[]> {
  const { data, error } = await supabase
    .from('vw_ge_transactions_by_aap_line')
    .select('*')
    .eq('aap_line_id', aapLineId)
    .order('date')
    .order('no');

  if (error) throw error;
  return data as GETransactionsByAAPLine[];
}

/**
 * Get budget summary statistics
 */
export async function getBudgetSummaryStats(yearId: number) {
  const budgetVsActual = await getBudgetVsActual(yearId);

  const totalBudget = budgetVsActual.reduce((sum, line) => sum + line.approved_budget, 0);
  const totalExpense = budgetVsActual.reduce((sum, line) => sum + line.total_expense, 0);
  const totalBalance = budgetVsActual.reduce((sum, line) => sum + line.balance, 0);
  const utilizationPercent = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  return {
    totalBudget,
    totalExpense,
    totalBalance,
    utilizationPercent,
    lineCount: budgetVsActual.length,
  };
}
