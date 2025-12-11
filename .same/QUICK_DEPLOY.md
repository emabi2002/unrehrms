# ⚡ QUICK DEPLOY - 3 Steps (FIXED VERSION!)

**Time**: 5 minutes
**Goal**: Enable all AAP & Budget features
**Version**: V4 (No trigger errors!)
**Status**: ✅ Error-Free Deployment

---

## Step 1: Deploy AAP Schema V4 (2 min)

**File**: `unre/.same/aap-schema-v4-final.sql` ✨

1. Open: https://app.supabase.com/project/nuyitrqibxdsyfxulrvr/sql
2. Click **"New query"**
3. Open file: `unre/.same/aap-schema-v4-final.sql`
4. **Copy ALL** (Ctrl+A, Ctrl+C)
5. **Paste** in Supabase editor
6. Click **RUN**
7. Wait for success message:
   ```
   ✅ AAP SCHEMA DEPLOYMENT SUCCESSFUL!
   Tables Created: 15
   ```

---

## Step 2: Deploy Budget Commitments V2 (1 min)

**File**: `unre/.same/budget-commitments-v2-final.sql` ✨

1. Click **"New query"** (clear editor)
2. Open file: `unre/.same/budget-commitments-v2-final.sql`
3. **Copy ALL** (Ctrl+A, Ctrl+C)
4. **Paste** in Supabase editor
5. Click **RUN**
6. Wait for success message:
   ```
   ✅ BUDGET COMMITMENTS TABLE DEPLOYED!
   ```

---

## Step 3: Verify (2 min)

1. Go to **Table Editor** in Supabase
2. Should see: `fiscal_year`, `division`, `aap_header`, `budget_commitments`
3. Test app: http://localhost:3000/dashboard/aap
4. Should load without "Failed to load" errors ✅

---

## ✅ Success!

If `/dashboard/aap` loads without errors, **you're done!** 🎉

All AAP and Budget features are now enabled!

---

## 🔧 What's Different in V4?

- ✅ Drops triggers before creating (fixes "already exists" error)
- ✅ Drops functions before creating (safe to re-run)
- ✅ Drops views before creating (handles updates)
- ✅ Success messages so you know it worked
- ✅ Safe to run multiple times

---

**Files**:
- `aap-schema-v4-final.sql` (AAP - FIXED!)
- `budget-commitments-v2-final.sql` (Commitments - FIXED!)

See `FIXED_DEPLOYMENT.md` for detailed troubleshooting!
