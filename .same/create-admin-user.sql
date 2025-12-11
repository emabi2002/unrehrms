-- ============================================
-- CREATE ADMIN USER: admin@unre.ac.pg
-- ============================================

-- STEP 1: First create the user in Supabase Auth UI
-- Go to: Authentication → Users → Add user
-- Email: admin@unre.ac.pg
-- Password: (set a secure password)
-- Auto-confirm: YES
-- Then COPY the User ID (UUID) and replace below

-- ============================================
-- STEP 2: Run this SQL with your User ID
-- ============================================

-- Replace 'PASTE_USER_ID_HERE' with the actual UUID from Supabase Auth
-- Example: '123e4567-e89b-12d3-a456-426614174000'

DO $$
DECLARE
  admin_user_id UUID := 'PASTE_USER_ID_HERE'; -- ⚠️ REPLACE THIS!
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (id, email, full_name, employee_id, is_active)
  VALUES (
    admin_user_id,
    'admin@unre.ac.pg',
    'Administrator',
    'ADMIN001',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    employee_id = EXCLUDED.employee_id,
    is_active = EXCLUDED.is_active;

  -- Assign System Admin role
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'System Admin'
  ON CONFLICT (user_id, role_id, cost_centre_id) DO NOTHING;

  -- Also assign Bursar role (for testing workflows)
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'Bursar'
  ON CONFLICT (user_id, role_id, cost_centre_id) DO NOTHING;

  -- Also assign HOD role (for testing)
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'HOD'
  ON CONFLICT (user_id, role_id, cost_centre_id) DO NOTHING;

  RAISE NOTICE 'Admin user created successfully!';
  RAISE NOTICE 'Email: admin@unre.ac.pg';
  RAISE NOTICE 'Name: Administrator';
  RAISE NOTICE 'Roles: System Admin, Bursar, HOD';
END $$;

-- ============================================
-- STEP 3: Verify the user was created
-- ============================================

SELECT
  up.email,
  up.full_name,
  up.employee_id,
  STRING_AGG(r.name, ', ') as roles
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email = 'admin@unre.ac.pg'
GROUP BY up.email, up.full_name, up.employee_id;

-- You should see:
-- email: admin@unre.ac.pg
-- full_name: Administrator
-- employee_id: ADMIN001
-- roles: System Admin, Bursar, HOD
