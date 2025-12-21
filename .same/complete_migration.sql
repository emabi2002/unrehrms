-- =====================================================
-- PNG UNRE HRMS - Foundation Tables
-- Migration 001: Core HR Structure Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FACULTIES
-- =====================================================

CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  dean_id UUID, -- Will reference employees later
  established_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE faculties IS 'University faculties (top-level academic divisions)';

-- =====================================================
-- 2. DEPARTMENTS
-- =====================================================

-- Update existing departments table if needed
ALTER TABLE departments
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 3. ACADEMIC RANKS
-- =====================================================

CREATE TABLE IF NOT EXISTS academic_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rank_level INTEGER NOT NULL, -- 1 = Tutor, 2 = Lecturer, etc.
  min_years_experience INTEGER DEFAULT 0,
  requires_phd BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE academic_ranks IS 'Academic rank progression (Tutor → Professor)';

-- Seed academic ranks
INSERT INTO academic_ranks (code, name, rank_level, min_years_experience, requires_phd, is_active) VALUES
('TUTOR', 'Tutor', 1, 0, false, true),
('ASST_LECTURER', 'Assistant Lecturer', 2, 2, false, true),
('LECTURER', 'Lecturer', 3, 4, false, true),
('SNR_LECTURER', 'Senior Lecturer', 4, 8, true, true),
('ASSOC_PROF', 'Associate Professor', 5, 12, true, true),
('PROFESSOR', 'Professor', 6, 15, true, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 4. EMPLOYMENT TYPES
-- =====================================================

CREATE TABLE IF NOT EXISTS employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_permanent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE employment_types IS 'Types of employment contracts';

-- Seed employment types
INSERT INTO employment_types (code, name, description, is_permanent, is_active) VALUES
('PERM_ACADEMIC', 'Permanent Academic', 'Full-time permanent academic staff', true, true),
('PERM_ADMIN', 'Permanent Administrative', 'Full-time permanent administrative staff', true, true),
('PERM_TECHNICAL', 'Permanent Technical', 'Full-time permanent technical staff', true, true),
('CONTRACT', 'Contract', 'Fixed-term contract', false, true),
('CASUAL', 'Casual', 'Casual/hourly employment', false, true),
('PART_TIME', 'Part-time', 'Part-time employment', false, true),
('VISITING', 'Visiting Faculty', 'Visiting academic staff', false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. POSITIONS (Job Positions/Grades)
-- =====================================================

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  academic_rank_id UUID REFERENCES academic_ranks(id),
  employment_type_id UUID REFERENCES employment_types(id),

  -- Salary grade
  grade_level TEXT,
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),

  -- Position details
  reports_to_position_id UUID REFERENCES positions(id),
  is_management BOOLEAN DEFAULT false,
  is_academic BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE positions IS 'Job positions and grades';

CREATE INDEX idx_positions_department ON positions(department_id);
CREATE INDEX idx_positions_rank ON positions(academic_rank_id);

-- =====================================================
-- 6. UPDATE EMPLOYEES TABLE
-- =====================================================

-- Add missing columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id),
ADD COLUMN IF NOT EXISTS academic_rank_id UUID REFERENCES academic_ranks(id),
ADD COLUMN IF NOT EXISTS employment_type_id UUID REFERENCES employment_types(id),
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES positions(id),
ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Papua New Guinean',
ADD COLUMN IF NOT EXISTS tax_file_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS probation_end_date DATE;

-- =====================================================
-- 7. SEED SAMPLE FACULTIES
-- =====================================================

