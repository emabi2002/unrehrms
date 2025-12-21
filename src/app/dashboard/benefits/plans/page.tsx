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
import { Plus, Pencil, Trash2, Gift, DollarSign, Users, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BenefitPlan {
  id: string;
  plan_code: string;
  plan_name: string;
  plan_type: string;
  description?: string;
  provider?: string;
  cost_per_employee?: number;
  employer_contribution_pct?: number;
  is_active: boolean;
  created_at?: string;
}

export default function BenefitPlansPage() {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BenefitPlan | null>(null);
  const [formData, setFormData] = useState({
    plan_code: '',
    plan_name: '',
    plan_type: 'health',
    description: '',
    provider: '',
    cost_per_employee: '',
    employer_contribution_pct: '100',
  });

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('benefit_plans')
        .select('*')
        .order('plan_name', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      console.error('Error loading benefit plans:', error);
      toast.error('Failed to load benefit plans');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const planData = {
        plan_code: formData.plan_code,
        plan_name: formData.plan_name,
        plan_type: formData.plan_type,
        description: formData.description || null,
        provider: formData.provider || null,
        cost_per_employee: formData.cost_per_employee ? parseFloat(formData.cost_per_employee) : null,
        employer_contribution_pct: formData.employer_contribution_pct ? parseFloat(formData.employer_contribution_pct) : 100,
        is_active: true,
      };

      if (editingPlan) {
        const { error } = await supabase
          .from('benefit_plans')
          .update(planData)
          .eq('id', editingPlan.id);

        if (error) throw error;
        toast.success('Benefit plan updated successfully');
      } else {
        const { error } = await supabase
          .from('benefit_plans')
          .insert([planData]);

        if (error) throw error;
        toast.success('Benefit plan created successfully');
      }

      setDialogOpen(false);
      loadPlans();
      resetForm();
    } catch (error: any) {
      console.error('Error saving benefit plan:', error);
      toast.error(error.message || 'Failed to save benefit plan');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this benefit plan?')) return;

    try {
      const { error } = await supabase
        .from('benefit_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Benefit plan deleted successfully');
      loadPlans();
    } catch (error: any) {
      console.error('Error deleting benefit plan:', error);
      toast.error('Failed to delete benefit plan');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingPlan(null);
    setDialogOpen(true);
  }

  function handleEdit(plan: BenefitPlan) {
    setEditingPlan(plan);
    setFormData({
      plan_code: plan.plan_code,
      plan_name: plan.plan_name,
      plan_type: plan.plan_type,
      description: plan.description || '',
      provider: plan.provider || '',
      cost_per_employee: plan.cost_per_employee?.toString() || '',
      employer_contribution_pct: plan.employer_contribution_pct?.toString() || '100',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      plan_code: '',
      plan_name: '',
      plan_type: 'health',
      description: '',
      provider: '',
      cost_per_employee: '',
      employer_contribution_pct: '100',
    });
  }

  const planTypeColors: Record<string, string> = {
    health: 'bg-blue-100 text-blue-800',
    dental: 'bg-green-100 text-green-800',
    life: 'bg-purple-100 text-purple-800',
    retirement: 'bg-orange-100 text-orange-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefit Plans</h1>
          <p className="text-gray-600 mt-1">Manage employee benefit plans and packages</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Benefit Plan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Gift className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Badge className="bg-[#008751]">{plans.filter(p => p.is_active).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{plans.filter(p => p.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plan Types</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(plans.map(p => p.plan_type)).size}</div>
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
            <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No benefit plans found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Benefit Plan
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
                      <Gift className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {plan.plan_code}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge className={planTypeColors[plan.plan_type] || planTypeColors.other}>
                      {plan.plan_type.charAt(0).toUpperCase() + plan.plan_type.slice(1)}
                    </Badge>
                  </div>
                  {plan.provider && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="text-sm font-medium">{plan.provider}</span>
                    </div>
                  )}
                  {plan.cost_per_employee && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Cost/Employee:</span>
                      <span className="text-sm font-medium">K{plan.cost_per_employee}/month</span>
                    </div>
                  )}
                  {plan.employer_contribution_pct && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Employer Pays:</span>
                      <span className="text-sm font-medium">{plan.employer_contribution_pct}%</span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2 min-h-[3rem]">
                    {plan.description || 'No description provided'}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t mt-4">
                  <Badge className={plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex gap-2">
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
              {editingPlan ? 'Edit Benefit Plan' : 'Add Benefit Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan_code">Plan Code *</Label>
                <Input
                  id="plan_code"
                  required
                  value={formData.plan_code}
                  onChange={(e) => setFormData({ ...formData, plan_code: e.target.value })}
                  placeholder="e.g., HEALTH-001"
                />
              </div>
              <div>
                <Label htmlFor="plan_name">Plan Name *</Label>
                <Input
                  id="plan_name"
                  required
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  placeholder="e.g., Basic Health Insurance"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan_type">Plan Type *</Label>
                <select
                  id="plan_type"
                  required
                  value={formData.plan_type}
                  onChange={(e) => setFormData({ ...formData, plan_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="health">Health Insurance</option>
                  <option value="dental">Dental Insurance</option>
                  <option value="life">Life Insurance</option>
                  <option value="retirement">Retirement Plan</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Insurance provider name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cost_per_employee">Cost per Employee (PGK/month)</Label>
                <Input
                  id="cost_per_employee"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_employee}
                  onChange={(e) => setFormData({ ...formData, cost_per_employee: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div>
                <Label htmlFor="employer_contribution_pct">Employer Contribution %</Label>
                <Input
                  id="employer_contribution_pct"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.employer_contribution_pct}
                  onChange={(e) => setFormData({ ...formData, employer_contribution_pct: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this benefit plan..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingPlan ? 'Update' : 'Create'} Benefit Plan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
