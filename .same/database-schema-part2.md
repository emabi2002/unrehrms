# Complete Database Schema for PNG UNRE HRMS - Part 2
## Modules 5-16: Performance, Learning, Benefits, Relations, Safety, Travel, Analytics, Admin

---

## 5. LEAVE MANAGEMENT (Already exists - enhancements)

### Enhancements to `leave_requests`:
```sql
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_balance_before NUMERIC(5,2);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS leave_balance_after NUMERIC(5,2);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id);
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_date DATE;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
```

### 5.1 `leave_types` (NEW)
```sql
CREATE TABLE leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  -- Entitlement
  annual_entitlement_days NUMERIC(5,2),
  accrual_rate TEXT, -- monthly, quarterly, annually, on_joining

  -- Rules
  max_consecutive_days INTEGER,
  min_notice_days INTEGER DEFAULT 3,
  requires_documentation BOOLEAN DEFAULT false,
  can_be_negative BOOLEAN DEFAULT false,
  can_carry_forward BOOLEAN DEFAULT false,
  max_carry_forward_days NUMERIC(5,2),

  -- Payment
  is_paid BOOLEAN DEFAULT true,

  -- Gender Specific
  gender_specific TEXT CHECK (gender_specific IN ('all', 'male', 'female')),

  is_active BOOLEAN DEFAULT true
);
```

### 5.2 `leave_balances` (NEW)
```sql
CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),
  year INTEGER NOT NULL,

  -- Balance
  opening_balance NUMERIC(5,2) DEFAULT 0,
  accrued NUMERIC(5,2) DEFAULT 0,
  taken NUMERIC(5,2) DEFAULT 0,
  pending NUMERIC(5,2) DEFAULT 0,
  available NUMERIC(5,2) GENERATED ALWAYS AS (opening_balance + accrued - taken - pending) STORED,

  UNIQUE(employee_id, leave_type_id, year)
);
```

### 5.3 `leave_accruals` (NEW)
```sql
CREATE TABLE leave_accruals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  leave_type_id UUID REFERENCES leave_types(id),

  -- Accrual Details
  accrual_date DATE NOT NULL,
  accrual_period TEXT, -- January 2025, Q1 2025, etc.
  days_accrued NUMERIC(5,2) NOT NULL,

  -- Calculation
  calculation_method TEXT,
  notes TEXT
);
```

---

## 6. PAYROLL (Already exists - enhancements noted in comprehensive-hrms-plan.md)

*See existing payroll tables - already well developed*

---

## 7. PERFORMANCE MANAGEMENT

### 7.1 `performance_goals` (NEW)
```sql
CREATE TABLE performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Goal Hierarchy
  goal_type TEXT CHECK (goal_type IN ('organizational', 'departmental', 'individual')) NOT NULL,
  parent_goal_id UUID REFERENCES performance_goals(id),

  -- Assignment
  employee_id UUID REFERENCES employees(id), -- NULL for org/dept goals
  department_id UUID REFERENCES departments(id),

  -- Goal Details
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  kpi_metrics TEXT,
  target_value TEXT,

  -- Period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Weight
  weight_percentage NUMERIC(5,2), -- Goal weightage in overall performance

  -- Status
  status TEXT CHECK (status IN ('draft', 'active', 'achieved', 'partially_achieved', 'not_achieved', 'cancelled')) DEFAULT 'draft',

  -- Progress
  progress_percentage INTEGER DEFAULT 0,
  actual_value TEXT,

  -- Created By
  created_by UUID REFERENCES employees(id)
);
```

### 7.2 `appraisal_cycles` (NEW)
```sql
CREATE TABLE appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  cycle_name TEXT NOT NULL, -- Annual Appraisal 2025, Mid-Year Review 2025
  cycle_type TEXT CHECK (cycle_type IN ('annual', 'mid_year', 'probation', 'project')) NOT NULL,

  -- Period
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,

  -- Self-Assessment
  self_assessment_start DATE,
  self_assessment_end DATE,

  -- Manager Review
  manager_review_start DATE,
  manager_review_end DATE,

  -- Calibration
  calibration_start DATE,
  calibration_end DATE,

  -- Status
  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed')) DEFAULT 'not_started',

  -- Template
  appraisal_template_id UUID,

  is_active BOOLEAN DEFAULT true
);
```

