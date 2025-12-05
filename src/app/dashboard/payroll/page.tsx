import Link from 'next/link'
import { Card } from '@/components/ui/card'
import {
  DollarSign,
  Users,
  FileText,
  Calculator,
  Building2,
  TrendingUp
} from 'lucide-react'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Payroll Management</h1>
        <p className="text-gray-600 mt-2">
          Complete payroll processing with PNG tax and superannuation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold mt-1">-</p>
            </div>
            <Users className="h-10 w-10 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Period</p>
              <p className="text-lg font-semibold mt-1">Not Started</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Pay Run</p>
              <p className="text-lg font-semibold mt-1">-</p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Setup Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payroll Setup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/payroll/components">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <Calculator className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Salary Components</h3>
              <p className="text-sm text-gray-600">
                Manage earnings and deductions
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/payroll/salary-structures">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <Building2 className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Salary Structures</h3>
              <p className="text-sm text-gray-600">
                Create position-based salary templates
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/payroll/employee-salaries">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-500">
              <Users className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Employee Salaries</h3>
              <p className="text-sm text-gray-600">
                Assign salaries to employees
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Processing Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payroll Processing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/payroll/pay-periods">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <FileText className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Pay Periods</h3>
              <p className="text-sm text-gray-600">
                Create monthly/fortnightly periods
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/payroll/pay-runs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Process Pay Runs</h3>
              <p className="text-sm text-gray-600">
                Generate payslips with tax & super
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/payroll/payslips">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-500">
              <DollarSign className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">View Payslips</h3>
              <p className="text-sm text-gray-600">
                Access employee payslips
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Tax & Super Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tax & Superannuation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/dashboard/payroll/tax-calculator">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <Calculator className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">PNG Tax Calculator</h3>
              <p className="text-sm text-gray-600">
                Test PNG graduated tax calculations
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/payroll/super-schemes">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-purple-500">
              <Building2 className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">Super Schemes</h3>
              <p className="text-sm text-gray-600">
                Manage Nambawan & NASFUND
              </p>
            </Card>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-900 mb-2">Getting Started</h3>
        <ol className="text-sm text-green-800 space-y-2 ml-4 list-decimal">
          <li>Set up <strong>Salary Components</strong> (earnings and deductions)</li>
          <li>Create <strong>Salary Structures</strong> for different positions</li>
          <li>Assign <strong>Employee Salaries</strong> using the structures</li>
          <li>Create a <strong>Pay Period</strong> (monthly or fortnightly)</li>
          <li>Process a <strong>Pay Run</strong> to generate payslips</li>
          <li>Review and approve payslips</li>
          <li>Export to bank for payment</li>
        </ol>
      </Card>
    </div>
  )
}
