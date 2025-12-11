# Create Admin User: admin@unre.ac.pg

## 🎯 Quick Setup (5 minutes)

Follow these exact steps to create the Administrator account.

---

## Step 1: Create User in Supabase Auth (2 minutes)

1. **Open Supabase Dashboard**
   - Go to: https://nuyitrqibxdsyfxulrvr.supabase.co
   - Login to your account

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar
   - Click **"Users"** tab

3. **Add New User**
   - Click **"Add user"** button (top right)
   - Select **"Create new user"**

4. **Fill in Details:**
   ```
   Email: admin@unre.ac.pg
   Password: [Create a secure password - write it down!]
   ```

5. **Important Settings:**
   - ✅ Check **"Auto Confirm User"** (so you can login immediately)
   - Click **"Create user"**

6. **Copy the User ID**
   - After user is created, you'll see a list of users
   - Click on **admin@unre.ac.pg**
   - Find the **"ID"** field (looks like: `abc12345-6789-...`)
   - **COPY THIS UUID** - you'll need it in Step 2

---

## Step 2: Create Profile and Assign Roles (2 minutes)

1. **Go to SQL Editor**
   - In Supabase, click **"SQL Editor"** in left sidebar
   - Click **"New query"**

2. **Paste and Edit This SQL:**

```sql
-- ⚠️ IMPORTANT: Replace 'PASTE_YOUR_UUID_HERE' with the actual UUID you copied!

DO $$
DECLARE
  admin_user_id UUID := 'PASTE_YOUR_UUID_HERE'; -- ⚠️ REPLACE THIS LINE!
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (id, email, full_name, employee_id, is_active)
  VALUES (
    admin_user_id,
    'admin@unre.ac.pg',
    'Administrator',
    'ADMIN001',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  -- Assign System Admin role
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'System Admin'
  ON CONFLICT DO NOTHING;

  -- Also assign Bursar role (for testing workflows)
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'Bursar'
  ON CONFLICT DO NOTHING;

  -- Also assign HOD role (for testing)
  INSERT INTO user_roles (user_id, role_id, is_active)
  SELECT admin_user_id, id, true
  FROM roles WHERE name = 'HOD'
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Admin user created successfully!';
END $$;
```

3. **Replace the UUID:**
   - Find this line: `admin_user_id UUID := 'PASTE_YOUR_UUID_HERE';`
   - Replace `PASTE_YOUR_UUID_HERE` with the UUID you copied in Step 1
   - Example: `admin_user_id UUID := '123e4567-e89b-12d3-a456-426614174000';`

4. **Run the Query:**
   - Click **"Run"** button (or press F5)
   - Wait for success message

---

## Step 3: Verify User Created (1 minute)

Run this query to confirm:

```sql
-- Check the admin user
SELECT
  up.email,
  up.full_name,
  up.employee_id,
  up.is_active,
  STRING_AGG(r.name, ', ') as roles
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email = 'admin@unre.ac.pg'
GROUP BY up.email, up.full_name, up.employee_id, up.is_active;
```

**You should see:**
```
email: admin@unre.ac.pg
full_name: Administrator
employee_id: ADMIN001
is_active: true
roles: System Admin, Bursar, HOD
```

---

## Step 4: Test Login

1. **Go to your application**
   - Visit the live preview URL
   - Click **"Login"**

2. **Login with:**
   ```
   Email: admin@unre.ac.pg
   Password: [the password you set in Step 1]
   ```

3. **You should:**
   - ✅ Be logged in successfully
   - ✅ See the Dashboard
   - ✅ Have access to all modules (Admin, Requests, Approvals, Budget, etc.)

---

## 🎉 Success!

Your admin user is now set up with:
- ✅ **Email:** admin@unre.ac.pg
- ✅ **Name:** Administrator
- ✅ **Employee ID:** ADMIN001
- ✅ **Roles:** System Admin, Bursar, HOD
- ✅ **Access:** Full system access

---

## 🔐 Security Tips

1. **Change Default Password:**
   - After first login, change to a strong password
   - Use password manager to store it

2. **Save Credentials Securely:**
   ```
   Email: admin@unre.ac.pg
   Password: [your secure password]
   Role: System Administrator
   ```

3. **Create Additional Users:**
   - Don't share admin account
   - Create individual accounts for each staff member
   - Assign appropriate roles (HOD, Dean, Bursar, etc.)

---

## 🔧 Troubleshooting

### Problem: "User not found" when logging in
**Solution:**
- Make sure you checked "Auto Confirm User" in Step 1
- Or manually confirm: Authentication → Users → Click user → Confirm user

### Problem: "Invalid credentials"
**Solution:**
- Double-check the password you set
- Reset password: Authentication → Users → Click user → Reset password

### Problem: "Cannot see dashboard modules"
**Solution:**
- Verify roles assigned by running the verification query in Step 3
- Make sure you see "System Admin" in the roles

### Problem: SQL error "duplicate key value"
**Solution:**
- User already exists! Just login with the existing credentials
- Or update: Change `INSERT` to `UPDATE` in the SQL

---

## 📞 Next Steps

Now that admin user is created:

1. ✅ **Login and explore** the dashboard
2. ✅ **Create a test GE request** to try the workflow
3. ✅ **Review budget overview** to see sample budget lines
4. ✅ **Create additional users** for your staff
5. ✅ **Import real PGAS data** when ready

---

## 👥 Create More Users Later

Use the same process for other users:
- Create in Supabase Auth
- Run SQL to create profile
- Assign appropriate roles:
  - **HOD** for department heads
  - **Dean** for deans/directors
  - **Bursar** for finance staff
  - **Requestor** for regular staff

---

**Admin user ready! Login and start using the system! 🚀**
