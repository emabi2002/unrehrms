# UNRE HRMS - Complete Implementation Plan

## Project Overview
Build a production-ready University HRMS & Payroll system for Papua New Guinea University of Natural Resources & Environment, using:
- **Frontend**: Next.js + TypeScript + Tailwind + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Reference**: Frappe HRMS functional features

---

## Phase 1: Foundation & Database Schema ⏳ IN PROGRESS

### 1.1 Core Tables
- [ ] `organizations` - University settings
- [ ] `faculties` - Top-level academic divisions
- [ ] `departments` - Departmental structure
- [ ] `positions` - Job positions with grades
- [ ] `academic_ranks` - Tutor → Professor hierarchy
- [ ] `employment_types` - Permanent, Contract, Casual, Part-time

### 1.2 Employee Management
- [ ] `employees` - Master employee records
- [ ] `employee_addresses` - Contact information
- [ ] `employee_education` - Academic qualifications
- [ ] `employee_emergency_contacts` - Emergency details
- [ ] `employee_documents` - Contracts, certificates
- [ ] `employee_history` - Promotions, transfers
- [ ] `employee_separations` - Exit records

### 1.3 Payroll Tables
- [ ] `salary_structures` - Position-based salary templates
- [ ] `salary_components` - Earnings & deductions
- [ ] `employee_salary_components` - Employee-specific overrides
- [ ] `tax_tables` - PNG tax slabs (configurable)
- [ ] `superannuation_schemes` - Nambawan, NASFUND, etc.
- [ ] `super_contributions` - Employee contribution records
- [ ] `pay_periods` - Monthly/fortnightly periods
- [ ] `pay_runs` - Payroll processing batches
- [ ] `pay_run_items` - Individual employee payslips
- [ ] `payslips` - Final salary slips
- [ ] `allowances` - Housing, transport, academic load, etc.
- [ ] `deductions` - Loans, union fees, garnishments
- [ ] `loan_repayments` - Salary deduction tracking

### 1.4 Leave & Attendance
- [ ] `leave_types` - Annual, Sick, Maternity, Sabbatical, etc.
- [ ] `leave_allocations` - Annual entitlements per employee
- [ ] `leave_applications` - Leave requests
- [ ] `leave_approvals` - Multi-level approval chain
- [ ] `leave_balances` - Calculated balances
- [ ] `attendance_records` - Daily attendance
- [ ] `shift_types` - Work shifts
- [ ] `holidays` - Public holidays calendar

### 1.5 Recruitment
- [ ] `job_openings` - Vacant positions
- [ ] `applicants` - Candidate records
- [ ] `applications` - Job applications
- [ ] `interview_rounds` - Shortlisting, interviews
- [ ] `interview_feedback` - Scores and comments
- [ ] `job_offers` - Offer letters

### 1.6 Performance Management
- [ ] `appraisal_templates` - KPI templates
- [ ] `appraisal_cycles` - Annual review periods
- [ ] `appraisals` - Employee appraisals
- [ ] `goals` - Employee goals and KRAs
- [ ] `training_programs` - CPD courses
- [ ] `training_records` - Attendance records

### 1.7 Security & Administration
- [ ] `user_roles` - HR, Manager, Employee, etc.
- [ ] `permissions` - Fine-grained access control
- [ ] `audit_logs` - System activity tracking
- [ ] `system_settings` - Configuration

### 1.8 RLS Policies
- [ ] Employee: own records only
- [ ] Manager: department staff
- [ ] HR: all employees
- [ ] Payroll: payroll data access

---

## Phase 2: Core HR Module

### 2.1 Employee Management
- [ ] Employee list with search/filter
- [ ] Employee profile (view/edit)
- [ ] Employee creation form
- [ ] Document upload (contracts, IDs)
- [ ] Employment history tracking
- [ ] Profile picture management
- [ ] Academic qualifications

### 2.2 Organizational Structure
- [ ] Faculty management
- [ ] Department management
- [ ] Position management
- [ ] Academic rank hierarchy
- [ ] Org chart visualization

### 2.3 Employee Self-Service
- [ ] View own profile
- [ ] Update contact details
- [ ] View payslips
- [ ] View leave balance
- [ ] Apply for leave

---

## Phase 3: Payroll Engine (PNG-Specific)

### 3.1 Payroll Setup
- [ ] Create salary structures
- [ ] Configure salary components
- [ ] Set up earnings (basic, allowances)
- [ ] Set up deductions (tax, super, loans)
- [ ] Configure PNG tax tables
- [ ] Configure superannuation schemes

### 3.2 Payroll Processing
- [ ] Create pay period
- [ ] Generate pay run
- [ ] Pull employee salaries
- [ ] Apply attendance adjustments
- [ ] Calculate overtime
- [ ] Apply leave without pay
- [ ] Calculate PNG tax (graduated rates)
- [ ] Calculate superannuation
- [ ] Apply loan deductions
- [ ] Generate payslips
- [ ] Lock pay run

### 3.3 PNG Tax Engine
- [ ] Tax table configuration UI
- [ ] Tax calculation based on annual income
- [ ] PAYE calculation
- [ ] Tax exemption handling
- [ ] Fortnightly vs monthly tax

