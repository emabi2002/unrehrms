# Papua New Guinea University HRMS & Payroll System

![PNG University](https://img.shields.io/badge/PNG-UNRE-008751?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

Complete Human Resources Management and Payroll Solution for the Papua New Guinea University of Natural Resources & Environment.

## 🌿 About

This is a modern, web-based HRMS system designed specifically for PNG University to manage:
- Faculty and staff records
- Leave management and approvals
- Attendance tracking
- Payroll processing
- Salary slip generation
- HR analytics and reporting

## 🎨 Branding

The system uses the official PNG University green (#008751) throughout the interface, providing a consistent and professional look aligned with the university's brand identity.

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Supabase (PostgreSQL)
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Authentication**: Supabase Auth (to be implemented)
- **Deployment**: Netlify/Vercel compatible

## 📦 Features

### Employee Management
- Complete employee profiles
- Department and position tracking
- Employment type classification
- Status management (active, on leave, terminated)

### Leave Management
- Leave applications and approvals
- Multiple leave types (Annual, Sick, Study, Sabbatical)
- Leave balance tracking
- Academic calendar integration

### Attendance System
- Check-in/Check-out functionality
- Geolocation tracking
- Late arrival monitoring
- Comprehensive attendance reports

### Payroll Processing
- Configurable salary structures
- Teaching and research allowances
- Tax calculations
- Automated payroll generation

### Reporting & Analytics
- Department-wise analytics
- Payroll summaries
- Attendance statistics
- Custom report builder

## 🛠️ Installation

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/emabi2002/unrehrms.git
cd unrehrms
```

2. **Install dependencies**
```bash
bun install
# or
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up Supabase database**

Go to your Supabase SQL Editor and run:

```sql
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
  employee_id uuid references employees(id),
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
  employee_id uuid references employees(id),
  date date not null,
  check_in timestamp with time zone,
  check_out timestamp with time zone,
  status text check (status in ('present', 'absent', 'late', 'half_day'))
);

-- Salary slips table
create table salary_slips (
  id uuid primary key default uuid_generate_v4(),
  employee_id uuid references employees(id),
  month text not null,
  year integer not null,
  basic_salary numeric not null,
  allowances numeric default 0,
  deductions numeric default 0,
  net_salary numeric not null,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table employees enable row level security;
alter table departments enable row level security;
alter table leave_requests enable row level security;
alter table attendance enable row level security;
alter table salary_slips enable row level security;
```

5. **Run development server**
```bash
bun run dev
# or
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
png-unre-hrms/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx        # Landing page
│   │   ├── layout.tsx      # Root layout
│   │   └── globals.css     # Global styles (PNG green theme)
│   ├── components/
│   │   └── ui/             # Reusable UI components
│   └── lib/
│       ├── supabase.ts     # Supabase client
│       └── utils.ts        # Utility functions
├── public/                 # Static assets
├── .env.local             # Environment variables (not in git)
└── package.json           # Dependencies
```

## 🎨 Brand Colors

The application uses the official PNG University color palette:

- **Primary Green**: #008751
- **Light Green**: #00a86b
- **Dark Green**: #006641
- **Accent**: #1a9762
- **Light Background**: #e8f5f0

## 🔐 Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |

⚠️ **Never commit `.env.local` to version control!**

## 🚢 Deployment

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Add environment variables in Netlify settings
4. Deploy!

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## 📊 Database Schema

### Tables

- **employees** - Staff records and information
- **departments** - Organizational structure
- **leave_requests** - Leave applications and approvals
- **attendance** - Daily check-in/check-out records
- **salary_slips** - Monthly payroll information

## 🔧 Development

### Adding new pages

Create new pages in `src/app/`:

```tsx
// src/app/dashboard/page.tsx
export default function Dashboard() {
  return <div>Dashboard</div>
}
```

### Adding UI components

Use shadcn/ui components:

```bash
bunx shadcn@latest add -y -o [component-name]
```

Available components: button, card, input, table, dialog, etc.

## 📝 TODO

- [ ] Implement Supabase authentication
- [ ] Build employee dashboard
- [ ] Create admin panel
- [ ] Add leave application form
- [ ] Implement payroll processing
- [ ] Generate PDF salary slips
- [ ] Add email notifications
- [ ] Build reporting dashboard
- [ ] Implement role-based access control
- [ ] Add audit logging

## 🤝 Contributing

This is a private university system. For questions or issues, contact:

- **IT Department**: it-support@unre.ac.pg
- **HRMS Admin**: hrms-admin@unre.ac.pg
- **HR Department**: hr@unre.ac.pg

## 📄 License

Proprietary - Papua New Guinea University of Natural Resources & Environment

## 🎓 About PNG UNRE

Papua New Guinea University of Natural Resources & Environment is dedicated to excellence in education, research, and service in the fields of natural resources and environmental management.

**Campus Location**: Vudal, East New Britain Province, Papua New Guinea
**Website**: [unre.ac.pg](https://unre.ac.pg)
**Established**: 1965

---

**Built with 🌿 for PNG University**
*Version 1.0.0 - December 2025*
