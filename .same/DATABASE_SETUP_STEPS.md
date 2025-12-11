# Database Setup - Step by Step

## ✅ Use the Fixed Schema

**Important**: Use `database-schema-fixed.sql` instead of the original file. This version has proper table ordering.

---

## 🚀 Setup Steps (5 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to: https://nuyitrqibxdsyfxulrvr.supabase.co
2. Login to your Supabase dashboard
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button

### Step 2: Run the Fixed Schema

1. Open the file: `.same/database-schema-fixed.sql`
2. **Copy ALL the content** (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. Click **"Run"** button (or press F5)
5. Wait for completion (should take 5-10 seconds)

✅ **You should see**: "Database schema created successfully!" message

### Step 3: Verify Tables Created

Run this query to check:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

✅ **You should see 30+ tables** including:
- roles
- user_profiles
- user_roles
- cost_centres
- budget_lines
- ge_requests
- ge_request_items
- ge_approvals
- commitments
- payment_vouchers
- etc.

---

## 📊 Step 4: Add Sample Data

Now add some test data to get started. Run each section separately:

### A. Create Cost Centres

```sql
INSERT INTO cost_centres (code, name, type, is_active) VALUES
  ('AGR', 'School of Agriculture', 'School', true),
  ('SCI', 'Faculty of Science', 'Faculty', true),
  ('NRS', 'School of Natural Resources', 'School', true),
  ('ADM', 'Administration', 'Division', true),
  ('LIB', 'Library Services', 'Division', true),
  ('ICT', 'ICT Department', 'Division', true),
  ('FAC', 'Facilities', 'Division', true);
```

### B. Create Budget Lines (Sample AAP Budget for 2025)

```sql
INSERT INTO budget_lines
  (cost_centre_id, budget_year, pgas_vote_code, aap_code, description, category, original_amount, ytd_expenditure)
VALUES
  -- School of Agriculture
  (1, 2025, 'AGR-001', '2025-AGR-OP-TRAV', 'Operating - Travel', 'Operating', 250000, 120000),
  (1, 2025, 'AGR-002', '2025-AGR-OP-STAT', 'Operating - Stationery', 'Operating', 150000, 80000),

  -- Faculty of Science
  (2, 2025, 'SCI-001', '2025-SCI-OP-MAINT', 'Operating - Maintenance', 'Operating', 350000, 180000),
  (2, 2025, 'SCI-002', '2025-SCI-CAP-EQUIP', 'Capital - Laboratory Equipment', 'Capital', 850000, 420000),

  -- School of Natural Resources
  (3, 2025, 'NRS-001', '2025-NRS-OP-FUEL', 'Operating - Fuel', 'Operating', 180000, 95000),

  -- Administration
  (4, 2025, 'ADM-001', '2025-ADM-OP-UTIL', 'Operating - Utilities', 'Operating', 420000, 210000),
  (4, 2025, 'ADM-002', '2025-ADM-CAP-FURN', 'Capital - Furniture & Fittings', 'Capital', 320000, 180000),

  -- ICT Department
  (6, 2025, 'ICT-001', '2025-ICT-CAP-IT', 'Capital - IT Equipment', 'Capital', 950000, 520000),

  -- Library Services
  (5, 2025, 'LIB-001', '2025-LIB-OP-BOOKS', 'Operating - Library Books', 'Operating', 280000, 140000);
```

### C. Create Sample Suppliers

```sql
INSERT INTO suppliers (name, contact_person, phone, email, is_active) VALUES
  ('PNG Office Supplies Ltd', 'John Smith', '675-123-4567', 'sales@pngoffice.pg', true),
  ('Ela Motors', 'Mary Johnson', '675-234-5678', 'service@elamotors.pg', true),
  ('Brian Bell Ltd', 'Peter Kila', '675-345-6789', 'info@brianbellpng.com', true),
  ('Stop & Shop', 'Sarah Mek', '675-456-7890', 'sales@stopshop.pg', true);
```

---

## 👤 Step 5: Create Your Admin User

### A. First, create user via Supabase Auth UI

1. In Supabase dashboard, go to **"Authentication"** → **"Users"**
2. Click **"Add user"** → **"Create new user"**
3. Enter:
   - Email: `emmanuel@unre.ac.pg`
   - Password: (your secure password)
   - Auto-confirm: ✅ Yes
4. Click **"Create user"**
5. **Copy the User ID** (UUID) shown

### B. Then create profile and assign role

Replace `YOUR_USER_ID_HERE` with the UUID you copied:

```sql
-- Create user profile
INSERT INTO user_profiles (id, email, full_name, employee_id, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your UUID
  'emmanuel@unre.ac.pg',
  'Emmanuel Saliki',
  'EMP001',
  true
);

-- Assign System Admin role
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT 'YOUR_USER_ID_HERE', id, true  -- Replace with your UUID
FROM roles WHERE name = 'System Admin';

-- Also assign Bursar role for testing workflows
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT 'YOUR_USER_ID_HERE', id, true  -- Replace with your UUID
FROM roles WHERE name = 'Bursar';
```

---

## ✅ Step 6: Verify Setup

Run these queries to confirm everything is set up:

```sql
-- Check roles
SELECT * FROM roles;

-- Check cost centres
SELECT * FROM cost_centres;

-- Check budget lines
SELECT
  cc.name as cost_centre,
  bl.description,
  bl.original_amount,
  bl.ytd_expenditure,
  bl.available_amount
FROM budget_lines bl
JOIN cost_centres cc ON bl.cost_centre_id = cc.id;

-- Check your user
SELECT
  up.full_name,
  up.email,
  r.name as role
FROM user_profiles up
JOIN user_roles ur ON up.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE up.email = 'emmanuel@unre.ac.pg';
```

✅ **You should see**:
- 10 roles
- 7 cost centres
- 9 budget lines
- Your user with System Admin role

---

## 🎉 Setup Complete!

Your database is now ready! You can:

1. **Login to the application** with `emmanuel@unre.ac.pg` and your password
2. **Navigate to Dashboard** to see all modules
3. **Create a test GE request** to try the workflow
4. **View budget status** in Budget Overview page
5. **Test PGAS import** with sample CSV

---

## 🔧 Troubleshooting

### Error: "relation already exists"
**Solution**: Tables already created. You can:
- Skip to Step 4 (add sample data)
- OR drop all tables and start fresh:
  ```sql
  -- WARNING: This deletes ALL data
  DROP SCHEMA public CASCADE;
  CREATE SCHEMA public;
  -- Then run database-schema-fixed.sql again
  ```

### Error: "insert or update violates foreign key constraint"
**Solution**: Run SQL in the order shown above. Cost centres must exist before budget lines.

### Can't find your user ID
**Solution**:
1. Go to Authentication → Users in Supabase
2. Click on your user
3. Copy the "ID" field (UUID format)

---

## 📞 Need Help?

- Check Supabase logs for detailed error messages
- Make sure you're using `database-schema-fixed.sql` (not the original)
- Verify you replaced `YOUR_USER_ID_HERE` with your actual UUID
- Run queries one section at a time, not all at once

---

**Next**: Login to the application and start using the system! 🚀
