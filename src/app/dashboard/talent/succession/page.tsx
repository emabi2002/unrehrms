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
import { Plus, Pencil, Trash2, Users, Target, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SuccessionPlan {
  id: string;
  position_title: string;
  department_id: string;
  current_incumbent_id?: string;
  criticality: string;
  succession_timeline: string;
  required_competencies?: string;
  development_actions?: string;
  status: string;
  review_date: string;
  notes?: string;
  created_at?: string;
  department?: {
    name: string;
  };
  current_incumbent?: {
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

export default function SuccessionPlanningPage() {
  const [plans, setPlans] = useState<SuccessionPlan[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SuccessionPlan | null>(null);
  const [formData, setFormData] = useState({
    position_title: '',
    department_id: '',
    current_incumbent_id: '',
    criticality: 'medium',
    succession_timeline: 'immediate',
    required_competencies: '',
    development_actions: '',
    status: 'active',
    review_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadPlans(),
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

  async function loadPlans() {
    const { data, error } = await supabase
      .from('succession_plans')
      .select(`
        *,
        department:departments(name),
        current_incumbent:employees(first_name, last_name)
      `)
      .order('criticality', { ascending: false });

    if (error) throw error;
    setPlans(data || []);
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
      const planData = {
        position_title: formData.position_title,
        department_id: formData.department_id,
        current_incumbent_id: formData.current_incumbent_id || null,
        criticality: formData.criticality,
        succession_timeline: formData.succession_timeline,
        required_competencies: formData.required_competencies || null,
        development_actions: formData.development_actions || null,
        status: formData.status,
        review_date: formData.review_date,
        notes: formData.notes || null,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('succession_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Succession plan updated successfully');
      } else {
        const { error } = await supabase
          .from('succession_plans')
          .insert([planData]);

        if (error) throw error;
        toast.success('Succession plan created successfully');
      }

      setDialogOpen(false);
      loadPlans();
      resetForm();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(error.message || 'Failed to save succession plan');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this succession plan?')) return;

    try {
      const { error } = await supabase
        .from('succession_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Succession plan deleted successfully');
      loadPlans();
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete succession plan');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingPlan(null);
    setDialogOpen(true);
  }

  function handleEdit(plan: SuccessionPlan) {
    setEditingPlan(plan);
    setFormData({
      position_title: plan.position_title,
      department_id: plan.department_id,
      current_incumbent_id: plan.current_incumbent_id || '',
      criticality: plan.criticality,
      succession_timeline: plan.succession_timeline,
      required_competencies: plan.required_competencies || '',
      development_actions: plan.development_actions || '',
      status: plan.status,
      review_date: plan.review_date,
      notes: plan.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      position_title: '',
      department_id: '',
      current_incumbent_id: '',
      criticality: 'medium',
      succession_timeline: 'immediate',
      required_competencies: '',
      development_actions: '',
      status: 'active',
      review_date: '',
      notes: '',
    });
  }

  const criticalityColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Succession Planning</h1>
          <p className="text-gray-600 mt-1">Plan and manage succession for critical positions</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Criticality</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.criticality === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Immediate Need</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {plans.filter(p => p.succession_timeline === 'immediate').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : plans.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No succession plans found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Users className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{plan.position_title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {plan.department?.name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plan.current_incumbent && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current:</span>
                      <span className="text-sm font-medium">
                        {plan.current_incumbent.first_name} {plan.current_incumbent.last_name}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Criticality:</span>
                    <Badge className={criticalityColors[plan.criticality]}>
                      {plan.criticality.charAt(0).toUpperCase() + plan.criticality.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Timeline:</span>
                    <Badge variant="outline" className="capitalize">
                      {plan.succession_timeline.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[plan.status]}>
                      {plan.status.replace('_', ' ').charAt(0).toUpperCase() + plan.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Review:</span>
                    <span className="text-sm font-medium">
                      {new Date(plan.review_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(plan)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(plan.id)}
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
              {editingPlan ? 'Edit Succession Plan' : 'Add Succession Plan'}
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
                  placeholder="e.g., Chief Financial Officer"
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
              <Label htmlFor="current_incumbent_id">Current Incumbent</Label>
              <select
                id="current_incumbent_id"
                value={formData.current_incumbent_id}
                onChange={(e) => setFormData({ ...formData, current_incumbent_id: e.target.value })}
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
                <Label htmlFor="criticality">Criticality *</Label>
                <select
                  id="criticality"
                  required
                  value={formData.criticality}
                  onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <Label htmlFor="succession_timeline">Timeline *</Label>
                <select
                  id="succession_timeline"
                  required
                  value={formData.succession_timeline}
                  onChange={(e) => setFormData({ ...formData, succession_timeline: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="immediate">Immediate</option>
                  <option value="1_2_years">1-2 Years</option>
                  <option value="3_5_years">3-5 Years</option>
                  <option value="5_plus_years">5+ Years</option>
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
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="review_date">Next Review Date *</Label>
              <Input
                id="review_date"
                type="date"
                required
                value={formData.review_date}
                onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="required_competencies">Required Competencies</Label>
              <textarea
                id="required_competencies"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.required_competencies}
                onChange={(e) => setFormData({ ...formData, required_competencies: e.target.value })}
                placeholder="List key competencies and qualifications..."
              />
            </div>
            <div>
              <Label htmlFor="development_actions">Development Actions</Label>
              <textarea
                id="development_actions"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.development_actions}
                onChange={(e) => setFormData({ ...formData, development_actions: e.target.value })}
                placeholder="List development activities and succession preparation..."
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
                {editingPlan ? 'Update' : 'Create'} Plan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
