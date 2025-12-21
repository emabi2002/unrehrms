-- =====================================================
-- MIGRATION 007: Performance, Learning, Benefits & Talent
-- Created: December 10, 2025
-- =====================================================

-- =====================================================
-- 6. PERFORMANCE MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  goal_type TEXT CHECK (goal_type IN ('organizational', 'departmental', 'individual')) NOT NULL,
  parent_goal_id UUID REFERENCES performance_goals(id),

  employee_id UUID REFERENCES employees(id),
  department_id UUID REFERENCES departments(id),

  goal_title TEXT NOT NULL,
  goal_description TEXT,
  kpi_metrics TEXT,
  target_value TEXT,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  weight_percentage NUMERIC(5,2),

  status TEXT CHECK (status IN ('draft', 'active', 'achieved', 'partially_achieved', 'not_achieved', 'cancelled')) DEFAULT 'draft',
  progress_percentage INTEGER DEFAULT 0,
  actual_value TEXT,

  created_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS appraisal_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  cycle_name TEXT NOT NULL,
  cycle_type TEXT CHECK (cycle_type IN ('annual', 'mid_year', 'probation', 'project')) NOT NULL,

  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE NOT NULL,

  self_assessment_start DATE,
  self_assessment_end DATE,
  manager_review_start DATE,
  manager_review_end DATE,
  calibration_start DATE,
  calibration_end DATE,

  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed')) DEFAULT 'not_started',

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS appraisals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  appraisal_cycle_id UUID REFERENCES appraisal_cycles(id),

  -- Self Assessment
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

  -- Competency Ratings
  technical_skills_rating INTEGER,
  communication_rating INTEGER,
  teamwork_rating INTEGER,
  leadership_rating INTEGER,
  problem_solving_rating INTEGER,
  innovation_rating INTEGER,

  -- Final Rating
  final_rating INTEGER,
  final_rating_category TEXT,
  calibrated_by UUID REFERENCES employees(id),
  calibration_date DATE,

  -- Recommendations
  promotion_recommended BOOLEAN DEFAULT false,
  salary_increase_recommended BOOLEAN DEFAULT false,
  salary_increase_percentage NUMERIC(5,2),

  status TEXT CHECK (status IN ('not_started', 'self_assessment', 'manager_review', 'calibration', 'completed', 'acknowledged')) DEFAULT 'not_started',

  acknowledged_by_employee BOOLEAN DEFAULT false,
  employee_comments TEXT,
  acknowledged_date DATE,

  UNIQUE(employee_id, appraisal_cycle_id)
);

CREATE TABLE IF NOT EXISTS feedback_360 (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  appraisal_id UUID REFERENCES appraisals(id),
  employee_id UUID REFERENCES employees(id),

  reviewer_id UUID REFERENCES employees(id),
  reviewer_relationship TEXT CHECK (reviewer_relationship IN ('manager', 'peer', 'subordinate', 'external')) NOT NULL,

  leadership_rating INTEGER,
  communication_rating INTEGER,
  collaboration_rating INTEGER,
  technical_rating INTEGER,
  reliability_rating INTEGER,

  strengths TEXT,
  areas_for_improvement TEXT,
  additional_comments TEXT,

  completed BOOLEAN DEFAULT false,
  completed_date DATE,
  is_anonymous BOOLEAN DEFAULT true
);

-- =====================================================
-- 7. LEARNING & DEVELOPMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS training_courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_code TEXT UNIQUE NOT NULL,
  course_name TEXT NOT NULL,
  course_description TEXT,
  course_category TEXT,

  duration_hours NUMERIC(5,2),
  delivery_method TEXT,

  provider_type TEXT CHECK (provider_type IN ('internal', 'external')) DEFAULT 'internal',
  provider_name TEXT,

  cost_per_person NUMERIC(10,2),
  currency TEXT DEFAULT 'PGK',

  prerequisites TEXT,
  target_audience TEXT,

  certification_provided BOOLEAN DEFAULT false,
  certification_validity_months INTEGER,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  course_id UUID REFERENCES training_courses(id),
  session_name TEXT NOT NULL,

  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,

  location TEXT,
  room TEXT,
  online_meeting_link TEXT,

  max_participants INTEGER,
  min_participants INTEGER,

  trainer_id UUID REFERENCES employees(id),
  external_trainer_name TEXT,

  status TEXT CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  total_cost NUMERIC(12,2),
  evaluation_required BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS training_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  training_session_id UUID REFERENCES training_sessions(id),

  enrollment_date DATE DEFAULT CURRENT_DATE,
  enrollment_type TEXT CHECK (enrollment_type IN ('self_enrolled', 'manager_nominated', 'mandatory')) DEFAULT 'self_enrolled',
  nominated_by UUID REFERENCES employees(id),

  requires_approval BOOLEAN DEFAULT false,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  approved_by UUID REFERENCES employees(id),
  approved_date DATE,

  attendance_status TEXT CHECK (attendance_status IN ('enrolled', 'attended', 'partially_attended', 'absent', 'cancelled')) DEFAULT 'enrolled',
  attendance_percentage INTEGER,

  pre_assessment_score NUMERIC(5,2),
  post_assessment_score NUMERIC(5,2),
  passed BOOLEAN,

  certificate_issued BOOLEAN DEFAULT false,
  certificate_url TEXT,
  certificate_expiry_date DATE,

  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,

  UNIQUE(employee_id, training_session_id)
);

