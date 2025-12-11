-- ============================================
-- UNRE GE REQUEST & BUDGET CONTROL SYSTEM
-- Database Schema - PostgreSQL/Supabase
-- ============================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. USERS & ROLES
-- ============================================

-- Roles table
create table roles (
  id bigserial primary key,
  name text unique not null,
  description text,
  created_at timestamptz default now()
);

-- Insert default roles
insert into roles (name, description) values
  ('System Admin', 'Full system access'),
  ('Requestor', 'Can create GE requests'),
  ('HOD', 'Head of Department - First level approval'),
  ('Dean', 'Dean/Director - Second level approval'),
  ('Bursar', 'Finance Manager - Budget approval'),
  ('Registrar', 'Registrar - Final approval for large amounts'),
  ('VC', 'Vice Chancellor - Strategic approvals'),
  ('Bursary Clerk', 'Payments processing'),
  ('Budget Officer', 'Budget management and planning'),
  ('Auditor', 'Read-only audit access');

-- User profiles (extends Supabase auth.users)
create table user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text not null,
  employee_id text unique,
  phone text,
  department text,
  position text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User role assignments
create table user_roles (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade not null,
  role_id bigint references roles(id) not null,
  cost_centre_id bigint references cost_centres(id),
  approval_limit numeric(18,2), -- Maximum amount user can approve
  is_active boolean default true,
  created_at timestamptz default now(),
  unique(user_id, role_id, cost_centre_id)
);

-- ============================================
-- 2. ORGANIZATIONAL STRUCTURE
-- ============================================

