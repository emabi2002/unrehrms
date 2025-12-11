# Complete Database Schema for PNG UNRE HRMS
## All 16 Modules - 50+ Tables

**Version:** 1.0
**Date:** December 10, 2025
**Database:** PostgreSQL (Supabase)

---

## 1. CORE HR & EMPLOYEE MANAGEMENT

### 1.1 `employees` (Enhanced)
```sql
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Personal Details
  employee_id TEXT UNIQUE NOT NULL,
  title TEXT, -- Mr, Mrs, Ms, Dr, Prof
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  preferred_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  marital_status TEXT CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'separated')),
  nationality TEXT,

  -- Contact Details
  email TEXT UNIQUE NOT NULL,
  personal_email TEXT,
  phone TEXT,
  mobile TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Papua New Guinea',

  -- Identification
  national_id TEXT,
  passport_number TEXT,
  drivers_license TEXT,
  tax_file_number TEXT,

  -- Employment Details
  department_id UUID REFERENCES departments(id),
  position_id UUID REFERENCES positions(id),
  job_grade_id UUID REFERENCES job_grades(id),
  employment_type_id UUID REFERENCES employment_types(id),
  employment_status TEXT CHECK (employment_status IN ('active', 'on_leave', 'probation', 'suspended', 'terminated', 'retired')) DEFAULT 'active',

  -- Dates
  hire_date DATE NOT NULL,
  confirmation_date DATE,
  probation_end_date DATE,
  termination_date DATE,
  retirement_date DATE,

  -- Reporting
  line_manager_id UUID REFERENCES employees(id),
  dotted_line_manager_id UUID REFERENCES employees(id),

  -- Work Details
  work_location_id UUID REFERENCES work_locations(id),
  cost_centre_id UUID REFERENCES cost_centres(id),

  -- Photo & Biometric
  photo_url TEXT,
  biometric_id TEXT,

  -- System
  user_id UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,

  CONSTRAINT valid_dates CHECK (hire_date <= COALESCE(termination_date, CURRENT_DATE))
);

CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_manager ON employees(line_manager_id);
CREATE INDEX idx_employees_status ON employees(employment_status);
```

### 1.2 `emergency_contacts` (NEW)
```sql
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,

  -- Contact Details
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- Spouse, Parent, Sibling, Child, Friend, etc.
  phone TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  address TEXT,

  -- Priority
  priority INTEGER DEFAULT 1, -- 1 = primary, 2 = secondary, etc.
  is_primary BOOLEAN DEFAULT false,

  CONSTRAINT unique_primary_contact UNIQUE (employee_id, is_primary) WHERE is_primary = true
);

CREATE INDEX idx_emergency_employee ON emergency_contacts(employee_id);
```

### 1.3 `employee_documents` (NEW)
```sql
CREATE TABLE employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,

  -- Document Details
  document_type TEXT NOT NULL, -- contract, certificate, id_copy, medical, policy_acknowledgement
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,

  -- Metadata
  uploaded_by UUID REFERENCES employees(id),
  issue_date DATE,
  expiry_date DATE,

  -- Access Control
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'hr_only', -- hr_only, manager_and_hr, employee_visible

  -- Status
  status TEXT CHECK (status IN ('active', 'archived', 'expired')) DEFAULT 'active',
  notes TEXT
);

CREATE INDEX idx_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_documents_type ON employee_documents(document_type);
CREATE INDEX idx_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
```

