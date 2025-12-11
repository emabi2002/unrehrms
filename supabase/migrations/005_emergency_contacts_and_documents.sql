-- Migration 005: Emergency Contacts & Document Management
-- Created: December 10, 2025
-- Purpose: Add emergency contacts and document management capabilities

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
  priority INTEGER DEFAULT 1, -- 1 = primary, 2 = secondary, etc.
  is_primary BOOLEAN DEFAULT false,

  -- Notes
  notes TEXT
);

-- Create indexes
CREATE INDEX idx_emergency_contacts_employee ON emergency_contacts(employee_id);
CREATE INDEX idx_emergency_contacts_primary ON emergency_contacts(is_primary) WHERE is_primary = true;

-- Create unique partial index to ensure only one primary contact per employee
CREATE UNIQUE INDEX idx_unique_primary_contact ON emergency_contacts(employee_id) WHERE is_primary = true;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 2. EMPLOYEE DOCUMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,

  -- Document Details
  document_type TEXT NOT NULL, -- contract, certificate, id_copy, medical, policy_acknowledgement, passport, license
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type TEXT,

  -- Metadata
  uploaded_by UUID REFERENCES employees(id),
  issue_date DATE,
  expiry_date DATE,
  document_number TEXT,
  issuing_authority TEXT,

  -- Access Control
  is_confidential BOOLEAN DEFAULT false,
  access_level TEXT DEFAULT 'hr_only' CHECK (access_level IN ('hr_only', 'manager_and_hr', 'employee_visible', 'public')),

  -- Status
  status TEXT CHECK (status IN ('active', 'archived', 'expired', 'replaced')) DEFAULT 'active',

  -- Notes
  notes TEXT,

  -- Version Control
  version INTEGER DEFAULT 1,
  replaced_by UUID REFERENCES employee_documents(id)
);

-- Create indexes
CREATE INDEX idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX idx_employee_documents_status ON employee_documents(status);
CREATE INDEX idx_employee_documents_expiry ON employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_employee_documents_uploaded ON employee_documents(uploaded_by);

-- Add updated_at trigger
CREATE TRIGGER update_employee_documents_updated_at BEFORE UPDATE ON employee_documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 3. ENHANCE EMPLOYEES TABLE
-- =====================================================

-- Add additional fields to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS drivers_license TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified BOOLEAN DEFAULT false;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_verified_date DATE;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_employees_national_id ON employees(national_id) WHERE national_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_employees_passport ON employees(passport_number) WHERE passport_number IS NOT NULL;

-- =====================================================
-- 4. DOCUMENT TYPES LOOKUP TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS document_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  requires_expiry BOOLEAN DEFAULT false,
  requires_document_number BOOLEAN DEFAULT false,
  is_mandatory BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Insert default document types
INSERT INTO document_types (code, name, description, requires_expiry, requires_document_number, is_mandatory, display_order) VALUES
('employment_contract', 'Employment Contract', 'Signed employment agreement', false, true, true, 1),
('offer_letter', 'Offer Letter', 'Job offer letter', false, false, true, 2),
('national_id', 'National ID', 'PNG National ID card', true, true, true, 3),
('passport', 'Passport', 'International passport', true, true, false, 4),
('drivers_license', 'Driver''s License', 'Valid driver''s license', true, true, false, 5),
('degree_certificate', 'Degree Certificate', 'University degree or diploma', false, true, false, 6),
('professional_cert', 'Professional Certificate', 'Professional qualification certificate', true, true, false, 7),
('medical_clearance', 'Medical Clearance', 'Pre-employment or periodic medical clearance', true, false, true, 8),
('police_clearance', 'Police Clearance', 'Police clearance certificate', true, false, true, 9),
('tax_clearance', 'Tax Clearance', 'Tax clearance certificate', true, false, false, 10),
('bank_details', 'Bank Details', 'Bank account details form', false, false, true, 11),
('nda', 'Non-Disclosure Agreement', 'Signed NDA', false, false, false, 12),
('code_of_conduct', 'Code of Conduct', 'Signed code of conduct acknowledgement', false, false, true, 13),
('reference_letter', 'Reference Letter', 'Employment reference', false, false, false, 14),
('training_cert', 'Training Certificate', 'Training completion certificate', true, true, false, 15),
('visa_work_permit', 'Visa/Work Permit', 'Work permit for foreign nationals', true, true, false, 16),
('resignation_letter', 'Resignation Letter', 'Employee resignation letter', false, false, false, 17),
('other', 'Other Document', 'Other miscellaneous documents', false, false, false, 99)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tables
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;

