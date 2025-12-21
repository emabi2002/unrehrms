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
import { Plus, Pencil, Trash2, Briefcase, Users, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface JobFamily {
  id: string;
  family_code: string;
  family_name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
}

export default function JobFamiliesPage() {
  const [jobFamilies, setJobFamilies] = useState<JobFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<JobFamily | null>(null);
  const [formData, setFormData] = useState({
    family_code: '',
    family_name: '',
    description: '',
  });

  useEffect(() => {
    loadJobFamilies();
  }, []);

  async function loadJobFamilies() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('job_families')
        .select('*')
        .order('family_name', { ascending: true });

      if (error) throw error;
      setJobFamilies(data || []);
    } catch (error: any) {
      console.error('Error loading job families:', error);
      toast.error('Failed to load job families');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const familyData = {
        family_code: formData.family_code,
        family_name: formData.family_name,
        description: formData.description || null,
        is_active: true,
      };

      if (editingFamily) {
        const { error } = await supabase
          .from('job_families')
          .update(familyData)
          .eq('id', editingFamily.id);

        if (error) throw error;
        toast.success('Job family updated successfully');
      } else {
        const { error } = await supabase
          .from('job_families')
          .insert([familyData]);

        if (error) throw error;
        toast.success('Job family created successfully');
      }

      setDialogOpen(false);
      loadJobFamilies();
      resetForm();
    } catch (error: any) {
      console.error('Error saving job family:', error);
      toast.error(error.message || 'Failed to save job family');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this job family?')) return;

    try {
      const { error } = await supabase
        .from('job_families')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Job family deleted successfully');
      loadJobFamilies();
    } catch (error: any) {
      console.error('Error deleting job family:', error);
      toast.error('Failed to delete job family');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingFamily(null);
    setDialogOpen(true);
  }

  function handleEdit(family: JobFamily) {
    setEditingFamily(family);
    setFormData({
      family_code: family.family_code,
      family_name: family.family_name,
      description: family.description || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      family_code: '',
      family_name: '',
      description: '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Families</h1>
          <p className="text-gray-600 mt-1">Organize positions into logical job families</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Job Family
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Families</CardTitle>
            <Briefcase className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobFamilies.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge className="bg-[#008751]">{jobFamilies.filter(f => f.is_active).length}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobFamilies.filter(f => f.is_active).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobFamilies.filter(f => !f.is_active).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Job Families Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : jobFamilies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No job families found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Job Family
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobFamilies.map((family) => (
            <Card key={family.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Briefcase className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{family.family_name}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {family.family_code}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4 min-h-[3rem]">
                  {family.description || 'No description provided'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <Badge className={family.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {family.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(family)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(family.id)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFamily ? 'Edit Job Family' : 'Add Job Family'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="family_code">Family Code *</Label>
                <Input
                  id="family_code"
                  required
                  value={formData.family_code}
                  onChange={(e) => setFormData({ ...formData, family_code: e.target.value })}
                  placeholder="e.g., ACAD"
                />
              </div>
              <div>
                <Label htmlFor="family_name">Family Name *</Label>
                <Input
                  id="family_name"
                  required
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                  placeholder="e.g., Academic & Research"
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
                placeholder="Describe this job family..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingFamily ? 'Update' : 'Create'} Job Family
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
