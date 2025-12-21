-- =====================================================
-- PNG UNRE HRMS - Add Missing Tables
-- VERSION 2 - Fixed RAISE NOTICE error
-- =====================================================
-- What this does:
-- 1. Creates payslips table (links to employee_id)
-- 2. Creates tax_brackets table with 2025 PNG rates
-- 3. Creates certifications table (links to employee_id)
-- 4. Creates PNG tax calculator function
-- =====================================================

-- Clean up existing function first
DROP FUNCTION IF EXISTS calculate_png_tax(NUMERIC, INTEGER);
DROP FUNCTION IF EXISTS calculate_png_tax(NUMERIC);

-- =====================================================
-- 1. PAYSLIPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,

  -- Pay period info
  pay_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,

  -- Amounts (in Kina)
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Breakdown
  total_deductions NUMERIC(12,2) DEFAULT 0,
  total_tax NUMERIC(12,2) DEFAULT 0,
  total_super NUMERIC(12,2) DEFAULT 0,

  -- Status tracking
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_date ON payslips(pay_date DESC);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);

COMMENT ON TABLE payslips IS 'Employee payslip records';

-- =====================================================
-- 2. TAX BRACKETS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tax year
  year INTEGER NOT NULL,
  country TEXT DEFAULT 'PNG',

  -- Bracket range (in Kina)
  income_from NUMERIC(12,2) NOT NULL,
  income_to NUMERIC(12,2),

  -- Tax calculation
  tax_rate NUMERIC(5,2) NOT NULL,
  base_tax NUMERIC(12,2) DEFAULT 0,

  -- Description
  description TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tax_brackets_year ON tax_brackets(year);
CREATE INDEX IF NOT EXISTS idx_tax_brackets_active ON tax_brackets(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_brackets_country ON tax_brackets(country);

COMMENT ON TABLE tax_brackets IS 'Income tax brackets for PNG';

-- Seed 2025 PNG Tax Brackets
INSERT INTO tax_brackets (year, income_from, income_to, tax_rate, base_tax, country, description, is_active)
VALUES
  (2025, 0.00, 12500.00, 0.00, 0.00, 'PNG', 'Tax-free threshold (K0 - K12,500)', true),
  (2025, 12500.01, 20000.00, 22.00, 0.00, 'PNG', '22% on income over K12,500', true),
  (2025, 20000.01, 33000.00, 30.00, 1650.00, 'PNG', '30% on income over K20,000', true),
  (2025, 33000.01, 70000.00, 35.00, 5550.00, 'PNG', '35% on income over K33,000', true),
  (2025, 70000.01, 250000.00, 40.00, 18500.00, 'PNG', '40% on income over K70,000', true),
  (2025, 250000.01, NULL, 42.00, 90500.00, 'PNG', '42% on income over K250,000', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. CERTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id INTEGER NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,

  -- Certification details
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  certification_type TEXT,

  -- Important dates
  issue_date DATE,
  expiry_date DATE,

  -- Credentials
  credential_id TEXT,
  credential_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Additional info
  description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_certifications_employee ON certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_active ON certifications(is_active);
CREATE INDEX IF NOT EXISTS idx_certifications_expiry ON certifications(expiry_date);

COMMENT ON TABLE certifications IS 'Employee professional certifications and licenses';

-- =====================================================
-- 4. PNG TAX CALCULATOR FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_png_tax(
  annual_income NUMERIC,
  tax_year INTEGER DEFAULT 2025
)
RETURNS NUMERIC AS $$
DECLARE
  bracket RECORD;
  calculated_tax NUMERIC := 0;
  taxable_in_bracket NUMERIC;
BEGIN
  IF annual_income IS NULL OR annual_income < 0 THEN
    RETURN 0;
  END IF;

  FOR bracket IN
    SELECT * FROM tax_brackets
    WHERE year = tax_year
      AND country = 'PNG'
      AND is_active = true
    ORDER BY income_from
  LOOP
    IF annual_income <= bracket.income_from THEN
      CONTINUE;
    END IF;

    IF bracket.income_to IS NULL THEN
      taxable_in_bracket := annual_income - bracket.income_from;
    ELSIF annual_income > bracket.income_to THEN
      taxable_in_bracket := bracket.income_to - bracket.income_from;
    ELSE
      taxable_in_bracket := annual_income - bracket.income_from;
    END IF;

    calculated_tax := bracket.base_tax + (taxable_in_bracket * bracket.tax_rate / 100);
  END LOOP;

  RETURN ROUND(calculated_tax, 2);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calculate_png_tax IS 'Calculate PNG income tax for a given annual income';

-- =====================================================
-- 5. SUCCESS MESSAGE (FIXED)
-- =====================================================

DO $$
DECLARE
  test_tax NUMERIC;
BEGIN
  SELECT calculate_png_tax(50000) INTO test_tax;

  RAISE NOTICE '';
  RAISE NOTICE 'Tables created successfully:';
  RAISE NOTICE '   1. payslips';
  RAISE NOTICE '   2. tax_brackets (2025 PNG rates seeded)';
  RAISE NOTICE '   3. certifications';
  RAISE NOTICE '';
  RAISE NOTICE 'Function created: calculate_png_tax()';
  RAISE NOTICE '';
  RAISE NOTICE 'Test calculation for K50,000 annual income:';
  RAISE NOTICE 'Calculated tax: K%', test_tax::TEXT;
  RAISE NOTICE '';
  RAISE NOTICE 'Database is now 100 percent complete!';
END $$;

-- Return success message
SELECT
  'Success! 3 tables created' AS status,
  '2025 PNG tax brackets seeded' AS tax_data,
  'Try: SELECT calculate_png_tax(50000)' AS test_command;
