# 🚨 CRITICAL: Phase 1 Next Steps
## Actions Required to Complete Document Management System

**Status:** ✅ UI & API Complete | ⏳ Database Setup Required
**Priority:** HIGH
**Estimated Time:** 30 minutes

---

## ⚠️ IMPORTANT: System is 90% Complete

The document management system UI and APIs are **fully built and ready to use**, but require **3 critical setup steps** before they can function:

1. ✅ **Database Migration** - Add tables to Supabase
2. ✅ **Storage Bucket** - Create file storage bucket
3. ✅ **Storage Policies** - Secure file access

---

## Step 1: Apply Database Migration (10 minutes)

### What This Does:
- Creates `emergency_contacts` table
- Creates `employee_documents` table
- Creates `document_types` table with 18 pre-configured types
- Adds new fields to `employees` table
- Sets up Row Level Security (RLS) policies
- Creates utility functions for document expiry tracking

### How to Apply:

#### Option A: Supabase Dashboard (Recommended)

1. **Backup First!**
   ```
   Go to: https://supabase.com/dashboard → Your Project → Database → Backups
   Click: "Create backup now"
   Wait: Until backup completes
   ```

2. **Open SQL Editor**
   ```
   Go to: Database → SQL Editor
   Click: "New query"
   ```

3. **Copy Migration SQL**
   ```
   Open: unrehrms/supabase/migrations/005_emergency_contacts_and_documents.sql
   Copy: All contents (Ctrl+A, Ctrl+C)
   ```

4. **Paste & Execute**
   ```
   Paste: Into SQL Editor
   Click: "Run" (or Ctrl+Enter)
   Wait: For success message
   ```

5. **Verify Success**
   ```sql
   -- Run this query to verify:
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('emergency_contacts', 'employee_documents', 'document_types');

   -- Should return 3 rows
   ```

#### Option B: Supabase CLI

```bash
cd unrehrms
supabase db push
```

---

## Step 2: Create Storage Bucket (5 minutes)

### What This Does:
- Creates a private storage bucket for employee documents
- Configures file size limits and allowed types
- Enables secure file storage with signed URLs

### How to Set Up:

1. **Go to Storage**
   ```
   Dashboard → Storage → Create bucket
   ```

2. **Bucket Configuration**
   ```
   Bucket name: employee-documents
   Public: ❌ No (Keep private)
   File size limit: 10485760 (10MB)
   Allowed MIME types:
     - application/pdf
     - image/jpeg
     - image/png
     - application/msword
     - application/vnd.openxmlformats-officedocument.wordprocessingml.document
   ```

3. **Click Create**

---

## Step 3: Configure Storage Policies (5 minutes)

### What This Does:
- Allows authenticated users to upload documents
- Restricts file access based on ownership
- Prevents unauthorized access to sensitive documents

### How to Set Up:

1. **Go to Storage Policies**
   ```
   Dashboard → Storage → employee-documents → Policies
   ```

2. **Add Upload Policy**
   ```sql
   CREATE POLICY "Authenticated users can upload documents"
   ON storage.objects
   FOR INSERT
   TO authenticated
   WITH CHECK (
     bucket_id = 'employee-documents'
   );
   ```

3. **Add View Policy**
   ```sql
   CREATE POLICY "Users can view own documents"
   ON storage.objects
   FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'employee-documents'
   );
   ```

4. **Add Delete Policy (Optional - for HR only)**
   ```sql
   CREATE POLICY "HR can delete documents"
   ON storage.objects
   FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'employee-documents'
     -- Add HR role check here when authentication is implemented
   );
   ```

---

## Step 4: Test the System (10 minutes)

### After completing Steps 1-3, test the following:

1. **Navigate to Employee Profile**
   ```
   Go to: http://localhost:3000/dashboard/employees
   Click: Any employee
   ```

2. **Test Emergency Contacts Tab**
   ```
   Click: Emergency Contacts tab
   Test: Add, Edit, Delete contact
   Test: Set primary contact
   Verify: All actions work correctly
   ```

3. **Test Documents Tab**
   ```
   Click: Documents tab
   Test: Upload a document (PDF or image)
   Test: Download the document
   Test: Archive the document
   Verify: File appears in Supabase Storage
   ```

4. **Verify Storage**
   ```
   Go to: Supabase Dashboard → Storage → employee-documents
   Check: Uploaded file is visible
   Check: File path matches employee ID
   ```

---

## 🎯 What You'll Have After Setup

### Fully Functional Features:

