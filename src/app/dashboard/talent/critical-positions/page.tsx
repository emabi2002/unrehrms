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
import { Plus, Pencil, Trash2, AlertCircle, Shield, Target, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CriticalPosition {
  id: string;
  position_title: string;
  department_id: string;
  business_impact: string;
  difficulty_to_fill: string;
  risk_level: string;
  current_holder_id?: string;
  succession_candidates?: string;
  mitigation_strategies?: string;
  last_reviewed: string;
  notes?: string;
  created_at?: string;
  department?: {
    name: string;
  };
  current_holder?: {
    first_name: string;
    last_name: string;
  };
}

interface Department {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  job_title: string;
}

export default function CriticalPositionsPage() {
  const [positions, setPositions] = useState<CriticalPosition[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<CriticalPosition | null>(null);
  const [formData, setFormData] = useState({
    position_title: '',
    department_id: '',
    business_impact: 'high',
    difficulty_to_fill: 'high',
    risk_level: 'high',
    current_holder_id: '',
    succession_candidates: '',
    mitigation_strategies: '',
    last_reviewed: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadPositions(),
        loadDepartments(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadPositions() {
    const { data, error } = await supabase
      .from('critical_positions')
      .select(`
        *,
        department:departments(name),
        current_holder:employees(first_name, last_name)
      `)
      .order('risk_level', { ascending: false });

    if (error) throw error;
    setPositions(data || []);
  }

  async function loadDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    if (error) throw error;
    setDepartments(data || []);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number, job_title')
      .eq('employment_status', 'Active')
      .order('first_name');

    if (error) throw error;
    setEmployees(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const positionData = {
        position_title: formData.position_title,
        department_id: formData.department_id,
        business_impact: formData.business_impact,
        difficulty_to_fill: formData.difficulty_to_fill,
        risk_level: formData.risk_level,
        current_holder_id: formData.current_holder_id || null,
        succession_candidates: formData.succession_candidates || null,
        mitigation_strategies: formData.mitigation_strategies || null,
        last_reviewed: formData.last_reviewed,
        notes: formData.notes || null,
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('critical_positions')
          .update(positionData)
          .eq('id', editingPosition.id);

        if (error) throw error;
        toast.success('Critical position updated successfully');
      } else {
        const { error } = await supabase
          .from('critical_positions')
          .insert([positionData]);

        if (error) throw error;
        toast.success('Critical position created successfully');
      }

      setDialogOpen(false);
      loadPositions();
      resetForm();
    } catch (error: any) {
      console.error('Error saving position:', error);
      toast.error(error.message || 'Failed to save critical position');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this critical position?')) return;

    try {
      const { error } = await supabase
        .from('critical_positions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Critical position deleted successfully');
      loadPositions();
    } catch (error: any) {
      console.error('Error deleting position:', error);
      toast.error('Failed to delete critical position');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingPosition(null);
    setDialogOpen(true);
  }

  function handleEdit(position: CriticalPosition) {
    setEditingPosition(position);
    setFormData({
      position_title: position.position_title,
      department_id: position.department_id,
      business_impact: position.business_impact,
      difficulty_to_fill: position.difficulty_to_fill,
      risk_level: position.risk_level,
      current_holder_id: position.current_holder_id || '',
      succession_candidates: position.succession_candidates || '',
      mitigation_strategies: position.mitigation_strategies || '',
      last_reviewed: position.last_reviewed,
      notes: position.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      position_title: '',
      department_id: '',
      business_impact: 'high',
      difficulty_to_fill: 'high',
      risk_level: 'high',
      current_holder_id: '',
      succession_candidates: '',
      mitigation_strategies: '',
      last_reviewed: new Date().toISOString().split('T')[0],
      notes: '',
    });
  }

  const riskColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const impactColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Critical Positions</h1>
          <p className="text-gray-600 mt-1">Identify and manage business-critical positions</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Position
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Positions</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.filter(p => p.risk_level === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Impact</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.filter(p => p.business_impact === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hard to Fill</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.filter(p => p.difficulty_to_fill === 'high').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : positions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No critical positions found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Position
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((position) => (
            <Card key={position.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{position.position_title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {position.department?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {position.current_holder && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="text-sm font-medium">
                        {position.current_holder.first_name} {position.current_holder.last_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Risk Level:</span>
                    <Badge className={riskColors[position.risk_level]}>
                      {position.risk_level.charAt(0).toUpperCase() + position.risk_level.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Business Impact:</span>
                    <Badge className={impactColors[position.business_impact]}>
                      {position.business_impact.charAt(0).toUpperCase() + position.business_impact.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Difficulty:</span>
                    <Badge variant="outline" className="capitalize">
                      {position.difficulty_to_fill}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Reviewed:</span>
                    <span className="text-sm font-medium">
                      {new Date(position.last_reviewed).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(position)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(position.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Edit Critical Position' : 'Add Critical Position'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position_title">Position Title *</Label>
                <Input
                  id="position_title"
                  required
                  value={formData.position_title}
                  onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                  placeholder="e.g., Head of Engineering"
                />
              </div>
              <div>
                <Label htmlFor="department_id">Department *</Label>
                <select
                  id="department_id"
                  required
                  value={formData.department_id}
                  onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="current_holder_id">Current Position Holder</Label>
              <select
                id="current_holder_id"
                value={formData.current_holder_id}
                onChange={(e) => setFormData({ ...formData, current_holder_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} - {emp.job_title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="business_impact">Business Impact *</Label>
                <select
                  id="business_impact"
                  required
                  value={formData.business_impact}
                  onChange={(e) => setFormData({ ...formData, business_impact: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label htmlFor="difficulty_to_fill">Difficulty to Fill *</Label>
                <select
                  id="difficulty_to_fill"
                  required
                  value={formData.difficulty_to_fill}
                  onChange={(e) => setFormData({ ...formData, difficulty_to_fill: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label htmlFor="risk_level">Risk Level *</Label>
                <select
                  id="risk_level"
                  required
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="last_reviewed">Last Reviewed *</Label>
              <Input
                id="last_reviewed"
                type="date"
                required
                value={formData.last_reviewed}
                onChange={(e) => setFormData({ ...formData, last_reviewed: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="succession_candidates">Succession Candidates</Label>
              <textarea
                id="succession_candidates"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.succession_candidates}
                onChange={(e) => setFormData({ ...formData, succession_candidates: e.target.value })}
                placeholder="List potential succession candidates..."
              />
            </div>
            <div>
              <Label htmlFor="mitigation_strategies">Mitigation Strategies</Label>
              <textarea
                id="mitigation_strategies"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.mitigation_strategies}
                onChange={(e) => setFormData({ ...formData, mitigation_strategies: e.target.value })}
                placeholder="Describe risk mitigation strategies..."
              />
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
                {editingPosition ? 'Update' : 'Create'} Position
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