### 1.4 `employment_contracts` (NEW)
```sql
CREATE TABLE employment_contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,

  -- Contract Details
  contract_number TEXT UNIQUE NOT NULL,
  contract_type TEXT NOT NULL, -- permanent, fixed_term, casual, internship
  start_date DATE NOT NULL,
  end_date DATE, -- NULL for permanent

  -- Terms
  salary NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',
  payment_frequency TEXT, -- monthly, fortnightly, weekly

  -- Documents
  contract_file_url TEXT,
  offer_letter_url TEXT,
  signed_contract_url TEXT,

  -- Status
  status TEXT CHECK (status IN ('draft', 'sent', 'signed', 'active', 'expired', 'terminated')) DEFAULT 'draft',
  signed_date DATE,

  -- Renewal
  is_renewable BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 90,

  -- Termination
  notice_period_days INTEGER DEFAULT 30,
  termination_date DATE,
  termination_reason TEXT,

  CONSTRAINT valid_contract_dates CHECK (start_date < COALESCE(end_date, start_date + INTERVAL '100 years'))
);

CREATE INDEX idx_contracts_employee ON employment_contracts(employee_id);
CREATE INDEX idx_contracts_expiry ON employment_contracts(end_date) WHERE end_date IS NOT NULL;
```

### 1.5 Master Data Tables

#### `departments` (Enhanced)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  description TEXT,

  -- Hierarchy
  parent_department_id UUID REFERENCES departments(id),

  -- Management
  head_of_department_id UUID REFERENCES employees(id),

  -- Budget
  annual_budget NUMERIC(12,2),

  -- Status
  is_active BOOLEAN DEFAULT true,
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE
);
```

#### `positions` (NEW)
```sql
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  job_family_id UUID REFERENCES job_families(id),
  job_grade_id UUID REFERENCES job_grades(id),
  department_id UUID REFERENCES departments(id),

  -- Classification
  classification TEXT, -- technical, administrative, management, executive
  level INTEGER, -- 1-10

  -- Headcount
  approved_headcount INTEGER DEFAULT 1,

  -- Status
  is_active BOOLEAN DEFAULT true
);
```

#### `job_families` (NEW)
```sql
CREATE TABLE job_families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true
);
```

#### `job_grades` (NEW)
```sql
CREATE TABLE job_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER UNIQUE NOT NULL,

  -- Salary Bands
  min_salary NUMERIC(12,2),
  mid_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),

  is_active BOOLEAN DEFAULT true
);
```

#### `job_descriptions` (NEW)
```sql
CREATE TABLE job_descriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  position_id UUID REFERENCES positions(id),
  version INTEGER DEFAULT 1,

  -- Content
  purpose TEXT,
  responsibilities TEXT,
  qualifications TEXT,
  experience_required TEXT,
  skills_required TEXT,
  competencies TEXT,

  -- Status
  status TEXT CHECK (status IN ('draft', 'approved', 'archived')) DEFAULT 'draft',
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  effective_date DATE DEFAULT CURRENT_DATE
);
```

#### `work_locations` (NEW)
```sql
CREATE TABLE work_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  location_type TEXT, -- head_office, branch, campus, remote
  address TEXT,
  city TEXT,
  province TEXT,
  is_active BOOLEAN DEFAULT true
);
```

#### `cost_centres` (NEW)
```sql
CREATE TABLE cost_centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  is_active BOOLEAN DEFAULT true
);
```

---

## 2. RECRUITMENT & APPLICANT TRACKING

### 2.1 `job_requisitions` (NEW)
```sql
CREATE TABLE job_requisitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  requisition_number TEXT UNIQUE NOT NULL,
  position_id UUID REFERENCES positions(id),
  department_id UUID REFERENCES departments(id),

  -- Request Details
  number_of_positions INTEGER NOT NULL DEFAULT 1,
  replacement_for UUID REFERENCES employees(id), -- if replacing someone
  employment_type TEXT NOT NULL,

  -- Justification
  business_justification TEXT,
  budget_code TEXT,

  -- Approval Workflow
  requested_by UUID REFERENCES employees(id),
  approved_by_hod UUID REFERENCES employees(id),
  approved_by_hod_date DATE,
  approved_by_hr UUID REFERENCES employees(id),
  approved_by_hr_date DATE,
  approved_by_ceo UUID REFERENCES employees(id),
  approved_by_ceo_date DATE,

  -- Status
  status TEXT CHECK (status IN ('draft', 'pending_hod', 'pending_hr', 'pending_ceo', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',

  -- Dates
  required_start_date DATE,
  closing_date DATE
);
```

### 2.2 `job_postings` (NEW)
```sql
CREATE TABLE job_postings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  requisition_id UUID REFERENCES job_requisitions(id),
  posting_title TEXT NOT NULL,
  posting_type TEXT CHECK (posting_type IN ('internal', 'external', 'both')) DEFAULT 'external',

  -- Content
  job_description TEXT,
  requirements TEXT,
  responsibilities TEXT,
  benefits TEXT,

  -- Posting Details
  posting_date DATE DEFAULT CURRENT_DATE,
  closing_date DATE NOT NULL,

  -- Publishing
  published_on_website BOOLEAN DEFAULT false,
  published_on_job_boards BOOLEAN DEFAULT false,
  job_board_names TEXT[],

  -- Status
  status TEXT CHECK (status IN ('draft', 'active', 'closed', 'filled', 'cancelled')) DEFAULT 'draft',

  -- Analytics
  view_count INTEGER DEFAULT 0,
  application_count INTEGER DEFAULT 0
);
```

### 2.3 `candidates` (NEW)
```sql
CREATE TABLE candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Personal Details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,

  -- Address
  address TEXT,
  city TEXT,
  province TEXT,

  -- Source
  source TEXT, -- website, referral, job_board, linkedin, walk_in
  referrer_id UUID REFERENCES employees(id),

  -- Status
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,

  -- Consent
  consent_to_process_data BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ
);
```

### 2.4 `applications` (NEW)
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  candidate_id UUID REFERENCES candidates(id),
  job_posting_id UUID REFERENCES job_postings(id),

  -- Application Details
  resume_url TEXT,
  cover_letter_url TEXT,

  -- Screening
  meets_minimum_requirements BOOLEAN,
  screening_score INTEGER,
  screening_notes TEXT,

  -- Status Tracking
  status TEXT CHECK (status IN (
    'applied',
    'screening',
    'shortlisted',
    'interview_scheduled',
    'interviewed',
    'assessment',
    'reference_check',
    'background_check',
    'offered',
    'offer_accepted',
    'offer_declined',
    'hired',
    'rejected',
    'withdrawn'
  )) DEFAULT 'applied',

  -- Dates
  application_date TIMESTAMPTZ DEFAULT NOW(),
  status_updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Rejection
  rejection_reason TEXT,
  rejected_by UUID REFERENCES employees(id),
  rejected_date DATE,

  UNIQUE(candidate_id, job_posting_id)
);
```

