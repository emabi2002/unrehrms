'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Building2, Edit2, Trash2, Plus, Users } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SuperScheme {
  id: string
  scheme_code: string
  scheme_name: string
  provider_name: string
  employer_rate: number
  employee_rate: number | null
  is_statutory: boolean
  is_active: boolean
  description: string | null
  contact_email: string | null
  contact_phone: string | null
}

export default function SuperSchemesPage() {
  const [schemes, setSchemes] = useState<SuperScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<SuperScheme | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadSchemes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadSchemes() {
    setLoading(true)
    const { data, error } = await supabase
      .from('super_schemes')
      .select('*')
      .order('scheme_name')

    if (error) {
      console.error('Error loading schemes:', error)
      toast.error('Failed to load super schemes')
    } else {
      setSchemes(data || [])
    }
    setLoading(false)
  }

  function handleAdd() {
    setEditingScheme(null)
    setDialogOpen(true)
  }

  function handleEdit(scheme: SuperScheme) {
    setEditingScheme(scheme)
    setDialogOpen(true)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return

    const { error } = await supabase
      .from('super_schemes')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete scheme')
    } else {
      toast.success('Scheme deleted')
      loadSchemes()
    }
  }

  async function toggleActive(scheme: SuperScheme) {
    const { error } = await supabase
      .from('super_schemes')
      .update({ is_active: !scheme.is_active })
      .eq('id', scheme.id)

    if (error) {
      toast.error('Failed to update scheme')
    } else {
      toast.success(`Scheme ${scheme.is_active ? 'deactivated' : 'activated'}`)
      loadSchemes()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading super schemes...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Superannuation Schemes</h1>
          <p className="text-gray-600 mt-2">Manage PNG super fund schemes</p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Scheme
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Schemes</p>
              <p className="text-2xl font-bold mt-1">{schemes.length}</p>
            </div>
            <Building2 className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Schemes</p>
              <p className="text-2xl font-bold mt-1">
                {schemes.filter(s => s.is_active).length}
              </p>
            </div>
            <Users className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Statutory Schemes</p>
              <p className="text-2xl font-bold mt-1">
                {schemes.filter(s => s.is_statutory).length}
              </p>
            </div>
            <Building2 className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scheme Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {schemes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No super schemes found. Click "Add Scheme" to create one.
                  </td>
                </tr>
              ) : (
                schemes.map((scheme) => (
                  <tr key={scheme.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {scheme.scheme_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium">{scheme.scheme_name}</div>
                      {scheme.description && (
                        <div className="text-xs text-gray-500">{scheme.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {scheme.provider_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {scheme.employer_rate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {scheme.employee_rate ? `${scheme.employee_rate}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {scheme.is_statutory ? (
                        <Badge className="bg-purple-100 text-purple-800">Statutory</Badge>
                      ) : (
                        <Badge variant="outline">Voluntary</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => toggleActive(scheme)}>
                        <Badge className={scheme.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {scheme.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(scheme)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(scheme.id, scheme.scheme_name)}
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

      <SchemeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        scheme={editingScheme}
        onSuccess={() => {
          loadSchemes()
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

function SchemeFormDialog({
  open,
  onOpenChange,
  scheme,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheme: SuperScheme | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    scheme_code: '',
    scheme_name: '',
    provider_name: '',
    employer_rate: '8.4',
    employee_rate: '',
    is_statutory: true,
    description: '',
    contact_email: '',
    contact_phone: '',
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (scheme) {
      setFormData({
        scheme_code: scheme.scheme_code,
        scheme_name: scheme.scheme_name,
        provider_name: scheme.provider_name,
        employer_rate: scheme.employer_rate.toString(),
        employee_rate: scheme.employee_rate?.toString() || '',
        is_statutory: scheme.is_statutory,
        description: scheme.description || '',
        contact_email: scheme.contact_email || '',
        contact_phone: scheme.contact_phone || '',
      })
    } else {
      setFormData({
        scheme_code: '',
        scheme_name: '',
        provider_name: '',
        employer_rate: '8.4',
        employee_rate: '',
        is_statutory: true,
        description: '',
        contact_email: '',
        contact_phone: '',
      })
    }
  }, [scheme, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      ...formData,
      employer_rate: parseFloat(formData.employer_rate),
      employee_rate: formData.employee_rate ? parseFloat(formData.employee_rate) : null,
      is_active: true,
    }

    let error

    if (scheme) {
      const result = await supabase
        .from('super_schemes')
        .update(data)
        .eq('id', scheme.id)
      error = result.error
    } else {
      const result = await supabase
        .from('super_schemes')
        .insert([data])
      error = result.error
    }

    setSaving(false)

    if (error) {
      console.error('Error saving scheme:', error)
      toast.error('Failed to save scheme')
    } else {
      toast.success(`Scheme ${scheme ? 'updated' : 'created'} successfully`)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{scheme ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Scheme Code *</label>
              <Input
                value={formData.scheme_code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, scheme_code: e.target.value.toUpperCase() })
                }
                placeholder="e.g. NAMBAWAN"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Scheme Name *</label>
              <Input
                value={formData.scheme_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, scheme_name: e.target.value })
                }
                placeholder="e.g. Nambawan Super"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Provider Name *</label>
            <Input
              value={formData.provider_name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, provider_name: e.target.value })
              }
              placeholder="e.g. Nambawan Super Limited"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Employer Rate (%) *</label>
              <Input
                type="number"
                step="0.1"
                value={formData.employer_rate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, employer_rate: e.target.value })
                }
                placeholder="8.4"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Employee Rate (%)</label>
              <Input
                type="number"
                step="0.1"
                value={formData.employee_rate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, employee_rate: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_statutory}
                onChange={(e) => setFormData({ ...formData, is_statutory: e.target.checked })}
              />
              <span className="text-sm font-medium">Statutory Scheme (PNG Law Required)</span>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Description</label>
            <Input
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">Contact Email</label>
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-2">Contact Phone</label>
              <Input
                value={formData.contact_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData({ ...formData, contact_phone: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Saving...' : scheme ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
