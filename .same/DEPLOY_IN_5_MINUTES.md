# 🚀 Deploy AAP Schema in 5 Minutes (3 Steps)

## Step 1: Open Supabase SQL Editor

1. Go to: **https://app.supabase.com/project/nuyitrqibxdsyfxulrvr/sql**
2. You'll be taken directly to the SQL Editor
3. Click **"New query"** button

## Step 2: Copy & Paste Schema

1. **Open this file** in your editor:
   ```
   unre/.same/aap-budget-monitoring-schema.sql
   ```

2. **Select all** (Ctrl+A or Cmd+A)

3. **Copy** (Ctrl+C or Cmd+C)

4. **Go back to Supabase SQL Editor**

5. **Paste** into the editor (Ctrl+V or Cmd+V)

6. **Click RUN** (bottom right)

7. **Wait 30-60 seconds**

## Step 3: Verify Success

You should see output like:
```
CREATE TABLE
CREATE TABLE
... (repeats many times)
INSERT 0 3
INSERT 0 2
...
Success. No rows returned
```

**Then test the app:**

1. Go to: **http://localhost:3000/dashboard/aap**
2. Should load without errors
3. Click **"Create New AAP"**
4. Should show dropdown options

✅ **Done!**

---

## Quick Check

After deployment:
- Go to Supabase → **Table Editor**
- Should see new tables: `fiscal_year`, `division`, `department`, `aap_header`, etc.
- Click `fiscal_year` → Should show 3 rows (2024, 2025, 2026)

---

**That's it! 3 steps, 5 minutes.**

After deployment, come back and we'll test the AAP UI together and continue building the remaining features.