CREATE TABLE IF NOT EXISTS employee_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  certification_name TEXT NOT NULL,
  certification_body TEXT,
  certification_number TEXT,

  issue_date DATE NOT NULL,
  expiry_date DATE,
  renewal_required BOOLEAN DEFAULT false,
  renewal_notice_days INTEGER DEFAULT 90,

  certificate_file_url TEXT,

  status TEXT CHECK (status IN ('active', 'expired', 'renewed', 'revoked')) DEFAULT 'active',
  obtained_via_training_session UUID REFERENCES training_sessions(id)
);

CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  skill_name TEXT NOT NULL,
  skill_category TEXT,

  proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  years_of_experience NUMERIC(4,1),

  verified_by UUID REFERENCES employees(id),
  verified_date DATE,

  acquired_through_training UUID REFERENCES training_sessions(id),
  last_used_date DATE
);

-- =====================================================
-- 8. BENEFITS & COMPENSATION
-- =====================================================

CREATE TABLE IF NOT EXISTS benefit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  plan_code TEXT UNIQUE NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT CHECK (plan_type IN ('medical', 'life_insurance', 'housing', 'transport', 'meal', 'education', 'other')) NOT NULL,

  provider_name TEXT,
  provider_contact TEXT,
  policy_number TEXT,

  coverage_details TEXT,
  coverage_amount NUMERIC(12,2),

  eligibility_criteria TEXT,
  min_grade_level INTEGER,
  min_service_months INTEGER,

  employer_contribution_percentage NUMERIC(5,2),
  employee_contribution_percentage NUMERIC(5,2),
  monthly_premium NUMERIC(10,2),

  covers_dependants BOOLEAN DEFAULT false,
  max_dependants INTEGER,

  effective_date DATE,
  end_date DATE,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS benefit_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  benefit_plan_id UUID REFERENCES benefit_plans(id),

  enrollment_date DATE NOT NULL,
  effective_date DATE NOT NULL,

  status TEXT CHECK (status IN ('active', 'suspended', 'cancelled', 'expired')) DEFAULT 'active',

  coverage_amount NUMERIC(12,2),
  employee_contribution NUMERIC(10,2),
  employer_contribution NUMERIC(10,2),

  number_of_dependants INTEGER DEFAULT 0,

  cancellation_date DATE,
  cancellation_reason TEXT,

  UNIQUE(employee_id, benefit_plan_id, enrollment_date)
);

-- =====================================================
-- 9. TALENT MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id) UNIQUE,

  is_high_potential BOOLEAN DEFAULT false,
  is_high_performer BOOLEAN DEFAULT false,
  talent_category TEXT,

  performance_rating INTEGER,
  potential_rating INTEGER,

  career_aspirations TEXT,
  preferred_career_path TEXT,
  mobility_preference TEXT,

  strengths TEXT,
  development_areas TEXT,

  retention_risk TEXT CHECK (retention_risk IN ('low', 'medium', 'high')),
  retention_risk_factors TEXT,

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS critical_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  position_id UUID REFERENCES positions(id),
  current_incumbent UUID REFERENCES employees(id),

  business_impact TEXT CHECK (business_impact IN ('low', 'medium', 'high', 'critical')) DEFAULT 'high',
  criticality_reason TEXT,

  succession_risk TEXT CHECK (succession_risk IN ('low', 'medium', 'high')) DEFAULT 'medium',
  time_to_fill_months INTEGER,

  key_competencies TEXT,
  experience_required TEXT,

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS succession_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  critical_position_id UUID REFERENCES critical_positions(id),
  successor_employee_id UUID REFERENCES employees(id),

  readiness_level TEXT CHECK (readiness_level IN ('ready_now', '1_year', '2_3_years', '3_5_years')) NOT NULL,
  readiness_percentage INTEGER,

  competency_gaps TEXT,
  experience_gaps TEXT,

  development_actions TEXT,
  training_required TEXT,
  mentoring_required BOOLEAN DEFAULT false,
  job_rotation_required BOOLEAN DEFAULT false,

  target_ready_date DATE,

  status TEXT CHECK (status IN ('active', 'on_track', 'delayed', 'completed', 'cancelled')) DEFAULT 'active',

  last_reviewed_date DATE,
  reviewed_by UUID REFERENCES employees(id)
);

-- Add indexes
CREATE INDEX idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX idx_appraisals_employee ON appraisals(employee_id);
CREATE INDEX idx_training_enrollments_employee ON training_enrollments(employee_id);
CREATE INDEX idx_talent_profiles_employee ON talent_profiles(employee_id);

-- Enable RLS
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE benefit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

SELECT 'Migration 007: Performance, Learning, Benefits & Talent modules completed' AS status;