### 2.5 `interviews` (NEW)
```sql
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  application_id UUID REFERENCES applications(id),

  -- Interview Details
  interview_type TEXT, -- phone_screen, technical, panel, hr, final
  interview_round INTEGER DEFAULT 1,
  scheduled_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,

  -- Location
  location TEXT,
  meeting_link TEXT, -- for virtual interviews

  -- Panel
  interviewer_ids UUID[], -- array of employee IDs

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',

  -- Feedback
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  strengths TEXT,
  weaknesses TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_yes', 'yes', 'maybe', 'no', 'strong_no')),
  notes TEXT,

  -- Completion
  completed_date TIMESTAMPTZ,
  completed_by UUID REFERENCES employees(id)
);
```

### 2.6 `offers` (NEW)
```sql
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  application_id UUID REFERENCES applications(id),

  -- Offer Details
  offer_letter_url TEXT,
  position_id UUID REFERENCES positions(id),
  job_title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),

  -- Compensation
  offered_salary NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',
  payment_frequency TEXT,
  benefits TEXT,

  -- Dates
  start_date DATE,
  offer_expiry_date DATE,

  -- Status
  status TEXT CHECK (status IN ('draft', 'pending_approval', 'approved', 'sent', 'accepted', 'declined', 'expired', 'withdrawn')) DEFAULT 'draft',

  -- Approval
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  -- Response
  accepted_date DATE,
  declined_date DATE,
  decline_reason TEXT
);
```

---

## 3. ONBOARDING & OFFBOARDING

