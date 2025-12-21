'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Clock } from 'lucide-react';

export default function MyAttendancePage() {
  return (
    <ComingSoon
      title="My Attendance"
      description="View your attendance history and records"
      icon={Clock}
      features={[
        'View daily attendance records',
        'Check-in/Check-out history',
        'Monthly attendance summary',
        'Late arrivals and early departures',
        'Overtime hours tracking',
        'Export attendance report',
      ]}
    />
  );
}
