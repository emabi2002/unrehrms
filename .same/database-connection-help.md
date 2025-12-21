# 🔧 Supabase Connection Troubleshooting Guide

## Common Issues & Solutions

---

## Issue 1: "Error: supabase client is not configured"

### Symptoms:
- Application shows connection errors
- Console shows "Invalid Supabase client"
- Dashboard won't load

### Solutions:

**Solution A: Check .env.local exists**
```bash
# Verify file exists
ls -la .env.local

# If missing, create it
cp .env.example .env.local
```

**Solution B: Verify environment variables**
```bash
# Check content
cat .env.local

# Should have 3 variables:
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

**Solution C: Restart dev server**
```bash
# Stop server (Ctrl+C)
bun run dev
```

**Solution D: Check for typos**
- No spaces around `=` sign
- No quotes around values
- Complete keys (no truncation)
- Correct project URL format

---

## Issue 2: "Table 'employees' does not exist"

### Symptoms:
- SQL errors in console
- Empty dashboard
- "relation does not exist" errors

### Solutions:

**Solution A: Run migrations**
```sql
-- In Supabase SQL Editor, run:
-- .same/complete_migration.sql
```

**Solution B: Verify tables exist**
```sql
-- Check tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should see: employees, departments, etc.
```

**Solution C: Check migration order**
Run migrations in this exact order:
1. 001_foundation_tables.sql
2. 002_payroll_system.sql
3. 003_png_tax_tables.sql
4. 004_super_schemes.sql
5. 005_emergency_contacts_and_documents_FIXED.sql
6. 006_comprehensive_hrms_tables_FINAL.sql
7. 007_hrms_performance_learning_benefits_FIXED.sql
8. 008_hrms_relations_safety_admin_FIXED.sql

---

## Issue 3: "Row Level Security" errors

### Symptoms:
- "permission denied for table employees"
- Can't read/write data
- RLS policy violations

### Solutions:

**Solution A: Disable RLS for development**
```sql
-- In Supabase SQL Editor
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
ALTER TABLE salary_slips DISABLE ROW LEVEL SECURITY;

-- Repeat for all tables causing issues
```

**Solution B: Add permissive RLS policy**
```sql
-- Allow all operations for development
CREATE POLICY "Allow all for development" ON employees
FOR ALL USING (true) WITH CHECK (true);
```

**Solution C: Use service role key**
- Ensure SUPABASE_SERVICE_ROLE_KEY is set
- Service role key bypasses RLS

---

## Issue 4: Seed script fails

### Symptoms:
- `bun run seed` shows errors
- "unique constraint violation"
- "foreign key violation"

### Solutions:

**Solution A: Clear existing data**
```sql
-- In Supabase SQL Editor
TRUNCATE employees, departments, leave_requests,
         attendance, salary_slips CASCADE;
```

**Solution B: Check migrations completed**
```sql
-- Verify all tables exist
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- Should return 50+ tables
```

**Solution C: Run seed with --force flag**
```bash
# If available
bun run seed --force
```

**Solution D: Manually insert test data**
```sql
-- Create a test employee
INSERT INTO departments (name, description)
VALUES ('IT Department', 'Information Technology');

INSERT INTO employees (
  first_name, last_name, email, employee_id,
  department, position, employment_type,
  hire_date, salary, status
) VALUES (
  'Test', 'User', 'test@unre.ac.pg', 'TEST-001',
  'IT Department', 'Test Admin', 'Full-time',
  CURRENT_DATE, 50000, 'active'
);
```

---

## Issue 5: "Invalid API key" or 401 errors

### Symptoms:
- 401 Unauthorized errors
- "Invalid API key"
- Can't connect to Supabase

### Solutions:

**Solution A: Regenerate API keys**
1. Go to Supabase Dashboard → Settings → API
2. Click "Reset" on anon key
3. Copy new key to `.env.local`
4. Restart dev server

**Solution B: Check key format**
```env
# WRONG - has quotes
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbG..."

# WRONG - has spaces
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbG...

# CORRECT
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

**Solution C: Verify project URL**
```env
# WRONG - missing https://
NEXT_PUBLIC_SUPABASE_URL=qltnmteqivrnljemyvvb.supabase.co

# CORRECT
NEXT_PUBLIC_SUPABASE_URL=https://qltnmteqivrnljemyvvb.supabase.co
```

---

## Issue 6: Storage/Upload errors

### Symptoms:
- Can't upload profile pictures
- Storage bucket not found
- Permission denied on upload

### Solutions:

**Solution A: Create storage bucket**
```
Supabase → Storage → New bucket
Name: employee-profiles
Public: YES ✅
```

**Solution B: Add storage policies**
```sql
-- Public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'employee-profiles');

-- Authenticated upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');

-- Authenticated update
CREATE POLICY "Authenticated Update" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'employee-profiles');

-- Authenticated delete
CREATE POLICY "Authenticated Delete" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'employee-profiles');
```

**Solution C: Check bucket is public**
- Storage → employee-profiles → Settings
- Ensure "Public bucket" is enabled

