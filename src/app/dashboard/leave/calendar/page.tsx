'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Calendar } from 'lucide-react';

export default function LeaveCalendarPage() {
  return (
    <ComingSoon
      title="Leave Calendar"
      description="Visual calendar view of team leave and absences"
      icon={Calendar}
      features={[
        'Monthly and annual calendar views',
        'Filter by department, team, or individual',
        'Color-coded leave types',
        'Identify staffing gaps and coverage issues',
        'Export calendar views',
        'Integration with team schedules',
      ]}
    />
  );
}
