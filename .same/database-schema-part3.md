# Complete Database Schema - Part 3
## Final Modules: Employee Relations, Safety, Travel, Analytics, System Admin

---

## 11. EMPLOYEE RELATIONS & DISCIPLINE

### 11.1 `grievances` (NEW)
```sql
CREATE TABLE grievances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  grievance_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  -- Grievance Details
  grievance_type TEXT, -- workplace_harassment, discrimination, bullying, unfair_treatment, other
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  incident_date DATE,

  -- Involved Parties
  against_employee_id UUID REFERENCES employees(id),
  witnesses TEXT,

  -- Investigation
  assigned_investigator UUID REFERENCES employees(id),
  investigation_start_date DATE,
  investigation_end_date DATE,
  investigation_findings TEXT,

  -- Resolution
  resolution_action TEXT,
  resolved_date DATE,
  resolved_by UUID REFERENCES employees(id),

  -- Status
  status TEXT CHECK (status IN ('submitted', 'under_review', 'under_investigation', 'resolved', 'closed', 'dismissed')) DEFAULT 'submitted',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',

  -- Confidential
  is_confidential BOOLEAN DEFAULT true,

  -- Supporting Documents
  supporting_documents_urls TEXT[]
);

CREATE INDEX idx_grievances_employee ON grievances(employee_id);
CREATE INDEX idx_grievances_status ON grievances(status);
```

### 11.2 `disciplinary_actions` (NEW)
```sql
CREATE TABLE disciplinary_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  action_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  -- Misconduct Details
  misconduct_type TEXT, -- attendance, performance, conduct, policy_violation, insubordination
  incident_description TEXT NOT NULL,
  incident_date DATE NOT NULL,

  -- Warning Level
  action_type TEXT CHECK (action_type IN ('verbal_warning', 'first_written', 'final_written', 'suspension', 'demotion', 'termination')) NOT NULL,

  -- Hearing
  hearing_date DATE,
  hearing_attendees TEXT,
  employee_statement TEXT,
  employee_represented_by TEXT,

  -- Decision
  decision TEXT NOT NULL,
  decision_date DATE,
  decided_by UUID REFERENCES employees(id),

  -- Sanction
  suspension_days INTEGER,
  suspension_start_date DATE,
  suspension_end_date DATE,
  fine_amount NUMERIC(10,2),

  -- Appeal
  appeal_deadline DATE,
  appeal_submitted BOOLEAN DEFAULT false,
  appeal_date DATE,
  appeal_outcome TEXT,

  -- Status
  status TEXT CHECK (status IN ('pending_hearing', 'decision_made', 'under_appeal', 'final', 'cancelled')) DEFAULT 'pending_hearing',

  -- Documents
  supporting_documents_urls TEXT[]
);

CREATE INDEX idx_disciplinary_employee ON disciplinary_actions(employee_id);
CREATE INDEX idx_disciplinary_type ON disciplinary_actions(action_type);
```

### 11.3 `workplace_incidents` (NEW)
```sql
CREATE TABLE workplace_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,

  -- Incident Details
  incident_type TEXT, -- harassment, conflict, bullying, violence, theft, damage
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT,
  incident_description TEXT NOT NULL,

  -- Parties Involved
  reported_by UUID REFERENCES employees(id),
  involved_employees UUID[], -- array of employee IDs
  witnesses UUID[],

  -- Investigation
  requires_investigation BOOLEAN DEFAULT true,
  assigned_to UUID REFERENCES employees(id),
  investigation_notes TEXT,

  -- Action Taken
  action_taken TEXT,
  referral_made_to TEXT, -- HR, security, police, counselling

  -- Status
  status TEXT CHECK (status IN ('reported', 'under_investigation', 'action_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  -- Confidential
  is_confidential BOOLEAN DEFAULT true
);

CREATE INDEX idx_incidents_type ON workplace_incidents(incident_type);
CREATE INDEX idx_incidents_status ON workplace_incidents(status);
```

---

## 12. HEALTH, SAFETY & WELLBEING

