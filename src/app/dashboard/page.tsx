import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  BarChart,
  Building2,
  UserCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">🌿</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">PNG UNRE HRMS</h1>
                  <p className="text-xs text-muted-foreground">Human Resources Management</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">HR Manager</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">AU</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Welcome to PNG University HRMS & Payroll System</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">524</p>
                  <p className="text-xs text-green-600 mt-1">↑ 12 this month</p>
                </div>
                <Users className="h-10 w-10 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">On Leave Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">23</p>
                  <p className="text-xs text-gray-500 mt-1">4.4% of staff</p>
                </div>
                <Calendar className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-orange-600">15</p>
                  <p className="text-xs text-gray-500 mt-1">Requires action</p>
                </div>
                <AlertCircle className="h-10 w-10 text-orange-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Payroll</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-emerald-600">K2.4M</p>
                  <p className="text-xs text-gray-500 mt-1">December 2025</p>
                </div>
                <DollarSign className="h-10 w-10 text-emerald-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Modules */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">HRMS Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Employee Management */}
            <Link href="/dashboard/employees">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Users className="h-12 w-12 text-primary mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">524 Staff</span>
                  </div>
                  <CardTitle className="text-xl">Employee Management</CardTitle>
                  <CardDescription>
                    Manage faculty, staff, and administrative personnel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• View all employees</li>
                    <li>• Add new staff members</li>
                    <li>• Update employee information</li>
                    <li>• Department assignments</li>
                  </ul>
                  <Button className="w-full mt-4">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Leave Management */}
            <Link href="/dashboard/leave">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Calendar className="h-12 w-12 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">15 Pending</span>
                  </div>
                  <CardTitle className="text-xl">Leave Management</CardTitle>
                  <CardDescription>
                    Handle leave requests and approvals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• View leave requests</li>
                    <li>• Approve/reject applications</li>
                    <li>• Check leave balances</li>
                    <li>• Leave history reports</li>
                  </ul>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Attendance */}
            <Link href="/dashboard/attendance">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-purple-500 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Clock className="h-12 w-12 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">96% Today</span>
                  </div>
                  <CardTitle className="text-xl">Attendance Tracking</CardTitle>
                  <CardDescription>
                    Monitor employee attendance and check-ins
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Daily attendance records</li>
                    <li>• Check-in/check-out logs</li>
                    <li>• Late arrival tracking</li>
                    <li>• Attendance reports</li>
                  </ul>
                  <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Payroll */}
            <Link href="/dashboard/payroll">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-emerald-500 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <DollarSign className="h-12 w-12 text-emerald-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-1 rounded">Dec 2025</span>
                  </div>
                  <CardTitle className="text-xl">Payroll Processing</CardTitle>
                  <CardDescription>
                    Process salaries and allowances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Monthly payroll runs</li>
                    <li>• Salary calculations</li>
                    <li>• Tax deductions</li>
                    <li>• Payment processing</li>
                  </ul>
                  <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Departments */}
            <Link href="/dashboard/departments">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-amber-500 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <Building2 className="h-12 w-12 text-amber-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-amber-100 text-amber-600 px-2 py-1 rounded">5 Faculties</span>
                  </div>
                  <CardTitle className="text-xl">Departments</CardTitle>
                  <CardDescription>
                    Manage organizational structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• View all departments</li>
                    <li>• Faculty management</li>
                    <li>• Department heads</li>
                    <li>• Staff allocation</li>
                  </ul>
                  <Button className="w-full mt-4 bg-amber-600 hover:bg-amber-700">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>

            {/* Reports */}
            <Link href="/dashboard/reports">
              <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-rose-500 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <BarChart className="h-12 w-12 text-rose-600 mb-3 group-hover:scale-110 transition-transform" />
                    <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded">Analytics</span>
                  </div>
                  <CardTitle className="text-xl">Reports & Analytics</CardTitle>
                  <CardDescription>
                    Generate HR insights and reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Employee statistics</li>
                    <li>• Payroll summaries</li>
                    <li>• Attendance analytics</li>
                    <li>• Custom reports</li>
                  </ul>
                  <Button className="w-full mt-4 bg-rose-600 hover:bg-rose-700">Open Module →</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>Latest applications requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Dr. John Kila', dept: 'Environmental Sciences', type: 'Annual Leave', days: '5 days', status: 'pending' },
                  { name: 'Sarah Puka', dept: 'Administration', type: 'Sick Leave', days: '2 days', status: 'pending' },
                  { name: 'Prof. Mary Tone', dept: 'Natural Resources', type: 'Conference', days: '3 days', status: 'approved' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.dept} • {item.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{item.days}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        item.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">View All Requests</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link href="/dashboard/employees/new">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Add New Employee
                  </Button>
                </Link>
                <Link href="/dashboard/payroll/process">
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Monthly Payroll
                  </Button>
                </Link>
                <Link href="/dashboard/reports/attendance">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart className="h-4 w-4 mr-2" />
                    Generate Attendance Report
                  </Button>
                </Link>
                <Link href="/dashboard/leave/approve">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Review Leave Applications
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
