'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <ComingSoon
      title="My Profile"
      description="View and edit your personal information"
      icon={User}
      features={[
        'View personal and employment details',
        'Update contact information',
        'Change profile picture',
        'Manage emergency contacts',
        'Update banking details',
        'View employment history',
      ]}
    />
  );
}