### 12.1 `safety_incidents` (NEW)
```sql
CREATE TABLE safety_incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  incident_number TEXT UNIQUE NOT NULL,

  -- Incident Details
  incident_type TEXT CHECK (incident_type IN ('accident', 'near_miss', 'hazard', 'injury', 'illness')) NOT NULL,
  incident_date TIMESTAMPTZ NOT NULL,
  incident_location TEXT NOT NULL,
  incident_description TEXT NOT NULL,

  -- Person Affected
  affected_employee_id UUID REFERENCES employees(id),
  affected_person_name TEXT, -- if not employee (visitor, contractor)

  -- Injury Details (if applicable)
  injury_type TEXT, -- cut, bruise, fracture, burn, etc.
  body_part_affected TEXT,
  severity TEXT CHECK (severity IN ('minor', 'moderate', 'serious', 'critical', 'fatal')),

  -- Medical Treatment
  first_aid_given BOOLEAN DEFAULT false,
  medical_treatment_required BOOLEAN DEFAULT false,
  hospital_name TEXT,
  days_off_work INTEGER DEFAULT 0,

  -- Investigation
  reported_by UUID REFERENCES employees(id),
  investigated_by UUID REFERENCES employees(id),
  root_cause_analysis TEXT,

  -- Corrective Actions
  immediate_action_taken TEXT,
  preventive_measures TEXT,

  -- Follow-up
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date DATE,
  follow_up_notes TEXT,

  -- Status
  status TEXT CHECK (status IN ('reported', 'under_investigation', 'actions_taken', 'closed')) DEFAULT 'reported',
  closed_date DATE,

  -- Reportable
  reportable_to_authorities BOOLEAN DEFAULT false,
  reported_to_authorities BOOLEAN DEFAULT false,
  reporting_reference TEXT
);

CREATE INDEX idx_safety_incidents_date ON safety_incidents(incident_date);
CREATE INDEX idx_safety_incidents_type ON safety_incidents(incident_type);
CREATE INDEX idx_safety_incidents_severity ON safety_incidents(severity);
```

### 12.2 `safety_audits` (NEW)
```sql
CREATE TABLE safety_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  audit_number TEXT UNIQUE NOT NULL,
  audit_type TEXT, -- routine, special, regulatory, follow_up

  -- Schedule
  audit_date DATE NOT NULL,
  location_id UUID REFERENCES work_locations(id),
  specific_area TEXT,

  -- Auditor
  auditor_id UUID REFERENCES employees(id),
  external_auditor TEXT,

  -- Findings
  total_items_checked INTEGER,
  compliant_items INTEGER,
  non_compliant_items INTEGER,
  observations TEXT,

  -- Risk Rating
  overall_risk_rating TEXT CHECK (overall_risk_rating IN ('low', 'medium', 'high', 'critical')),

  -- Actions Required
  corrective_actions_required TEXT,
  action_deadline DATE,
  actions_completed BOOLEAN DEFAULT false,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'follow_up_required')) DEFAULT 'scheduled',

  -- Report
  audit_report_url TEXT
);
```

### 12.3 `medical_checkups` (NEW)
```sql
CREATE TABLE medical_checkups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),

  -- Checkup Details
  checkup_type TEXT, -- pre_employment, periodic, fitness_for_work, post_illness, retirement
  checkup_date DATE NOT NULL,

  -- Provider
  medical_provider TEXT,
  doctor_name TEXT,

  -- Results
  fit_for_work BOOLEAN,
  fitness_category TEXT, -- fit, fit_with_restrictions, temporarily_unfit, permanently_unfit
  restrictions TEXT,

  -- Follow-up
  next_checkup_date DATE,
  recommendations TEXT,

  -- Document
  medical_report_url TEXT,

  -- Status
  status TEXT CHECK (status IN ('scheduled', 'completed', 'overdue')) DEFAULT 'scheduled'
);

CREATE INDEX idx_medical_checkups_employee ON medical_checkups(employee_id);
CREATE INDEX idx_medical_checkups_next_date ON medical_checkups(next_checkup_date);
```

