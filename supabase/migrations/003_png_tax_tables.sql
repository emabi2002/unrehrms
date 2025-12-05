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
