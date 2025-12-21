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
