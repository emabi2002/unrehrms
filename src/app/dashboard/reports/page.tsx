'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  BarChart,
  Download,
  FileText,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  PieChart,
  Activity
} from 'lucide-react'

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  // Sample analytics data
  const employeeStats = {
    total: 524,
    academic: 283,
    administrative: 185,
    technical: 56,
    growth: 12
  }

  const attendanceStats = {
    present: 487,
    absent: 23,
    late: 14,
    percentage: 92.9
  }

  const leaveStats = {
    approved: 156,
    pending: 15,
    rejected: 8,
    mostUsed: 'Annual Leave'
  }

  const payrollStats = {
    totalPayroll: 38420000,
    avgSalary: 73321,
    highestDept: 'Faculty of Natural Resources',
    taxCollected: 5763000
  }

  const departmentData = [
    { name: 'Environmental Sciences', employees: 45, avgSalary: 78500 },
    { name: 'Natural Resources', employees: 52, avgSalary: 82100 },
    { name: 'Agriculture', employees: 38, avgSalary: 71200 },
    { name: 'Administrative', employees: 65, avgSalary: 62300 },
    { name: 'IT Department', employees: 18, avgSalary: 75600 },
    { name: 'Student Services', employees: 28, avgSalary: 58400 }
  ]

  const monthlyTrends = [
    { month: 'Jul', employees: 512, payroll: 37100000 },
    { month: 'Aug', employees: 515, payroll: 37350000 },
    { month: 'Sep', employees: 518, payroll: 37580000 },
    { month: 'Oct', employees: 520, payroll: 37800000 },
    { month: 'Nov', employees: 522, payroll: 38100000 },
    { month: 'Dec', employees: 524, payroll: 38420000 }
  ]

  const formatCurrency = (amount: number) => {
    return `K${(amount / 1000000).toFixed(2)}M`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-rose-600">Reports & Analytics</h1>
                <p className="text-xs text-muted-foreground">HR insights and data visualization</p>
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold text-blue-600">24</p>
                  <p className="text-xs text-green-600 mt-1">↑ 3 new this month</p>
                </div>
                <FileText className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Employees</p>
                  <p className="text-3xl font-bold text-purple-600">{employeeStats.total}</p>
                  <p className="text-xs text-green-600 mt-1">↑ {employeeStats.growth} this month</p>
                </div>
                <Users className="h-10 w-10 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-orange-600">{attendanceStats.percentage}%</p>
                  <p className="text-xs text-gray-500 mt-1">{attendanceStats.present}/{employeeStats.total} present</p>
                </div>
                <Activity className="h-10 w-10 text-orange-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payroll</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(payrollStats.totalPayroll)}</p>
                  <p className="text-xs text-gray-500 mt-1">Monthly average</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Employee Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-rose-600" />
                Employee Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Academic Staff</span>
                    <span className="text-sm font-bold text-blue-600">{employeeStats.academic}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(employeeStats.academic / employeeStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Administrative Staff</span>
                    <span className="text-sm font-bold text-purple-600">{employeeStats.administrative}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${(employeeStats.administrative / employeeStats.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Technical Staff</span>
                    <span className="text-sm font-bold text-orange-600">{employeeStats.technical}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full"
                      style={{ width: `${(employeeStats.technical / employeeStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leave Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-rose-600" />
                Leave Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{leaveStats.approved}</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-orange-600">{leaveStats.pending}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Most Used Leave Type</p>
                <p className="text-lg font-bold text-gray-900">{leaveStats.mostUsed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Department Comparison */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-rose-600" />
                Department Comparison
              </span>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-center p-3 font-medium">Employees</th>
                    <th className="text-center p-3 font-medium">Avg Salary</th>
                    <th className="text-center p-3 font-medium">Total Cost</th>
                    <th className="text-center p-3 font-medium">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentData.map((dept, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{dept.name}</td>
                      <td className="p-3 text-center">{dept.employees}</td>
                      <td className="p-3 text-center">K{dept.avgSalary.toLocaleString()}</td>
                      <td className="p-3 text-center font-medium">
                        K{(dept.employees * dept.avgSalary).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-green-600">↑ {Math.floor(Math.random() * 5 + 1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-rose-600" />
              6-Month Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrends.map((trend, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                  <div className="font-medium">{trend.month} 2025</div>
                  <div className="text-center">
                    <span className="text-sm text-gray-600">Employees: </span>
                    <span className="font-bold">{trend.employees}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">Payroll: </span>
                    <span className="font-bold text-green-600">{formatCurrency(trend.payroll)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