### 3.1 `onboarding_checklists` (NEW)
```sql
CREATE TABLE onboarding_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  start_date DATE NOT NULL,

  -- Pre-Joining (before start date)
  pre_documents_submitted BOOLEAN DEFAULT false,
  pre_medical_cleared BOOLEAN DEFAULT false,
  pre_references_checked BOOLEAN DEFAULT false,
  pre_background_check BOOLEAN DEFAULT false,
  pre_police_clearance BOOLEAN DEFAULT false,

  -- Day 1
  day1_welcome_session BOOLEAN DEFAULT false,
  day1_photo_taken BOOLEAN DEFAULT false,
  day1_id_card_issued BOOLEAN DEFAULT false,
  day1_email_created BOOLEAN DEFAULT false,
  day1_system_access BOOLEAN DEFAULT false,
  day1_workstation_setup BOOLEAN DEFAULT false,

  -- Week 1
  week1_hr_orientation BOOLEAN DEFAULT false,
  week1_it_training BOOLEAN DEFAULT false,
  week1_safety_briefing BOOLEAN DEFAULT false,
  week1_department_intro BOOLEAN DEFAULT false,
  week1_policies_reviewed BOOLEAN DEFAULT false,

  -- Month 1
  month1_probation_meeting BOOLEAN DEFAULT false,
  month1_feedback_session BOOLEAN DEFAULT false,

  -- Status
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_date DATE,

  -- Assigned To
  hr_coordinator UUID REFERENCES employees(id),
  buddy_assigned UUID REFERENCES employees(id)
);
```

### 3.2 `onboarding_tasks` (NEW)
```sql
CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Task Details
  task_name TEXT NOT NULL,
  task_description TEXT,
  task_category TEXT, -- hr, it, department, compliance

  -- Assignment
  assigned_to UUID REFERENCES employees(id),
  due_date DATE,

  -- Status
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_date DATE,
  completed_by UUID REFERENCES employees(id),

  -- Notes
  notes TEXT
);
```

### 3.3 `probation_reviews` (NEW)
```sql
CREATE TABLE probation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Review Details
  review_type TEXT CHECK (review_type IN ('mid_probation', 'final_probation')) NOT NULL,
  review_date DATE NOT NULL,
  reviewer_id UUID REFERENCES employees(id),

  -- Assessment
  performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
  attendance_rating INTEGER CHECK (attendance_rating BETWEEN 1 AND 5),
  behaviour_rating INTEGER CHECK (behaviour_rating BETWEEN 1 AND 5),

  -- Feedback
  strengths TEXT,
  areas_for_improvement TEXT,
  training_needs TEXT,
  manager_comments TEXT,
  employee_comments TEXT,

  -- Recommendation
  recommendation TEXT CHECK (recommendation IN ('confirm', 'extend_probation', 'terminate')) NOT NULL,
  extension_period_days INTEGER,

  -- Outcome
  outcome TEXT CHECK (outcome IN ('pending', 'confirmed', 'extended', 'terminated')),
  outcome_date DATE,
  outcome_by UUID REFERENCES employees(id)
);
```

### 3.4 `resignations` (NEW)
```sql
CREATE TABLE resignations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Resignation Details
  resignation_letter_url TEXT,
  resignation_date DATE NOT NULL,
  last_working_date DATE NOT NULL,
  notice_period_days INTEGER,

  -- Reason
  resignation_reason TEXT,
  resignation_category TEXT, -- better_opportunity, relocation, personal, health, retirement, other

  -- Approval
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  -- Status
  status TEXT CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected', 'withdrawn')) DEFAULT 'submitted'
);
```

