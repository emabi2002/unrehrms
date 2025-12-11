# 🔧 Supabase Setup Instructions

Complete setup guide for enabling document uploads and storage in the UNRE GE System.

---

## Step 1: Create Storage Bucket

### 1.1 Access Supabase Dashboard
1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your UNRE project

### 1.2 Create Documents Bucket
1. Click **Storage** in the left sidebar
2. Click **"New bucket"** button
3. Configure the bucket:
   - **Name**: `documents`
   - **Public bucket**: ❌ **Leave UNCHECKED** (private)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: Leave empty (allow all)
4. Click **"Create bucket"**

### 1.3 Create Uploads Bucket (Optional)
Repeat the same process for temporary uploads:
   - **Name**: `uploads`
   - **Public bucket**: ❌ **Leave UNCHECKED**
   - **File size limit**: `10485760` (10MB)

---

## Step 2: Configure Storage Policies

### 2.1 Set Up RLS Policies for Documents Bucket
1. In Storage, click on the **`documents`** bucket
2. Click **"Policies"** tab
3. Click **"New Policy"**

### Policy 1: Allow Authenticated Users to Upload
```sql
-- Policy Name: Allow authenticated uploads
-- Allowed operation: INSERT

CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);
```

### Policy 2: Allow Users to Read Their Documents
```sql
-- Policy Name: Allow users to read documents
-- Allowed operation: SELECT

CREATE POLICY "Allow users to read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() IS NOT NULL
);
```

### Policy 3: Allow Users to Delete Their Documents
```sql
-- Policy Name: Allow users to delete their uploads
-- Allowed operation: DELETE

CREATE POLICY "Allow users to delete their uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND auth.uid() = owner
);
```

---

## Step 3: Run Documents Table Migration

### 3.1 Access SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **"New query"**

### 3.2 Copy and Run Migration
1. Open the file: `.same/add-documents-table.sql`
2. Copy the ENTIRE contents
3. Paste into Supabase SQL Editor
4. Click **"Run"** button
5. Wait for confirmation: ✅ "Success. No rows returned"

### 3.3 Verify Tables Created
1. Click **Database** in the left sidebar
2. Click **Tables**
3. Verify you see:
   - ✅ `documents` table
   - ✅ Functions created (check Functions tab)
   - ✅ Triggers created

---

## Step 4: Test Storage Connection

### 4.1 Quick Test in SQL Editor
Run this query to test storage access:

```sql
-- Test storage bucket exists
SELECT * FROM storage.buckets WHERE name = 'documents';
```

Expected result: One row with bucket details

### 4.2 Test Upload (Optional)
You can test upload directly in Supabase:
1. Go to **Storage** → **documents** bucket
2. Click **Upload file**
3. Select any test file
4. Verify it uploads successfully
5. Delete the test file

---

## Step 5: Verify Environment Variables

### 5.1 Check .env.local File
Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5.2 Get Values from Supabase
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 6: Test in Application

### 6.1 Test Document Upload
1. Restart your dev server: `bun run dev`
2. Go to `/dashboard/requests/new`
3. Scroll to "Supporting Documents"
4. Try uploading a file (drag & drop or click)
5. Check if file appears in the list

### 6.2 Verify in Supabase
1. Go to **Storage** → **documents** bucket
2. You should see uploaded files
3. Click on a file to view details

### 6.3 Verify in Database
Run in SQL Editor:
```sql
-- Check documents table
SELECT * FROM documents ORDER BY uploaded_at DESC LIMIT 10;
```

---

## Step 7: Optional - Enable Public Access (If Needed)

If you need public URLs for some documents:

### 7.1 Make Specific Folders Public
```sql
-- Make a specific path public
CREATE POLICY "Public read for public folder"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'public'
);
```

### 7.2 Update Bucket Settings
1. Go to **Storage** → **documents**
2. Click **Configuration**
3. Toggle **"Public bucket"** if needed
4. **⚠️ Warning**: This makes ALL files public!

---

## Troubleshooting

### Issue: "403 Forbidden" when uploading
**Solution**:
- Check RLS policies are created correctly
- Verify user is authenticated
- Check bucket name matches exactly (`documents`)

### Issue: Files upload but don't save to database
**Solution**:
- Verify documents table migration ran successfully
- Check application code is calling `uploadDocument()` function
- Look for errors in browser console

### Issue: "Bucket not found"
**Solution**:
- Verify bucket name is exactly `documents` (lowercase)
- Refresh Supabase dashboard
- Check Storage section for bucket existence

### Issue: Environment variables not working
**Solution**:
- Restart dev server after changing `.env.local`
- Verify no typos in variable names
- Check values are correct (no extra spaces)

---

## Security Best Practices

### ✅ DO:
- Keep buckets private by default
- Use RLS policies to control access
- Validate file types and sizes in application
- Use signed URLs for private files
- Scan uploaded files for malware (if possible)

### ❌ DON'T:
- Make buckets public unless absolutely necessary
- Store sensitive files without encryption
- Allow unlimited file sizes
- Skip file validation
- Store passwords or API keys in files

---

## Monitoring & Maintenance

### Check Storage Usage
1. Go to **Settings** → **Usage**
2. Monitor:
   - Storage size
   - Number of API requests
   - Bandwidth usage

### Regular Cleanup
Run periodic cleanup for old files:
```sql
-- Find documents older than 1 year marked as deleted
SELECT * FROM documents
WHERE is_deleted = TRUE
AND deleted_at < NOW() - INTERVAL '1 year';
```

---

## Quick Reference

### Bucket Names:
- `documents` - Main document storage
- `uploads` - Temporary uploads (optional)

### Key Functions:
- `uploadDocument(file, 'documents', 'folder')` - Upload file
- `getDocumentUrl(path, 'documents')` - Get public URL
- `downloadDocument(path, 'documents')` - Download file
- `deleteDocument(path, 'documents')` - Delete file

### Database Functions:
- `get_documents_for_record('ge_request', id)` - Get all documents
- `soft_delete_document(doc_id, user_id)` - Soft delete
- `get_document_stats()` - Get statistics

---

## ✅ Completion Checklist

Mark each as complete:

### Storage Setup
- [ ] Created `documents` bucket in Supabase
- [ ] Configured bucket as private
- [ ] Set file size limit to 10MB
- [ ] Created RLS policies for upload/read/delete

### Database Setup
- [ ] Ran `add-documents-table.sql` migration
- [ ] Verified `documents` table exists
- [ ] Checked functions and triggers created
- [ ] Tested queries in SQL Editor

### Environment Setup
- [ ] Updated `.env.local` with Supabase credentials
- [ ] Restarted dev server
- [ ] Verified connection works

### Application Testing
- [ ] Tested file upload in GE request form
- [ ] Verified files appear in Supabase Storage
- [ ] Checked documents table has records
- [ ] Confirmed file download works

---

**Setup Time**: 15-20 minutes
**Difficulty**: Intermediate
**Status**: Ready for Production ✅

For support, contact: support@same.new
