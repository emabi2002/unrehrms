# 🧪 Testing Guide - Version 11

Comprehensive testing instructions for all activated features in the UNRE GE Request & Budget Control System.

---

## 📋 Pre-Test Setup Checklist

### ✅ Environment Setup
- [ ] Dev server is running (`bun run dev`)
- [ ] Supabase credentials are in `.env.local`
- [ ] Can access dashboard at `http://localhost:3000/dashboard`

### ✅ Database Setup (If not done)
- [ ] Run `.same/add-documents-table.sql` in Supabase SQL Editor
- [ ] Verify `documents` table exists
- [ ] Create `documents` storage bucket in Supabase

---

## 1. PGAS Import Testing

### Test File Location
**Sample CSV**: `public/sample-pgas-budget.csv`

### Test Steps:
1. **Access PGAS Page**
   - Navigate to `/dashboard/pgas`
   - Verify page loads without errors

2. **Download Template**
   - Click "Download Template" button
   - Verify Excel file downloads
   - Open file and verify format matches sample

3. **Import Sample Data**
   - Click "Choose Files" or drag the sample CSV
   - File should appear in the upload area
   - Click "Upload and Synchronize"
   - Watch for progress toasts

4. **Verify Import Results**
   - Import results card should appear
   - Check statistics:
     - New Lines: Number of budget lines created
     - Updated: Number updated
     - Total Amount: Sum of all amounts
     - Errors: Should be 0
   - Verify no errors displayed

5. **Check Database**
   - Go to Supabase → Database → cost_centres
   - Verify new cost centres created (AGR, FOR, SCI, etc.)
   - Go to budget_lines table
   - Verify 20 budget lines created with correct amounts

### Expected Results:
✅ 10 cost centres created (or fewer if some exist)
✅ 20 budget lines imported
✅ Total amount: K 3,637,000
✅ No errors
✅ Import results display correctly

### Troubleshooting:
- **Error**: "No valid budget lines found"
  - Check CSV format matches template
  - Ensure headers are correct

- **Error**: "Failed to create cost centre"
  - Check database permissions
  - Verify Supabase connection

---

## 2. Payment Export Testing

### Test Steps:
1. **Access Payments Page**
   - Navigate to `/dashboard/payments`
   - Wait for payments to load

2. **Test Excel Export**
   - Click "Export Payments" button
   - Export dialog should appear
   - Click "Export to Excel" option
   - Verify `.xlsx` file downloads
   - Open file in Excel/Sheets
   - Verify all payment data is present

3. **Test PDF Export**
   - Click "Export Payments" button
   - Click "Export to PDF" option
   - Verify PDF file downloads
   - Open PDF
   - Verify formatted payment register

### Expected Results:
✅ Export dialog displays with both options
✅ Excel file contains all payment columns
✅ PDF is formatted professionally
✅ All payment data is accurate
✅ File names include date/time

---

## 3. Document Upload (GE Requests)

### Test Steps:
1. **Create New GE Request**
   - Navigate to `/dashboard/requests/new`
   - Scroll to "Supporting Documents" section

2. **Test Drag & Drop**
   - Drag a PDF file onto the upload area
   - Verify file appears in the list
   - Check file icon and size display

3. **Test Click Upload**
   - Click "Choose Files" button
   - Select multiple files (2-3)
   - Verify all files appear

4. **Test File Validation**
   - Try uploading a very large file (>10MB)
   - Should show error message
   - Try unsupported file type (.exe, .zip)
   - Should show error message

5. **Test File Removal**
   - Click X button on a file
   - Verify file is removed from list

### Expected Results:
✅ Drag & drop works smoothly
✅ File icons display correctly (PDF, Image, Excel)
✅ File sizes shown in readable format
✅ Large files rejected with clear error
✅ Invalid file types rejected
✅ Files can be removed

### Note:
To test actual upload to Supabase, you need to:
- Set up storage bucket (see SUPABASE_SETUP_INSTRUCTIONS.md)
- Submit a complete GE request

---

## 4. Payment Voucher Documents

### Test Steps:
1. **Open Create Payment Voucher Dialog**
   - Go to `/dashboard/payments`
   - Click "New Payment Voucher"

2. **Fill Required Fields**
   - Select a commitment
   - Select a supplier
   - Enter amount and date
   - Add description

3. **Upload Documents**
   - Scroll to "Supporting Documents"
   - Upload 1-2 invoices (PDF or images)
   - Verify files appear in list

