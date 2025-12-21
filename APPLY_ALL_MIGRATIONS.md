# 🚀 Apply All Database Migrations
## Complete Guide to Set Up Your Comprehensive HRMS Database

**Your Supabase:** https://qltnmteqivrnljemyvvb.supabase.co
**Status:** Ready to apply migrations
**Total Tables to Create:** 60+ tables for all 16 HRMS modules

---

## ⚠️ IMPORTANT: Backup First!

1. Go to: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/database/backups
2. Click: "Create backup now"
3. Wait for backup to complete ✅

---

## 📋 Migrations Overview

You have **4 migration files** to apply in sequence:

1. **005_emergency_contacts_and_documents.sql** (Phase 1 - Already Created)
   - Emergency contacts table
   - Employee documents table
   - Document types (18 pre-configured)
   - Enhanced employees table

2. **006_comprehensive_hrms_tables.sql** (NEW - Core Modules)
   - Positions, Locations, Job Families, Job Grades
   - Recruitment (Requisitions, Postings, Candidates, Interviews, Offers)
   - Onboarding (Checklists, Probation, Resignations, Exit)
   - Time & Attendance (Shifts, Rosters, Overtime, Timesheets)
   - Leave Types

3. **007_hrms_performance_learning_benefits.sql** (NEW - Performance & Learning)
   - Performance Goals, Appraisals, 360° Feedback
   - Training Courses, Sessions, Enrollments
   - Employee Certifications, Skills
   - Benefit Plans, Enrollments
   - Talent Profiles, Succession Planning

4. **008_hrms_relations_safety_admin.sql** (NEW - Relations & Admin)
   - Grievances, Disciplinary Actions
   - Safety Incidents, Audits, Medical Checkups
   - Travel Requests, Expense Claims
   - User Roles, Permissions, Audit Logs
   - System Settings, Public Holidays

---

## 🛠️ Method 1: Supabase Dashboard (Recommended)

### Step 1: Open SQL Editor
1. Go to: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb
2. Click: **Database** → **SQL Editor**
3. Click: **New query**

### Step 2: Apply Migration 005
```
File: unrehrms/supabase/migrations/005_emergency_contacts_and_documents.sql
```

1. Open the file in your code editor
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click: **Run** (or Ctrl+Enter)
5. Wait for success message ✅

**Verify:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('emergency_contacts', 'employee_documents', 'document_types');
```
Should return 3 rows.

### Step 3: Apply Migration 006
```
File: unrehrms/supabase/migrations/006_comprehensive_hrms_tables.sql
```

1. Open the file in your code editor
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)
3. Paste into a **New query** in Supabase SQL Editor
4. Click: **Run** (or Ctrl+Enter)
5. Wait for success message ✅

**Verify:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('positions', 'job_requisitions', 'candidates', 'overtime_requests');
```
Should return 4 rows.

### Step 4: Apply Migration 007
```
File: unrehrms/supabase/migrations/007_hrms_performance_learning_benefits.sql
```

1. Open the file
2. Copy ALL contents
3. Paste into new query
4. Run
5. Verify ✅

**Verify:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('performance_goals', 'appraisals', 'training_courses', 'benefit_plans');
```
Should return 4 rows.

### Step 5: Apply Migration 008
```
File: unrehrms/supabase/migrations/008_hrms_relations_safety_admin.sql
```

1. Open the file
2. Copy ALL contents
3. Paste into new query
4. Run
5. Verify ✅

**Verify:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('grievances', 'safety_incidents', 'travel_requests', 'user_roles');
```
Should return 4 rows.

---

## 📊 Final Verification

After applying ALL migrations, run this comprehensive check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**You should see 60+ tables including:**

### Core HR (15 tables)
- employees ✅ (already exists)
- emergency_contacts ✅
- employee_documents ✅
- document_types ✅
- departments ✅ (already exists)
- positions ✅ NEW
- work_locations ✅ NEW
- job_families ✅ NEW
- job_grades ✅ NEW

### Recruitment (6 tables)
- job_requisitions ✅ NEW
- job_postings ✅ NEW
- candidates ✅ NEW
- applications ✅ NEW
- interviews ✅ NEW
- offers ✅ NEW

### Onboarding/Offboarding (6 tables)
- onboarding_checklists ✅ NEW
- probation_reviews ✅ NEW
- resignations ✅ NEW
- exit_interviews ✅ NEW
- exit_clearances ✅ NEW

### Time & Attendance (6 tables)
- attendance ✅ (already exists)
- shifts ✅ NEW
- rosters ✅ NEW
- overtime_requests ✅ NEW
- timesheets ✅ NEW
- timesheet_entries ✅ NEW

### Leave (2 tables)
- leave_requests ✅ (already exists)
- leave_types ✅ NEW