### 7.3 `appraisals` (NEW)
```sql
CREATE TABLE appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  appraisal_cycle_id UUID REFERENCES appraisal_cycles(id),

  -- Self-Assessment
  self_assessment_completed BOOLEAN DEFAULT false,
  self_assessment_date DATE,
  self_achievements TEXT,
  self_challenges TEXT,
  self_training_needs TEXT,
  self_overall_rating INTEGER,

  -- Manager Review
  manager_id UUID REFERENCES employees(id),
  manager_review_completed BOOLEAN DEFAULT false,
  manager_review_date DATE,
  manager_achievements TEXT,
  manager_areas_improvement TEXT,
  manager_training_recommendations TEXT,
  manager_overall_rating INTEGER,

  -- Competency Ratings (1-5 scale)
  technical_skills_rating INTEGER,
  communication_rating INTEGER,
  teamwork_rating INTEGER,
  leadership_rating INTEGER,
  problem_solving_rating INTEGER,
  innovation_rating INTEGER,

  -- Final Rating
  final_rating INTEGER,
  final_rating_category TEXT, -- Exceptional, Exceeds, Meets, Below, Unsatisfactory
  calibrated_by UUID REFERENCES employees(id),
  calibration_date DATE,

  -- Recommendations
  promotion_recommended BOOLEAN DEFAULT false,
  salary_increase_recommended BOOLEAN DEFAULT false,
  salary_increase_percentage NUMERIC(5,2),

  -- Status
  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed', 'acknowledged')) DEFAULT 'not_started',

  -- Employee Acknowledgement
  acknowledged_by_employee BOOLEAN DEFAULT false,
  employee_comments TEXT,
  acknowledged_date DATE,

  UNIQUE(employee_id, appraisal_cycle_id)
);
```

### 7.4 `360_feedback` (NEW)
```sql
CREATE TABLE feedback_360 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  appraisal_id UUID REFERENCES appraisals(id),
  employee_id UUID REFERENCES employees(id), -- person being reviewed

  -- Reviewer
  reviewer_id UUID REFERENCES employees(id),
  reviewer_relationship TEXT CHECK (reviewer_relationship IN ('manager', 'peer', 'subordinate', 'external')) NOT NULL,

  -- Ratings (1-5)
  leadership_rating INTEGER,
  communication_rating INTEGER,
  collaboration_rating INTEGER,
  technical_rating INTEGER,
  reliability_rating INTEGER,

  -- Comments
  strengths TEXT,
  areas_for_improvement TEXT,
  additional_comments TEXT,

  -- Status
  completed BOOLEAN DEFAULT false,
  completed_date DATE,

  -- Anonymous
  is_anonymous BOOLEAN DEFAULT true
);
```

### 7.5 `performance_improvement_plans` (NEW)
```sql
CREATE TABLE performance_improvement_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  triggered_by_appraisal_id UUID REFERENCES appraisals(id),

  -- PIP Details
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INTEGER,

  -- Issues
  performance_issues TEXT NOT NULL,
  expected_improvements TEXT NOT NULL,
  support_provided TEXT,

  -- Monitoring
  review_frequency TEXT, -- weekly, fortnightly, monthly
  next_review_date DATE,

  -- Manager
  assigned_manager UUID REFERENCES employees(id),

  -- Status
  status TEXT CHECK (status IN ('active', 'completed_successful', 'completed_unsuccessful', 'extended', 'terminated')) DEFAULT 'active',

  -- Outcome
  outcome TEXT,
  outcome_date DATE,
  outcome_by UUID REFERENCES employees(id)
);
```

---

## 8. LEARNING & DEVELOPMENT

### 8.1 `training_courses` (NEW)
```sql
CREATE TABLE training_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  course_description TEXT,

  -- Category
  course_category TEXT, -- technical, soft_skills, compliance, leadership, safety

  -- Details
  duration_hours NUMERIC(5,2),
  delivery_method TEXT, -- classroom, online, blended, workshop, seminar

  -- Provider
  provider_type TEXT CHECK (provider_type IN ('internal', 'external')) DEFAULT 'internal',
  provider_name TEXT,

  -- Cost
  cost_per_person NUMERIC(10,2),
  currency TEXT DEFAULT 'PGK',

  -- Requirements
  prerequisites TEXT,
  target_audience TEXT,

  -- Certification
  certification_provided BOOLEAN DEFAULT false,
  certification_validity_months INTEGER,

  is_active BOOLEAN DEFAULT true
);
```