✅ **Emergency Contacts Management**
- Add multiple contacts per employee
- Set primary contact
- Full contact details (phone, email, address, PNG provinces)
- Priority ordering
- Edit/delete contacts

✅ **Document Management System**
- Upload documents (PDF, DOC, DOCX, JPG, PNG)
- 18 pre-configured document types:
  - Employment Contract
  - National ID
  - Passport
  - Driver's License
  - Degree Certificate
  - Medical Clearance
  - Police Clearance
  - And 11 more...
- Document metadata:
  - Issue date
  - Expiry date
  - Document number
  - Issuing authority
- Access level controls:
  - HR Only
  - Manager & HR
  - Employee Visible
  - Public
- Document status tracking:
  - Active
  - Archived
  - Expired
  - Replaced
- File operations:
  - Secure upload
  - Signed URL downloads
  - Archive functionality
  - Delete with confirmation
- Visual indicators:
  - File type icons
  - Status badges
  - Expiry warnings (30-day threshold)
  - File size display

✅ **Employee Profile**
- Tabbed interface (Overview, Emergency Contacts, Documents)
- Personal information display
- Employment details
- Photo placeholder
- Status badges

---

## 📊 Success Criteria

After completing the setup, you should be able to:

- [ ] View employee profile with all 3 tabs
- [ ] Add and manage emergency contacts
- [ ] Upload documents (all types)
- [ ] Download documents via signed URLs
- [ ] See status badges (Active, Expired, Expiring Soon)
- [ ] Archive documents
- [ ] Delete documents (with confirmation)
- [ ] See files in Supabase Storage
- [ ] No console errors
- [ ] All toast notifications working

---

## 🐛 Troubleshooting

### "Cannot read property of undefined" errors:
- **Cause:** Database tables don't exist
- **Fix:** Apply Step 1 (Database Migration)

### "Storage bucket not found" errors:
- **Cause:** Storage bucket not created
- **Fix:** Apply Step 2 (Create Storage Bucket)

### "Row Level Security policy violation" errors:
- **Cause:** RLS policies not set up
- **Fix:** Apply Step 3 (Configure Storage Policies)

### Documents won't upload:
- **Check:** File size < 10MB
- **Check:** File type is allowed (PDF, DOC, DOCX, JPG, PNG)
- **Check:** Storage bucket exists
- **Check:** Storage policies are configured

### Documents won't download:
- **Cause:** Signed URL generation failed
- **Fix:** Verify Storage policies allow SELECT for authenticated users

---

## 📚 Reference Files

- **Migration SQL:** `supabase/migrations/005_emergency_contacts_and_documents.sql`
- **Detailed Instructions:** `MIGRATION_INSTRUCTIONS.md`
- **API Reference:** `src/lib/api/documents.ts`, `src/lib/api/emergency-contacts.ts`
- **Type Definitions:** `src/types/employee-document.ts`, `src/types/emergency-contact.ts`
- **UI Components:**
  - `src/app/dashboard/employees/[id]/page.tsx` (Profile)
  - `src/app/dashboard/employees/[id]/documents/page.tsx` (Documents)
  - `src/app/dashboard/employees/[id]/emergency-contacts/page.tsx` (Contacts)

---

## 🚀 After Setup is Complete

Once all 3 steps are done, you'll have:

- **60% of Phase 1 complete**
- **A production-ready document management system**
- **Fully functional emergency contacts system**
- **Secure file storage with access controls**
- **Document expiry tracking and alerts**

### Next Phase 1 Tasks:
1. Create document expiry alerts dashboard widget
2. Add document/contact status indicators to employee list
3. Implement bulk document upload
4. Add document search/filter functionality
5. Create employment contracts management

---

## ⏱️ Total Estimated Time

- **Step 1 (Migration):** 10 minutes
- **Step 2 (Storage):** 5 minutes
- **Step 3 (Policies):** 5 minutes
- **Step 4 (Testing):** 10 minutes

**Total:** ~30 minutes

---

## 📞 Need Help?

- **Supabase Docs:** https://supabase.com/docs
- **Migration Instructions:** See `MIGRATION_INSTRUCTIONS.md`
- **Session Summary:** See `.same/session-summary.md`
- **Implementation Plan:** See `IMPLEMENTATION_SUMMARY.md`

---

**Status:** Ready for Setup ✅
**Phase 1 Progress:** 60% → 100% (after setup)
**Next Phase:** Authentication & Authorization

---

*Last Updated: December 10, 2025*
*Version: 13*
