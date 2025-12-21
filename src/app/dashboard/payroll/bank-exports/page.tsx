'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, Calendar, CheckCircle, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface BankExport {
  id: string
  pay_run_id: string
  file_name: string
  bank_code: string
  total_amount: number
  total_records: number
  export_date: string
  status: 'pending' | 'exported' | 'sent' | 'confirmed'
  pay_runs?: {
    run_name: string
    total_net: number
  }
}

export default function BankExportsPage() {
  const [exports, setExports] = useState<BankExport[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadExports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadExports() {
    setLoading(true)
    const { data, error } = await supabase
      .from('bank_export_files')
      .select(`
        *,
        pay_runs (
          run_name,
          total_net
        )
      `)
      .order('export_date', { ascending: false })

    if (error) {
      console.error('Error loading exports:', error)
      toast.error('Failed to load bank exports')
    } else {
      setExports(data || [])
    }
    setLoading(false)
  }

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    exported: 'bg-blue-100 text-blue-800',
    sent: 'bg-purple-100 text-purple-800',
    confirmed: 'bg-green-100 text-green-800',
  }

  const totalExported = exports.reduce((sum, e) => sum + e.total_amount, 0)

  if (loading) {
    return <div className="text-center py-12">Loading bank exports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bank Exports</h1>
          <p className="text-gray-600 mt-2">Export payroll data to BSP bank format</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast('Export feature coming soon')}>
          <Download className="h-4 w-4 mr-2" />
          Generate Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exports</p>
              <p className="text-2xl font-bold mt-1">{exports.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(totalExported)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {exports.filter(e => e.status === 'confirmed').length}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                {exports.filter(e =>
                  new Date(e.export_date).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  File Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pay Run
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Export Date
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
              {exports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No bank exports found. Generate an export file to start.
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <tr key={exp.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium font-mono">{exp.file_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {exp.pay_runs?.run_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {exp.bank_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {exp.total_records}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(exp.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(exp.export_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[exp.status]}>
                        {exp.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success('Download feature coming soon')}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">BSP Bank Export Format</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Supported Banks:</strong> BSP (Bank South Pacific)</p>
          <p><strong>File Format:</strong> CSV with bank-specific formatting</p>
          <p><strong>Required Fields:</strong> Account Number, Employee Name, Amount, Reference</p>
          <p><strong>Payment Method:</strong> Direct Credit</p>
          <p className="mt-3 font-semibold">
            Export files are automatically formatted according to BSP requirements and ready for upload to internet banking.
          </p>
        </div>
      </Card>
    </div>
  )
}