### 3.5 `exit_interviews` (NEW)
```sql
CREATE TABLE exit_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  resignation_id UUID REFERENCES resignations(id),

  -- Interview Details
  interview_date DATE,
  interviewed_by UUID REFERENCES employees(id),

  -- Feedback (1-5 scale)
  overall_satisfaction INTEGER,
  work_environment INTEGER,
  management_support INTEGER,
  career_growth INTEGER,
  compensation_benefits INTEGER,
  work_life_balance INTEGER,

  -- Open Feedback
  what_worked_well TEXT,
  what_could_improve TEXT,
  reason_for_leaving TEXT,
  would_recommend_employer BOOLEAN,
  would_consider_returning BOOLEAN,

  -- Additional
  suggestions TEXT,
  interviewer_notes TEXT
);
```

### 3.6 `exit_clearances` (NEW)
```sql
CREATE TABLE exit_clearances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  resignation_id UUID REFERENCES resignations(id),

  -- Clearance Status
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

  security_cleared BOOLEAN DEFAULT false,
  security_cleared_by UUID REFERENCES employees(id),
  security_cleared_date DATE,

  -- Handover
  handover_completed BOOLEAN DEFAULT false,
  handover_to UUID REFERENCES employees(id),
  handover_notes TEXT,

  -- Final Settlement
  final_settlement_calculated BOOLEAN DEFAULT false,
  leave_encashment NUMERIC(12,2),
  other_payments NUMERIC(12,2),
  deductions NUMERIC(12,2),
  net_settlement NUMERIC(12,2),

  -- Overall Status
  clearance_complete BOOLEAN DEFAULT false,
  completion_date DATE
);
```

---

## 4. TIME & ATTENDANCE (Enhanced)

### 4.1 `shifts` (NEW)
```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,

  -- Timing
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,

  -- Type
  shift_type TEXT CHECK (shift_type IN ('fixed', 'rotating', 'night', 'weekend')),

  -- Overtime
  ot_multiplier NUMERIC(3,2) DEFAULT 1.5, -- 1.5x for normal OT

  is_active BOOLEAN DEFAULT true
);
```

### 4.2 `rosters` (NEW)
```sql
CREATE TABLE rosters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  shift_id UUID REFERENCES shifts(id),

  -- Schedule
  roster_date DATE NOT NULL,
  day_off BOOLEAN DEFAULT false,

  -- Created By
  created_by UUID REFERENCES employees(id),

  UNIQUE(employee_id, roster_date)
);
```

### 4.3 `attendance` (Enhanced)
```sql
-- Already exists, enhance it
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES shifts(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS roster_id UUID REFERENCES rosters(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_device TEXT; -- web, biometric, mobile
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_device TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gps_latitude NUMERIC(10,8);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gps_longitude NUMERIC(11,8);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_remote BOOLEAN DEFAULT false;
```

### 4.4 `overtime_requests` (NEW)
```sql
CREATE TABLE overtime_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- OT Details
  ot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_hours NUMERIC(4,2),

  -- Reason
  reason TEXT NOT NULL,
  project_code TEXT,

  -- Approval
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,
  rejection_reason TEXT,

  -- Calculation
  ot_multiplier NUMERIC(3,2) DEFAULT 1.5,
  ot_pay_amount NUMERIC(10,2)
);
```

### 4.5 `timesheets` (NEW)
```sql
CREATE TABLE timesheets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Period
  week_starting DATE NOT NULL,
  week_ending DATE NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')) DEFAULT 'draft',
  submitted_date DATE,
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  -- Total Hours
  total_hours NUMERIC(5,2),

  UNIQUE(employee_id, week_starting)
);
```

### 4.6 `timesheet_entries` (NEW)
```sql
CREATE TABLE timesheet_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timesheet_id UUID REFERENCES timesheets(id) ON DELETE CASCADE,

  -- Date & Time
  entry_date DATE NOT NULL,
  hours NUMERIC(4,2) NOT NULL,

  -- Project/Task
  project_code TEXT,
  task_description TEXT,

  -- Billable
  is_billable BOOLEAN DEFAULT false
);
```

---

**[CONTINUED IN NEXT RESPONSE DUE TO LENGTH]**

I'll continue with the remaining schemas for Performance, Learning, Benefits, Employee Relations, Health & Safety, Travel & Expense, Analytics, and System Administration modules. Should I continue?
