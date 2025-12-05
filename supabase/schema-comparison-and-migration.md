# UNRE HRMS - Schema Comparison & Migration Plan

**Date:** December 5, 2025
**Current Database:** Supabase PostgreSQL
**Reference:** Frappe HRMS v15

---

## Executive Summary

**Current Status:**
- ✅ 17 tables created
- ⚠️ Most tables are empty (need proper structure)
- ❌ Missing critical PNG payroll features
- ❌ Missing comprehensive HR workflows

**Required:** Extend current schema to match Frappe HRMS functionality adapted for PNG University context.

---

## 1. Current Schema Analysis

### Existing Tables:
1. ✅ `employees` - Basic employee data
2. ✅ `departments` - Department structure (8 rows)
3. ✅ `leave_requests` - Leave applications
4. ✅ `attendance` - Daily attendance
5. ✅ `salary_slips` - Payslips
6. ⚠️ `positions` - Empty, needs structure
7. ⚠️ `faculties` - Empty, needs structure
8. ⚠️ `academic_ranks` - Empty, needs structure
9. ⚠️ `employment_types` - Empty, needs structure
10. ⚠️ `payroll` - Empty, needs complete redesign
11. ⚠️ `tax_tables` - Empty, needs PNG tax structure
12. ⚠️ `superannuation_schemes` - Empty, needs structure
13. ⚠️ `leave_types` - Empty, needs structure
14. ⚠️ `leave_allocations` - Empty, needs structure
15. ⚠️ `job_openings` - Empty, needs structure
16. ⚠️ `applicants` - Empty, needs structure
17. ⚠️ `appraisals` - Empty, needs structure

---

## 2. Frappe HRMS Features vs Current Schema

### 2.1 Employee Lifecycle

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Employee Master | `employees` (basic) | ⚠️ Incomplete | HIGH |
| Personal Details | Missing fields | ❌ Need to add | HIGH |
| Educational Qualification | No table | ❌ Need to create | MEDIUM |
| Emergency Contacts | No table | ❌ Need to create | HIGH |
| Documents/Attachments | No table | ❌ Need to create | MEDIUM |
| Employment History | No table | ❌ Need to create | MEDIUM |
| Promotions/Transfers | No table | ❌ Need to create | LOW |
| Exit Management | No proper status | ⚠️ Need to enhance | MEDIUM |

### 2.2 Payroll System (CRITICAL for PNG)

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Salary Structure | No table | ❌ CRITICAL | CRITICAL |
| Salary Components | No table | ❌ CRITICAL | CRITICAL |
| Employee Salary Assignment | No table | ❌ CRITICAL | CRITICAL |
| Tax Tables (PNG-specific) | `tax_tables` (empty) | ❌ CRITICAL | CRITICAL |
| Tax Calculation Engine | No logic | ❌ CRITICAL | CRITICAL |
| Superannuation (Nambawan/NASFUND) | `superannuation_schemes` (empty) | ❌ CRITICAL | CRITICAL |
| Allowances Master | No table | ❌ CRITICAL | CRITICAL |
| Deductions Master | No table | ❌ CRITICAL | CRITICAL |
| Loan Management | No table | ❌ HIGH | HIGH |
| Pay Period | No table | ❌ CRITICAL | CRITICAL |
| Pay Run | `payroll` (empty) | ⚠️ Need redesign | CRITICAL |
| Payslip Generation | `salary_slips` (basic) | ⚠️ Incomplete | CRITICAL |
| BSP Bank File Export | No logic | ❌ CRITICAL | CRITICAL |

### 2.3 Leave Management

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Leave Types | `leave_types` (empty) | ⚠️ Need structure | HIGH |
| Leave Allocation | `leave_allocations` (empty) | ⚠️ Need structure | HIGH |
| Leave Application | `leave_requests` (basic) | ⚠️ Missing workflow | HIGH |
| Leave Approval Workflow | No workflow tables | ❌ Need to create | HIGH |
| Leave Balance Calculation | No logic | ❌ Need to implement | HIGH |
| Leave Encashment | No table | ❌ Need to create | MEDIUM |
| Compensatory Leave | No support | ❌ Need to add | LOW |