---

## Issue 7: Application shows old/cached data

### Symptoms:
- Changes not reflecting
- Old employee data showing
- Dashboard stuck on sample data

### Solutions:

**Solution A: Clear browser cache**
- Chrome: Ctrl+Shift+Del → Clear cache
- Or use Incognito mode

**Solution B: Hard refresh**
- Ctrl+F5 (Windows)
- Cmd+Shift+R (Mac)

**Solution C: Clear Next.js cache**
```bash
# Stop server
# Delete .next folder
rm -rf .next

# Restart server
bun run dev
```

**Solution D: Verify database updated**
```sql
-- Check latest data
SELECT * FROM employees ORDER BY created_at DESC LIMIT 5;
```

---

## Issue 8: Migration conflicts

### Symptoms:
- "table already exists"
- "column already exists"
- "constraint already exists"

### Solutions:

**Solution A: These are usually safe to ignore**
```
-- If you see:
ERROR: relation "employees" already exists

-- This is OKAY! It means table is already there
```

**Solution B: Use IF NOT EXISTS clauses**
```sql
-- Migrations should have:
CREATE TABLE IF NOT EXISTS employees ...
ALTER TABLE departments ADD COLUMN IF NOT EXISTS ...
```

**Solution C: Drop and recreate (DANGER!)**
```sql
-- ⚠️ WARNING: This deletes ALL data!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then re-run all migrations
```

---

## Issue 9: Connection timeout

### Symptoms:
- Requests timing out
- Slow loading
- "Network error"

### Solutions:

**Solution A: Check Supabase status**
- Visit: https://status.supabase.com
- Verify no outages

**Solution B: Check project is active**
- Supabase → Project → Should be "Active"
- Not paused or stopped

**Solution C: Check internet connection**
```bash
# Ping Supabase
ping qltnmteqivrnljemyvvb.supabase.co
```

**Solution D: Restart Supabase project**
- Sometimes helps with stuck connections
- Dashboard → Settings → Restart project

---

## Issue 10: TypeScript errors in seed script

### Symptoms:
- `scripts/seed-database.ts` shows errors
- Type errors about "never"
- Insert statements fail

### Solutions:

**Solution A: Ignore TypeScript errors in seed**
```bash
# Run with --no-check flag
bun --bun scripts/seed-database.ts
```

**Solution B: These errors don't affect runtime**
- Application still works
- Database still gets seeded
- Only build-time warnings

**Solution C: Use direct SQL instead**
- Run seed data via SQL Editor
- Use `supabase/seed-data.sql` file

---

## FAQ

### Q: Do I need a paid Supabase plan?
**A:** No! Free tier includes:
- 500 MB database
- 1 GB file storage
- 50,000 monthly active users
- More than enough for development!

### Q: Can I change my database password?
**A:** Yes! Dashboard → Settings → Database → Reset password

### Q: How do I backup my database?
**A:**
1. SQL Editor → Export schema
2. Or use `pg_dump` command
3. Or enable automatic backups (paid plans)

### Q: What's the difference between anon and service keys?
**A:**
- **Anon key**: Safe for client-side (browsers)
- **Service key**: Server-side only, bypasses RLS

### Q: Can I use PostgreSQL GUI tools?
**A:** Yes! Use the connection string from:
Settings → Database → Connection string

### Q: How do I enable authentication?
**A:** Dashboard → Authentication → Enable providers

### Q: Can I migrate from another database?
**A:** Yes! Export as SQL and import to Supabase

### Q: How do I handle production data?
**A:**
1. Create separate Supabase project for production
2. Use different `.env.local` values
3. Enable RLS properly
4. Set up regular backups

---

## Getting Help

### Official Resources:
- **Supabase Docs:** https://supabase.com/docs
- **Discord:** https://discord.supabase.com
- **GitHub Issues:** https://github.com/supabase/supabase/issues

### HRMS-Specific:
- **Project Docs:** Check `.same/` folder
- **Migration Files:** `supabase/migrations/`
- **Seed Script:** `scripts/seed-database.ts`

---

## Diagnostic Commands

Run these to check system health:

### Check Environment
```bash
# Verify .env.local
cat .env.local | grep SUPABASE

# Check Node/Bun version
bun --version
```

### Check Database
```sql
-- Count all tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public';

-- List all tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check employee count
SELECT COUNT(*) FROM employees;
```

### Check Application
```bash
# Test API connection
curl http://localhost:3000/api/health

# Check dev server logs
# Should see successful API calls
```

---

## Prevention Tips

### Before Starting:
✅ Have Supabase account ready
✅ Project created and active
✅ All keys copied securely
✅ `.env.local` configured correctly

### During Setup:
✅ Run migrations in order
✅ Check each step completes
✅ Verify tables created
✅ Test queries work

### After Setup:
✅ Backup your database
✅ Document any customizations
✅ Enable RLS for production
✅ Set up monitoring

---

**Last Updated:** December 18, 2025
**Version:** 1.0.0
**Maintained By:** PNG UNRE HRMS Team
