# 🎯 What's Next - PNG UNRE HRMS

## ✅ Completed Successfully

### Database Schema (100% Complete)
- ✅ **Migration 001**: Foundation tables (faculties, positions, ranks) - APPLIED
- ✅ **Migration 002**: Payroll system (13 tables) - APPLIED
- ✅ **Migration 003**: PNG tax engine (6 tables) - APPLIED
- ✅ **Migration 004**: Superannuation (6 tables) - APPLIED
- ✅ **Total**: 29 tables created and verified

### Foundation Data (100% Seeded)
- ✅ 5 Faculties (FES, FNR, FAG, FADM, FIT)
- ✅ 6 Academic Ranks (Tutor → Professor)
- ✅ 7 Employment Types
- ✅ 12 Sample Positions

---

## ⏳ Next Step: Seed Master Data (2 minutes)

### Critical Data Needed:
- ⏳ PNG Tax Brackets (6 brackets for 2025)
- ⏳ Superannuation Schemes (Nambawan & NASFUND)
- ⏳ Salary Components (14 components)

### How to Seed:

**Option 1: Quick (Recommended)**
1. Open: [Supabase SQL Editor](https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql/new)
2. Open file: `supabase/seed-data.sql`
3. Copy all content
4. Paste in SQL Editor
5. Click "RUN"

See **`SEED_MASTER_DATA.md`** for detailed instructions.

---

## 🚀 After Seeding: Build Payroll UI

Once master data is seeded, we'll build:

### Phase 1: Payroll Setup (Week 1)

#### 1. Salary Components Page
**File**: `app/dashboard/payroll/components/page.tsx`
- List all salary components
- Add/edit/delete components
- Toggle component status
- Filter by type (earnings/deductions)

#### 2. Salary Structures Page
**File**: `app/dashboard/payroll/salary-structures/page.tsx`
- Create salary structure templates
- Define structure components
- Set amounts/formulas
- Assign to positions

#### 3. Employee Salary Assignment
**File**: `app/dashboard/payroll/employee-salaries/page.tsx`
- Assign salary structures to employees
- Override specific components
- Set effective dates
- View salary breakdowns

### Phase 2: Payroll Processing (Week 1-2)

#### 4. Pay Periods Page
**File**: `app/dashboard/payroll/pay-periods/page.tsx`
- Create monthly/fortnightly periods
- Set start/end dates
- Lock/unlock periods

#### 5. Pay Run Processing
**File**: `app/dashboard/payroll/pay-runs/page.tsx`
- Create new pay run
- Select period & employees
- Process payroll (calculate tax & super)
- Review before finalizing

#### 6. Pay Run Details
**File**: `app/dashboard/payroll/pay-runs/[id]/page.tsx`
- View all payslips in run
- Edit individual payslips
- Add one-time earnings/deductions
- Finalize & lock pay run

#### 7. Payslips View
**File**: `app/dashboard/payroll/payslips/page.tsx`
- List all payslips
- Filter by employee/period/status
- Download PDF
- Email to employee

#### 8. Individual Payslip
**File**: `app/dashboard/payroll/payslips/[id]/page.tsx`
- Detailed payslip view
- Earnings/deductions breakdown
- PNG tax calculation details
- Super contribution details
- Export PDF

### Phase 3: Tax & Super Management (Week 2)

#### 9. Tax Tables
**File**: `app/dashboard/payroll/tax-tables/page.tsx`
- View PNG tax brackets
- Edit tax rates (admin only)
- Tax calculation preview

#### 10. Tax Calculator
**File**: `app/dashboard/payroll/tax-calculator/page.tsx`
- Input annual income
- See tax breakdown
- Monthly/fortnightly view
- Test different scenarios

#### 11. Super Schemes
**File**: `app/dashboard/payroll/super-schemes/page.tsx`
- Manage super funds
- Edit contribution rates
- Fund contact details

#### 12. Super Contributions
**File**: `app/dashboard/payroll/super-contributions/page.tsx`
- View all contributions
- Filter by fund/period
- Create payment batches

### Phase 4: Bank Integration (Week 2)

#### 13. Bank Exports
**File**: `app/dashboard/payroll/bank-exports/page.tsx`
- Generate BSP bank file
- Download export file
- Track export history

### Phase 5: Reports (Week 2-3)

#### 14. Payroll Reports
**File**: `app/dashboard/payroll/reports/page.tsx`
- Payroll summary report
- Tax summary (PAYE)
- Super summary
- Department payroll costs
- Employee payroll register

---

## 📁 Project Structure

```
app/dashboard/payroll/
├── components/           # Salary components
├── salary-structures/    # Salary templates
├── employee-salaries/    # Employee assignments
├── pay-periods/          # Period management
├── pay-runs/             # Payroll processing
│   └── [id]/            # Pay run details
├── payslips/            # Payslip management
│   └── [id]/            # Individual payslip
├── tax-tables/          # Tax bracket management
├── tax-calculator/      # Tax testing tool
├── super-schemes/       # Super fund management
├── super-contributions/ # Contribution tracking
├── bank-exports/        # BSP file generation
└── reports/             # Payroll reports
```

