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
import { Plus, Pencil, Trash2, Heart, Users, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WellnessProgram {
  id: string;
  program_name: string;
  program_type: string;
  description: string;
  start_date: string;
  end_date?: string;
  provider?: string;
  target_participants: number;
  enrolled_participants: number;
  cost_per_participant?: number;
  benefits?: string;
  eligibility_criteria?: string;
  status: string;
  created_at?: string;
}

export default function WellnessProgramsPage() {
  const [programs, setPrograms] = useState<WellnessProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<WellnessProgram | null>(null);
  const [formData, setFormData] = useState({
    program_name: '',
    program_type: 'fitness',
    description: '',
    start_date: '',
    end_date: '',
    provider: '',
    target_participants: '0',
    enrolled_participants: '0',
    cost_per_participant: '',
    benefits: '',
    eligibility_criteria: '',
    status: 'planned',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  async function loadPrograms() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wellness_programs')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error: any) {
      console.error('Error loading programs:', error);
      toast.error('Failed to load wellness programs');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const programData = {
        program_name: formData.program_name,
        program_type: formData.program_type,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        provider: formData.provider || null,
        target_participants: parseInt(formData.target_participants),
        enrolled_participants: parseInt(formData.enrolled_participants),
        cost_per_participant: formData.cost_per_participant ? parseFloat(formData.cost_per_participant) : null,
        benefits: formData.benefits || null,
        eligibility_criteria: formData.eligibility_criteria || null,
        status: formData.status,
      };

      if (editingProgram) {
        const { error } = await supabase
          .from('wellness_programs')
          .update(programData)
          .eq('id', editingProgram.id);

        if (error) throw error;
        toast.success('Wellness program updated successfully');
      } else {
        const { error } = await supabase
          .from('wellness_programs')
          .insert([programData]);

        if (error) throw error;
        toast.success('Wellness program created successfully');
      }

      setDialogOpen(false);
      loadPrograms();
      resetForm();
    } catch (error: any) {
      console.error('Error saving program:', error);
      toast.error(error.message || 'Failed to save wellness program');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this wellness program?')) return;

    try {
      const { error } = await supabase
        .from('wellness_programs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Wellness program deleted successfully');
      loadPrograms();
    } catch (error: any) {
      console.error('Error deleting program:', error);
      toast.error('Failed to delete wellness program');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingProgram(null);
    setDialogOpen(true);
  }

  function handleEdit(program: WellnessProgram) {
    setEditingProgram(program);
    setFormData({
      program_name: program.program_name,
      program_type: program.program_type,
      description: program.description,
      start_date: program.start_date,
      end_date: program.end_date || '',
      provider: program.provider || '',
      target_participants: program.target_participants.toString(),
      enrolled_participants: program.enrolled_participants.toString(),
      cost_per_participant: program.cost_per_participant?.toString() || '',
      benefits: program.benefits || '',
      eligibility_criteria: program.eligibility_criteria || '',
      status: program.status,
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      program_name: '',
      program_type: 'fitness',
      description: '',
      start_date: '',
      end_date: '',
      provider: '',
      target_participants: '0',
      enrolled_participants: '0',
      cost_per_participant: '',
      benefits: '',
      eligibility_criteria: '',
      status: 'planned',
    });
  }

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const getEnrollmentPercentage = (program: WellnessProgram) => {
    if (program.target_participants === 0) return 0;
    return Math.round((program.enrolled_participants / program.target_participants) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellness Programs</h1>
          <p className="text-gray-600 mt-1">Manage employee wellness and health programs</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Program
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Heart className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Heart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.filter(p => p.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.reduce((sum, p) => sum + p.enrolled_participants, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Enrollment</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programs.length > 0
                ? Math.round(programs.reduce((sum, p) => sum + getEnrollmentPercentage(p), 0) / programs.length)
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : programs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No wellness programs found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Program
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program) => (
            <Card key={program.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Heart className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{program.program_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1 capitalize">
                        {program.program_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {program.provider && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="text-sm font-medium">{program.provider}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge className={statusColors[program.status]}>
                      {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Participants:</span>
                    <span className="text-sm font-medium">
                      {program.enrolled_participants} / {program.target_participants}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Enrollment:</span>
                      <span className="font-medium">{getEnrollmentPercentage(program)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#008751] h-2 rounded-full"
                        style={{ width: `${getEnrollmentPercentage(program)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Start Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(program.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  {program.end_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">End Date:</span>
                      <span className="text-sm font-medium">
                        {new Date(program.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {program.description && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 line-clamp-2">{program.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(program)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(program.id)}
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProgram ? 'Edit Wellness Program' : 'Add Wellness Program'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="program_name">Program Name *</Label>
              <Input
                id="program_name"
                required
                value={formData.program_name}
                onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                placeholder="e.g., Fitness Challenge 2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="program_type">Program Type *</Label>
                <select
                  id="program_type"
                  required
                  value={formData.program_type}
                  onChange={(e) => setFormData({ ...formData, program_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="fitness">Fitness</option>
                  <option value="mental_health">Mental Health</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="smoking_cessation">Smoking Cessation</option>
                  <option value="stress_management">Stress Management</option>
                  <option value="weight_management">Weight Management</option>
                  <option value="health_screening">Health Screening</option>
                  <option value="other">Other</option>
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
                  <option value="planned">Planned</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the wellness program..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="provider">Provider/Facilitator</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Provider name"
                />
              </div>
              <div>
                <Label htmlFor="cost_per_participant">Cost per Participant (PGK)</Label>
                <Input
                  id="cost_per_participant"
                  type="number"
                  step="0.01"
                  value={formData.cost_per_participant}
                  onChange={(e) => setFormData({ ...formData, cost_per_participant: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target_participants">Target Participants *</Label>
                <Input
                  id="target_participants"
                  type="number"
                  min="0"
                  required
                  value={formData.target_participants}
                  onChange={(e) => setFormData({ ...formData, target_participants: e.target.value })}
                  placeholder="50"
                />
              </div>
              <div>
                <Label htmlFor="enrolled_participants">Enrolled Participants *</Label>
                <Input
                  id="enrolled_participants"
                  type="number"
                  min="0"
                  required
                  value={formData.enrolled_participants}
                  onChange={(e) => setFormData({ ...formData, enrolled_participants: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="benefits">Program Benefits</Label>
              <textarea
                id="benefits"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.benefits}
                onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                placeholder="List benefits for participants..."
              />
            </div>
            <div>
              <Label htmlFor="eligibility_criteria">Eligibility Criteria</Label>
              <textarea
                id="eligibility_criteria"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.eligibility_criteria}
                onChange={(e) => setFormData({ ...formData, eligibility_criteria: e.target.value })}
                placeholder="Who can participate in this program..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingProgram ? 'Update' : 'Create'} Program
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
