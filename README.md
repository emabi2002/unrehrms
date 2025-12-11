# Papua New Guinea University HRMS & Payroll System

![PNG University](https://img.shields.io/badge/PNG-UNRE-008751?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Progress](https://img.shields.io/badge/Progress-45%25-orange?style=for-the-badge)

Complete Human Resources Management and Payroll Solution for the Papua New Guinea University of Natural Resources & Environment.

## 🎉 Latest Update (December 11, 2025)

**System Status:** 45% Complete - **9 new pages deployed today!**

### ✨ New Features
- ✅ Positions Management
- ✅ Job Requisitions (with multi-level approval)
- ✅ Candidates/ATS (Applicant Tracking)
- ✅ Applications Management
- ✅ Interview Scheduling & Evaluation
- ✅ Performance Goals (with cascading)
- ✅ Training Courses Catalog
- ✅ Shifts Management
- ✅ Overtime Requests

**Total:** 18 functional UI pages with comprehensive features!

---

## 🌿 About

This is a modern, web-based HRMS system designed specifically for PNG University to manage the complete employee lifecycle, from recruitment to retirement.

### **16 Major Modules (Planned):**
1. ✅ Core HR (Employee Records) - **70%**
2. ✅ Recruitment & ATS - **65%**
3. ⏳ Onboarding & Offboarding - **5%**
4. ✅ Time & Attendance - **65%**
5. ✅ Leave Management - **60%**
6. ✅ Payroll Management - **70%**
7. ⏳ Benefits & Compensation - **5%**
8. ✅ Performance Management - **40%**
9. ✅ Learning & Development - **40%**
10. ⏳ Talent Management - **5%**
11. ⏳ Employee Relations - **5%**
12. ⏳ Health & Safety - **5%**
13. ⏳ Travel & Expense - **5%**
14. ⏳ Employee/Manager Portals - **15%**
15. ✅ HR Analytics & Reporting - **35%**
16. ✅ System Administration - **50%**

---

## 🚀 Technology Stack

- **Frontend**: Next.js 15 with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui + Radix UI
- **Icons**: Lucide Icons
- **Backend**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth (ready)
- **Package Manager**: Bun
- **Deployment**: GitHub → Netlify/Vercel compatible

---

## 📦 Complete Feature List

### ✅ Employee Management (70%)
- Complete employee profiles with photos
- Department and position tracking
- Employment type classification (Permanent, Contract, Temporary, Intern)
- Status management (Active, On Leave, Terminated)
- Emergency contacts
- Document management (18 document types)
- Salary assignments
- Reports-to hierarchy

### ✅ Recruitment & ATS (65%)
- **Job Requisitions** with multi-level approval (HOD → HR → CEO)
- **Candidates Database** with source tracking
- **Applications Management** with screening scores
- **Interview Scheduling** (Phone, Video, In-Person, Panel)
- **Interview Evaluation** with scoring system
- Status pipeline tracking
- Resume/CV storage
- LinkedIn integration

### ✅ Positions Management (70%)
- Job positions with salary ranges
- Headcount tracking (approved vs current)
- Job families and grades
- Department assignments
- Vacancy management

### ✅ Leave Management (60%)
- Leave applications and approvals
- Multiple leave types (Annual, Sick, Study, Sabbatical, Maternity, Paternity)
- Leave balance tracking
- Academic calendar integration
- Email notifications
- Multi-level approval workflow

### ✅ Time & Attendance (65%)
- Check-in/Check-out functionality
- **Shifts Management** with working days configuration
- **Overtime Requests** with approval workflow
- Geolocation tracking
- Late arrival monitoring
- Hours calculation
- Payroll integration

### ✅ Payroll Processing (70%)
- Configurable salary structures
- Salary components (Basic, Allowances, Deductions)
- **PNG Tax Calculator** (2025 tax rates)
- **Superannuation** (Nambawan Super, NASFUND)
- Pay periods and pay runs
- Payslips generation
- **BSP Bank Export** files
- Teaching and research allowances
- Automated payroll generation
- 8 comprehensive payroll reports

### ✅ Performance Management (40%)
- **Performance Goals** (Organizational, Departmental, Individual)
- Goal cascading (parent-child hierarchy)
- KPI metrics and target values
- Progress tracking (0-100%)
- Weight percentages
- Performance periods

### ✅ Training & Development (40%)
- **Training Courses Catalog**
- Course categories (Technical, Soft Skills, Compliance, Leadership, Safety)
- Delivery methods (Classroom, Online, Blended, Workshop)
- Internal/external providers
- Cost tracking
- Certification management

### ✅ Document Management
- 18 pre-configured document types
- Upload, download, archive, delete
- Document expiry tracking
- Access level controls (HR Only, Manager+HR, Employee Visible, Public)
- Secure storage with signed URLs
- 10MB file size limit

### ✅ Reporting & Analytics (35%)
- Department-wise analytics
- Payroll summaries
- Attendance statistics
- Leave reports
- Employee distribution charts
- Interactive dashboards
- Export to Excel/PDF

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/emabi2002/unrehrms.git
cd unrehrms
```

2. **Install dependencies**
```bash
bun install
```

3. **Configure environment variables**

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qltnmteqivrnljemyvvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. **Set up database**

Apply all migrations in order:
```bash
# Go to Supabase SQL Editor and run migrations 001-008
# Files located in /supabase/migrations/
```

See `APPLY_ALL_MIGRATIONS.md` for detailed instructions.

5. **Set up Supabase Storage**

**IMPORTANT:** Follow the instructions in `SETUP_SUPABASE_STORAGE.md` to enable document uploads.

Quick steps:
- Create "employee-documents" bucket (private)
- Add storage policies
- Takes 5 minutes

6. **Run development server**
```bash
bun run dev
```

7. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
unrehrms/
├── .same/                         # Documentation & tracking
│   ├── todos.md                  # Implementation tracker
│   ├── session-dec11-summary.md  # Latest session summary
│   ├── comprehensive-hrms-plan.md # Full implementation plan
│   └── database-schema-complete.md # Database documentation
├── src/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── positions/        # NEW
│   │   │   ├── recruitment/      # NEW (4 sub-pages)
│   │   │   ├── training/         # NEW
│   │   │   ├── performance/      # NEW
│   │   │   ├── attendance/       # Enhanced (shifts, overtime)
│   │   │   ├── employees/
│   │   │   ├── leave/
│   │   │   ├── payroll/
│   │   │   ├── departments/
│   │   │   └── reports/
│   │   ├── page.tsx              # Landing page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   └── Sidebar.tsx           # Navigation
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── api/
│   └── types/
├── supabase/
│   └── migrations/               # 8 migration files (001-008)
├── SETUP_SUPABASE_STORAGE.md    # Storage setup guide
└── package.json
```

---

## 🗃️ Database Schema

**60+ Tables** organized into modules:

### Core Tables
- employees, departments, positions
- employment_types, academic_ranks, faculties

### Recruitment
- job_requisitions, job_postings, candidates
- applications, interviews

### Payroll
- salary_structures, salary_components
- pay_periods, pay_runs, payslips
- png_tax_brackets, super_schemes
- employee_salary_details

### Time & Attendance
- attendance, shifts, overtime_requests

### Performance & Training
- performance_goals, training_courses

### Leave
- leave_requests, leave_balances, leave_types

### Documents
- employee_documents, emergency_contacts

See `.same/database-schema-complete.md` for full schema documentation.

---

## 🎨 Design System

### Brand Colors

The application uses the official PNG University color palette:

- **Primary Green**: #008751
- **Light Green**: #00a86b
- **Dark Green**: #006641

### Status Colors
- **Blue**: New, Scheduled, Draft
- **Yellow**: Pending, Screening
- **Orange**: Interviewing, In Progress
- **Purple**: Shortlisted, Offered
- **Green**: Approved, Completed, Hired
- **Red**: Rejected, Cancelled

### UI Patterns
- Stats dashboards (4-5 metrics per page)
- Advanced filtering
- Modal dialogs for forms
- Toast notifications
- Empty states with CTAs
- Loading states
- Badge status indicators

---

## 🚢 Deployment

### Deploy to Netlify

1. Push to GitHub ✅ (Already done!)
2. Connect repository to Netlify
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Deploy to Vercel

1. Import from GitHub
2. Add environment variables
3. Deploy!

See `DEPLOYMENT.md` for detailed instructions.

---

## 📝 Implementation Progress

### ✅ Completed (45%)
- Dashboard & navigation
- 18 functional UI pages
- 60+ database tables
- Complete payroll system
- Recruitment pipeline (requisitions → interviews)
- Performance goals with cascading
- Training course management
- Time & attendance (shifts, overtime)
- Document management system
- Emergency contacts
- PNG tax calculations
- Superannuation tracking

### ⏳ In Progress
- Employee self-service portal
- Manager self-service portal
- Appraisals management
- Timesheets
- Benefits enrollment

### 🎯 Planned
- Onboarding workflows
- Offboarding checklists
- Safety incident reporting
- Travel & expense management
- Talent management
- Complete authentication
- Role-based access control
- Mobile application

**Target Completion:** September 2026 (9 months)
**See:** `.same/comprehensive-hrms-plan.md` for full roadmap

---

## 🔐 Security

- ✅ Row Level Security (RLS) on all tables
- ✅ Private storage bucket for documents
- ✅ Signed URLs with time expiry
- ✅ Authentication ready (Supabase Auth)
- ✅ Access level controls
- ✅ Audit trail logging
- ⏳ Role-based permissions (in progress)

---

## 📊 Statistics

- **Total Files:** 180+ files
- **Lines of Code:** ~15,000+ lines
- **UI Pages:** 18 complete pages
- **Database Tables:** 60+ tables
- **Features:** 150+ individual features
- **Migrations:** 8 migration files
- **Documentation:** 15+ documentation files

---

## 🔧 Development

### Adding new pages

```bash
# Example: Create a new dashboard page
touch src/app/dashboard/new-page/page.tsx
```

### Adding UI components

```bash
# Use shadcn/ui CLI
bunx shadcn@latest add -y -o button
bunx shadcn@latest add -y -o card
```

### Running linter

```bash
bun run lint
```

### Database migrations

1. Create new migration in `/supabase/migrations/`
2. Name format: `00X_description.sql`
3. Run in Supabase SQL Editor

---

## 📚 Documentation

- **Setup Guide:** `SETUP_SUPABASE_STORAGE.md`
- **Deployment:** `DEPLOYMENT.md`
- **Database:** `.same/database-schema-complete.md`
- **Implementation Plan:** `.same/comprehensive-hrms-plan.md`
- **Progress Tracker:** `.same/todos.md`
- **Session Summary:** `.same/session-dec11-summary.md`
- **GitHub Deployment:** `.same/github-deployment-summary.md`

---

## 🤝 Contributing

This is a private university system. For questions or issues:

- **Developer:** emabi2002@github.com
- **HR Department:** hr@unre.ac.pg
- **IT Support:** it-support@unre.ac.pg

---

## 📄 License

Proprietary - Papua New Guinea University of Natural Resources & Environment

---

## 🎓 About PNG UNRE

Papua New Guinea University of Natural Resources & Environment is dedicated to excellence in education, research, and service in the fields of natural resources and environmental management.

**Campus Location:** Vudal, East New Britain Province, Papua New Guinea
**Website:** [unre.ac.pg](https://unre.ac.pg)
**Established:** 1965

---

## 🎯 Quick Links

- **GitHub Repo:** https://github.com/emabi2002/unrehrms.git
- **Supabase Project:** https://qltnmteqivrnljemyvvb.supabase.co
- **Latest Deployment Summary:** `.same/github-deployment-summary.md`
- **Full Implementation Plan:** `.same/comprehensive-hrms-plan.md`

---

**Built with 🌿 for PNG University**
*Version 21.0 - December 11, 2025*
*System Progress: 45% Complete*
