-- ============================================
-- UNRE GE REQUEST & BUDGET CONTROL SYSTEM
-- Database Schema - PostgreSQL/Supabase
-- Fixed version with proper table ordering
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: CREATE TABLES (Base tables first)
-- ============================================

-- Roles table (no dependencies)
CREATE TABLE IF NOT EXISTS roles (
  id BIGSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cost centres (self-referencing, but nullable parent)
CREATE TABLE IF NOT EXISTS cost_centres (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_id BIGINT REFERENCES cost_centres(id),
  type TEXT NOT NULL,
  head_user_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (depends on auth.users which exists in Supabase)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  employee_id TEXT UNIQUE,
  phone TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User role assignments
CREATE TABLE IF NOT EXISTS user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  role_id BIGINT REFERENCES roles(id) NOT NULL,
  cost_centre_id BIGINT REFERENCES cost_centres(id),
  approval_limit NUMERIC(18,2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id, cost_centre_id)
);

-- Budget lines
CREATE TABLE IF NOT EXISTS budget_lines (
  id BIGSERIAL PRIMARY KEY,
  cost_centre_id BIGINT REFERENCES cost_centres(id) NOT NULL,
  budget_year INT NOT NULL,
  pgas_vote_code TEXT NOT NULL,
  pgas_sub_item TEXT,
  aap_code TEXT,
  description TEXT NOT NULL,
  category TEXT,
  original_amount NUMERIC(18,2) DEFAULT 0,
  ytd_expenditure NUMERIC(18,2) DEFAULT 0,
  committed_amount NUMERIC(18,2) DEFAULT 0,
  available_amount NUMERIC(18,2) GENERATED ALWAYS AS (original_amount - ytd_expenditure - committed_amount) STORED,
  last_pgas_sync TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cost_centre_id, budget_year, pgas_vote_code, pgas_sub_item)
);

