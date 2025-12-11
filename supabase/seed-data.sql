-- =====================================================
-- PNG UNRE HRMS - Master Data Seeding
-- Run this after applying all migrations
-- =====================================================

-- =====================================================
-- 1. SEED PNG TAX BRACKETS (2025)
-- =====================================================

INSERT INTO png_tax_brackets (tax_year, bracket_number, min_income, max_income, tax_rate, base_tax, is_active)
VALUES
  (2025, 1, 0.00, 12500.00, 0.00, 0.00, true),
  (2025, 2, 12500.01, 20000.00, 22.00, 0.00, true),
  (2025, 3, 20000.01, 33000.00, 30.00, 1650.00, true),
  (2025, 4, 33000.01, 70000.00, 35.00, 5550.00, true),
  (2025, 5, 70000.01, 250000.00, 40.00, 18500.00, true),
  (2025, 6, 250000.01, NULL, 42.00, 90500.00, true)
ON CONFLICT (tax_year, bracket_number) DO UPDATE
  SET max_income = EXCLUDED.max_income,
      tax_rate = EXCLUDED.tax_rate,
      base_tax = EXCLUDED.base_tax;

-- =====================================================
-- 2. SEED TAX EXEMPTIONS
-- =====================================================

INSERT INTO png_tax_exemptions (tax_year, exemption_type, description, amount, is_active)
VALUES
  (2025, 'personal_rebate', 'Personal tax rebate', 0.00, true),
  (2025, 'dependent_rebate', 'Dependent allowance rebate', 0.00, true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. SEED TAX CONFIGURATION
-- =====================================================

INSERT INTO tax_configuration (config_key, config_value, description, data_type, is_active)
VALUES
  ('current_tax_year', '2025', 'Current tax year', 'number', true),
  ('tax_calculation_method', 'graduated', 'Tax calculation method', 'text', true),
  ('apply_personal_rebate', 'false', 'Apply personal rebate', 'boolean', true),
  ('tax_rounding_method', 'nearest', 'Tax rounding method (nearest, up, down)', 'text', true),
  ('minimum_taxable_income', '12500.00', 'Minimum annual income before tax applies', 'number', true)
ON CONFLICT (config_key) DO UPDATE
  SET config_value = EXCLUDED.config_value;

-- =====================================================
-- 4. SEED SUPERANNUATION SCHEMES
-- =====================================================

INSERT INTO super_schemes (
  code, name, description,
  employer_rate, min_employee_rate, max_employee_rate,
  contact_email, contact_phone,
  bank_name, bank_account_number,
  is_active
)
VALUES
  (
    'NAMBAWAN',
    'Nambawan Super',
    'Nambawan Super Limited - PNG largest superannuation fund',
    8.4, 0.0, 100.0,
    'info@nambawansuper.com.pg',
    '+675 321 3399',
    'Bank South Pacific',
    'NAMBAWAN-MAIN',
    true
  ),
  (
    'NASFUND',
    'NASFUND',
    'National Superannuation Fund - PNG second largest fund',
    8.4, 0.0, 100.0,
    'info@nasfund.com.pg',
    '+675 309 3900',
    'Bank South Pacific',
    'NASFUND-MAIN',
    true
  )
ON CONFLICT (code) DO UPDATE
  SET employer_rate = EXCLUDED.employer_rate,
      contact_email = EXCLUDED.contact_email,
      contact_phone = EXCLUDED.contact_phone;

-- =====================================================
-- 5. SEED SUPER CONFIGURATION
-- =====================================================

INSERT INTO super_configuration (config_key, config_value, description, data_type, is_active)
VALUES
  ('statutory_employer_rate', '8.4', 'PNG statutory employer contribution rate', 'number', true),
  ('allow_employee_contributions', 'true', 'Allow employee voluntary contributions', 'boolean', true),
  ('allow_salary_sacrifice', 'true', 'Allow salary sacrifice to super', 'boolean', true),
  ('default_scheme_code', 'NAMBAWAN', 'Default super scheme for new employees', 'text', true)
ON CONFLICT (config_key) DO UPDATE
  SET config_value = EXCLUDED.config_value;

-- =====================================================
-- 6. SEED SALARY COMPONENTS
-- =====================================================

INSERT INTO salary_components (
  code, name, type, description, component_category,
  is_taxable, is_fixed, calculation_formula, display_order, is_active
)
VALUES
  -- EARNINGS
  ('BASIC', 'Basic Salary', 'earning', 'Base salary/wages', 'basic', true, true, NULL, 1, true),
  ('HOUSING', 'Housing Allowance', 'earning', 'Housing allowance', 'allowance', true, true, NULL, 2, true),
  ('TRANSPORT', 'Transport Allowance', 'earning', 'Transport/travel allowance', 'allowance', true, true, NULL, 3, true),
  ('ACADEMIC', 'Academic Load Allowance', 'earning', 'Additional payment for extra teaching load', 'allowance', true, false, NULL, 4, true),
  ('RESEARCH', 'Research Allowance', 'earning', 'Research project allowance', 'allowance', true, true, NULL, 5, true),
  ('ACTING', 'Acting Allowance', 'earning', 'Acting in higher position', 'allowance', true, false, NULL, 6, true),
  ('OVERTIME', 'Overtime Pay', 'earning', 'Overtime hours payment', 'overtime', true, false, NULL, 7, true),

  -- DEDUCTIONS
  ('TAX', 'Income Tax (PAYE)', 'deduction', 'PNG salary & wages tax', 'tax', false, false, 'calculate_png_tax', 101, true),
  ('SUPER_EMP', 'Superannuation (Employer)', 'deduction', 'Employer super contribution (8.4%)', 'superannuation', false, false, '8.4%', 102, true),
  ('SUPER_EE', 'Superannuation (Employee)', 'deduction', 'Employee voluntary super contribution', 'superannuation', false, false, NULL, 103, true),
  ('SALARY_SACRIFICE', 'Salary Sacrifice', 'deduction', 'Pre-tax super contribution', 'superannuation', false, false, NULL, 104, true),
  ('LOAN', 'Loan Repayment', 'deduction', 'Staff loan repayment', 'loan', false, false, NULL, 105, true),
  ('ADVANCE', 'Salary Advance', 'deduction', 'Salary advance repayment', 'other_deduction', false, false, NULL, 106, true),
  ('GARNISHMENT', 'Garnishment', 'deduction', 'Court-ordered deduction', 'statutory', false, false, NULL, 107, true)
ON CONFLICT (code) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      component_category = EXCLUDED.component_category;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

DO $$
DECLARE
  tax_count INTEGER;
  super_count INTEGER;
  component_count INTEGER;
BEGIN
  -- Count seeded data
  SELECT COUNT(*) INTO tax_count FROM png_tax_brackets WHERE tax_year = 2025;
  SELECT COUNT(*) INTO super_count FROM super_schemes WHERE is_active = true;
  SELECT COUNT(*) INTO component_count FROM salary_components;

  -- Output results
  RAISE NOTICE '';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'MASTER DATA SEEDING COMPLETE';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'PNG Tax Brackets (2025):    %', tax_count;
  RAISE NOTICE 'Superannuation Schemes:     %', super_count;
  RAISE NOTICE 'Salary Components:          %', component_count;
  RAISE NOTICE '';

  IF tax_count = 6 AND super_count = 2 AND component_count >= 14 THEN
    RAISE NOTICE 'All master data seeded successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Create salary structures';
    RAISE NOTICE '  2. Assign employee salaries';
    RAISE NOTICE '  3. Process payroll runs';
  ELSE
    RAISE WARNING 'Some data may be missing. Expected: 6 tax brackets, 2 super schemes, 14+ components';
  END IF;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- TEST TAX CALCULATIONS
-- =====================================================

DO $$
DECLARE
  result RECORD;
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'TESTING PNG TAX CALCULATIONS';
  RAISE NOTICE '============================================================';
  RAISE NOTICE '';

  FOR result IN
    SELECT * FROM calculate_png_tax(15000, 2025)
    UNION ALL SELECT * FROM calculate_png_tax(50000, 2025)
    UNION ALL SELECT * FROM calculate_png_tax(85000, 2025)
    UNION ALL SELECT * FROM calculate_png_tax(150000, 2025)
  LOOP
    RAISE NOTICE 'Bracket % | Tax: K% | Effective Rate: %', result.tax_bracket, result.tax_amount, result.effective_rate;
  END LOOP;

  RAISE NOTICE '';
END $$;

-- =====================================================
-- END OF SEED DATA
-- =====================================================
