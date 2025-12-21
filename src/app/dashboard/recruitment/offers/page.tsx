'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { FileCheck } from 'lucide-react';

export default function OffersPage() {
  return (
    <ComingSoon
      title="Job Offers"
      description="Manage employment offers and acceptances"
      icon={FileCheck}
      features={[
        'Generate offer letters from templates',
        'Track offer status (sent, accepted, declined)',
        'Salary and benefits package details',
        'E-signature integration',
        'Offer expiry and deadline management',
        'Automatic onboarding trigger upon acceptance',
      ]}
    />
  );
}