INSERT INTO faculties (code, name, description, is_active) VALUES
('FES', 'Faculty of Environmental Sciences', 'Research and teaching in environmental sustainability, climate change, and conservation', true),
('FNR', 'Faculty of Natural Resources', 'Forestry, wildlife management, and natural resource conservation', true),
('FAG', 'Faculty of Agriculture', 'Sustainable agriculture, crop science, and food security research', true),
('FADM', 'Administrative Division', 'University administration and support services', true),
('FIT', 'IT Division', 'Information technology and systems', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 8. UPDATE DEPARTMENTS WITH FACULTIES
-- =====================================================

-- Link existing departments to faculties
DO $$
DECLARE
  fes_id UUID;
  fnr_id UUID;
  fag_id UUID;
  fadm_id UUID;
  fit_id UUID;
BEGIN
  -- Get faculty IDs
  SELECT id INTO fes_id FROM faculties WHERE code = 'FES';
  SELECT id INTO fnr_id FROM faculties WHERE code = 'FNR';
  SELECT id INTO fag_id FROM faculties WHERE code = 'FAG';
  SELECT id INTO fadm_id FROM faculties WHERE code = 'FADM';
  SELECT id INTO fit_id FROM faculties WHERE code = 'FIT';

  -- Update departments (if they exist)
  UPDATE departments SET
    code = 'ENV_SCI',
    faculty_id = fes_id
  WHERE name LIKE '%Environmental Sciences%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'NAT_RES',
    faculty_id = fnr_id
  WHERE name LIKE '%Natural Resources%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'AGRIC',
    faculty_id = fag_id
  WHERE name LIKE '%Agriculture%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'ADMIN',
    faculty_id = fadm_id
  WHERE name LIKE '%Administrative%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'IT',
    faculty_id = fit_id
  WHERE name LIKE '%IT%' AND faculty_id IS NULL;
END $$;

-- =====================================================
-- 9. SEED SAMPLE POSITIONS
-- =====================================================

-- Academic positions
DO $$
DECLARE
  tutor_rank_id UUID;
  lecturer_rank_id UUID;
  snr_lecturer_rank_id UUID;
  assoc_prof_rank_id UUID;
  professor_rank_id UUID;
  perm_academic_type_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO tutor_rank_id FROM academic_ranks WHERE code = 'TUTOR';
  SELECT id INTO lecturer_rank_id FROM academic_ranks WHERE code = 'LECTURER';
  SELECT id INTO snr_lecturer_rank_id FROM academic_ranks WHERE code = 'SNR_LECTURER';
  SELECT id INTO assoc_prof_rank_id FROM academic_ranks WHERE code = 'ASSOC_PROF';
  SELECT id INTO professor_rank_id FROM academic_ranks WHERE code = 'PROFESSOR';
  SELECT id INTO perm_academic_type_id FROM employment_types WHERE code = 'PERM_ACADEMIC';

  -- Create positions
  INSERT INTO positions (code, title, academic_rank_id, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('PROF-01', 'Professor', professor_rank_id, perm_academic_type_id, 'A1', 95000, 130000, true, true),
  ('ASSOC-01', 'Associate Professor', assoc_prof_rank_id, perm_academic_type_id, 'A2', 80000, 105000, true, true),
  ('SNR-LEC-01', 'Senior Lecturer', snr_lecturer_rank_id, perm_academic_type_id, 'A3', 70000, 90000, true, true),
  ('LEC-01', 'Lecturer', lecturer_rank_id, perm_academic_type_id, 'A4', 55000, 75000, true, true),
  ('TUTOR-01', 'Tutor', tutor_rank_id, perm_academic_type_id, 'A5', 40000, 55000, true, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Administrative positions
DO $$
DECLARE
  perm_admin_type_id UUID;
BEGIN
  SELECT id INTO perm_admin_type_id FROM employment_types WHERE code = 'PERM_ADMIN';

  INSERT INTO positions (code, title, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('HR-MGR-01', 'HR Manager', perm_admin_type_id, 'M1', 60000, 80000, false, true),
  ('HR-OFF-01', 'HR Officer', perm_admin_type_id, 'S1', 45000, 60000, false, true),
  ('ADMIN-01', 'Administrative Officer', perm_admin_type_id, 'S2', 40000, 55000, false, true),
  ('ADMIN-ASST-01', 'Administrative Assistant', perm_admin_type_id, 'S3', 30000, 45000, false, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Technical positions
DO $$
DECLARE
  perm_tech_type_id UUID;
BEGIN
  SELECT id INTO perm_tech_type_id FROM employment_types WHERE code = 'PERM_TECHNICAL';

  INSERT INTO positions (code, title, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('IT-MGR-01', 'IT Manager', perm_tech_type_id, 'T1', 65000, 85000, false, true),
  ('SYS-ADMIN-01', 'Systems Administrator', perm_tech_type_id, 'T2', 55000, 70000, false, true),
  ('TECH-OFF-01', 'Technical Officer', perm_tech_type_id, 'T3', 45000, 60000, false, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- =====================================================
-- 10. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_faculties_active ON faculties(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_faculty ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_academic_ranks_level ON academic_ranks(rank_level);
CREATE INDEX IF NOT EXISTS idx_employees_faculty ON employees(faculty_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_reports_to ON employees(reports_to);

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

-- Update updated_at timestamp function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_faculties_updated_at ON faculties;
CREATE TRIGGER update_faculties_updated_at
  BEFORE UPDATE ON faculties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION 001
-- =====================================================

-- Test output
DO $$
BEGIN
  RAISE NOTICE '✅ Foundation tables created successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - faculties (5 seeded)';
  RAISE NOTICE '  - academic_ranks (6 seeded)';
  RAISE NOTICE '  - employment_types (7 seeded)';
  RAISE NOTICE '  - positions (12 seeded)';
  RAISE NOTICE '  - Updated: departments, employees';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Migration 002 (Payroll System)';
END $$;
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
-- =====================================================
-- PNG UNRE HRMS - PNG Tax System
-- Migration 003: Papua New Guinea Salary & Wages Tax
-- =====================================================

-- =====================================================
-- 1. PNG TAX BRACKETS (Graduated Tax Rates)
-- =====================================================

-- PNG tax brackets for graduated tax calculation
CREATE TABLE IF NOT EXISTS png_tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year INTEGER NOT NULL,
  bracket_number INTEGER NOT NULL,
  min_income NUMERIC(12,2) NOT NULL,
  max_income NUMERIC(12,2), -- NULL for highest bracket
  tax_rate NUMERIC(5,2) NOT NULL, -- Percentage
  base_tax NUMERIC(12,2) DEFAULT 0, -- Tax on previous brackets
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_bracket UNIQUE(tax_year, bracket_number),
  CONSTRAINT check_income_range CHECK (max_income IS NULL OR max_income > min_income)
);

COMMENT ON TABLE png_tax_brackets IS 'PNG graduated income tax brackets';

-- =====================================================
-- 2. SEED 2025 PNG TAX BRACKETS
-- =====================================================

-- Current PNG tax brackets (2025)
-- Based on PNG IRC Salary & Wages Tax Schedule
INSERT INTO png_tax_brackets (tax_year, bracket_number, min_income, max_income, tax_rate, base_tax, is_active) VALUES
-- Bracket 1: K0 - K12,500 (0%)
(2025, 1, 0.00, 12500.00, 0.00, 0.00, true),

-- Bracket 2: K12,501 - K20,000 (22%)
(2025, 2, 12500.01, 20000.00, 22.00, 0.00, true),

-- Bracket 3: K20,001 - K33,000 (30%)
(2025, 3, 20000.01, 33000.00, 30.00, 1650.00, true),

-- Bracket 4: K33,001 - K70,000 (35%)
(2025, 4, 33000.01, 70000.00, 35.00, 5550.00, true),

-- Bracket 5: K70,001 - K250,000 (40%)
(2025, 5, 70000.01, 250000.00, 40.00, 18500.00, true),

-- Bracket 6: Over K250,000 (42%)
(2025, 6, 250000.01, NULL, 42.00, 90500.00, true);

-- =====================================================
-- 3. TAX EXEMPTIONS & REBATES
-- =====================================================

CREATE TABLE IF NOT EXISTS png_tax_exemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year INTEGER NOT NULL,
  exemption_type TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2),
  percentage NUMERIC(5,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE png_tax_exemptions IS 'PNG tax exemptions and rebates';

-- Seed common exemptions
INSERT INTO png_tax_exemptions (tax_year, exemption_type, description, amount, is_active) VALUES
(2025, 'personal_rebate', 'Personal tax rebate', 0.00, true),
(2025, 'dependent_rebate', 'Dependent allowance rebate', 0.00, true);

-- =====================================================
-- 4. TAX CALCULATION HISTORY
-- =====================================================

-- Store tax calculations for audit
CREATE TABLE IF NOT EXISTS tax_calculation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  payslip_id UUID REFERENCES payslip_details(id),
  pay_period_id UUID REFERENCES pay_periods(id),

  -- Income breakdown
  annual_gross_income NUMERIC(12,2),
  monthly_gross_income NUMERIC(12,2),
  fortnightly_gross_income NUMERIC(12,2),

  -- Tax calculation
  taxable_income NUMERIC(12,2),
  tax_bracket_id UUID REFERENCES png_tax_brackets(id),
  tax_bracket_number INTEGER,
  tax_rate NUMERIC(5,2),
  base_tax NUMERIC(12,2),
  tax_on_excess NUMERIC(12,2),
  total_annual_tax NUMERIC(12,2),
  period_tax NUMERIC(12,2), -- Tax for this period

  -- Exemptions applied
  exemptions_applied JSONB,
  total_exemptions NUMERIC(12,2),

  -- Final calculation
  net_tax_payable NUMERIC(12,2),

  calculation_method TEXT, -- 'annual', 'monthly', 'fortnightly'
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculation_notes TEXT
);

COMMENT ON TABLE tax_calculation_history IS 'Audit trail for tax calculations';

CREATE INDEX idx_tax_calc_employee ON tax_calculation_history(employee_id);
CREATE INDEX idx_tax_calc_period ON tax_calculation_history(pay_period_id);

-- =====================================================
-- 5. TAX CONFIGURATION
-- =====================================================

-- System-wide tax configuration
CREATE TABLE IF NOT EXISTS tax_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  description TEXT,
  data_type TEXT CHECK (data_type IN ('text', 'number', 'boolean', 'json')),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE tax_configuration IS 'Tax system configuration settings';

-- Seed tax configuration
INSERT INTO tax_configuration (config_key, config_value, description, data_type, is_active) VALUES
('current_tax_year', '2025', 'Current tax year', 'number', true),
('tax_calculation_method', 'graduated', 'Tax calculation method', 'text', true),
('apply_personal_rebate', 'false', 'Apply personal rebate', 'boolean', true),
('tax_rounding_method', 'nearest', 'Tax rounding method (nearest, up, down)', 'text', true),
('minimum_taxable_income', '12500.00', 'Minimum annual income before tax applies', 'number', true);

-- =====================================================
-- 6. EMPLOYEE TAX DECLARATIONS
-- =====================================================

-- Employee tax-related information
CREATE TABLE IF NOT EXISTS employee_tax_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  tax_year INTEGER NOT NULL,

  -- TIN (Tax Identification Number)
  tax_file_number TEXT,
  tin_verified BOOLEAN DEFAULT false,

  -- Exemptions claimed
  claim_personal_rebate BOOLEAN DEFAULT false,
  number_of_dependents INTEGER DEFAULT 0,

  -- Tax residency
  tax_resident_status TEXT DEFAULT 'resident', -- resident, non-resident
  country_of_residence TEXT DEFAULT 'Papua New Guinea',

  -- Other income sources
  has_other_income BOOLEAN DEFAULT false,
  other_income_description TEXT,
  estimated_other_income NUMERIC(12,2),

  -- Declaration
  declared_at TIMESTAMPTZ,
  declaration_signed BOOLEAN DEFAULT false,
  signature_data TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_emp_tax_year UNIQUE(employee_id, tax_year)
);

COMMENT ON TABLE employee_tax_declarations IS 'Employee tax declarations and TIN information';

CREATE INDEX idx_emp_tax_decl ON employee_tax_declarations(employee_id, tax_year);

-- =====================================================
-- 7. TAX FUNCTIONS
-- =====================================================

-- Function to calculate PNG tax for a given annual income
CREATE OR REPLACE FUNCTION calculate_png_tax(
  annual_income NUMERIC,
  tax_year_param INTEGER DEFAULT 2025
)
RETURNS TABLE(
  tax_bracket INTEGER,
  tax_amount NUMERIC,
  tax_rate NUMERIC,
  effective_rate NUMERIC
) AS $$
DECLARE
  bracket RECORD;
  total_tax NUMERIC := 0;
  taxable_amount NUMERIC;
  tax_on_bracket NUMERIC;
BEGIN
  -- If income is below minimum threshold, no tax
  IF annual_income <= 12500 THEN
    RETURN QUERY SELECT 1, 0.00::NUMERIC, 0.00::NUMERIC, 0.00::NUMERIC;
    RETURN;
  END IF;

  -- Loop through tax brackets
  FOR bracket IN
    SELECT * FROM png_tax_brackets
    WHERE tax_year = tax_year_param AND is_active = true
    ORDER BY bracket_number
  LOOP
    -- If income exceeds this bracket
    IF annual_income > bracket.min_income THEN
      -- Calculate taxable amount in this bracket
      IF bracket.max_income IS NULL OR annual_income <= bracket.max_income THEN
        taxable_amount := annual_income - bracket.min_income;
      ELSE
        taxable_amount := bracket.max_income - bracket.min_income;
      END IF;

      -- Calculate tax on this bracket
      tax_on_bracket := (taxable_amount * bracket.tax_rate / 100);
      total_tax := bracket.base_tax + tax_on_bracket;

      -- If this is the final bracket, return
      IF bracket.max_income IS NULL OR annual_income <= bracket.max_income THEN
        RETURN QUERY SELECT
          bracket.bracket_number,
          ROUND(total_tax, 2),
          bracket.tax_rate,
          ROUND((total_tax / annual_income * 100), 2);
        RETURN;
      END IF;
    END IF;
  END LOOP;

  -- Default return if no brackets matched
  RETURN QUERY SELECT 0, 0.00::NUMERIC, 0.00::NUMERIC, 0.00::NUMERIC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_png_tax IS 'Calculate PNG graduated tax for annual income';

-- Function to get monthly tax from annual income
CREATE OR REPLACE FUNCTION calculate_monthly_tax(
  annual_income NUMERIC,
  tax_year_param INTEGER DEFAULT 2025
)
RETURNS NUMERIC AS $$
DECLARE
  annual_tax NUMERIC;
BEGIN
  SELECT tax_amount INTO annual_tax
  FROM calculate_png_tax(annual_income, tax_year_param);

  RETURN ROUND(annual_tax / 12, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_monthly_tax IS 'Calculate monthly tax from annual income';

-- Function to get fortnightly tax from annual income
CREATE OR REPLACE FUNCTION calculate_fortnightly_tax(
  annual_income NUMERIC,
  tax_year_param INTEGER DEFAULT 2025
)
RETURNS NUMERIC AS $$
DECLARE
  annual_tax NUMERIC;
BEGIN
  SELECT tax_amount INTO annual_tax
  FROM calculate_png_tax(annual_income, tax_year_param);

  RETURN ROUND(annual_tax / 26, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_fortnightly_tax IS 'Calculate fortnightly tax from annual income';

-- =====================================================
-- 8. TAX REPORTING TABLES
-- =====================================================

-- Annual tax summaries for reporting
CREATE TABLE IF NOT EXISTS annual_tax_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  tax_year INTEGER NOT NULL,

  total_gross_income NUMERIC(12,2),
  total_taxable_income NUMERIC(12,2),
  total_tax_withheld NUMERIC(12,2),
  total_super_contributions NUMERIC(12,2),

  start_date DATE,
  end_date DATE,

  generated_at TIMESTAMPTZ DEFAULT NOW(),
  is_final BOOLEAN DEFAULT false,

  CONSTRAINT unique_emp_annual_tax UNIQUE(employee_id, tax_year)
);

COMMENT ON TABLE annual_tax_summaries IS 'Annual tax summaries for PAYE reporting';

-- =====================================================
-- 9. INDEXES
-- =====================================================

CREATE INDEX idx_tax_brackets_year ON png_tax_brackets(tax_year, is_active);
CREATE INDEX idx_tax_exemptions_year ON png_tax_exemptions(tax_year, is_active);

-- =====================================================
-- 10. TEST THE TAX CALCULATION
-- =====================================================

-- Test tax calculation for common salary ranges
DO $$
DECLARE
  test_income NUMERIC;
  result RECORD;
BEGIN
  -- Test various income levels
  FOR test_income IN
    SELECT unnest(ARRAY[15000, 25000, 50000, 85000, 150000, 300000]::NUMERIC[])
  LOOP
    SELECT * INTO result FROM calculate_png_tax(test_income, 2025);
    RAISE NOTICE 'Income: K% -> Tax: K% (Rate: % percent, Effective: % percent)',
      test_income, result.tax_amount, result.tax_rate, result.effective_rate;
  END LOOP;
END $$;

-- =====================================================
-- END OF MIGRATION 003
-- =====================================================

/*
EXPECTED TAX CALCULATIONS (2025 PNG Tax Table):

Annual Income -> Annual Tax
K15,000 -> K550.00 (22% on K2,500)
K25,000 -> K3,150.00 (30% on K5,000 + K1,650 base)
K50,000 -> K11,500.00 (35% on K17,000 + K5,550 base)
K85,000 -> K24,250.00 (40% on K15,000 + K18,500 base)
K150,000 -> K50,500.00 (40% on K80,000 + K18,500 base)
K300,000 -> K111,500.00 (42% on K50,000 + K90,500 base)

Monthly tax = Annual tax / 12
Fortnightly tax = Annual tax / 26
*/
-- =====================================================
-- PNG UNRE HRMS - Superannuation System
-- Migration 004: PNG Superannuation Schemes
-- =====================================================

-- =====================================================
-- 1. SUPERANNUATION SCHEMES MASTER
-- =====================================================

-- Superannuation scheme definitions (Nambawan, NASFUND, etc.)
CREATE TABLE IF NOT EXISTS super_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,

  -- Contribution rates
  employer_rate NUMERIC(5,2) NOT NULL, -- e.g., 8.4%
  employee_rate NUMERIC(5,2) DEFAULT 0, -- Optional employee contribution
  min_employee_rate NUMERIC(5,2) DEFAULT 0,
  max_employee_rate NUMERIC(5,2),

  -- Contact details
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,

  -- Account details for payments
  bank_name TEXT,
  bank_account_number TEXT,
  bank_bsb TEXT,
  payment_reference_format TEXT, -- e.g., "UNRE-{MONTH}-{YEAR}"

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE super_schemes IS 'Superannuation scheme definitions';

-- =====================================================
-- 2. SEED PNG SUPERANNUATION SCHEMES
-- =====================================================

-- Nambawan Super
INSERT INTO super_schemes (
  code,
  name,
  description,
  employer_rate,
  employee_rate,
  contact_email,
  website_url,
  is_active,
  is_default
) VALUES (
  'NAMBAWAN',
  'Nambawan Super Limited',
  'Papua New Guinea''s largest superannuation fund',
  8.4, -- Statutory employer contribution
  0.0,
  'enquiries@nambawansuper.com.pg',
  'https://www.nambawansuper.com.pg',
  true,
  true
);

-- NASFUND
INSERT INTO super_schemes (
  code,
  name,
  description,
  employer_rate,
  employee_rate,
  contact_email,
  website_url,
  is_active,
  is_default
) VALUES (
  'NASFUND',
  'National Superannuation Fund (Nasfund)',
  'Papua New Guinea superannuation fund',
  8.4, -- Statutory employer contribution
  0.0,
  'enquiry@nasfund.com.pg',
  'https://www.nasfund.com.pg',
  true,
  false
);

-- =====================================================
-- 3. EMPLOYEE SUPER SCHEME MEMBERSHIP
-- =====================================================

-- Track which super scheme each employee is enrolled in
CREATE TABLE IF NOT EXISTS employee_super_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  super_scheme_id UUID NOT NULL REFERENCES super_schemes(id),

  -- Member details
  member_number TEXT, -- Employee's member ID with the fund
  membership_start_date DATE NOT NULL,
  membership_end_date DATE,

  -- Contribution preferences
  employee_voluntary_rate NUMERIC(5,2) DEFAULT 0, -- Additional voluntary contributions
  salary_sacrifice_amount NUMERIC(12,2) DEFAULT 0, -- Pre-tax salary sacrifice

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_emp_super_active UNIQUE(employee_id, is_active)
);

COMMENT ON TABLE employee_super_memberships IS 'Employee superannuation scheme enrollments';

CREATE INDEX idx_emp_super_member ON employee_super_memberships(employee_id, is_active);
CREATE INDEX idx_super_scheme_members ON employee_super_memberships(super_scheme_id, is_active);

-- =====================================================
-- 4. SUPERANNUATION CONTRIBUTIONS
-- =====================================================

-- Track super contributions per pay period
CREATE TABLE IF NOT EXISTS super_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  pay_period_id UUID NOT NULL REFERENCES pay_periods(id),
  payslip_id UUID REFERENCES payslip_details(id),
  super_scheme_id UUID NOT NULL REFERENCES super_schemes(id),

  -- Contribution breakdown
  gross_salary NUMERIC(12,2) NOT NULL,
  taxable_salary NUMERIC(12,2) NOT NULL,

  -- Employer contribution (statutory 8.4%)
  employer_contribution_rate NUMERIC(5,2),
  employer_contribution_amount NUMERIC(12,2),

  -- Employee contribution
  employee_contribution_rate NUMERIC(5,2) DEFAULT 0,
  employee_contribution_amount NUMERIC(12,2) DEFAULT 0,

  -- Salary sacrifice (pre-tax)
  salary_sacrifice_amount NUMERIC(12,2) DEFAULT 0,

  -- Total
  total_contribution NUMERIC(12,2),

  -- Payment tracking
  payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN ('pending', 'approved', 'paid', 'failed')
  ),
  payment_date DATE,
  payment_reference TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_emp_period_super UNIQUE(employee_id, pay_period_id)
);

COMMENT ON TABLE super_contributions IS 'Superannuation contributions per pay period';

CREATE INDEX idx_super_contrib_emp ON super_contributions(employee_id);
CREATE INDEX idx_super_contrib_period ON super_contributions(pay_period_id);
CREATE INDEX idx_super_contrib_status ON super_contributions(payment_status);

-- =====================================================
-- 5. SUPER PAYMENT BATCHES
-- =====================================================

-- Group super contributions for payment to funds
CREATE TABLE IF NOT EXISTS super_payment_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  super_scheme_id UUID NOT NULL REFERENCES super_schemes(id),
  pay_period_id UUID REFERENCES pay_periods(id),

  -- Batch details
  batch_number TEXT NOT NULL UNIQUE,
  batch_date DATE NOT NULL,
  total_members INTEGER,
  total_amount NUMERIC(15,2),

  -- Breakdown
  total_employer_contributions NUMERIC(15,2),
  total_employee_contributions NUMERIC(15,2),
  total_salary_sacrifice NUMERIC(15,2),

  -- Payment details
  payment_method TEXT, -- bank_transfer, cheque
  payment_reference TEXT,
  payment_date DATE,

  -- File export
  export_file_name TEXT,
  export_file_path TEXT,
  exported_at TIMESTAMPTZ,

  status TEXT DEFAULT 'draft' CHECK (
    status IN ('draft', 'approved', 'sent', 'acknowledged', 'completed')
  ),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  approved_at TIMESTAMPTZ,
  approved_by UUID
);

COMMENT ON TABLE super_payment_batches IS 'Batched super fund payments';

CREATE INDEX idx_super_batch_scheme ON super_payment_batches(super_scheme_id);
CREATE INDEX idx_super_batch_status ON super_payment_batches(status);

-- =====================================================
-- 6. SUPER BATCH LINE ITEMS
-- =====================================================

-- Individual contributions in a payment batch
CREATE TABLE IF NOT EXISTS super_batch_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES super_payment_batches(id) ON DELETE CASCADE,
  contribution_id UUID NOT NULL REFERENCES super_contributions(id),
  employee_id UUID NOT NULL REFERENCES employees(id),

  member_number TEXT,
  employee_name TEXT,
  employer_contribution NUMERIC(12,2),
  employee_contribution NUMERIC(12,2),
  salary_sacrifice NUMERIC(12,2),
  total_amount NUMERIC(12,2),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE super_batch_line_items IS 'Individual contributions in super payment batches';

CREATE INDEX idx_super_batch_items ON super_batch_line_items(batch_id);

-- =====================================================
-- 7. SUPER CONFIGURATION
-- =====================================================

-- System-wide super configuration
CREATE TABLE IF NOT EXISTS super_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT,
  description TEXT,
  data_type TEXT CHECK (data_type IN ('text', 'number', 'boolean', 'json')),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE super_configuration IS 'Superannuation system configuration';

-- Seed super configuration
INSERT INTO super_configuration (config_key, config_value, description, data_type, is_active) VALUES
('statutory_employer_rate', '8.4', 'Statutory employer contribution rate (%)', 'number', true),
('allow_employee_contributions', 'true', 'Allow employee voluntary contributions', 'boolean', true),
('allow_salary_sacrifice', 'true', 'Allow pre-tax salary sacrifice', 'boolean', true),
('super_calculation_base', 'gross_salary', 'Base for super calculation (gross_salary, taxable_salary)', 'text', true),
('payment_frequency', 'monthly', 'Super payment frequency', 'text', true);

-- =====================================================
-- 8. SUPER CALCULATION FUNCTIONS
-- =====================================================

-- Calculate employer super contribution
CREATE OR REPLACE FUNCTION calculate_employer_super(
  gross_salary NUMERIC,
  employer_rate NUMERIC DEFAULT 8.4
)
RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(gross_salary * employer_rate / 100, 2);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_employer_super IS 'Calculate statutory employer super contribution';

-- Calculate employee voluntary super contribution
CREATE OR REPLACE FUNCTION calculate_employee_super(
  gross_salary NUMERIC,
  employee_rate NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF employee_rate > 0 THEN
    RETURN ROUND(gross_salary * employee_rate / 100, 2);
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_employee_super IS 'Calculate employee voluntary super contribution';

-- Get employee's active super scheme
CREATE OR REPLACE FUNCTION get_employee_super_scheme(employee_id_param UUID)
RETURNS TABLE(
  scheme_id UUID,
  scheme_code TEXT,
  scheme_name TEXT,
  member_number TEXT,
  employer_rate NUMERIC,
  employee_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ss.id,
    ss.code,
    ss.name,
    esm.member_number,
    ss.employer_rate,
    COALESCE(esm.employee_voluntary_rate, 0.0)
  FROM employee_super_memberships esm
  JOIN super_schemes ss ON esm.super_scheme_id = ss.id
  WHERE esm.employee_id = employee_id_param
    AND esm.is_active = true
    AND ss.is_active = true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_employee_super_scheme IS 'Get employee''s active superannuation scheme';

-- =====================================================
-- 9. SUPER REPORTING VIEWS
-- =====================================================

-- Summary of super contributions by scheme
CREATE OR REPLACE VIEW super_contributions_summary AS
SELECT
  ss.code AS scheme_code,
  ss.name AS scheme_name,
  pp.name AS pay_period,
  pp.payment_date,
  COUNT(DISTINCT sc.employee_id) AS total_members,
  SUM(sc.employer_contribution_amount) AS total_employer,
  SUM(sc.employee_contribution_amount) AS total_employee,
  SUM(sc.salary_sacrifice_amount) AS total_salary_sacrifice,
  SUM(sc.total_contribution) AS total_contributions
FROM super_contributions sc
JOIN super_schemes ss ON sc.super_scheme_id = ss.id
JOIN pay_periods pp ON sc.pay_period_id = pp.id
GROUP BY ss.code, ss.name, pp.name, pp.payment_date
ORDER BY pp.payment_date DESC;

COMMENT ON VIEW super_contributions_summary IS 'Summary of super contributions by scheme and period';

-- Employee super contribution history
CREATE OR REPLACE VIEW employee_super_history AS
SELECT
  e.employee_id,
  e.first_name || ' ' || e.last_name AS employee_name,
  ss.name AS scheme_name,
  pp.name AS pay_period,
  sc.gross_salary,
  sc.employer_contribution_amount,
  sc.employee_contribution_amount,
  sc.salary_sacrifice_amount,
  sc.total_contribution,
  sc.payment_status,
  sc.payment_date
FROM super_contributions sc
JOIN employees e ON sc.employee_id = e.id
JOIN super_schemes ss ON sc.super_scheme_id = ss.id
JOIN pay_periods pp ON sc.pay_period_id = pp.id
ORDER BY e.employee_id, pp.payment_date DESC;

COMMENT ON VIEW employee_super_history IS 'Employee superannuation contribution history';

-- =====================================================
-- 10. TRIGGERS
-- =====================================================

-- Update updated_at on super_schemes
CREATE TRIGGER update_super_schemes_updated_at
  BEFORE UPDATE ON super_schemes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at on employee_super_memberships
CREATE TRIGGER update_emp_super_memberships_updated_at
  BEFORE UPDATE ON employee_super_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. TEST SUPER CALCULATIONS
-- =====================================================

DO $$
DECLARE
  test_salary NUMERIC;
  employer_super NUMERIC;
  total_super NUMERIC;
BEGIN
  -- Test super calculations for common salaries
  FOR test_salary IN
    SELECT unnest(ARRAY[50000, 75000, 100000, 150000]::NUMERIC[])
  LOOP
    employer_super := calculate_employer_super(test_salary, 8.4);
    total_super := test_salary + employer_super;

    RAISE NOTICE 'Salary: K% -> Employer Super (8.4 percent): K% -> Total: K%',
      test_salary, employer_super, total_super;
  END LOOP;
END $$;

-- =====================================================
-- END OF MIGRATION 004
-- =====================================================

/*
EXPECTED SUPER CALCULATIONS (8.4% employer contribution):

Annual Salary -> Employer Super -> Total Package
K50,000 -> K4,200 -> K54,200
K75,000 -> K6,300 -> K81,300
K100,000 -> K8,400 -> K108,400
K150,000 -> K12,600 -> K162,600

Monthly employer super = (Monthly salary × 8.4%)
Fortnightly employer super = (Fortnightly salary × 8.4%)
*/
-- =====================================================
-- Migration 005: Emergency Contacts & Document Management (FIXED)
-- Created: December 10, 2025
-- Fixed: Removed CONSTRAINT with WHERE clause, using partial index instead
-- =====================================================

-- =====================================================
-- 1. EMERGENCY CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,

  -- Contact Details
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,

  -- Priority
  priority INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee ON emergency_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts(is_primary) WHERE is_primary = true;

-- Create unique partial index to ensure only one primary contact per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_primary_contact ON emergency_contacts(employee_id) WHERE is_primary = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. DOCUMENT TYPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  is_mandatory BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT false,
  default_access_level TEXT DEFAULT 'employee_visible',

  category TEXT,
  display_order INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true
);

-- Insert default document types
INSERT INTO document_types (code, name, description, is_mandatory, requires_expiry, category, display_order) VALUES
('employment_contract', 'Employment Contract', 'Official employment contract', true, false, 'Employment', 1),
('offer_letter', 'Offer Letter', 'Job offer letter', true, false, 'Employment', 2),
('national_id', 'National ID', 'PNG National ID card', true, true, 'Identification', 3),
('passport', 'Passport', 'International passport', false, true, 'Identification', 4),
('drivers_license', 'Driver''s License', 'Driving license', false, true, 'Identification', 5),
('degree_certificate', 'Degree Certificate', 'Academic degree certificate', false, false, 'Education', 6),
('professional_cert', 'Professional Certificate', 'Professional certification', false, true, 'Education', 7),
('medical_clearance', 'Medical Clearance', 'Medical fitness certificate', true, true, 'Health', 8),
('police_clearance', 'Police Clearance', 'Police clearance certificate', true, true, 'Clearance', 9),
('tax_clearance', 'Tax Clearance', 'Tax clearance certificate', false, true, 'Compliance', 10),
('bank_details', 'Bank Details', 'Bank account information', true, false, 'Financial', 11),
('nda', 'Non-Disclosure Agreement', 'NDA signed document', false, false, 'Legal', 12),
('code_of_conduct', 'Code of Conduct', 'Code of conduct acknowledgement', true, false, 'Policy', 13),
('reference_letter', 'Reference Letter', 'Employment reference letter', false, false, 'Reference', 14),
('training_cert', 'Training Certificate', 'Training completion certificate', false, true, 'Training', 15),
('work_permit', 'Visa/Work Permit', 'Work authorization document', false, true, 'Immigration', 16),
('resignation_letter', 'Resignation Letter', 'Formal resignation letter', false, false, 'Exit', 17),
('other', 'Other Document', 'Other miscellaneous document', false, false, 'Other', 18)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. EMPLOYEE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,

  -- Document Details
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,

  -- Document Information
  uploaded_by UUID REFERENCES employees(id),
  issue_date DATE,
  expiry_date DATE,
  document_number TEXT,
  issuing_authority TEXT,

  -- Security & Access
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'employee_visible',
  status TEXT DEFAULT 'active',

  -- Version Control
  version INTEGER DEFAULT 1,
  replaced_by_document_id UUID REFERENCES employee_documents(id),
  replaces_document_id UUID REFERENCES employee_documents(id),

  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_employee_documents_updated_at
BEFORE UPDATE ON employee_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENHANCE EMPLOYEES TABLE
-- =====================================================

-- Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS drivers_license TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified_date DATE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_employees_national_id ON employees(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_passport ON employees(passport_number) WHERE passport_number IS NOT NULL;

-- =====================================================
-- 5. UTILITY FUNCTIONS
-- =====================================================

-- Function to get documents expiring soon
CREATE OR REPLACE FUNCTION get_expiring_documents(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  employee_id UUID,
  employee_name TEXT,
  document_type TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.id,
    ed.employee_id,
    (e.first_name || ' ' || e.last_name) as employee_name,
    ed.document_type,
    ed.document_name,
    ed.expiry_date,
    (ed.expiry_date - CURRENT_DATE) as days_until_expiry
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.status = 'active'
    AND ed.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY ed.expiry_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get expired documents
CREATE OR REPLACE FUNCTION get_expired_documents()
RETURNS TABLE (
  id UUID,
  employee_id UUID,
  employee_name TEXT,
  document_type TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_expired INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.id,
    ed.employee_id,
    (e.first_name || ' ' || e.last_name) as employee_name,
    ed.document_type,
    ed.document_name,
    ed.expiry_date,
    (CURRENT_DATE - ed.expiry_date) as days_expired
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.status = 'active'
    AND ed.expiry_date < CURRENT_DATE
  ORDER BY ed.expiry_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_contacts
-- Note: These are basic policies. Adjust based on your authentication setup.

-- Allow employees to view and manage their own emergency contacts
CREATE POLICY emergency_contacts_select_own ON emergency_contacts
  FOR SELECT USING (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_insert_own ON emergency_contacts
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_update_own ON emergency_contacts
  FOR UPDATE USING (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_delete_own ON emergency_contacts
  FOR DELETE USING (true); -- Adjust based on your auth

-- RLS Policies for employee_documents
CREATE POLICY employee_documents_select ON employee_documents
  FOR SELECT USING (true); -- Adjust based on access_level and user role

CREATE POLICY employee_documents_insert ON employee_documents
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth

CREATE POLICY employee_documents_update ON employee_documents
  FOR UPDATE USING (true); -- Adjust based on your auth

CREATE POLICY employee_documents_delete ON employee_documents
  FOR DELETE USING (true); -- Adjust based on your auth

-- RLS Policies for document_types
CREATE POLICY document_types_select ON document_types
  FOR SELECT USING (true); -- Everyone can view document types

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Migration 005 (FIXED): Emergency Contacts and Document Management completed successfully' AS status;
-- =====================================================
-- MIGRATION 006: Comprehensive HRMS Tables (FINAL - WORKING)
-- Created: December 10, 2025
-- Fixed: Proper RLS policy creation (PostgreSQL compatible)
-- =====================================================

-- =====================================================
-- 1. CORE HR - POSITIONS & ORGANIZATIONAL STRUCTURE
-- =====================================================

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  position_code TEXT UNIQUE NOT NULL,
  position_title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),

  reports_to_position_id UUID REFERENCES positions(id),

  job_family TEXT,
  job_grade TEXT,
  employment_type TEXT CHECK (employment_type IN ('permanent', 'contract', 'temporary', 'intern')),

  approved_headcount INTEGER DEFAULT 1,
  current_headcount INTEGER DEFAULT 0,

  min_salary NUMERIC(12,2),
  mid_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS work_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  location_code TEXT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  location_type TEXT CHECK (location_type IN ('head_office', 'branch', 'campus', 'remote')),

  address TEXT,
  city TEXT,
  province TEXT,
  country TEXT DEFAULT 'Papua New Guinea',

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS job_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  family_code TEXT UNIQUE NOT NULL,
  family_name TEXT NOT NULL,
  description TEXT,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS job_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  grade_code TEXT UNIQUE NOT NULL,
  grade_name TEXT NOT NULL,
  grade_level INTEGER,

  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),

  description TEXT,
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 2. RECRUITMENT & TALENT ACQUISITION
-- =====================================================

CREATE TABLE IF NOT EXISTS job_requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  requisition_number TEXT UNIQUE NOT NULL,
  position_id UUID REFERENCES positions(id),
  department_id UUID REFERENCES departments(id),

  requested_by UUID REFERENCES employees(id),
  number_of_positions INTEGER DEFAULT 1,
  employment_type TEXT,
  justification TEXT,

  status TEXT CHECK (status IN ('draft', 'pending_hod', 'pending_hr', 'pending_ceo', 'approved', 'rejected')) DEFAULT 'draft',
  approved_by_hod UUID REFERENCES employees(id),
  approved_by_hr UUID REFERENCES employees(id),
  approved_by_ceo UUID REFERENCES employees(id),
  approval_date DATE,

  budget_code TEXT,
  estimated_salary NUMERIC(12,2)
);

CREATE TABLE IF NOT EXISTS job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_requisition_id UUID REFERENCES job_requisitions(id),
  position_id UUID REFERENCES positions(id),

  job_title TEXT NOT NULL,
  job_description TEXT,
  requirements TEXT,

  posting_date DATE DEFAULT CURRENT_DATE,
  closing_date DATE,
  is_internal BOOLEAN DEFAULT false,
  is_external BOOLEAN DEFAULT true,

  status TEXT CHECK (status IN ('draft', 'active', 'closed', 'filled')) DEFAULT 'draft'
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,

  resume_url TEXT,
  linkedin_url TEXT,

  source TEXT,
  referred_by UUID REFERENCES employees(id),

  status TEXT CHECK (status IN ('new', 'screening', 'interviewing', 'offered', 'hired', 'rejected')) DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  job_posting_id UUID REFERENCES job_postings(id),
  candidate_id UUID REFERENCES candidates(id),

  application_date DATE DEFAULT CURRENT_DATE,
  cover_letter TEXT,

  screening_score INTEGER,
  screening_notes TEXT,

  status TEXT CHECK (status IN ('applied', 'screening', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected')) DEFAULT 'applied',

  UNIQUE(job_posting_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  application_id UUID REFERENCES applications(id),
  candidate_id UUID REFERENCES candidates(id),

  interview_type TEXT,
  interview_date TIMESTAMPTZ,
  location TEXT,
  meeting_link TEXT,

  interviewers UUID[],

  technical_score INTEGER,
  communication_score INTEGER,
  cultural_fit_score INTEGER,
  overall_score INTEGER,
  interviewer_notes TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),

  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  application_id UUID REFERENCES applications(id),
  candidate_id UUID REFERENCES candidates(id),
  position_id UUID REFERENCES positions(id),

  offer_date DATE DEFAULT CURRENT_DATE,
  offered_salary NUMERIC(12,2),
  start_date DATE,

  offer_letter_url TEXT,
  offer_expiry_date DATE,

  status TEXT CHECK (status IN ('drafted', 'sent', 'accepted', 'rejected', 'expired')) DEFAULT 'drafted',
  response_date DATE,
  candidate_response TEXT
);

-- =====================================================
-- 3. ONBOARDING & OFFBOARDING
-- =====================================================

CREATE TABLE IF NOT EXISTS onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  start_date DATE,

  email_created BOOLEAN DEFAULT false,
  laptop_assigned BOOLEAN DEFAULT false,
  access_granted BOOLEAN DEFAULT false,

  hr_orientation_completed BOOLEAN DEFAULT false,
  policies_acknowledged BOOLEAN DEFAULT false,
  contracts_signed BOOLEAN DEFAULT false,

  team_introduction BOOLEAN DEFAULT false,
  workspace_assigned BOOLEAN DEFAULT false,

  status TEXT CHECK (status IN ('in_progress', 'completed')) DEFAULT 'in_progress',
  completion_date DATE
);

CREATE TABLE IF NOT EXISTS probation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  review_type TEXT CHECK (review_type IN ('mid_probation', 'end_probation')) NOT NULL,
  review_date DATE NOT NULL,
  reviewer_id UUID REFERENCES employees(id),

  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  strengths TEXT,
  areas_for_improvement TEXT,
  recommendation TEXT CHECK (recommendation IN ('confirm', 'extend', 'terminate')),

  decision TEXT CHECK (decision IN ('confirmed', 'extended', 'terminated')),
  decision_date DATE,
  new_end_date DATE
);

CREATE TABLE IF NOT EXISTS resignations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  resignation_date DATE NOT NULL,
  last_working_day DATE,
  notice_period_days INTEGER,

  reason TEXT,
  new_employer TEXT,

  status TEXT CHECK (status IN ('submitted', 'accepted', 'withdrawn')) DEFAULT 'submitted',
  approved_by UUID REFERENCES employees(id),
  approval_date DATE
);

CREATE TABLE IF NOT EXISTS exit_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  resignation_id UUID REFERENCES resignations(id),
  interview_date DATE,
  conducted_by UUID REFERENCES employees(id),

  reason_for_leaving TEXT,
  liked_most TEXT,
  liked_least TEXT,
  suggestions_for_improvement TEXT,
  would_recommend BOOLEAN,
  would_return BOOLEAN,

  overall_satisfaction INTEGER CHECK (overall_satisfaction BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS exit_clearances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  resignation_id UUID REFERENCES resignations(id),

  hr_cleared BOOLEAN DEFAULT false,
  hr_cleared_by UUID REFERENCES employees(id),
  hr_cleared_date DATE,

  finance_cleared BOOLEAN DEFAULT false,
  finance_cleared_by UUID REFERENCES employees(id),
  finance_cleared_date DATE,

  it_cleared BOOLEAN DEFAULT false,
  it_cleared_by UUID REFERENCES employees(id),
  it_cleared_date DATE,

  admin_cleared BOOLEAN DEFAULT false,
  admin_cleared_by UUID REFERENCES employees(id),
  admin_cleared_date DATE,

  final_settlement_amount NUMERIC(12,2),
  settlement_paid BOOLEAN DEFAULT false,
  settlement_paid_date DATE,

  all_cleared BOOLEAN DEFAULT false
);

-- =====================================================
-- 4. TIME & ATTENDANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  shift_code TEXT UNIQUE NOT NULL,
  shift_name TEXT NOT NULL,

  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 0,

  monday BOOLEAN DEFAULT false,
  tuesday BOOLEAN DEFAULT false,
  wednesday BOOLEAN DEFAULT false,
  thursday BOOLEAN DEFAULT false,
  friday BOOLEAN DEFAULT false,
  saturday BOOLEAN DEFAULT false,
  sunday BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  shift_id UUID REFERENCES shifts(id),

  roster_date DATE NOT NULL,

  UNIQUE(employee_id, roster_date)
);

CREATE TABLE IF NOT EXISTS overtime_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  request_date DATE DEFAULT CURRENT_DATE,

  ot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  hours NUMERIC(5,2),
  reason TEXT,

  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approval_date DATE,
  rejection_reason TEXT,

  included_in_payroll BOOLEAN DEFAULT false,
  pay_run_id UUID
);

CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  week_starting DATE NOT NULL,
  week_ending DATE NOT NULL,

  total_hours NUMERIC(6,2) DEFAULT 0,

  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  submitted_date DATE,
  approved_by UUID REFERENCES employees(id),
  approval_date DATE,

  UNIQUE(employee_id, week_starting)
);

CREATE TABLE IF NOT EXISTS timesheet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE,

  entry_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  project_code TEXT,
  task_description TEXT
);

