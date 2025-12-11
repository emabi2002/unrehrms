-- =====================================================
-- MIGRATION 008: Employee Relations, Safety, Travel & Admin
-- Created: December 10, 2025
-- =====================================================

-- =====================================================
-- 10. EMPLOYEE RELATIONS & DISCIPLINE
-- =====================================================

CREATE TABLE IF NOT EXISTS grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  grievance_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  grievance_type TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,

  against_employee_id UUID REFERENCES employees(id),
  witnesses TEXT,

  assigned_investigator UUID REFERENCES employees(id),
  investigation_start_date DATE,
  investigation_end_date DATE,
  investigation_findings TEXT,

  resolution_action TEXT,
  resolved_date DATE,
  resolved_by UUID REFERENCES employees(id),

  status TEXT CHECK (status IN ('submitted', 'under_review', 'under_investigation', 'resolved', 'closed', 'dismissed')) DEFAULT 'submitted',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  is_confidential BOOLEAN DEFAULT true,
  supporting_documents_urls TEXT[]
);

CREATE TABLE IF NOT EXISTS disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  action_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  misconduct_type TEXT,
  incident_description TEXT NOT NULL,
  incident_date DATE NOT NULL,

  action_type TEXT CHECK (action_type IN ('verbal_warning', 'first_written', 'final_written', 'suspension', 'demotion', 'termination')) NOT NULL,

  hearing_date DATE,
  hearing_attendees TEXT,
  employee_statement TEXT,
  employee_represented_by TEXT,

  decision TEXT NOT NULL,
  decision_date DATE,
  decided_by UUID REFERENCES employees(id),

  suspension_days INTEGER,
  suspension_start_date DATE,
  suspension_end_date DATE,
  fine_amount NUMERIC(10,2),

  appeal_deadline DATE,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_date DATE,
  appeal_outcome TEXT,

  status TEXT CHECK (status IN ('pending_hearing', 'decision_made', 'under_appeal', 'final', 'cancelled')) DEFAULT 'pending_hearing',

  supporting_documents_urls TEXT[]
);

CREATE TABLE IF NOT EXISTS workplace_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,
  incident_type TEXT,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  incident_description TEXT NOT NULL,

  reported_by UUID REFERENCES employees(id),
  involved_employees UUID[],
  witnesses UUID[],

  requires_investigation BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES employees(id),
  investigation_notes TEXT,

  action_taken TEXT,
  referral_made_to TEXT,

  status TEXT CHECK (status IN ('reported', 'under_investigation', 'action_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  is_confidential BOOLEAN DEFAULT true
);

-- =====================================================
-- 11. HEALTH, SAFETY & WELLBEING
-- =====================================================

CREATE TABLE IF NOT EXISTS safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,
  incident_type TEXT CHECK (incident_type IN ('accident', 'near_miss', 'hazard', 'injury', 'illness')) NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT NOT NULL,
  incident_description TEXT NOT NULL,

  affected_employee_id UUID REFERENCES employees(id),
  affected_person_name TEXT,

  injury_type TEXT,
  body_part_affected TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious', 'critical', 'fatal')),

  first_aid_given BOOLEAN DEFAULT false,
  medical_treatment_required BOOLEAN DEFAULT false,
  hospital_name TEXT,
  days_off_work INTEGER DEFAULT 0,

  reported_by UUID REFERENCES employees(id),
  investigated_by UUID REFERENCES employees(id),
  root_cause_analysis TEXT,

  immediate_action_taken TEXT,
  preventive_measures TEXT,

  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  status TEXT CHECK (status IN ('reported', 'under_investigation', 'actions_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  reportable_to_authorities BOOLEAN DEFAULT false,
  reported_to_authorities BOOLEAN DEFAULT false,
  reporting_reference TEXT
);

CREATE TABLE IF NOT EXISTS safety_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  audit_number TEXT UNIQUE NOT NULL,
  audit_type TEXT,
  audit_date DATE NOT NULL,
  location_id UUID REFERENCES work_locations(id),
  specific_area TEXT,

  auditor_id UUID REFERENCES employees(id),
  external_auditor TEXT,

  total_items_checked INTEGER,
  compliant_items INTEGER,
  non_compliant_items INTEGER,
  observations TEXT,

  overall_risk_rating TEXT CHECK (overall_risk_rating IN ('low', 'medium', 'high', 'critical')),

  corrective_actions_required TEXT,
  action_deadline DATE,
  actions_completed BOOLEAN DEFAULT false,

  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'follow_up_required')) DEFAULT 'scheduled',
  audit_report_url TEXT
);

CREATE TABLE IF NOT EXISTS medical_checkups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  checkup_type TEXT,
  checkup_date DATE NOT NULL,

  medical_provider TEXT,
  doctor_name TEXT,

  fit_for_work BOOLEAN,
  fitness_category TEXT,
  restrictions TEXT,

  next_checkup_date DATE,
  recommendations TEXT,

  medical_report_url TEXT,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'overdue')) DEFAULT 'scheduled'
);

CREATE TABLE IF NOT EXISTS wellness_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  program_name TEXT NOT NULL,
  program_type TEXT,
  description TEXT,

  start_date DATE,
  end_date DATE,
  frequency TEXT,

  target_participants TEXT,
  max_participants INTEGER,

  provider_name TEXT,
  facilitator_name TEXT,

  cost NUMERIC(10,2),
  cost_covered_by TEXT,

  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',
  is_active BOOLEAN DEFAULT true
);

