# Database Setup Instructions

## Quick Setup for PNG UNRE HRMS

Follow these steps to set up your Supabase database for the HRMS system.

---

## Step 1: Add Profile Picture Column

Go to your Supabase Dashboard → SQL Editor and run this query:

```sql
-- Add profile_picture column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS profile_picture TEXT;

-- Add comment
COMMENT ON COLUMN employees.profile_picture IS 'Path to employee profile picture in Supabase Storage';
```

---

## Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Click "New Bucket"
3. Name: `employee-profiles`
4. **Public bucket**: ✅ YES (check this box)
5. Click "Create bucket"

### Set Bucket Policies:

After creating the bucket, add these policies:

**For INSERT (upload):**
```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-profiles');
```

**For SELECT (view):**
```sql
-- Allow public access to view
CREATE POLICY "Allow public access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'employee-profiles');
```

**For UPDATE:**
```sql
-- Allow authenticated users to update
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'employee-profiles');
```

**For DELETE:**
```sql
-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'employee-profiles');
```

---

## Step 3: Verify Database Schema

Make sure your `employees` table has these columns:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employees'
ORDER BY ordinal_position;
```

Expected columns:
- id (uuid)
- created_at (timestamp)
- first_name (text)
- last_name (text)
- email (text)
- phone (text)
- employee_id (text)
- department (text)
- position (text)
- employment_type (text)
- hire_date (date)
- salary (numeric)
- status (text)
- profile_picture (text) ← Should be here now!

---

## Step 4: Run Seed Script

Now you can run the seed script to populate your database:

```bash
cd png-unre-hrms-web
bun run seed
```

Expected output:
```
🌱 Starting database seed...
📁 Seeding departments... ✅ 8 departments
👥 Seeding employees... ✅ 20 employees
📅 Seeding leave requests... ✅ 5 requests
⏰ Seeding attendance... ✅ 50 records
💰 Seeding salary slips... ✅ 10 slips
✅ Database seeding completed!
```

---

## Troubleshooting

### Departments Already Exist Error
This is normal if you've run the seed before. The script will skip departments and continue with employees.

### Profile Picture Column Not Found
Run the ALTER TABLE command from Step 1 again.

### Storage Bucket Not Found
Create the `employee-profiles` bucket as described in Step 2.

### Permission Denied Errors
Make sure you're using the SUPABASE_SERVICE_ROLE_KEY for the seed script, not the anon key.

---

## What Gets Seeded

### 20 Employees:
1. Dr. John Kila - Senior Lecturer (Environmental Sciences)
2. Sarah Puka - HR Officer (Administrative)
3. Prof. Mary Tone - Professor (Natural Resources)
4. David Kama - Systems Administrator (IT)
5. Grace Namu - Assistant Lecturer (Agriculture)
... and 15 more!

### 8 Departments:
- Faculty of Environmental Sciences
- Faculty of Natural Resources
- Faculty of Agriculture
- Administrative Services
- IT Department
- Student Services
- Research & Development
- Library Services

### 5 Leave Requests:
- Mix of pending, approved, and rejected
- Various leave types

### 50 Attendance Records:
- 5 days of attendance for first 10 employees
- Realistic check-in/check-out times

### 10 Salary Slips:
- December 2025 payroll
- For first 10 employees

---

## After Setup

Once setup is complete, you can:

1. **View Employees**: Go to http://localhost:3000/dashboard/employees
2. **Edit Employees**: Click on any employee → Edit button
3. **Upload Profile Pictures**: In the edit form
4. **Manage Leave**: Go to Leave Management
5. **View Reports**: See analytics with charts
6. **Test Emails**: Approve/reject leave requests (requires RESEND_API_KEY)

---

## Next: Email Setup

To enable email notifications, you also need to:

1. Sign up at [https://resend.com](https://resend.com)
2. Get your API key
3. Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   ```
4. Test by approving a leave request!

---

**Ready to go!** 🚀