-- =====================================================
-- 5. LEAVE TYPES
-- =====================================================

CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  annual_entitlement_days NUMERIC(5,2),
  accrual_rate TEXT,

  max_consecutive_days INTEGER,
  min_notice_days INTEGER DEFAULT 3,
  requires_documentation BOOLEAN DEFAULT false,
  can_be_negative BOOLEAN DEFAULT false,
  can_carry_forward BOOLEAN DEFAULT false,
  max_carry_forward_days NUMERIC(5,2),

  is_paid BOOLEAN DEFAULT true,

  gender_specific TEXT CHECK (gender_specific IN ('all', 'male', 'female')),

  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_positions_department ON positions(department_id);
CREATE INDEX IF NOT EXISTS idx_positions_reports_to ON positions(reports_to_position_id);
CREATE INDEX IF NOT EXISTS idx_job_requisitions_status ON job_requisitions(status);
CREATE INDEX IF NOT EXISTS idx_applications_candidate ON applications(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_application ON interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_overtime_requests_employee ON overtime_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_employee ON timesheets(employee_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;

-- Drop and recreate basic RLS policies
DROP POLICY IF EXISTS select_all_positions ON positions;
CREATE POLICY select_all_positions ON positions FOR SELECT USING (true);

DROP POLICY IF EXISTS select_all_locations ON work_locations;
CREATE POLICY select_all_locations ON work_locations FOR SELECT USING (true);

DROP POLICY IF EXISTS select_all_leave_types ON leave_types;
CREATE POLICY select_all_leave_types ON leave_types FOR SELECT USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Migration 006 (FINAL): Comprehensive HRMS Tables completed successfully' AS status;
-- =====================================================
-- MIGRATION 007: Performance, Learning, Benefits & Talent
-- Created: December 10, 2025
-- =====================================================

-- =====================================================
-- 6. PERFORMANCE MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  goal_type TEXT CHECK (goal_type IN ('organizational', 'departmental', 'individual')) NOT NULL,
  parent_goal_id UUID REFERENCES performance_goals(id),

  employee_id UUID REFERENCES employees(id),
  department_id UUID REFERENCES departments(id),

  goal_title TEXT NOT NULL,
  goal_description TEXT,
  kpi_metrics TEXT,
  target_value TEXT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  weight_percentage NUMERIC(5,2),

  status TEXT CHECK (status IN ('draft', 'active', 'achieved', 'partially_achieved', 'not_achieved', 'cancelled')) DEFAULT 'draft',
  progress_percentage INTEGER DEFAULT 0,
  actual_value TEXT,

  created_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  cycle_name TEXT NOT NULL,
  cycle_type TEXT CHECK (cycle_type IN ('annual', 'mid_year', 'probation', 'project')) NOT NULL,

  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,

  self_assessment_start DATE,
  self_assessment_end DATE,
  manager_review_start DATE,
  manager_review_end DATE,
  calibration_start DATE,
  calibration_end DATE,

  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed')) DEFAULT 'not_started',

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  appraisal_cycle_id UUID REFERENCES appraisal_cycles(id),

  -- Self Assessment
  self_assessment_completed BOOLEAN DEFAULT false,
  self_assessment_date DATE,
  self_achievements TEXT,
  self_challenges TEXT,
  self_training_needs TEXT,
  self_overall_rating INTEGER,

  -- Manager Review
  manager_id UUID REFERENCES employees(id),
  manager_review_completed BOOLEAN DEFAULT false,
  manager_review_date DATE,
  manager_achievements TEXT,
  manager_areas_improvement TEXT,
  manager_training_recommendations TEXT,
  manager_overall_rating INTEGER,

  -- Competency Ratings
  technical_skills_rating INTEGER,
  communication_rating INTEGER,
  teamwork_rating INTEGER,
  leadership_rating INTEGER,
  problem_solving_rating INTEGER,
  innovation_rating INTEGER,

  -- Final Rating
  final_rating INTEGER,
  final_rating_category TEXT,
  calibrated_by UUID REFERENCES employees(id),
  calibration_date DATE,

  -- Recommendations
  promotion_recommended BOOLEAN DEFAULT false,
  salary_increase_recommended BOOLEAN DEFAULT false,
  salary_increase_percentage NUMERIC(5,2),

  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed', 'acknowledged')) DEFAULT 'not_started',

  acknowledged_by_employee BOOLEAN DEFAULT false,
  employee_comments TEXT,
  acknowledged_date DATE,

  UNIQUE(employee_id, appraisal_cycle_id)
);

CREATE TABLE IF NOT EXISTS feedback_360 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  appraisal_id UUID REFERENCES appraisals(id),
  employee_id UUID REFERENCES employees(id),

  reviewer_id UUID REFERENCES employees(id),
  reviewer_relationship TEXT CHECK (reviewer_relationship IN ('manager', 'peer', 'subordinate', 'external')) NOT NULL,

  leadership_rating INTEGER,
  communication_rating INTEGER,
  collaboration_rating INTEGER,
  technical_rating INTEGER,
  reliability_rating INTEGER,

  strengths TEXT,
  areas_for_improvement TEXT,
  additional_comments TEXT,

  completed BOOLEAN DEFAULT false,
  completed_date DATE,
  is_anonymous BOOLEAN DEFAULT true
);

