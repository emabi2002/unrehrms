'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, FileText, DollarSign, Users, Download, Eye } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function PayrollReportsPage() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalGross: 0,
    totalTax: 0,
    totalNet: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadStats() {
    setLoading(true)

    // Load latest pay run stats
    const { data, error } = await supabase
      .from('pay_runs')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading stats:', error)
    } else if (data) {
      setStats({
        totalEmployees: data.total_employees || 0,
        totalGross: data.total_gross || 0,
        totalTax: data.total_tax || 0,
        totalNet: data.total_net || 0,
      })
    }

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const reports = [
    {
      id: 'payroll-summary',
      name: 'Payroll Summary Report',
      description: 'Overview of payroll costs by department and period',
      icon: BarChart,
      category: 'Summary',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'employee-earnings',
      name: 'Employee Earnings Report',
      description: 'Detailed breakdown of employee earnings and deductions',
      icon: Users,
      category: 'Employee',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'tax-report',
      name: 'Tax Deductions Report',
      description: 'PNG tax deductions by bracket and employee',
      icon: FileText,
      category: 'Tax',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      id: 'super-contributions',
      name: 'Super Contributions Report',
      description: 'Employer and employee superannuation contributions',
      icon: DollarSign,
      category: 'Super',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'department-costs',
      name: 'Department Costs Report',
      description: 'Payroll costs breakdown by department',
      icon: BarChart,
      category: 'Department',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      id: 'payslip-register',
      name: 'Payslip Register',
      description: 'Complete register of all payslips by period',
      icon: FileText,
      category: 'Processing',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      id: 'bank-payments',
      name: 'Bank Payments Report',
      description: 'Summary of bank payment exports and confirmations',
      icon: DollarSign,
      category: 'Banking',
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      id: 'variance-report',
      name: 'Payroll Variance Report',
      description: 'Period-over-period payroll variance analysis',
      icon: BarChart,
      category: 'Analysis',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
  ]

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payroll Reports</h1>
        <p className="text-gray-600 mt-2">
          Generate comprehensive payroll reports and analytics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold mt-1">{stats.totalEmployees}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gross Pay</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(stats.totalGross)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tax</p>
              <p className="text-2xl font-bold mt-1 text-red-600">
                {formatCurrency(stats.totalTax)}
              </p>
            </div>
            <FileText className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Net Pay</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                {formatCurrency(stats.totalNet)}
              </p>
            </div>
            <BarChart className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${report.bgColor}`}>
                  <Icon className={`h-6 w-6 ${report.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {report.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {report.description}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast('Report preview coming soon')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success('Download feature coming soon')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Report Formats */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">Available Export Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-red-600" />
            <div>
              <p className="font-semibold">PDF</p>
              <p className="text-sm text-gray-600">Print-ready format</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-green-600" />
            <div>
              <p className="font-semibold">Excel</p>
              <p className="text-sm text-gray-600">Spreadsheet analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="font-semibold">CSV</p>
              <p className="text-sm text-gray-600">Raw data export</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Scheduled Reports */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Scheduled Reports (Coming Soon)</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>Set up automated report generation and email delivery:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Daily attendance summaries</li>
            <li>Weekly payroll processing status</li>
            <li>Monthly payroll cost analysis</li>
            <li>Quarterly tax and super reports</li>
            <li>Annual payroll summary</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