### 2.4 Attendance

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Attendance Records | `attendance` (basic) | ⚠️ Incomplete | MEDIUM |
| Shift Management | No table | ❌ Need to create | LOW |
| Overtime Tracking | No fields | ❌ Need to add | MEDIUM |
| Holiday Calendar | No table | ❌ Need to create | MEDIUM |
| Leave Without Pay | No calculation | ❌ Need logic | HIGH |

### 2.5 Recruitment

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Job Opening | `job_openings` (empty) | ⚠️ Need structure | MEDIUM |
| Job Applicant | `applicants` (empty) | ⚠️ Need structure | MEDIUM |
| Job Offer | No table | ❌ Need to create | MEDIUM |
| Interview | No table | ❌ Need to create | LOW |
| Application Status | No workflow | ❌ Need to add | MEDIUM |

### 2.6 Performance Management

| Frappe Feature | Current Schema | Status | Priority |
|----------------|----------------|--------|----------|
| Appraisal Template | No table | ❌ Need to create | LOW |
| Appraisal | `appraisals` (empty) | ⚠️ Need structure | LOW |
| Goals/KRAs | No table | ❌ Need to create | LOW |
| Training/CPD | No table | ❌ Need to create | LOW |

---

## 3. Critical Missing Tables (Priority 1 - MUST HAVE)

### 3.1 Payroll Tables (PNG-Specific)

```sql
-- Salary structure definitions
CREATE TABLE salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position_id UUID REFERENCES positions(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Salary components (earnings and deductions)
CREATE TABLE salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'deduction')),
  component_type TEXT, -- basic, allowance, tax, super, loan
  is_taxable BOOLEAN DEFAULT true,
  calculation_formula TEXT,
  amount NUMERIC(12,2),
  is_active BOOLEAN DEFAULT true
);

-- Employee-specific salary assignment
CREATE TABLE employee_salary_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  salary_structure_id UUID REFERENCES salary_structures(id),
  basic_salary NUMERIC(12,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT true
);

-- PNG Tax tables (configurable)
CREATE TABLE png_tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  min_income NUMERIC(12,2) NOT NULL,
  max_income NUMERIC(12,2),
  tax_rate NUMERIC(5,2) NOT NULL,
  base_tax NUMERIC(12,2) DEFAULT 0,
  effective_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true
);

-- Superannuation schemes
CREATE TABLE super_schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- Nambawan Super, NASFUND
  employer_rate NUMERIC(5,2) NOT NULL, -- 8.4%
  employee_rate NUMERIC(5,2),
  code TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Allowance definitions
CREATE TABLE allowance_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_taxable BOOLEAN DEFAULT true,
  default_amount NUMERIC(12,2)
);

-- Employee allowances
CREATE TABLE employee_allowances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  allowance_type_id UUID REFERENCES allowance_types(id),
  amount NUMERIC(12,2) NOT NULL,
  effective_from DATE,
  effective_to DATE
);

-- Loan management
CREATE TABLE employee_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  loan_type TEXT,
  principal_amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2),
  monthly_deduction NUMERIC(12,2),
  start_date DATE,
  total_paid NUMERIC(12,2) DEFAULT 0,
  balance NUMERIC(12,2),
  status TEXT DEFAULT 'active'
);

-- Pay periods
CREATE TABLE pay_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  period_type TEXT CHECK (period_type IN ('monthly', 'fortnightly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  payment_date DATE,
  status TEXT DEFAULT 'draft', -- draft, processing, approved, paid
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pay runs (replaces current payroll table)
CREATE TABLE pay_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_period_id UUID REFERENCES pay_periods(id),
  run_date TIMESTAMPTZ DEFAULT NOW(),
  processed_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft', -- draft, processed, approved, locked
  total_gross NUMERIC(12,2),
  total_deductions NUMERIC(12,2),
  total_net NUMERIC(12,2),
  notes TEXT
);

-- Individual payslip items (enhanced)
CREATE TABLE payslip_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pay_run_id UUID REFERENCES pay_runs(id),
  employee_id UUID REFERENCES employees(id),
  basic_salary NUMERIC(12,2),
  total_allowances NUMERIC(12,2),
  gross_pay NUMERIC(12,2),
  tax_amount NUMERIC(12,2),
  super_employer NUMERIC(12,2),
  super_employee NUMERIC(12,2),
  loan_deductions NUMERIC(12,2),
  other_deductions NUMERIC(12,2),
  total_deductions NUMERIC(12,2),
  net_pay NUMERIC(12,2),
  payment_method TEXT DEFAULT 'bank_transfer',
  bank_account TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payslip line items (detailed breakdown)
CREATE TABLE payslip_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payslip_id UUID REFERENCES payslip_details(id),
  component_id UUID REFERENCES salary_components(id),
  component_name TEXT,
  amount NUMERIC(12,2),
  type TEXT CHECK (type IN ('earning', 'deduction'))
);
```

