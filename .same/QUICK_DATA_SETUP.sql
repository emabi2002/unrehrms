-- ============================================
-- UNRE Quick Data Setup Script
-- Run this after creating the database schema
-- ============================================

-- Step 1: Insert Roles
INSERT INTO roles (name, description) VALUES
('Requestor', 'Can submit GE requests'),
('HOD', 'Head of Department - First level approver'),
('Dean', 'Dean - Second level approver'),
('Bursar', 'Bursar - Financial approver'),
('Registrar', 'Registrar - Administrative approver'),
('Vice Chancellor', 'Vice Chancellor - Final approver for large amounts'),
('Bursary Clerk', 'Can process payments'),
('Budget Officer', 'Manages budget and PGAS sync'),
('Auditor', 'Read-only access for audits'),
('ProVC - Planning & Development', 'ProVC - Approves requests ≤K5000')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Insert Cost Centres
INSERT INTO cost_centres (code, name, type, parent_id, is_active) VALUES
('UNRE', 'UNRE Head Office', 'University', NULL, true),
('SOA', 'School of Agriculture', 'School', 1, true),
('SCI', 'Faculty of Science', 'Faculty', 1, true),
('SNR', 'School of Natural Resources', 'School', 1, true),
('ADMIN', 'Administration', 'Division', 1, true),
('ICT', 'ICT Department', 'Department', 5, true),
('FIN', 'Finance Department', 'Department', 5, true),
('LIB', 'Library Services', 'Division', 1, true)
ON CONFLICT (code) DO NOTHING;

-- Step 3: Insert Expense Types
INSERT INTO expense_types (code, name, description, is_active) VALUES
('TRAV', 'Travel & Accommodation', 'Travel expenses and accommodation', true),
('FUEL', 'Fuel & Vehicle', 'Fuel and vehicle maintenance', true),
('STAT', 'Stationery & Supplies', 'Office supplies and stationery', true),
('MAINT', 'Maintenance & Repairs', 'Equipment and facility maintenance', true),
('PROF', 'Professional Services', 'Consulting and professional services', true),
('EQUIP', 'Equipment', 'Equipment purchases', true),
('IT', 'IT Equipment & Services', 'IT equipment and software', true),
('UTIL', 'Utilities', 'Water, electricity, internet', true)
ON CONFLICT (code) DO NOTHING;

-- Step 4: Insert Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, bank_name, bank_account, is_active)
SELECT * FROM (VALUES
  ('Brian Bell Ltd', 'John Smith', 'john@brianbell.com.pg', '325-1234', 'BSP', '1234567890', true),
  ('Stop & Shop', 'Mary Jones', 'mary@stopshop.com.pg', '325-2345', 'Westpac', '0987654321', true),
  ('PNG Office Supplies Ltd', 'Peter Kila', 'peter@pngoffice.com.pg', '325-3456', 'ANZ', '1122334455', true),
  ('Ela Motors', 'Sarah Wani', 'sarah@elamotors.com.pg', '325-4567', 'BSP', '5566778899', true),
  ('ICT Solutions PNG', 'David Tau', 'david@ictsolutions.com.pg', '325-5678', 'Westpac', '9988776655', true)
) AS v(name, contact_person, email, phone, bank_name, bank_account, is_active)
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE suppliers.name = v.name);

-- Step 5: Insert Budget Lines for 2025
INSERT INTO budget_lines (
  cost_centre_id,
  budget_year,
  pgas_vote_code,
  pgas_sub_item,
  description,
  category,
  original_amount,
  ytd_expenditure,
  committed_amount,
  available_amount,
  is_active
) VALUES
-- ICT Department budgets
(6, 2025, '2210', '001', 'Capital - IT Equipment', 'Capital', 500000, 0, 0, 500000, true),
(6, 2025, '2110', '001', 'Operating - Stationery', 'Operating', 50000, 0, 0, 50000, true),
(6, 2025, '2110', '002', 'Operating - Maintenance', 'Operating', 100000, 0, 0, 100000, true),

-- Administration budgets
(5, 2025, '2110', '010', 'Operating - Travel', 'Operating', 150000, 0, 0, 150000, true),
(5, 2025, '2110', '011', 'Operating - Fuel', 'Operating', 80000, 0, 0, 80000, true),
(5, 2025, '2210', '005', 'Capital - Furniture', 'Capital', 200000, 0, 0, 200000, true),

-- School of Agriculture budgets
(2, 2025, '2110', '020', 'Operating - Field Supplies', 'Operating', 120000, 0, 0, 120000, true),
(2, 2025, '2210', '010', 'Capital - Farm Equipment', 'Capital', 300000, 0, 0, 300000, true)
ON CONFLICT DO NOTHING;

-- Step 6: Insert Approval Workflows
INSERT INTO approval_workflows (
  expense_type_id,
  min_amount,
  max_amount,
  approval_sequence,
  is_active
) VALUES
-- Small amounts (≤K5,000) - Manager → ProVC
(1, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(2, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(3, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(4, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(5, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(6, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(7, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),
(8, 0, 5000, ARRAY['HOD', 'ProVC - Planning & Development']::text[], true),

-- Large amounts (>K5,000) - Manager → VC
(1, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(2, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(3, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(4, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(5, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(6, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(7, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true),
(8, 5001, 999999999, ARRAY['HOD', 'Vice Chancellor']::text[], true);

-- Success message
SELECT 'Initial data setup complete! ✅' as message;
SELECT 'Next: Create your user profile and assign roles' as next_step;
