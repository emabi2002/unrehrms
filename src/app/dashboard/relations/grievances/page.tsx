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
import { Plus, Pencil, Trash2, AlertTriangle, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Grievance {
  id: string;
  employee_id: string;
  grievance_date: string;
  grievance_type: string;
  description: string;
  severity: string;
  status: string;
  filed_against?: string;
  investigation_notes?: string;
  resolution?: string;
  resolution_date?: string;
  resolved_by?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
    department: {
      name: string;
    };
  };
  resolver?: {
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

export default function GrievancesPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrievance, setEditingGrievance] = useState<Grievance | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    grievance_date: new Date().toISOString().split('T')[0],
    grievance_type: 'workplace_conflict',
    description: '',
    severity: 'medium',
    status: 'open',
    filed_against: '',
    investigation_notes: '',
    resolution: '',
    resolution_date: '',
    resolved_by: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadGrievances(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadGrievances() {
    const { data, error } = await supabase
      .from('grievances')
      .select(`
        *,
        employee:employees!grievances_employee_id_fkey(first_name, last_name, employee_number, department:departments(name)),
        resolver:employees!grievances_resolved_by_fkey(first_name, last_name)
      `)
      .order('grievance_date', { ascending: false });

    if (error) throw error;
    setGrievances(data || []);
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
      const grievanceData = {
        employee_id: formData.employee_id,
        grievance_date: formData.grievance_date,
        grievance_type: formData.grievance_type,
        description: formData.description,
        severity: formData.severity,
        status: formData.status,
        filed_against: formData.filed_against || null,
        investigation_notes: formData.investigation_notes || null,
        resolution: formData.resolution || null,
        resolution_date: formData.resolution_date || null,
        resolved_by: formData.resolved_by || null,
      };

      if (editingGrievance) {
        const { error } = await supabase
          .from('grievances')
          .update(grievanceData)
          .eq('id', editingGrievance.id);

        if (error) throw error;
        toast.success('Grievance updated successfully');
      } else {
        const { error } = await supabase
          .from('grievances')
          .insert([grievanceData]);

        if (error) throw error;
        toast.success('Grievance filed successfully');
      }

      setDialogOpen(false);
      loadGrievances();
      resetForm();
    } catch (error: any) {
      console.error('Error saving grievance:', error);
      toast.error(error.message || 'Failed to save grievance');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this grievance?')) return;

    try {
      const { error } = await supabase
        .from('grievances')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Grievance deleted successfully');
      loadGrievances();
    } catch (error: any) {
      console.error('Error deleting grievance:', error);
      toast.error('Failed to delete grievance');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingGrievance(null);
    setDialogOpen(true);
  }

  function handleEdit(grievance: Grievance) {
    setEditingGrievance(grievance);
    setFormData({
      employee_id: grievance.employee_id,
      grievance_date: grievance.grievance_date,
      grievance_type: grievance.grievance_type,
      description: grievance.description,
      severity: grievance.severity,
      status: grievance.status,
      filed_against: grievance.filed_against || '',
      investigation_notes: grievance.investigation_notes || '',
      resolution: grievance.resolution || '',
      resolution_date: grievance.resolution_date || '',
      resolved_by: grievance.resolved_by || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      grievance_date: new Date().toISOString().split('T')[0],
      grievance_type: 'workplace_conflict',
      description: '',
      severity: 'medium',
      status: 'open',
      filed_against: '',
      investigation_notes: '',
      resolution: '',
      resolution_date: '',
      resolved_by: '',
    });
  }

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const severityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grievances</h1>
          <p className="text-gray-600 mt-1">Manage and track employee grievances and complaints</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          File Grievance
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Grievances</CardTitle>
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grievances.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter(g => g.status === 'open').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter(g => g.status === 'investigating').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grievances.filter(g => g.severity === 'critical').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grievances Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : grievances.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No grievances found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              File First Grievance
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grievances.map((grievance) => (
            <Card key={grievance.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {grievance.employee?.first_name} {grievance.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {grievance.employee?.department?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {grievance.grievance_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <Badge className={severityColors[grievance.severity]}>
                      {grievance.severity.charAt(0).toUpperCase() + grievance.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[grievance.status]}>
                      {grievance.status.charAt(0).toUpperCase() + grievance.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(grievance.grievance_date).toLocaleDateString()}
                    </span>
                  </div>
                  {grievance.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 line-clamp-3">{grievance.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(grievance)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(grievance.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGrievance ? 'Edit Grievance' : 'File Grievance'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="grievance_date">Date *</Label>
                <Input
                  id="grievance_date"
                  type="date"
                  required
                  value={formData.grievance_date}
                  onChange={(e) => setFormData({ ...formData, grievance_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="grievance_type">Type *</Label>
                <select
                  id="grievance_type"
                  required
                  value={formData.grievance_type}
                  onChange={(e) => setFormData({ ...formData, grievance_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="workplace_conflict">Workplace Conflict</option>
                  <option value="harassment">Harassment</option>
                  <option value="discrimination">Discrimination</option>
                  <option value="safety_concern">Safety Concern</option>
                  <option value="policy_violation">Policy Violation</option>
                  <option value="compensation">Compensation</option>
                  <option value="working_conditions">Working Conditions</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="severity">Severity *</Label>
                <select
                  id="severity"
                  required
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
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
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="filed_against">Filed Against (Optional)</Label>
              <Input
                id="filed_against"
                value={formData.filed_against}
                onChange={(e) => setFormData({ ...formData, filed_against: e.target.value })}
                placeholder="Person or department involved"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the grievance..."
              />
            </div>
            <div>
              <Label htmlFor="investigation_notes">Investigation Notes</Label>
              <textarea
                id="investigation_notes"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.investigation_notes}
                onChange={(e) => setFormData({ ...formData, investigation_notes: e.target.value })}
                placeholder="Investigation findings and notes..."
              />
            </div>
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <textarea
                id="resolution"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="How was the grievance resolved..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="resolution_date">Resolution Date</Label>
                <Input
                  id="resolution_date"
                  type="date"
                  value={formData.resolution_date}
                  onChange={(e) => setFormData({ ...formData, resolution_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="resolved_by">Resolved By</Label>
                <select
                  id="resolved_by"
                  value={formData.resolved_by}
                  onChange={(e) => setFormData({ ...formData, resolved_by: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingGrievance ? 'Update' : 'File'} Grievance
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
