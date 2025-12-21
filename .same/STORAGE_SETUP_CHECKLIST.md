# ✅ Supabase Storage Setup - Quick Checklist
## Follow These Steps (5 Minutes)

**Your Supabase Project:** https://qltnmteqivrnljemyvvb.supabase.co

---

## Step 1: Create Storage Bucket (2 min)

### Actions:
1. ✅ Open: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/storage
2. ✅ Click the **"New bucket"** button
3. ✅ Fill in the form:

```
Name: employee-documents
Public bucket: ❌ UNCHECK THIS (keep private!)
File size limit: 10485760
Allowed MIME types: (paste all of these)
  application/pdf
  image/jpeg
  image/png
  image/jpg
  application/msword
  application/vnd.openxmlformats-officedocument.wordprocessingml.document
  application/vnd.ms-excel
  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
```

4. ✅ Click **"Create bucket"**

**Expected Result:** You should see "employee-documents" bucket in the list

---

## Step 2: Add Storage Policies (3 min)

### Actions:
1. ✅ Open SQL Editor: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/sql/new

2. ✅ **Copy this ENTIRE SQL block:**

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow uploads
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employee-documents'
);

-- Policy 2: Allow downloads
CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employee-documents'
);

-- Policy 3: Allow updates
CREATE POLICY "Authenticated users can update documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'employee-documents'
);

-- Policy 4: Allow deletes
CREATE POLICY "Authenticated users can delete documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employee-documents'
);

-- Success message
SELECT 'Storage policies created successfully!' AS status;
```

3. ✅ Paste into SQL Editor
4. ✅ Click **"Run"** (or press Ctrl+Enter)

**Expected Result:** Should see "Storage policies created successfully!" message

---

## Step 3: Verify Setup (1 min)

### Actions:
1. ✅ In the same SQL Editor, run this verification:

```sql
-- Check bucket exists
SELECT
  id,
  name,
  public,
  file_size_limit
FROM storage.buckets
WHERE name = 'employee-documents';

-- Should return 1 row with:
-- name: employee-documents
-- public: false
-- file_size_limit: 10485760
```

2. ✅ Then run this to verify policies:

```sql
-- Check policies
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%documents%';

-- Should return 4 rows (upload, view, update, delete policies)
```

**Expected Results:**
- ✅ 1 bucket found
- ✅ 4 policies created

---

## Step 4: Test Upload (2 min)

### Option A: Test via UI
1. ✅ Go to: http://localhost:3000/dashboard/employees
2. ✅ Click on any employee
3. ✅ Click **"Documents"** tab
4. ✅ Click **"Upload Document"**
5. ✅ Select a test PDF or image
6. ✅ Fill in the form and upload

**Expected:** File uploads successfully, appears in the list

### Option B: Quick Test via Supabase Dashboard
1. ✅ Go to: https://supabase.com/dashboard/project/qltnmteqivrnljemyvvb/storage/buckets/employee-documents
2. ✅ Click **"Upload file"**
3. ✅ Upload a test file

**Expected:** File appears in the bucket

---

## ✅ Success Checklist

After completing all steps, you should have:

- [✅] Bucket "employee-documents" exists
- [✅] Bucket is PRIVATE (not public)
- [✅] File size limit: 10MB
- [✅] 4 storage policies created
- [✅] Test upload works
- [✅] Test download works

---

## 🐛 Troubleshooting

### "Bucket already exists"
✅ **Good!** Skip Step 1, go to Step 2.

### "Policy already exists"
✅ **Good!** Policies were already created. Skip to Step 3.

### "Permission denied" when uploading
❌ **Issue:** Policies not created correctly
**Fix:** Re-run Step 2 SQL

### "Bucket not found" error
❌ **Issue:** Bucket name typo
**Fix:** Check bucket name is exactly `employee-documents` (with hyphen, not underscore)

### Upload works but download fails
❌ **Issue:** SELECT policy missing
**Fix:** Re-run this policy:
```sql
CREATE POLICY "Authenticated users can view documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents');
```

---

## 📊 What This Enables

Once complete, these features will work:

✅ **Employee Documents:**
- Upload contracts, IDs, certificates
- 18 document types available
- Expiry tracking
- Secure downloads

✅ **Recruitment:**
- Candidate resume uploads
- Document verification

✅ **Training:**
- Certificate uploads
- Course materials

✅ **All Secure:**
- Private bucket (not publicly accessible)
- Signed URLs (expire after 1 hour)
- RLS policies enforce authentication

---

## 🎯 After Setup

Once storage is configured:

1. **Test document upload:**
   - Navigate to any employee
   - Upload a test document
   - Verify download works

2. **Check existing pages:**
   - Employee documents page should work
   - Resume uploads in candidates page should work

3. **Ready for production:**
   - Storage is secure
   - All document types configured
   - Expiry tracking enabled

---

## 📞 Need Help?

If you encounter any issues:

1. **Check browser console** for errors
2. **Verify bucket name** is exactly `employee-documents`
3. **Confirm policies** are created (Step 3)
4. **Check file size** is under 10MB
5. **Verify file type** is allowed (PDF, images, DOC)

---

**Total Time:** 5 minutes
**Difficulty:** Easy
**Impact:** HIGH - Unlocks all document management features!

---

*Follow these steps now, then report back with results!*
