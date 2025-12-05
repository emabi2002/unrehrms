-- =====================================================
-- PNG UNRE HRMS - Foundation Tables
-- Migration 001: Core HR Structure Tables
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. FACULTIES
-- =====================================================

CREATE TABLE IF NOT EXISTS faculties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  dean_id UUID, -- Will reference employees later
  established_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE faculties IS 'University faculties (top-level academic divisions)';

-- =====================================================
-- 2. DEPARTMENTS
-- =====================================================

-- Update existing departments table if needed
ALTER TABLE departments
ADD COLUMN IF NOT EXISTS code TEXT,
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- =====================================================
-- 3. ACADEMIC RANKS
-- =====================================================

CREATE TABLE IF NOT EXISTS academic_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  rank_level INTEGER NOT NULL, -- 1 = Tutor, 2 = Lecturer, etc.
  min_years_experience INTEGER DEFAULT 0,
  requires_phd BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE academic_ranks IS 'Academic rank progression (Tutor → Professor)';

-- Seed academic ranks
INSERT INTO academic_ranks (code, name, rank_level, min_years_experience, requires_phd, is_active) VALUES
('TUTOR', 'Tutor', 1, 0, false, true),
('ASST_LECTURER', 'Assistant Lecturer', 2, 2, false, true),
('LECTURER', 'Lecturer', 3, 4, false, true),
('SNR_LECTURER', 'Senior Lecturer', 4, 8, true, true),
('ASSOC_PROF', 'Associate Professor', 5, 12, true, true),
('PROFESSOR', 'Professor', 6, 15, true, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 4. EMPLOYMENT TYPES
-- =====================================================

CREATE TABLE IF NOT EXISTS employment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_permanent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE employment_types IS 'Types of employment contracts';

-- Seed employment types
INSERT INTO employment_types (code, name, description, is_permanent, is_active) VALUES
('PERM_ACADEMIC', 'Permanent Academic', 'Full-time permanent academic staff', true, true),
('PERM_ADMIN', 'Permanent Administrative', 'Full-time permanent administrative staff', true, true),
('PERM_TECHNICAL', 'Permanent Technical', 'Full-time permanent technical staff', true, true),
('CONTRACT', 'Contract', 'Fixed-term contract', false, true),
('CASUAL', 'Casual', 'Casual/hourly employment', false, true),
('PART_TIME', 'Part-time', 'Part-time employment', false, true),
('VISITING', 'Visiting Faculty', 'Visiting academic staff', false, true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 5. POSITIONS (Job Positions/Grades)
-- =====================================================

CREATE TABLE IF NOT EXISTS positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  academic_rank_id UUID REFERENCES academic_ranks(id),
  employment_type_id UUID REFERENCES employment_types(id),

  -- Salary grade
  grade_level TEXT,
  min_salary NUMERIC(12,2),
  max_salary NUMERIC(12,2),

  -- Position details
  reports_to_position_id UUID REFERENCES positions(id),
  is_management BOOLEAN DEFAULT false,
  is_academic BOOLEAN DEFAULT false,

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE positions IS 'Job positions and grades';

CREATE INDEX idx_positions_department ON positions(department_id);
CREATE INDEX idx_positions_rank ON positions(academic_rank_id);

-- =====================================================
-- 6. UPDATE EMPLOYEES TABLE
-- =====================================================

-- Add missing columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id),
ADD COLUMN IF NOT EXISTS academic_rank_id UUID REFERENCES academic_ranks(id),
ADD COLUMN IF NOT EXISTS employment_type_id UUID REFERENCES employment_types(id),
ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES positions(id),
ADD COLUMN IF NOT EXISTS reports_to UUID REFERENCES employees(id),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS nationality TEXT DEFAULT 'Papua New Guinean',
ADD COLUMN IF NOT EXISTS tax_file_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT,
ADD COLUMN IF NOT EXISTS contract_start_date DATE,
ADD COLUMN IF NOT EXISTS contract_end_date DATE,
ADD COLUMN IF NOT EXISTS probation_end_date DATE;

-- =====================================================
-- 7. SEED SAMPLE FACULTIES
-- =====================================================

INSERT INTO faculties (code, name, description, is_active) VALUES
('FES', 'Faculty of Environmental Sciences', 'Research and teaching in environmental sustainability, climate change, and conservation', true),
('FNR', 'Faculty of Natural Resources', 'Forestry, wildlife management, and natural resource conservation', true),
('FAG', 'Faculty of Agriculture', 'Sustainable agriculture, crop science, and food security research', true),
('FADM', 'Administrative Division', 'University administration and support services', true),
('FIT', 'IT Division', 'Information technology and systems', true)
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 8. UPDATE DEPARTMENTS WITH FACULTIES
-- =====================================================

-- Link existing departments to faculties
DO $$
DECLARE
  fes_id UUID;
  fnr_id UUID;
  fag_id UUID;
  fadm_id UUID;
  fit_id UUID;
BEGIN
  -- Get faculty IDs
  SELECT id INTO fes_id FROM faculties WHERE code = 'FES';
  SELECT id INTO fnr_id FROM faculties WHERE code = 'FNR';
  SELECT id INTO fag_id FROM faculties WHERE code = 'FAG';
  SELECT id INTO fadm_id FROM faculties WHERE code = 'FADM';
  SELECT id INTO fit_id FROM faculties WHERE code = 'FIT';

  -- Update departments (if they exist)
  UPDATE departments SET
    code = 'ENV_SCI',
    faculty_id = fes_id
  WHERE name LIKE '%Environmental Sciences%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'NAT_RES',
    faculty_id = fnr_id
  WHERE name LIKE '%Natural Resources%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'AGRIC',
    faculty_id = fag_id
  WHERE name LIKE '%Agriculture%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'ADMIN',
    faculty_id = fadm_id
  WHERE name LIKE '%Administrative%' AND faculty_id IS NULL;

  UPDATE departments SET
    code = 'IT',
    faculty_id = fit_id
  WHERE name LIKE '%IT%' AND faculty_id IS NULL;
END $$;

-- =====================================================
-- 9. SEED SAMPLE POSITIONS
-- =====================================================

-- Academic positions
DO $$
DECLARE
  tutor_rank_id UUID;
  lecturer_rank_id UUID;
  snr_lecturer_rank_id UUID;
  assoc_prof_rank_id UUID;
  professor_rank_id UUID;
  perm_academic_type_id UUID;
BEGIN
  -- Get IDs
  SELECT id INTO tutor_rank_id FROM academic_ranks WHERE code = 'TUTOR';
  SELECT id INTO lecturer_rank_id FROM academic_ranks WHERE code = 'LECTURER';
  SELECT id INTO snr_lecturer_rank_id FROM academic_ranks WHERE code = 'SNR_LECTURER';
  SELECT id INTO assoc_prof_rank_id FROM academic_ranks WHERE code = 'ASSOC_PROF';
  SELECT id INTO professor_rank_id FROM academic_ranks WHERE code = 'PROFESSOR';
  SELECT id INTO perm_academic_type_id FROM employment_types WHERE code = 'PERM_ACADEMIC';

  -- Create positions
  INSERT INTO positions (code, title, academic_rank_id, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('PROF-01', 'Professor', professor_rank_id, perm_academic_type_id, 'A1', 95000, 130000, true, true),
  ('ASSOC-01', 'Associate Professor', assoc_prof_rank_id, perm_academic_type_id, 'A2', 80000, 105000, true, true),
  ('SNR-LEC-01', 'Senior Lecturer', snr_lecturer_rank_id, perm_academic_type_id, 'A3', 70000, 90000, true, true),
  ('LEC-01', 'Lecturer', lecturer_rank_id, perm_academic_type_id, 'A4', 55000, 75000, true, true),
  ('TUTOR-01', 'Tutor', tutor_rank_id, perm_academic_type_id, 'A5', 40000, 55000, true, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Administrative positions
DO $$
DECLARE
  perm_admin_type_id UUID;
BEGIN
  SELECT id INTO perm_admin_type_id FROM employment_types WHERE code = 'PERM_ADMIN';

  INSERT INTO positions (code, title, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('HR-MGR-01', 'HR Manager', perm_admin_type_id, 'M1', 60000, 80000, false, true),
  ('HR-OFF-01', 'HR Officer', perm_admin_type_id, 'S1', 45000, 60000, false, true),
  ('ADMIN-01', 'Administrative Officer', perm_admin_type_id, 'S2', 40000, 55000, false, true),
  ('ADMIN-ASST-01', 'Administrative Assistant', perm_admin_type_id, 'S3', 30000, 45000, false, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Technical positions
DO $$
DECLARE
  perm_tech_type_id UUID;
BEGIN
  SELECT id INTO perm_tech_type_id FROM employment_types WHERE code = 'PERM_TECHNICAL';

  INSERT INTO positions (code, title, employment_type_id, grade_level, min_salary, max_salary, is_academic, is_active) VALUES
  ('IT-MGR-01', 'IT Manager', perm_tech_type_id, 'T1', 65000, 85000, false, true),
  ('SYS-ADMIN-01', 'Systems Administrator', perm_tech_type_id, 'T2', 55000, 70000, false, true),
  ('TECH-OFF-01', 'Technical Officer', perm_tech_type_id, 'T3', 45000, 60000, false, true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- =====================================================
-- 10. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_faculties_active ON faculties(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_faculty ON departments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_academic_ranks_level ON academic_ranks(rank_level);
CREATE INDEX IF NOT EXISTS idx_employees_faculty ON employees(faculty_id);
CREATE INDEX IF NOT EXISTS idx_employees_position ON employees(position_id);
CREATE INDEX IF NOT EXISTS idx_employees_reports_to ON employees(reports_to);

-- =====================================================
-- 11. TRIGGERS
-- =====================================================

-- Update updated_at timestamp function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_faculties_updated_at ON faculties;
CREATE TRIGGER update_faculties_updated_at
  BEFORE UPDATE ON faculties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_positions_updated_at ON positions;
CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION 001
-- =====================================================

-- Test output
DO $$
BEGIN
  RAISE NOTICE '✅ Foundation tables created successfully!';
  RAISE NOTICE 'Created tables:';
  RAISE NOTICE '  - faculties (5 seeded)';
  RAISE NOTICE '  - academic_ranks (6 seeded)';
  RAISE NOTICE '  - employment_types (7 seeded)';
  RAISE NOTICE '  - positions (12 seeded)';
  RAISE NOTICE '  - Updated: departments, employees';
  RAISE NOTICE '';
  RAISE NOTICE 'Ready for Migration 002 (Payroll System)';
END $$;
