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
import { Plus, Pencil, Trash2, UserMinus, Calendar, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Resignation {
  id: string;
  employee_id: string;
  resignation_date: string;
  last_working_date: string;
  notice_period_days: number;
  resignation_reason: string;
  reason_details?: string;
  status: string;
  approved_by?: string;
  approval_date?: string;
  exit_interview_completed: boolean;
  clearance_completed: boolean;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
    department: {
      name: string;
    };
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function ResignationsPage() {
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResignation, setEditingResignation] = useState<Resignation | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    resignation_date: new Date().toISOString().split('T')[0],
    last_working_date: '',
    notice_period_days: '30',
    resignation_reason: 'better_opportunity',
    reason_details: '',
    status: 'pending',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadResignations(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadResignations() {
    const { data, error } = await supabase
      .from('resignations')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number, department:departments(name))
      `)
      .order('resignation_date', { ascending: false });

    if (error) throw error;
    setResignations(data || []);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .eq('employment_status', 'Active')
      .order('first_name');

    if (error) throw error;
    setEmployees(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const resignationData = {
        employee_id: formData.employee_id,
        resignation_date: formData.resignation_date,
        last_working_date: formData.last_working_date,
        notice_period_days: parseInt(formData.notice_period_days),
        resignation_reason: formData.resignation_reason,
        reason_details: formData.reason_details || null,
        status: formData.status,
        exit_interview_completed: false,
        clearance_completed: false,
      };

      if (editingResignation) {
        const { error } = await supabase
          .from('resignations')
          .update(resignationData)
          .eq('id', editingResignation.id);

        if (error) throw error;
        toast.success('Resignation updated successfully');
      } else {
        const { error } = await supabase
          .from('resignations')
          .insert([resignationData]);

        if (error) throw error;
        toast.success('Resignation submitted successfully');
      }

      setDialogOpen(false);
      loadResignations();
      resetForm();
    } catch (error: any) {
      console.error('Error saving resignation:', error);
      toast.error(error.message || 'Failed to save resignation');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this resignation?')) return;

    try {
      const { error } = await supabase
        .from('resignations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Resignation deleted successfully');
      loadResignations();
    } catch (error: any) {
      console.error('Error deleting resignation:', error);
      toast.error('Failed to delete resignation');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingResignation(null);
    setDialogOpen(true);
  }

  function handleEdit(resignation: Resignation) {
    setEditingResignation(resignation);
    setFormData({
      employee_id: resignation.employee_id,
      resignation_date: resignation.resignation_date,
      last_working_date: resignation.last_working_date,
      notice_period_days: resignation.notice_period_days.toString(),
      resignation_reason: resignation.resignation_reason,
      reason_details: resignation.reason_details || '',
      status: resignation.status,
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      resignation_date: new Date().toISOString().split('T')[0],
      last_working_date: '',
      notice_period_days: '30',
      resignation_reason: 'better_opportunity',
      reason_details: '',
      status: 'pending',
    });
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resignations</h1>
          <p className="text-gray-600 mt-1">Manage employee resignation requests and offboarding</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Resignation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Resignations</CardTitle>
            <UserMinus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resignations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resignations.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resignations.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resignations.filter(r => {
                const date = new Date(r.resignation_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resignations Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : resignations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserMinus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No resignations found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Resignation
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resignation Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Working Day</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notice Period</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resignations.map((resignation) => (
                  <tr key={resignation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {resignation.employee?.first_name} {resignation.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {resignation.employee?.employee_number} • {resignation.employee?.department?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(resignation.resignation_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(resignation.last_working_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {resignation.notice_period_days} days
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {resignation.resignation_reason.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[resignation.status] || statusColors.pending}>
                        {resignation.status.charAt(0).toUpperCase() + resignation.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(resignation)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resignation.id)}
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
              {editingResignation ? 'Edit Resignation' : 'Submit Resignation'}
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
                <Label htmlFor="resignation_date">Resignation Date *</Label>
                <Input
                  id="resignation_date"
                  type="date"
                  required
                  value={formData.resignation_date}
                  onChange={(e) => setFormData({ ...formData, resignation_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="last_working_date">Last Working Date *</Label>
                <Input
                  id="last_working_date"
                  type="date"
                  required
                  value={formData.last_working_date}
                  onChange={(e) => setFormData({ ...formData, last_working_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notice_period_days">Notice Period (days) *</Label>
                <Input
                  id="notice_period_days"
                  type="number"
                  required
                  value={formData.notice_period_days}
                  onChange={(e) => setFormData({ ...formData, notice_period_days: e.target.value })}
                  placeholder="30"
                />
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="resignation_reason">Resignation Reason *</Label>
              <select
                id="resignation_reason"
                required
                value={formData.resignation_reason}
                onChange={(e) => setFormData({ ...formData, resignation_reason: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="better_opportunity">Better Opportunity</option>
                <option value="personal_reasons">Personal Reasons</option>
                <option value="relocation">Relocation</option>
                <option value="career_change">Career Change</option>
                <option value="retirement">Retirement</option>
                <option value="health_issues">Health Issues</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <Label htmlFor="reason_details">Detailed Reason</Label>
              <textarea
                id="reason_details"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.reason_details}
                onChange={(e) => setFormData({ ...formData, reason_details: e.target.value })}
                placeholder="Please provide additional details about your resignation..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingResignation ? 'Update' : 'Submit'} Resignation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
