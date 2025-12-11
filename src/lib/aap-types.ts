/**
 * AAP & Budget Monitoring System Types
 * Complete TypeScript definitions for Annual Activity Plan management
 */

// ============================================
// DOMAIN 1: MASTER DATA
// ============================================

export interface FiscalYear {
  year_id: number; // e.g. 2025
  start_date: string;
  end_date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Division {
  division_id: number;
  code: string; // e.g. 'FBS', 'ASS'
  name: string; // e.g. 'Finance & Business Services'
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  department_id: number;
  division_id: number;
  code: string; // e.g. 'ICT', 'SP'
  name: string; // e.g. 'ICT Services'
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  division?: Division;
}

export interface Program {
  program_id: number;
  division_id: number;
  main_program_name: string; // e.g. 'Academic Support'
  program_name: string; // e.g. 'ICT Services'
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  division?: Division;
}

export interface ActivityProject {
  activity_id: number;
  program_id: number;
  code: string; // e.g. '515-2610-2614' (vote code)
  name: string; // e.g. 'Coordinate and Implement Activities'
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  program?: Program;
}

export interface ChartOfAccounts {
  account_id: number;
  account_code: string; // e.g. '1000688041'
  account_name: string;
  economic_item_code?: string; // e.g. '121', '123', '128'
  economic_item_name?: string; // e.g. 'Travel & Subsistence'
  pgas_category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  supplier_id: number;
  name: string;
  tin?: string; // Tax ID
  address?: string;
  phone?: string;
  email?: string;
  bank_name?: string;
  bank_account?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// DOMAIN 2: AAP (ANNUAL ACTIVITY PLAN)
// ============================================

export type AAPStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected';

export interface AAPHeader {
  aap_id: number;
  year_id: number;
  division_id: number;
  department_id?: number;
  program_id: number;
  activity_id: number;

  // Header information
  head_of_activity?: string; // Manager/Head name
  manager?: string;
  telephone?: string;
  fax?: string;

  // Status and workflow
  status: AAPStatus;
  submitted_date?: string;
  approved_date?: string;
  approved_by?: string; // UUID

  // Computed totals
  total_proposed_cost: number;

  // Tracking
  created_by?: string; // UUID
  created_at: string;
  updated_at: string;

  // Relations (for joins)
  fiscal_year?: FiscalYear;
  division?: Division;
  department?: Department;
  program?: Program;
  activity_project?: ActivityProject;
  aap_lines?: AAPLine[];
}

export interface AAPLine {
  aap_line_id: number;
  aap_id: number;

  // Line details
  item_no: string; // e.g. '221', '223', '224'
  activity_description: string; // e.g. 'Travel & Subsistence'
  specific_output?: string; // e.g. 'Staff Travel'
  target_output?: string; // e.g. '4 x Travel'

  // Financial
  proposed_cost: number; // Proposed budget amount

  // PGAS Classification
  economic_item_code?: string; // Links to chart_of_accounts
  account_id?: number;

  // Manpower
  manpower_months?: number;

  // Achievement tracking
  achievement?: string;

  // Tracking
  created_at: string;
  updated_at: string;

  // Relations
  aap_header?: AAPHeader;
  chart_of_accounts?: ChartOfAccounts;
  aap_line_schedule?: AAPLineSchedule[];
}

export interface AAPLineSchedule {
  aap_line_schedule_id: number;
  aap_line_id: number;

  // Month (1-12 for Jan-Dec)
  month: number; // 1=Jan, 2=Feb, ..., 12=Dec

  // Planned implementation
  planned_quantity?: number;
  planned_cost?: number;
  is_scheduled: boolean; // Whether activity planned for this month

  // Notes
  notes?: string;

  // Tracking
  created_at: string;

  // Relations
  aap_line?: AAPLine;
}

// ============================================
// DOMAIN 3: BUDGET (GOVERNMENT APPROPRIATION)
// ============================================

export interface BudgetVersion {
  budget_version_id: number;
  year_id: number;
  name: string; // e.g. 'Original 2025', 'Revised 1'
  description?: string;
  is_active: boolean; // Only one active per year

  // Approval
  approved_date?: string;
  approved_by?: string; // UUID

  // Tracking
  created_by?: string; // UUID
  created_at: string;
  updated_at: string;

  // Relations
  fiscal_year?: FiscalYear;
  budget_lines?: BudgetLine[];
}

export type BudgetStatus = 'Active' | 'Frozen' | 'Reallocated' | 'Cancelled';
export type FundSource = 'GoPNG' | 'Donor' | 'Internal Revenue' | 'Other';

export interface BudgetLine {
  budget_line_id: number;
  budget_version_id: number;
  aap_line_id: number; // Links to planned activity
  account_id: number; // PGAS account

  // Financial
  approved_amount: number; // Government-approved budget

  // Funding source
  fund_source: FundSource;

  // Status
  status: BudgetStatus;

  // Notes
  remarks?: string;

  // Tracking
  created_at: string;
  updated_at: string;

  // Relations
  budget_version?: BudgetVersion;
  aap_line?: AAPLine;
  chart_of_accounts?: ChartOfAccounts;
  ge_lines?: GELine[];
}

// ============================================
// DOMAIN 4: GE EXECUTION (ENHANCED)
// ============================================

export type GEStatus =
  | 'Requested'
  | 'Approved'
  | 'Posted'
  | 'Cancelled';

export interface GEHeader {
  ge_id: number;
  ge_number: string; // e.g. '38322'
  year_id: number;

