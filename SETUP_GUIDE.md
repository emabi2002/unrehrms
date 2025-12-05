# PNG UNRE HRMS - Complete Setup Guide

## 🚀 Version 15 Features

This guide covers the setup and configuration of all the latest features added to the PNG UNRE HRMS system.

---

## 📧 Feature 1: Email Notifications

### Overview
Automatic email notifications are sent when leave requests are approved or rejected using Resend.

### Setup Steps

#### 1. Get Resend API Key
1. Visit [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to API Keys
4. Create a new API key
5. Copy the API key (starts with `re_`)

#### 2. Configure Environment Variables
Add to your `.env.local` file:
```env
RESEND_API_KEY=re_your_actual_api_key_here
```

#### 3. Verify Domain (Optional for Production)
For production use, verify your domain in Resend:
1. Go to Domains in Resend dashboard
2. Add your domain (e.g., `unre.ac.pg`)
3. Add the DNS records provided
4. Update the email sender in `src/app/api/send-email/route.ts`:
   ```typescript
   from: 'PNG UNRE HRMS <hrms@your-domain.com>',
   ```

### Email Templates

Two beautiful HTML email templates are included:

1. **Leave Approval Email** (`leaveApprovalTemplate`)
   - Professional green design
   - Complete leave details
   - PNG University branding

2. **Leave Rejection Email** (`leaveRejectionTemplate`)
   - Clear rejection notification
   - Reason for rejection displayed
   - Encourages resubmission

### Testing Email Notifications

1. Go to Leave Management
2. Click Approve or Reject on a pending request
3. Email will be sent to the employee's email address
4. Check for error toast if email fails (RESEND_API_KEY not set)

### Email Address Format
Emails are automatically generated as:
```
{employee_id}@unre.ac.pg
```
Example: `unre.2020.001@unre.ac.pg`

---

## 🌱 Feature 2: Database Seeding

### Overview
A comprehensive seeding script populates your Supabase database with realistic sample data.

### What Gets Seeded

- **20 Employees** across all departments
- **8 Departments** with descriptions and heads
- **5 Leave Requests** with different statuses
- **50 Attendance Records** (5 days × 10 employees)
- **10 Salary Slips** for December 2025

### Running the Seed Script

#### Method 1: Using npm script
```bash
cd png-unre-hrms-web
bun run seed
```

#### Method 2: Direct execution
```bash
cd png-unre-hrms-web
bun --env-file=.env.local scripts/seed-database.ts
```

### Expected Output
```
🌱 Starting database seed...

📁 Seeding departments...
✅ Seeded 8 departments

👥 Seeding employees...
✅ Seeded 20 employees

📅 Seeding leave requests...
✅ Seeded 5 leave requests

⏰ Seeding attendance records...
✅ Seeded 50 attendance records

💰 Seeding salary slips...
✅ Seeded 10 salary slips

✅ Database seeding completed successfully!
```

### Sample Employees Included

1. Dr. John Kila - Senior Lecturer (Environmental Sciences)
2. Sarah Puka - HR Officer (Administrative)
3. Prof. Mary Tone - Professor (Natural Resources)
4. David Kama - Systems Administrator (IT)
5. Grace Namu - Assistant Lecturer (Agriculture)
6. ... and 15 more!

### Customizing Seed Data

Edit `scripts/seed-database.ts` to:
- Add more employees
- Change departments
- Modify salary ranges
- Adjust leave requests
- Update attendance patterns

### Troubleshooting Seeding

**Error: Employees already exist**
- The script may fail if running twice
- This is normal due to unique constraints
- Delete existing data first if you want to re-seed

**Error: Foreign key constraint**
- Ensure tables are created in correct order
- Check Supabase schema matches `src/lib/supabase.ts`

---

## 📊 Feature 3: Chart.js Analytics

### Overview
Interactive, professional charts visualize HR data in the Reports module.

### Charts Included

#### 1. Employee Distribution Pie Chart
**Location:** Reports > Employee Distribution

**Features:**
- Visual breakdown of staff types
- Percentage calculations
- Hover tooltips
- PNG University colors

**Data Shown:**
- Academic Staff (Blue)
- Administrative Staff (Purple)
- Technical Staff (Orange)

#### 2. Department Comparison Bar Chart
**Location:** Reports > Department Comparison

**Features:**
- Dual Y-axis (employees & salary)
- Department-wise comparison
- Hover tooltips with details
- PNG University green accent

**Data Shown:**
- Number of employees per department
- Average salary per department

#### 3. Monthly Trends Line Chart
**Location:** Reports > 6-Month Trends

**Features:**
- Dual Y-axis (headcount & payroll)
- 6-month historical data
- Smooth curves with gradients
- Interactive data points

**Data Shown:**
- Employee count growth
- Payroll trends over time

### Chart Customization

All charts use PNG University branding:
- Primary color: `#008751` (PNG Green)
- Secondary color: `#3b82f6` (Blue)
- Accent color: `#a855f7` (Purple)

To modify chart colors, edit the chart components in:
- `src/components/charts/EmployeeDistributionChart.tsx`
- `src/components/charts/DepartmentComparisonChart.tsx`
- `src/components/charts/MonthlyTrendsChart.tsx`

### Chart Interactions

- **Hover**: See detailed tooltips
- **Legend**: Click to show/hide datasets
- **Responsive**: Charts adapt to screen size

---

## 🔧 Complete Environment Setup

### Required Environment Variables

Create `.env.local` with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Notifications
RESEND_API_KEY=re_your_resend_api_key_here
```

### Installation Steps

1. **Clone and Install**
   ```bash
   cd png-unre-hrms-web
   bun install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

3. **Setup Supabase Database**
   - Create tables (use schema in `src/lib/supabase.ts`)
   - Create storage bucket: `employee-profiles`
   - Set bucket to public access

4. **Seed Database**
   ```bash
   bun run seed
   ```

5. **Start Development Server**
   ```bash
   bun run dev
   ```

6. **Access Application**
   - Open [http://localhost:3000](http://localhost:3000)
   - Go to Dashboard
   - Explore all modules

---

## 📝 Feature Testing Checklist

### Email Notifications
- [ ] Set RESEND_API_KEY in .env.local
- [ ] Approve a leave request
- [ ] Check email inbox (or Resend logs)
- [ ] Reject a leave request with reason
- [ ] Verify rejection email received

### Database Seeding
- [ ] Run seed script successfully
- [ ] Check Employees page (should show 20 employees)
- [ ] Check Departments page (should show 8 departments)
- [ ] Check Leave page (should show 5 requests)
- [ ] Check Attendance page (should show records)

### Chart.js Analytics
- [ ] Go to Reports & Analytics page
- [ ] See Employee Distribution pie chart
- [ ] Hover over chart segments
- [ ] See Department Comparison bar chart
- [ ] See Monthly Trends line chart
- [ ] Charts are responsive on mobile

---

## 🎯 Quick Start Commands

```bash
# Install dependencies
bun install

# Setup environment
cp .env.example .env.local
# Then edit .env.local

# Seed database
bun run seed

# Run development server
bun run dev

# Build for production
bun run build

# Run production build
bun run start
```

---

## 📚 API Endpoints

### Email Sending
```typescript
POST /api/send-email
Body: {
  to: string
  subject: string
  html: string
  type: 'approval' | 'rejection'
}
```

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check RESEND_API_KEY is set
2. Check Resend dashboard for errors
3. Verify email format is correct
4. Check browser console for errors

### Charts Not Displaying
1. Clear browser cache
2. Check browser console for errors
3. Ensure Chart.js dependencies installed
4. Try different browser

### Seed Script Fails
1. Check Supabase credentials
2. Verify database tables exist
3. Check for unique constraint violations
4. Review Supabase logs

---

## 🚀 Next Steps

After completing setup:

1. **Customize Email Templates**
   - Edit `src/lib/email-templates.ts`
   - Add your logo
   - Customize colors and text

2. **Add More Seed Data**
   - Edit `scripts/seed-database.ts`
   - Add more employees and departments
   - Create historical data

3. **Enhance Charts**
   - Add more chart types
   - Create custom visualizations
   - Add export functionality

4. **Deploy to Production**
   - Follow `DEPLOYMENT.md`
   - Set environment variables on Netlify
   - Test all features in production

---

## 📞 Support

For issues or questions:
- Check `FEATURES_COMPLETED.md` for feature details
- Review `DEPLOYMENT.md` for deployment help
- Contact Same support at support@same.new

---

**🎉 You're all set! Your HRMS system now has:**
- ✅ Email notifications
- ✅ Database seeding
- ✅ Interactive charts
- ✅ Full CRUD operations
- ✅ Professional exports
- ✅ PNG University branding

Enjoy your fully functional HRMS! 🚀
