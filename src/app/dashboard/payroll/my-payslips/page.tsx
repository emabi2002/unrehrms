'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { FileText } from 'lucide-react';

export default function MyPayslipsPage() {
  return (
    <ComingSoon
      title="My Payslips"
      description="View and download your salary slips"
      icon={FileText}
      features={[
        'View payslip history',
        'Download PDF payslips',
        'View YTD earnings and deductions',
        'Tax certificate download',
        'Email payslips to yourself',
      ]}
    />
  );
}
