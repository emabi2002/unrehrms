'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

// Define submenu structure with categories and items
interface SubMenuItem {
  label: string
  href: string
}

interface SubMenuCategory {
  label: string
  href?: string // Optional direct link
  items?: SubMenuItem[] // Dropdown items
}

const moduleSubmenus: Record<string, SubMenuCategory[]> = {
  '/dashboard/employees': [
    { label: 'Overview', href: '/dashboard/employees' },
    {
      label: 'Manage',
      items: [
        { label: 'All Employees', href: '/dashboard/employees' },
        { label: 'Add Employee', href: '/dashboard/employees/add' },
        { label: 'Import Employees', href: '/dashboard/employees/import' },
      ],
    },
    {
      label: 'Structure',
      items: [
        { label: 'Departments', href: '/dashboard/departments' },
        { label: 'Positions', href: '/dashboard/employees/positions' },
        { label: 'Academic Ranks', href: '/dashboard/employees/ranks' },
      ],
    },
    {
      label: 'Records',
      items: [
        { label: 'Documents', href: '/dashboard/employees/documents' },
        { label: 'Contracts', href: '/dashboard/employees/contracts' },
        { label: 'Emergency Contacts', href: '/dashboard/employees/emergency' },
      ],
    },
  ],
  '/dashboard/leave': [
    { label: 'Overview', href: '/dashboard/leave' },
    {
      label: 'Requests',
      items: [
        { label: 'All Requests', href: '/dashboard/leave' },
        { label: 'Apply Leave', href: '/dashboard/leave/apply' },
        { label: 'Pending Approvals', href: '/dashboard/leave/approvals' },
      ],
    },
    {
      label: 'Setup',
      items: [
        { label: 'Leave Types', href: '/dashboard/leave/types' },
        { label: 'Leave Balances', href: '/dashboard/leave/balances' },
        { label: 'Leave Policies', href: '/dashboard/leave/policies' },
      ],
    },
    { label: 'Calendar', href: '/dashboard/leave/calendar' },
    { label: 'Reports', href: '/dashboard/leave/reports' },
  ],
  '/dashboard/attendance': [
    { label: 'Daily View', href: '/dashboard/attendance' },
    {
      label: 'Check In/Out',
      items: [
        { label: 'Manual Entry', href: '/dashboard/attendance/check' },
        { label: 'Bulk Check-in', href: '/dashboard/attendance/bulk' },
      ],
    },
    {
      label: 'Records',
      items: [
        { label: 'Attendance History', href: '/dashboard/attendance/records' },
        { label: 'Late Arrivals', href: '/dashboard/attendance/late' },
        { label: 'Absences', href: '/dashboard/attendance/absences' },
      ],
    },
    { label: 'Reports', href: '/dashboard/attendance/reports' },
  ],
  '/dashboard/payroll': [
    { label: 'Overview', href: '/dashboard/payroll' },
    {
      label: 'Setup',
      items: [
        { label: 'Salary Components', href: '/dashboard/payroll/components' },
        { label: 'Salary Structures', href: '/dashboard/payroll/salary-structures' },
        { label: 'Employee Salaries', href: '/dashboard/payroll/employee-salaries' },
      ],
    },
    {
      label: 'Processing',
      items: [
        { label: 'Pay Periods', href: '/dashboard/payroll/pay-periods' },
        { label: 'Pay Runs', href: '/dashboard/payroll/pay-runs' },
        { label: 'Payslips', href: '/dashboard/payroll/payslips' },
      ],
    },
    {
      label: 'Tax & Super',
      items: [
        { label: 'Tax Calculator', href: '/dashboard/payroll/tax-calculator' },
        { label: 'Tax Tables', href: '/dashboard/payroll/tax-tables' },
        { label: 'Super Schemes', href: '/dashboard/payroll/super-schemes' },
        { label: 'Contributions', href: '/dashboard/payroll/super-contributions' },
      ],
    },
    {
      label: 'Banking',
      items: [
        { label: 'Bank Exports', href: '/dashboard/payroll/bank-exports' },
        { label: 'Payment History', href: '/dashboard/payroll/payments' },
      ],
    },
    { label: 'Reports', href: '/dashboard/payroll/reports' },
  ],
  '/dashboard/departments': [
    { label: 'All Departments', href: '/dashboard/departments' },
    { label: 'Add Department', href: '/dashboard/departments/add' },
    {
      label: 'Organization',
      items: [
        { label: 'Faculties', href: '/dashboard/departments/faculties' },
        { label: 'Organization Chart', href: '/dashboard/departments/chart' },
        { label: 'Hierarchy', href: '/dashboard/departments/hierarchy' },
      ],
    },
  ],
  '/dashboard/reports': [
    { label: 'Dashboard', href: '/dashboard/reports' },
    {
      label: 'Employee Reports',
      items: [
        { label: 'Employee List', href: '/dashboard/reports/employees' },
        { label: 'Headcount', href: '/dashboard/reports/headcount' },
        { label: 'Demographics', href: '/dashboard/reports/demographics' },
      ],
    },
    {
      label: 'Payroll Reports',
      items: [
        { label: 'Payroll Summary', href: '/dashboard/reports/payroll' },
        { label: 'Tax Reports', href: '/dashboard/reports/tax' },
        { label: 'Super Reports', href: '/dashboard/reports/super' },
      ],
    },
    {
      label: 'Leave Reports',
      items: [
        { label: 'Leave Summary', href: '/dashboard/reports/leave' },
        { label: 'Leave Balances', href: '/dashboard/reports/leave-balances' },
      ],
    },
    {
      label: 'Attendance Reports',
      items: [
        { label: 'Attendance Summary', href: '/dashboard/reports/attendance' },
        { label: 'Late Arrivals', href: '/dashboard/reports/attendance-late' },
      ],
    },
    { label: 'Custom Reports', href: '/dashboard/reports/custom' },
  ],
}

