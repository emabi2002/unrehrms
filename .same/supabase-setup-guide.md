# 🚀 Complete Supabase Setup Guide for PNG UNRE HRMS

## Overview
This guide will walk you through setting up your Supabase database and connecting it to the PNG UNRE HRMS application.

**Time Required:** ~15-20 minutes
**Difficulty:** Beginner-friendly

---

## 📋 Prerequisites

- ✅ A Supabase account (free tier works!)
- ✅ The HRMS application cloned locally
- ✅ Bun installed (already done)

---

## Step 1: Create a Supabase Project

### 1.1 Sign Up/Login to Supabase

1. Go to https://supabase.com
2. Click **"Start your project"** or **"Sign In"**
3. Sign up with GitHub (recommended) or email

### 1.2 Create New Project

1. Click **"New Project"**
2. Choose your organization
3. Fill in project details:
   - **Name:** `png-unre-hrms`
   - **Database Password:** Create a strong password (save this!)
   - **Region:** Choose closest to Papua New Guinea (e.g., `ap-southeast-1` Singapore)
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. Wait ~2 minutes for database to be ready ☕

---

## Step 2: Get Your Supabase Credentials

### 2.1 Find Your Project Settings

1. In your Supabase dashboard, click **"Settings"** (gear icon) in the sidebar
2. Go to **"API"** section

### 2.2 Copy Your Credentials

You'll need these 3 values:

**1. Project URL:**
```
Found under: Project URL
Example: https://qltnmteqivrnljemyvvb.supabase.co
```

**2. Anon (Public) Key:**
```
Found under: Project API keys → anon public
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**3. Service Role Key:**
```
Found under: Project API keys → service_role
⚠️ Keep this SECRET! Never expose in client-side code
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Configure Environment Variables

### 3.1 Create .env.local File

In your project root (`unrehrms/`), create a `.env.local` file:

```bash
cd unrehrms
touch .env.local
```

### 3.2 Add Your Credentials

Open `.env.local` and paste your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.YOUR_SERVICE_ROLE_KEY
```

**Replace** `YOUR_PROJECT_ID`, `YOUR_ANON_KEY`, and `YOUR_SERVICE_ROLE_KEY` with your actual values!

### 3.3 Verify File is Ignored

Check that `.env.local` is in `.gitignore`:
```bash
cat .gitignore | grep .env.local
```
You should see `.env.local` listed. ✅

---

## Step 4: Run Database Migrations

You have 8 migration files that need to be run in order.

### 4.1 Go to SQL Editor

1. In Supabase dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**

### 4.2 Run Migrations in Order

Run each migration file one by one:

#### Migration 1: Foundation Tables
```bash
# Copy content from:
supabase/migrations/001_foundation_tables.sql
```

1. Open `001_foundation_tables.sql`
2. Copy entire content
3. Paste in Supabase SQL Editor
4. Click **"Run"**
5. Wait for "Success" message ✅

#### Migration 2: Payroll System
```bash
# Copy content from:
supabase/migrations/002_payroll_system.sql
```

Repeat the same process.

#### Migration 3: PNG Tax Tables
```bash
# Copy content from:
supabase/migrations/003_png_tax_tables.sql
```

#### Migration 4: Super Schemes
```bash
# Copy content from:
supabase/migrations/004_super_schemes.sql
```

#### Migration 5: Emergency Contacts & Documents (FIXED version)
```bash
# Copy content from:
supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql
```

#### Migration 6: Comprehensive HRMS Tables (FINAL version)
```bash
# Copy content from:
supabase/migrations/006_comprehensive_hrms_tables_FINAL.sql
```

#### Migration 7: Performance, Learning & Benefits (FIXED version)
```bash
# Copy content from:
supabase/migrations/007_hrms_performance_learning_benefits_FIXED.sql
```

#### Migration 8: Relations, Safety & Admin (FIXED version)
```bash
# Copy content from:
supabase/migrations/008_hrms_relations_safety_admin_FIXED.sql
```

---

## Step 5: Verify Database Schema

### 5.1 Check Tables Created

In SQL Editor, run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see 50+ tables including:
- ✅ employees
- ✅ departments
- ✅ positions
- ✅ leave_requests
- ✅ attendance
- ✅ payroll_runs
- ✅ salary_slips
- ✅ tax_tables
- ✅ super_schemes
- ✅ And many more...

---

## Step 6: Set Up Storage for Profile Pictures

### 6.1 Create Storage Bucket

1. Click **"Storage"** in sidebar
2. Click **"New bucket"**
3. Fill in:
   - **Name:** `employee-profiles`
   - **Public bucket:** Toggle **ON** ✅
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/*`
4. Click **"Create bucket"**

