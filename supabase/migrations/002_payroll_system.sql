-- =====================================================
-- PNG UNRE HRMS - Payroll System Tables
-- Migration 002: Complete Payroll Infrastructure
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. SALARY STRUCTURES
-- =====================================================

-- Salary structure templates (by position/grade)
CREATE TABLE IF NOT EXISTS salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  position_id UUID REFERENCES positions(id),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT unique_structure_name UNIQUE(name)
);

COMMENT ON TABLE salary_structures IS 'Salary structure templates for different positions';

-- =====================================================
-- 2. SALARY COMPONENTS
-- =====================================================

-- Master list of all salary components (earnings & deductions)
CREATE TABLE IF NOT EXISTS salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
  component_category TEXT, -- basic, allowance, tax, superannuation, loan, statutory
  is_taxable BOOLEAN DEFAULT true,
  is_fixed BOOLEAN DEFAULT false,
  default_amount NUMERIC(12,2),
  calculation_formula TEXT, -- For computed components
  depends_on_component_id UUID REFERENCES salary_components(id),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_component_type CHECK (
    component_category IN (
      'basic', 'allowance', 'overtime', 'bonus',
      'tax', 'superannuation', 'loan', 'statutory',
      'other_deduction'
    )
  )
);

COMMENT ON TABLE salary_components IS 'Master list of all salary earnings and deduction components';

-- =====================================================
-- 3. SALARY STRUCTURE COMPONENTS
-- =====================================================

-- Components assigned to each salary structure
CREATE TABLE IF NOT EXISTS salary_structure_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salary_structure_id UUID NOT NULL REFERENCES salary_structures(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES salary_components(id),
  amount NUMERIC(12,2),
  percentage NUMERIC(5,2), -- If calculated as percentage
  based_on_component_id UUID REFERENCES salary_components(id),
  condition_formula TEXT,
  is_active BOOLEAN DEFAULT true,
  CONSTRAINT unique_structure_component UNIQUE(salary_structure_id, component_id)
);

COMMENT ON TABLE salary_structure_components IS 'Components that make up each salary structure';

-- =====================================================
-- 4. EMPLOYEE SALARY ASSIGNMENT
-- =====================================================

-- Assign salary structure to employees
CREATE TABLE IF NOT EXISTS employee_salary_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  salary_structure_id UUID REFERENCES salary_structures(id),
  basic_salary NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  CONSTRAINT check_salary_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE employee_salary_details IS 'Employee salary assignments with effective dates';

CREATE INDEX idx_employee_salary_active ON employee_salary_details(employee_id, is_active);
CREATE INDEX idx_employee_salary_dates ON employee_salary_details(effective_from, effective_to);

-- =====================================================
-- 5. EMPLOYEE-SPECIFIC SALARY COMPONENTS
-- =====================================================

-- Employee-specific overrides or additional components
CREATE TABLE IF NOT EXISTS employee_salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES salary_components(id),
  amount NUMERIC(12,2),
  percentage NUMERIC(5,2),
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  CONSTRAINT check_component_dates CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

COMMENT ON TABLE employee_salary_components IS 'Employee-specific salary component overrides';

CREATE INDEX idx_emp_components ON employee_salary_components(employee_id, is_active);

-- =====================================================
-- 6. PAY PERIODS
-- =====================================================

-- Pay period definitions
CREATE TABLE IF NOT EXISTS pay_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('monthly', 'fortnightly', 'weekly')),
  year INTEGER NOT NULL,
  month INTEGER, -- For monthly periods
  period_number INTEGER, -- For fortnightly/weekly
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  CONSTRAINT unique_pay_period UNIQUE(period_type, year, month, period_number)
);

COMMENT ON TABLE pay_periods IS 'Payroll processing periods';

CREATE INDEX idx_pay_period_dates ON pay_periods(start_date, end_date);
CREATE INDEX idx_pay_period_status ON pay_periods(status);

-- =====================================================
-- 7. PAY RUNS
-- =====================================================

-- Pay run batches
CREATE TABLE IF NOT EXISTS pay_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id) ON DELETE RESTRICT,
  run_number INTEGER DEFAULT 1, -- For re-runs
  run_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'approved', 'locked', 'cancelled')),
  total_employees INTEGER DEFAULT 0,
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  total_employer_super NUMERIC(15,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  locked_at TIMESTAMPTZ,
  locked_by UUID
);

COMMENT ON TABLE pay_runs IS 'Payroll run batches';

CREATE INDEX idx_pay_run_period ON pay_runs(pay_period_id);
CREATE INDEX idx_pay_run_status ON pay_runs(status);

-- =====================================================
-- 8. PAYSLIP DETAILS
-- =====================================================

