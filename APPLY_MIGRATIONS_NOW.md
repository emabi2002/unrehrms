# 🚀 APPLY DATABASE MIGRATIONS - QUICK GUIDE
**PNG UNRE HRMS - Complete in 10 Minutes**

---

## ✅ Prerequisites Complete!
- ✓ Supabase credentials configured
- ✓ Development server running
- ✓ Database connection active

---

## 📋 Apply All 8 Migrations

### 🔗 Open Supabase SQL Editor
**Click here:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new

### Migration Order (IMPORTANT: Do in this exact order!)

---

## **MIGRATION 1: Foundation Tables** ⭐

**File:** `supabase/migrations/001_foundation_tables.sql`

**What it creates:**
- Faculties (5 university faculties)
- Departments structure
- Academic ranks (Tutor → Professor)
- Employment types (Permanent, Contract, etc.)
- Positions and job grades
- Updates employee table structure

**Steps:**
1. Open the file `supabase/migrations/001_foundation_tables.sql`
2. Press **Ctrl+A** to select all
3. Press **Ctrl+C** to copy
4. Go to Supabase SQL Editor (link above)
5. Press **Ctrl+V** to paste
6. Click **RUN** button (bottom right)
7. Wait for "Success. No rows returned"

✅ **Expected:** ~50-100 rows affected, several tables created

---

## **MIGRATION 2: Payroll System** 💰

**File:** `supabase/migrations/002_payroll_system.sql`

**What it creates:**
- Salary structures (13 new tables!)
- Pay periods & pay runs
- Payslip generation
- Salary components (earnings/deductions)
- Bank export functionality
- BSP bank file format

**Steps:**
1. Click **"New Query"** in Supabase
2. Open `supabase/migrations/002_payroll_system.sql`
3. Copy all content (Ctrl+A, Ctrl+C)
4. Paste in SQL Editor (Ctrl+V)
5. Click **RUN**

✅ **Expected:** 13 tables created, sample salary structure added

---

## **MIGRATION 3: PNG Tax Tables** 🇵🇬

**File:** `supabase/migrations/003_png_tax_tables.sql`

**What it creates:**
- 2025 PNG tax brackets (0% to 42%)
- Tax calculation functions
- PAYE tables
- Tax declaration tracking
- Monthly & fortnightly tax calculations

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/003_png_tax_tables.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** Tax calculation function created, 2025 brackets seeded

---

## **MIGRATION 4: Superannuation Schemes** 🏦

**File:** `supabase/migrations/004_super_schemes.sql`

**What it creates:**
- Super scheme management (6 tables)
- Nambawan Super (pre-configured 8.4%)
- NASFUND (pre-configured 8.4%)
- Employee contributions tracking
- Salary sacrifice support
- Super payment batches

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/004_super_schemes.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** Super schemes created with Nambawan & NASFUND data

---

## **MIGRATION 5: Documents & Emergency Contacts** 📄

**File:** `supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql`

**What it creates:**
- Employee documents management
- File storage structure
- Document expiry tracking
- Emergency contacts (multiple per employee)
- Primary contact designation

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** Document and emergency contact tables created

---

## **MIGRATION 6: Comprehensive HRMS Tables** 🏢

**File:** `supabase/migrations/006_comprehensive_hrms_tables_FINAL.sql`

**What it creates:**
- Leave types & leave management
- Leave balances & entitlements
- Attendance tracking
- Shift management
- Overtime requests
- Public holidays
- Job families & grades
- Work locations
- Recruitment (requisitions, candidates, applications, interviews)

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/006_comprehensive_hrms_tables_FINAL.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** ~15 tables created for core HR operations

---

## **MIGRATION 7: Performance, Learning & Benefits** 📚

**File:** `supabase/migrations/007_hrms_performance_learning_benefits_FIXED.sql`

**What it creates:**
- Performance goals
- Performance reviews & cycles
- 360° feedback
- Performance improvement plans
- Training courses & sessions
- Training enrollments
- Certifications & skills
- Benefits plans & enrollments
- Dependant management

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/007_hrms_performance_learning_benefits_FIXED.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** Performance, training & benefits tables created

---

## **MIGRATION 8: Relations, Safety & Admin** 🛡️

**File:** `supabase/migrations/008_hrms_relations_safety_admin_FIXED.sql`

**What it creates:**
- Employee grievances
- Disciplinary actions
- Workplace incidents
- Safety incidents & audits
- Medical checkups
- Wellness programs
- Travel requests
- Expense claims
- System audit logs
- User roles & permissions

**Steps:**
1. Click **"New Query"**
2. Open `supabase/migrations/008_hrms_relations_safety_admin_FIXED.sql`
3. Copy all (Ctrl+A, Ctrl+C)
4. Paste (Ctrl+V)
5. Click **RUN**

✅ **Expected:** Final set of tables for complete HRMS

---

## ✅ Verification

### Check Tables Were Created

1. Go to: https://app.supabase.com/project/qltnmteqivrnljemyvvb/editor
2. You should see **~42 tables** in the left sidebar

**Look for these key tables:**
- ✅ faculties
- ✅ departments
- ✅ employees
- ✅ academic_ranks
- ✅ employment_types
- ✅ positions
- ✅ leave_types
- ✅ leave_requests
- ✅ leave_balances
- ✅ attendance
- ✅ salary_structures
- ✅ pay_periods
- ✅ payslips
- ✅ tax_brackets
- ✅ super_schemes
- ✅ candidates
- ✅ applications
- ✅ performance_goals
- ✅ training_courses
- ✅ certifications

### Quick SQL Check

Run this in SQL Editor:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

You should see ~42 tables listed!

---

## 🌱 Next: Seed Sample Data

After all migrations are applied, add sample data:

### Option 1: Run Seed Script (Recommended)

```bash
bun run seed
```

This adds:
- 5 sample employees
- Leave types (Annual, Sick, Maternity, etc.)
- Academic ranks
- Employment types
- Departments
- Sample attendance records

### Option 2: Manual via Dashboard

1. Go to Table Editor
2. Select a table (e.g., `employees`)
3. Click "Insert row"
4. Fill in data
5. Save

---

## 🎉 Success Indicators

Once migrations are complete:

1. **Go to:** http://localhost:3000/dashboard/employees
2. **Expected:**
   - Page loads without errors
   - Shows "No employees found" OR
   - Shows sample employees if you ran seed script

3. **Test Create:**
   - Click "Add Employee"
   - Fill in form
   - Submit
   - Employee appears in list ✅

---

## 🐛 Troubleshooting

### "relation already exists"
**This is NORMAL!** Migrations use `CREATE TABLE IF NOT EXISTS`.
Just means table is already there. Continue with next migration.

### Error: "permission denied"
1. Make sure you're logged into Supabase dashboard
2. Refresh the page
3. Try again

### Error: "syntax error"
1. Make sure you copied the ENTIRE file content
2. Check you didn't accidentally copy any extra text
3. Try copying again

### No tables showing
1. Check you ran ALL 8 migrations in order
2. Look for error messages in SQL Editor output
3. Check each migration showed "Success"

---

## 📞 Quick Links

- **SQL Editor:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new
- **Table Editor:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/editor
- **API Settings:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/settings/api
- **Local App:** http://localhost:3000/dashboard

---

## ⏱️ Total Time: ~10 Minutes

- Migration 1: 1 min
- Migration 2: 1 min
- Migration 3: 1 min
- Migration 4: 1 min
- Migration 5: 1 min
- Migration 6: 2 min
- Migration 7: 1 min
- Migration 8: 1 min
- Verification: 1 min

**Then your HRMS is LIVE!** 🚀