-- Cost centres (Schools, Faculties, Divisions, Projects)
create table cost_centres (
  id bigserial primary key,
  code text not null unique,
  name text not null,
  parent_id bigint references cost_centres(id),
  type text not null, -- 'Faculty', 'School', 'Division', 'Project', 'Unit'
  head_user_id uuid references user_profiles(id), -- HOD/Dean/Director
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- 3. BUDGET & PGAS INTEGRATION
-- ============================================

-- AAP Budget lines (linked to PGAS)
create table budget_lines (
  id bigserial primary key,
  cost_centre_id bigint references cost_centres(id) not null,
  budget_year int not null,
  pgas_vote_code text not null,
  pgas_sub_item text,
  aap_code text,
  description text not null,
  category text, -- 'Personnel', 'Operating', 'Capital', 'Projects'
  original_amount numeric(18,2) default 0,
  ytd_expenditure numeric(18,2) default 0, -- From PGAS sync
  committed_amount numeric(18,2) default 0, -- From GE requests
  available_amount numeric(18,2) generated always as (original_amount - ytd_expenditure - committed_amount) stored,
  last_pgas_sync timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(cost_centre_id, budget_year, pgas_vote_code, pgas_sub_item)
);

-- Budget adjustments/virements
create table budget_adjustments (
  id bigserial primary key,
  budget_line_id bigint references budget_lines(id) not null,
  adjustment_type text not null, -- 'Increase', 'Decrease', 'Virement'
  amount numeric(18,2) not null,
  from_budget_line_id bigint references budget_lines(id), -- For virements
  reason text not null,
  approved_by uuid references user_profiles(id),
  approved_at timestamptz,
  created_by uuid references user_profiles(id) not null,
  created_at timestamptz default now()
);

-- ============================================
-- 4. GE REQUESTS
-- ============================================

-- GE Request statuses
create type ge_status as enum (
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

-- Expense types
create table expense_types (
  id bigserial primary key,
  code text unique not null,
  name text not null,
  description text,
  requires_po boolean default false,
  is_active boolean default true
);

-- Insert default expense types
insert into expense_types (code, name, description, requires_po) values
  ('TRAV', 'Travel & Accommodation', 'Domestic and international travel', false),
  ('FUEL', 'Fuel & Vehicle Maintenance', 'Fuel, repairs, maintenance', false),
  ('STAT', 'Stationery & Supplies', 'Office supplies and stationery', true),
  ('MAINT', 'Maintenance & Repairs', 'Building and equipment maintenance', true),
  ('PROF', 'Professional Services', 'Consultancy, legal, audit services', true),
  ('UTIL', 'Utilities', 'Electricity, water, internet', false),
  ('EQUIP', 'Equipment', 'Furniture and equipment purchases', true),
  ('CAPEX', 'Capital Expenditure', 'Major capital investments', true),
  ('TRAIN', 'Training & Development', 'Staff training and workshops', false),
  ('OTHER', 'Other Expenses', 'Miscellaneous expenses', false);

-- Suppliers
create table suppliers (
  id bigserial primary key,
  name text not null,
  contact_person text,
  phone text,
  email text,
  address text,
  tax_id text,
  bank_name text,
  bank_account text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- GE Requests main table
create table ge_requests (
  id bigserial primary key,
  request_number text unique not null,
  requester_id uuid references user_profiles(id) not null,
  cost_centre_id bigint references cost_centres(id) not null,
  budget_line_id bigint references budget_lines(id) not null,
  expense_type_id bigint references expense_types(id) not null,
  supplier_id bigint references suppliers(id),

  title text not null,
  description text not null,
  justification text not null,
  required_date date,

  total_amount numeric(18,2) not null,
  status ge_status default 'draft',

  current_approver_role text, -- Current approval stage
  priority text default 'Normal', -- 'Urgent', 'Normal', 'Low'

  -- Metadata
  submitted_at timestamptz,
  approved_at timestamptz,
  committed_at timestamptz,
  paid_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Constraints
  constraint positive_amount check (total_amount > 0)
);

-- GE Request line items
create table ge_request_items (
  id bigserial primary key,
  ge_request_id bigint references ge_requests(id) on delete cascade not null,
  item_number int not null,
  description text not null,
  quantity numeric(18,3) default 1,
  unit_price numeric(18,2) not null,
  total_amount numeric(18,2) generated always as (quantity * unit_price) stored,
  notes text,
  created_at timestamptz default now(),
  unique(ge_request_id, item_number)
);

-- ============================================
-- 5. APPROVALS WORKFLOW
-- ============================================

-- Approval actions
create type approval_action as enum ('approved', 'rejected', 'returned', 'forwarded');

-- Approval trail
create table ge_approvals (
  id bigserial primary key,
  ge_request_id bigint references ge_requests(id) on delete cascade not null,
  approver_id uuid references user_profiles(id) not null,
  role_name text not null, -- Role at time of approval
  approval_level int not null, -- 1=HOD, 2=Dean, 3=Bursar, 4=Registrar, 5=VC
  action approval_action not null,
  comments text,
  acted_at timestamptz default now(),
  ip_address inet,
  user_agent text
);

-- Approval workflow configuration
create table approval_workflows (
  id bigserial primary key,
  name text not null,
  min_amount numeric(18,2) not null,
  max_amount numeric(18,2),
  expense_type_id bigint references expense_types(id),
  cost_centre_type text,
  approval_sequence jsonb not null, -- [{level: 1, role: 'HOD'}, {level: 2, role: 'Dean'}, ...]
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Insert default workflows
insert into approval_workflows (name, min_amount, max_amount, approval_sequence) values
  ('Small Amount', 0, 5000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Bursar"}
  ]'::jsonb),
  ('Medium Amount', 5001, 20000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"}
  ]'::jsonb),
  ('Large Amount', 20001, 100000, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"},
    {"level": 4, "role": "Registrar"}
  ]'::jsonb),
  ('Capital/Strategic', 100001, null, '[
    {"level": 1, "role": "HOD"},
    {"level": 2, "role": "Dean"},
    {"level": 3, "role": "Bursar"},
    {"level": 4, "role": "Registrar"},
    {"level": 5, "role": "VC"}
  ]'::jsonb);

-- ============================================
-- 6. COMMITMENTS & PAYMENTS
-- ============================================

-- Commitments (after approval)
create table commitments (
  id bigserial primary key,
  ge_request_id bigint references ge_requests(id) unique not null,
  commitment_number text unique not null,
  amount numeric(18,2) not null,
  budget_line_id bigint references budget_lines(id) not null,
  cost_centre_id bigint references cost_centres(id) not null,
  financial_year int not null,
  status text default 'Open', -- 'Open', 'Partial', 'Closed'
  remaining_amount numeric(18,2),
  created_by uuid references user_profiles(id) not null,
  created_at timestamptz default now()
);

-- Purchase Orders (optional)
create table purchase_orders (
  id bigserial primary key,
  po_number text unique not null,
  ge_request_id bigint references ge_requests(id) not null,
  supplier_id bigint references suppliers(id) not null,
  po_date date not null,
  delivery_date date,
  total_amount numeric(18,2) not null,
  terms_and_conditions text,
  status text default 'Issued', -- 'Issued', 'Received', 'Cancelled'
  created_by uuid references user_profiles(id) not null,
  created_at timestamptz default now()
);

-- Goods Received Notes
create table goods_received_notes (
  id bigserial primary key,
  grn_number text unique not null,
  po_id bigint references purchase_orders(id),
  ge_request_id bigint references ge_requests(id) not null,
  received_date date not null,
  received_by uuid references user_profiles(id) not null,
  condition_notes text,
  is_complete boolean default true,
  created_at timestamptz default now()
);

-- Payment vouchers
create table payment_vouchers (
  id bigserial primary key,
  voucher_number text unique not null,
  ge_request_id bigint references ge_requests(id) not null,
  commitment_id bigint references commitments(id),
  payee_name text not null,
  payment_date date not null,
  payment_method text not null, -- 'EFT', 'Cheque', 'Cash'
  bank_name text,
  account_number text,
  cheque_number text,
  bank_reference text,
  amount numeric(18,2) not null,
  description text,
  approved_by uuid references user_profiles(id),
  processed_by uuid references user_profiles(id),
  status text default 'Pending', -- 'Pending', 'Approved', 'Paid', 'Cancelled'
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- 7. DOCUMENT MANAGEMENT
-- ============================================

-- Attachments
create table attachments (
  id bigserial primary key,
  entity_type text not null, -- 'GERequest', 'Approval', 'Payment', 'GRN'
  entity_id bigint not null,
  file_name text not null,
  file_path text not null, -- Supabase storage path
  file_type text,
  file_size bigint,
  document_type text, -- 'Invoice', 'Quote', 'GRN', 'Memo', 'Receipt', 'Other'
  uploaded_by uuid references user_profiles(id) not null,
  uploaded_at timestamptz default now()
);

-- ============================================
-- 8. NOTIFICATIONS
-- ============================================

create table notifications (
  id bigserial primary key,
  user_id uuid references user_profiles(id) on delete cascade not null,
  title text not null,
  message text not null,
  type text not null, -- 'Info', 'Action Required', 'Approval', 'Rejection', 'System'
  entity_type text, -- 'GERequest', 'Payment', etc.
  entity_id bigint,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- 9. AUDIT & COMPLIANCE
-- ============================================

-- Comprehensive audit log
create table audit_logs (
  id bigserial primary key,
  entity_type text not null,
  entity_id bigint,
  user_id uuid references user_profiles(id),
  action text not null, -- 'CREATE', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'LOGIN', etc.
  old_data jsonb,
  new_data jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz default now()
);

-- System configuration
create table system_config (
  id bigserial primary key,
  key text unique not null,
  value jsonb not null,
  description text,
  updated_by uuid references user_profiles(id),
  updated_at timestamptz default now()
);

-- Insert default system config
insert into system_config (key, value, description) values
  ('current_financial_year', '2025', 'Current financial year'),
  ('default_currency', '"PGK"', 'Default currency code'),
  ('auto_ge_number_prefix', '"GE"', 'Prefix for GE request numbers'),
  ('email_notifications_enabled', 'true', 'Enable email notifications'),
  ('approval_reminder_days', '3', 'Days before sending approval reminder');

-- ============================================
-- 10. REPORTING & ANALYTICS
-- ============================================

-- Dashboard metrics cache
create table dashboard_metrics (
  id bigserial primary key,
  metric_type text not null,
  cost_centre_id bigint references cost_centres(id),
  user_id uuid references user_profiles(id),
  period text not null, -- 'daily', 'weekly', 'monthly', 'yearly'
  metric_date date not null,
  data jsonb not null,
  created_at timestamptz default now(),
  unique(metric_type, cost_centre_id, period, metric_date)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

create index idx_ge_requests_requester on ge_requests(requester_id);
create index idx_ge_requests_cost_centre on ge_requests(cost_centre_id);
create index idx_ge_requests_status on ge_requests(status);
create index idx_ge_requests_created_at on ge_requests(created_at);
create index idx_ge_approvals_approver on ge_approvals(approver_id);
create index idx_budget_lines_cost_centre on budget_lines(cost_centre_id);
create index idx_budget_lines_year on budget_lines(budget_year);
create index idx_notifications_user on notifications(user_id, is_read);
create index idx_audit_logs_entity on audit_logs(entity_type, entity_id);
create index idx_audit_logs_user on audit_logs(user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate next GE request number
create or replace function generate_ge_request_number()
returns text as $$
declare
  next_num int;
  current_year text;
  prefix text;
begin
  select value::text from system_config where key = 'auto_ge_number_prefix' into prefix;
  select extract(year from now())::text into current_year;

  select coalesce(max(substring(request_number from '\d+$')::int), 0) + 1
  into next_num
  from ge_requests
  where request_number like prefix || '-' || current_year || '-%';

  return prefix || '-' || current_year || '-' || lpad(next_num::text, 6, '0');
end;
$$ language plpgsql;

-- Function to update budget line committed amount
create or replace function update_budget_committed_amount()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update budget_lines
    set committed_amount = committed_amount + new.amount
    where id = new.budget_line_id;
  elsif TG_OP = 'UPDATE' then
    update budget_lines
    set committed_amount = committed_amount - old.amount + new.amount
    where id = new.budget_line_id;
  elsif TG_OP = 'DELETE' then
    update budget_lines
    set committed_amount = committed_amount - old.amount
    where id = old.budget_line_id;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trigger_update_budget_committed
after insert or update or delete on commitments
for each row execute function update_budget_committed_amount();

-- Function to log changes
create or replace function audit_log_changes()
returns trigger as $$
begin
  insert into audit_logs (entity_type, entity_id, user_id, action, old_data, new_data)
  values (
    TG_TABLE_NAME,
    coalesce(new.id, old.id),
    coalesce(new.created_by, new.requester_id, auth.uid()),
    TG_OP,
    case when TG_OP = 'DELETE' then row_to_json(old) else null end,
    case when TG_OP in ('INSERT', 'UPDATE') then row_to_json(new) else null end
  );
  return new;
end;
$$ language plpgsql security definer;

-- Apply audit trigger to key tables
create trigger audit_ge_requests after insert or update or delete on ge_requests
  for each row execute function audit_log_changes();
create trigger audit_approvals after insert on ge_approvals
  for each row execute function audit_log_changes();
create trigger audit_commitments after insert or update on commitments
  for each row execute function audit_log_changes();
create trigger audit_payments after insert or update on payment_vouchers
  for each row execute function audit_log_changes();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table ge_requests enable row level security;
alter table ge_approvals enable row level security;
alter table commitments enable row level security;
alter table payment_vouchers enable row level security;
alter table notifications enable row level security;

-- Users can read their own profile
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

-- Users can read GE requests they created or need to approve
create policy "Users can view relevant GE requests"
  on ge_requests for select
  using (
    auth.uid() = requester_id
    or exists (
      select 1 from user_roles ur
      join roles r on ur.role_id = r.id
      where ur.user_id = auth.uid()
      and r.name in ('System Admin', 'Auditor', 'HOD', 'Dean', 'Bursar', 'Registrar', 'VC')
    )
  );

-- Users can insert their own GE requests
create policy "Users can create GE requests"
  on ge_requests for insert
  with check (auth.uid() = requester_id);

-- Notifications policy
create policy "Users can view own notifications"
  on notifications for select
  using (auth.uid() = user_id);

-- More policies can be added based on specific requirements

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- Budget summary view
create or replace view v_budget_summary as
select
  bl.id,
  bl.budget_year,
  cc.code as cost_centre_code,
  cc.name as cost_centre_name,
  bl.pgas_vote_code,
  bl.description,
  bl.original_amount,
  bl.ytd_expenditure,
  bl.committed_amount,
  bl.available_amount,
  round((bl.ytd_expenditure + bl.committed_amount) / nullif(bl.original_amount, 0) * 100, 2) as utilization_percentage
from budget_lines bl
join cost_centres cc on bl.cost_centre_id = cc.id
where bl.is_active = true;

-- GE Request summary view
create or replace view v_ge_request_summary as
select
  gr.id,
  gr.request_number,
  gr.title,
  gr.total_amount,
  gr.status,
  gr.created_at,
  up.full_name as requester_name,
  cc.name as cost_centre_name,
  bl.description as budget_line,
  et.name as expense_type,
  s.name as supplier_name
from ge_requests gr
join user_profiles up on gr.requester_id = up.id
join cost_centres cc on gr.cost_centre_id = cc.id
join budget_lines bl on gr.budget_line_id = bl.id
join expense_types et on gr.expense_type_id = et.id
left join suppliers s on gr.supplier_id = s.id;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- This section would be populated with sample cost centres,
-- budget lines, and test users for development/testing
