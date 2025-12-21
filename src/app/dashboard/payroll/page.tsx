'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, DollarSign, Download, Send, FileText, FileSpreadsheet } from 'lucide-react'
import { exportToExcel, exportToPDF } from '@/lib/exports'
import { toast } from 'react-hot-toast'

export default function PayrollPage() {
  const [selectedMonth, setSelectedMonth] = useState('December')
  const [selectedYear, setSelectedYear] = useState(2025)
  const [exportLoading, setExportLoading] = useState(false)

  const payrollData = [
    {
      id: '1',
      employee_id: 'UNRE-2020-001',
      employee_name: 'Dr. John Kila',
      department: 'Faculty of Environmental Sciences',
      basic_salary: 85000,
      allowances: {
        teaching: 12000,
        research: 8000,
        housing: 15000
      },
      deductions: {
        tax: 18000,
        nhis: 2000,
        pension: 8500
      },
      net_salary: 91500
    },
    {
      id: '2',
      employee_id: 'UNRE-2021-045',
      employee_name: 'Sarah Puka',
      department: 'Administrative Services',
      basic_salary: 55000,
      allowances: {
        transport: 5000,
        housing: 10000,
        meal: 3000
      },
      deductions: {
        tax: 10000,
        nhis: 1500,
        pension: 5500
      },
      net_salary: 56000
    },
    {
      id: '3',
      employee_id: 'UNRE-2018-012',
      employee_name: 'Prof. Mary Tone',
      department: 'Faculty of Natural Resources',
      basic_salary: 110000,
      allowances: {
        teaching: 15000,
        research: 12000,
        housing: 20000,
        professional: 8000
      },
      deductions: {
        tax: 25000,
        nhis: 2500,
        pension: 11000
      },
      net_salary: 126500
    },
    {
      id: '4',
      employee_id: 'UNRE-2022-078',
      employee_name: 'David Kama',
      department: 'IT Department',
      basic_salary: 62000,
      allowances: {
        transport: 6000,
        technical: 8000,
        housing: 12000
      },
      deductions: {
        tax: 12000,
        nhis: 1800,
        pension: 6200
      },
      net_salary: 68000
    },
    {
      id: '5',
      employee_id: 'UNRE-2019-034',
      employee_name: 'Grace Namu',
      department: 'Faculty of Agriculture',
      basic_salary: 68000,
      allowances: {
        teaching: 10000,
        research: 5000,
        housing: 12000
      },
      deductions: {
        tax: 14000,
        nhis: 1900,
        pension: 6800
      },
      net_salary: 72300
    }
  ]

  const totalBasic = payrollData.reduce((sum, emp) => sum + emp.basic_salary, 0)
  const totalAllowances = payrollData.reduce((sum, emp) =>
    sum + Object.values(emp.allowances).reduce((a, b) => a + b, 0), 0)
  const totalDeductions = payrollData.reduce((sum, emp) =>
    sum + Object.values(emp.deductions).reduce((a, b) => a + b, 0), 0)
  const totalNet = payrollData.reduce((sum, emp) => sum + emp.net_salary, 0)

  const formatCurrency = (amount: number) => {
    return `K${amount.toLocaleString('en-PG')}`
  }

  async function handleExportExcel() {
    try {
      setExportLoading(true)
      const exportData = payrollData.map(emp => {
        const totalAllowances = Object.values(emp.allowances).reduce((a, b) => a + b, 0)
        const totalDeductions = Object.values(emp.deductions).reduce((a, b) => a + b, 0)

        return {
          'Employee ID': emp.employee_id,
          'Employee Name': emp.employee_name,
          'Department': emp.department,
          'Basic Salary': emp.basic_salary,
          'Total Allowances': totalAllowances,
          'Total Deductions': totalDeductions,
          'Net Salary': emp.net_salary,
          'Month': selectedMonth,
          'Year': selectedYear,
        }
      })

      const success = exportToExcel(exportData, `Payroll_${selectedMonth}_${selectedYear}`, 'Payroll')
      if (success) {
        toast.success('Excel file downloaded successfully')
      } else {
        toast.error('Failed to export Excel file')
      }
    } finally {
      setExportLoading(false)
    }
  }

  async function handleExportPDF() {
    try {
      setExportLoading(true)
      const pdfData = payrollData.map(emp => {
        const totalAllowances = Object.values(emp.allowances).reduce((a, b) => a + b, 0)
        const totalDeductions = Object.values(emp.deductions).reduce((a, b) => a + b, 0)

        return {
          empId: emp.employee_id,
          name: emp.employee_name,
          department: emp.department,
          basic: formatCurrency(emp.basic_salary),
          allowances: formatCurrency(totalAllowances),
          deductions: formatCurrency(totalDeductions),
          net: formatCurrency(emp.net_salary),
        }
      })

      const columns = [
        { header: 'Employee ID', dataKey: 'empId' as keyof typeof pdfData[0] },
        { header: 'Name', dataKey: 'name' as keyof typeof pdfData[0] },
        { header: 'Department', dataKey: 'department' as keyof typeof pdfData[0] },
        { header: 'Basic', dataKey: 'basic' as keyof typeof pdfData[0] },
        { header: 'Allowances', dataKey: 'allowances' as keyof typeof pdfData[0] },
        { header: 'Deductions', dataKey: 'deductions' as keyof typeof pdfData[0] },
        { header: 'Net Salary', dataKey: 'net' as keyof typeof pdfData[0] },
      ]

      const success = exportToPDF(
        pdfData,
        columns,
        `Payroll Report - ${selectedMonth} ${selectedYear}`,
        `Payroll_${selectedMonth}_${selectedYear}`,
        {
          orientation: 'landscape',
          subtitle: `Total Employees: ${payrollData.length} | Net Payroll: ${formatCurrency(totalNet)}`,
        }
      )

      if (success) {
        toast.success('PDF file downloaded successfully')
      } else {
        toast.error('Failed to export PDF file')
      }
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
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
                <h1 className="text-xl font-bold text-emerald-600">Payroll Processing</h1>
                <p className="text-xs text-muted-foreground">Salary and allowance management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>January</option>
                <option>February</option>
                <option>March</option>
                <option>April</option>
                <option>May</option>
                <option>June</option>
                <option>July</option>
                <option>August</option>
                <option>September</option>
                <option>October</option>
                <option>November</option>
                <option>December</option>
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option>2025</option>
                <option>2024</option>
                <option>2023</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Basic Salary</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalBasic)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Allowances</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalAllowances)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDeductions)}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-emerald-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Net Payroll</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalNet)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedMonth} {selectedYear} Payroll</CardTitle>
              <div className="flex gap-2">
                <div className="relative group">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-200 hover:bg-green-50"
                    disabled={exportLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button
                      onClick={handleExportExcel}
                      disabled={exportLoading}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      Export to Excel
                    </button>
                    <button
                      onClick={handleExportPDF}
                      disabled={exportLoading}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4 text-red-600" />
                      Export to PDF
                    </button>
                  </div>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700" size="sm">
                  <Send className="h-4 w-4 mr-2" />
                  Process Payments
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payrollData.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{employee.employee_name}</h3>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                        <p className="text-xs text-gray-500">ID: {employee.employee_id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(employee.net_salary)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Basic Salary */}
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-gray-600 mb-2 font-medium">Basic Salary</p>
                        <p className="text-xl font-bold text-blue-600">
                          {formatCurrency(employee.basic_salary)}
                        </p>
                      </div>

                      {/* Allowances */}
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-gray-600 mb-2 font-medium">Allowances</p>
                        <div className="space-y-1">
                          {Object.entries(employee.allowances).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="font-medium">{formatCurrency(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-2 pt-2">
                          <div className="flex justify-between font-bold text-green-600">
                            <span>Total:</span>
                            <span>{formatCurrency(Object.values(employee.allowances).reduce((a, b) => a + b, 0))}</span>
                          </div>
                        </div>
                      </div>

                      {/* Deductions */}
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-gray-600 mb-2 font-medium">Deductions</p>
                        <div className="space-y-1">
                          {Object.entries(employee.deductions).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key}:</span>
                              <span className="font-medium">{formatCurrency(value)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t mt-2 pt-2">
                          <div className="flex justify-between font-bold text-red-600">
                            <span>Total:</span>
                            <span>{formatCurrency(Object.values(employee.deductions).reduce((a, b) => a + b, 0))}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View Salary Slip
                      </Button>
                      <Button size="sm" variant="outline">
                        Send via Email
                      </Button>
                      <Button size="sm" variant="outline">
                        Download PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
