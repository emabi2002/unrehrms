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
import { Plus, Edit2, Trash2, DollarSign, Users, Building2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SalaryStructure {
  id: string
  code: string
  name: string
  description: string | null
  position_id: string | null
  employment_type: string | null
  is_active: boolean
  created_at: string
  positions?: { title: string }
}

interface SalaryComponent {
  id: string
  code: string
  name: string
  type: 'earning' | 'deduction'
  component_category: string | null
}

interface StructureComponent {
  id: string
  component_id: string
  amount: number | null
  percentage: number | null
  salary_components?: SalaryComponent
}

interface Position {
  id: string
  code: string
  title: string
  grade_level: string | null
}

export default function SalaryStructuresPage() {
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null)
  const [viewingComponents, setViewingComponents] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)

    // Load structures with positions
    const { data: structuresData, error: structuresError } = await supabase
      .from('salary_structures')
      .select(`
        *,
        positions (
          title
        )
      `)
      .order('name')

    if (structuresError) {
      console.error('Error loading structures:', structuresError)
      toast.error('Failed to load salary structures')
    } else {
      setStructures(structuresData || [])
    }

    // Load positions
    const { data: positionsData, error: positionsError } = await supabase
      .from('positions')
      .select('*')
      .eq('is_active', true)
      .order('title')

    if (positionsError) {
      console.error('Error loading positions:', positionsError)
    } else {
      setPositions(positionsData || [])
    }

    setLoading(false)
  }

  function handleAdd() {
    setEditingStructure(null)
    setDialogOpen(true)
  }

  function handleEdit(structure: SalaryStructure) {
    setEditingStructure(structure)
    setDialogOpen(true)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    const { error } = await supabase
      .from('salary_structures')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting structure:', error)
      toast.error('Failed to delete structure')
    } else {
      toast.success('Structure deleted successfully')
      loadData()
    }
  }

  async function handleToggleActive(structure: SalaryStructure) {
    const { error } = await supabase
      .from('salary_structures')
      .update({ is_active: !structure.is_active })
      .eq('id', structure.id)

    if (error) {
      console.error('Error toggling structure:', error)
      toast.error('Failed to update structure')
    } else {
      toast.success(`Structure ${structure.is_active ? 'deactivated' : 'activated'}`)
      loadData()
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading salary structures...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Structures</h1>
          <p className="text-gray-600 mt-2">
            Position-based salary templates with components
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Structure
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Structures</p>
              <p className="text-2xl font-bold mt-1">{structures.length}</p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Structures</p>
              <p className="text-2xl font-bold mt-1">
                {structures.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Positions</p>
              <p className="text-2xl font-bold mt-1">{positions.length}</p>
            </div>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Structures List */}
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
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employment Type
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
              {structures.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No salary structures found. Click "Create Structure" to add one.
                  </td>
                </tr>
              ) : (
                structures.map((structure) => (
                  <tr key={structure.id} className={!structure.is_active ? 'opacity-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                      {structure.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {structure.name}
                        </div>
                        {structure.description && (
                          <div className="text-sm text-gray-500">
                            {structure.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {structure.positions?.title || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {structure.employment_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleToggleActive(structure)}>
                        <Badge
                          className={
                            structure.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }
                        >
                          {structure.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setViewingComponents(structure.id)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Components
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(structure)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(structure.id, structure.name)}
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
      <StructureFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        structure={editingStructure}
        positions={positions}
        onSuccess={() => {
          loadData()
          setDialogOpen(false)
        }}
      />

      {/* View Components Dialog */}
      {viewingComponents && (
        <ComponentsDialog
          structureId={viewingComponents}
          onClose={() => setViewingComponents(null)}
        />
      )}
    </div>
  )
}

// Structure Form Dialog Component
function StructureFormDialog({
  open,
  onOpenChange,
  structure,
  positions,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  structure: SalaryStructure | null
  positions: Position[]
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    position_id: '',
    employment_type: '',
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (structure) {
      setFormData({
        code: structure.code,
        name: structure.name,
        description: structure.description || '',
        position_id: structure.position_id || '',
        employment_type: structure.employment_type || '',
      })
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        position_id: '',
        employment_type: '',
      })
    }
  }, [structure, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      ...formData,
      position_id: formData.position_id || null,
      employment_type: formData.employment_type || null,
      is_active: true,
    }

    let error

    if (structure) {
      const result = await supabase
        .from('salary_structures')
        .update(data)
        .eq('id', structure.id)
      error = result.error
    } else {
      const result = await supabase
        .from('salary_structures')
        .insert([data])
      error = result.error
    }

    setSaving(false)

    if (error) {
      console.error('Error saving structure:', error)
      toast.error('Failed to save structure')
    } else {
      toast.success(`Structure ${structure ? 'updated' : 'created'} successfully`)
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {structure ? 'Edit Structure' : 'Create New Structure'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Code *</label>
            <Input
              value={formData.code}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. STR-LECTURER"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Name *</label>
            <Input
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="e.g. Lecturer Salary Structure"
              required
            />
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

          <div>
            <label className="text-sm font-medium block mb-2">Position (Optional)</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.position_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, position_id: e.target.value })
              }
            >
              <option value="">-- Select Position --</option>
              {positions.map((pos) => (
                <option key={pos.id} value={pos.id}>
                  {pos.title} {pos.grade_level ? `(${pos.grade_level})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Employment Type</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.employment_type}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, employment_type: e.target.value })
              }
            >
              <option value="">-- Select Type --</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="casual">Casual</option>
              <option value="part_time">Part-time</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Saving...' : (structure ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Components Dialog
function ComponentsDialog({
  structureId,
  onClose,
}: {
  structureId: string
  onClose: () => void
}) {
  const [components, setComponents] = useState<StructureComponent[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadComponents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structureId])

  async function loadComponents() {
    const { data, error } = await supabase
      .from('salary_structure_components')
      .select(`
        *,
        salary_components (
          code,
          name,
          type,
          component_category
        )
      `)
      .eq('salary_structure_id', structureId)
      .eq('is_active', true)

    if (error) {
      console.error('Error loading components:', error)
    } else {
      setComponents(data || [])
    }
    setLoading(false)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Salary Components</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="text-center py-8">Loading components...</div>
        ) : components.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No components assigned to this structure yet.
            <p className="text-sm mt-2">Add components to define the salary breakdown.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {components.map((comp) => (
              <div key={comp.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{comp.salary_components?.name}</p>
                  <p className="text-sm text-gray-600">
                    {comp.salary_components?.code} - {comp.salary_components?.component_category}
                  </p>
                </div>
                <div className="text-right">
                  {comp.amount && (
                    <p className="font-semibold">K{comp.amount.toLocaleString()}</p>
                  )}
                  {comp.percentage && (
                    <p className="text-sm text-gray-600">{comp.percentage}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
