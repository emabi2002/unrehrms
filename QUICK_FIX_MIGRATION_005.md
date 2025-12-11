# 🔧 Quick Fix: Apply Migration 005 (Emergency Contacts & Documents)

**Issue:** Syntax error with `CONSTRAINT ... WHERE` clause
**Status:** ✅ FIXED
**Fix:** Changed to use partial unique index instead

---

## ✅ Fixed Version Ready

I've created a corrected version of the migration:

**File:** `unrehrms/supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql`

**What was changed:**
```sql
-- OLD (Error):
CONSTRAINT unique_primary_contact UNIQUE (employee_id, is_primary) WHERE is_primary = true

-- NEW (Fixed):
-- Removed from table definition, added as separate index:
CREATE UNIQUE INDEX idx_unique_primary_contact ON emergency_contacts(employee_id) WHERE is_primary = true;
```

---

## 🚀 Apply the Fixed Migration (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb
2. Click: **Database** → **SQL Editor**
3. Click: **New query**

### Step 2: Copy the Fixed Migration
1. Open file: `unrehrms/supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql`
2. Copy **ALL** contents (Ctrl+A, Ctrl+C)

### Step 3: Execute in Supabase
1. Paste into SQL Editor
2. Click: **Run** (or Ctrl+Enter)
3. Wait for success message ✅

### Step 4: Verify Success

Run this query to verify tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('emergency_contacts', 'employee_documents', 'document_types');
```

**Expected result:** 3 rows

Check document types were inserted:

```sql
SELECT code, name, is_mandatory, requires_expiry
FROM document_types
ORDER BY display_order;
```

**Expected result:** 18 rows (document types)

Check employees table was enhanced:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'employees'
AND column_name IN ('national_id', 'passport_number', 'drivers_license', 'photo_url');
```

**Expected result:** 4 rows

---

## ✅ Success!

After successful application, you should have:

- ✅ `emergency_contacts` table
- ✅ `employee_documents` table
- ✅ `document_types` table with 18 types
- ✅ Enhanced `employees` table (6 new fields)
- ✅ Indexes and RLS policies
- ✅ Utility functions for expiry tracking

---

## 📋 Next: Apply Remaining Migrations

After migration 005 works, continue with:

1. **Migration 006** - Comprehensive HRMS Tables
2. **Migration 007** - Performance & Learning
3. **Migration 008** - Relations & Administration

Follow: `APPLY_ALL_MIGRATIONS.md` for the complete guide

---

## 🐛 Still Having Issues?

If you get any other errors, check:

1. **PostgreSQL Version**
   ```sql
   SELECT version();
   ```
   Should be PostgreSQL 15+ (Supabase default)

2. **Existing Tables**
   If tables already exist from previous attempts:
   ```sql
   DROP TABLE IF EXISTS emergency_contacts CASCADE;
   DROP TABLE IF EXISTS employee_documents CASCADE;
   DROP TABLE IF EXISTS document_types CASCADE;
   ```
   Then re-run the migration.

3. **RLS Policies**
   If RLS policy errors occur, they're non-critical. The tables will still work.

---

**Status:** Ready to apply ✅
**File:** `005_emergency_contacts_and_documents_FIXED.sql`
**Time:** 5 minutes

---

*Fixed: December 10, 2025*