  // Organizational
  division_id: number;
  department_id?: number;
  activity_id?: number;
  aap_line_id?: number; // Direct link to AAP item

  // Dates
  request_date: string;
  ge_date: string; // Posting date

  // Description
  description: string;

  // Status
  status: GEStatus;

  // Approval workflow
  approved_date?: string;
  approved_by?: string; // UUID

  // Tracking
  created_by?: string; // UUID
  created_at: string;
  updated_at: string;

  // Relations
  fiscal_year?: FiscalYear;
  division?: Division;
  department?: Department;
  activity_project?: ActivityProject;
  aap_line?: AAPLine;
  ge_lines?: GELine[];
}

export interface GELine {
  ge_line_id: number;
  ge_id: number;
  line_no: number;

  // Budget link (CRITICAL)
  budget_line_id: number;
  account_id: number;

  // Payee/Supplier
  payee_id?: number;

  // Transaction details
  detail: string; // e.g. 'Toner for printer'
  cheque_batch_no?: string; // e.g. '486'

  // Financial
  amount: number;
  currency: string; // default 'PGK'

  // PGAS posting
  is_posted_to_pgas: boolean;
  pgas_reference?: string;
  pgas_posted_date?: string;

  // Remarks
  remark?: string;

  // Tracking
  created_at: string;
  updated_at: string;

  // Relations
  ge_header?: GEHeader;
  budget_line?: BudgetLine;
  chart_of_accounts?: ChartOfAccounts;
  supplier?: Supplier;
}

// ============================================
// DOMAIN 5: MONITORING VIEWS
// ============================================

export interface BudgetVsActualByAAPLine {
  // AAP Information
  year_id: number;
  division_code: string;
  division_name: string;
  department_code?: string;
  department_name?: string;
  main_program_name: string;
  program_name: string;
  activity_code: string;
  activity_name: string;

  // AAP Line Details
  aap_line_id: number;
  item_no: string;
  activity_description: string;
  specific_output?: string;
  target_output?: string;
  proposed_cost: number;
  achievement?: string;

  // Budget (Approved)
  approved_budget: number;

  // Actual (Expenses to date)
  total_expense: number;

  // Balance
  balance: number;

  // Percentage utilized
  utilization_percent: number;
}

export interface GETransactionsByAAPLine {
  // AAP Line reference
  aap_line_id: number;
  item_no: string;
  activity_description: string;

  // Transaction details
  ge_line_id: number;
  no: number; // line_no
  date: string; // ge_date
  ge_no: string;
  account: string; // account_code
  account_name: string;
  payee?: string; // supplier name
  detail: string;
  cheque_batch_no?: string;
  amount: number;
  remark?: string;

  // Budget amount (for balance calculation)
  budget_amount: number;
}

// ============================================
// FORM INPUT TYPES
// ============================================

export interface CreateAAPHeaderInput {
  year_id: number;
  division_id: number;
  department_id?: number;
  program_id: number;
  activity_id: number;
  head_of_activity?: string;
  manager?: string;
  telephone?: string;
  fax?: string;
}

export interface AddAAPLineInput {
  aap_id: number;
  item_no: string;
  activity_description: string;
  specific_output?: string;
  target_output?: string;
  proposed_cost: number;
  economic_item_code?: string;
  account_id?: number;
  manpower_months?: number;
}

export interface SetMonthlyScheduleInput {
  aap_line_id: number;
  month: number; // 1-12
  is_scheduled: boolean;
  planned_quantity?: number;
  planned_cost?: number;
  notes?: string;
}

export interface CreateBudgetVersionInput {
  year_id: number;
  name: string;
  description?: string;
}

export interface CreateBudgetLineInput {
  budget_version_id: number;
  aap_line_id: number;
  account_id: number;
  approved_amount: number;
  fund_source?: FundSource;
  status?: BudgetStatus;
  remarks?: string;
}

export interface CreateGEHeaderInput {
  ge_number: string;
  year_id: number;
  division_id: number;
  department_id?: number;
  activity_id?: number;
  aap_line_id?: number;
  request_date: string;
  ge_date: string;
  description: string;
}

export interface CreateGELineInput {
  ge_id: number;
  line_no: number;
  budget_line_id: number;
  account_id: number;
  payee_id?: number;
  detail: string;
  cheque_batch_no?: string;
  amount: number;
  remark?: string;
}

// ============================================
// BUDGET CHECKING
// ============================================

export interface BudgetAvailabilityCheck {
  available: boolean;
  message: string;
  details?: {
    budget: number;
    spent: number;
    committed: number;
    available: number;
  };
}

// ============================================
// HELPER TYPES
// ============================================

export const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
] as const;

export const AAP_STATUSES: AAPStatus[] = ['Draft', 'Submitted', 'Approved', 'Rejected'];
export const BUDGET_STATUSES: BudgetStatus[] = ['Active', 'Frozen', 'Reallocated', 'Cancelled'];
export const FUND_SOURCES: FundSource[] = ['GoPNG', 'Donor', 'Internal Revenue', 'Other'];