-- =====================================================
-- 7. LEARNING & DEVELOPMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  course_description TEXT,
  course_category TEXT,

  duration_hours NUMERIC(5,2),
  delivery_method TEXT,

  provider_type TEXT CHECK (provider_type IN ('internal', 'external')) DEFAULT 'internal',
  provider_name TEXT,

  cost_per_person NUMERIC(10,2),
  currency TEXT DEFAULT 'PGK',

  prerequisites TEXT,
  target_audience TEXT,

  certification_provided BOOLEAN DEFAULT false,
  certification_validity_months INTEGER,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_id UUID REFERENCES training_courses(id),
  session_name TEXT NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,

  location TEXT,
  room TEXT,
  online_meeting_link TEXT,

  max_participants INTEGER,
  min_participants INTEGER,

  trainer_id UUID REFERENCES employees(id),
  external_trainer_name TEXT,

  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  total_cost NUMERIC(12,2),
  evaluation_required BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  training_session_id UUID REFERENCES training_sessions(id),

  enrollment_date DATE DEFAULT CURRENT_DATE,
  enrollment_type TEXT CHECK (enrollment_type IN ('self_enrolled', 'manager_nominated', 'mandatory')) DEFAULT 'self_enrolled',
  nominated_by UUID REFERENCES employees(id),

  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  attendance_status TEXT CHECK (attendance_status IN ('enrolled', 'attended', 'partially_attended', 'absent', 'cancelled')) DEFAULT 'enrolled',
  attendance_percentage INTEGER,

  pre_assessment_score NUMERIC(5,2),
  post_assessment_score NUMERIC(5,2),
  passed BOOLEAN,

  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expiry_date DATE,

  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,

  UNIQUE(employee_id, training_session_id)
);

