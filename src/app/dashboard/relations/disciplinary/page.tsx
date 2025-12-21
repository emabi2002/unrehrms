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
import { Plus, Pencil, Trash2, Shield, AlertOctagon, FileText, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface DisciplinaryAction {
  id: string;
  employee_id: string;
  action_date: string;
  violation_type: string;
  description: string;
  severity: string;
  action_taken: string;
  issued_by: string;
  witness?: string;
  follow_up_date?: string;
  appeal_filed: boolean;
  appeal_outcome?: string;
  status: string;
  notes?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
    department: {
      name: string;
    };
  };
  issuer?: {
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

export default function DisciplinaryActionsPage() {
  const [actions, setActions] = useState<DisciplinaryAction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<DisciplinaryAction | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    action_date: new Date().toISOString().split('T')[0],
    violation_type: 'misconduct',
    description: '',
    severity: 'moderate',
    action_taken: 'verbal_warning',
    issued_by: '',
    witness: '',
    follow_up_date: '',
    appeal_filed: false,
    appeal_outcome: '',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadActions(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadActions() {
    const { data, error } = await supabase
      .from('disciplinary_actions')
      .select(`
        *,
        employee:employees!disciplinary_actions_employee_id_fkey(first_name, last_name, employee_number, department:departments(name)),
        issuer:employees!disciplinary_actions_issued_by_fkey(first_name, last_name)
      `)
      .order('action_date', { ascending: false });

    if (error) throw error;
    setActions(data || []);
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
      const actionData = {
        employee_id: formData.employee_id,
        action_date: formData.action_date,
        violation_type: formData.violation_type,
        description: formData.description,
        severity: formData.severity,
        action_taken: formData.action_taken,
        issued_by: formData.issued_by,
        witness: formData.witness || null,
        follow_up_date: formData.follow_up_date || null,
        appeal_filed: formData.appeal_filed,
        appeal_outcome: formData.appeal_outcome || null,
        status: formData.status,
        notes: formData.notes || null,
      };

      if (editingAction) {
        const { error } = await supabase
          .from('disciplinary_actions')
          .update(actionData)
          .eq('id', editingAction.id);

        if (error) throw error;
        toast.success('Disciplinary action updated successfully');
      } else {
        const { error } = await supabase
          .from('disciplinary_actions')
          .insert([actionData]);

        if (error) throw error;
        toast.success('Disciplinary action recorded successfully');
      }

      setDialogOpen(false);
      loadActions();
      resetForm();
    } catch (error: any) {
      console.error('Error saving action:', error);
      toast.error(error.message || 'Failed to save disciplinary action');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this disciplinary action?')) return;

    try {
      const { error } = await supabase
        .from('disciplinary_actions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Disciplinary action deleted successfully');
      loadActions();
    } catch (error: any) {
      console.error('Error deleting action:', error);
      toast.error('Failed to delete disciplinary action');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingAction(null);
    setDialogOpen(true);
  }

  function handleEdit(action: DisciplinaryAction) {
    setEditingAction(action);
    setFormData({
      employee_id: action.employee_id,
      action_date: action.action_date,
      violation_type: action.violation_type,
      description: action.description,
      severity: action.severity,
      action_taken: action.action_taken,
      issued_by: action.issued_by,
      witness: action.witness || '',
      follow_up_date: action.follow_up_date || '',
      appeal_filed: action.appeal_filed,
      appeal_outcome: action.appeal_outcome || '',
      status: action.status,
      notes: action.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      action_date: new Date().toISOString().split('T')[0],
      violation_type: 'misconduct',
      description: '',
      severity: 'moderate',
      action_taken: 'verbal_warning',
      issued_by: '',
      witness: '',
      follow_up_date: '',
      appeal_filed: false,
      appeal_outcome: '',
      status: 'active',
      notes: '',
    });
  }

  const severityColors: Record<string, string> = {
    minor: 'bg-yellow-100 text-yellow-800',
    moderate: 'bg-orange-100 text-orange-800',
    severe: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    appealed: 'bg-purple-100 text-purple-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disciplinary Actions</h1>
          <p className="text-gray-600 mt-1">Manage and track employee disciplinary actions</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Actions</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{actions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <AlertOctagon className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions.filter(a => a.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical Severity</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions.filter(a => a.severity === 'critical' || a.severity === 'severe').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appeals Filed</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {actions.filter(a => a.appeal_filed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : actions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No disciplinary actions found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Action
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action) => (
            <Card key={action.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Shield className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {action.employee?.first_name} {action.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.employee?.department?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Violation:</span>
                    <Badge variant="outline" className="capitalize">
                      {action.violation_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <Badge className={severityColors[action.severity]}>
                      {action.severity.charAt(0).toUpperCase() + action.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Action:</span>
                    <Badge variant="outline" className="capitalize">
                      {action.action_taken.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[action.status]}>
                      {action.status.charAt(0).toUpperCase() + action.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(action.action_date).toLocaleDateString()}
                    </span>
                  </div>
                  {action.issuer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Issued By:</span>
                      <span className="text-sm font-medium">
                        {action.issuer.first_name} {action.issuer.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(action)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(action.id)}
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
              {editingAction ? 'Edit Disciplinary Action' : 'Add Disciplinary Action'}
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
                <Label htmlFor="action_date">Action Date *</Label>
                <Input
                  id="action_date"
                  type="date"
                  required
                  value={formData.action_date}
                  onChange={(e) => setFormData({ ...formData, action_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="violation_type">Violation Type *</Label>
                <select
                  id="violation_type"
                  required
                  value={formData.violation_type}
                  onChange={(e) => setFormData({ ...formData, violation_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="misconduct">Misconduct</option>
                  <option value="attendance">Attendance</option>
                  <option value="performance">Performance</option>
                  <option value="policy_violation">Policy Violation</option>
                  <option value="insubordination">Insubordination</option>
                  <option value="theft">Theft</option>
                  <option value="safety_violation">Safety Violation</option>
                  <option value="harassment">Harassment</option>
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
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="action_taken">Action Taken *</Label>
                <select
                  id="action_taken"
                  required
                  value={formData.action_taken}
                  onChange={(e) => setFormData({ ...formData, action_taken: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="verbal_warning">Verbal Warning</option>
                  <option value="written_warning">Written Warning</option>
                  <option value="final_warning">Final Warning</option>
                  <option value="suspension">Suspension</option>
                  <option value="demotion">Demotion</option>
                  <option value="termination">Termination</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issued_by">Issued By *</Label>
                <select
                  id="issued_by"
                  required
                  value={formData.issued_by}
                  onChange={(e) => setFormData({ ...formData, issued_by: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Issuer</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
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
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="appealed">Appealed</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the violation and circumstances..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="witness">Witness</Label>
                <Input
                  id="witness"
                  value={formData.witness}
                  onChange={(e) => setFormData({ ...formData, witness: e.target.value })}
                  placeholder="Witness name(s)"
                />
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="appeal_filed"
                  checked={formData.appeal_filed}
                  onChange={(e) => setFormData({ ...formData, appeal_filed: e.target.checked })}
                  className="w-4 h-4 text-[#008751] border-gray-300 rounded"
                />
                <Label htmlFor="appeal_filed" className="cursor-pointer">Appeal Filed</Label>
              </div>
              <div>
                <Label htmlFor="appeal_outcome">Appeal Outcome</Label>
                <select
                  id="appeal_outcome"
                  value={formData.appeal_outcome}
                  onChange={(e) => setFormData({ ...formData, appeal_outcome: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  disabled={!formData.appeal_filed}
                >
                  <option value="">Select Outcome</option>
                  <option value="upheld">Upheld</option>
                  <option value="overturned">Overturned</option>
                  <option value="modified">Modified</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingAction ? 'Update' : 'Record'} Action
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