export default function TopNav() {
  const pathname = usePathname()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Determine which module submenu to show
  let activeSubmenu: SubMenuCategory[] = []
  let moduleName = ''

  for (const [moduleBase, submenu] of Object.entries(moduleSubmenus)) {
    if (pathname.startsWith(moduleBase)) {
      activeSubmenu = submenu
      // Extract module name from path
      moduleName = moduleBase.split('/').pop() || ''
      moduleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
      break
    }
  }

  // Don't show top nav on main dashboard
  if (pathname === '/dashboard') {
    return null
  }

  // Don't show if no submenu
  if (activeSubmenu.length === 0) {
    return null
  }

  function isItemActive(category: SubMenuCategory): boolean {
    if (category.href && pathname === category.href) return true
    if (category.items) {
      return category.items.some(item => pathname === item.href)
    }
    return false
  }

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-3">
        {/* Module Title */}
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          {moduleName} Module
        </h2>

        {/* Submenu Navigation */}
        <nav className="flex gap-1 overflow-x-auto pb-2">
          {activeSubmenu.map((category, index) => {
            const isActive = isItemActive(category)
            const hasDropdown = !!category.items
            const isOpen = openDropdown === category.label

            if (!hasDropdown && category.href) {
              // Simple link without dropdown
              return (
                <Link
                  key={category.label}
                  href={category.href}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {category.label}
                </Link>
              )
            }

            // Dropdown menu
            return (
              <div
                key={category.label}
                className="relative"
                onMouseEnter={() => setOpenDropdown(category.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={`
                    flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors
                    ${
                      isActive
                        ? 'bg-green-600 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {category.label}
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {isOpen && category.items && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[200px] z-50">
                    {category.items.map((item) => {
                      const itemActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            block px-4 py-2 text-sm transition-colors
                            ${
                              itemActive
                                ? 'bg-green-50 text-green-700 font-medium'
                                : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