CREATE TABLE IF NOT EXISTS employee_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  certification_name TEXT NOT NULL,
  certification_body TEXT,
  certification_number TEXT,

  issue_date DATE NOT NULL,
  expiry_date DATE,
  renewal_required BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 90,

  certificate_file_url TEXT,

  status TEXT CHECK (status IN ('active', 'expired', 'renewed', 'revoked')) DEFAULT 'active',
  obtained_via_training_session UUID REFERENCES training_sessions(id)
);

CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  skill_name TEXT NOT NULL,
  skill_category TEXT,

  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  years_of_experience NUMERIC(4,1),

  verified_by UUID REFERENCES employees(id),
  verified_date DATE,

  acquired_through_training UUID REFERENCES training_sessions(id),
  last_used_date DATE
);

-- =====================================================
-- 8. BENEFITS & COMPENSATION
-- =====================================================

CREATE TABLE IF NOT EXISTS benefit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  plan_code TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('medical', 'life_insurance', 'housing', 'transport', 'meal', 'education', 'other')) NOT NULL,

  provider_name TEXT,
  provider_contact TEXT,
  policy_number TEXT,

  coverage_details TEXT,
  coverage_amount NUMERIC(12,2),

  eligibility_criteria TEXT,
  min_grade_level INTEGER,
  min_service_months INTEGER,

  employer_contribution_percentage NUMERIC(5,2),
  employee_contribution_percentage NUMERIC(5,2),
  monthly_premium NUMERIC(10,2),

  covers_dependants BOOLEAN DEFAULT false,
  max_dependants INTEGER,

  effective_date DATE,
  end_date DATE,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  benefit_plan_id UUID REFERENCES benefit_plans(id),

  enrollment_date DATE NOT NULL,
  effective_date DATE NOT NULL,

  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')) DEFAULT 'active',

  coverage_amount NUMERIC(12,2),
  employee_contribution NUMERIC(10,2),
  employer_contribution NUMERIC(10,2),

  number_of_dependants INTEGER DEFAULT 0,

  cancellation_date DATE,
  cancellation_reason TEXT,

  UNIQUE(employee_id, benefit_plan_id, enrollment_date)
);

