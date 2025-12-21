# 🧪 Test the New Pages - Quick Guide

## 🎯 Quick Start (5 minutes)

### Prerequisites:
- ✅ Seed master data first (run `supabase/seed-data.sql`)
- ✅ Dev server running (`bun run dev`)

---

## 1️⃣ Test Tax Calculator (2 minutes)

### Navigate:
**URL:** `/dashboard/payroll/tax-calculator`

**Or:** Dashboard → Payroll → Tax Calculator

### Test Cases:

1. **Test Low Income (Tax-Free)**
   - Enter: `10000`
   - Click "Calculate" or press Enter
   - ✅ Should show: K0 tax (Bracket 1, 0% rate)

2. **Test Mid Income**
   - Click quick button: **K50k**
   - ✅ Should show: ~K11,500 tax (Bracket 4, 35% rate)
   - ✅ Monthly: ~K958
   - ✅ Fortnightly: ~K442

3. **Test High Income**
   - Click quick button: **K150k**
   - ✅ Should show: ~K50,500 tax (Bracket 5, 40% rate)
   - ✅ Effective rate: ~33.67%

4. **Verify Bracket Highlighting**
   - Enter different amounts
   - ✅ Check that correct bracket row is highlighted in green
   - ✅ Badge shows correct bracket number

### What to Look For:
- ✅ Calculator responds immediately
- ✅ All tax amounts are realistic
- ✅ Monthly = Annual / 12
- ✅ Fortnightly = Annual / 26
- ✅ Net income = Gross - Tax
- ✅ Bracket table highlights correctly
- ✅ No errors in console

---

## 2️⃣ Test Salary Structures (3 minutes)

### Navigate:
**URL:** `/dashboard/payroll/salary-structures`

**Or:** Dashboard → Payroll → Salary Structures

### Test Create:

1. **Click "Create Structure"**
   - Code: `STR-PROF`
   - Name: `Professor Salary Structure`
   - Description: `Standard salary for professors`
   - Position: Select "Professor" (if seeded)
   - Employment Type: `permanent`
   - Click "Create"

2. **Verify:**
   - ✅ Success toast appears
   - ✅ New structure appears in table
   - ✅ Status shows "Active" (green badge)
   - ✅ Position shows "Professor"

### Test Edit:

1. **Click Edit button (pencil icon)**
   - Change name to: `Professor Salary Package`
   - Click "Update"

2. **Verify:**
   - ✅ Success toast appears
   - ✅ Name updated in table

### Test Components View:

1. **Click "Components" button**
   - ✅ Dialog opens
   - ✅ Shows "No components yet" message
   - ✅ Click "Close" to dismiss

### Test Toggle Active:

1. **Click on "Active" badge**
   - ✅ Changes to "Inactive" (gray)
   - ✅ Row becomes slightly faded
   - Click again to re-activate

### Test Delete:

1. **Click Delete button (trash icon)**
   - ✅ Confirmation dialog appears
   - Click "OK" or "Cancel" to test

### What to Look For:
- ✅ All CRUD operations work
- ✅ Forms validate required fields
- ✅ Success/error toasts appear
- ✅ Table updates immediately
- ✅ Position dropdown populated
- ✅ No errors in console

---

## 3️⃣ Navigation Test (1 minute)

### Test Sidebar Navigation:

1. **From Tax Calculator:**
   - Click sidebar: "Setup → Salary Structures"
   - ✅ Should navigate correctly
   - ✅ Sidebar highlights current page

2. **From Salary Structures:**
   - Click sidebar: "Tax & Super → Tax Calculator"
   - ✅ Should navigate correctly

3. **From Landing Page:**
   - Click "Dashboard" in header
   - Click "Payroll Processing" module
   - ✅ Should show payroll landing page
   - ✅ Can click into both pages from cards

---

## 🐛 If You See Errors

### "Table not found" or "No data"
**Fix:** Run the seed file first!
```bash
# In Supabase SQL Editor, run:
supabase/seed-data.sql
```

### Tax Calculator shows K0 for all amounts
**Fix:** Check that PNG tax brackets are seeded
```sql
-- Run in Supabase SQL Editor:
SELECT * FROM png_tax_brackets WHERE tax_year = 2025;
-- Should return 6 rows
```

### Salary Structures - Empty position dropdown
**Fix:** Check that positions are seeded
```sql
-- Run in Supabase SQL Editor:
SELECT * FROM positions WHERE is_active = true;
-- Should return 12 rows
```

### Form doesn't submit
**Check:**
- Required fields filled (marked with *)
- Code is unique (no duplicates)
- Check browser console for errors

---

## ✅ Success Checklist

After testing both pages, you should have:

### Tax Calculator:
- [x] Calculator works for various income amounts
- [x] Shows correct bracket number
- [x] Monthly and fortnightly calculations accurate
- [x] Bracket table highlights correctly
- [x] Quick amount buttons work
- [x] Formula explanation visible

### Salary Structures:
- [x] Can create new structure
- [x] Can edit existing structure
- [x] Can delete structure (with confirmation)
- [x] Can toggle active/inactive
- [x] Can view components dialog
- [x] Position dropdown works
- [x] Summary cards show correct counts

---

## 📸 Screenshots to Take

Share screenshots of:
1. Tax Calculator with K50,000 calculated
2. Tax brackets table with highlighted bracket
3. Salary Structures list with at least 1 structure
4. Create Structure dialog (filled out)
5. Components dialog (even if empty)

---

## 🎉 What's Working

If all tests pass, you now have:

✅ **Interactive PNG Tax Calculator**
- Real-time calculations
- All 6 tax brackets
- Annual/Monthly/Fortnightly breakdowns
- Educational content

✅ **Salary Structures Management**
- Full CRUD operations
- Position linking
- Employment type support
- Component viewing (ready for future enhancement)

✅ **Professional UI**
- Clean, modern design
- Responsive layout
- Toast notifications
- Error handling

---

## 🚀 Next Steps

Once both pages are tested and working:

1. **Seed more data** if needed
2. **Create sample salary structures** for different positions
3. **Test with real PNG salary amounts**
4. **Ready to build next pages:**
   - Employee Salaries
   - Pay Periods
   - Pay Runs

---

**Testing Time:** ~5 minutes
**Expected Result:** Both pages fully functional
**Version:** 22

🎉 Enjoy testing your new PNG UNRE HRMS payroll features!