-- Emergency Contacts Policies
-- Employees can view their own emergency contacts
CREATE POLICY "Employees can view own emergency contacts"
ON emergency_contacts FOR SELECT
TO authenticated
USING (employee_id = auth.uid() OR employee_id IN (
  SELECT id FROM employees WHERE user_id = auth.uid()
));

-- Employees can insert their own emergency contacts
CREATE POLICY "Employees can insert own emergency contacts"
ON emergency_contacts FOR INSERT
TO authenticated
WITH CHECK (employee_id IN (
  SELECT id FROM employees WHERE user_id = auth.uid()
));

-- Employees can update their own emergency contacts
CREATE POLICY "Employees can update own emergency contacts"
ON emergency_contacts FOR UPDATE
TO authenticated
USING (employee_id IN (
  SELECT id FROM employees WHERE user_id = auth.uid()
));

-- Employees can delete their own emergency contacts
CREATE POLICY "Employees can delete own emergency contacts"
ON emergency_contacts FOR DELETE
TO authenticated
USING (employee_id IN (
  SELECT id FROM employees WHERE user_id = auth.uid()
));

-- Employee Documents Policies
-- Employees can view their own documents (based on access_level)
CREATE POLICY "Employees can view own visible documents"
ON employee_documents FOR SELECT
TO authenticated
USING (
  employee_id IN (SELECT id FROM employees WHERE user_id = auth.uid())
  AND access_level IN ('employee_visible', 'public')
);

-- HR can view all documents
CREATE POLICY "HR can view all documents"
ON employee_documents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees e
    WHERE e.user_id = auth.uid()
    AND e.department = 'Human Resources'
  )
);

-- Document Types - Everyone can view
CREATE POLICY "Everyone can view document types"
ON document_types FOR SELECT
TO authenticated
USING (is_active = true);

-- =====================================================
-- 6. FUNCTIONS FOR DOCUMENT EXPIRY ALERTS
-- =====================================================

-- Function to get documents expiring soon
CREATE OR REPLACE FUNCTION get_expiring_documents(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  document_name TEXT,
  document_type TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    ed.document_name,
    ed.document_type,
    ed.expiry_date,
    (ed.expiry_date - CURRENT_DATE) AS days_until_expiry
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + days_ahead
    AND ed.status = 'active'
  ORDER BY ed.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get expired documents
CREATE OR REPLACE FUNCTION get_expired_documents()
RETURNS TABLE (
  employee_id UUID,
  employee_name TEXT,
  document_name TEXT,
  document_type TEXT,
  expiry_date DATE,
  days_expired INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ed.employee_id,
    e.first_name || ' ' || e.last_name AS employee_name,
    ed.document_name,
    ed.document_type,
    ed.expiry_date,
    (CURRENT_DATE - ed.expiry_date) AS days_expired
  FROM employee_documents ed
  JOIN employees e ON e.id = ed.employee_id
  WHERE ed.expiry_date IS NOT NULL
    AND ed.expiry_date < CURRENT_DATE
    AND ed.status = 'active'
  ORDER BY ed.expiry_date ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. SAMPLE DATA (FOR TESTING)
-- =====================================================

-- Note: Sample data would reference existing employee IDs from your database
-- This is just a template showing the structure

/*
-- Example emergency contact
INSERT INTO emergency_contacts (employee_id, full_name, relationship, phone, is_primary) VALUES
((SELECT id FROM employees LIMIT 1), 'Jane Doe', 'Spouse', '+675 7234 5678', true);

-- Example document
INSERT INTO employee_documents (employee_id, document_type, document_name, file_url, uploaded_by, access_level) VALUES
((SELECT id FROM employees LIMIT 1), 'national_id', 'National ID - John Kila', 'documents/national_id_001.pdf', (SELECT id FROM employees LIMIT 1), 'hr_only');
*/

-- =====================================================
-- 8. GRANTS (Permissions)
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON emergency_contacts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_documents TO authenticated;
GRANT SELECT ON document_types TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- Migration Complete
-- =====================================================

-- Add migration record
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'schema_migrations') THEN
    CREATE TABLE schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;

  INSERT INTO schema_migrations (version) VALUES ('005_emergency_contacts_and_documents')
  ON CONFLICT (version) DO NOTHING;
END $$;
