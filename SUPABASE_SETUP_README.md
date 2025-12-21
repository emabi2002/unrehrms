# 🚀 Supabase Database Setup - Start Here!

## Welcome to PNG UNRE HRMS Database Configuration

This guide will help you connect your HRMS application to Supabase in **15-20 minutes**.

---

## 📚 Available Documentation

We've created **comprehensive guides** to help you:

### 🎯 Quick Start (Recommended)
**File:** `.same/quick-setup-reference.md`
- 3-step quick start guide
- Perfect for experienced developers
- Get up and running in 15 minutes

### 📖 Complete Setup Guide
**File:** `.same/supabase-setup-guide.md`
- Detailed step-by-step instructions
- Beginner-friendly with screenshots
- Covers every aspect of setup
- Includes verification steps

### ✅ Interactive Checklist
**File:** `.same/setup-checklist.md`
- Track your progress with checkboxes
- 8-part comprehensive checklist
- Includes troubleshooting for each step
- Perfect for first-time setup

### 🔧 Troubleshooting Guide
**File:** `.same/database-connection-help.md`
- 10 common issues with solutions
- FAQ section
- Diagnostic commands
- Prevention tips

### 📦 Complete Migration File
**File:** `.same/complete_migration.sql`
- All 8 migrations combined into one file
- Just copy and paste into Supabase SQL Editor
- Creates all 50+ tables at once

---

## ⚡ Super Quick Setup (3 Steps)

### Step 1: Create Supabase Project
1. Go to https://supabase.com → **New Project**
2. Name: `png-unre-hrms`
3. Region: **Singapore** (ap-southeast-1)

### Step 2: Configure Environment
Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get keys from: **Supabase Dashboard → Settings → API**

### Step 3: Run Migration
1. Supabase → **SQL Editor** → **New query**
2. Copy content from: `.same/complete_migration.sql`
3. Paste and click **Run**
4. Wait ~30 seconds for completion

**Done! ✅**

Optional: Run `bun run seed` to add sample data

---

## 📊 What Gets Created

After setup, you'll have:

### Database Tables (50+)
- ✅ **Core HR:** employees, departments, positions, faculties
- ✅ **Payroll:** payroll_runs, salary_slips, pay_components
- ✅ **Tax:** tax_tables (PNG tax rates), super_schemes
- ✅ **Leave:** leave_requests, leave_types, leave_balances
- ✅ **Attendance:** attendance, shifts, overtime_requests
- ✅ **Performance:** performance_goals, appraisals, reviews
- ✅ **Learning:** training_courses, certifications, skills
- ✅ **Recruitment:** job_postings, applications, interviews
- ✅ **Benefits:** benefit_plans, enrollments, dependants
- ✅ **Relations:** grievances, disciplinary_actions, incidents
- ✅ **And 30+ more comprehensive tables!**

### Sample Data (After Seeding)
- 20 employees (PNG University staff)
- 8 departments
- 10 leave requests
- 100 attendance records
- 20 salary slips

---

## 🗺️ Setup Path (Choose Your Level)

### For Beginners 👶
**Follow:** `.same/setup-checklist.md`
- Step-by-step with progress tracking
- Includes screenshots and examples
- Interactive checkboxes

### For Experienced Developers 🚀
**Follow:** `.same/quick-setup-reference.md`
- Quick 3-step process
- Command-line friendly
- Minimal explanations

### For Detailed Understanding 📚
**Follow:** `.same/supabase-setup-guide.md`
- Comprehensive 9-part guide
- Explains every detail
- Best practices included

---

## 🔧 If Something Goes Wrong

### Common Issues
1. **"Invalid API key"** → Check `.env.local` format
2. **"Table not found"** → Run migrations
3. **"RLS error"** → Disable RLS for development
4. **Seed fails** → Clear tables and re-run

**Full Solutions:** See `.same/database-connection-help.md`

---

## 📁 File Structure

