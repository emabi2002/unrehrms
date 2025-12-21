'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, CheckSquare, Calendar, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Clearance {
  id: string;
  employee_id: string;
  resignation_id?: string;
  department: string;
  item: string;
  status: string;
  cleared_by?: string;
  cleared_date?: string;
  notes?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  clearer?: {
    first_name: string;
    last_name: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function ExitClearancesPage() {
  const [clearances, setClearances] = useState<Clearance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClearance, setEditingClearance] = useState<Clearance | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    department: 'IT',
    item: '',
    status: 'pending',
    cleared_by: '',
    cleared_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadClearances(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadClearances() {
    const { data, error } = await supabase
      .from('clearances')
      .select(`
        *,
        employee:employees!clearances_employee_id_fkey(first_name, last_name, employee_number),
        clearer:employees!clearances_cleared_by_fkey(first_name, last_name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setClearances(data || []);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .order('first_name');

    if (error) throw error;
    setEmployees(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const clearanceData = {
        employee_id: formData.employee_id,
        department: formData.department,
        item: formData.item,
        status: formData.status,
        cleared_by: formData.cleared_by || null,
        cleared_date: formData.cleared_date || null,
        notes: formData.notes || null,
      };

      if (editingClearance) {
        const { error } = await supabase
          .from('clearances')
          .update(clearanceData)
          .eq('id', editingClearance.id);

        if (error) throw error;
        toast.success('Clearance updated successfully');
      } else {
        const { error } = await supabase
          .from('clearances')
          .insert([clearanceData]);

        if (error) throw error;
        toast.success('Clearance created successfully');
      }

      setDialogOpen(false);
      loadClearances();
      resetForm();
    } catch (error: any) {
      console.error('Error saving clearance:', error);
      toast.error(error.message || 'Failed to save clearance');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this clearance?')) return;

    try {
      const { error } = await supabase
        .from('clearances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Clearance deleted successfully');
      loadClearances();
    } catch (error: any) {
      console.error('Error deleting clearance:', error);
      toast.error('Failed to delete clearance');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingClearance(null);
    setDialogOpen(true);
  }

  function handleEdit(clearance: Clearance) {
    setEditingClearance(clearance);
    setFormData({
      employee_id: clearance.employee_id,
      department: clearance.department,
      item: clearance.item,
      status: clearance.status,
      cleared_by: clearance.cleared_by || '',
      cleared_date: clearance.cleared_date || '',
      notes: clearance.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      department: 'IT',
      item: '',
      status: 'pending',
      cleared_by: '',
      cleared_date: '',
      notes: '',
    });
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    cleared: 'bg-green-100 text-green-800',
    not_applicable: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exit Clearances</h1>
          <p className="text-gray-600 mt-1">Track employee exit clearance checklist items</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Clearance Item
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clearances.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clearances.filter(c => c.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cleared</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clearances.filter(c => c.status === 'cleared').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clearances.length > 0
                ? ((clearances.filter(c => c.status === 'cleared').length / clearances.length) * 100).toFixed(0)
                : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clearances Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : clearances.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No clearance items found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Clearance Item
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cleared By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cleared Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clearances.map((clearance) => (
                  <tr key={clearance.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {clearance.employee?.first_name} {clearance.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{clearance.employee?.employee_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{clearance.department}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{clearance.item}</td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[clearance.status] || statusColors.pending}>
                        {clearance.status.replace('_', ' ').charAt(0).toUpperCase() + clearance.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {clearance.clearer
                        ? `${clearance.clearer.first_name} ${clearance.clearer.last_name}`
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {clearance.cleared_date
                        ? new Date(clearance.cleared_date).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(clearance)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(clearance.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClearance ? 'Edit Clearance Item' : 'Add Clearance Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <select
                id="employee_id"
                required
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.employee_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="IT">IT Department</option>
                  <option value="HR">HR Department</option>
                  <option value="Finance">Finance Department</option>
                  <option value="Library">Library</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Security">Security</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="cleared">Cleared</option>
                  <option value="not_applicable">Not Applicable</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="item">Clearance Item *</Label>
              <Input
                id="item"
                required
                value={formData.item}
                onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                placeholder="e.g., Return laptop, Return ID card, Handover documentation"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cleared_by">Cleared By</Label>
                <select
                  id="cleared_by"
                  value={formData.cleared_by}
                  onChange={(e) => setFormData({ ...formData, cleared_by: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Person</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="cleared_date">Cleared Date</Label>
                <Input
                  id="cleared_date"
                  type="date"
                  value={formData.cleared_date}
                  onChange={(e) => setFormData({ ...formData, cleared_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes or comments..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingClearance ? 'Update' : 'Create'} Clearance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
