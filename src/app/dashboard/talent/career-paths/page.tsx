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
import { Plus, Pencil, Trash2, TrendingUp, Award, Target, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CareerPath {
  id: string;
  employee_id: string;
  current_position: string;
  career_goal: string;
  target_position: string;
  timeline: string;
  development_plan?: string;
  required_skills?: string;
  training_completed?: string;
  progress_percentage: number;
  status: string;
  last_updated: string;
  notes?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
    job_title: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
  job_title: string;
}

export default function CareerPathsPage() {
  const [paths, setPaths] = useState<CareerPath[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<CareerPath | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    current_position: '',
    career_goal: '',
    target_position: '',
    timeline: '1_2_years',
    development_plan: '',
    required_skills: '',
    training_completed: '',
    progress_percentage: '0',
    status: 'active',
    last_updated: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadPaths(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadPaths() {
    const { data, error } = await supabase
      .from('career_paths')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number, job_title)
      `)
      .order('last_updated', { ascending: false });

    if (error) throw error;
    setPaths(data || []);
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
      const pathData = {
        employee_id: formData.employee_id,
        current_position: formData.current_position,
        career_goal: formData.career_goal,
        target_position: formData.target_position,
        timeline: formData.timeline,
        development_plan: formData.development_plan || null,
        required_skills: formData.required_skills || null,
        training_completed: formData.training_completed || null,
        progress_percentage: parseInt(formData.progress_percentage),
        status: formData.status,
        last_updated: formData.last_updated,
        notes: formData.notes || null,
      };

      if (editingPath) {
        const { error } = await supabase
          .from('career_paths')
          .update(pathData)
          .eq('id', editingPath.id);

        if (error) throw error;
        toast.success('Career path updated successfully');
      } else {
        const { error } = await supabase
          .from('career_paths')
          .insert([pathData]);

        if (error) throw error;
        toast.success('Career path created successfully');
      }

      setDialogOpen(false);
      loadPaths();
      resetForm();
    } catch (error: any) {
      console.error('Error saving path:', error);
      toast.error(error.message || 'Failed to save career path');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this career path?')) return;

    try {
      const { error } = await supabase
        .from('career_paths')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Career path deleted successfully');
      loadPaths();
    } catch (error: any) {
      console.error('Error deleting path:', error);
      toast.error('Failed to delete career path');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingPath(null);
    setDialogOpen(true);
  }

  function handleEdit(path: CareerPath) {
    setEditingPath(path);
    setFormData({
      employee_id: path.employee_id,
      current_position: path.current_position,
      career_goal: path.career_goal,
      target_position: path.target_position,
      timeline: path.timeline,
      development_plan: path.development_plan || '',
      required_skills: path.required_skills || '',
      training_completed: path.training_completed || '',
      progress_percentage: path.progress_percentage.toString(),
      status: path.status,
      last_updated: path.last_updated,
      notes: path.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      current_position: '',
      career_goal: '',
      target_position: '',
      timeline: '1_2_years',
      development_plan: '',
      required_skills: '',
      training_completed: '',
      progress_percentage: '0',
      status: 'active',
      last_updated: new Date().toISOString().split('T')[0],
      notes: '',
    });
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Career Paths</h1>
          <p className="text-gray-600 mt-1">Track and manage employee career development plans</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Career Path
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Paths</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paths.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Paths</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paths.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paths.filter(p => p.status === 'completed').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {paths.length > 0
                ? Math.round(paths.reduce((sum, p) => sum + p.progress_percentage, 0) / paths.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paths Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : paths.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No career paths found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Career Path
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <Card key={path.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {path.employee?.first_name} {path.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {path.employee?.job_title}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Target:</span>
                    <span className="text-sm font-medium">{path.target_position}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timeline:</span>
                    <Badge variant="outline" className="capitalize">
                      {path.timeline.replace('_', '-').replace('years', ' Years')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[path.status]}>
                      {path.status.replace('_', ' ').charAt(0).toUpperCase() + path.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{path.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(path.progress_percentage)}`}
                        style={{ width: `${path.progress_percentage}%` }}
                      />
                    </div>
                  </div>
                  {path.career_goal && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 line-clamp-2">{path.career_goal}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(path)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(path.id)}
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
              {editingPath ? 'Edit Career Path' : 'Add Career Path'}
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
                    {emp.first_name} {emp.last_name} - {emp.job_title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_position">Current Position *</Label>
                <Input
                  id="current_position"
                  required
                  value={formData.current_position}
                  onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                  placeholder="Current role"
                />
              </div>
              <div>
                <Label htmlFor="target_position">Target Position *</Label>
                <Input
                  id="target_position"
                  required
                  value={formData.target_position}
                  onChange={(e) => setFormData({ ...formData, target_position: e.target.value })}
                  placeholder="Desired role"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="career_goal">Career Goal *</Label>
              <textarea
                id="career_goal"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.career_goal}
                onChange={(e) => setFormData({ ...formData, career_goal: e.target.value })}
                placeholder="Describe career aspirations and goals..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="timeline">Timeline *</Label>
                <select
                  id="timeline"
                  required
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="1_2_years">1-2 Years</option>
                  <option value="3_5_years">3-5 Years</option>
                  <option value="5_plus_years">5+ Years</option>
                </select>
              </div>
              <div>
                <Label htmlFor="progress_percentage">Progress % *</Label>
                <Input
                  id="progress_percentage"
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.progress_percentage}
                  onChange={(e) => setFormData({ ...formData, progress_percentage: e.target.value })}
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
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="last_updated">Last Updated *</Label>
              <Input
                id="last_updated"
                type="date"
                required
                value={formData.last_updated}
                onChange={(e) => setFormData({ ...formData, last_updated: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="development_plan">Development Plan</Label>
              <textarea
                id="development_plan"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.development_plan}
                onChange={(e) => setFormData({ ...formData, development_plan: e.target.value })}
                placeholder="Outline development activities and milestones..."
              />
            </div>
            <div>
              <Label htmlFor="required_skills">Required Skills</Label>
              <textarea
                id="required_skills"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.required_skills}
                onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                placeholder="List skills needed for target position..."
              />
            </div>
            <div>
              <Label htmlFor="training_completed">Training Completed</Label>
              <textarea
                id="training_completed"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.training_completed}
                onChange={(e) => setFormData({ ...formData, training_completed: e.target.value })}
                placeholder="List completed training and certifications..."
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
                {editingPath ? 'Update' : 'Create'} Career Path
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