-- =====================================================
-- 9. TALENT MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id) UNIQUE,

  is_high_potential BOOLEAN DEFAULT false,
  is_high_performer BOOLEAN DEFAULT false,
  talent_category TEXT,

  performance_rating INTEGER,
  potential_rating INTEGER,

  career_aspirations TEXT,
  preferred_career_path TEXT,
  mobility_preference TEXT,

  strengths TEXT,
  development_areas TEXT,

  retention_risk TEXT CHECK (retention_risk IN ('low', 'medium', 'high')),
  retention_risk_factors TEXT,

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS critical_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  position_id UUID REFERENCES positions(id),
  current_incumbent UUID REFERENCES employees(id),

  business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  criticality_reason TEXT,

  succession_risk TEXT CHECK (succession_risk IN ('low', 'medium', 'high')) DEFAULT 'medium',
  time_to_fill_months INTEGER,

  key_competencies TEXT,
  experience_required TEXT,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS succession_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  critical_position_id UUID REFERENCES critical_positions(id),
  successor_employee_id UUID REFERENCES employees(id),

  readiness_level TEXT CHECK (readiness_level IN ('ready_now', '1_year', '2_3_years', '3_5_years')) NOT NULL,
  readiness_percentage INTEGER,

  competency_gaps TEXT,
  experience_gaps TEXT,

  development_actions TEXT,
  training_required TEXT,
  mentoring_required BOOLEAN DEFAULT false,
  job_rotation_required BOOLEAN DEFAULT false,

  target_ready_date DATE,

  status TEXT CHECK (status IN ('active', 'on_track', 'delayed', 'completed', 'cancelled')) DEFAULT 'active',

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_appraisals_employee ON appraisals(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_enrollments_employee ON training_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_employee ON talent_profiles(employee_id);

-- Enable RLS
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

SELECT 'Migration 007: Performance, Learning, Benefits & Talent modules completed' AS status;
-- =====================================================
-- MIGRATION 008: Employee Relations, Safety, Travel & Admin
-- Created: December 10, 2025
-- =====================================================

-- =====================================================
-- 10. EMPLOYEE RELATIONS & DISCIPLINE
-- =====================================================

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  grievance_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  grievance_type TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,

  against_employee_id UUID REFERENCES employees(id),
  witnesses TEXT,

  assigned_investigator UUID REFERENCES employees(id),
  investigation_start_date DATE,
  investigation_end_date DATE,
  investigation_findings TEXT,

  resolution_action TEXT,
  resolved_date DATE,
  resolved_by UUID REFERENCES employees(id),

  status TEXT CHECK (status IN ('submitted', 'under_review', 'under_investigation', 'resolved', 'closed', 'dismissed')) DEFAULT 'submitted',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  is_confidential BOOLEAN DEFAULT true,
  supporting_documents_urls TEXT[]
);

