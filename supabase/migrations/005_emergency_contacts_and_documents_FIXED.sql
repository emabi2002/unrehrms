-- =====================================================
-- Migration 005: Emergency Contacts & Document Management (FIXED)
-- Created: December 10, 2025
-- Fixed: Removed CONSTRAINT with WHERE clause, using partial index instead
-- =====================================================

-- =====================================================
-- 1. EMERGENCY CONTACTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,

  -- Contact Details
  full_name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  mobile TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,

  -- Priority
  priority INTEGER DEFAULT 1,
  is_primary BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee ON emergency_contacts(employee_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts(is_primary) WHERE is_primary = true;

-- Create unique partial index to ensure only one primary contact per employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_primary_contact ON emergency_contacts(employee_id) WHERE is_primary = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. DOCUMENT TYPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,

  is_mandatory BOOLEAN DEFAULT false,
  requires_expiry BOOLEAN DEFAULT false,
  default_access_level TEXT DEFAULT 'employee_visible',

  category TEXT,
  display_order INTEGER DEFAULT 0,

  is_active BOOLEAN DEFAULT true
);

-- Insert default document types
INSERT INTO document_types (code, name, description, is_mandatory, requires_expiry, category, display_order) VALUES
('employment_contract', 'Employment Contract', 'Official employment contract', true, false, 'Employment', 1),
('offer_letter', 'Offer Letter', 'Job offer letter', true, false, 'Employment', 2),
('national_id', 'National ID', 'PNG National ID card', true, true, 'Identification', 3),
('passport', 'Passport', 'International passport', false, true, 'Identification', 4),
('drivers_license', 'Driver''s License', 'Driving license', false, true, 'Identification', 5),
('degree_certificate', 'Degree Certificate', 'Academic degree certificate', false, false, 'Education', 6),
('professional_cert', 'Professional Certificate', 'Professional certification', false, true, 'Education', 7),
('medical_clearance', 'Medical Clearance', 'Medical fitness certificate', true, true, 'Health', 8),
('police_clearance', 'Police Clearance', 'Police clearance certificate', true, true, 'Clearance', 9),
('tax_clearance', 'Tax Clearance', 'Tax clearance certificate', false, true, 'Compliance', 10),
('bank_details', 'Bank Details', 'Bank account information', true, false, 'Financial', 11),
('nda', 'Non-Disclosure Agreement', 'NDA signed document', false, false, 'Legal', 12),
('code_of_conduct', 'Code of Conduct', 'Code of conduct acknowledgement', true, false, 'Policy', 13),
('reference_letter', 'Reference Letter', 'Employment reference letter', false, false, 'Reference', 14),
('training_cert', 'Training Certificate', 'Training completion certificate', false, true, 'Training', 15),
('work_permit', 'Visa/Work Permit', 'Work authorization document', false, true, 'Immigration', 16),
('resignation_letter', 'Resignation Letter', 'Formal resignation letter', false, false, 'Exit', 17),
('other', 'Other Document', 'Other miscellaneous document', false, false, 'Other', 18)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. EMPLOYEE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,

  -- Document Details
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,

  -- Document Information
  uploaded_by UUID REFERENCES employees(id),
  issue_date DATE,
  expiry_date DATE,
  document_number TEXT,
  issuing_authority TEXT,

  -- Security & Access
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'employee_visible',
  status TEXT DEFAULT 'active',

  -- Version Control
  version INTEGER DEFAULT 1,
  replaced_by_document_id UUID REFERENCES employee_documents(id),
  replaces_document_id UUID REFERENCES employee_documents(id),

  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON employee_documents(status);
CREATE INDEX IF NOT EXISTS idx_employee_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- Add updated_at trigger
CREATE TRIGGER update_employee_documents_updated_at
BEFORE UPDATE ON employee_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. ENHANCE EMPLOYEES TABLE
-- =====================================================

-- Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS drivers_license TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified_date DATE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_employees_national_id ON employees(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_passport ON employees(passport_number) WHERE passport_number IS NOT NULL;

-- =====================================================
-- 5. UTILITY FUNCTIONS
-- =====================================================

-- Function to get documents expiring soon
CREATE OR REPLACE FUNCTION get_expiring_documents(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  employee_id UUID,
  employee_name TEXT,
  document_type TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.id,
    ed.employee_id,
    (e.first_name || ' ' || e.last_name) as employee_name,
    ed.document_type,
    ed.document_name,
    ed.expiry_date,
    (ed.expiry_date - CURRENT_DATE) as days_until_expiry
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.status = 'active'
    AND ed.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + days_ahead)
  ORDER BY ed.expiry_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get expired documents
CREATE OR REPLACE FUNCTION get_expired_documents()
RETURNS TABLE (
  id UUID,
  employee_id UUID,
  employee_name TEXT,
  document_type TEXT,
  document_name TEXT,
  expiry_date DATE,
  days_expired INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.id,
    ed.employee_id,
    (e.first_name || ' ' || e.last_name) as employee_name,
    ed.document_type,
    ed.document_name,
    ed.expiry_date,
    (CURRENT_DATE - ed.expiry_date) as days_expired
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.status = 'active'
    AND ed.expiry_date < CURRENT_DATE
  ORDER BY ed.expiry_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

-- RLS Policies for emergency_contacts
-- Note: These are basic policies. Adjust based on your authentication setup.

-- Allow employees to view and manage their own emergency contacts
CREATE POLICY emergency_contacts_select_own ON emergency_contacts
  FOR SELECT USING (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_insert_own ON emergency_contacts
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_update_own ON emergency_contacts
  FOR UPDATE USING (true); -- Adjust based on your auth

CREATE POLICY emergency_contacts_delete_own ON emergency_contacts
  FOR DELETE USING (true); -- Adjust based on your auth

-- RLS Policies for employee_documents
CREATE POLICY employee_documents_select ON employee_documents
  FOR SELECT USING (true); -- Adjust based on access_level and user role

CREATE POLICY employee_documents_insert ON employee_documents
  FOR INSERT WITH CHECK (true); -- Adjust based on your auth

CREATE POLICY employee_documents_update ON employee_documents
  FOR UPDATE USING (true); -- Adjust based on your auth

CREATE POLICY employee_documents_delete ON employee_documents
  FOR DELETE USING (true); -- Adjust based on your auth

-- RLS Policies for document_types
CREATE POLICY document_types_select ON document_types
  FOR SELECT USING (true); -- Everyone can view document types

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

SELECT 'Migration 005 (FIXED): Emergency Contacts and Document Management completed successfully' AS status;
