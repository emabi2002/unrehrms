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
import { Plus, Edit2, DollarSign, Users, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  department: string
  position: string
  status: string
}

interface SalaryStructure {
  id: string
  code: string
  name: string
}

interface EmployeeSalary {
  id: string
  employee_id: string
  salary_structure_id: string
  effective_from: string
  effective_to: string | null
  is_active: boolean
  employees?: Employee
  salary_structures?: SalaryStructure
}

export default function EmployeeSalariesPage() {
  const [employeeSalaries, setEmployeeSalaries] = useState<EmployeeSalary[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [structures, setStructures] = useState<SalaryStructure[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData() {
    setLoading(true)

    // Load employee salaries with related data
    const { data: salariesData, error: salariesError } = await supabase
      .from('employee_salary_details')
      .select(`
        *,
        employees (
          id,
          employee_id,
          first_name,
          last_name,
          email,
          department,
          position,
          status
        ),
        salary_structures (
          id,
          code,
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (salariesError) {
      console.error('Error loading salaries:', salariesError)
      toast.error('Failed to load employee salaries')
    } else {
      setEmployeeSalaries(salariesData || [])
    }

    // Load employees for dropdown
    const { data: employeesData } = await supabase
      .from('employees')
      .select('*')
      .eq('status', 'active')
      .order('last_name')

    setEmployees(employeesData || [])

    // Load structures for dropdown
    const { data: structuresData } = await supabase
      .from('salary_structures')
      .select('*')
      .eq('is_active', true)
      .order('name')

    setStructures(structuresData || [])

    setLoading(false)
  }

  const filteredSalaries = employeeSalaries.filter(s =>
    searchTerm === '' ||
    s.employees?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employees?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.employees?.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleAdd() {
    setEditingId(null)
    setDialogOpen(true)
  }

  function handleEdit(id: string) {
    setEditingId(id)
    setDialogOpen(true)
  }

  if (loading) {
    return <div className="text-center py-12">Loading employee salaries...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Salaries</h1>
          <p className="text-gray-600 mt-2">
            Assign and manage employee salary structures
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Assign Salary
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold mt-1">{employeeSalaries.length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Salaries</p>
              <p className="text-2xl font-bold mt-1">
                {employeeSalaries.filter(s => s.is_active).length}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Assignment</p>
              <p className="text-2xl font-bold mt-1">
                {employees.length - employeeSalaries.filter(s => s.is_active).length}
              </p>
            </div>
            <Users className="h-10 w-10 text-orange-600 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
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
      </Card>

      {/* Employee Salaries List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Salary Structure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Effective Date
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
              {filteredSalaries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No salary assignments found. Click "Assign Salary" to start.
                  </td>
                </tr>
              ) : (
                filteredSalaries.map((salary) => (
                  <tr key={salary.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {salary.employees?.first_name} {salary.employees?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {salary.employees?.employee_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {salary.employees?.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {salary.salary_structures?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {salary.salary_structures?.code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(salary.effective_from).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={
                          salary.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {salary.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(salary.id)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assignment Dialog */}
      <AssignmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employees}
        structures={structures}
        editingId={editingId}
        onSuccess={() => {
          loadData()
          setDialogOpen(false)
        }}
      />
    </div>
  )
}

// Assignment Dialog Component
function AssignmentDialog({
  open,
  onOpenChange,
  employees,
  structures,
  editingId,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  employees: Employee[]
  structures: SalaryStructure[]
  editingId: string | null
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    employee_id: '',
    salary_structure_id: '',
    effective_from: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const data = {
      ...formData,
      is_active: true,
    }

    const { error } = await supabase
      .from('employee_salary_details')
      .insert([data])

    setSaving(false)

    if (error) {
      console.error('Error assigning salary:', error)
      toast.error('Failed to assign salary')
    } else {
      toast.success('Salary assigned successfully')
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Salary Structure</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Employee *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.employee_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, employee_id: e.target.value })
              }
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Salary Structure *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={formData.salary_structure_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, salary_structure_id: e.target.value })
              }
              required
            >
              <option value="">-- Select Structure --</option>
              {structures.map((struct) => (
                <option key={struct.id} value={struct.id}>
                  {struct.name} ({struct.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Effective From *</label>
            <Input
              type="date"
              value={formData.effective_from}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, effective_from: e.target.value })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Assigning...' : 'Assign Salary'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
