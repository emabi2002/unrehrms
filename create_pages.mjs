import fs from 'fs';
import path from 'path';

const pages = {
  'onboarding/tasks': { title: 'Onboarding Tasks', icon: 'ClipboardCheck' },
  'onboarding/probation': { title: 'Probation Reviews', icon: 'UserCheck' },
  'offboarding/resignations': { title: 'Resignations', icon: 'UserMinus' },
  'offboarding/exit-interviews': { title: 'Exit Interviews', icon: 'MessageSquare' },
  'offboarding/clearances': { title: 'Exit Clearances', icon: 'CheckSquare' },
  'benefits/plans': { title: 'Benefit Plans', icon: 'Gift' },
  'benefits/enrollments': { title: 'Benefit Enrollments', icon: 'UserPlus' },
  'benefits/dependants': { title: 'Dependants', icon: 'Users' },
  'benefits/compensation': { title: 'Compensation Reviews', icon: 'TrendingUp' },
  'performance/cycles': { title: 'Appraisal Cycles', icon: 'Calendar' },
  'performance/appraisals': { title: 'Performance Appraisals', icon: 'Star' },
  'performance/360-feedback': { title: '360° Feedback', icon: 'Users' },
  'performance/improvement-plans': { title: 'Performance Improvement Plans', icon: 'TrendingUp' },
  'training/sessions': { title: 'Training Sessions', icon: 'Calendar' },
  'training/enrollments': { title: 'Training Enrollments', icon: 'UserCheck' },
  'training/certifications': { title: 'Certifications', icon: 'Award' },
  'training/skills': { title: 'Skills Matrix', icon: 'Target' },
  'talent/profiles': { title: 'Talent Profiles', icon: 'Star' },
  'talent/succession': { title: 'Succession Planning', icon: 'Users' },
  'talent/critical-positions': { title: 'Critical Positions', icon: 'AlertCircle' },
  'talent/career-paths': { title: 'Career Paths', icon: 'TrendingUp' },
  'relations/grievances': { title: 'Grievances', icon: 'AlertTriangle' },
  'relations/disciplinary': { title: 'Disciplinary Actions', icon: 'Shield' },
  'relations/incidents': { title: 'Workplace Incidents', icon: 'AlertCircle' },
  'safety/incidents': { title: 'Safety Incidents', icon: 'AlertTriangle' },
  'safety/audits': { title: 'Safety Audits', icon: 'ClipboardCheck' },
  'safety/medical': { title: 'Medical Checkups', icon: 'Heart' },
  'safety/wellness': { title: 'Wellness Programs', icon: 'Heart' },
  'travel/requests': { title: 'Travel Requests', icon: 'Plane' },
  'travel/expenses': { title: 'Expense Claims', icon: 'Receipt' },
  'travel/my-claims': { title: 'My Claims', icon: 'FileText' },
  'reports/headcount': { title: 'Headcount Reports', icon: 'Users' },
  'reports/turnover': { title: 'Turnover Analysis', icon: 'TrendingDown' },
  'reports/attendance': { title: 'Attendance Reports', icon: 'Clock' },
  'reports/payroll': { title: 'Payroll Reports', icon: 'DollarSign' },
  'reports/custom': { title: 'Custom Reports', icon: 'FileText' },
  'admin/roles': { title: 'User Roles', icon: 'Shield' },
  'admin/permissions': { title: 'Permissions', icon: 'Lock' },
  'admin/audit': { title: 'Audit Logs', icon: 'FileText' },
  'admin/settings': { title: 'System Settings', icon: 'Settings' },
  'admin/company': { title: 'Company Settings', icon: 'Building2' },
};

const template = (title, icon) => `'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { ${icon} } from 'lucide-react';

export default function ${title.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <ComingSoon
      title="${title}"
      description="This feature is under development"
      icon={${icon}}
    />
  );
}
`;

const basePath = './src/app/dashboard';
let count = 0;

for (const [pagePath, config] of Object.entries(pages)) {
  const filePath = path.join(basePath, pagePath, 'page.tsx');
  fs.writeFileSync(filePath, template(config.title, config.icon));
  console.log(`Created: ${pagePath}/page.tsx`);
  count++;
}

console.log(`\nTotal pages created: ${count}`);
