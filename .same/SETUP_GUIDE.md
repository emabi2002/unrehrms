# 🚀 UNRE System - Complete Setup Guide

## ✅ What You've Already Done

1. ✅ Repository cloned successfully
2. ✅ Supabase credentials configured
3. ✅ Development server running
4. ✅ Logo images fixed

---

## 📊 Database Setup (Required - 10 minutes)

### Step 1: Access Supabase SQL Editor

1. Go to: **https://nuyitrqibxdsyfxulrvr.supabase.co**
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button

### Step 2: Run Database Schema

1. Open this file in your project: `.same/database-schema-fixed.sql`
2. **Copy ALL the content** (it's about 1000+ lines)
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** button (or press F5)
5. ⏱️ Wait for completion (takes 10-20 seconds)

✅ **Expected Result**: "Database schema created successfully!" message

### Step 3: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ **You should see 30+ tables** including:
- roles
- user_profiles
- cost_centres
- budget_lines
- ge_requests
- commitments
- payment_vouchers
- And many more...

### Step 4: Create Your First Admin User

1. Go to **Authentication** > **Users** in Supabase
2. Click **"Add user"** > **"Create new user"**
3. Fill in:
   - **Email**: your-email@unre.ac.pg (or any email)
   - **Password**: Create a secure password
   - **Auto Confirm User**: ✅ Check this box
4. Click **"Create user"**
5. **Copy the User ID** (UUID) that appears

### Step 5: Make Yourself an Admin

Run this SQL query (replace `YOUR-USER-ID` with the UUID from step 4):

```sql
-- Insert user profile
INSERT INTO user_profiles (id, email, full_name, employee_id, position, is_active)
VALUES (
  'YOUR-USER-ID',
  'your-email@unre.ac.pg',
  'Your Full Name',
  'EMP001',
  'System Administrator',
  true
);

-- Assign System Admin role
INSERT INTO user_roles (user_id, role_id, is_active)
VALUES (
  'YOUR-USER-ID',
  (SELECT id FROM roles WHERE name = 'System Admin'),
  true
);
```

### Step 6: Create Storage Buckets (For Document Uploads)

1. Click **Storage** in the left sidebar
2. Click **"New bucket"**
3. Create bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ Leave UNCHECKED (private)
   - **File size limit**: `10485760` (10MB)
4. Click **"Create bucket"**

### Step 7: Set Storage Policies

Click on the `documents` bucket, then **Policies** tab, then add these policies:

**Policy 1: Allow Authenticated Uploads**
```sql
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);
```

**Policy 2: Allow Authenticated Downloads**
```sql
CREATE POLICY "Allow authenticated downloads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'documents');
```

---

## 🧪 Test the System

### 1. Test Login

1. Go to your app: http://localhost:3000
2. Click **"Login"** button
3. Enter your email and password
4. You should be redirected to the dashboard

### 2. Explore Dashboard Features

Once logged in, you'll have access to:
- **Dashboard** - Overview of requests and budget
- **Requests** - Create and manage GE requests
- **Approvals** - Approve pending requests
- **Budget** - View budget vs actual spending
- **Commitments** - Track commitments
- **Payments** - Manage payment vouchers
- **PGAS** - Import budget data
- **Cost Centres** - Manage departments
- **Reports** - Generate reports

### 3. Create Test Data (Optional)

You can add sample cost centres and budget lines for testing. Check the file:
`.same/DATABASE_SETUP_STEPS.md` for sample SQL queries.

---

## 🚀 Deployment to Netlify

The application is already configured for deployment. The `netlify.toml` file is present with correct settings.

### Deploy Command:
Once you're ready, we can deploy the application to Netlify with a single command!

---

## 📚 Additional Documentation

Check these files in the `.same` folder:
- `QUICK_START_GUIDE.md` - Quick reference
- `TESTING_GUIDE.md` - How to test features
- `ACTIVATED_FEATURES_GUIDE.md` - All available features
- `SUPABASE_SETUP_INSTRUCTIONS.md` - Detailed Supabase setup

---

## 🆘 Troubleshooting

### Can't login?
- Check if user is created in Supabase Authentication
- Verify user profile exists in `user_profiles` table
- Check if user has a role assigned in `user_roles` table

### Database errors?
- Verify all tables are created successfully
- Check Supabase logs in the Dashboard

### Document upload not working?
- Verify storage bucket `documents` exists
- Check storage policies are set correctly

---

## ✅ Next Steps

1. ✅ Set up the database (follow steps above)
2. ✅ Create your admin user
3. ✅ Test login and features
4. ✅ Deploy to Netlify
5. ✅ Invite team members

**Need help?** Check the documentation files or ask for assistance!
