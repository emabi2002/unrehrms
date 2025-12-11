'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Employees',
      href: '/dashboard/employees',
      icon: Users,
    },
    {
      name: 'Leave',
      href: '/dashboard/leave',
      icon: Calendar,
    },
    {
      name: 'Attendance',
      href: '/dashboard/attendance',
      icon: Clock,
    },
    {
      name: 'Payroll',
      href: '/dashboard/payroll',
      icon: DollarSign,
    },
    {
      name: 'Departments',
      href: '/dashboard/departments',
      icon: Building2,
    },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: BarChart3,
    },
  ];

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-xl font-bold text-white">🌿</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PNG UNRE</h1>
            <p className="text-xs text-gray-500">HRMS & Payroll</p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  active
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? 'text-green-700' : 'text-gray-400'}`} />
              <span className="flex-1">{item.name}</span>
              {active && <ChevronRight className="h-4 w-4 text-green-700" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="px-4 py-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-semibold text-gray-900">Admin User</p>
          <p className="text-xs text-gray-500">HR Manager</p>
        </div>
      </div>
    </aside>
  );
}
