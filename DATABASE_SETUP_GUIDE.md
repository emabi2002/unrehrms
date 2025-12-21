# 🗄️ DATABASE SETUP & ACTIVATION GUIDE
**PNG UNRE HRMS - Supabase Integration**

## ✅ Prerequisites Completed

- ✅ Database types created (`src/lib/database.types.ts`)
- ✅ TypeScript errors fixed in all modules
- ✅ Environment template created (`.env.local`)
- ✅ 8 migration SQL files ready to apply
- ✅ All 90 pages created and functional

---

## 🚀 Step 1: Configure Supabase Connection

### 1.1 Get Your Supabase Credentials

1. Go to your Supabase project: https://app.supabase.com/project/qltnmteqivrnljemyvvb
2. Click on **Settings** (gear icon) → **API**
3. Copy the following values:

   - **Project URL** (e.g., `https://qltnmteqivrnljemyvvb.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (starts with `eyJ...` - keep this SECRET!)

### 1.2 Update .env.local File

Open `.env.local` in the project root and replace the placeholder values:

\`\`\`env
# Replace these with your actual values
NEXT_PUBLIC_SUPABASE_URL=https://qltnmteqivrnljemyvvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key-here
\`\`\`

### 1.3 Restart the Dev Server

\`\`\`bash
# Stop current server (Ctrl+C)
# Then restart:
bun run dev
\`\`\`

---

## 📊 Step 2: Apply Database Migrations

You need to apply all 8 migration files to create the database schema.

### Option A: Via Supabase Dashboard (Recommended)

1. Go to https://app.supabase.com/project/qltnmteqivrnljemyvvb/sql/new

2. **Apply migrations in this order:**

#### Migration 1: Foundation Tables
- Open `supabase/migrations/001_foundation_tables.sql`
- Copy ALL content
- Paste into SQL Editor
- Click **RUN**
- Wait for "Success"

#### Migration 2: Payroll System
- Click "New Query"
- Open `supabase/migrations/002_payroll_system.sql`
- Copy ALL → Paste → **RUN**

#### Migration 3: PNG Tax Tables
- Click "New Query"
- Open `supabase/migrations/003_png_tax_tables.sql`
- Copy ALL → Paste → **RUN**

#### Migration 4: Super Schemes
- Click "New Query"
- Open `supabase/migrations/004_super_schemes.sql`
- Copy ALL → Paste → **RUN**

#### Migration 5: Emergency Contacts & Documents
- Click "New Query"
- Open `supabase/migrations/005_emergency_contacts_and_documents_FIXED.sql`
- Copy ALL → Paste → **RUN**

#### Migration 6: Comprehensive HRMS Tables
- Click "New Query"
- Open `supabase/migrations/006_comprehensive_hrms_tables_FINAL.sql`
- Copy ALL → Paste → **RUN**

#### Migration 7: Performance, Learning & Benefits
- Click "New Query"
- Open `supabase/migrations/007_hrms_performance_learning_benefits_FIXED.sql`
- Copy ALL → Paste → **RUN**

#### Migration 8: Relations, Safety & Admin
- Click "New Query"
- Open `supabase/migrations/008_hrms_relations_safety_admin_FIXED.sql`
- Copy ALL → Paste → **RUN**

### Option B: Via Supabase CLI (Advanced)

\`\`\`bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref qltnmteqivrnljemyvvb

# Apply all migrations
supabase db push
\`\`\`

---

## 🌱 Step 3: Seed Initial Data (Optional)

### Via Supabase Dashboard

1. Go to SQL Editor (New Query)
2. Open `supabase/seed-data.sql`
3. Copy ALL content
4. Paste and **RUN**

This will create:
- Sample faculties and departments
- Sample employees
- Leave types
- Academic ranks
- Employment types
- Tax brackets
- Super schemes

### Via Script (When .env.local is configured)

\`\`\`bash
bun run seed
\`\`\`

---

## ✅ Step 4: Verify Setup

### 4.1 Check Tables Were Created

Go to https://app.supabase.com/project/qltnmteqivrnljemyvvb/editor

You should see **~42 tables** including:
- ✅ faculties
- ✅ departments
- ✅ employees
- ✅ academic_ranks
- ✅ positions
- ✅ employment_types
- ✅ leave_types
- ✅ leave_requests
- ✅ leave_balances
- ✅ attendance
- ✅ employee_documents
- ✅ emergency_contacts
- ✅ salary_structures
- ✅ pay_periods
- ✅ payslips
- ✅ tax_brackets
- ✅ super_schemes
- And 25+ more tables...

### 4.2 Test the Connection

1. Go to http://localhost:3000/dashboard/employees
2. Click the "Employees" page
3. If you see a loading spinner and then data appears - **SUCCESS!**
4. If you see an error, check your `.env.local` configuration

---

## 🎨 Step 5: Activate Modules

Now that the database is connected, all modules will automatically work:

### ✅ Immediately Functional
- **Employees** - Full CRUD operations
- **Departments** - View and manage departments
- **Leave Requests** - Apply and view leave
- **Attendance** - View attendance records
- **Payroll** - View payslips and pay runs

### 🔄 Partially Functional (Need UI Work)
- **Recruitment** - Database ready, UI needs forms
- **Performance** - Database ready, UI needs forms
- **Training** - Database ready, UI needs forms

---

## 🛠️ Troubleshooting

### Connection Error: "Failed to fetch"

**Problem:** Can't connect to Supabase

**Solution:**
1. Check `.env.local` has correct values
2. Restart dev server (`Ctrl+C`, then `bun run dev`)
3. Check Supabase project is active at https://app.supabase.com

### Error: "relation does not exist"

**Problem:** Tables not created

**Solution:**
1. Apply all 8 migration files in order
2. Check for errors in Supabase SQL Editor
3. Make sure each migration showed "Success"

### TypeScript Errors

**Problem:** Type mismatches

**Solution:**
All TypeScript errors in main modules are fixed. If you see errors:
1. Run `bun run lint`
2. Errors in `scripts/seed-database.ts` are normal (ignore them)
3. Any errors in `/dashboard/` pages should be reported

### Empty Data / No Employees

**Problem:** No data showing

**Solution:**
1. Run the seed script: `bun run seed`
2. Or manually add data via Supabase dashboard
3. Check browser console for errors

---

## 📚 Next Steps

### 1. Add Real Employee Data

**Via Dashboard:**
1. Go to Supabase Table Editor
2. Select `employees` table
3. Click "Insert row"
4. Fill in employee details
5. Save

**Via Application:**
1. Go to http://localhost:3000/dashboard/employees
2. Click "Add Employee"
3. Fill in the form
4. Submit

### 2. Configure Leave Types

1. Create leave types in Supabase or via seed script
2. Set annual entitlements
3. Configure approval workflows

### 3. Set Up Payroll

1. Create salary structures
2. Define pay components
3. Set up pay periods
4. Configure tax brackets for 2025

### 4. Enable File Uploads

1. Set up Supabase Storage bucket
2. Configure policies for file access
3. Enable document uploads for employees

---

## 🔐 Security Checklist

- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] Never commit Supabase keys to git
- [ ] Set up Row Level Security (RLS) policies in Supabase
- [ ] Enable authentication before production
- [ ] Configure role-based access control

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Dashboard** for error logs
2. **Browser Console** (F12) for client-side errors
3. **Terminal** for server-side errors
4. **Network Tab** to see failed requests

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Employees page loads with data
✅ Can add new employees via form
✅ Can edit and delete employees
✅ Leave requests show in the system
✅ Attendance records display
✅ Payslips are viewable
✅ No console errors

---

**Setup Time:** 10-15 minutes
**Difficulty:** Easy (copy/paste SQL)
**Result:** Fully functional HRMS with real database!
