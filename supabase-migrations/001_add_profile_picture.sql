-- Add profile_picture column to employees table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment for documentation
COMMENT ON COLUMN employees.profile_picture IS 'Path to profile picture in Supabase Storage';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
