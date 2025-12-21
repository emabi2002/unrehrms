# ⚡ Quick Setup Reference Card

## 🎯 3-Step Quick Start

### Step 1: Create Supabase Project (2 min)
1. Go to https://supabase.com → New Project
2. Name: `png-unre-hrms`
3. Region: `ap-southeast-1` (Singapore - closest to PNG)
4. Wait for setup to complete

### Step 2: Configure Environment (1 min)
Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get keys from: Supabase Dashboard → Settings → API

### Step 3: Run Migrations (5 min)
Go to Supabase → SQL Editor and run these files in order:

1. ✅ `001_foundation_tables.sql`
2. ✅ `002_payroll_system.sql`
3. ✅ `003_png_tax_tables.sql`
4. ✅ `004_super_schemes.sql`
5. ✅ `005_emergency_contacts_and_documents_FIXED.sql`
6. ✅ `006_comprehensive_hrms_tables_FINAL.sql`
7. ✅ `007_hrms_performance_learning_benefits_FIXED.sql`
8. ✅ `008_hrms_relations_safety_admin_FIXED.sql`

---

## 📦 What Gets Created

**Tables:** 50+ comprehensive HRMS tables
**Key Tables:**
- employees (staff records)
- departments (org structure)
- positions (job roles)
- leave_requests (leave management)
- attendance (time tracking)
- payroll_runs (payroll processing)
- salary_slips (pay records)
- tax_tables (PNG tax rates)
- super_schemes (superannuation)
- performance_goals (performance)
- training_courses (L&D)
- recruitment_applications (hiring)

---

## 🗄️ Storage Setup (Optional)

### Create Bucket for Profile Pictures

Supabase → Storage → New Bucket:
- **Name:** `employee-profiles`
- **Public:** YES ✅
- **Size limit:** 5 MB

### Add Policies:
```sql
-- Public Read
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'employee-profiles');

-- Authenticated Upload
CREATE POLICY "Authenticated Upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');
```

---

## 🌱 Seed Sample Data

```bash
cd unrehrms
bun run seed
```

This creates:
- 20 sample employees
- 8 departments
- 10 leave requests
- 100 attendance records
- 20 salary slips

---

## ✅ Verification Checklist

**Database:**
- [ ] Project created on Supabase
- [ ] `.env.local` configured with keys
- [ ] 8 migrations executed successfully
- [ ] 50+ tables visible in Table Editor
- [ ] Storage bucket created

**Application:**
- [ ] Dev server running (`bun run dev`)
- [ ] Dashboard loads without errors
- [ ] Employee data showing
- [ ] No "undefined" values

**Test Query:**
```sql
-- Should return 20 employees after seeding
SELECT COUNT(*) FROM employees;
```

---

## 🔧 Common Issues & Quick Fixes

**Issue:** "Invalid API key"
```bash
# Fix: Check .env.local has correct format (no spaces, no quotes)
```

**Issue:** "Table already exists"
```bash
# Fix: Use IF NOT EXISTS in migrations (already included)
```

**Issue:** Seed fails
```bash
# Fix: Clear tables first
TRUNCATE employees, departments CASCADE;
bun run seed
```

**Issue:** RLS blocking queries
```sql
-- Fix: Disable RLS for development
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
```

---

## 🚀 Next Steps After Setup

1. **Test the app** - Browse all modules
2. **Add authentication** - Enable Supabase Auth
3. **Import real data** - Replace sample data
4. **Deploy** - Push to Netlify/Vercel
5. **Configure RLS** - Secure production data

---

## 📋 Migration Order (Important!)

Run in this exact order:
```
001 → Foundation (faculties, departments, employees)
002 → Payroll (salary, pay runs, components)
003 → Tax Tables (PNG tax rates)
004 → Super Schemes (superannuation)
005 → Emergency & Docs (contacts, documents)
006 → Core HRMS (comprehensive tables)
007 → Performance & Learning (goals, training)
008 → Relations & Safety (grievances, incidents)
```

---

## 💡 Pro Tips

1. **Copy .env.example** first:
   ```bash
   cp .env.example .env.local
   ```

2. **Use Supabase CLI** (advanced):
   ```bash
   npx supabase db push
   ```

3. **Backup before seeding**:
   - Export schema in Supabase dashboard
   - Save before running seed script

4. **Monitor logs**:
   - Supabase → Logs → Check for errors
   - Terminal → Watch for connection issues

---

## 📞 Support

**Supabase Issues:** https://github.com/supabase/supabase/discussions
**HRMS Docs:** See `.same/` folder for full documentation
**Migration Files:** `supabase/migrations/` directory

---

**Quick Reference Created:** Dec 18, 2025
**Version:** 1.0.0
**Database:** PostgreSQL 15 (Supabase)
