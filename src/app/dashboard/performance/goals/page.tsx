'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Target, TrendingUp, CheckCircle, Clock, Users, Building2, User, Pencil, Trash2 } from 'lucide-react';

interface PerformanceGoal {
  id: string;
  goal_type: string;
  parent_goal_id?: string;
  parent_goal?: { goal_title: string };
  employee_id?: string;
  employee?: { first_name: string; last_name: string };
  department_id?: string;
  department?: { name: string };
  goal_title: string;
  goal_description?: string;
  kpi_metrics?: string;
  target_value?: string;
  actual_value?: string;
  start_date: string;
  end_date: string;
  weight_percentage?: number;
  status: string;
  progress_percentage: number;
  created_by?: string;
}

export default function PerformanceGoalsPage() {
  const [goals, setGoals] = useState<PerformanceGoal[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<PerformanceGoal | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    goal_type: 'individual',
    parent_goal_id: '',
    employee_id: '',
    department_id: '',
    goal_title: '',
    goal_description: '',
    kpi_metrics: '',
    target_value: '',
    start_date: '',
    end_date: '',
    weight_percentage: '',
  });

  const [filters, setFilters] = useState({
    goal_type: 'all',
    status: 'all',
    department: 'all',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      let query = supabase
        .from('performance_goals')
        .select(`
          *,
          employee:employees(first_name, last_name),
          department:departments(name),
          parent_goal:performance_goals!performance_goals_parent_goal_id_fkey(goal_title)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.goal_type !== 'all') {
        query = query.eq('goal_type', filters.goal_type);
      }

      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.department !== 'all') {
        query = query.eq('department_id', filters.department);
      }

      const [goalsRes, empRes, deptRes] = await Promise.all([
        query,
        supabase.from('employees').select('id, first_name, last_name, department').eq('status', 'active'),
        supabase.from('departments').select('id, name'),
      ]);

      if (goalsRes.data) setGoals(goalsRes.data);
      if (empRes.data) setEmployees(empRes.data);
      if (deptRes.data) setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }

  function openDialog(goal?: PerformanceGoal) {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        goal_type: goal.goal_type,
        parent_goal_id: goal.parent_goal_id || '',
        employee_id: goal.employee_id || '',
        department_id: goal.department_id || '',
        goal_title: goal.goal_title,
        goal_description: goal.goal_description || '',
        kpi_metrics: goal.kpi_metrics || '',
        target_value: goal.target_value || '',
        start_date: goal.start_date,
        end_date: goal.end_date,
        weight_percentage: goal.weight_percentage?.toString() || '',
      });
    } else {
      setEditingGoal(null);
      setFormData({
        goal_type: 'individual',
        parent_goal_id: '',
        employee_id: '',
        department_id: '',
        goal_title: '',
        goal_description: '',
        kpi_metrics: '',
        target_value: '',
        start_date: '',
        end_date: '',
        weight_percentage: '',
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data: any = {
      goal_type: formData.goal_type,
      goal_title: formData.goal_title,
      goal_description: formData.goal_description || null,
      kpi_metrics: formData.kpi_metrics || null,
      target_value: formData.target_value || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      weight_percentage: formData.weight_percentage ? parseFloat(formData.weight_percentage) : null,
      status: 'draft',
      progress_percentage: 0,
    };

    // Set appropriate IDs based on goal type
    if (formData.goal_type === 'individual') {
      data.employee_id = formData.employee_id || null;
    } else if (formData.goal_type === 'departmental') {
      data.department_id = formData.department_id || null;
    }

    if (formData.parent_goal_id) {
      data.parent_goal_id = formData.parent_goal_id;
    }

    try {
      if (editingGoal) {
        const { error } = await supabase
          .from('performance_goals')
          .update(data)
          .eq('id', editingGoal.id);

        if (error) throw error;
        toast.success('Goal updated successfully');
      } else {
        const { error } = await supabase.from('performance_goals').insert([data]);

        if (error) throw error;
        toast.success('Goal created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to save goal');
    }
  }

  async function updateStatus(goalId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('performance_goals')
        .update({ status: newStatus })
        .eq('id', goalId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  }

  async function updateProgress(goalId: string, progress: number) {
    try {
      const { error } = await supabase
        .from('performance_goals')
        .update({ progress_percentage: progress })
        .eq('id', goalId);

      if (error) throw error;

      toast.success('Progress updated');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update progress');
    }
  }

  async function handleDelete(goal: PerformanceGoal) {
    if (!confirm(`Delete goal "${goal.goal_title}"?`)) return;

    try {
      const { error } = await supabase
        .from('performance_goals')
        .delete()
        .eq('id', goal.id);

      if (error) throw error;

      toast.success('Goal deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete goal');
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      draft: <Badge variant="secondary">Draft</Badge>,
      active: <Badge className="bg-blue-600">Active</Badge>,
      achieved: <Badge className="bg-green-600">Achieved</Badge>,
      partially_achieved: <Badge className="bg-yellow-600">Partially Achieved</Badge>,
      not_achieved: <Badge variant="destructive">Not Achieved</Badge>,
      cancelled: <Badge variant="outline">Cancelled</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const getGoalTypeIcon = (type: string) => {
    const icons: any = {
      organizational: <Building2 className="h-4 w-4" />,
      departmental: <Users className="h-4 w-4" />,
      individual: <User className="h-4 w-4" />,
    };
    return icons[type] || <Target className="h-4 w-4" />;
  };

  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === 'active').length,
    achieved: goals.filter((g) => g.status === 'achieved').length,
    avgProgress: goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress_percentage, 0) / goals.length)
      : 0,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading goals...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Performance Goals</h1>
          <p className="text-gray-600 mt-1">Set and track organizational, departmental, and individual goals</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Set New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Goals</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Achieved</p>
                <p className="text-2xl font-bold">{stats.achieved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-2xl font-bold">{stats.avgProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="goal_type_filter">Goal Type</Label>
              <Select
                value={filters.goal_type}
                onValueChange={(value) => setFilters({ ...filters, goal_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="organizational">Organizational</SelectItem>
                  <SelectItem value="departmental">Departmental</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status_filter">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="achieved">Achieved</SelectItem>
                  <SelectItem value="partially_achieved">Partially Achieved</SelectItem>
                  <SelectItem value="not_achieved">Not Achieved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department_filter">Department</Label>
              <Select
                value={filters.department}
                onValueChange={(value) => setFilters({ ...filters, department: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFilters({ goal_type: 'all', status: 'all', department: 'all' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getGoalTypeIcon(goal.goal_type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{goal.goal_title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Badge variant="outline" className="capitalize">
                          {goal.goal_type}
                        </Badge>
                        {goal.goal_type === 'individual' && goal.employee && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {goal.employee.first_name} {goal.employee.last_name}
                          </span>
                        )}
                        {goal.goal_type === 'departmental' && goal.department && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {goal.department.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {goal.goal_description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.goal_description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                    {goal.kpi_metrics && (
                      <div>
                        <p className="text-gray-600">KPI Metrics</p>
                        <p className="font-medium">{goal.kpi_metrics}</p>
                      </div>
                    )}
                    {goal.target_value && (
                      <div>
                        <p className="text-gray-600">Target</p>
                        <p className="font-medium">{goal.target_value}</p>
                      </div>
                    )}
                    {goal.actual_value && (
                      <div>
                        <p className="text-gray-600">Actual</p>
                        <p className="font-medium">{goal.actual_value}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-600">Period</p>
                      <p className="font-medium">
                        {new Date(goal.start_date).toLocaleDateString()} -{' '}
                        {new Date(goal.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{goal.progress_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progress_percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(goal.status)}
                    {goal.parent_goal && (
                      <Badge variant="outline" className="text-xs">
                        Cascaded from: {goal.parent_goal.goal_title}
                      </Badge>
                    )}
                    {goal.weight_percentage && (
                      <Badge variant="outline" className="text-xs">
                        Weight: {goal.weight_percentage}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDialog(goal)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(goal)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No goals found</p>
            <Button onClick={() => openDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Set Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goal_type">Goal Type *</Label>
                <Select
                  value={formData.goal_type}
                  onValueChange={(value) => setFormData({ ...formData, goal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizational">Organizational</SelectItem>
                    <SelectItem value="departmental">Departmental</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.goal_type === 'individual' && (
                <div>
                  <Label htmlFor="employee_id">Employee *</Label>
                  <Select
                    value={formData.employee_id}
                    onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.goal_type === 'departmental' && (
                <div>
                  <Label htmlFor="department_id">Department *</Label>
                  <Select
                    value={formData.department_id}
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="goal_title">Goal Title *</Label>
              <Input
                id="goal_title"
                value={formData.goal_title}
                onChange={(e) => setFormData({ ...formData, goal_title: e.target.value })}
                required
                placeholder="e.g., Increase student enrollment by 15%"
              />
            </div>

            <div>
              <Label htmlFor="goal_description">Description</Label>
              <textarea
                id="goal_description"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                value={formData.goal_description}
                onChange={(e) => setFormData({ ...formData, goal_description: e.target.value })}
                placeholder="Detailed description of the goal..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kpi_metrics">KPI Metrics</Label>
                <Input
                  id="kpi_metrics"
                  value={formData.kpi_metrics}
                  onChange={(e) => setFormData({ ...formData, kpi_metrics: e.target.value })}
                  placeholder="e.g., Number of new enrollments"
                />
              </div>

              <div>
                <Label htmlFor="target_value">Target Value</Label>
                <Input
                  id="target_value"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="e.g., 500 students"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="weight_percentage">Weight (%)</Label>
                <Input
                  id="weight_percentage"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.weight_percentage}
                  onChange={(e) => setFormData({ ...formData, weight_percentage: e.target.value })}
                  placeholder="25"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingGoal ? 'Update Goal' : 'Create Goal'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
