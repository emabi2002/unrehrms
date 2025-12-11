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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SalaryComponent {
  id: string
  code: string
  name: string
  type: 'earning' | 'deduction'
  description: string | null
  component_category: string | null
  is_taxable: boolean
  is_fixed: boolean
  default_amount: number | null
  calculation_formula: string | null
  display_order: number
  is_active: boolean
  created_at: string
}

export default function SalaryComponentsPage() {
  const [components, setComponents] = useState<SalaryComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'earning' | 'deduction'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<SalaryComponent | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadComponents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadComponents() {
    setLoading(true)
    const { data, error } = await supabase
      .from('salary_components')
      .select('*')
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error loading components:', error)
      toast.error('Failed to load salary components')
    } else {
      setComponents(data || [])
    }
    setLoading(false)
  }

  const filteredComponents = components.filter(c =>
    filter === 'all' || c.type === filter
  )

  const earnings = filteredComponents.filter(c => c.type === 'earning')
  const deductions = filteredComponents.filter(c => c.type === 'deduction')

  function handleEdit(component: SalaryComponent) {
    setEditingComponent(component)
    setDialogOpen(true)
  }

  function handleAdd() {
    setEditingComponent(null)
    setDialogOpen(true)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const { error } = await supabase
      .from('salary_components')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting component:', error)
      toast.error('Failed to delete component')
    } else {
      toast.success('Component deleted successfully')
      loadComponents()
    }
  }

  async function handleToggleActive(component: SalaryComponent) {
    const { error } = await supabase
      .from('salary_components')
      .update({ is_active: !component.is_active })
      .eq('id', component.id)

    if (error) {
      console.error('Error toggling component:', error)
      toast.error('Failed to update component')
    } else {
      toast.success(`Component ${component.is_active ? 'deactivated' : 'activated'}`)
      loadComponents()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading salary components...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Components</h1>
          <p className="text-gray-600 mt-2">
            Manage earnings and deductions used in payroll
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Component
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Components</p>
              <p className="text-2xl font-bold mt-1">{components.length}</p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Earnings</p>
              <p className="text-2xl font-bold mt-1">{earnings.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deductions</p>
              <p className="text-2xl font-bold mt-1">{deductions.length}</p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All ({components.length})
        </Button>
        <Button
          variant={filter === 'earning' ? 'default' : 'outline'}
          onClick={() => setFilter('earning')}
        >
          Earnings ({earnings.length})
        </Button>
        <Button
          variant={filter === 'deduction' ? 'default' : 'outline'}
          onClick={() => setFilter('deduction')}
        >
          Deductions ({deductions.length})
        </Button>
      </div>

      {/* Components Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Properties
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No salary components found. Click "Add Component" to create one.
                  </td>
                </tr>
              ) : (
                filteredComponents.map((component) => (
                  <tr key={component.id} className={!component.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {component.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {component.name}
                        </div>
                        {component.description && (
                          <div className="text-sm text-gray-500">
                            {component.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          component.type === 'earning'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }
                      >
                        {component.type === 'earning' ? (
                          <><TrendingUp className="h-3 w-3 mr-1 inline" /> Earning</>
                        ) : (
                          <><TrendingDown className="h-3 w-3 mr-1 inline" /> Deduction</>
                        )}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex flex-wrap gap-1">
                        {component.is_taxable && (
                          <Badge variant="outline" className="text-xs">Taxable</Badge>
                        )}
                        {component.is_fixed && (
                          <Badge variant="outline" className="text-xs">Fixed</Badge>
                        )}
                        {component.component_category && (
                          <Badge variant="outline" className="text-xs capitalize">{component.component_category}</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(component)}
                        disabled={['basic', 'tax', 'superannuation'].includes(component.component_category || '')}
                      >
                        <Badge
                          className={
                            component.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {component.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(component)}
                          disabled={['basic', 'tax', 'superannuation'].includes(component.component_category || '')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(component.id, component.name)}
                          disabled={['basic', 'tax', 'superannuation'].includes(component.component_category || '')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Add/Edit Dialog */}
      <ComponentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        component={editingComponent}
        onSuccess={() => {
          loadComponents()
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

// Component Form Dialog
function ComponentFormDialog({
  open,
  onOpenChange,
  component,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  component: SalaryComponent | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'earning' as 'earning' | 'deduction',
    description: '',
    component_category: 'allowance',
    is_taxable: true,
    is_fixed: true,
    default_amount: null as number | null,
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (component) {
      setFormData({
        code: component.code,
        name: component.name,
        type: component.type,
        description: component.description || '',
        component_category: component.component_category || 'allowance',
        is_taxable: component.is_taxable,
        is_fixed: component.is_fixed,
        default_amount: component.default_amount,
      })
    } else {
      setFormData({
        code: '',
        name: '',
        type: 'earning',
        description: '',
        component_category: 'allowance',
        is_taxable: true,
        is_fixed: true,
        default_amount: null,
      })
    }
  }, [component, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    // Get max display order for new components
    let displayOrder = 100
    if (!component) {
      const { data: existing } = await supabase
        .from('salary_components')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1)

      if (existing && existing.length > 0) {
        displayOrder = (existing[0].display_order || 100) + 1
      }
    }

    const data = {
      ...formData,
      display_order: component ? component.display_order : displayOrder,
      is_active: true,
    }

    let error

    if (component) {
      // Update existing
      const result = await supabase
        .from('salary_components')
        .update(data)
        .eq('id', component.id)
      error = result.error
    } else {
      // Create new
      const result = await supabase
        .from('salary_components')
        .insert([data])
      error = result.error
    }

    setSaving(false)

    if (error) {
      console.error('Error saving component:', error)
      toast.error('Failed to save component')
    } else {
      toast.success(`Component ${component ? 'updated' : 'created'} successfully`)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {component ? 'Edit Component' : 'Add New Component'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Code *</label>
            <Input
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="e.g. HOUSING"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Name *</label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Housing Allowance"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Type *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, type: e.target.value as 'earning' | 'deduction' })}
            >
              <option value="earning">Earning</option>
              <option value="deduction">Deduction</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Category *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.component_category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, component_category: e.target.value })}
            >
              <option value="allowance">Allowance</option>
              <option value="overtime">Overtime</option>
              <option value="bonus">Bonus</option>
              <option value="loan">Loan</option>
              <option value="statutory">Statutory</option>
              <option value="other_deduction">Other Deduction</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Default Amount (Optional)</label>
            <Input
              type="number"
              step="0.01"
              value={formData.default_amount || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, default_amount: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="e.g. 5000.00"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_taxable}
                onChange={(e) => setFormData({ ...formData, is_taxable: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Taxable (subject to PNG income tax)</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_fixed}
                onChange={(e) => setFormData({ ...formData, is_fixed: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Fixed Amount (not variable per employee)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Saving...' : (component ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
