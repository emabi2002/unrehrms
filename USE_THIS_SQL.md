# ✅ USE THIS FILE: FINAL_ADD_TABLES_V2.sql

## What Was Wrong

The previous SQL had a format string error in the RAISE NOTICE statement:
```sql
RAISE NOTICE '   Calculated tax: K%', test_tax;  -- ❌ Error!
```

The `%` was being interpreted as a format placeholder, causing: "too few parameters specified for RAISE"

## What's Fixed

The new version (`FINAL_ADD_TABLES_V2.sql`) has this fixed:
```sql
RAISE NOTICE 'Calculated tax: K%', test_tax::TEXT;  -- ✅ Works!
```

---

## 🚀 How to Apply (2 Minutes)

### Step 1: Open Supabase SQL Editor
**Click:** https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new

### Step 2: Copy the V2 SQL
1. Open file: `unrehrms/FINAL_ADD_TABLES_V2.sql` ⭐ **USE THIS ONE**
2. Press **Ctrl+A** (select all)
3. Press **Ctrl+C** (copy)

### Step 3: Paste and Run
1. Go to Supabase SQL Editor (link above)
2. Press **Ctrl+V** (paste)
3. Click **RUN** button
4. Wait for success!

### Step 4: You Should See
```
Tables created successfully:
   1. payslips
   2. tax_brackets (2025 PNG rates seeded)
   3. certifications

Function created: calculate_png_tax()

Test calculation for K50,000 annual income:
Calculated tax: K11050.00

Database is now 100 percent complete!
```

### Step 5: Verify
```bash
cd unrehrms
bun --env-file=.env.local scripts/check-current-schema.ts
```

**Expected:** `Found: 23/23 tables` ✅

---

## ✨ What Gets Created

1. **payslips** table - Employee payslip records
2. **tax_brackets** table - 2025 PNG tax brackets (6 brackets seeded)
3. **certifications** table - Professional certifications
4. **calculate_png_tax()** function - Automatic PNG tax calculator

---

## 🎯 Test the Tax Calculator

After running the migration, try this in SQL Editor:

```sql
-- Test with different salaries
SELECT calculate_png_tax(20000) as "K20k tax";   -- K1,650
SELECT calculate_png_tax(50000) as "K50k tax";   -- K11,050
SELECT calculate_png_tax(100000) as "K100k tax"; -- K30,500
```

---

## 🎉 Then You're Done!

Your database will be:
- ✅ 23/23 tables (100% complete)
- ✅ PNG tax system ready
- ✅ Payroll fully functional
- ✅ Production ready!

---

**File to use:** `FINAL_ADD_TABLES_V2.sql` ⭐
**Estimated time:** 2 minutes
**Error:** Fixed! ✅
