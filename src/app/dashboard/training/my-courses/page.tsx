'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { GraduationCap } from 'lucide-react';

export default function MyCoursesPage() {
  return (
    <ComingSoon
      title="My Training Courses"
      description="Track your training and development"
      icon={GraduationCap}
      features={[
        'View enrolled courses',
        'Track course completion status',
        'Download certificates',
        'View upcoming training sessions',
        'Training history and transcripts',
        'Skills development tracking',
      ]}
    />
  );
}
