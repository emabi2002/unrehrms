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
import { Plus, Pencil, Trash2, UserPlus, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BenefitEnrollment {
  id: string;
  employee_id: string;
  benefit_plan_id: string;
  enrollment_date: string;
  effective_date: string;
  end_date?: string;
  coverage_level?: string;
  employee_contribution?: number;
  employer_contribution?: number;
  status: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  benefit_plan?: {
    plan_name: string;
    plan_type: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

interface BenefitPlan {
  id: string;
  plan_name: string;
  plan_type: string;
}

export default function BenefitEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<BenefitEnrollment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<BenefitEnrollment | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    benefit_plan_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    effective_date: new Date().toISOString().split('T')[0],
    end_date: '',
    coverage_level: 'individual',
    employee_contribution: '',
    employer_contribution: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadEnrollments(),
        loadEmployees(),
        loadPlans(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadEnrollments() {
    const { data, error } = await supabase
      .from('benefit_enrollments')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number),
        benefit_plan:benefit_plans(plan_name, plan_type)
      `)
      .order('enrollment_date', { ascending: false });

    if (error) throw error;
    setEnrollments(data || []);
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

  async function loadPlans() {
    const { data, error } = await supabase
      .from('benefit_plans')
      .select('id, plan_name, plan_type')
      .eq('is_active', true)
      .order('plan_name');

    if (error) throw error;
    setPlans(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const enrollmentData = {
        employee_id: formData.employee_id,
        benefit_plan_id: formData.benefit_plan_id,
        enrollment_date: formData.enrollment_date,
        effective_date: formData.effective_date,
        end_date: formData.end_date || null,
        coverage_level: formData.coverage_level,
        employee_contribution: formData.employee_contribution ? parseFloat(formData.employee_contribution) : null,
        employer_contribution: formData.employer_contribution ? parseFloat(formData.employer_contribution) : null,
        status: 'active',
      };

      if (editingEnrollment) {
        const { error } = await supabase
          .from('benefit_enrollments')
          .update(enrollmentData)
          .eq('id', editingEnrollment.id);

        if (error) throw error;
        toast.success('Enrollment updated successfully');
      } else {
        const { error } = await supabase
          .from('benefit_enrollments')
          .insert([enrollmentData]);

        if (error) throw error;
        toast.success('Enrollment created successfully');
      }

      setDialogOpen(false);
      loadEnrollments();
      resetForm();
    } catch (error: any) {
      console.error('Error saving enrollment:', error);
      toast.error(error.message || 'Failed to save enrollment');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this enrollment?')) return;

    try {
      const { error } = await supabase
        .from('benefit_enrollments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Enrollment deleted successfully');
      loadEnrollments();
    } catch (error: any) {
      console.error('Error deleting enrollment:', error);
      toast.error('Failed to delete enrollment');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingEnrollment(null);
    setDialogOpen(true);
  }

  function handleEdit(enrollment: BenefitEnrollment) {
    setEditingEnrollment(enrollment);
    setFormData({
      employee_id: enrollment.employee_id,
      benefit_plan_id: enrollment.benefit_plan_id,
      enrollment_date: enrollment.enrollment_date,
      effective_date: enrollment.effective_date,
      end_date: enrollment.end_date || '',
      coverage_level: enrollment.coverage_level || 'individual',
      employee_contribution: enrollment.employee_contribution?.toString() || '',
      employer_contribution: enrollment.employer_contribution?.toString() || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      benefit_plan_id: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      effective_date: new Date().toISOString().split('T')[0],
      end_date: '',
      coverage_level: 'individual',
      employee_contribution: '',
      employer_contribution: '',
    });
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    terminated: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefit Enrollments</h1>
          <p className="text-gray-600 mt-1">Manage employee benefit plan enrollments</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Enrollment
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter(e => e.status === 'active').length}
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
              {enrollments.filter(e => {
                const date = new Date(e.enrollment_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Employees</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(enrollments.map(e => e.employee_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enrollments Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : enrollments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No benefit enrollments found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Enrollment
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Benefit Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coverage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {enrollment.employee?.first_name} {enrollment.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{enrollment.employee?.employee_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{enrollment.benefit_plan?.plan_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{enrollment.benefit_plan?.plan_type}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">
                        {enrollment.coverage_level || 'Individual'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(enrollment.enrollment_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(enrollment.effective_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[enrollment.status] || statusColors.active}>
                        {enrollment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(enrollment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(enrollment.id)}
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
              {editingEnrollment ? 'Edit Enrollment' : 'Add Enrollment'}
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
                <Label htmlFor="benefit_plan_id">Benefit Plan *</Label>
                <select
                  id="benefit_plan_id"
                  required
                  value={formData.benefit_plan_id}
                  onChange={(e) => setFormData({ ...formData, benefit_plan_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Plan</option>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.plan_name} ({plan.plan_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="enrollment_date">Enrollment Date *</Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  required
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="effective_date">Effective Date *</Label>
                <Input
                  id="effective_date"
                  type="date"
                  required
                  value={formData.effective_date}
                  onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="coverage_level">Coverage Level *</Label>
                <select
                  id="coverage_level"
                  required
                  value={formData.coverage_level}
                  onChange={(e) => setFormData({ ...formData, coverage_level: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="individual">Individual</option>
                  <option value="family">Family</option>
                  <option value="spouse">Spouse</option>
                  <option value="children">Children</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee_contribution">Employee Contribution (PGK/month)</Label>
                <Input
                  id="employee_contribution"
                  type="number"
                  step="0.01"
                  value={formData.employee_contribution}
                  onChange={(e) => setFormData({ ...formData, employee_contribution: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="employer_contribution">Employer Contribution (PGK/month)</Label>
                <Input
                  id="employer_contribution"
                  type="number"
                  step="0.01"
                  value={formData.employer_contribution}
                  onChange={(e) => setFormData({ ...formData, employer_contribution: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingEnrollment ? 'Update' : 'Create'} Enrollment
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
