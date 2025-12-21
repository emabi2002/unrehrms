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
