'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Users, TrendingUp } from 'lucide-react';

interface Position {
  id: string;
  position_code: string;
  position_title: string;
  department_id: string;
  department?: { name: string };
  reports_to_position_id?: string;
  reports_to?: { position_title: string };
  job_family?: string;
  job_grade?: string;
  employment_type: string;
  approved_headcount: number;
  current_headcount: number;
  min_salary?: number;
  mid_salary?: number;
  max_salary?: number;
  is_active: boolean;
}

interface Department {
  id: string;
  name: string;
}

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    position_code: '',
    position_title: '',
    department_id: '',
    reports_to_position_id: '',
    job_family: '',
    job_grade: '',
    employment_type: 'permanent',
    approved_headcount: 1,
    min_salary: '',
    mid_salary: '',
    max_salary: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [positionsRes, deptRes] = await Promise.all([
        supabase
          .from('positions')
          .select(`
            *,
            department:departments(name),
            reports_to:positions!positions_reports_to_position_id_fkey(position_title)
          `)
          .order('position_title'),
        supabase.from('departments').select('id, name').order('name'),
      ]);

      if (positionsRes.data) setPositions(positionsRes.data);
      if (deptRes.data) setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load positions');
    } finally {
      setLoading(false);
    }
  }

  function openDialog(position?: Position) {
    if (position) {
      setEditingPosition(position);
      setFormData({
        position_code: position.position_code,
        position_title: position.position_title,
        department_id: position.department_id,
        reports_to_position_id: position.reports_to_position_id || '',
        job_family: position.job_family || '',
        job_grade: position.job_grade || '',
        employment_type: position.employment_type,
        approved_headcount: position.approved_headcount,
        min_salary: position.min_salary?.toString() || '',
        mid_salary: position.mid_salary?.toString() || '',
        max_salary: position.max_salary?.toString() || '',
      });
    } else {
      setEditingPosition(null);
      setFormData({
        position_code: '',
        position_title: '',
        department_id: '',
        reports_to_position_id: '',
        job_family: '',
        job_grade: '',
        employment_type: 'permanent',
        approved_headcount: 1,
        min_salary: '',
        mid_salary: '',
        max_salary: '',
      });
    }
    setDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      position_code: formData.position_code,
      position_title: formData.position_title,
      department_id: formData.department_id,
      reports_to_position_id: formData.reports_to_position_id || null,
      job_family: formData.job_family || null,
      job_grade: formData.job_grade || null,
      employment_type: formData.employment_type,
      approved_headcount: formData.approved_headcount,
      min_salary: formData.min_salary ? parseFloat(formData.min_salary) : null,
      mid_salary: formData.mid_salary ? parseFloat(formData.mid_salary) : null,
      max_salary: formData.max_salary ? parseFloat(formData.max_salary) : null,
    };

    try {
      if (editingPosition) {
        const { error } = await supabase
          .from('positions')
          .update(data)
          .eq('id', editingPosition.id);

        if (error) throw error;
        toast.success('Position updated successfully');
      } else {
        const { error } = await supabase.from('positions').insert([data]);

        if (error) throw error;
        toast.success('Position created successfully');
      }

      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving position:', error);
      toast.error(error.message || 'Failed to save position');
    }
  }

  async function handleDelete(position: Position) {
    if (!confirm(`Delete position "${position.position_title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', position.id);

      if (error) throw error;

      toast.success('Position deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error deleting position:', error);
      toast.error(error.message || 'Failed to delete position');
    }
  }

  const stats = {
    totalPositions: positions.length,
    activePositions: positions.filter((p) => p.is_active).length,
    totalHeadcount: positions.reduce((sum, p) => sum + p.approved_headcount, 0),
    currentHeadcount: positions.reduce((sum, p) => sum + (p.current_headcount || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading positions...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Positions</h1>
          <p className="text-gray-600 mt-1">Manage job positions and organizational structure</p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold">{stats.totalPositions}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Positions</p>
                <p className="text-2xl font-bold">{stats.activePositions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Headcount</p>
                <p className="text-2xl font-bold">{stats.totalHeadcount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Headcount</p>
                <p className="text-2xl font-bold">{stats.currentHeadcount}</p>
                <p className="text-xs text-gray-500">
                  {stats.totalHeadcount - stats.currentHeadcount} vacancies
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position Title
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reports To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Headcount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Salary Range
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position) => (
                  <tr key={position.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{position.position_code}</td>
                    <td className="px-4 py-3 text-sm">{position.position_title}</td>
                    <td className="px-4 py-3 text-sm">{position.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {position.reports_to?.position_title || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline">{position.employment_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {position.current_headcount || 0} / {position.approved_headcount}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {position.min_salary && position.max_salary
                        ? `PGK ${position.min_salary.toLocaleString()} - ${position.max_salary.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {position.is_active ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDialog(position)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(position)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {positions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No positions found</p>
                <Button onClick={() => openDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Position
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPosition ? 'Edit Position' : 'Add New Position'}
            </DialogTitle>
            <DialogDescription>
              {editingPosition
                ? 'Update the position details below'
                : 'Create a new position in your organization'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position_code">Position Code *</Label>
                <Input
                  id="position_code"
                  value={formData.position_code}
                  onChange={(e) => setFormData({ ...formData, position_code: e.target.value })}
                  required
                  placeholder="e.g., POS-001"
                />
              </div>

              <div>
                <Label htmlFor="position_title">Position Title *</Label>
                <Input
                  id="position_title"
                  value={formData.position_title}
                  onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                  required
                  placeholder="e.g., Senior Lecturer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select
                  value={formData.employment_type}
                  onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="job_family">Job Family</Label>
                <Input
                  id="job_family"
                  value={formData.job_family}
                  onChange={(e) => setFormData({ ...formData, job_family: e.target.value })}
                  placeholder="e.g., Academic, Administrative"
                />
              </div>

              <div>
                <Label htmlFor="job_grade">Job Grade</Label>
                <Input
                  id="job_grade"
                  value={formData.job_grade}
                  onChange={(e) => setFormData({ ...formData, job_grade: e.target.value })}
                  placeholder="e.g., Grade A, Level 5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="approved_headcount">Approved Headcount *</Label>
              <Input
                id="approved_headcount"
                type="number"
                min="1"
                value={formData.approved_headcount}
                onChange={(e) =>
                  setFormData({ ...formData, approved_headcount: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="min_salary">Min Salary (PGK)</Label>
                <Input
                  id="min_salary"
                  type="number"
                  value={formData.min_salary}
                  onChange={(e) => setFormData({ ...formData, min_salary: e.target.value })}
                  placeholder="50000"
                />
              </div>

              <div>
                <Label htmlFor="mid_salary">Mid Salary (PGK)</Label>
                <Input
                  id="mid_salary"
                  type="number"
                  value={formData.mid_salary}
                  onChange={(e) => setFormData({ ...formData, mid_salary: e.target.value })}
                  placeholder="75000"
                />
              </div>

              <div>
                <Label htmlFor="max_salary">Max Salary (PGK)</Label>
                <Input
                  id="max_salary"
                  type="number"
                  value={formData.max_salary}
                  onChange={(e) => setFormData({ ...formData, max_salary: e.target.value })}
                  placeholder="100000"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPosition ? 'Update Position' : 'Create Position'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
