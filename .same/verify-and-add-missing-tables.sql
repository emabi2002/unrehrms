-- ============================================
-- VERIFY TABLES AND ADD MISSING ONES
-- ============================================

-- First, let's see what tables we have
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- ADD ANY MISSING TABLES
-- ============================================

-- Approval workflow rules table
CREATE TABLE IF NOT EXISTS approval_workflow_rules (
  id BIGSERIAL PRIMARY KEY,
  workflow_id BIGINT REFERENCES approval_workflows(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL,
  condition_value TEXT,
  next_approver_role TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email notification queue
CREATE TABLE IF NOT EXISTS email_notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id BIGINT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budget allocation history
CREATE TABLE IF NOT EXISTS budget_allocation_history (
  id BIGSERIAL PRIMARY KEY,
  budget_line_id BIGINT REFERENCES budget_lines(id) NOT NULL,
  allocation_type TEXT NOT NULL,
  previous_amount NUMERIC(18,2),
  new_amount NUMERIC(18,2) NOT NULL,
  adjusted_by UUID REFERENCES user_profiles(id),
  reason TEXT,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- GE Request status history
CREATE TABLE IF NOT EXISTS ge_request_status_history (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id) ON DELETE CASCADE NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES user_profiles(id),
  comments TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment schedules (for multi-payment requests)
CREATE TABLE IF NOT EXISTS payment_schedules (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id) NOT NULL,
  commitment_id BIGINT REFERENCES commitments(id),
  schedule_number INT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_amount NUMERIC(18,2) NOT NULL,
  paid_amount NUMERIC(18,2) DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  payment_voucher_id BIGINT REFERENCES payment_vouchers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ge_request_id, schedule_number)
);

-- Supplier contracts
CREATE TABLE IF NOT EXISTS supplier_contracts (
  id BIGSERIAL PRIMARY KEY,
  supplier_id BIGINT REFERENCES suppliers(id) NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  contract_value NUMERIC(18,2),
  terms TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User login history
CREATE TABLE IF NOT EXISTS user_login_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  login_time TIMESTAMPTZ DEFAULT NOW(),
  logout_time TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  login_status TEXT DEFAULT 'success'
);

-- System activity log
CREATE TABLE IF NOT EXISTS system_activity_log (
  id BIGSERIAL PRIMARY KEY,
  activity_type TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES user_profiles(id),
  ip_address INET,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Report templates
CREATE TABLE IF NOT EXISTS report_templates (
  id BIGSERIAL PRIMARY KEY,
  template_name TEXT UNIQUE NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  sql_query TEXT,
  parameters JSONB,
  created_by UUID REFERENCES user_profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id BIGSERIAL PRIMARY KEY,
  template_id BIGINT REFERENCES report_templates(id),
  report_name TEXT NOT NULL,
  generated_by UUID REFERENCES user_profiles(id) NOT NULL,
  parameters_used JSONB,
  file_path TEXT,
  file_format TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES FOR NEW TABLES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_email_notifications_user ON email_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_status ON email_notifications(status);
CREATE INDEX IF NOT EXISTS idx_budget_allocation_history_budget_line ON budget_allocation_history(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_ge_status_history_request ON ge_request_status_history(ge_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_request ON payment_schedules(ge_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_schedules_commitment ON payment_schedules(commitment_id);
CREATE INDEX IF NOT EXISTS idx_supplier_contracts_supplier ON supplier_contracts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_user_login_history_user ON user_login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_log_user ON system_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_system_activity_log_type ON system_activity_log(activity_type);

-- ============================================
-- VERIFY FINAL COUNT
-- ============================================

SELECT
  'Total tables created:' AS info,
  COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- List all tables
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE columns.table_name = tables.table_name) AS column_count
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