### 8.2 `training_sessions` (NEW)
```sql
CREATE TABLE training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_id UUID REFERENCES training_courses(id),

  session_name TEXT NOT NULL,

  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,

  -- Location
  location TEXT,
  room TEXT,
  online_meeting_link TEXT,

  -- Capacity
  max_participants INTEGER,
  min_participants INTEGER,

  -- Trainer
  trainer_id UUID REFERENCES employees(id), -- internal trainer
  external_trainer_name TEXT,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',

  -- Costs
  total_cost NUMERIC(12,2),

  -- Evaluation
  evaluation_required BOOLEAN DEFAULT true
);
```

### 8.3 `training_enrollments` (NEW)
```sql
CREATE TABLE training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  training_session_id UUID REFERENCES training_sessions(id),

  -- Enrollment
  enrollment_date DATE DEFAULT CURRENT_DATE,
  enrollment_type TEXT CHECK (enrollment_type IN ('self_enrolled', 'manager_nominated', 'mandatory')) DEFAULT 'self_enrolled',
  nominated_by UUID REFERENCES employees(id),

  -- Approval
  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  -- Attendance
  attendance_status TEXT CHECK (attendance_status IN ('enrolled', 'attended', 'partially_attended', 'absent', 'cancelled')) DEFAULT 'enrolled',
  attendance_percentage INTEGER,

  -- Assessment
  pre_assessment_score NUMERIC(5,2),
  post_assessment_score NUMERIC(5,2),
  passed BOOLEAN,

  -- Certificate
  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expiry_date DATE,

  -- Feedback
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,

  UNIQUE(employee_id, training_session_id)
);
```

### 8.4 `employee_certifications` (NEW)
```sql
CREATE TABLE employee_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Certification Details
  certification_name TEXT NOT NULL,
  certification_body TEXT,
  certification_number TEXT,

  -- Dates
  issue_date DATE NOT NULL,
  expiry_date DATE,
  renewal_required BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 90,

  -- Document
  certificate_file_url TEXT,

  -- Status
  status TEXT CHECK (status IN ('active', 'expired', 'renewed', 'revoked')) DEFAULT 'active',

  -- Related Training
  obtained_via_training_session UUID REFERENCES training_sessions(id)
);
```

### 8.5 `employee_skills` (NEW)
```sql
CREATE TABLE employee_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  skill_name TEXT NOT NULL,
  skill_category TEXT, -- technical, software, language, soft_skill

  -- Proficiency
  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  years_of_experience NUMERIC(4,1),

  -- Verification
  verified_by UUID REFERENCES employees(id),
  verified_date DATE,

  -- Training
  acquired_through_training UUID REFERENCES training_sessions(id),

  last_used_date DATE
);
```

---

## 9. BENEFITS & COMPENSATION MANAGEMENT

### 9.1 `benefit_plans` (NEW)
```sql
CREATE TABLE benefit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  plan_code TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('medical', 'life_insurance', 'housing', 'transport', 'meal', 'education', 'other')) NOT NULL,

  -- Provider
  provider_name TEXT,
  provider_contact TEXT,
  policy_number TEXT,

  -- Coverage
  coverage_details TEXT,
  coverage_amount NUMERIC(12,2),

  -- Eligibility
  eligibility_criteria TEXT,
  min_grade_level INTEGER,
  min_service_months INTEGER,

  -- Cost
  employer_contribution_percentage NUMERIC(5,2),
  employee_contribution_percentage NUMERIC(5,2),
  monthly_premium NUMERIC(10,2),

  -- Dependants
  covers_dependants BOOLEAN DEFAULT false,
  max_dependants INTEGER,

  -- Dates
  effective_date DATE,
  end_date DATE,

  is_active BOOLEAN DEFAULT true
);
```

### 9.2 `benefit_enrollments` (NEW)
```sql
CREATE TABLE benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  benefit_plan_id UUID REFERENCES benefit_plans(id),

  -- Enrollment
  enrollment_date DATE NOT NULL,
  effective_date DATE NOT NULL,

  -- Status
  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')) DEFAULT 'active',

  -- Coverage
  coverage_amount NUMERIC(12,2),
  employee_contribution NUMERIC(10,2),
  employer_contribution NUMERIC(10,2),

  -- Dependants
  number_of_dependants INTEGER DEFAULT 0,

  -- Cancellation
  cancellation_date DATE,
  cancellation_reason TEXT,

  UNIQUE(employee_id, benefit_plan_id, enrollment_date)
);
```