CREATE TABLE IF NOT EXISTS disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  action_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  misconduct_type TEXT,
  incident_description TEXT NOT NULL,
  incident_date DATE NOT NULL,

  action_type TEXT CHECK (action_type IN ('verbal_warning', 'first_written', 'final_written', 'suspension', 'demotion', 'termination')) NOT NULL,

  hearing_date DATE,
  hearing_attendees TEXT,
  employee_statement TEXT,
  employee_represented_by TEXT,

  decision TEXT NOT NULL,
  decision_date DATE,
  decided_by UUID REFERENCES employees(id),

  suspension_days INTEGER,
  suspension_start_date DATE,
  suspension_end_date DATE,
  fine_amount NUMERIC(10,2),

  appeal_deadline DATE,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_date DATE,
  appeal_outcome TEXT,

  status TEXT CHECK (status IN ('pending_hearing', 'decision_made', 'under_appeal', 'final', 'cancelled')) DEFAULT 'pending_hearing',

  supporting_documents_urls TEXT[]
);

CREATE TABLE IF NOT EXISTS workplace_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,
  incident_type TEXT,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  incident_description TEXT NOT NULL,

  reported_by UUID REFERENCES employees(id),
  involved_employees UUID[],
  witnesses UUID[],

  requires_investigation BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES employees(id),
  investigation_notes TEXT,

  action_taken TEXT,
  referral_made_to TEXT,

  status TEXT CHECK (status IN ('reported', 'under_investigation', 'action_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  is_confidential BOOLEAN DEFAULT true
);

-- =====================================================
-- 11. HEALTH, SAFETY & WELLBEING
-- =====================================================

CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,
  incident_type TEXT CHECK (incident_type IN ('accident', 'near_miss', 'hazard', 'injury', 'illness')) NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT NOT NULL,
  incident_description TEXT NOT NULL,

  affected_employee_id UUID REFERENCES employees(id),
  affected_person_name TEXT,

  injury_type TEXT,
  body_part_affected TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious', 'critical', 'fatal')),

  first_aid_given BOOLEAN DEFAULT false,
  medical_treatment_required BOOLEAN DEFAULT false,
  hospital_name TEXT,
  days_off_work INTEGER DEFAULT 0,

  reported_by UUID REFERENCES employees(id),
  investigated_by UUID REFERENCES employees(id),
  root_cause_analysis TEXT,

  immediate_action_taken TEXT,
  preventive_measures TEXT,

  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  status TEXT CHECK (status IN ('reported', 'under_investigation', 'actions_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  reportable_to_authorities BOOLEAN DEFAULT false,
  reported_to_authorities BOOLEAN DEFAULT false,
  reporting_reference TEXT
);

CREATE TABLE IF NOT EXISTS safety_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  audit_number TEXT UNIQUE NOT NULL,
  audit_type TEXT,
  audit_date DATE NOT NULL,
  location_id UUID REFERENCES work_locations(id),
  specific_area TEXT,

  auditor_id UUID REFERENCES employees(id),
  external_auditor TEXT,

  total_items_checked INTEGER,
  compliant_items INTEGER,
  non_compliant_items INTEGER,
  observations TEXT,

  overall_risk_rating TEXT CHECK (overall_risk_rating IN ('low', 'medium', 'high', 'critical')),

  corrective_actions_required TEXT,
  action_deadline DATE,
  actions_completed BOOLEAN DEFAULT false,

  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'follow_up_required')) DEFAULT 'scheduled',
  audit_report_url TEXT
);

