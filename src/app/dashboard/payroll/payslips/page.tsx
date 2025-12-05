'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileText, Download, Search, Eye, Calendar, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  department: string
}

interface PayPeriod {
  id: string
  period_name: string
  start_date: string
  end_date: string
  payment_date: string
}

interface PayRun {
  id: string
  run_name: string
}

interface Payslip {
  id: string
  employee_id: string
  pay_period_id: string
  pay_run_id: string
  gross_pay: number
  total_deductions: number
  net_pay: number
  payment_date: string
  status: 'draft' | 'approved' | 'paid'
  created_at: string
  employees?: Employee
  pay_periods?: PayPeriod
  pay_runs?: PayRun
}

interface PayslipLineItem {
  id: string
  payslip_id: string
  salary_component_id: string
  component_type: 'earning' | 'deduction'
  amount: number
  salary_components?: {
    code: string
    name: string
    type: 'earning' | 'deduction'
  }
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewingPayslip, setViewingPayslip] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadPayslips()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPayslips() {
    setLoading(true)

    const { data, error } = await supabase
      .from('payslip_details')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          department
        ),
        pay_periods (
          id,
          period_name,
          start_date,
          end_date,
          payment_date
        ),
        pay_runs (
          id,
          run_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading payslips:', error)
      toast.error('Failed to load payslips')
    } else {
      setPayslips(data || [])
    }

    setLoading(false)
  }

  const filteredPayslips = payslips.filter(p => {
    const matchesSearch = searchTerm === '' ||
      p.employees?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employees?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employees?.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  }

  if (loading) {
    return <div className="text-center py-12">Loading payslips...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payslips</h1>
          <p className="text-gray-600 mt-2">
            View and download employee payslips
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Payslips</p>
              <p className="text-2xl font-bold mt-1">{payslips.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold mt-1">
                {payslips.filter(p => p.status === 'approved').length}
              </p>
            </div>
            <Eye className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold mt-1">
                {payslips.filter(p => p.status === 'paid').length}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold mt-1">
                {payslips.filter(p =>
                  new Date(p.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Payslips List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gross Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Deductions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Net Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'No payslips found matching your filters.'
                      : 'No payslips generated yet. Process a pay run to create payslips.'}
                  </td>
                </tr>
              ) : (
                filteredPayslips.map((payslip) => (
                  <tr key={payslip.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payslip.employees?.first_name} {payslip.employees?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payslip.employees?.employee_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payslip.pay_periods?.period_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(payslip.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(payslip.gross_pay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                      -{formatCurrency(payslip.total_deductions)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                      {formatCurrency(payslip.net_pay)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[payslip.status]}>
                        {payslip.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingPayslip(payslip.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success('Download feature coming soon')}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payslip Detail Dialog */}
      {viewingPayslip && (
        <PayslipDetailDialog
          payslipId={viewingPayslip}
          onClose={() => setViewingPayslip(null)}
        />
      )}
    </div>
  )
}

// Payslip Detail Dialog Component
function PayslipDetailDialog({
  payslipId,
  onClose,
}: {
  payslipId: string
  onClose: () => void
}) {
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [lineItems, setLineItems] = useState<PayslipLineItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadPayslipDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payslipId])

  async function loadPayslipDetail() {
    setLoading(true)

    // Load payslip details
    const { data: payslipData, error: payslipError } = await supabase
      .from('payslip_details')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          department
        ),
        pay_periods (
          period_name,
          start_date,
          end_date,
          payment_date
        ),
        pay_runs (
          run_name
        )
      `)
      .eq('id', payslipId)
      .single()

    if (payslipError) {
      console.error('Error loading payslip:', payslipError)
      toast.error('Failed to load payslip details')
    } else {
      setPayslip(payslipData)
    }

    // Load line items (earnings and deductions)
    const { data: itemsData, error: itemsError } = await supabase
      .from('payslip_line_items')
      .select(`
        *,
        salary_components (
          code,
          name,
          type
        )
      `)
      .eq('payslip_id', payslipId)

    if (itemsError) {
      console.error('Error loading line items:', itemsError)
    } else {
      setLineItems(itemsData || [])
    }

    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const earnings = lineItems.filter(item => item.component_type === 'earning')
  const deductions = lineItems.filter(item => item.component_type === 'deduction')

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payslip Details</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-12">Loading payslip...</div>
        ) : !payslip ? (
          <div className="text-center py-12 text-gray-500">Payslip not found</div>
        ) : (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="text-lg font-bold">
                    {payslip.employees?.first_name} {payslip.employees?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{payslip.employees?.employee_id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{payslip.employees?.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pay Period</p>
                  <p className="font-medium">{payslip.pay_periods?.period_name}</p>
                  <p className="text-xs text-gray-500">
                    {payslip.pay_periods?.start_date && new Date(payslip.pay_periods.start_date).toLocaleDateString()} - {payslip.pay_periods?.end_date && new Date(payslip.pay_periods.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Payment Date</p>
                  <p className="font-medium">{new Date(payslip.payment_date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Earnings Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-green-700">Earnings</h3>
              <div className="space-y-2">
                {earnings.length === 0 ? (
                  <p className="text-sm text-gray-500">No earnings recorded</p>
                ) : (
                  earnings.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.salary_components?.name}</p>
                        <p className="text-xs text-gray-500">{item.salary_components?.code}</p>
                      </div>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded mt-2">
                <p className="font-bold">Total Earnings</p>
                <p className="font-bold text-green-700 text-lg">
                  {formatCurrency(payslip.gross_pay)}
                </p>
              </div>
            </div>

            {/* Deductions Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3 text-red-700">Deductions</h3>
              <div className="space-y-2">
                {deductions.length === 0 ? (
                  <p className="text-sm text-gray-500">No deductions recorded</p>
                ) : (
                  deductions.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.salary_components?.name}</p>
                        <p className="text-xs text-gray-500">{item.salary_components?.code}</p>
                      </div>
                      <p className="font-semibold text-red-600">
                        -{formatCurrency(item.amount)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between items-center p-3 bg-red-100 rounded mt-2">
                <p className="font-bold">Total Deductions</p>
                <p className="font-bold text-red-700 text-lg">
                  -{formatCurrency(payslip.total_deductions)}
                </p>
              </div>
            </div>

            {/* Net Pay */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg text-white">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-green-100 text-sm">Net Pay</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(payslip.net_pay)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-white text-green-700">
                    {payslip.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => toast.success('Download feature coming soon')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
