'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Calendar } from 'lucide-react';

export default function PublicHolidaysPage() {
  return (
    <ComingSoon
      title="Public Holidays"
      description="Manage PNG public holidays and company-specific holidays"
      icon={Calendar}
      features={[
        'View PNG national public holidays calendar',
        'Add university-specific holidays and closure days',
        'Automatic leave adjustments for holidays',
        'Holiday conflict detection with attendance',
        'Multi-year holiday planning',
        'Export holiday calendar to various formats',
      ]}
    />
  );
}