### 9.3 `benefit_dependants` (NEW)
```sql
CREATE TABLE benefit_dependants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  enrollment_id UUID REFERENCES benefit_enrollments(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id),

  -- Dependant Details
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- spouse, child, parent
  date_of_birth DATE NOT NULL,
  gender TEXT,

  -- Coverage
  effective_date DATE NOT NULL,
  end_date DATE,

  is_active BOOLEAN DEFAULT true
);
```

### 9.4 `compensation_reviews` (NEW)
```sql
CREATE TABLE compensation_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Review Details
  review_type TEXT CHECK (review_type IN ('annual_increment', 'promotion', 'market_adjustment', 'merit_increase', 'other')) NOT NULL,
  review_date DATE NOT NULL,
  effective_date DATE NOT NULL,

  -- Current vs New
  current_salary NUMERIC(12,2) NOT NULL,
  new_salary NUMERIC(12,2) NOT NULL,
  increase_amount NUMERIC(12,2) GENERATED ALWAYS AS (new_salary - current_salary) STORED,
  increase_percentage NUMERIC(5,2),

  -- Reason
  justification TEXT NOT NULL,
  triggered_by_appraisal UUID REFERENCES appraisals(id),

  -- Approval
  recommended_by UUID REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  -- Status
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')) DEFAULT 'pending',

  notes TEXT
);
```

---

## 10. TALENT MANAGEMENT & SUCCESSION

### 10.1 `talent_profiles` (NEW)
```sql
CREATE TABLE talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id) UNIQUE,

  -- Talent Classification
  is_high_potential BOOLEAN DEFAULT false,
  is_high_performer BOOLEAN DEFAULT false,
  talent_category TEXT, -- emerging_talent, core_talent, key_talent, critical_talent

  -- Assessment
  performance_rating INTEGER, -- Latest rating
  potential_rating INTEGER, -- 1-5

  -- Career
  career_aspirations TEXT,
  preferred_career_path TEXT, -- technical, management, hybrid
  mobility_preference TEXT, -- willing_to_relocate, prefer_current_location

  -- Development
  strengths TEXT,
  development_areas TEXT,

  -- Flight Risk
  retention_risk TEXT CHECK (retention_risk IN ('low', 'medium', 'high')),
  retention_risk_factors TEXT,

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);
```

### 10.2 `critical_positions` (NEW)
```sql
CREATE TABLE critical_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  position_id UUID REFERENCES positions(id),
  current_incumbent UUID REFERENCES employees(id),

  -- Criticality
  business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  criticality_reason TEXT,

  -- Risk
  succession_risk TEXT CHECK (succession_risk IN ('low', 'medium', 'high')) DEFAULT 'medium',
  time_to_fill_months INTEGER,

  -- Requirements
  key_competencies TEXT,
  experience_required TEXT,

  is_active BOOLEAN DEFAULT true
);
```

### 10.3 `succession_plans` (NEW)
```sql
CREATE TABLE succession_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  critical_position_id UUID REFERENCES critical_positions(id),
  successor_employee_id UUID REFERENCES employees(id),

  -- Readiness
  readiness_level TEXT CHECK (readiness_level IN ('ready_now', '1_year', '2_3_years', '3_5_years')) NOT NULL,
  readiness_percentage INTEGER,

  -- Gap Analysis
  competency_gaps TEXT,
  experience_gaps TEXT,

  -- Development Plan
  development_actions TEXT,
  training_required TEXT,
  mentoring_required BOOLEAN DEFAULT false,
  job_rotation_required BOOLEAN DEFAULT false,

  -- Timeline
  target_ready_date DATE,

  -- Status
  status TEXT CHECK (status IN ('active', 'on_track', 'delayed', 'completed', 'cancelled')) DEFAULT 'active',

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);
```

### 10.4 `career_paths` (NEW)
```sql
CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  from_position_id UUID REFERENCES positions(id),
  to_position_id UUID REFERENCES positions(id),

  -- Path Details
  path_type TEXT CHECK (path_type IN ('vertical', 'lateral', 'cross_functional')) NOT NULL,
  typical_years_in_role INTEGER,

  -- Requirements
  required_competencies TEXT,
  required_certifications TEXT,
  required_experience TEXT,

  is_active BOOLEAN DEFAULT true,

  UNIQUE(from_position_id, to_position_id)
);
```

---

**[CONTINUED IN NEXT RESPONSE - Will add Employee Relations, Health & Safety, Travel & Expense, Analytics, and System Administration]**

Should I continue with the remaining tables?
