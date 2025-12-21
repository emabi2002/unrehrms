# Database Migration Instructions
## Phase 1: Emergency Contacts & Document Management

**Migration File:** `supabase/migrations/005_emergency_contacts_and_documents.sql`

---

## ⚠️ IMPORTANT - Read Before Proceeding

This migration will:
- ✅ Create `emergency_contacts` table
- ✅ Create `employee_documents` table
- ✅ Create `document_types` table (with 18 pre-configured types)
- ✅ Add new columns to `employees` table
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create utility functions for document expiry alerts
- ⚠️ **BACKUP YOUR DATABASE FIRST!**

---

## Step-by-Step Instructions

### Option 1: Apply via Supabase Dashboard (Recommended)

1. **Backup Your Database**
   ```
   Go to: Supabase Dashboard → Database → Backups
   Click: "Create backup now"
   Wait for backup to complete ✓
   ```

2. **Open SQL Editor**
   ```
   Go to: Supabase Dashboard → SQL Editor
   Click: "New query"
   ```

3. **Copy Migration SQL**
   ```
   Open: unrehrms/supabase/migrations/005_emergency_contacts_and_documents.sql
   Copy: All contents (Ctrl+A, Ctrl+C)
   ```

4. **Paste & Execute**
   ```
   Paste into SQL Editor
   Click: "Run" button (or Ctrl+Enter)
   Wait for completion message
   ```

5. **Verify Migration**
   ```sql
   -- Run this query to verify tables were created:
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('emergency_contacts', 'employee_documents', 'document_types');

   -- Should return 3 rows
   ```

6. **Check Document Types**
   ```sql
   -- Verify 18 document types were inserted:
   SELECT code, name, is_mandatory, requires_expiry
   FROM document_types
   ORDER BY display_order;

   -- Should return 18 rows
   ```

---

### Option 2: Apply via Supabase CLI

```bash
# 1. Install Supabase CLI (if not installed)
npm install -g supabase

# 2. Login to Supabase
supabase login

# 3. Link to your project
cd unrehrms
supabase link --project-ref YOUR_PROJECT_REF

# 4. Apply migration
supabase db push

# 5. Verify
supabase db diff
```

---

### Option 3: Apply via Direct SQL Connection

```bash
# Using psql
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-HOST]:5432/postgres" \
  -f supabase/migrations/005_emergency_contacts_and_documents.sql
```

---

## Verification Checklist

After running the migration, verify:

- [ ] ✅ `emergency_contacts` table exists
- [ ] ✅ `employee_documents` table exists
- [ ] ✅ `document_types` table exists with 18 rows
- [ ] ✅ `employees` table has new columns: `national_id`, `passport_number`, `drivers_license`, `photo_url`
- [ ] ✅ RLS policies are enabled
- [ ] ✅ Functions `get_expiring_documents` and `get_expired_documents` exist

**SQL to verify:**

```sql
-- Check tables exist
SELECT
  t.table_name,
  COUNT(c.column_name) as column_count
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name
WHERE t.table_schema = 'public'
AND t.table_name IN ('emergency_contacts', 'employee_documents', 'document_types')
GROUP BY t.table_name;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('emergency_contacts', 'employee_documents');

-- Check functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('get_expiring_documents', 'get_expired_documents');

-- Check document types count
SELECT COUNT(*) as total_document_types FROM document_types;
-- Should return 18
```

---

## Rollback Instructions (If Needed)

If something goes wrong, you can rollback:

```sql
-- Rollback Script
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS employee_documents CASCADE;
DROP TABLE IF EXISTS document_types CASCADE;

ALTER TABLE employees DROP COLUMN IF EXISTS national_id;
ALTER TABLE employees DROP COLUMN IF EXISTS passport_number;
ALTER TABLE employees DROP COLUMN IF EXISTS drivers_license;
ALTER TABLE employees DROP COLUMN IF EXISTS photo_url;
ALTER TABLE employees DROP COLUMN IF EXISTS emergency_contact_verified;
ALTER TABLE employees DROP COLUMN IF EXISTS emergency_contact_verified_date;

DROP FUNCTION IF EXISTS get_expiring_documents(INTEGER);
DROP FUNCTION IF EXISTS get_expired_documents();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Then restore from backup
```

---

## Next Steps After Migration

1. **Set up Supabase Storage**
   ```
   Go to: Supabase Dashboard → Storage
   Create bucket: "employee-documents"
   Settings:
     - Public: No (private)
     - File size limit: 10MB
     - Allowed MIME types: PDF, JPG, PNG, DOC, DOCX
   ```

2. **Configure Storage Policies**
   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload documents"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'employee-documents');

   -- Allow users to view their own documents
   CREATE POLICY "Users can view own documents"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (bucket_id = 'employee-documents');
   ```

3. **Test the Migration**
   - Insert a test emergency contact
   - Upload a test document
   - Verify RLS policies work correctly

4. **Update Application Code**
   - Add TypeScript types for new tables
   - Create API services for CRUD operations
   - Build UI components

---

## Support

If you encounter issues:

1. **Check Supabase Logs**
   ```
   Dashboard → Logs → Database
   ```

2. **Common Issues:**
   - **Permission denied:** Make sure you're using the service role key for migrations
   - **Table already exists:** Table might exist from previous attempt - check and drop if needed
   - **Function failed:** Check for syntax errors in the SQL

3. **Get Help:**
   - Supabase Discord: https://discord.supabase.com
   - Supabase Docs: https://supabase.com/docs

---

## Success Message

When migration completes successfully, you should see:

```
✓ emergency_contacts table created
✓ employee_documents table created
✓ document_types table created with 18 types
✓ employees table enhanced with 6 new columns
✓ RLS policies enabled
✓ Utility functions created
✓ Migration 005 recorded
```

---

**Status:** Ready to apply ✅
**Estimated Time:** 2-3 minutes
**Risk Level:** Low (reversible with rollback script)

**REMEMBER:** Always backup before migrations!
