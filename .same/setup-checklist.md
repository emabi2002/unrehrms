# ✅ PNG UNRE HRMS - Complete Setup Checklist

## 🎯 Mission: Connect Your HRMS to Supabase Database

---

## Part 1: Supabase Account & Project

### □ Task 1.1: Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Sign up with GitHub or Email
- [ ] Verify your email

### □ Task 1.2: Create New Project
- [ ] Click "New Project"
- [ ] Project Name: `png-unre-hrms`
- [ ] Database Password: (Create strong password)
- [ ] Region: `Southeast Asia (Singapore)`
- [ ] Click "Create new project"
- [ ] Wait 2 minutes for setup ☕

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 2: Get API Credentials

### □ Task 2.1: Navigate to Settings
- [ ] Open your project dashboard
- [ ] Click "Settings" (⚙️ icon) in sidebar
- [ ] Click "API" section

### □ Task 2.2: Copy Your Keys
- [ ] Copy **Project URL** (save in notes)
- [ ] Copy **anon public** key (save in notes)
- [ ] Copy **service_role** key (save in notes)

**Example Format:**
```
URL: https://qltnmteqivrnljemyvvb.supabase.co
Anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Service: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 3: Configure Application

### □ Task 3.1: Create .env.local File
- [ ] Open your project in VS Code/editor
- [ ] Go to root folder `unrehrms/`
- [ ] Create file: `.env.local`

### □ Task 3.2: Add Your Credentials
- [ ] Paste this template:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_key
```
- [ ] Replace `YOUR_PROJECT` with your project ID
- [ ] Replace `your_anon_key` with actual anon key
- [ ] Replace `your_service_key` with actual service key
- [ ] Save file

### □ Task 3.3: Verify .gitignore
- [ ] Check `.gitignore` includes `.env.local`
- [ ] Never commit this file to Git!

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 4: Run Database Migrations

### □ Task 4.1: Open SQL Editor
- [ ] Go to Supabase Dashboard
- [ ] Click "SQL Editor" in sidebar
- [ ] Click "New query"

### □ Task 4.2: Run Consolidated Migration
**EASY METHOD** - Run all at once:
- [ ] Open file: `.same/complete_migration.sql`
- [ ] Copy entire file content
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run" (or Ctrl+Enter)
- [ ] Wait for "Success" message (~30 seconds)

**ALTERNATIVE** - Run individually:
- [ ] Run `001_foundation_tables.sql`
- [ ] Run `002_payroll_system.sql`
- [ ] Run `003_png_tax_tables.sql`
- [ ] Run `004_super_schemes.sql`
- [ ] Run `005_emergency_contacts_and_documents_FIXED.sql`
- [ ] Run `006_comprehensive_hrms_tables_FINAL.sql`
- [ ] Run `007_hrms_performance_learning_benefits_FIXED.sql`
- [ ] Run `008_hrms_relations_safety_admin_FIXED.sql`

### □ Task 4.3: Verify Tables Created
- [ ] Click "Table Editor" in Supabase
- [ ] Should see 50+ tables
- [ ] Check for: employees, departments, positions, etc.

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 5: Set Up Storage (Optional but Recommended)

### □ Task 5.1: Create Storage Bucket
- [ ] Click "Storage" in Supabase sidebar
- [ ] Click "New bucket"
- [ ] Name: `employee-profiles`
- [ ] Toggle "Public bucket" ON
- [ ] Click "Create bucket"

### □ Task 5.2: Configure Policies
- [ ] Click on `employee-profiles` bucket
- [ ] Go to "Policies" tab
- [ ] Add "Public Read" policy:
```sql
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'employee-profiles');
```
- [ ] Add "Authenticated Upload" policy:
```sql
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');
```

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 6: Seed Sample Data

### □ Task 6.1: Run Seed Script
- [ ] Open terminal in project root
- [ ] Run: `cd unrehrms`
- [ ] Run: `bun run seed`
- [ ] Wait for completion (~10 seconds)

### □ Task 6.2: Verify Data Loaded
Expected output:
```
🌱 Starting database seed...
✅ Seeded 8 departments
✅ Seeded 20 employees
✅ Seeded 10 leave requests
✅ Seeded 100 attendance records
✅ Seeded 20 salary slips
✨ Database seeding completed!
```