-- Budget adjustments
CREATE TABLE IF NOT EXISTS budget_adjustments (
  id BIGSERIAL PRIMARY KEY,
  budget_line_id BIGINT REFERENCES budget_lines(id) NOT NULL,
  adjustment_type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  from_budget_line_id BIGINT REFERENCES budget_lines(id),
  reason TEXT NOT NULL,
  approved_by UUID REFERENCES user_profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense types
CREATE TABLE IF NOT EXISTS expense_types (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_po BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_account TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GE Request statuses (enum type)
DO $$ BEGIN
  CREATE TYPE ge_status AS ENUM (
    'draft',
    'submitted',
    'pending_hod',
    'pending_dean',
    'pending_bursar',
    'pending_registrar',
    'pending_vc',
    'approved',
    'committed',
    'partial_paid',
    'paid',
    'rejected',
    'returned',
    'cancelled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- GE Requests
CREATE TABLE IF NOT EXISTS ge_requests (
  id BIGSERIAL PRIMARY KEY,
  request_number TEXT UNIQUE NOT NULL,
  requester_id UUID REFERENCES user_profiles(id) NOT NULL,
  cost_centre_id BIGINT REFERENCES cost_centres(id) NOT NULL,
  budget_line_id BIGINT REFERENCES budget_lines(id) NOT NULL,
  expense_type_id BIGINT REFERENCES expense_types(id) NOT NULL,
  supplier_id BIGINT REFERENCES suppliers(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT NOT NULL,
  required_date DATE,
  total_amount NUMERIC(18,2) NOT NULL,
  status ge_status DEFAULT 'draft',
  current_approver_role TEXT,
  priority TEXT DEFAULT 'Normal',
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  committed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (total_amount > 0)
);

-- GE Request line items
CREATE TABLE IF NOT EXISTS ge_request_items (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id) ON DELETE CASCADE NOT NULL,
  item_number INT NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(18,3) DEFAULT 1,
  unit_price NUMERIC(18,2) NOT NULL,
  total_amount NUMERIC(18,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(ge_request_id, item_number)
);

-- Approval actions (enum type)
DO $$ BEGIN
  CREATE TYPE approval_action AS ENUM ('approved', 'rejected', 'returned', 'forwarded');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Approval trail
CREATE TABLE IF NOT EXISTS ge_approvals (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES user_profiles(id) NOT NULL,
  role_name TEXT NOT NULL,
  approval_level INT NOT NULL,
  action approval_action NOT NULL,
  comments TEXT,
  acted_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Approval workflow configuration
CREATE TABLE IF NOT EXISTS approval_workflows (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  min_amount NUMERIC(18,2) NOT NULL,
  max_amount NUMERIC(18,2),
  expense_type_id BIGINT REFERENCES expense_types(id),
  cost_centre_type TEXT,
  approval_sequence JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Commitments
CREATE TABLE IF NOT EXISTS commitments (
  id BIGSERIAL PRIMARY KEY,
  ge_request_id BIGINT REFERENCES ge_requests(id) UNIQUE NOT NULL,
  commitment_number TEXT UNIQUE NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  budget_line_id BIGINT REFERENCES budget_lines(id) NOT NULL,
  cost_centre_id BIGINT REFERENCES cost_centres(id) NOT NULL,
  financial_year INT NOT NULL,
  status TEXT DEFAULT 'Open',
  remaining_amount NUMERIC(18,2),
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id BIGSERIAL PRIMARY KEY,
  po_number TEXT UNIQUE NOT NULL,
  ge_request_id BIGINT REFERENCES ge_requests(id) NOT NULL,
  supplier_id BIGINT REFERENCES suppliers(id) NOT NULL,
  po_date DATE NOT NULL,
  delivery_date DATE,
  total_amount NUMERIC(18,2) NOT NULL,
  terms_and_conditions TEXT,
  status TEXT DEFAULT 'Issued',
  created_by UUID REFERENCES user_profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goods Received Notes
CREATE TABLE IF NOT EXISTS goods_received_notes (
  id BIGSERIAL PRIMARY KEY,
  grn_number TEXT UNIQUE NOT NULL,
  po_id BIGINT REFERENCES purchase_orders(id),
  ge_request_id BIGINT REFERENCES ge_requests(id) NOT NULL,
  received_date DATE NOT NULL,
  received_by UUID REFERENCES user_profiles(id) NOT NULL,
  condition_notes TEXT,
  is_complete BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment vouchers
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id BIGSERIAL PRIMARY KEY,
  voucher_number TEXT UNIQUE NOT NULL,
  ge_request_id BIGINT REFERENCES ge_requests(id) NOT NULL,
  commitment_id BIGINT REFERENCES commitments(id),
  payee_name TEXT NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  cheque_number TEXT,
  bank_reference TEXT,
  amount NUMERIC(18,2) NOT NULL,
  description TEXT,
  approved_by UUID REFERENCES user_profiles(id),
  processed_by UUID REFERENCES user_profiles(id),
  status TEXT DEFAULT 'Pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments
CREATE TABLE IF NOT EXISTS attachments (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  document_type TEXT,
  uploaded_by UUID REFERENCES user_profiles(id) NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  entity_type TEXT,
  entity_id BIGINT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id BIGINT,
  user_id UUID REFERENCES user_profiles(id),
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System configuration
CREATE TABLE IF NOT EXISTS system_config (
  id BIGSERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard metrics cache
CREATE TABLE IF NOT EXISTS dashboard_metrics (
  id BIGSERIAL PRIMARY KEY,
  metric_type TEXT NOT NULL,
  cost_centre_id BIGINT REFERENCES cost_centres(id),
  user_id UUID REFERENCES user_profiles(id),
  period TEXT NOT NULL,
  metric_date DATE NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(metric_type, cost_centre_id, period, metric_date)
);

-- ============================================
-- STEP 2: INSERT DEFAULT DATA
-- ============================================

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('System Admin', 'Full system access'),
  ('Requestor', 'Can create GE requests'),
  ('HOD', 'Head of Department - First level approval'),
  ('Dean', 'Dean/Director - Second level approval'),
  ('Bursar', 'Finance Manager - Budget approval'),
  ('Registrar', 'Registrar - Final approval for large amounts'),
  ('VC', 'Vice Chancellor - Strategic approvals'),
  ('Bursary Clerk', 'Payments processing'),
  ('Budget Officer', 'Budget management and planning'),
  ('Auditor', 'Read-only audit access')
ON CONFLICT (name) DO NOTHING;

-- Insert default expense types
INSERT INTO expense_types (code, name, description, requires_po) VALUES
  ('TRAV', 'Travel & Accommodation', 'Domestic and international travel', FALSE),
  ('FUEL', 'Fuel & Vehicle Maintenance', 'Fuel, repairs, maintenance', FALSE),
  ('STAT', 'Stationery & Supplies', 'Office supplies and stationery', TRUE),
  ('MAINT', 'Maintenance & Repairs', 'Building and equipment maintenance', TRUE),
  ('PROF', 'Professional Services', 'Consultancy, legal, audit services', TRUE),
  ('UTIL', 'Utilities', 'Electricity, water, internet', FALSE),
  ('EQUIP', 'Equipment', 'Furniture and equipment purchases', TRUE),
  ('CAPEX', 'Capital Expenditure', 'Major capital investments', TRUE),
  ('TRAIN', 'Training & Development', 'Staff training and workshops', FALSE),
  ('OTHER', 'Other Expenses', 'Miscellaneous expenses', FALSE)
ON CONFLICT (code) DO NOTHING;

-- Insert default workflows
INSERT INTO approval_workflows (name, min_amount, max_amount, approval_sequence) VALUES
  ('Small Amount', 0, 5000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Bursar"}
  ]'::JSONB),
  ('Medium Amount', 5001, 20000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"}
  ]'::JSONB),
  ('Large Amount', 20001, 100000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"},
    {"level": 4, "role": "Registrar"}
  ]'::JSONB),
  ('Capital/Strategic', 100001, NULL, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"},
    {"level": 4, "role": "Registrar"},
    {"level": 5, "role": "VC"}
  ]'::JSONB)
ON CONFLICT DO NOTHING;

-- Insert default system config
INSERT INTO system_config (key, value, description) VALUES
  ('current_financial_year', '2025', 'Current financial year'),
  ('default_currency', '"PGK"', 'Default currency code'),
  ('auto_ge_number_prefix', '"GE"', 'Prefix for GE request numbers'),
  ('email_notifications_enabled', 'true', 'Enable email notifications'),
  ('approval_reminder_days', '3', 'Days before sending approval reminder')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- STEP 3: CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_ge_requests_requester ON ge_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_ge_requests_cost_centre ON ge_requests(cost_centre_id);
CREATE INDEX IF NOT EXISTS idx_ge_requests_status ON ge_requests(status);
CREATE INDEX IF NOT EXISTS idx_ge_requests_created_at ON ge_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ge_approvals_approver ON ge_approvals(approver_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_cost_centre ON budget_lines(cost_centre_id);
CREATE INDEX IF NOT EXISTS idx_budget_lines_year ON budget_lines(budget_year);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- ============================================
-- STEP 4: CREATE FUNCTIONS
-- ============================================

-- Function to generate next GE request number
CREATE OR REPLACE FUNCTION generate_ge_request_number()
RETURNS TEXT AS $$
DECLARE
  next_num INT;
  current_year TEXT;
  prefix TEXT;
BEGIN
  SELECT value::TEXT FROM system_config WHERE key = 'auto_ge_number_prefix' INTO prefix;
  SELECT EXTRACT(YEAR FROM NOW())::TEXT INTO current_year;

  SELECT COALESCE(MAX(SUBSTRING(request_number FROM '\d+$')::INT), 0) + 1
  INTO next_num
  FROM ge_requests
  WHERE request_number LIKE prefix || '-' || current_year || '-%';

  RETURN prefix || '-' || current_year || '-' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update budget line committed amount
CREATE OR REPLACE FUNCTION update_budget_committed_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE budget_lines
    SET committed_amount = committed_amount + NEW.amount
    WHERE id = NEW.budget_line_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE budget_lines
    SET committed_amount = committed_amount - OLD.amount + NEW.amount
    WHERE id = NEW.budget_line_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE budget_lines
    SET committed_amount = committed_amount - OLD.amount
    WHERE id = OLD.budget_line_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 5: CREATE TRIGGERS
-- ============================================

-- Trigger to update budget committed amount
DROP TRIGGER IF EXISTS trigger_update_budget_committed ON commitments;
CREATE TRIGGER trigger_update_budget_committed
AFTER INSERT OR UPDATE OR DELETE ON commitments
FOR EACH ROW EXECUTE FUNCTION update_budget_committed_amount();

-- ============================================
-- COMPLETE!
-- ============================================

-- Verify tables created
SELECT 'Database schema created successfully!' AS status;
SELECT COUNT(*) AS table_count FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
