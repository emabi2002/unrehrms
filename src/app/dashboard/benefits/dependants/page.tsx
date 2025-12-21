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
import { Plus, Pencil, Trash2, Users, Baby, Heart, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BenefitDependant {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  relationship: string;
  date_of_birth: string;
  gender?: string;
  is_covered: boolean;
  coverage_start_date?: string;
  coverage_end_date?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function DependantsPage() {
  const [dependants, setDependants] = useState<BenefitDependant[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDependant, setEditingDependant] = useState<BenefitDependant | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    relationship: 'spouse',
    date_of_birth: '',
    gender: 'M',
    is_covered: true,
    coverage_start_date: new Date().toISOString().split('T')[0],
    coverage_end_date: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadDependants(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadDependants() {
    const { data, error } = await supabase
      .from('benefit_dependants')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setDependants(data || []);
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
      const dependantData = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        relationship: formData.relationship,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender || null,
        is_covered: formData.is_covered,
        coverage_start_date: formData.coverage_start_date || null,
        coverage_end_date: formData.coverage_end_date || null,
      };

      if (editingDependant) {
        const { error } = await supabase
          .from('benefit_dependants')
          .update(dependantData)
          .eq('id', editingDependant.id);

        if (error) throw error;
        toast.success('Dependant updated successfully');
      } else {
        const { error } = await supabase
          .from('benefit_dependants')
          .insert([dependantData]);

        if (error) throw error;
        toast.success('Dependant added successfully');
      }

      setDialogOpen(false);
      loadDependants();
      resetForm();
    } catch (error: any) {
      console.error('Error saving dependant:', error);
      toast.error(error.message || 'Failed to save dependant');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this dependant?')) return;

    try {
      const { error } = await supabase
        .from('benefit_dependants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Dependant deleted successfully');
      loadDependants();
    } catch (error: any) {
      console.error('Error deleting dependant:', error);
      toast.error('Failed to delete dependant');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingDependant(null);
    setDialogOpen(true);
  }

  function handleEdit(dependant: BenefitDependant) {
    setEditingDependant(dependant);
    setFormData({
      employee_id: dependant.employee_id,
      first_name: dependant.first_name,
      last_name: dependant.last_name,
      relationship: dependant.relationship,
      date_of_birth: dependant.date_of_birth,
      gender: dependant.gender || 'M',
      is_covered: dependant.is_covered,
      coverage_start_date: dependant.coverage_start_date || '',
      coverage_end_date: dependant.coverage_end_date || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      first_name: '',
      last_name: '',
      relationship: 'spouse',
      date_of_birth: '',
      gender: 'M',
      is_covered: true,
      coverage_start_date: new Date().toISOString().split('T')[0],
      coverage_end_date: '',
    });
  }

  function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const relationshipColors: Record<string, string> = {
    spouse: 'bg-pink-100 text-pink-800',
    child: 'bg-blue-100 text-blue-800',
    parent: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefit Dependants</h1>
          <p className="text-gray-600 mt-1">Manage employee dependants for benefit coverage</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Dependant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dependants</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dependants.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Covered</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dependants.filter(d => d.is_covered).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Baby className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dependants.filter(d => d.relationship === 'child').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spouses</CardTitle>
            <Heart className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dependants.filter(d => d.relationship === 'spouse').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dependants Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : dependants.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No dependants found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Dependant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dependants.map((dependant) => (
            <Card key={dependant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      {dependant.relationship === 'child' ? (
                        <Baby className="h-6 w-6 text-[#008751]" />
                      ) : dependant.relationship === 'spouse' ? (
                        <Heart className="h-6 w-6 text-[#008751]" />
                      ) : (
                        <Users className="h-6 w-6 text-[#008751]" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {dependant.first_name} {dependant.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {dependant.employee?.first_name} {dependant.employee?.last_name}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Relationship:</span>
                    <Badge className={relationshipColors[dependant.relationship] || relationshipColors.other}>
                      {dependant.relationship.charAt(0).toUpperCase() + dependant.relationship.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Age:</span>
                    <span className="text-sm font-medium">
                      {calculateAge(dependant.date_of_birth)} years
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Gender:</span>
                    <span className="text-sm font-medium">{dependant.gender === 'M' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Coverage:</span>
                    <Badge className={dependant.is_covered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {dependant.is_covered ? 'Covered' : 'Not Covered'}
                    </Badge>
                  </div>
                  {dependant.coverage_start_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Coverage Start:</span>
                      <span className="text-sm font-medium">
                        {new Date(dependant.coverage_start_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(dependant)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(dependant.id)}
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
              {editingDependant ? 'Edit Dependant' : 'Add Dependant'}
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
                    {emp.first_name} {emp.last_name} ({emp.employee_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="relationship">Relationship *</Label>
                <select
                  id="relationship"
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="spouse">Spouse</option>
                  <option value="child">Child</option>
                  <option value="parent">Parent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender *</Label>
                <select
                  id="gender"
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="is_covered"
                  checked={formData.is_covered}
                  onChange={(e) => setFormData({ ...formData, is_covered: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_covered">Covered</Label>
              </div>
              <div>
                <Label htmlFor="coverage_start_date">Coverage Start</Label>
                <Input
                  id="coverage_start_date"
                  type="date"
                  value={formData.coverage_start_date}
                  onChange={(e) => setFormData({ ...formData, coverage_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="coverage_end_date">Coverage End</Label>
                <Input
                  id="coverage_end_date"
                  type="date"
                  value={formData.coverage_end_date}
                  onChange={(e) => setFormData({ ...formData, coverage_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingDependant ? 'Update' : 'Add'} Dependant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
