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
import { Plus, Pencil, Trash2, AlertCircle, FileWarning, Clock, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface EmployeeRelationIncident {
  id: string;
  employee_id: string;
  incident_date: string;
  incident_type: string;
  description: string;
  severity: string;
  involved_parties?: string;
  witnesses?: string;
  reported_by: string;
  investigated_by?: string;
  investigation_status: string;
  resolution?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
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
  reporter?: {
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

export default function WorkplaceIncidentsPage() {
  const [incidents, setIncidents] = useState<EmployeeRelationIncident[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<EmployeeRelationIncident | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    incident_date: new Date().toISOString().split('T')[0],
    incident_type: 'conflict',
    description: '',
    severity: 'medium',
    involved_parties: '',
    witnesses: '',
    reported_by: '',
    investigated_by: '',
    investigation_status: 'pending',
    resolution: '',
    follow_up_required: false,
    follow_up_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadIncidents(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadIncidents() {
    const { data, error } = await supabase
      .from('employee_relation_incidents')
      .select(`
        *,
        employee:employees!employee_relation_incidents_employee_id_fkey(first_name, last_name, employee_number, department:departments(name)),
        reporter:employees!employee_relation_incidents_reported_by_fkey(first_name, last_name)
      `)
      .order('incident_date', { ascending: false });

    if (error) throw error;
    setIncidents(data || []);
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
      const incidentData = {
        employee_id: formData.employee_id,
        incident_date: formData.incident_date,
        incident_type: formData.incident_type,
        description: formData.description,
        severity: formData.severity,
        involved_parties: formData.involved_parties || null,
        witnesses: formData.witnesses || null,
        reported_by: formData.reported_by,
        investigated_by: formData.investigated_by || null,
        investigation_status: formData.investigation_status,
        resolution: formData.resolution || null,
        follow_up_required: formData.follow_up_required,
        follow_up_date: formData.follow_up_date || null,
        notes: formData.notes || null,
      };

      if (editingIncident) {
        const { error } = await supabase
          .from('employee_relation_incidents')
          .update(incidentData)
          .eq('id', editingIncident.id);

        if (error) throw error;
        toast.success('Incident updated successfully');
      } else {
        const { error } = await supabase
          .from('employee_relation_incidents')
          .insert([incidentData]);

        if (error) throw error;
        toast.success('Incident recorded successfully');
      }

      setDialogOpen(false);
      loadIncidents();
      resetForm();
    } catch (error: any) {
      console.error('Error saving incident:', error);
      toast.error(error.message || 'Failed to save incident');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this incident?')) return;

    try {
      const { error } = await supabase
        .from('employee_relation_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Incident deleted successfully');
      loadIncidents();
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      toast.error('Failed to delete incident');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingIncident(null);
    setDialogOpen(true);
  }

  function handleEdit(incident: EmployeeRelationIncident) {
    setEditingIncident(incident);
    setFormData({
      employee_id: incident.employee_id,
      incident_date: incident.incident_date,
      incident_type: incident.incident_type,
      description: incident.description,
      severity: incident.severity,
      involved_parties: incident.involved_parties || '',
      witnesses: incident.witnesses || '',
      reported_by: incident.reported_by,
      investigated_by: incident.investigated_by || '',
      investigation_status: incident.investigation_status,
      resolution: incident.resolution || '',
      follow_up_required: incident.follow_up_required,
      follow_up_date: incident.follow_up_date || '',
      notes: incident.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      incident_date: new Date().toISOString().split('T')[0],
      incident_type: 'conflict',
      description: '',
      severity: 'medium',
      involved_parties: '',
      witnesses: '',
      reported_by: '',
      investigated_by: '',
      investigation_status: 'pending',
      resolution: '',
      follow_up_required: false,
      follow_up_date: '',
      notes: '',
    });
  }

  const severityColors: Record<string, string> = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workplace Incidents</h1>
          <p className="text-gray-600 mt-1">Track and manage employee relation incidents</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Report Incident
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.investigation_status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Investigating</CardTitle>
            <FileWarning className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.investigation_status === 'investigating').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.severity === 'critical' || i.severity === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incidents Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : incidents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No workplace incidents found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Report First Incident
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {incidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {incident.employee?.first_name} {incident.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {incident.employee?.department?.name}
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
                      {incident.incident_type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <Badge className={severityColors[incident.severity]}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[incident.investigation_status]}>
                      {incident.investigation_status.charAt(0).toUpperCase() + incident.investigation_status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(incident.incident_date).toLocaleDateString()}
                    </span>
                  </div>
                  {incident.reporter && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reported By:</span>
                      <span className="text-sm font-medium">
                        {incident.reporter.first_name} {incident.reporter.last_name}
                      </span>
                    </div>
                  )}
                  {incident.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 line-clamp-2">{incident.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(incident)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(incident.id)}
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
              {editingIncident ? 'Edit Incident' : 'Report Incident'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id">Employee Involved *</Label>
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
                <Label htmlFor="incident_date">Incident Date *</Label>
                <Input
                  id="incident_date"
                  type="date"
                  required
                  value={formData.incident_date}
                  onChange={(e) => setFormData({ ...formData, incident_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="incident_type">Incident Type *</Label>
                <select
                  id="incident_type"
                  required
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="conflict">Conflict</option>
                  <option value="harassment">Harassment</option>
                  <option value="bullying">Bullying</option>
                  <option value="discrimination">Discrimination</option>
                  <option value="violence">Violence</option>
                  <option value="misconduct">Misconduct</option>
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
                <Label htmlFor="investigation_status">Status *</Label>
                <select
                  id="investigation_status"
                  required
                  value={formData.investigation_status}
                  onChange={(e) => setFormData({ ...formData, investigation_status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
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
                placeholder="Detailed description of the incident..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="involved_parties">Involved Parties</Label>
                <Input
                  id="involved_parties"
                  value={formData.involved_parties}
                  onChange={(e) => setFormData({ ...formData, involved_parties: e.target.value })}
                  placeholder="Other parties involved"
                />
              </div>
              <div>
                <Label htmlFor="witnesses">Witnesses</Label>
                <Input
                  id="witnesses"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Witness names"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reported_by">Reported By *</Label>
                <select
                  id="reported_by"
                  required
                  value={formData.reported_by}
                  onChange={(e) => setFormData({ ...formData, reported_by: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Reporter</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="investigated_by">Investigated By</Label>
                <select
                  id="investigated_by"
                  value={formData.investigated_by}
                  onChange={(e) => setFormData({ ...formData, investigated_by: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Investigator</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="resolution">Resolution</Label>
              <textarea
                id="resolution"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="How was the incident resolved..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  className="w-4 h-4 text-[#008751] border-gray-300 rounded"
                />
                <Label htmlFor="follow_up_required" className="cursor-pointer">Follow-up Required</Label>
              </div>
              <div>
                <Label htmlFor="follow_up_date">Follow-up Date</Label>
                <Input
                  id="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData({ ...formData, follow_up_date: e.target.value })}
                  disabled={!formData.follow_up_required}
                />
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
                {editingIncident ? 'Update' : 'Report'} Incident
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