### 6.2 Set Storage Policies

Click on your new bucket → **"Policies"** tab

**Policy 1: Allow Public Read**
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-profiles');
```

**Policy 2: Allow Authenticated Upload**
```sql
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');
```

**Policy 3: Allow Authenticated Update**
```sql
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-profiles');
```

**Policy 4: Allow Authenticated Delete**
```sql
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-profiles');
```

---

## Step 7: Seed the Database with Sample Data

### 7.1 Run Seed Script

Back in your terminal:

```bash
cd unrehrms
bun run seed
```

### 7.2 Expected Output

```
🌱 Starting database seed...

📁 Seeding departments...
✅ Seeded 8 departments

👥 Seeding employees...
✅ Seeded 20 employees

📅 Seeding leave requests...
✅ Seeded 10 leave requests

⏰ Seeding attendance records...
✅ Seeded 100 attendance records

💰 Seeding salary slips...
✅ Seeded 20 salary slips

✨ Database seeding completed successfully!
```

### 7.3 If You Get Errors

If tables already exist or have data:
1. That's okay! The script handles duplicates
2. Or you can clear tables first:
   ```sql
   TRUNCATE employees, departments, leave_requests, attendance, salary_slips CASCADE;
   ```

---

## Step 8: Test the Connection

### 8.1 Restart Dev Server

```bash
# Stop the current server (Ctrl+C)
bun run dev
```

### 8.2 Visit the Dashboard

Open http://localhost:3000/dashboard

You should now see:
- ✅ Real employee data from database
- ✅ Actual department counts
- ✅ Leave requests showing
- ✅ Attendance records
- ✅ No "undefined" or connection errors

---

## Step 9: Verify Data in Supabase

### 9.1 Check Table Data

In Supabase dashboard:
1. Click **"Table Editor"**
2. Click on **"employees"** table
3. You should see 20 employees listed! 🎉

### 9.2 Run Test Queries

In SQL Editor:

```sql
-- Count employees
SELECT COUNT(*) FROM employees;
-- Should return 20

-- Check departments
SELECT name, COUNT(*) as employee_count
FROM departments d
LEFT JOIN employees e ON e.department = d.name
GROUP BY d.name;

-- View recent leave requests
SELECT * FROM leave_requests
ORDER BY created_at DESC
LIMIT 5;
```

---

## ✅ Setup Complete Checklist

- [ ] Supabase project created
- [ ] Environment variables configured in `.env.local`
- [ ] All 8 migrations run successfully
- [ ] 50+ tables created
- [ ] Storage bucket created with policies
- [ ] Sample data seeded (20 employees, departments, etc.)
- [ ] Application connects to database
- [ ] Dashboard displays real data

---

## 🎉 Success!

Your PNG UNRE HRMS is now connected to Supabase!

**What's Working:**
✅ Employee management with real database
✅ Department structure
✅ Leave management system
✅ Attendance tracking
✅ Payroll data storage
✅ Profile picture storage

---

## 🔧 Troubleshooting

### Issue: "Invalid API key"
**Solution:** Double-check your `.env.local` file has correct keys

### Issue: Tables not found
**Solution:** Re-run migrations in order

### Issue: Seed script fails
**Solution:** Check if tables exist, may need to clear them first

### Issue: Connection timeout
**Solution:** Check your internet connection and Supabase project status

### Issue: RLS (Row Level Security) errors
**Solution:** For development, you can disable RLS:
```sql
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
-- Repeat for other tables as needed
```

---

## 📚 Next Steps

1. **Enable Authentication** - Add user login system
2. **Set up RLS Policies** - Secure your data properly
3. **Deploy to Production** - Deploy on Netlify/Vercel
4. **Add Real University Data** - Import actual employee records
5. **Configure Email** - Set up email notifications

---

## 🆘 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Project Repository:** Check README.md
- **Database Issues:** Review migration files in `supabase/migrations/`

---

**Setup Guide Created:** December 18, 2025
**For:** PNG UNRE HRMS v1.0.0
**Database:** Supabase (PostgreSQL 15)
