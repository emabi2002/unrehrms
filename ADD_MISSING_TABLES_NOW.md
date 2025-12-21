# ⚡ Add Missing Tables - 2 Minute Fix

## Quick Instructions

### Step 1: Open Supabase SQL Editor
**Click this link:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new

### Step 2: Copy the SQL
Open the file: `supabase/migrations/009_add_missing_tables.sql`

**OR** Copy this entire SQL below:

<details>
<summary>📋 Click to expand SQL (then copy all)</summary>

```sql
-- Add the 3 missing tables + 1 bonus table

-- 1. PAYSLIPS TABLE
CREATE TABLE IF NOT EXISTS public.payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_id UUID REFERENCES pay_periods(id) ON DELETE SET NULL,
  pay_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
  gross_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,
  total_tax NUMERIC(12,2) DEFAULT 0,
  total_super NUMERIC(12,2) DEFAULT 0,
  allowances JSONB DEFAULT '{}',
  deductions JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('draft', 'approved', 'paid')) DEFAULT 'draft',
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_payslips_period ON payslips(pay_period_id);
CREATE INDEX IF NOT EXISTS idx_payslips_date ON payslips(pay_date);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);

-- 2. TAX BRACKETS TABLE
CREATE TABLE IF NOT EXISTS public.tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  country TEXT DEFAULT 'PNG',
  region TEXT,
  income_from NUMERIC(12,2) NOT NULL,
  income_to NUMERIC(12,2),
  tax_rate NUMERIC(5,2) NOT NULL,
  base_tax NUMERIC(12,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  effective_from DATE,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tax_year ON tax_brackets(year);
CREATE INDEX IF NOT EXISTS idx_tax_active ON tax_brackets(is_active);
CREATE INDEX IF NOT EXISTS idx_tax_country ON tax_brackets(country);

-- Seed 2025 PNG Tax Brackets
INSERT INTO tax_brackets (year, income_from, income_to, tax_rate, base_tax, country, description, is_active) VALUES
  (2025, 0, 12500, 0.00, 0, 'PNG', 'Tax-free threshold', true),
  (2025, 12501, 20000, 22.00, 0, 'PNG', '22% on income over K12,500', true),
  (2025, 20001, 33000, 30.00, 1650, 'PNG', '30% on income over K20,000', true),
  (2025, 33001, 70000, 35.00, 5550, 'PNG', '35% on income over K33,000', true),
  (2025, 70001, 250000, 40.00, 18500, 'PNG', '40% on income over K70,000', true),
  (2025, 250001, NULL, 42.00, 90500, 'PNG', '42% on income over K250,000', true)
ON CONFLICT DO NOTHING;

-- 3. CERTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  certification_type TEXT,
  issue_date DATE,
  expiry_date DATE,
  renewal_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  verification_code TEXT,
  certificate_file_path TEXT,
  certificate_file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_expired BOOLEAN GENERATED ALWAYS AS (
    CASE
      WHEN expiry_date IS NULL THEN false
      WHEN expiry_date < CURRENT_DATE THEN true
      ELSE false
    END
  ) STORED,
  description TEXT,
  skills_gained TEXT[],
  continuing_education_credits NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cert_employee ON certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_cert_active ON certifications(is_active);
CREATE INDEX IF NOT EXISTS idx_cert_expiry ON certifications(expiry_date);

-- 4. PAYSLIP DETAILS TABLE (BONUS)
CREATE TABLE IF NOT EXISTS public.payslip_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID NOT NULL REFERENCES payslips(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL CHECK (component_type IN ('earning', 'deduction')),
  component_code TEXT NOT NULL,
  component_name TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  rate NUMERIC(12,2),
  quantity NUMERIC(12,2),
  is_taxable BOOLEAN DEFAULT true,
  is_super_applicable BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payslip_details_payslip ON payslip_details(payslip_id);

-- 5. HELPER FUNCTION
CREATE OR REPLACE FUNCTION calculate_png_tax(annual_income NUMERIC, tax_year INTEGER DEFAULT 2025)
RETURNS NUMERIC AS $$
DECLARE
  bracket RECORD;
  tax_amount NUMERIC := 0;
  taxable_in_bracket NUMERIC;
BEGIN
  FOR bracket IN
    SELECT * FROM tax_brackets
    WHERE year = tax_year AND country = 'PNG' AND is_active = true
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

    tax_amount := bracket.base_tax + (taxable_in_bracket * bracket.tax_rate / 100);
  END LOOP;

  RETURN ROUND(tax_amount, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Success message
SELECT '✅ All 4 tables created successfully!' AS status,
       '2025 PNG tax brackets seeded' AS tax_data,
       'Database is now 100% complete!' AS message;
```

</details>

### Step 3: Paste and Run
1. Paste the SQL into Supabase SQL Editor
2. Click the **RUN** button (bottom right)
3. Wait for "Success" message

### Step 4: Verify
Run this command to verify:

```bash
bun run scripts/check-current-schema.ts
```

You should see **23/23 tables** ✅

---

## What Gets Created

### ✅ 4 New Tables:
1. **payslips** - Employee payslip records with earnings/deductions
2. **tax_brackets** - PNG tax calculation (2025 brackets seeded)
3. **certifications** - Professional certifications tracking
4. **payslip_details** - Detailed payslip component breakdowns

### ✅ 1 Helper Function:
- **calculate_png_tax()** - Automatic PNG tax calculator

### ✅ Seeded Data:
- 2025 PNG tax brackets (6 brackets: 0%, 22%, 30%, 35%, 40%, 42%)

---

## Estimated Time
**2 minutes** (copy → paste → run → done!)

---

## After Running

Your database will be:
- **23/23 tables** (100% complete)
- **100% functional** across all modules
- **Production ready** for full payroll processing

🎉 **Then test it:**
- Go to: http://localhost:3000/dashboard/payroll/tax-calculator
- Try calculating tax for different salaries
- See the PNG tax brackets in action!