-- Individual employee payslips
CREATE TABLE IF NOT EXISTS payslip_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_run_id UUID NOT NULL REFERENCES pay_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id),
  employee_code TEXT,
  employee_name TEXT,
  department TEXT,
  position TEXT,

  -- Salary components
  basic_salary NUMERIC(12,2) DEFAULT 0,
  total_allowances NUMERIC(12,2) DEFAULT 0,
  total_overtime NUMERIC(12,2) DEFAULT 0,
  total_bonuses NUMERIC(12,2) DEFAULT 0,
  gross_pay NUMERIC(12,2) DEFAULT 0,

  -- Deductions
  tax_amount NUMERIC(12,2) DEFAULT 0,
  super_employee NUMERIC(12,2) DEFAULT 0,
  super_employer NUMERIC(12,2) DEFAULT 0,
  loan_deductions NUMERIC(12,2) DEFAULT 0,
  statutory_deductions NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,

  -- Net pay
  net_pay NUMERIC(12,2) DEFAULT 0,

  -- Payment details
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_name TEXT,
  bank_account_number TEXT,

  -- Leave information
  lwop_days NUMERIC(5,2) DEFAULT 0, -- Leave Without Pay
  lwop_amount NUMERIC(12,2) DEFAULT 0,

  -- Tracking
  is_final BOOLEAN DEFAULT false,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_payslip UNIQUE(pay_run_id, employee_id)
);

COMMENT ON TABLE payslip_details IS 'Individual employee payslips';

CREATE INDEX idx_payslip_employee ON payslip_details(employee_id);
CREATE INDEX idx_payslip_run ON payslip_details(pay_run_id);

-- =====================================================
-- 9. PAYSLIP LINE ITEMS
-- =====================================================

-- Detailed breakdown of each payslip
CREATE TABLE IF NOT EXISTS payslip_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID NOT NULL REFERENCES payslip_details(id) ON DELETE CASCADE,
  component_id UUID REFERENCES salary_components(id),
  component_code TEXT NOT NULL,
  component_name TEXT NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('earning', 'deduction')),
  amount NUMERIC(12,2) NOT NULL,
  is_taxable BOOLEAN DEFAULT true,
  calculation_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE payslip_line_items IS 'Line-by-line breakdown of payslip components';

CREATE INDEX idx_line_items_payslip ON payslip_line_items(payslip_id);

-- =====================================================
-- 10. BANK EXPORT FILES
-- =====================================================

-- Track bank file exports
CREATE TABLE IF NOT EXISTS bank_export_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_run_id UUID NOT NULL REFERENCES pay_runs(id),
  bank_name TEXT NOT NULL, -- BSP, ANZ, Westpac, etc.
  file_name TEXT NOT NULL,
  file_path TEXT,
  file_format TEXT, -- CSV, TXT, XML
  total_records INTEGER,
  total_amount NUMERIC(15,2),
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by UUID,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'acknowledged', 'processed'))
);

COMMENT ON TABLE bank_export_files IS 'Bank file export tracking';

-- =====================================================
-- 11. ADDITIONAL EARNINGS (One-time payments)
-- =====================================================

-- Additional earnings outside regular salary
CREATE TABLE IF NOT EXISTS additional_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  component_id UUID REFERENCES salary_components(id),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  pay_period_id UUID REFERENCES pay_periods(id),
  is_processed BOOLEAN DEFAULT false,
  processed_in_payslip_id UUID REFERENCES payslip_details(id),
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

COMMENT ON TABLE additional_earnings IS 'One-time additional payments (bonuses, allowances)';

CREATE INDEX idx_additional_earnings_emp ON additional_earnings(employee_id, is_processed);

-- =====================================================
-- 12. ADDITIONAL DEDUCTIONS (One-time deductions)
-- =====================================================

-- Additional deductions outside regular salary
CREATE TABLE IF NOT EXISTS additional_deductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  component_id UUID REFERENCES salary_components(id),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  pay_period_id UUID REFERENCES pay_periods(id),
  is_processed BOOLEAN DEFAULT false,
  processed_in_payslip_id UUID REFERENCES payslip_details(id),
  effective_date DATE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

COMMENT ON TABLE additional_deductions IS 'One-time deductions (fines, garnishments, etc.)';

CREATE INDEX idx_additional_deductions_emp ON additional_deductions(employee_id, is_processed);

-- =====================================================
-- 13. PAYROLL AUDIT LOG
-- =====================================================

-- Track all payroll changes
CREATE TABLE IF NOT EXISTS payroll_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL, -- pay_run, payslip, salary_structure
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- created, updated, approved, locked
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

COMMENT ON TABLE payroll_audit_log IS 'Audit trail for all payroll operations';

CREATE INDEX idx_audit_entity ON payroll_audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_date ON payroll_audit_log(changed_at);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for salary_structures
CREATE TRIGGER update_salary_structures_updated_at
  BEFORE UPDATE ON salary_structures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate gross pay
CREATE OR REPLACE FUNCTION calculate_gross_pay(payslip_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM payslip_line_items
  WHERE payslip_id = payslip_id_param
    AND component_type = 'earning';

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total deductions
CREATE OR REPLACE FUNCTION calculate_total_deductions(payslip_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  total NUMERIC(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0)
  INTO total
  FROM payslip_line_items
  WHERE payslip_id = payslip_id_param
    AND component_type = 'deduction';

  RETURN total;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_salary_structures_active ON salary_structures(is_active);
CREATE INDEX idx_salary_components_type ON salary_components(type, component_category);
CREATE INDEX idx_salary_components_active ON salary_components(is_active);

-- =====================================================
-- GRANTS (For RLS - to be configured separately)
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Note: Specific RLS policies will be created in migration 012_rls_policies.sql

-- =====================================================
-- END OF MIGRATION 002
-- =====================================================