```
unrehrms/
├── .env.local                    ← CREATE THIS (your keys)
├── SUPABASE_SETUP_README.md     ← YOU ARE HERE
├── .same/
│   ├── quick-setup-reference.md  ← Quick start
│   ├── supabase-setup-guide.md   ← Complete guide
│   ├── setup-checklist.md        ← Interactive checklist
│   ├── database-connection-help.md ← Troubleshooting
│   └── complete_migration.sql    ← All migrations combined
└── supabase/
    └── migrations/
        ├── 001_foundation_tables.sql
        ├── 002_payroll_system.sql
        ├── 003_png_tax_tables.sql
        ├── 004_super_schemes.sql
        ├── 005_emergency_contacts_and_documents_FIXED.sql
        ├── 006_comprehensive_hrms_tables_FINAL.sql
        ├── 007_hrms_performance_learning_benefits_FIXED.sql
        └── 008_hrms_relations_safety_admin_FIXED.sql
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Supabase project created and active
- [ ] `.env.local` file exists with 3 variables
- [ ] All 8 migrations executed successfully
- [ ] 50+ tables visible in Supabase Table Editor
- [ ] Sample data seeded (20 employees)
- [ ] Dev server runs without errors
- [ ] Dashboard shows real employee data
- [ ] No "undefined" or connection errors

### Quick Test Query
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM employees;
-- Should return 20 (after seeding)
```

---

## 🎯 Next Steps After Setup

1. ✅ **Test the application** - Browse all modules
2. ✅ **Review the data** - Check employees, departments
3. ✅ **Enable authentication** - Supabase Auth setup
4. ✅ **Import real data** - Replace sample employees
5. ✅ **Configure RLS** - Set up row-level security
6. ✅ **Deploy** - Push to Netlify/Vercel

---

## 📞 Getting Help

### Documentation Locations
- **Quick Reference:** `.same/quick-setup-reference.md`
- **Full Guide:** `.same/supabase-setup-guide.md`
- **Checklist:** `.same/setup-checklist.md`
- **Troubleshooting:** `.same/database-connection-help.md`

### External Resources
- **Supabase Docs:** https://supabase.com/docs
- **Supabase Discord:** https://discord.supabase.com
- **Project Issues:** GitHub Issues

---

## 💡 Pro Tips

1. **Use the consolidated migration file** (`.same/complete_migration.sql`)
   - Saves time - one copy/paste instead of 8
   - Guaranteed correct order
   - Creates everything at once

2. **Keep your keys secure**
   - Never commit `.env.local`
   - Don't share service role key
   - Regenerate if exposed

3. **Start with Free Tier**
   - 500 MB database (plenty for development)
   - 1 GB file storage
   - Upgrade when needed

4. **Backup before experimenting**
   - Export schema in Supabase dashboard
   - Save before running seed script
   - Test on separate project first

---

## 🎉 Success Metrics

You'll know setup is successful when:

✅ Dashboard loads in < 2 seconds
✅ Employee list shows 20 PNG University staff
✅ Leave requests display correctly
✅ Attendance records populate
✅ Payroll data is visible
✅ No console errors
✅ All features navigate smoothly

---

## 📊 What's Included in the Database

### Comprehensive HRMS Schema

**15 Major Modules:**
1. Core HR & Employee Management
2. Recruitment & Talent Acquisition
3. Onboarding & Offboarding
4. Time & Attendance
5. Leave Management
6. Payroll (PNG Tax Compliant)
7. Benefits & Compensation
8. Performance Management
9. Learning & Development
10. Talent Management
11. Employee Relations
12. Health & Safety
13. Travel & Expense
14. Reports & Analytics
15. System Administration

**Total: 50+ tables, 200+ columns, Full referential integrity**

---

## 🌟 Ready to Begin?

**Choose your path:**

👉 **Quick Setup (15 min):** Open `.same/quick-setup-reference.md`
👉 **Detailed Guide (20 min):** Open `.same/supabase-setup-guide.md`
👉 **Interactive Checklist:** Open `.same/setup-checklist.md`

---

**Version:** 1.0.0
**Last Updated:** December 18, 2025
**Maintained By:** PNG UNRE HRMS Team
**Database:** Supabase (PostgreSQL 15)

---

## 🚀 Let's Get Started!

Pick a guide above and begin your setup journey.
All documentation is located in the `.same/` folder.

**Good luck! 🎓**