---

## 🔧 Core Logic to Build

### Payroll Calculator (`src/lib/payroll/payroll-calculator.ts`)
```typescript
export class PayrollCalculator {
  // Calculate gross pay from salary components
  calculateGrossPay(employeeId: string): Promise<number>

  // Calculate PNG tax using database function
  calculateTax(annualIncome: number): Promise<number>

  // Calculate super (employer + employee)
  calculateSuper(grossPay: number, empRate?: number): Promise<SuperCalculation>

  // Calculate net pay
  calculateNetPay(grossPay: number, tax: number, deductions: number): number

  // Process entire pay run
  processPayRun(payRunId: string): Promise<PayRunResult>
}
```

### Tax Engine (`src/lib/payroll/tax-engine.ts`)
```typescript
export class TaxEngine {
  // Get PNG tax bracket for income
  getTaxBracket(annualIncome: number): Promise<TaxBracket>

  // Calculate annual tax
  calculateAnnualTax(income: number): Promise<TaxCalculation>

  // Calculate monthly tax
  calculateMonthlyTax(annualIncome: number): Promise<number>

  // Calculate fortnightly tax
  calculateFortnightlyTax(annualIncome: number): Promise<number>
}
```

### Super Calculator (`src/lib/payroll/super-calculator.ts`)
```typescript
export class SuperCalculator {
  // Calculate employer super (8.4%)
  calculateEmployerSuper(grossPay: number): number

  // Calculate employee voluntary super
  calculateEmployeeSuper(grossPay: number, rate: number): number

  // Process super contributions for period
  processSuperContributions(payPeriodId: string): Promise<void>
}
```

### BSP Generator (`src/lib/payroll/bsp-generator.ts`)
```typescript
export class BSPGenerator {
  // Generate BSP bank file
  generateBankFile(payRunId: string): Promise<string>

  // Format bank record
  formatBankRecord(payslip: Payslip): string

  // Save export file
  saveExportFile(payRunId: string, content: string): Promise<string>
}
```

---

## 📊 Database Functions We'll Use

### Already Available:
- ✅ `calculate_png_tax(annual_income, tax_year)` - Returns tax amount & bracket
- ✅ `calculate_monthly_tax(annual_income)` - Returns monthly tax
- ✅ `calculate_fortnightly_tax(annual_income)` - Returns fortnightly tax

### To Create (if needed):
- `calculate_employer_super(gross_pay)` - 8.4% calculation
- `get_employee_gross_pay(employee_id, period_id)` - Get total gross
- `process_payslip(employee_id, period_id)` - Generate payslip

---

## 🎨 UI Components to Build

### Shared Components:
- `<PayrollCard>` - Card for payroll data
- `<PayslipPreview>` - Preview payslip
- `<TaxBreakdown>` - Show tax calculation
- `<SuperBreakdown>` - Show super calculation
- `<PayComponentList>` - List salary components
- `<PayrollSummary>` - Summary stats
- `<DateRangePicker>` - Period selection
- `<EmployeeSelector>` - Multi-select employees

---

## 📈 Success Metrics

### MVP Payroll (Target: End of Week 1)
- [ ] Create salary structures
- [ ] Assign employee salaries
- [ ] Create pay periods
- [ ] Process pay run
- [ ] Generate payslips with PNG tax
- [ ] Calculate super contributions

### Full Payroll (Target: End of Week 2)
- [ ] BSP bank file export
- [ ] Tax reports
- [ ] Super payment batches
- [ ] Payroll audit trail
- [ ] Email payslips

### Complete HRMS (Target: 4-6 weeks)
- [ ] Enhanced employee management
- [ ] Leave approval workflow
- [ ] Recruitment module
- [ ] Performance appraisals
- [ ] Comprehensive reports

---

## 🔄 Current Status

```
Database:     ████████████████████ 100% Complete
Master Data:  ████████░░░░░░░░░░░░  40% Complete (Foundation only)
Payroll UI:   ░░░░░░░░░░░░░░░░░░░░   0% Started
Payroll Logic:░░░░░░░░░░░░░░░░░░░░   0% Started
```

---

## 📝 Immediate Action Items

1. **NOW**: Seed master data (2 minutes)
   - Open `supabase/seed-data.sql`
   - Run in Supabase SQL Editor

2. **NEXT**: Build first payroll page
   - Create `/app/dashboard/payroll` layout
   - Create salary components page
   - Create salary structures page

3. **THEN**: Build payroll processing
   - Create pay periods page
   - Create pay runs page
   - Implement payroll calculator

---

**Ready to continue?** Once you've seeded the master data, we'll start building the payroll UI! 🚀
