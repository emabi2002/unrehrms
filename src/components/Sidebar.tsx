'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  BarChart,
  ChevronRight,
} from 'lucide-react'

const mainModules = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Employees',
    href: '/dashboard/employees',
    icon: Users,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Leave',
    href: '/dashboard/leave',
    icon: Calendar,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Attendance',
    href: '/dashboard/attendance',
    icon: Clock,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Payroll',
    href: '/dashboard/payroll',
    icon: DollarSign,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Departments',
    href: '/dashboard/departments',
    icon: Building2,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
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
        {mainModules.map((module) => {
          const Icon = module.icon
          const active = isActive(module.href)

          return (
            <Link
              key={module.href}
              href={module.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${
                  active
                    ? `${module.bgColor} ${module.color} font-semibold shadow-sm`
                    : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${active ? module.color : 'text-gray-400'}`} />
              <span className="flex-1">{module.name}</span>
              {active && <ChevronRight className={`h-4 w-4 ${module.color}`} />}
            </Link>
          )
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
  )
}
