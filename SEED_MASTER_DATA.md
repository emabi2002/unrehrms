# 🌱 Seed Payroll Master Data

## ✅ SCHEMA FIXED - Ready to Seed!

The seed file has been updated to match your actual database schema.

## Quick Start (2 minutes)

### Step 1: Open Supabase SQL Editor

**Click here:** [Supabase SQL Editor](https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql/new)

### Step 2: Run the Seed SQL

1. Click **"New Query"** in SQL Editor
2. Open file: `supabase/seed-data.sql` in your code editor
3. **Copy ALL content** (Ctrl+A, Ctrl+C in the file)
4. **Paste into Supabase SQL Editor** (Ctrl+V)
5. Click **"RUN"** button (bottom right)

⚠️ **Fixed:** Salary components now use correct schema (component_category, is_fixed, calculation_formula)

### Step 3: Verify Results

You should see output like:

```
✅ MASTER DATA SEEDING COMPLETE

PNG Tax Brackets (2025):    6 brackets
Superannuation Schemes:     2 schemes
Salary Components:          14 components

🎉 All master data seeded successfully!

Next steps:
  1. Create salary structures
  2. Assign employee salaries
  3. Process payroll runs
```

**AND** tax calculation tests:

```
🧪 TESTING PNG TAX CALCULATIONS

Bracket 2 | Tax: K550.00 | Effective Rate: 3.67%
Bracket 4 | Tax: K18,500.00 | Effective Rate: 23.21%
Bracket 5 | Tax: K24,250.00 | Effective Rate: 28.53%
Bracket 5 | Tax: K50,500.00 | Effective Rate: 33.67%
```

---

## What Gets Seeded?

### 1. PNG Tax Brackets (2025) - 6 Brackets

| Bracket | Income Range | Tax Rate | Base Tax |
|---------|--------------|----------|----------|
| 1 | K0 - K12,500 | 0% | K0 |
| 2 | K12,501 - K20,000 | 22% | K0 |
| 3 | K20,001 - K33,000 | 30% | K1,650 |
| 4 | K33,001 - K70,000 | 35% | K5,550 |
| 5 | K70,001 - K250,000 | 40% | K18,500 |
| 6 | K250,001+ | 42% | K90,500 |

### 2. Superannuation Schemes - 2 Funds

- **Nambawan Super** - 8.4% employer contribution
- **NASFUND** - 8.4% employer contribution

### 3. Salary Components - 14 Components

**Earnings (7):**
- Basic Salary
- Housing Allowance
- Transport Allowance
- Academic Load Allowance
- Research Allowance
- Acting Allowance
- Overtime Pay

**Deductions (7):**
- Income Tax (PAYE)
- Superannuation (Employer)
- Superannuation (Employee)
- Salary Sacrifice
- Loan Repayment
- Salary Advance
- Garnishment

### 4. Configuration Settings

- Tax configuration (5 settings)
- Super configuration (4 settings)
- Tax exemptions (2 types)

---

## Troubleshooting

### "Table already has data"
✅ **This is fine!** The seed script uses `ON CONFLICT ... DO UPDATE` to safely update existing data.

### "Duplicate key value violates unique constraint"
✅ **Also fine!** This means data already exists. The script will skip duplicates.

### No output visible
⚠️ Check the "Messages" tab in SQL Editor - output appears there, not in "Results" tab.

---

## Verify Seed Data (Optional)

Run this in your terminal:

```bash
cd png-unre-hrms-web
bun run scripts/check-seed-data.ts
```

Expected output:

```
🔍 Checking Seed Data...

📊 PNG Tax Brackets (2025):
   ✅ Found 6 tax brackets
   1. K0 - K12,500 @ 0%
   2. K12,500.01 - K20,000 @ 22%
   3. K20,000.01 - K33,000 @ 30%
   4. K33,000.01 - K70,000 @ 35%
   5. K70,000.01 - K250,000 @ 40%
   6. K250,000.01 - and above @ 42%

💰 Superannuation Schemes:
   ✅ Found 2 schemes
   - Nambawan Super (8.4% employer)
   - NASFUND (8.4% employer)

🎓 Foundation Data:
   ✅ Faculties: 5
   ✅ Academic Ranks: 6
   ✅ Employment Types: 7
   ✅ Positions: 12

============================================================
✅ All seed data loaded successfully!
```

---

## What's Next?

After seeding master data, you can:

### 1. Create Salary Structures ⏳
Define standard salary packages for different positions

### 2. Assign Employee Salaries ⏳
Link employees to salary structures

### 3. Process Payroll Runs ⏳
Generate payslips with automatic PNG tax & super calculations

### 4. Export to BSP ⏳
Generate bank files for salary payments

---

## Need Help?

### Schema Cache Issues?
If you get "table not found" errors when trying to query data:
- Wait 2 minutes (Supabase auto-refreshes schema every 60-120 seconds)
- Or restart your dev server: `bun run dev`

### Still Having Issues?
1. Take a screenshot of the error
2. Check the SQL Editor "Messages" tab
3. Make sure all 4 migrations were applied first (001, 002, 003, 004)

---

**Time to complete:** ~2 minutes
**Prerequisites:** Migrations 001-004 applied
**Next step:** Build payroll UI
