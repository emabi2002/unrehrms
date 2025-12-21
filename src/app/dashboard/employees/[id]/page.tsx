'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  User,
  Download
} from 'lucide-react'

export default function EmployeeDetailPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  const handleExport = () => {
    // Create employee data for export
    const exportData = {
      'Employee ID': employee.employee_id,
      'Full Name': `${employee.first_name} ${employee.last_name}`,
      'Email': employee.email,
      'Phone': employee.phone,
      'Department': employee.department,
      'Position': employee.position,
      'Employment Type': employee.employment_type,
      'Salary': formatCurrency(employee.salary),
      'Hire Date': employee.hire_date,
      'Status': employee.status,
      'Address': employee.address,
      'Emergency Contact': employee.emergency_contact.name,
      'Emergency Phone': employee.emergency_contact.phone
    }

    // Convert to JSON string with formatting
    const jsonStr = JSON.stringify(exportData, null, 2)

    // Create blob and download
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `employee-${employee.employee_id}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Sample employee data (would come from database)
  const employee = {
    id: params.id,
    first_name: 'John',
    last_name: 'Kila',
    email: 'j.kila@unre.ac.pg',
    phone: '+675 7123 4567',
    employee_id: 'UNRE-2020-001',
    department: 'Faculty of Environmental Sciences',
    position: 'Senior Lecturer',
    employment_type: 'Full-time Academic',
    salary: 85000,
    hire_date: '2020-01-15',
    status: 'active',
    address: 'Port Moresby, National Capital District',
    emergency_contact: {
      name: 'Jane Kila',
      phone: '+675 7234 5678',
      relation: 'Spouse'
    }
  }

  const salaryHistory = [
    { date: '2024-12-01', amount: 85000, type: 'Monthly Salary', status: 'Paid' },
    { date: '2024-11-01', amount: 85000, type: 'Monthly Salary', status: 'Paid' },
    { date: '2024-10-01', amount: 85000, type: 'Monthly Salary', status: 'Paid' },
    { date: '2024-09-01', amount: 85000, type: 'Monthly Salary', status: 'Paid' }
  ]

  const leaveHistory = [
    {
      id: 'LV001',
      type: 'Annual Leave',
      start_date: '2024-12-20',
      end_date: '2024-12-24',
      days: 5,
      status: 'Approved'
    },
    {
      id: 'LV002',
      type: 'Sick Leave',
      start_date: '2024-11-10',
      end_date: '2024-11-11',
      days: 2,
      status: 'Approved'
    }
  ]

  const attendanceRecords = [
    { date: '2025-12-05', check_in: '08:15', check_out: '17:30', hours: 9.25, status: 'Present' },
    { date: '2025-12-04', check_in: '08:10', check_out: '17:45', hours: 9.58, status: 'Present' },
    { date: '2025-12-03', check_in: '09:05', check_out: '18:00', hours: 8.92, status: 'Late' },
    { date: '2025-12-02', check_in: '08:00', check_out: '17:15', hours: 9.25, status: 'Present' }
  ]

  const formatCurrency = (amount: number) => {
    return `K${amount.toLocaleString('en-PG')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/employees">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Employees
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-xs text-muted-foreground">{employee.employee_id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/employees/${employee.id}/edit`}>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Employee Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-primary">
                  {employee.first_name[0]}{employee.last_name[0]}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">
                  {employee.first_name} {employee.last_name}
                </h2>
                <p className="text-lg text-gray-600 mb-4">{employee.position}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span className="text-sm">{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">{formatCurrency(employee.salary)}/year</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'salary' ? 'default' : 'outline'}
            onClick={() => setActiveTab('salary')}
          >
            Salary History
          </Button>
          <Button
            variant={activeTab === 'leave' ? 'default' : 'outline'}
            onClick={() => setActiveTab('leave')}
          >
            Leave Records
          </Button>
          <Button
            variant={activeTab === 'attendance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Full Name</p>
                  <p className="font-medium">{employee.first_name} {employee.last_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{employee.employee_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{employee.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{employee.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">{employee.address}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Employment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{employee.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employment Type</p>
                  <p className="font-medium">{employee.employment_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hire Date</p>
                  <p className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Annual Salary</p>
                  <p className="font-medium text-primary">{formatCurrency(employee.salary)}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-medium">{employee.emergency_contact.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-medium">{employee.emergency_contact.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Relation</p>
                  <p className="font-medium">{employee.emergency_contact.relation}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'salary' && (
          <Card>
            <CardHeader>
              <CardTitle>Salary Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {salaryHistory.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-3">{record.type}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(record.amount)}</td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'leave' && (
          <Card>
            <CardHeader>
              <CardTitle>Leave Application History</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Leave ID</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Duration</th>
                    <th className="text-center p-3">Days</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveHistory.map((leave) => (
                    <tr key={leave.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{leave.id}</td>
                      <td className="p-3">{leave.type}</td>
                      <td className="p-3">
                        {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">{leave.days}</td>
                      <td className="p-3 text-center">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {activeTab === 'attendance' && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">Date</th>
                    <th className="text-center p-3">Check In</th>
                    <th className="text-center p-3">Check Out</th>
                    <th className="text-center p-3">Hours</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="p-3 text-center font-mono">{record.check_in}</td>
                      <td className="p-3 text-center font-mono">{record.check_out}</td>
                      <td className="p-3 text-center font-medium">{record.hours}h</td>
                      <td className="p-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          record.status === 'Present' ? 'bg-green-100 text-green-700' :
                          record.status === 'Late' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
