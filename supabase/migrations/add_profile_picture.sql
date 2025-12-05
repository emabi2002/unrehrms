-- Add profile_picture column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Create storage bucket for employee profiles (if not exists)
-- Note: This needs to be done in Supabase Dashboard > Storage
-- Bucket name: employee-profiles
-- Public bucket: Yes
-- Allowed MIME types: image/*

-- Add comment to the column
COMMENT ON COLUMN employees.profile_picture IS 'Path to employee profile picture in Supabase Storage';