### 12.4 `wellness_programs` (NEW)
```sql
CREATE TABLE wellness_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  program_name TEXT NOT NULL,
  program_type TEXT, -- health_screening, fitness, mental_health, nutrition, stress_management
  description TEXT,

  -- Schedule
  start_date DATE,
  end_date DATE,
  frequency TEXT, -- one_time, weekly, monthly, quarterly

  -- Participation
  target_participants TEXT, -- all_staff, specific_department, high_risk
  max_participants INTEGER,

  -- Provider
  provider_name TEXT,
  facilitator_name TEXT,

  -- Cost
  cost NUMERIC(10,2),
  cost_covered_by TEXT, -- employer, employee, shared

  -- Status
  status TEXT CHECK (status IN ('planned', 'active', 'completed', 'cancelled')) DEFAULT 'planned',

  is_active BOOLEAN DEFAULT true
);
```

---

## 13. TRAVEL & EXPENSE MANAGEMENT

### 13.1 `travel_requests` (NEW)
```sql
CREATE TABLE travel_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  request_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),

  -- Travel Details
  purpose TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  destination_country TEXT DEFAULT 'Papua New Guinea',

  -- Dates
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  duration_days INTEGER,

  -- Travel Mode
  transport_mode TEXT, -- flight, vehicle, boat, other
  accommodation_required BOOLEAN DEFAULT false,

  -- Cost Estimates
  estimated_airfare NUMERIC(10,2),
  estimated_accommodation NUMERIC(10,2),
  estimated_meals NUMERIC(10,2),
  estimated_other NUMERIC(10,2),
  estimated_total NUMERIC(10,2),

  -- Budget
  budget_code TEXT,
  project_code TEXT,

  -- Approval
  status TEXT CHECK (status IN ('draft', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'cancelled')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,

  rejection_reason TEXT,

  -- Advance
  advance_requested BOOLEAN DEFAULT false,
  advance_amount NUMERIC(10,2),
  advance_paid BOOLEAN DEFAULT false
);

CREATE INDEX idx_travel_employee ON travel_requests(employee_id);
CREATE INDEX idx_travel_status ON travel_requests(status);
```

### 13.2 `expense_claims` (NEW)
```sql
CREATE TABLE expense_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  claim_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id),
  travel_request_id UUID REFERENCES travel_requests(id),

  -- Claim Period
  claim_period_start DATE NOT NULL,
  claim_period_end DATE NOT NULL,

  -- Totals
  total_amount NUMERIC(10,2),
  advance_received NUMERIC(10,2) DEFAULT 0,
  net_claim_amount NUMERIC(10,2) GENERATED ALWAYS AS (total_amount - advance_received) STORED,

  -- Submission
  submitted_date DATE,

  -- Approval
  status TEXT CHECK (status IN ('draft', 'submitted', 'pending_manager', 'pending_finance', 'approved', 'rejected', 'paid')) DEFAULT 'draft',
  approved_by_manager UUID REFERENCES employees(id),
  manager_approval_date DATE,
  approved_by_finance UUID REFERENCES employees(id),
  finance_approval_date DATE,

  rejection_reason TEXT,

  -- Payment
  payment_method TEXT, -- bank_transfer, cash, payroll
  paid_date DATE,
  payment_reference TEXT
);

CREATE INDEX idx_expense_claims_employee ON expense_claims(employee_id);
CREATE INDEX idx_expense_claims_status ON expense_claims(status);
```

### 13.3 `expense_line_items` (NEW)
```sql
CREATE TABLE expense_line_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  expense_claim_id UUID REFERENCES expense_claims(id) ON DELETE CASCADE,

  -- Expense Details
  expense_date DATE NOT NULL,
  expense_category TEXT NOT NULL, -- accommodation, meals, transport, fuel, parking, other
  description TEXT NOT NULL,

  -- Amount
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'PGK',

  -- Receipt
  receipt_url TEXT,
  receipt_number TEXT,

  -- Approval
  approved BOOLEAN,
  approved_amount NUMERIC(10,2),
  rejection_reason TEXT
);

CREATE INDEX idx_expense_items_claim ON expense_line_items(expense_claim_id);
```

---

## 14. HR ANALYTICS & REPORTING

