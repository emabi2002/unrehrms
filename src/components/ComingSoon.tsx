'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features?: string[];
}

export function ComingSoon({ title, description, icon: Icon, features }: ComingSoonProps) {
  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="max-w-4xl mx-auto mt-12">
        <Card className="border-2 border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Icon className="h-24 w-24 text-gray-300" />
                  <Construction className="h-12 w-12 text-[#008751] absolute -bottom-2 -right-2" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
              <p className="text-lg text-gray-600 mb-8">{description}</p>

              {features && features.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Planned Features:</h3>
                  <ul className="space-y-2 text-left max-w-md mx-auto">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="min-w-2 h-2 w-2 bg-[#008751] rounded-full mt-2" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-full">
                <Construction className="h-4 w-4 text-blue-600" />
                <span>This feature is currently under development</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
