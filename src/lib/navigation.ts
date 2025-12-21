import {
  Users,
  UserPlus,
  LogOut,
  Clock,
  Calendar,
  DollarSign,
  Gift,
  TrendingUp,
  GraduationCap,
  Star,
  FileText,
  Shield,
  Heart,
  Plane,
  BarChart3,
  Settings,
  Building2,
  Briefcase,
  ClipboardCheck,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  href?: string;
  icon?: LucideIcon;
  badge?: string;
  children?: NavItem[];
  description?: string;
}

export const mainNavigation: NavItem[] = [
  // 1. CORE HR & EMPLOYEE MANAGEMENT
  {
    title: 'Core HR',
    icon: Users,
    children: [
      {
        title: 'Employees',
        href: '/dashboard/employees',
        description: 'Manage employee records',
      },
      {
        title: 'Departments',
        href: '/dashboard/departments',
        description: 'Organizational structure',
      },
      {
        title: 'Positions',
        href: '/dashboard/positions',
        description: 'Job positions and roles',
      },
      {
        title: 'Job Families',
        href: '/dashboard/job-families',
        description: 'Job classification',
      },
      {
        title: 'Job Grades',
        href: '/dashboard/job-grades',
        description: 'Grade levels and bands',
      },
      {
        title: 'Work Locations',
        href: '/dashboard/locations',
        description: 'Office locations and sites',
      },
      {
        title: 'Organization Chart',
        href: '/dashboard/org-chart',
        description: 'Visual hierarchy',
      },
    ],
  },

  // 2. RECRUITMENT & TALENT ACQUISITION
  {
    title: 'Recruitment',
    icon: UserPlus,
    badge: 'New',
    children: [
      {
        title: 'Job Requisitions',
        href: '/dashboard/recruitment/requisitions',
        description: 'Position requests',
      },
      {
        title: 'Job Postings',
        href: '/dashboard/recruitment/postings',
        description: 'Active vacancies',
      },
      {
        title: 'Candidates',
        href: '/dashboard/recruitment/candidates',
        description: 'Applicant database',
      },
      {
        title: 'Applications',
        href: '/dashboard/recruitment/applications',
        description: 'Track applications',
      },
      {
        title: 'Interviews',
        href: '/dashboard/recruitment/interviews',
        description: 'Schedule & evaluate',
      },
      {
        title: 'Offers',
        href: '/dashboard/recruitment/offers',
        description: 'Offer management',
      },
    ],
  },

  // 3. ONBOARDING & OFFBOARDING
  {
    title: 'Onboarding',
    icon: ClipboardCheck,
    children: [
      {
        title: 'Onboarding Tasks',
        href: '/dashboard/onboarding/tasks',
        description: 'New hire checklist',
      },
      {
        title: 'Probation Reviews',
        href: '/dashboard/onboarding/probation',
        description: 'Track probation period',
      },
      {
        title: 'Resignations',
        href: '/dashboard/offboarding/resignations',
        description: 'Exit requests',
      },
      {
        title: 'Exit Interviews',
        href: '/dashboard/offboarding/exit-interviews',
        description: 'Feedback collection',
      },
      {
        title: 'Clearances',
        href: '/dashboard/offboarding/clearances',
        description: 'Exit clearance forms',
      },
    ],
  },

  // 4. TIME & ATTENDANCE
  {
    title: 'Time & Attendance',
    icon: Clock,
    children: [
      {
        title: 'Attendance',
        href: '/dashboard/attendance',
        description: 'Daily attendance',
      },
      {
        title: 'Shifts & Rosters',
        href: '/dashboard/attendance/shifts',
        description: 'Shift management',
      },
      {
        title: 'Overtime Requests',
        href: '/dashboard/attendance/overtime',
        description: 'OT approval',
      },
      {
        title: 'Timesheets',
        href: '/dashboard/attendance/timesheets',
        description: 'Time tracking',
      },
      {
        title: 'Public Holidays',
        href: '/dashboard/attendance/holidays',
        description: 'Holiday calendar',
      },
    ],
  },

  // 5. LEAVE MANAGEMENT
  {
    title: 'Leave Management',
    icon: Calendar,
    children: [
      {
        title: 'Leave Requests',
        href: '/dashboard/leave',
        description: 'Apply & approve',
      },
      {
        title: 'Leave Types',
        href: '/dashboard/leave/types',
        description: 'Configure leave types',
      },
      {
        title: 'Leave Balances',
        href: '/dashboard/leave/balances',
        description: 'View entitlements',
      },
      {
        title: 'Leave Calendar',
        href: '/dashboard/leave/calendar',
        description: 'Team calendar view',
      },
    ],
  },

  // 6. PAYROLL
  {
    title: 'Payroll',
    icon: DollarSign,
    children: [
      {
        title: 'Payroll Dashboard',
        href: '/dashboard/payroll',
        description: 'Overview',
      },
      {
        title: 'Pay Periods',
        href: '/dashboard/payroll/pay-periods',
        description: 'Manage periods',
      },
      {
        title: 'Pay Runs',
        href: '/dashboard/payroll/pay-runs',
        description: 'Process payroll',
      },
      {
        title: 'Salary Structures',
        href: '/dashboard/payroll/salary-structures',
        description: 'Salary components',
      },
      {
        title: 'Employee Salaries',
        href: '/dashboard/payroll/employee-salaries',
        description: 'Individual salaries',
      },
      {
        title: 'Pay Components',
        href: '/dashboard/payroll/components',
        description: 'Earnings & deductions',
      },
      {
        title: 'Tax Tables',
        href: '/dashboard/payroll/tax-tables',
        description: 'PNG tax rates',
      },
      {
        title: 'Superannuation',
        href: '/dashboard/payroll/super-schemes',
        description: 'Super schemes',
      },
      {
        title: 'Bank Exports',
        href: '/dashboard/payroll/bank-exports',
        description: 'Bank file generation',
      },
      {
        title: 'Payslips',
        href: '/dashboard/payroll/payslips',
        description: 'View payslips',
      },
    ],
  },

  // 7. BENEFITS & COMPENSATION
  {
    title: 'Benefits',
    icon: Gift,
    badge: 'New',
    children: [
      {
        title: 'Benefit Plans',
        href: '/dashboard/benefits/plans',
        description: 'Available benefits',
      },
      {
        title: 'Enrollments',
        href: '/dashboard/benefits/enrollments',
        description: 'Employee enrollments',
      },
      {
        title: 'Dependants',
        href: '/dashboard/benefits/dependants',
        description: 'Covered dependants',
      },
      {
        title: 'Compensation Reviews',
        href: '/dashboard/benefits/compensation',
        description: 'Salary reviews',
      },
    ],
  },

  // 8. PERFORMANCE MANAGEMENT
  {
    title: 'Performance',
    icon: TrendingUp,
    badge: 'New',
    children: [
      {
        title: 'Performance Goals',
        href: '/dashboard/performance/goals',
        description: 'Set & track goals',
      },
      {
        title: 'Appraisal Cycles',
        href: '/dashboard/performance/cycles',
        description: 'Review periods',
      },
      {
        title: 'Appraisals',
        href: '/dashboard/performance/appraisals',
        description: 'Employee reviews',
      },
      {
        title: '360° Feedback',
        href: '/dashboard/performance/360-feedback',
        description: 'Multi-source feedback',
      },
      {
        title: 'Performance Plans (PIP)',
        href: '/dashboard/performance/improvement-plans',
        description: 'Improvement tracking',
      },
    ],
  },

  // 9. LEARNING & DEVELOPMENT
  {
    title: 'Learning & Development',
    icon: GraduationCap,
    badge: 'New',
    children: [
      {
        title: 'Training Courses',
        href: '/dashboard/training/courses',
        description: 'Course catalog',
      },
      {
        title: 'Training Sessions',
        href: '/dashboard/training/sessions',
        description: 'Upcoming sessions',
      },
      {
        title: 'My Enrollments',
        href: '/dashboard/training/enrollments',
        description: 'My training',
      },
      {
        title: 'Certifications',
        href: '/dashboard/training/certifications',
        description: 'Track certifications',
      },
      {
        title: 'Skills Matrix',
        href: '/dashboard/training/skills',
        description: 'Employee skills',
      },
    ],
  },

  // 10. TALENT MANAGEMENT
  {
    title: 'Talent Management',
    icon: Star,
    badge: 'New',
    children: [
      {
        title: 'Talent Profiles',
        href: '/dashboard/talent/profiles',
        description: 'High potentials',
      },
      {
        title: 'Succession Planning',
        href: '/dashboard/talent/succession',
        description: 'Succession pipeline',
      },
      {
        title: 'Critical Positions',
        href: '/dashboard/talent/critical-positions',
        description: 'Key roles',
      },
      {
        title: 'Career Paths',
        href: '/dashboard/talent/career-paths',
        description: 'Career ladders',
      },
    ],
  },

  // 11. EMPLOYEE RELATIONS
  {
    title: 'Employee Relations',
    icon: AlertCircle,
    badge: 'New',
    children: [
      {
        title: 'Grievances',
        href: '/dashboard/relations/grievances',
        description: 'Complaints & issues',
      },
      {
        title: 'Disciplinary Actions',
        href: '/dashboard/relations/disciplinary',
        description: 'Warnings & actions',
      },
      {
        title: 'Workplace Incidents',
        href: '/dashboard/relations/incidents',
        description: 'Incident reports',
      },
    ],
  },

  // 12. HEALTH & SAFETY
  {
    title: 'Health & Safety',
    icon: Heart,
    badge: 'New',
    children: [
      {
        title: 'Safety Incidents',
        href: '/dashboard/safety/incidents',
        description: 'Accident reports',
      },
      {
        title: 'Safety Audits',
        href: '/dashboard/safety/audits',
        description: 'Safety inspections',
      },
      {
        title: 'Medical Checkups',
        href: '/dashboard/safety/medical',
        description: 'Health screening',
      },
      {
        title: 'Wellness Programs',
        href: '/dashboard/safety/wellness',
        description: 'Wellness initiatives',
      },
    ],
  },

  // 13. TRAVEL & EXPENSE
  {
    title: 'Travel & Expense',
    icon: Plane,
    badge: 'New',
    children: [
      {
        title: 'Travel Requests',
        href: '/dashboard/travel/requests',
        description: 'Travel authorization',
      },
      {
        title: 'Expense Claims',
        href: '/dashboard/travel/expenses',
        description: 'Submit expenses',
      },
      {
        title: 'My Claims',
        href: '/dashboard/travel/my-claims',
        description: 'Track my claims',
      },
    ],
  },

  // 14. REPORTS & ANALYTICS
  {
    title: 'Reports & Analytics',
    icon: BarChart3,
    children: [
      {
        title: 'Reports Dashboard',
        href: '/dashboard/reports',
        description: 'All reports',
      },
      {
        title: 'Headcount Reports',
        href: '/dashboard/reports/headcount',
        description: 'Employee counts',
      },
      {
        title: 'Turnover Analysis',
        href: '/dashboard/reports/turnover',
        description: 'Retention metrics',
      },
      {
        title: 'Attendance Reports',
        href: '/dashboard/reports/attendance',
        description: 'Attendance analytics',
      },
      {
        title: 'Payroll Reports',
        href: '/dashboard/reports/payroll',
        description: 'Payroll summaries',
      },
      {
        title: 'Custom Reports',
        href: '/dashboard/reports/custom',
        description: 'Build custom reports',
      },
    ],
  },

  // 15. SYSTEM ADMINISTRATION
  {
    title: 'Administration',
    icon: Settings,
    children: [
      {
        title: 'User Roles',
        href: '/dashboard/admin/roles',
        description: 'Manage roles',
      },
      {
        title: 'Permissions',
        href: '/dashboard/admin/permissions',
        description: 'Access control',
      },
      {
        title: 'Audit Logs',
        href: '/dashboard/admin/audit',
        description: 'System audit trail',
      },
      {
        title: 'System Settings',
        href: '/dashboard/admin/settings',
        description: 'Configure system',
      },
      {
        title: 'Company Settings',
        href: '/dashboard/admin/company',
        description: 'Company information',
      },
    ],
  },
];

// Quick access items
export const quickAccess: NavItem[] = [
  {
    title: 'My Profile',
    href: '/dashboard/profile',
    icon: Users,
  },
  {
    title: 'Apply Leave',
    href: '/dashboard/leave/apply',
    icon: Calendar,
  },
  {
    title: 'My Payslips',
    href: '/dashboard/payroll/my-payslips',
    icon: DollarSign,
  },
  {
    title: 'My Attendance',
    href: '/dashboard/attendance/me',
    icon: Clock,
  },
  {
    title: 'My Training',
    href: '/dashboard/training/my-courses',
    icon: GraduationCap,
  },
];

// Get navigation items by role
export function getNavigationByRole(role: string): NavItem[] {
  // For now, return all navigation
  // TODO: Filter based on user role when authentication is implemented
  return mainNavigation;
}

// Get breadcrumbs from path
export function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: { label: string; href: string }[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: currentPath,
    });
  }

  return breadcrumbs;
}
