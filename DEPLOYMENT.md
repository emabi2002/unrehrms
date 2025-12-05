# Deployment Guide - PNG University HRMS

This guide walks you through deploying the PNG University HRMS & Payroll System.

## 🚀 Quick Deployment Options

### Option 1: Deploy to Netlify (Recommended)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/emabi2002/unrehrms)

1. **Click the button above** or go to [Netlify](https://app.netlify.com)
2. **Connect your GitHub account**
3. **Select the repository**: `emabi2002/unrehrms`
4. **Configure build settings**:
   - Build command: `bun run build` or `npm run build`
   - Publish directory: `.next`
   - Node version: `18` or higher

5. **Add environment variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

6. **Deploy!** - Your site will be live in minutes

**Your site will be available at**: `https://your-site-name.netlify.app`

---

### Option 2: Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emabi2002/unrehrms)

1. **Click the button above** or go to [Vercel](https://vercel.com)
2. **Import Git Repository**
   - Connect GitHub
   - Select `emabi2002/unrehrms`

3. **Configure Project**:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: (auto-detected)
   - Output Directory: (auto-detected)

4. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

5. **Deploy!** - Vercel will build and deploy automatically

**Your site will be available at**: `https://your-project.vercel.app`

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] **Supabase account** created at [supabase.com](https://supabase.com)
- [ ] **Database tables** created (see Database Setup below)
- [ ] **Environment variables** ready
- [ ] **Custom domain** (optional) purchased/configured

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Enter project details:
   - Name: `PNG-UNRE-HRMS`
   - Database Password: (create a strong password)
   - Region: Choose closest to Papua New Guinea (e.g., Southeast Asia)

4. Wait for project to initialize (~2 minutes)

### Step 2: Create Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click **"New Query"**
3. Copy and paste the following SQL:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Employees table
create table employees (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default now(),
  first_name text not null,
  last_name text not null,
  email text unique not null,
  phone text,
  employee_id text unique not null,
  department text not null,
  position text not null,
  employment_type text not null,
  hire_date date not null,
  salary numeric not null,
  status text check (status in ('active', 'on_leave', 'terminated')) default 'active'
);

-- Departments table
create table departments (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  description text,
  head_of_department text
);

-- Leave requests table
create table leave_requests (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  reason text,
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Attendance table
create table attendance (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) on delete cascade,
  date date not null,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  status text check (status in ('present', 'absent', 'late', 'half_day')),
  unique(employee_id, date)
);

-- Salary slips table
create table salary_slips (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id) on delete cascade,
  month text not null,
  year integer not null,
  basic_salary numeric not null,
  allowances numeric default 0,
  deductions numeric default 0,
  net_salary numeric not null,
  created_at timestamp with time zone default now(),
  unique(employee_id, month, year)
);

-- Enable Row Level Security
alter table employees enable row level security;
alter table departments enable row level security;
alter table leave_requests enable row level security;
alter table attendance enable row level security;
alter table salary_slips enable row level security;

-- Create indexes for better performance
create index idx_employees_department on employees(department);
create index idx_employees_status on employees(status);
create index idx_leave_requests_employee on leave_requests(employee_id);
create index idx_leave_requests_status on leave_requests(status);
create index idx_attendance_employee on attendance(employee_id);
create index idx_attendance_date on attendance(date);
create index idx_salary_slips_employee on salary_slips(employee_id);

-- Insert sample departments
insert into departments (name, description) values
  ('Faculty of Environmental Sciences', 'Environmental research and education'),
  ('Faculty of Natural Resources', 'Natural resources management'),
  ('Faculty of Agriculture', 'Agricultural sciences'),
  ('Administrative Services', 'University administration'),
  ('IT Department', 'Information technology services');
```

4. Click **"Run"** to execute the SQL
5. Verify tables are created in the **Table Editor**

### Step 3: Set Up Row Level Security Policies

For production, add RLS policies to secure your data:

```sql
-- Example: Allow authenticated users to read employees
create policy "Employees are viewable by authenticated users"
  on employees for select
  to authenticated
  using (true);

-- Add more policies based on your access control requirements
```

### Step 4: Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public key**: `eyJxxx...`
   - **service_role key**: `eyJxxx...` (⚠️ Keep this secret!)

---

## 🔐 Environment Variables Setup

### For Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
   ```

### For Netlify Deployment

1. Go to **Site Settings** > **Build & Deploy** > **Environment Variables**
2. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL
3. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
4. **Redeploy** the site

### For Vercel Deployment

1. Go to **Project Settings** > **Environment Variables**
2. Add each variable with values
3. Select **Production**, **Preview**, and **Development**
4. **Redeploy** from the deployments page

---

## 🌐 Custom Domain Setup

### Netlify

1. Go to **Site Settings** > **Domain Management**
2. Click **"Add custom domain"**
3. Enter your domain: `hrms.unre.ac.pg`
4. Follow DNS configuration instructions
5. Enable HTTPS (automatic with Let's Encrypt)

### Vercel

1. Go to **Project Settings** > **Domains**
2. Add your domain
3. Configure DNS records as shown
4. SSL certificate will be auto-provisioned

---

## 🔄 Continuous Deployment

Both platforms support automatic deployments:

- **Netlify**: Auto-deploys on push to `main` branch
- **Vercel**: Auto-deploys on push to `main` branch

### Workflow:
```
1. Make changes locally
2. git add . && git commit -m "Update"
3. git push origin main
4. Platform auto-deploys new version
```

---

## 🧪 Testing Deployment

After deployment, verify:

- [ ] Site loads correctly
- [ ] PNG University green branding is visible
- [ ] No console errors in browser DevTools
- [ ] Environment variables are set (check Network tab for API calls)
- [ ] Database connection works (once authentication is added)

---

## 📊 Monitoring & Analytics

### Netlify Analytics
- Enable in **Site Settings** > **Analytics**
- View traffic, performance, and errors

### Vercel Analytics
- Automatically enabled for all deployments
- View in **Analytics** tab

### Supabase Monitoring
- Check database health in **Database** > **Settings**
- Monitor API usage in **Project Settings**

---

## 🔧 Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Solution**: Ensure all dependencies are in `package.json`
- Run `bun install` locally to verify

**Error**: `Environment variable not found`
- **Solution**: Add all required env vars in platform settings

### Site Loads But Shows Errors

**Error**: `Failed to fetch from Supabase`
- **Solution**: Verify environment variables are correct
- Check Supabase project is running
- Verify database tables exist

**Error**: `CORS error`
- **Solution**: Add your deployed URL to Supabase allowed origins
- Go to **Authentication** > **URL Configuration**

### Slow Performance

- Enable caching in Netlify/Vercel settings
- Optimize images (use Next.js Image component)
- Check Supabase query performance

---

## 📱 Mobile Access

The site is fully responsive and works on:
- ✅ Desktop browsers
- ✅ Tablets
- ✅ Mobile phones
- ✅ Progressive Web App (PWA) ready

Users can add to home screen for app-like experience.

---

## 🔒 Security Checklist

Before going live:

- [ ] Environment variables are secure (not in code)
- [ ] Supabase RLS policies are configured
- [ ] HTTPS is enabled (auto with Netlify/Vercel)
- [ ] Service role key is only used server-side
- [ ] Regular backups are enabled in Supabase
- [ ] Error logging is set up
- [ ] Rate limiting is considered for API routes

---

## 📞 Support

For deployment issues:

- **Technical**: it-support@unre.ac.pg
- **HRMS Admin**: hrms-admin@unre.ac.pg
- **Platform Support**:
  - [Netlify Docs](https://docs.netlify.com)
  - [Vercel Docs](https://vercel.com/docs)
  - [Supabase Docs](https://supabase.com/docs)

---

## 🎉 You're Done!

Your PNG University HRMS is now deployed and accessible worldwide!

**Next steps:**
1. Set up authentication
2. Add initial employee data
3. Configure departments
4. Train HR staff
5. Launch to university!

---

**Deployed with 🌿 for PNG University**
*Last updated: December 2025*