### 3.4 Superannuation
- [ ] Nambawan Super integration
- [ ] NASFUND integration
- [ ] Employer contribution (8.4%)
- [ ] Employee contribution
- [ ] Super contribution reports

### 3.5 Bank File Generation
- [ ] BSP bank file format
- [ ] Other bank formats
- [ ] Net pay distribution
- [ ] Export to CSV/TXT

### 3.6 Payroll Reports
- [ ] Payslip PDF generation
- [ ] Payroll summary by department
- [ ] Tax summary report
- [ ] Super contribution report
- [ ] Cost center analysis

---

## Phase 4: Leave & Attendance

### 4.1 Leave Management
- [ ] Leave type configuration
- [ ] Leave allocation per employee
- [ ] Leave application form
- [ ] Leave approval workflow
  - [ ] Employee submits
  - [ ] HOD approves
  - [ ] Dean approves (if needed)
  - [ ] HR finalizes
- [ ] Leave balance calculation
- [ ] Leave calendar view
- [ ] Leave history

### 4.2 Attendance Tracking
- [ ] Manual attendance entry
- [ ] CSV import for attendance
- [ ] Monthly attendance sheet
- [ ] Late arrival tracking
- [ ] Attendance reports
- [ ] Integration with payroll (LWOP)

---

## Phase 5: Recruitment

### 5.1 Job Management
- [ ] Create job opening
- [ ] Job posting
- [ ] Application portal
- [ ] Applicant tracking

### 5.2 Hiring Process
- [ ] Shortlist candidates
- [ ] Schedule interviews
- [ ] Score interviews
- [ ] Generate offer letter
- [ ] Convert to employee

---

## Phase 6: Performance Management

### 6.1 Appraisal System
- [ ] Create appraisal template
- [ ] Assign appraisals
- [ ] Self-evaluation
- [ ] Manager evaluation
- [ ] HOD review
- [ ] Appraisal reports

### 6.2 Goals & Training
- [ ] Set employee goals
- [ ] Track KPIs
- [ ] Record training
- [ ] CPD points tracking

---

## Phase 7: Reports & Analytics

### 7.1 HR Reports
- [ ] Employee headcount
- [ ] Turnover analysis
- [ ] Department statistics
- [ ] Contract expiry alerts
- [ ] Work permit expiry

### 7.2 Payroll Reports
- [ ] Monthly payroll summary
- [ ] Department cost analysis
- [ ] Tax reports
- [ ] Super reports
- [ ] Year-end reports

### 7.3 Leave Reports
- [ ] Leave utilization
- [ ] Leave balance report
- [ ] Department leave calendar

---

## Technical Implementation

### Database Migrations
```sql
-- Migration 001: Create core tables
-- Migration 002: Create payroll tables
-- Migration 003: Create leave tables
-- Migration 004: Create recruitment tables
-- Migration 005: Create performance tables
-- Migration 006: Create RLS policies
-- Migration 007: Create indexes
-- Migration 008: Seed data
```

### Code Structure
```
src/
├── app/
│   ├── dashboard/
│   ├── (modules)/
│   │   ├── employees/
│   │   ├── payroll/
│   │   ├── leave/
│   │   ├── recruitment/
│   │   ├── performance/
│   │   └── settings/
│   └── api/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── queries/
│   │   └── mutations/
│   ├── payroll/
│   │   ├── tax-calculator.ts
│   │   ├── super-calculator.ts
│   │   └── payslip-generator.ts
│   └── utils/
└── components/
    ├── hr/
    ├── payroll/
    └── ui/
```

---

## Priority Order

### Week 1: Foundation
1. ✅ Complete database schema
2. ✅ Create Supabase migrations
3. ✅ Set up RLS policies
4. ✅ Seed sample data

### Week 2: Core HR
1. Employee CRUD
2. Department structure
3. Employee self-service

### Week 3: Payroll (Critical)
1. PNG tax engine
2. Salary structure
3. Pay run processing
4. Payslip generation
5. BSP file export

### Week 4: Leave & Attendance
1. Leave configuration
2. Leave workflow
3. Attendance tracking

### Week 5-6: Additional Modules
1. Recruitment
2. Performance
3. Reports

---

## Success Criteria

### Must Have (MVP)
- ✅ Employee management
- ✅ Payroll with PNG tax
- ✅ Superannuation
- ✅ Leave management
- ✅ BSP file generation
- ✅ Payslip PDFs

### Should Have
- ✅ Recruitment module
- ✅ Performance appraisals
- ✅ Attendance tracking
- ✅ Comprehensive reports

### Nice to Have
- Mobile app
- Email notifications (already done)
- Real-time notifications
- Calendar integrations

---

## Current Status

**Completed:**
- ✅ Basic dashboard
- ✅ Sample employee management
- ✅ Email notifications
- ✅ Chart.js analytics
- ✅ PDF/Excel exports

**Starting Now:**
- 🔄 Complete database schema
- 🔄 PNG payroll engine
- 🔄 Full employee management

---

**Target:** Production-ready HRMS for UNRE by end of implementation plan
