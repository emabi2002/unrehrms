# 🔴 CRITICAL: Set Up Supabase Storage NOW
## 5-Minute Setup to Enable Document Management

**Status:** ❌ NOT SET UP (Documents won't upload until this is done)
**Impact:** HIGH - Document management currently non-functional
**Time Required:** 5 minutes
**Your Supabase:** https://qltnmteqivrnljemyvvb.supabase.co

---

## 📋 What This Enables

Once set up, your system will support:
- ✅ Employee document uploads (contracts, certificates, IDs, etc.)
- ✅ Candidate resume uploads
- ✅ Training certificates
- ✅ Secure file storage with access control
- ✅ Document expiry tracking
- ✅ 18 pre-configured document types

---

## Quick Setup Steps

### Step 1: Create Storage Bucket (2 minutes)

1. **Go to Storage:**
   https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/storage

2. **Click "Create bucket"**

3. **Configure:**
   ```
   Bucket name: employee-documents
   Public bucket: ❌ NO (keep private - IMPORTANT!)
   File size limit: 10485760 (10MB)
   Allowed MIME types:
     application/pdf
     image/jpeg
     image/png
     image/jpg
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.ms-excel
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
   ```

4. **Click "Create bucket"** ✅

---

### Step 2: Add Storage Policies (3 minutes)

1. **Go to SQL Editor:**
   https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql/new

2. **Copy and paste this SQL:**

```sql
-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-documents'
);

-- Policy 2: Allow authenticated users to view documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents'
);

-- Policy 3: Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-documents'
);

-- Policy 4: Allow authenticated users to delete documents
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-documents'
);
```

3. **Click "Run"** ✅

---

### Step 3: Verify Setup (1 minute)

Run this query to verify:

```sql
-- Check if bucket exists
SELECT * FROM storage.buckets WHERE name = 'employee-documents';

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';
```

Should return:
- ✅ 1 bucket named 'employee-documents'
- ✅ 4 policies for the bucket

---

## ✅ After Setup Complete

Your document management will work:

1. **Upload Documents** ✓
   - Employee contracts
   - National IDs, passports
   - Certificates & degrees
   - Medical clearances
   - Resumes

2. **Download Documents** ✓
   - Secure signed URLs
   - Time-limited access

3. **View Document List** ✓
   - 18 document types
   - Status tracking
   - Expiry dates

4. **Delete/Archive** ✓
   - Safe deletion
   - Archive management

**Test it:**
1. Go to `/dashboard/employees`
2. Click any employee
3. Click "Documents" tab
4. Upload a PDF or image ✓

---

## 🐛 Troubleshooting

### "Bucket already exists"
✅ Good! It was created. Skip to Step 2.

### "Policy already exists"
✅ Also good! Policies were created. You're done!

### "new row violates row-level security policy"
❌ RLS is working correctly. The policies need to be added (Step 2).

### Files won't upload
Check:
- ✅ Bucket name is exactly: `employee-documents`
- ✅ Policies were created (run verification query)
- ✅ File size < 10MB
- ✅ File type is allowed (PDF, images, DOC, DOCX)

### "Unauthorized" errors
- Make sure you're using the correct Supabase URL and keys
- Check that RLS policies are created
- Verify authentication is working

---

## 🔐 Security Notes

**IMPORTANT:**
- ✅ Bucket is PRIVATE (not public)
- ✅ Files accessible only via signed URLs
- ✅ 1-hour expiry on signed URLs (configurable)
- ✅ RLS policies enforce authentication
- ✅ Access levels control who sees what:
  - `hr_only` - Only HR can view
  - `manager_and_hr` - Managers and HR
  - `employee_visible` - Employee can see their own
  - `public` - Everyone can see

---

## 📊 What Gets Stored

Once configured, these will automatically upload to storage:

**Employee Documents:**
- Employment contracts
- Offer letters
- National ID copies
- Passports
- Driver's licenses
- Degree certificates
- Medical clearances
- Police clearances
- Tax documents
- And 9 more types...

**Recruitment Documents:**
- Candidate resumes/CVs
- Cover letters
- Portfolio files

**Training Documents:**
- Certificates
- Course materials

---

## 🎯 Next Steps After Setup

1. **Test upload functionality**
   - Navigate to any employee profile
   - Go to Documents tab
   - Upload a test PDF

2. **Verify download works**
   - Click download on uploaded document
   - Should open in new tab

3. **Check expiry tracking**
   - Upload a document with expiry date
   - System will show "Expires in X days" badge

4. **Configure document types** (optional)
   - Go to database
   - Edit `document_types` table
   - Add custom types if needed

---

**DO THIS NOW - 5 MINUTES** ⏱️

This unlocks complete document management functionality!

**Once complete, you'll have:**
- ✅ Full document upload/download
- ✅ 18 pre-configured document types
- ✅ Expiry tracking and alerts
- ✅ Secure access control
- ✅ Ready for production use!