### 3.2 Enhanced Employee Tables

```sql
-- Extend employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS middle_name TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Papua New Guinean',
ADD COLUMN IF NOT EXISTS passport_number TEXT,
ADD COLUMN IF NOT EXISTS national_id TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT,
ADD COLUMN IF NOT EXISTS address_line1 TEXT,
ADD COLUMN IF NOT EXISTS address_line2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS work_email TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT,
ADD COLUMN IF NOT EXISTS mobile_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS tax_file_number TEXT,
ADD COLUMN IF NOT EXISTS super_scheme_id UUID REFERENCES super_schemes(id),
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
ADD COLUMN IF NOT EXISTS termination_date DATE,
ADD COLUMN IF NOT EXISTS termination_reason TEXT,
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id),
ADD COLUMN IF NOT EXISTS academic_rank_id UUID REFERENCES academic_ranks(id),
ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Employee education
CREATE TABLE employee_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  institution TEXT NOT NULL,
  qualification TEXT NOT NULL,
  field_of_study TEXT,
  year_completed INTEGER,
  grade TEXT,
  documents TEXT[],
  is_verified BOOLEAN DEFAULT false
);

-- Employee documents
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  expiry_date DATE
);

-- Employment history
CREATE TABLE employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  action_type TEXT NOT NULL, -- hired, promoted, transferred, contract_renewed
  effective_date DATE NOT NULL,
  previous_position TEXT,
  new_position TEXT,
  previous_department TEXT,
  new_department TEXT,
  previous_salary NUMERIC(12,2),
  new_salary NUMERIC(12,2),
  reason TEXT,
  approved_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Enhanced Leave Management

```sql
-- Define leave types properly
ALTER TABLE leave_types
ADD COLUMN IF NOT EXISTS code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS max_days_per_year INTEGER,
ADD COLUMN IF NOT EXISTS carry_forward BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_carry_forward_days INTEGER,
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS approval_levels INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Leave allocations
ALTER TABLE leave_allocations
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS leave_type_id UUID REFERENCES leave_types(id),
ADD COLUMN IF NOT EXISTS year INTEGER,
ADD COLUMN IF NOT EXISTS total_days NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS used_days NUMERIC(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS balance NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS carry_forward_days NUMERIC(5,2) DEFAULT 0;

-- Enhanced leave requests
ALTER TABLE leave_requests
ADD COLUMN IF NOT EXISTS leave_type_id UUID REFERENCES leave_types(id),
ADD COLUMN IF NOT EXISTS total_days NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS leave_approver_1 UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS approval_status_1 TEXT,
ADD COLUMN IF NOT EXISTS leave_approver_2 UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS approval_status_2 TEXT,
ADD COLUMN IF NOT EXISTS hr_approved_by UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS hr_approval_status TEXT;

-- Leave approval workflow
CREATE TABLE leave_approval_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_request_id UUID REFERENCES leave_requests(id),
  approver_id UUID REFERENCES employees(id),
  approval_level INTEGER,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  comments TEXT,
  action_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Migration Priority & Execution Plan

### Phase 1: Critical Payroll (Week 1)
**Priority: CRITICAL - Must complete first**

```bash
# Step 1: Create payroll tables
supabase/migrations/002_payroll_system.sql

# Step 2: Seed PNG tax tables
supabase/migrations/003_png_tax_tables.sql

# Step 3: Seed superannuation schemes
supabase/migrations/004_super_schemes.sql

# Step 4: Create allowances & deductions
supabase/migrations/005_allowances_deductions.sql
```

**Deliverables:**
- ✅ PNG tax calculation engine
- ✅ Salary structure management
- ✅ Pay run processing
- ✅ BSP file generation

### Phase 2: Enhanced Employee Management (Week 2)
**Priority: HIGH**

```bash
# Extend employees table
supabase/migrations/006_employee_enhancements.sql

# Add related tables
supabase/migrations/007_employee_education_documents.sql
```

**Deliverables:**
- ✅ Complete employee profiles
- ✅ Document management
- ✅ Employment history

### Phase 3: Complete Leave System (Week 2-3)
**Priority: HIGH**

```bash
# Enhance leave tables
supabase/migrations/008_leave_system_complete.sql
```

**Deliverables:**
- ✅ Multi-level approval workflow
- ✅ Leave balance tracking
- ✅ Leave types configuration

### Phase 4: Organizational Structure (Week 3)
**Priority: MEDIUM**

```bash
# Define faculties, positions, ranks
supabase/migrations/009_organizational_structure.sql
```

**Deliverables:**
- ✅ Faculty hierarchy
- ✅ Position grades
- ✅ Academic rank progression

### Phase 5: Recruitment & Performance (Week 4)
**Priority: MEDIUM-LOW**

```bash
# Recruitment module
supabase/migrations/010_recruitment.sql

# Performance management
supabase/migrations/011_performance.sql
```

---

## 5. RLS (Row Level Security) Implementation

**Critical for multi-tenant security:**

```sql
-- Example RLS policies

-- Employees: See own record + department members (if manager)
CREATE POLICY employee_select_policy ON employees
FOR SELECT USING (
  id = auth.uid() OR
  department IN (
    SELECT department FROM employees
    WHERE id = auth.uid() AND position LIKE '%Manager%'
  ) OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('HR', 'Admin')
  )
);

-- Payroll: Only HR and Payroll roles
CREATE POLICY payroll_select_policy ON payslip_details
FOR SELECT USING (
  employee_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('HR', 'Payroll', 'Admin')
  )
);

-- Leave requests: Own requests + approvers + HR
CREATE POLICY leave_requests_policy ON leave_requests
FOR SELECT USING (
  employee_id = auth.uid() OR
  leave_approver_1 = auth.uid() OR
  leave_approver_2 = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('HR', 'Admin')
  )
);
```

---

## 6. Next Steps - Immediate Actions

### This Week:
1. ✅ Create comprehensive migration files
2. ✅ Implement PNG payroll engine
3. ✅ Build salary structure UI
4. ✅ Create pay run processing logic
5. ✅ Implement BSP file generator

### Migration Files to Create:
```
supabase/migrations/
├── 002_payroll_system.sql (PRIORITY 1)
├── 003_png_tax_tables.sql (PRIORITY 1)
├── 004_super_schemes.sql (PRIORITY 1)
├── 005_allowances_deductions.sql (PRIORITY 1)
├── 006_employee_enhancements.sql (PRIORITY 2)
├── 007_employee_education_documents.sql (PRIORITY 2)
├── 008_leave_system_complete.sql (PRIORITY 2)
├── 009_organizational_structure.sql (PRIORITY 3)
├── 010_recruitment.sql (PRIORITY 4)
├── 011_performance.sql (PRIORITY 4)
└── 012_rls_policies.sql (PRIORITY 1)
```

---

## 7. Summary

**Current State:**
- Basic tables exist but lack proper structure
- No payroll engine
- No PNG tax calculation
- Basic leave management only

**Required:**
- Complete PNG payroll system with tax engine
- Enhanced employee management
- Multi-level leave approval
- BSP bank file generation
- Comprehensive HRMS matching Frappe features

**Estimated Effort:**
- Phase 1 (Payroll): 1-2 weeks
- Phase 2-3 (Core HR): 1-2 weeks
- Phase 4-5 (Additional): 1-2 weeks
- **Total: 4-6 weeks for complete system**

**Next Action:** Start creating migration files, beginning with payroll system.
