# Database Migration Guide

## How to Apply Migrations to Supabase

### Option 1: Using Supabase Dashboard (RECOMMENDED)

1. **Go to Supabase SQL Editor**
   - Visit: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb
   - Click **SQL Editor** in the left sidebar
   - Click **New Query**

2. **Apply Migration 002: Payroll System**
   - Copy the contents of `supabase/migrations/002_payroll_system.sql`
   - Paste into the SQL Editor
   - Click **Run** button
   - Wait for success message
   - You should see: "Success. No rows returned"

3. **Apply Migration 003: PNG Tax Tables**
   - Click **New Query** again
   - Copy the contents of `supabase/migrations/003_png_tax_tables.sql`
   - Paste into the SQL Editor
   - Click **Run**
   - Check for test output showing tax calculations

4. **Apply Migration 004: Superannuation Schemes**
   - Click **New Query** again
   - Copy the contents of `supabase/migrations/004_super_schemes.sql`
   - Paste into the SQL Editor
   - Click **Run**
   - Check for test output showing super calculations

### Option 2: Using Supabase CLI (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref qltnmteqivrnljemyvvb

# Apply migrations
supabase db push
```

### Option 3: Manual SQL Execution

If you prefer, I can break down the migrations into smaller chunks and apply them programmatically.

---

## Verification Steps

After applying migrations, verify the tables were created:

1. Go to **Table Editor** in Supabase
2. You should see these new tables:
   - salary_structures
   - salary_components
   - pay_periods
   - pay_runs
   - payslip_details
   - png_tax_brackets
   - super_schemes
   - super_contributions
   - (and many more)

3. Run this verification script:
```bash
bun run scripts/verify-migrations.ts
```

---

## Troubleshooting

### If you get errors about existing tables:
- Some tables may already exist
- The migrations use `CREATE TABLE IF NOT EXISTS`
- This is safe and expected

### If you get permission errors:
- Make sure you're using the service role key
- Check that RLS is properly configured

### If functions fail:
- PostgreSQL functions require plpgsql language
- Make sure extensions are enabled

---

## Next Steps After Migrations

1. ✅ Verify all tables created
2. 🔄 Seed master data
3. 🔄 Build payroll UI
4. 🔄 Test payroll processing