### Payroll (Already exists - 12 tables)
- All payroll tables ✅

### Performance (4 tables)
- performance_goals ✅ NEW
- appraisal_cycles ✅ NEW
- appraisals ✅ NEW
- feedback_360 ✅ NEW

### Learning (5 tables)
- training_courses ✅ NEW
- training_sessions ✅ NEW
- training_enrollments ✅ NEW
- employee_certifications ✅ NEW
- employee_skills ✅ NEW

### Benefits (2 tables)
- benefit_plans ✅ NEW
- benefit_enrollments ✅ NEW

### Talent (3 tables)
- talent_profiles ✅ NEW
- critical_positions ✅ NEW
- succession_plans ✅ NEW

### Employee Relations (3 tables)
- grievances ✅ NEW
- disciplinary_actions ✅ NEW
- workplace_incidents ✅ NEW

### Health & Safety (4 tables)
- safety_incidents ✅ NEW
- safety_audits ✅ NEW
- medical_checkups ✅ NEW
- wellness_programs ✅ NEW

### Travel & Expense (3 tables)
- travel_requests ✅ NEW
- expense_claims ✅ NEW
- expense_line_items ✅ NEW

### System Admin (5 tables)
- user_roles ✅ NEW
- user_permissions ✅ NEW
- audit_logs ✅ NEW
- system_settings ✅ NEW
- public_holidays ✅ NEW

---

## 🎯 Post-Migration Setup

### 1. Set Up Supabase Storage

Create the document storage bucket:

```
1. Go to: Storage → Create bucket
2. Name: employee-documents
3. Public: ❌ No (private)
4. File size limit: 10485760 (10MB)
```

Add Storage Policies:

```sql
-- Allow uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-documents');

-- Allow downloads
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents');
```

### 2. Verify System Settings

Check default settings were created:

```sql
SELECT * FROM system_settings ORDER BY category, setting_key;
```

Should see 8 default settings.

### 3. Verify User Roles

Check default roles were created:

```sql
SELECT * FROM user_roles ORDER BY role_level;
```

Should see 6 roles:
- Super Admin
- HR Admin
- HR Manager
- Finance Manager
- Line Manager
- Employee

### 4. Verify Public Holidays

Check 2025 PNG holidays were created:

```sql
SELECT * FROM public_holidays WHERE year = 2025 ORDER BY holiday_date;
```

Should see 9 holidays.

---

## ✅ Success Checklist

After applying all migrations:

- [ ] All 4 migration files applied successfully
- [ ] 60+ tables created
- [ ] No SQL errors in console
- [ ] Storage bucket created
- [ ] Storage policies added
- [ ] System settings verified (8 settings)
- [ ] User roles verified (6 roles)
- [ ] Public holidays verified (9 holidays)
- [ ] Database backup exists
- [ ] RLS policies enabled on all tables

---

## 🐛 Troubleshooting

### "Relation already exists" error
**Cause:** Table was already created in a previous attempt.
**Fix:** Skip that specific table creation or drop it first:
```sql
DROP TABLE IF EXISTS table_name CASCADE;
```

### "Permission denied" error
**Cause:** Using wrong API key.
**Fix:** Make sure you're using the **service_role_key** in Supabase dashboard (you're logged in as admin).

### "Syntax error" in SQL
**Cause:** Copy/paste issue or file encoding.
**Fix:** Re-copy the file contents, ensure UTF-8 encoding.

### Migration takes too long
**Cause:** Large migration file with many tables.
**Fix:** This is normal. Wait up to 2-3 minutes per migration.

---

## 🔄 Rollback (If Needed)

If something goes wrong, restore from your backup:

1. Go to: Database → Backups
2. Find your backup (created at start)
3. Click: **Restore**
4. Confirm

**Note:** This will restore the ENTIRE database to the backup state.

---

## 🎉 After Successful Migration

You now have a **complete enterprise-grade HRMS database** with:

- ✅ 60+ tables
- ✅ All 16 HRMS modules supported
- ✅ Row Level Security enabled
- ✅ Proper indexes for performance
- ✅ Foreign key relationships
- ✅ Default data (roles, settings, holidays)
- ✅ Audit trail capabilities

**Next Steps:**
1. Test the system by navigating through the new menus
2. Create test data for each module
3. Configure user roles and permissions
4. Customize system settings as needed

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Your Project:** https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb
- **Same Support:** support@same.new

---

**Estimated Time:** 30-45 minutes for all migrations
**Difficulty:** Medium
**Risk:** Low (backed up)

**Status:** Ready to apply! 🚀

---

*Last Updated: December 10, 2025*
*Total Migrations: 4 files*
*Total Tables: 60+*