### 14.1 `report_schedules` (NEW)
```sql
CREATE TABLE report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  report_name TEXT NOT NULL,
  report_type TEXT, -- headcount, turnover, payroll, attendance, leave, custom

  -- Schedule
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annually')) NOT NULL,
  schedule_day_of_week INTEGER, -- 0-6 for Sunday-Saturday
  schedule_day_of_month INTEGER, -- 1-31
  schedule_time TIME DEFAULT '08:00',

  -- Recipients
  recipient_employee_ids UUID[],
  recipient_emails TEXT[],

  -- Parameters
  report_parameters JSONB,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_run_date TIMESTAMPTZ,
  next_run_date TIMESTAMPTZ,

  created_by UUID REFERENCES employees(id)
);
```

### 14.2 `turnover_data` (NEW)
```sql
CREATE TABLE turnover_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calculated_date DATE DEFAULT CURRENT_DATE,

  -- Period
  period_year INTEGER NOT NULL,
  period_month INTEGER, -- NULL for annual
  period_quarter INTEGER, -- NULL for monthly/annual

  -- Metrics
  opening_headcount INTEGER,
  closing_headcount INTEGER,
  new_hires INTEGER,
  terminations INTEGER,
  turnover_rate NUMERIC(5,2),

  -- By Department (if applicable)
  department_id UUID REFERENCES departments(id),

  UNIQUE(period_year, period_month, department_id)
);
```

---

## 15. SYSTEM ADMINISTRATION

### 15.1 `user_roles` (NEW)
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  role_name TEXT UNIQUE NOT NULL,
  role_description TEXT,
  role_level INTEGER, -- 1=Admin, 2=HR Manager, 3=Line Manager, 4=Employee

  -- Permissions (JSONB for flexibility)
  permissions JSONB NOT NULL DEFAULT '{}',

  is_active BOOLEAN DEFAULT true
);

-- Default roles
INSERT INTO user_roles (role_name, role_description, role_level, permissions) VALUES
('Super Admin', 'Full system access', 1, '{"all": true}'),
('HR Admin', 'Full HR module access', 2, '{"hr": "full", "payroll": "full", "reports": "full"}'),
('HR Manager', 'HR operations', 2, '{"hr": "manage", "leave": "approve", "reports": "view"}'),
('Finance Manager', 'Payroll and finance', 2, '{"payroll": "manage", "expenses": "approve", "reports": "finance"}'),
('Line Manager', 'Team management', 3, '{"team": "view", "leave": "approve", "attendance": "view", "timesheets": "approve"}'),
('Employee', 'Self-service access', 4, '{"self": "full"}');
```

### 15.2 `user_permissions` (NEW)
```sql
CREATE TABLE user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id),
  user_role_id UUID REFERENCES user_roles(id),

  -- Additional Permissions
  additional_permissions JSONB DEFAULT '{}',

  -- Restrictions
  data_access_scope TEXT CHECK (data_access_scope IN ('all', 'department', 'team', 'self')) DEFAULT 'self',
  department_ids UUID[], -- for department-level access

  -- Validity
  effective_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,

  is_active BOOLEAN DEFAULT true,

  granted_by UUID REFERENCES employees(id),

  UNIQUE(employee_id, user_role_id)
);
```

### 15.3 `audit_logs` (NEW)
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- User Action
  user_id UUID REFERENCES auth.users(id),
  employee_id UUID REFERENCES employees(id),

  -- Action Details
  action_type TEXT NOT NULL, -- create, read, update, delete, approve, reject
  module TEXT NOT NULL, -- employees, payroll, leave, etc.
  table_name TEXT,
  record_id UUID,

  -- Changes
  old_values JSONB,
  new_values JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,

  -- Result
  success BOOLEAN DEFAULT true,
  error_message TEXT
);

CREATE INDEX idx_audit_logs_user ON audit_logs(employee_id);
CREATE INDEX idx_audit_logs_module ON audit_logs(module);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
```

### 15.4 `system_settings` (NEW)
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('text', 'number', 'boolean', 'json', 'date')) DEFAULT 'text',

  -- Metadata
  category TEXT, -- general, payroll, leave, attendance, email, etc.
  description TEXT,

  -- Validation
  is_encrypted BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,

  updated_by UUID REFERENCES employees(id)
);

