# Database Tables Checklist

## ✅ Core Tables (21 Essential Tables)

Run this query to see which tables you have:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

### Essential Tables (Must Have):

1. ✅ **roles** - User roles (HOD, Dean, Bursar, etc.)
2. ✅ **user_profiles** - Extended user information
3. ✅ **user_roles** - User-to-role assignments
4. ✅ **cost_centres** - Faculties, Schools, Divisions
5. ✅ **budget_lines** - AAP budget lines linked to PGAS
6. ✅ **budget_adjustments** - Budget virements
7. ✅ **expense_types** - Types of expenses
8. ✅ **suppliers** - Supplier master data
9. ✅ **ge_requests** - Main GE requests table
10. ✅ **ge_request_items** - Line items for requests
11. ✅ **ge_approvals** - Approval history
12. ✅ **approval_workflows** - Workflow configuration
13. ✅ **commitments** - Budget commitments
14. ✅ **purchase_orders** - Purchase orders (optional)
15. ✅ **goods_received_notes** - GRN tracking (optional)
16. ✅ **payment_vouchers** - Payment vouchers
17. ✅ **attachments** - Document storage
18. ✅ **notifications** - User notifications
19. ✅ **audit_logs** - Complete audit trail
20. ✅ **system_config** - System configuration
21. ✅ **dashboard_metrics** - Cached metrics

## 📊 Additional Tables (Optional - 10 More)

These add extra functionality but system works without them:

22. ⭐ **approval_workflow_rules** - Advanced workflow rules
23. ⭐ **email_notifications** - Email queue
24. ⭐ **budget_allocation_history** - Budget change tracking
25. ⭐ **ge_request_status_history** - Status change tracking
26. ⭐ **payment_schedules** - Multi-payment tracking
27. ⭐ **supplier_contracts** - Contract management
28. ⭐ **user_login_history** - Login tracking
29. ⭐ **system_activity_log** - Activity logging
30. ⭐ **report_templates** - Custom reports
31. ⭐ **saved_reports** - Generated reports

---

## ✅ You Have 21 Tables - THAT'S PERFECT!

**Good news:** The 21 core tables are all you need for the system to work fully!

The additional 10 tables are **optional enhancements** that can be added later.

---

## 🎯 Your System is Ready If You Have These:

Run this query to verify core functionality:

```sql
-- Check critical tables exist
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN '✅'
    ELSE '❌'
  END || ' roles',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN '✅'
    ELSE '❌'
  END || ' user_profiles',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cost_centres') THEN '✅'
    ELSE '❌'
  END || ' cost_centres',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'budget_lines') THEN '✅'
    ELSE '❌'
  END || ' budget_lines',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ge_requests') THEN '✅'
    ELSE '❌'
  END || ' ge_requests',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ge_approvals') THEN '✅'
    ELSE '❌'
  END || ' ge_approvals',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commitments') THEN '✅'
    ELSE '❌'
  END || ' commitments',
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'payment_vouchers') THEN '✅'
    ELSE '❌'
  END || ' payment_vouchers';
```

If all show ✅, **you're ready to go!**

---

## 📋 What Each Table Does:

| Table | Purpose |
|-------|---------|
| **roles** | System roles (HOD, Dean, Bursar, etc.) |
| **user_profiles** | User information |
| **user_roles** | Who has which roles |
| **cost_centres** | Organizational units |
| **budget_lines** | AAP budget from PGAS |
| **ge_requests** | GE requests |
| **ge_request_items** | Line items in requests |
| **ge_approvals** | Approval trail |
| **approval_workflows** | Workflow routing rules |
| **commitments** | Budget commitments |
| **payment_vouchers** | Payment processing |
| **attachments** | File uploads |
| **notifications** | User alerts |
| **audit_logs** | Complete history |

---

## 🚀 Next Steps:

Since you have 21 tables, proceed with:

1. ✅ **Add sample data** (cost centres, budget lines)
2. ✅ **Create your admin user**
3. ✅ **Test the system**

Follow: `.same/DATABASE_SETUP_STEPS.md` (Step 4 onwards)

---

## 🔧 Optional: Add Extra Tables Later

If you want the additional 10 tables, run:

```bash
# In Supabase SQL Editor, run:
.same/verify-and-add-missing-tables.sql
```

This adds:
- Advanced workflow rules
- Email notifications
- Enhanced tracking
- Custom reporting

**But these are NOT required for core functionality!**

---

## ✅ Summary:

**21 tables = Full working system ✅**
**31 tables = Enhanced system with extras ⭐**

You're good to go with 21! Proceed to add sample data and create your admin user.