4. **Submit Payment Voucher**
   - Click "Create Payment Voucher"
   - Should show uploading message
   - Should create voucher with documents

### Expected Results:
✅ File upload section appears
✅ Can upload up to 5 files
✅ Only PDF and images accepted
✅ Upload progress shown
✅ Success message includes document count
✅ Documents linked to payment voucher

---

## 5. Batch Payment Operations

### Test Selection:
1. **Navigate to Payments**
   - Go to `/dashboard/payments`
   - Wait for payments to load

2. **Test Individual Selection**
   - Click checkbox on first payment
   - Header shows "1 payment(s) selected"
   - Batch buttons appear

3. **Test Select All**
   - Click checkbox in table header
   - All visible payments selected
   - Shows total count selected

4. **Test Clear Selection**
   - Click "Clear Selection" button
   - All checkboxes uncheck
   - Batch buttons disappear

### Test Batch Export:
1. **Select Multiple Payments**
   - Check 3-5 payments
   - Click "Export Selected (X)"

2. **Choose Format**
   - Dialog asks: OK = Excel, Cancel = PDF
   - Click OK for Excel

3. **Verify Export**
   - File downloads with selected payments only
   - Count matches selection

### Test Batch Approve:
1. **Filter Pending Payments**
   - Select "Pending" from status filter
   - Select 2-3 pending payments
   - Click "Approve Selected"

2. **Confirm Action**
   - Confirmation dialog appears
   - Click OK

3. **Verify Results**
   - Success toast shows count approved
   - Selected payments now show "Approved" status
   - Selection cleared automatically

### Expected Results:
✅ Checkboxes work smoothly
✅ Select all works
✅ Selection count updates
✅ Batch buttons only show when selected
✅ Export exports only selected
✅ Approve only affects pending payments
✅ Confirmation dialog prevents accidents

---

## 6. Integration Testing

### End-to-End Workflow:
1. **Import PGAS Budget**
   - Import sample CSV
   - Verify budget lines created

2. **Create GE Request**
   - Use one of the imported budget lines
   - Upload supporting documents
   - Submit request

3. **Approve Request**
   - Go to approvals page
   - Approve the request
   - Verify commitment created

4. **Create Payment**
   - Go to payments page
   - Create payment voucher
   - Upload invoice
   - Submit

5. **Batch Export**
   - Select multiple payments
   - Export to Excel
   - Verify data

### Expected Results:
✅ Complete workflow works seamlessly
✅ Budget deductions are accurate
✅ Documents are linked correctly
✅ All exports work
✅ No errors occur

---

## 📊 Test Results Template

Copy and fill this for each test:

```markdown
## Test: [Feature Name]
**Date**: [Date]
**Tester**: [Your Name]
**Browser**: [Chrome/Firefox/Safari]

### Test Steps
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Results
✅ Passed / ❌ Failed

### Issues Found
- Issue 1: Description
- Issue 2: Description

### Screenshots
[Attach if needed]

### Notes
[Any additional observations]
```

---

## 🐛 Known Issues & Limitations

### Current Limitations:
1. **Document Upload**: Requires Supabase Storage setup
2. **Batch Approve**: Uses mock implementation (needs API integration)
3. **File Preview**: No preview modal yet
4. **Document Download**: Direct download only (no viewer)

### Performance Notes:
- Large PGAS imports (>1000 lines) may take 30-60 seconds
- File uploads depend on internet speed
- Export operations are client-side (fast)

---

## ✅ Success Criteria

All features are considered working if:

1. **PGAS Import**
   - ✅ Can parse CSV/Excel files
   - ✅ Creates cost centres and budget lines
   - ✅ Shows detailed results
   - ✅ Handles errors gracefully

2. **Payment Export**
   - ✅ Excel export works
   - ✅ PDF export works
   - ✅ Data is complete and accurate

3. **Document Upload**
   - ✅ Drag & drop works
   - ✅ File validation works
   - ✅ Files can be removed
   - ✅ Uploads to Supabase (when configured)

4. **Batch Operations**
   - ✅ Selection works
   - ✅ Batch export works
   - ✅ Batch approve works (or shows mock message)
   - ✅ UI updates correctly

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify Supabase connection
3. Check `.env.local` configuration
4. Review SUPABASE_SETUP_INSTRUCTIONS.md
5. Contact support@same.new

---

**Testing Time**: 30-45 minutes for full suite
**Version**: 11.0
**Last Updated**: November 2025
**Status**: Ready for Testing ✅