-- Default settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category) VALUES
('company_name', 'Papua New Guinea University', 'text', 'general'),
('default_currency', 'PGK', 'text', 'general'),
('financial_year_start_month', '1', 'number', 'general'),
('probation_period_days', '180', 'number', 'hr'),
('notice_period_days', '30', 'number', 'hr'),
('working_hours_per_day', '8', 'number', 'attendance'),
('working_days_per_week', '5', 'number', 'attendance'),
('payroll_cutoff_day', '25', 'number', 'payroll');
```

### 15.5 `public_holidays` (NEW)
```sql
CREATE TABLE public_holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  holiday_date DATE NOT NULL,
  holiday_name TEXT NOT NULL,
  holiday_type TEXT, -- national, provincial, religious

  -- Applicability
  applies_to_all_locations BOOLEAN DEFAULT true,
  location_ids UUID[], -- specific locations if not all

  -- Recurring
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT, -- e.g., "first Monday of June"

  year INTEGER NOT NULL,

  is_active BOOLEAN DEFAULT true,

  UNIQUE(holiday_date, year)
);

-- PNG Public Holidays 2025
INSERT INTO public_holidays (holiday_date, holiday_name, year, is_recurring) VALUES
('2025-01-01', 'New Year''s Day', 2025, true),
('2025-04-18', 'Good Friday', 2025, false),
('2025-04-19', 'Easter Saturday', 2025, false),
('2025-04-21', 'Easter Monday', 2025, false),
('2025-06-09', 'Queen''s Birthday', 2025, false),
('2025-07-23', 'National Remembrance Day', 2025, true),
('2025-09-16', 'Independence Day', 2025, true),
('2025-12-25', 'Christmas Day', 2025, true),
('2025-12-26', 'Boxing Day', 2025, true);
```

---

## Summary of All Tables

### Total Tables: **60+**

1. **Core HR (15 tables)**
   - employees, emergency_contacts, employee_documents, employment_contracts
   - departments, positions, job_families, job_grades, job_descriptions
   - work_locations, cost_centres, employment_types

2. **Recruitment (6 tables)**
   - job_requisitions, job_postings, candidates, applications, interviews, offers

3. **Onboarding/Offboarding (6 tables)**
   - onboarding_checklists, onboarding_tasks, probation_reviews
   - resignations, exit_interviews, exit_clearances

4. **Time & Attendance (6 tables)**
   - shifts, rosters, attendance (enhanced), overtime_requests, timesheets, timesheet_entries

5. **Leave (4 tables)**
   - leave_types, leave_requests (enhanced), leave_balances, leave_accruals

6. **Payroll (12 tables - already exists)**
   - [Existing comprehensive payroll tables]

7. **Performance (5 tables)**
   - performance_goals, appraisal_cycles, appraisals, feedback_360, performance_improvement_plans

8. **Learning (5 tables)**
   - training_courses, training_sessions, training_enrollments, employee_certifications, employee_skills

9. **Benefits (4 tables)**
   - benefit_plans, benefit_enrollments, benefit_dependants, compensation_reviews

10. **Talent (4 tables)**
    - talent_profiles, critical_positions, succession_plans, career_paths

11. **Employee Relations (3 tables)**
    - grievances, disciplinary_actions, workplace_incidents

12. **Health & Safety (4 tables)**
    - safety_incidents, safety_audits, medical_checkups, wellness_programs

13. **Travel & Expense (3 tables)**
    - travel_requests, expense_claims, expense_line_items

14. **Analytics (2 tables)**
    - report_schedules, turnover_data

15. **System Admin (5 tables)**
    - user_roles, user_permissions, audit_logs, system_settings, public_holidays

---

## Database Indexes Summary

All tables include appropriate indexes for:
- Foreign keys
- Frequently searched fields
- Date fields for range queries
- Status fields for filtering
- Unique constraints

---

## Next Steps

1. **Create Migration Scripts** - Generate SQL migration files
2. **Apply to Supabase** - Run migrations on database
3. **Create TypeScript Types** - Generate types from schema
4. **Build API Layer** - Create CRUD operations for each table
5. **Implement UI** - Build pages for each module

---

**Schema Version:** 1.0
**Created:** December 10, 2025
**Database:** PostgreSQL (Supabase)
**Total Tables:** 60+
**Total Fields:** 800+