CREATE TABLE IF NOT EXISTS medical_checkups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  checkup_type TEXT,
  checkup_date DATE NOT NULL,

  medical_provider TEXT,
  doctor_name TEXT,

  fit_for_work BOOLEAN,
  fitness_category TEXT,
  restrictions TEXT,

  next_checkup_date DATE,
  recommendations TEXT,

  medical_report_url TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'overdue')) DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS wellness_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  program_name TEXT NOT NULL,
  program_type TEXT,
  description TEXT,

  start_date DATE,
  end_date DATE,
  frequency TEXT,

  target_participants TEXT,
  max_participants INTEGER,

  provider_name TEXT,
  facilitator_name TEXT,

  cost NUMERIC(10,2),
  cost_covered_by TEXT,

  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 12. TRAVEL & EXPENSE MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS travel_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  request_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  purpose TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT DEFAULT 'Papua New Guinea',

  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  duration_days INTEGER,

  transport_mode TEXT,
  accommodation_required BOOLEAN DEFAULT false,

  estimated_airfare NUMERIC(10,2),
  estimated_accommodation NUMERIC(10,2),
  estimated_meals NUMERIC(10,2),
  estimated_other NUMERIC(10,2),
  estimated_total NUMERIC(10,2),

  budget_code TEXT,
  project_code TEXT,

  status TEXT CHECK (status IN ('draft', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,
  rejection_reason TEXT,

  advance_requested BOOLEAN DEFAULT false,
  advance_amount NUMERIC(10,2),
  advance_paid BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),
  travel_request_id UUID REFERENCES travel_requests(id),

  claim_period_start DATE NOT NULL,
  claim_period_end DATE NOT NULL,

  total_amount NUMERIC(10,2),
  advance_received NUMERIC(10,2) DEFAULT 0,
  net_claim_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - advance_received) STORED,

  submitted_date DATE,

  status TEXT CHECK (status IN ('draft', 'submitted', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'paid')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,
  rejection_reason TEXT,

  payment_method TEXT,
  paid_date DATE,
  payment_reference TEXT
);

CREATE TABLE IF NOT EXISTS expense_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  expense_claim_id UUID REFERENCES expense_claims(id) ON DELETE CASCADE,

  expense_date DATE NOT NULL,
  expense_category TEXT NOT NULL,
  description TEXT NOT NULL,

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',

  receipt_url TEXT,
  receipt_number TEXT,

  approved BOOLEAN,
  approved_amount NUMERIC(10,2),
  rejection_reason TEXT
);

-- =====================================================
-- 13. SYSTEM ADMINISTRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  role_name TEXT UNIQUE NOT NULL,
  role_description TEXT,
  role_level INTEGER,

  permissions JSONB NOT NULL DEFAULT '{}',

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  user_role_id UUID REFERENCES user_roles(id),

  additional_permissions JSONB DEFAULT '{}',

  data_access_scope TEXT CHECK (data_access_scope IN ('all', 'department', 'team', 'self')) DEFAULT 'self',
  department_ids UUID[],

  effective_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,

  is_active BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES employees(id),

  UNIQUE(employee_id, user_role_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  action_type TEXT NOT NULL,
  module TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,

  old_values JSONB,
  new_values JSONB,

  ip_address INET,
  user_agent TEXT,
  session_id TEXT,

  success BOOLEAN DEFAULT true,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'date')) DEFAULT 'text',

  category TEXT,
  description TEXT,

  is_encrypted BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,

  updated_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  holiday_date DATE NOT NULL,
  holiday_name TEXT NOT NULL,
  holiday_type TEXT,

  applies_to_all_locations BOOLEAN DEFAULT true,
  location_ids UUID[],

  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,

  year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(holiday_date, year)
);

-- Insert default user roles
INSERT INTO user_roles (role_name, role_description, role_level, permissions) VALUES
('Super Admin', 'Full system access', 1, '{"all": true}'),
('HR Admin', 'Full HR module access', 2, '{"hr": "full", "payroll": "full", "reports": "full"}'),
('HR Manager', 'HR operations', 2, '{"hr": "manage", "leave": "approve", "reports": "view"}'),
('Finance Manager', 'Payroll and finance', 2, '{"payroll": "manage", "expenses": "approve", "reports": "finance"}'),
('Line Manager', 'Team management', 3, '{"team": "view", "leave": "approve", "attendance": "view", "timesheets": "approve"}'),
('Employee', 'Self-service access', 4, '{"self": "full"}')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
('company_name', 'Papua New Guinea University', 'text', 'general', 'Company name'),
('default_currency', 'PGK', 'text', 'general', 'Default currency'),
('financial_year_start_month', '1', 'number', 'general', 'Financial year start month'),
('probation_period_days', '180', 'number', 'hr', 'Default probation period in days'),
('notice_period_days', '30', 'number', 'hr', 'Default notice period in days'),
('working_hours_per_day', '8', 'number', 'attendance', 'Standard working hours per day'),
('working_days_per_week', '5', 'number', 'attendance', 'Standard working days per week'),
('payroll_cutoff_day', '25', 'number', 'payroll', 'Payroll processing cutoff day')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert PNG Public Holidays for 2025
INSERT INTO public_holidays (holiday_date, holiday_name, year, is_recurring, holiday_type) VALUES
('2025-01-01', 'New Year''s Day', 2025, true, 'national'),
('2025-04-18', 'Good Friday', 2025, false, 'religious'),
('2025-04-19', 'Easter Saturday', 2025, false, 'religious'),
('2025-04-21', 'Easter Monday', 2025, false, 'religious'),
('2025-06-09', 'Queen''s Birthday', 2025, false, 'national'),
('2025-07-23', 'National Remembrance Day', 2025, true, 'national'),
('2025-09-16', 'Independence Day', 2025, true, 'national'),
('2025-12-25', 'Christmas Day', 2025, true, 'religious'),
('2025-12-26', 'Boxing Day', 2025, true, 'national')
ON CONFLICT (holiday_date, year) DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_grievances_employee ON grievances(employee_id);
CREATE INDEX IF NOT EXISTS idx_disciplinary_employee ON disciplinary_actions(employee_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_travel_requests_employee ON travel_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_employee ON expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_employee ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

SELECT 'Migration 008: Employee Relations, Safety, Travel & Admin completed' AS status;