### □ Task 6.3: Check in Supabase
- [ ] Go to Table Editor → employees
- [ ] Should see 20 employees
- [ ] Check names: Dr. John Kila, Prof. Mary Tone, etc.

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 7: Test Application Connection

### □ Task 7.1: Restart Dev Server
- [ ] In terminal, stop server (Ctrl+C)
- [ ] Run: `bun run dev`
- [ ] Wait for "Local: http://localhost:3000"

### □ Task 7.2: Test Dashboard
- [ ] Open browser: http://localhost:3000
- [ ] Click "Open Dashboard"
- [ ] Should see employee count: 524 → 20
- [ ] Check for real employee names
- [ ] No "undefined" or error messages

### □ Task 7.3: Test Features
- [ ] Click "Employees" - should see 20 employees
- [ ] Click "Departments" - should see departments
- [ ] Click "Leave" - should see leave requests
- [ ] Click "Payroll" - should see payroll data

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Part 8: Final Verification

### □ Task 8.1: Run Test Queries
In Supabase SQL Editor:

```sql
-- Test 1: Count employees
SELECT COUNT(*) FROM employees;
-- Expected: 20

-- Test 2: List departments
SELECT name FROM departments ORDER BY name;
-- Expected: 8 departments

-- Test 3: Check leave requests
SELECT COUNT(*) FROM leave_requests;
-- Expected: 10

-- Test 4: Verify attendance
SELECT COUNT(*) FROM attendance;
-- Expected: 100
```

### □ Task 8.2: Check Application Logs
- [ ] In terminal, check for errors
- [ ] Should see no connection errors
- [ ] Should see successful API calls

### □ Task 8.3: Test CRUD Operations
- [ ] Try adding a new employee (if implemented)
- [ ] Try editing employee data
- [ ] Try submitting leave request
- [ ] All should work without errors

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## 🎉 Success Criteria

You're done when ALL these are true:

- ✅ Supabase project created
- ✅ `.env.local` configured with correct keys
- ✅ All migrations executed (50+ tables created)
- ✅ Storage bucket created with policies
- ✅ Sample data seeded (20 employees)
- ✅ Application connects without errors
- ✅ Dashboard shows real data
- ✅ All test queries return expected results

---

## 📊 Progress Tracker

**Overall Progress:** [ █░░░░░░░ ] 0%

Update as you complete each part:
- Part 1: Account & Project → __%
- Part 2: API Credentials → __%
- Part 3: Configuration → __%
- Part 4: Migrations → __%
- Part 5: Storage → __%
- Part 6: Seeding → __%
- Part 7: Testing → __%
- Part 8: Verification → __%

---

## 🆘 Troubleshooting Checklist

If something goes wrong:

**Database Connection Issues:**
- [ ] Check `.env.local` exists in root folder
- [ ] Verify no typos in environment variables
- [ ] Confirm no spaces or quotes around values
- [ ] Restart dev server after changing .env

**Migration Errors:**
- [ ] Run migrations in correct order (001 → 008)
- [ ] Check for "already exists" errors (can ignore)
- [ ] Verify Supabase project is active
- [ ] Check internet connection

**Seed Script Fails:**
- [ ] Ensure migrations completed first
- [ ] Check if data already exists
- [ ] Clear tables and re-run: `TRUNCATE employees CASCADE;`
- [ ] Verify `.env.local` has service role key

**Application Shows No Data:**
- [ ] Confirm seed script completed successfully
- [ ] Check browser console for errors
- [ ] Verify API keys are correct
- [ ] Check Supabase project is not paused

---

## 📝 Notes & Observations

Use this space to track your progress:

```
Date: _______________
Time Started: _______________
Issues Encountered:


Solutions Applied:


Time Completed: _______________
Total Time: _______________ minutes
```

---

## 🎓 What You've Accomplished

Once complete, you will have:

✨ A fully functional HRMS database with 50+ tables
✨ Real-time connection between app and Supabase
✨ Sample data for testing (20 employees, 8 departments)
✨ Secure API configuration
✨ Profile picture storage ready
✨ Production-ready database schema

---

**Estimated Total Time:** 15-20 minutes
**Difficulty:** ⭐⭐☆☆☆ (Beginner-friendly)
**Prerequisites:** Supabase account, Project cloned locally

---

**Checklist Created:** December 18, 2025
**For:** PNG UNRE HRMS v1.0.0
**Database:** Supabase PostgreSQL 15
