# 🚀 Apply Database Migrations - Quick Start

## Step 1: Open Supabase SQL Editor

**Click this link:** [Supabase SQL Editor](https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql/new)

## Step 2: Apply Migration 001 (Foundation Tables) ⚠️ IMPORTANT

1. Click **"New Query"** in Supabase SQL Editor
2. Open file: `supabase/migrations/001_foundation_tables.sql`
3. **Copy ALL content** (Ctrl+A, Ctrl+C)
4. **Paste into SQL Editor** (Ctrl+V)
5. Click **"RUN"** button (bottom right)
6. Wait for "Success" message

**Expected:** Creates faculties, positions, academic_ranks, employment_types

---

## Step 3: Apply Migration 002 (Payroll System)

1. Click **"New Query"** again
2. Open file: `supabase/migrations/002_payroll_system.sql`
3. **Copy ALL content** (Ctrl+A, Ctrl+C)
4. **Paste into SQL Editor** (Ctrl+V)
5. Click **"RUN"** button (bottom right)
6. Wait for "Success" message

**Expected:** Creates 13 payroll tables

---

## Step 4: Apply Migration 003 (PNG Tax)

1. Click **"New Query"** again
2. Open file: `supabase/migrations/003_png_tax_tables.sql`
3. **Copy ALL content**
4. **Paste into SQL Editor**
5. Click **"RUN"**
6. You should see tax calculation test output in results

**Expected:** Creates 6 tax tables + seeds 2025 PNG tax brackets

---

## Step 5: Apply Migration 004 (Superannuation)

1. Click **"New Query"** again
2. Open file: `supabase/migrations/004_super_schemes.sql`
3. **Copy ALL content**
4. **Paste into SQL Editor**
5. Click **"RUN"**
6. You should see super calculation test output

**Expected:** Creates 6 super tables + seeds Nambawan & NASFUND

---

## Step 6: Verify Migrations

Run this command in your terminal:

```bash
cd png-unre-hrms-web
bun --env-file=.env.local scripts/verify-migrations.ts
```

**You should see:**
- ✅ 26 new tables created
- ✅ PNG tax brackets seeded (6 brackets)
- ✅ Super schemes seeded (Nambawan, NASFUND)

---

## ✅ Success Checklist

After all migrations:

- [ ] Foundation tables created (faculties, positions, ranks)
- [ ] 13 payroll tables created
- [ ] 6 tax tables created
- [ ] 6 super tables created
- [ ] 2025 PNG tax brackets seeded
- [ ] Nambawan & NASFUND schemes seeded
- [ ] Academic ranks seeded (Tutor → Professor)
- [ ] Employment types seeded
- [ ] Sample positions seeded
- [ ] Verification script passes 100%

---

## 🆘 If You Get Errors

### "Table already exists"
 This is NORMAL - the migrations use `IF NOT EXISTS`
 Just continue, it will skip existing tables

### "Permission denied"
 Make sure you're logged into Supabase dashboard
 Try refreshing the page

### "Function already exists"
 Safe to ignore - functions will be updated

---

## 📞 Need Help?

1. Take a screenshot of any error
2. Check the error message
3. Most common fix: Try running the query again

---

## Next Steps After Migrations

Once all 3 migrations are applied successfully:

1. ✅ Verify tables (run verification script)
2. 🔄 Seed master data (salary components, leave types)
3. 🔄 Build payroll UI
4. 🔄 Test payroll processing

**Total time:** ~5 minutes to apply all migrations
