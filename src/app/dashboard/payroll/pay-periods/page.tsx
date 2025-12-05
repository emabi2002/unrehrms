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
import { Plus, Calendar, Lock, Unlock, Play } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PayPeriod {
  id: string
  period_name: string
  period_type: 'monthly' | 'fortnightly'
  start_date: string
  end_date: string
  payment_date: string
  status: 'draft' | 'open' | 'closed' | 'processed'
  is_locked: boolean
  created_at: string
}

export default function PayPeriodsPage() {
  const [periods, setPeriods] = useState<PayPeriod[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadPeriods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadPeriods() {
    setLoading(true)
    const { data, error } = await supabase
      .from('pay_periods')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Error loading periods:', error)
      toast.error('Failed to load pay periods')
    } else {
      setPeriods(data || [])
    }
    setLoading(false)
  }

  async function toggleLock(period: PayPeriod) {
    const { error } = await supabase
      .from('pay_periods')
      .update({ is_locked: !period.is_locked })
      .eq('id', period.id)

    if (error) {
      toast.error('Failed to update period')
    } else {
      toast.success(`Period ${period.is_locked ? 'unlocked' : 'locked'}`)
      loadPeriods()
    }
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from('pay_periods')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success('Status updated')
      loadPeriods()
    }
  }

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    open: 'bg-blue-100 text-blue-800',
    closed: 'bg-orange-100 text-orange-800',
    processed: 'bg-green-100 text-green-800',
  }

  if (loading) {
    return <div className="text-center py-12">Loading pay periods...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pay Periods</h1>
          <p className="text-gray-600 mt-2">
            Manage monthly and fortnightly payroll periods
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Period
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Periods</p>
              <p className="text-2xl font-bold mt-1">{periods.length}</p>
            </div>
            <Calendar className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold mt-1">
                {periods.filter(p => p.status === 'open').length}
              </p>
            </div>
            <Play className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closed</p>
              <p className="text-2xl font-bold mt-1">
                {periods.filter(p => p.status === 'closed').length}
              </p>
            </div>
            <Lock className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="text-2xl font-bold mt-1">
                {periods.filter(p => p.status === 'processed').length}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Periods List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  End Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
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
              {periods.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No pay periods found. Click "Create Period" to add one.
                  </td>
                </tr>
              ) : (
                periods.map((period) => (
                  <tr key={period.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{period.period_name}</span>
                        {period.is_locked && (
                          <Lock className="h-4 w-4 text-orange-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="capitalize">
                        {period.period_type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(period.start_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(period.end_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(period.payment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[period.status]}>
                        {period.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        {period.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(period.id, 'open')}
                          >
                            Open
                          </Button>
                        )}
                        {period.status === 'open' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateStatus(period.id, 'closed')}
                          >
                            Close
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleLock(period)}
                        >
                          {period.is_locked ? (
                            <Unlock className="h-4 w-4" />
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
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

      {/* Create Period Dialog */}
      <CreatePeriodDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => {
          loadPeriods()
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

function CreatePeriodDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    period_name: '',
    period_type: 'monthly' as 'monthly' | 'fortnightly',
    start_date: '',
    end_date: '',
    payment_date: '',
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('pay_periods')
      .insert([{
        ...formData,
        status: 'draft',
        is_locked: false,
      }])

    setSaving(false)

    if (error) {
      console.error('Error creating period:', error)
      toast.error('Failed to create period')
    } else {
      toast.success('Period created successfully')
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Pay Period</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Period Name *</label>
            <Input
              value={formData.period_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, period_name: e.target.value })
              }
              placeholder="e.g. December 2025"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Period Type *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.period_type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, period_type: e.target.value as 'monthly' | 'fortnightly' })
              }
            >
              <option value="monthly">Monthly</option>
              <option value="fortnightly">Fortnightly</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Start Date *</label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">End Date *</label>
            <Input
              type="date"
              value={formData.end_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Payment Date *</label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, payment_date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Creating...' : 'Create Period'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
