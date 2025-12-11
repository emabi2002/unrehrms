'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ChevronRight,
} from 'lucide-react';
import { mainNavigation, type NavItem } from '@/lib/navigation';
import { Badge } from '@/components/ui/badge';

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href?: string) {
    if (!href) return false;
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  }

  function isSectionActive(section: NavItem): boolean {
    if (section.href && isActive(section.href)) return true;
    if (section.children) {
      return section.children.some((child) => child.href && isActive(child.href));
    }
    return false;
  }

  // Get the first child's href as the section link
  function getSectionHref(section: NavItem): string {
    if (section.href) return section.href;
    if (section.children && section.children.length > 0 && section.children[0].href) {
      return section.children[0].href;
    }
    return '#';
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
            ${
              pathname === '/dashboard'
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }
          `}
        >
          <LayoutDashboard className={`h-5 w-5 ${pathname === '/dashboard' ? 'text-green-700' : 'text-gray-400'}`} />
          <span className="flex-1">Dashboard</span>
          {pathname === '/dashboard' && <ChevronRight className="h-4 w-4 text-green-700" />}
        </Link>

        {/* Module Links - 16 Comprehensive Modules */}
        {mainNavigation.map((section) => {
          const Icon = section.icon;
          const hasActiveChild = isSectionActive(section);
          const sectionHref = getSectionHref(section);

          return (
            <Link
              key={section.title}
              href={sectionHref}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${
                  hasActiveChild
                    ? 'bg-green-50 text-green-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {Icon && (
                <Icon className={`h-5 w-5 flex-shrink-0 ${hasActiveChild ? 'text-green-700' : 'text-gray-400'}`} />
              )}
              <span className="flex-1 text-sm">{section.title}</span>
              {section.badge && (
                <Badge variant={section.badge === 'New' ? 'default' : 'outline'} className="text-xs bg-green-600">
                  {section.badge}
                </Badge>
              )}
              {hasActiveChild && <ChevronRight className="h-4 w-4 text-green-700 flex-shrink-0" />}
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
