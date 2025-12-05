# 🚀 PNG UNRE HRMS - Quick Setup Guide

## Follow These Steps to Get Your Database Ready

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb

2. Click on **SQL Editor** in the left sidebar

3. Click **New query**

4. Copy and paste this SQL script:

```sql
-- Add profile_picture column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment for documentation
COMMENT ON COLUMN employees.profile_picture IS 'Path to profile picture in Supabase Storage';

-- Refresh the PostgREST schema cache
NOTIFY pgrst, 'reload schema';
```

5. Click **Run** button

6. You should see "Success. No rows returned"

---

### Step 2: Create Storage Bucket for Profile Pictures

1. In Supabase Dashboard, click **Storage** in the left sidebar

2. Click **Create a new bucket**

3. **Bucket name:** `employee-profiles`

4. **Public bucket:** Toggle this **ON** (Important!)

5. Click **Create bucket**

6. Click on the new bucket

7. Go to **Policies** tab

8. Click **New Policy** for INSERT

9. Template: "Allow public uploads" or create custom policy:
   ```sql
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'employee-profiles');
   ```

10. Click **Save**

11. Repeat for SELECT policy:
    ```sql
    CREATE POLICY "Allow public access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'employee-profiles');
    ```

---

### Step 3: Run the Database Seed Script

Now run the seed script from your terminal:

```bash
cd png-unre-hrms-web
bun run seed
```

**Expected Output:**
```
🌱 Starting database seed...

📁 Seeding departments...
✅ Seeded 8 departments (or error if already exist - that's okay!)

👥 Seeding employees...
✅ Seeded 20 employees

📅 Seeding leave requests...
✅ Seeded 5 leave requests

⏰ Seeding attendance records...
✅ Seeded 50 attendance records

💰 Seeding salary slips...
✅ Seeded 10 salary slips

✅ Database seeding completed successfully!
```

---

### Step 4: Verify the Data

1. Go to Supabase Dashboard → **Table Editor**

2. Check each table:
   - **employees**: Should have 20 rows
   - **departments**: Should have 8 rows
   - **leave_requests**: Should have 5 rows
   - **attendance**: Should have 50 rows
   - **salary_slips**: Should have 10 rows

---

### Step 5: Start the Development Server

```bash
bun run dev
```

Then open: http://localhost:3000

---

### Step 6: Explore Your HRMS!

1. **Dashboard** - See overview statistics
2. **Employees** - View 20 seeded employees
3. **Leave Management** - See 5 leave requests
4. **Attendance** - View 50 attendance records
5. **Departments** - See 8 departments
6. **Payroll** - View salary slips
7. **Reports** - See interactive Chart.js analytics!

---

## 📧 Optional: Set Up Email Notifications

To enable email notifications for leave approvals/rejections:

1. Sign up at [resend.com](https://resend.com)

2. Get your API key from the dashboard

3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_actual_api_key_here
   ```

4. Test by approving a leave request - you'll get a beautiful email!

---

## 🐛 Troubleshooting

### "Departments already exist" error
- This is normal if you've run the seed before
- The script will continue and seed other tables

### "Employee ID already exists" error
- Delete existing employees first, or modify the seed script

### "Could not find profile_picture column"
- Make sure you ran the SQL migration in Step 1
- Check that the column was added in Table Editor

### No data showing in app
- Verify data exists in Supabase Table Editor
- Check browser console for errors
- Verify .env.local has correct Supabase credentials

---

## ✅ Quick Checklist

- [ ] SQL migration run (profile_picture column added)
- [ ] Storage bucket created (employee-profiles)
- [ ] Storage policies configured (public read, authenticated write)
- [ ] Seed script run successfully
- [ ] Data visible in Supabase Table Editor
- [ ] Development server running
- [ ] App shows 20 employees, 8 departments, etc.
- [ ] (Optional) Resend API key configured
- [ ] (Optional) Test email notification

---

## 🎉 You're All Set!

Once you complete these steps, your PNG UNRE HRMS will be fully functional with:

- ✅ 20 employees across all departments
- ✅ 8 departments with heads assigned
- ✅ 5 leave requests (pending, approved, rejected)
- ✅ 50 attendance records
- ✅ 10 salary slips
- ✅ Profile picture upload capability
- ✅ Interactive Chart.js analytics
- ✅ PDF/Excel export functionality

**Need help?** Check `SETUP_GUIDE.md` for more detailed instructions!
