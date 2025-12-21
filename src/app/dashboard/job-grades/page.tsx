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
import { Plus, Pencil, Trash2, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface JobGrade {
  id: string;
  grade_code: string;
  grade_name: string;
  grade_level: number;
  min_salary: number;
  mid_salary: number;
  max_salary: number;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export default function JobGradesPage() {
  const [jobGrades, setJobGrades] = useState<JobGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<JobGrade | null>(null);
  const [formData, setFormData] = useState({
    grade_code: '',
    grade_name: '',
    grade_level: 1,
    min_salary: '',
    mid_salary: '',
    max_salary: '',
    description: '',
  });

  useEffect(() => {
    loadJobGrades();
  }, []);

  async function loadJobGrades() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_grades')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setJobGrades(data || []);
    } catch (error: any) {
      console.error('Error loading job grades:', error);
      toast.error('Failed to load job grades');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const gradeData = {
        grade_code: formData.grade_code,
        grade_name: formData.grade_name,
        grade_level: formData.grade_level,
        min_salary: parseFloat(formData.min_salary),
        mid_salary: parseFloat(formData.mid_salary),
        max_salary: parseFloat(formData.max_salary),
        description: formData.description || null,
        is_active: true,
      };

      if (editingGrade) {
        const { error } = await supabase
          .from('job_grades')
          .update(gradeData)
          .eq('id', editingGrade.id);

        if (error) throw error;
        toast.success('Job grade updated successfully');
      } else {
        const { error } = await supabase
          .from('job_grades')
          .insert([gradeData]);

        if (error) throw error;
        toast.success('Job grade created successfully');
      }

      setDialogOpen(false);
      loadJobGrades();
      resetForm();
    } catch (error: any) {
      console.error('Error saving job grade:', error);
      toast.error(error.message || 'Failed to save job grade');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this job grade?')) return;

    try {
      const { error } = await supabase
        .from('job_grades')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Job grade deleted successfully');
      loadJobGrades();
    } catch (error: any) {
      console.error('Error deleting job grade:', error);
      toast.error('Failed to delete job grade');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingGrade(null);
    setDialogOpen(true);
  }

  function handleEdit(grade: JobGrade) {
    setEditingGrade(grade);
    setFormData({
      grade_code: grade.grade_code,
      grade_name: grade.grade_name,
      grade_level: grade.grade_level,
      min_salary: grade.min_salary.toString(),
      mid_salary: grade.mid_salary.toString(),
      max_salary: grade.max_salary.toString(),
      description: grade.description || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      grade_code: '',
      grade_name: '',
      grade_level: 1,
      min_salary: '',
      mid_salary: '',
      max_salary: '',
      description: '',
    });
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PG', {
      style: 'currency',
      currency: 'PGK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Grades</h1>
          <p className="text-gray-600 mt-1">Manage salary grades and compensation bands</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Job Grade
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobGrades.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salary Range</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {jobGrades.length > 0 && (
                <>
                  {formatCurrency(Math.min(...jobGrades.map(g => g.min_salary)))} - {formatCurrency(Math.max(...jobGrades.map(g => g.max_salary)))}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Grades</CardTitle>
            <Badge className="bg-[#008751]">{jobGrades.filter(g => g.is_active).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobGrades.filter(g => g.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Grades Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : jobGrades.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No job grades found</p>
              <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
                <Plus className="h-4 w-4 mr-2" />
                Add First Job Grade
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Grade</th>
                    <th className="text-left p-3 font-semibold">Level</th>
                    <th className="text-left p-3 font-semibold">Minimum</th>
                    <th className="text-left p-3 font-semibold">Midpoint</th>
                    <th className="text-left p-3 font-semibold">Maximum</th>
                    <th className="text-left p-3 font-semibold">Status</th>
                    <th className="text-right p-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobGrades.map((grade) => (
                    <tr key={grade.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-semibold">{grade.grade_name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {grade.grade_code}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge className="bg-blue-100 text-blue-800">
                          Level {grade.grade_level}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-sm">{formatCurrency(grade.min_salary)}</td>
                      <td className="p-3 font-mono text-sm font-semibold text-[#008751]">
                        {formatCurrency(grade.mid_salary)}
                      </td>
                      <td className="p-3 font-mono text-sm">{formatCurrency(grade.max_salary)}</td>
                      <td className="p-3">
                        {grade.is_active ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(grade)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(grade.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingGrade ? 'Edit Job Grade' : 'Add Job Grade'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade_code">Grade Code *</Label>
                <Input
                  id="grade_code"
                  required
                  value={formData.grade_code}
                  onChange={(e) => setFormData({ ...formData, grade_code: e.target.value })}
                  placeholder="e.g., G1"
                />
              </div>
              <div>
                <Label htmlFor="grade_level">Level *</Label>
                <Input
                  id="grade_level"
                  type="number"
                  required
                  value={formData.grade_level}
                  onChange={(e) => setFormData({ ...formData, grade_level: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="grade_name">Grade Name *</Label>
              <Input
                id="grade_name"
                required
                value={formData.grade_name}
                onChange={(e) => setFormData({ ...formData, grade_name: e.target.value })}
                placeholder="e.g., Grade 1 - Entry Level"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min_salary">Minimum Salary (PGK) *</Label>
                <Input
                  id="min_salary"
                  type="number"
                  required
                  value={formData.min_salary}
                  onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                  placeholder="25000"
                />
              </div>
              <div>
                <Label htmlFor="mid_salary">Midpoint (PGK) *</Label>
                <Input
                  id="mid_salary"
                  type="number"
                  required
                  value={formData.mid_salary}
                  onChange={(e) => setFormData({ ...formData, mid_salary: e.target.value })}
                  placeholder="35000"
                />
              </div>
              <div>
                <Label htmlFor="max_salary">Maximum Salary (PGK) *</Label>
                <Input
                  id="max_salary"
                  type="number"
                  required
                  value={formData.max_salary}
                  onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                  placeholder="45000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingGrade ? 'Update' : 'Create'} Job Grade
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
