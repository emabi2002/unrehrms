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
import { Plus, Pencil, Trash2, AlertTriangle, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SafetyIncident {
  id: string;
  incident_date: string;
  incident_type: string;
  location: string;
  description: string;
  severity: string;
  employee_id?: string;
  witnesses?: string;
  reported_by: string;
  immediate_action_taken?: string;
  root_cause?: string;
  corrective_actions?: string;
  investigation_status: string;
  days_lost: number;
  medical_treatment_required: boolean;
  status: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
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

export default function SafetyIncidentsPage() {
  const [incidents, setIncidents] = useState<SafetyIncident[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIncident, setEditingIncident] = useState<SafetyIncident | null>(null);
  const [formData, setFormData] = useState({
    incident_date: new Date().toISOString().split('T')[0],
    incident_type: 'near_miss',
    location: '',
    description: '',
    severity: 'minor',
    employee_id: '',
    witnesses: '',
    reported_by: '',
    immediate_action_taken: '',
    root_cause: '',
    corrective_actions: '',
    investigation_status: 'pending',
    days_lost: '0',
    medical_treatment_required: false,
    status: 'open',
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
      .from('safety_incidents')
      .select(`
        *,
        employee:employees!safety_incidents_employee_id_fkey(first_name, last_name, employee_number),
        reporter:employees!safety_incidents_reported_by_fkey(first_name, last_name)
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
        incident_date: formData.incident_date,
        incident_type: formData.incident_type,
        location: formData.location,
        description: formData.description,
        severity: formData.severity,
        employee_id: formData.employee_id || null,
        witnesses: formData.witnesses || null,
        reported_by: formData.reported_by,
        immediate_action_taken: formData.immediate_action_taken || null,
        root_cause: formData.root_cause || null,
        corrective_actions: formData.corrective_actions || null,
        investigation_status: formData.investigation_status,
        days_lost: parseInt(formData.days_lost),
        medical_treatment_required: formData.medical_treatment_required,
        status: formData.status,
      };

      if (editingIncident) {
        const { error } = await supabase
          .from('safety_incidents')
          .update(incidentData)
          .eq('id', editingIncident.id);

        if (error) throw error;
        toast.success('Safety incident updated successfully');
      } else {
        const { error } = await supabase
          .from('safety_incidents')
          .insert([incidentData]);

        if (error) throw error;
        toast.success('Safety incident recorded successfully');
      }

      setDialogOpen(false);
      loadIncidents();
      resetForm();
    } catch (error: any) {
      console.error('Error saving incident:', error);
      toast.error(error.message || 'Failed to save safety incident');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this safety incident?')) return;

    try {
      const { error } = await supabase
        .from('safety_incidents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Safety incident deleted successfully');
      loadIncidents();
    } catch (error: any) {
      console.error('Error deleting incident:', error);
      toast.error('Failed to delete safety incident');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingIncident(null);
    setDialogOpen(true);
  }

  function handleEdit(incident: SafetyIncident) {
    setEditingIncident(incident);
    setFormData({
      incident_date: incident.incident_date,
      incident_type: incident.incident_type,
      location: incident.location,
      description: incident.description,
      severity: incident.severity,
      employee_id: incident.employee_id || '',
      witnesses: incident.witnesses || '',
      reported_by: incident.reported_by,
      immediate_action_taken: incident.immediate_action_taken || '',
      root_cause: incident.root_cause || '',
      corrective_actions: incident.corrective_actions || '',
      investigation_status: incident.investigation_status,
      days_lost: incident.days_lost.toString(),
      medical_treatment_required: incident.medical_treatment_required,
      status: incident.status,
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      incident_date: new Date().toISOString().split('T')[0],
      incident_type: 'near_miss',
      location: '',
      description: '',
      severity: 'minor',
      employee_id: '',
      witnesses: '',
      reported_by: '',
      immediate_action_taken: '',
      root_cause: '',
      corrective_actions: '',
      investigation_status: 'pending',
      days_lost: '0',
      medical_treatment_required: false,
      status: 'open',
    });
  }

  const severityColors: Record<string, string> = {
    minor: 'bg-yellow-100 text-yellow-800',
    moderate: 'bg-orange-100 text-orange-800',
    major: 'bg-red-100 text-red-800',
    critical: 'bg-red-200 text-red-900',
  };

  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-800',
    investigating: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety Incidents</h1>
          <p className="text-gray-600 mt-1">Track and manage workplace safety incidents</p>
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
            <AlertTriangle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Critical/Major</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.severity === 'critical' || i.severity === 'major').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Days Lost</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.reduce((sum, i) => sum + i.days_lost, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Medical Treatment</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {incidents.filter(i => i.medical_treatment_required).length}
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
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No safety incidents found</p>
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
                      <AlertTriangle className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg capitalize">{incident.incident_type.replace('_', ' ')}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{incident.location}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {incident.employee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Employee:</span>
                      <span className="text-sm font-medium">
                        {incident.employee.first_name} {incident.employee.last_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Severity:</span>
                    <Badge className={severityColors[incident.severity]}>
                      {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[incident.status]}>
                      {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Investigation:</span>
                    <Badge variant="outline" className="capitalize">
                      {incident.investigation_status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(incident.incident_date).toLocaleDateString()}
                    </span>
                  </div>
                  {incident.days_lost > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Days Lost:</span>
                      <span className="text-sm font-medium text-red-600">{incident.days_lost}</span>
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
              {editingIncident ? 'Edit Safety Incident' : 'Report Safety Incident'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Warehouse Floor 2"
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
                  <option value="near_miss">Near Miss</option>
                  <option value="injury">Injury</option>
                  <option value="property_damage">Property Damage</option>
                  <option value="spill">Spill</option>
                  <option value="equipment_failure">Equipment Failure</option>
                  <option value="fire">Fire</option>
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
                  <option value="major">Major</option>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_id">Affected Employee</Label>
                <select
                  id="employee_id"
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
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of what happened..."
              />
            </div>
            <div>
              <Label htmlFor="immediate_action_taken">Immediate Action Taken</Label>
              <textarea
                id="immediate_action_taken"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.immediate_action_taken}
                onChange={(e) => setFormData({ ...formData, immediate_action_taken: e.target.value })}
                placeholder="What immediate actions were taken..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="investigation_status">Investigation Status *</Label>
                <select
                  id="investigation_status"
                  required
                  value={formData.investigation_status}
                  onChange={(e) => setFormData({ ...formData, investigation_status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="days_lost">Days Lost *</Label>
                <Input
                  id="days_lost"
                  type="number"
                  min="0"
                  required
                  value={formData.days_lost}
                  onChange={(e) => setFormData({ ...formData, days_lost: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="root_cause">Root Cause Analysis</Label>
              <textarea
                id="root_cause"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.root_cause}
                onChange={(e) => setFormData({ ...formData, root_cause: e.target.value })}
                placeholder="Identified root causes..."
              />
            </div>
            <div>
              <Label htmlFor="corrective_actions">Corrective Actions</Label>
              <textarea
                id="corrective_actions"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.corrective_actions}
                onChange={(e) => setFormData({ ...formData, corrective_actions: e.target.value })}
                placeholder="Preventive and corrective actions..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="witnesses">Witnesses</Label>
                <Input
                  id="witnesses"
                  value={formData.witnesses}
                  onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                  placeholder="Witness names"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="medical_treatment_required"
                  checked={formData.medical_treatment_required}
                  onChange={(e) => setFormData({ ...formData, medical_treatment_required: e.target.checked })}
                  className="w-4 h-4 text-[#008751] border-gray-300 rounded"
                />
                <Label htmlFor="medical_treatment_required" className="cursor-pointer">Medical Treatment Required</Label>
              </div>
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
