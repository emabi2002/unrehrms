'use client';

import { ComingSoon } from '@/components/ComingSoon';
import { Briefcase } from 'lucide-react';

export default function JobPostingsPage() {
  return (
    <ComingSoon
      title="Job Postings"
      description="Manage active job vacancies and recruitment campaigns"
      icon={Briefcase}
      features={[
        'Create and publish job postings',
        'Multi-channel posting (website, job boards, social media)',
        'Track application sources',
        'Manage posting status and deadlines',
        'Clone and repost previous positions',
        'Analytics on posting performance',
      ]}
    />
  );
}
