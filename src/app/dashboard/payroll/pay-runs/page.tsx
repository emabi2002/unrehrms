'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Plus, Play, Check, X, FileText, DollarSign } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PayPeriod {
  id: string
  period_name: string
  start_date: string
  end_date: string
}

interface PayRun {
  id: string
  run_name: string
  pay_period_id: string
  total_employees: number
  total_gross: number
  total_tax: number
  total_net: number
  status: 'draft' | 'processing' | 'completed' | 'cancelled'
  processed_at: string | null
  created_at: string
  pay_periods?: PayPeriod
}

export default function PayRunsPage() {
  const [payRuns, setPayRuns] = useState<PayRun[]>([])
  const [periods, setPeriods] = useState<PayPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)

    // Load pay runs
    const { data: runsData, error: runsError } = await supabase
      .from('pay_runs')
      .select(`
        *,
        pay_periods (
          id,
          period_name,
          start_date,
          end_date
        )
      `)
      .order('created_at', { ascending: false })

    if (runsError) {
      console.error('Error loading runs:', runsError)
      toast.error('Failed to load pay runs')
    } else {
      setPayRuns(runsData || [])
    }

    // Load available periods
    const { data: periodsData } = await supabase
      .from('pay_periods')
      .select('*')
      .in('status', ['open', 'draft'])
      .order('start_date', { ascending: false })

    setPeriods(periodsData || [])

    setLoading(false)
  }

  async function processPayRun(id: string) {
    if (!confirm('Process this pay run? This will generate payslips for all employees.')) return

    const { error } = await supabase
      .from('pay_runs')
      .update({
        status: 'processing',
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to start processing')
    } else {
      toast.success('Pay run processing started')
      loadData()
    }
  }

  async function completePayRun(id: string) {
    const { error } = await supabase
      .from('pay_runs')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) {
      toast.error('Failed to complete pay run')
    } else {
      toast.success('Pay run completed successfully')
      loadData()
    }
  }

  async function cancelPayRun(id: string) {
    if (!confirm('Cancel this pay run?')) return

    const { error } = await supabase
      .from('pay_runs')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to cancel pay run')
    } else {
      toast.success('Pay run cancelled')
      loadData()
    }
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }

  function formatCurrency(amount: number | null) {
    if (!amount) return 'K0.00'
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  if (loading) {
    return <div className="text-center py-12">Loading pay runs...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pay Runs</h1>
          <p className="text-gray-600 mt-2">
            Process payroll and generate payslips
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Pay Run
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Runs</p>
              <p className="text-2xl font-bold mt-1">{payRuns.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold mt-1">
                {payRuns.filter(r => r.status === 'processing').length}
              </p>
            </div>
            <Play className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold mt-1">
                {payRuns.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <Check className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold mt-1">
                {payRuns.filter(r =>
                  new Date(r.created_at).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Pay Runs List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Run Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pay Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Gross
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total Net
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
              {payRuns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No pay runs found. Click "Create Pay Run" to start.
                  </td>
                </tr>
              ) : (
                payRuns.map((run) => (
                  <tr key={run.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{run.run_name}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(run.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {run.pay_periods?.period_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {run.total_employees || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {formatCurrency(run.total_gross)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(run.total_net)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[run.status]}>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {run.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => processPayRun(run.id)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Process
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelPayRun(run.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {run.status === 'processing' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completePayRun(run.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                        )}
                        {run.status === 'completed' && (
                          <Link href={`/dashboard/payroll/payslips?run_id=${run.id}`}>
                            <Button size="sm" variant="outline">
                              <FileText className="h-4 w-4 mr-1" />
                              View Payslips
                            </Button>
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Pay Run Dialog */}
      <CreatePayRunDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        periods={periods}
        onSuccess={() => {
          loadData()
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

function CreatePayRunDialog({
  open,
  onOpenChange,
  periods,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  periods: PayPeriod[]
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    run_name: '',
    pay_period_id: '',
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('pay_runs')
      .insert([{
        ...formData,
        status: 'draft',
        total_employees: 0,
        total_gross: 0,
        total_tax: 0,
        total_net: 0,
      }])

    setSaving(false)

    if (error) {
      console.error('Error creating pay run:', error)
      toast.error('Failed to create pay run')
    } else {
      toast.success('Pay run created successfully')
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Pay Run</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Run Name *</label>
            <input
              type="text"
              className="w-full border rounded-md px-3 py-2"
              value={formData.run_name}
              onChange={(e) => setFormData({ ...formData, run_name: e.target.value })}
              placeholder="e.g. December 2025 Payroll"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Pay Period *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.pay_period_id}
              onChange={(e) => setFormData({ ...formData, pay_period_id: e.target.value })}
              required
            >
              <option value="">-- Select Period --</option>
              {periods.map((period) => (
                <option key={period.id} value={period.id}>
                  {period.period_name} ({new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> This will create a draft pay run. You can review and process it later.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Creating...' : 'Create Pay Run'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