-- =====================================================
-- 12. TRAVEL & EXPENSE MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS travel_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  request_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  purpose TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT DEFAULT 'Papua New Guinea',

  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  duration_days INTEGER,

  transport_mode TEXT,
  accommodation_required BOOLEAN DEFAULT false,

  estimated_airfare NUMERIC(10,2),
  estimated_accommodation NUMERIC(10,2),
  estimated_meals NUMERIC(10,2),
  estimated_other NUMERIC(10,2),
  estimated_total NUMERIC(10,2),

  budget_code TEXT,
  project_code TEXT,

  status TEXT CHECK (status IN ('draft', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,
  rejection_reason TEXT,

  advance_requested BOOLEAN DEFAULT false,
  advance_amount NUMERIC(10,2),
  advance_paid BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),
  travel_request_id UUID REFERENCES travel_requests(id),

  claim_period_start DATE NOT NULL,
  claim_period_end DATE NOT NULL,

  total_amount NUMERIC(10,2),
  advance_received NUMERIC(10,2) DEFAULT 0,
  net_claim_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - advance_received) STORED,

  submitted_date DATE,

  status TEXT CHECK (status IN ('draft', 'submitted', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'paid')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,
  rejection_reason TEXT,

  payment_method TEXT,
  paid_date DATE,
  payment_reference TEXT
);

CREATE TABLE IF NOT EXISTS expense_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  expense_claim_id UUID REFERENCES expense_claims(id) ON DELETE CASCADE,

  expense_date DATE NOT NULL,
  expense_category TEXT NOT NULL,
  description TEXT NOT NULL,

  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',

  receipt_url TEXT,
  receipt_number TEXT,

  approved BOOLEAN,
  approved_amount NUMERIC(10,2),
  rejection_reason TEXT
);

-- =====================================================
-- 13. SYSTEM ADMINISTRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  role_name TEXT UNIQUE NOT NULL,
  role_description TEXT,
  role_level INTEGER,

  permissions JSONB NOT NULL DEFAULT '{}',

  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  user_role_id UUID REFERENCES user_roles(id),

  additional_permissions JSONB DEFAULT '{}',

  data_access_scope TEXT CHECK (data_access_scope IN ('all', 'department', 'team', 'self')) DEFAULT 'self',
  department_ids UUID[],

  effective_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,

  is_active BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES employees(id),

  UNIQUE(employee_id, user_role_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  action_type TEXT NOT NULL,
  module TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,

  old_values JSONB,
  new_values JSONB,

  ip_address INET,
  user_agent TEXT,
  session_id TEXT,

  success BOOLEAN DEFAULT true,
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'date')) DEFAULT 'text',

  category TEXT,
  description TEXT,

  is_encrypted BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,

  updated_by UUID REFERENCES employees(id)
);

CREATE TABLE IF NOT EXISTS public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  holiday_date DATE NOT NULL,
  holiday_name TEXT NOT NULL,
  holiday_type TEXT,

  applies_to_all_locations BOOLEAN DEFAULT true,
  location_ids UUID[],

  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,

  year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,

  UNIQUE(holiday_date, year)
);

-- Insert default user roles
INSERT INTO user_roles (role_name, role_description, role_level, permissions) VALUES
('Super Admin', 'Full system access', 1, '{"all": true}'),
('HR Admin', 'Full HR module access', 2, '{"hr": "full", "payroll": "full", "reports": "full"}'),
('HR Manager', 'HR operations', 2, '{"hr": "manage", "leave": "approve", "reports": "view"}'),
('Finance Manager', 'Payroll and finance', 2, '{"payroll": "manage", "expenses": "approve", "reports": "finance"}'),
('Line Manager', 'Team management', 3, '{"team": "view", "leave": "approve", "attendance": "view", "timesheets": "approve"}'),
('Employee', 'Self-service access', 4, '{"self": "full"}')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description) VALUES
('company_name', 'Papua New Guinea University', 'text', 'general', 'Company name'),
('default_currency', 'PGK', 'text', 'general', 'Default currency'),
('financial_year_start_month', '1', 'number', 'general', 'Financial year start month'),
('probation_period_days', '180', 'number', 'hr', 'Default probation period in days'),
('notice_period_days', '30', 'number', 'hr', 'Default notice period in days'),
('working_hours_per_day', '8', 'number', 'attendance', 'Standard working hours per day'),
('working_days_per_week', '5', 'number', 'attendance', 'Standard working days per week'),
('payroll_cutoff_day', '25', 'number', 'payroll', 'Payroll processing cutoff day')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert PNG Public Holidays for 2025
INSERT INTO public_holidays (holiday_date, holiday_name, year, is_recurring, holiday_type) VALUES
('2025-01-01', 'New Year''s Day', 2025, true, 'national'),
('2025-04-18', 'Good Friday', 2025, false, 'religious'),
('2025-04-19', 'Easter Saturday', 2025, false, 'religious'),
('2025-04-21', 'Easter Monday', 2025, false, 'religious'),
('2025-06-09', 'Queen''s Birthday', 2025, false, 'national'),
('2025-07-23', 'National Remembrance Day', 2025, true, 'national'),
('2025-09-16', 'Independence Day', 2025, true, 'national'),
('2025-12-25', 'Christmas Day', 2025, true, 'religious'),
('2025-12-26', 'Boxing Day', 2025, true, 'national')
ON CONFLICT (holiday_date, year) DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_grievances_employee ON grievances(employee_id);
CREATE INDEX IF NOT EXISTS idx_disciplinary_employee ON disciplinary_actions(employee_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_travel_requests_employee ON travel_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_claims_employee ON expense_claims(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_employee ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE disciplinary_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

SELECT 'Migration 008: Employee Relations, Safety, Travel & Admin completed' AS status;
