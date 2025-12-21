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
import { Plus, Pencil, Trash2, Star, TrendingUp, Award, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TalentProfile {
  id: string;
  employee_id: string;
  assessment_date: string;
  performance_rating: string;
  potential_rating: string;
  skills_assessment: string;
  strengths?: string;
  development_areas?: string;
  career_aspirations?: string;
  retention_risk: string;
  succession_readiness: string;
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

export default function TalentProfilesPage() {
  const [profiles, setProfiles] = useState<TalentProfile[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TalentProfile | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    assessment_date: new Date().toISOString().split('T')[0],
    performance_rating: 'meets_expectations',
    potential_rating: 'medium',
    skills_assessment: '',
    strengths: '',
    development_areas: '',
    career_aspirations: '',
    retention_risk: 'low',
    succession_readiness: 'not_ready',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadProfiles(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadProfiles() {
    const { data, error } = await supabase
      .from('talent_profiles')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number, job_title)
      `)
      .order('assessment_date', { ascending: false });

    if (error) throw error;
    setProfiles(data || []);
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
      const profileData = {
        employee_id: formData.employee_id,
        assessment_date: formData.assessment_date,
        performance_rating: formData.performance_rating,
        potential_rating: formData.potential_rating,
        skills_assessment: formData.skills_assessment,
        strengths: formData.strengths || null,
        development_areas: formData.development_areas || null,
        career_aspirations: formData.career_aspirations || null,
        retention_risk: formData.retention_risk,
        succession_readiness: formData.succession_readiness,
        notes: formData.notes || null,
      };

      if (editingProfile) {
        const { error } = await supabase
          .from('talent_profiles')
          .update(profileData)
          .eq('id', editingProfile.id);

        if (error) throw error;
        toast.success('Talent profile updated successfully');
      } else {
        const { error } = await supabase
          .from('talent_profiles')
          .insert([profileData]);

        if (error) throw error;
        toast.success('Talent profile created successfully');
      }

      setDialogOpen(false);
      loadProfiles();
      resetForm();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.message || 'Failed to save talent profile');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this talent profile?')) return;

    try {
      const { error } = await supabase
        .from('talent_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Talent profile deleted successfully');
      loadProfiles();
    } catch (error: any) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete talent profile');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingProfile(null);
    setDialogOpen(true);
  }

  function handleEdit(profile: TalentProfile) {
    setEditingProfile(profile);
    setFormData({
      employee_id: profile.employee_id,
      assessment_date: profile.assessment_date,
      performance_rating: profile.performance_rating,
      potential_rating: profile.potential_rating,
      skills_assessment: profile.skills_assessment,
      strengths: profile.strengths || '',
      development_areas: profile.development_areas || '',
      career_aspirations: profile.career_aspirations || '',
      retention_risk: profile.retention_risk,
      succession_readiness: profile.succession_readiness,
      notes: profile.notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      assessment_date: new Date().toISOString().split('T')[0],
      performance_rating: 'meets_expectations',
      potential_rating: 'medium',
      skills_assessment: '',
      strengths: '',
      development_areas: '',
      career_aspirations: '',
      retention_risk: 'low',
      succession_readiness: 'not_ready',
      notes: '',
    });
  }

  const performanceColors: Record<string, string> = {
    exceeds_expectations: 'bg-green-100 text-green-800',
    meets_expectations: 'bg-blue-100 text-blue-800',
    needs_improvement: 'bg-yellow-100 text-yellow-800',
    unsatisfactory: 'bg-red-100 text-red-800',
  };

  const potentialColors: Record<string, string> = {
    high: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-800',
  };

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Talent Profiles</h1>
          <p className="text-gray-600 mt-1">Assess and track employee talent and potential</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            <Star className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Potential</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.potential_rating === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Retention Risk</CardTitle>
            <Award className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.retention_risk === 'high').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Succession Ready</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles.filter(p => p.succession_readiness === 'ready_now' || p.succession_readiness === 'ready_1_2_years').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : profiles.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No talent profiles found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => (
            <Card key={profile.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <Star className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {profile.employee?.first_name} {profile.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {profile.employee?.job_title}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Performance:</span>
                    <Badge className={performanceColors[profile.performance_rating]}>
                      {profile.performance_rating.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Potential:</span>
                    <Badge className={potentialColors[profile.potential_rating]}>
                      {profile.potential_rating.charAt(0).toUpperCase() + profile.potential_rating.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Risk:</span>
                    <Badge className={riskColors[profile.retention_risk]}>
                      {profile.retention_risk.charAt(0).toUpperCase() + profile.retention_risk.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Assessment:</span>
                    <span className="text-sm font-medium">
                      {new Date(profile.assessment_date).toLocaleDateString()}
                    </span>
                  </div>
                  {profile.skills_assessment && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-gray-600 line-clamp-2">{profile.skills_assessment}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(profile)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(profile.id)}
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
              {editingProfile ? 'Edit Talent Profile' : 'Add Talent Profile'}
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
                      {emp.first_name} {emp.last_name} - {emp.job_title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="assessment_date">Assessment Date *</Label>
                <Input
                  id="assessment_date"
                  type="date"
                  required
                  value={formData.assessment_date}
                  onChange={(e) => setFormData({ ...formData, assessment_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="performance_rating">Performance Rating *</Label>
                <select
                  id="performance_rating"
                  required
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({ ...formData, performance_rating: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="exceeds_expectations">Exceeds Expectations</option>
                  <option value="meets_expectations">Meets Expectations</option>
                  <option value="needs_improvement">Needs Improvement</option>
                  <option value="unsatisfactory">Unsatisfactory</option>
                </select>
              </div>
              <div>
                <Label htmlFor="potential_rating">Potential Rating *</Label>
                <select
                  id="potential_rating"
                  required
                  value={formData.potential_rating}
                  onChange={(e) => setFormData({ ...formData, potential_rating: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retention_risk">Retention Risk *</Label>
                <select
                  id="retention_risk"
                  required
                  value={formData.retention_risk}
                  onChange={(e) => setFormData({ ...formData, retention_risk: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <Label htmlFor="succession_readiness">Succession Readiness *</Label>
                <select
                  id="succession_readiness"
                  required
                  value={formData.succession_readiness}
                  onChange={(e) => setFormData({ ...formData, succession_readiness: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="ready_now">Ready Now</option>
                  <option value="ready_1_2_years">Ready in 1-2 Years</option>
                  <option value="ready_3_5_years">Ready in 3-5 Years</option>
                  <option value="not_ready">Not Ready</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="skills_assessment">Skills Assessment *</Label>
              <textarea
                id="skills_assessment"
                required
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.skills_assessment}
                onChange={(e) => setFormData({ ...formData, skills_assessment: e.target.value })}
                placeholder="Summarize key skills and competencies..."
              />
            </div>
            <div>
              <Label htmlFor="strengths">Strengths</Label>
              <textarea
                id="strengths"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                placeholder="Key strengths and accomplishments..."
              />
            </div>
            <div>
              <Label htmlFor="development_areas">Development Areas</Label>
              <textarea
                id="development_areas"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.development_areas}
                onChange={(e) => setFormData({ ...formData, development_areas: e.target.value })}
                placeholder="Areas for improvement and development..."
              />
            </div>
            <div>
              <Label htmlFor="career_aspirations">Career Aspirations</Label>
              <textarea
                id="career_aspirations"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[60px]"
                value={formData.career_aspirations}
                onChange={(e) => setFormData({ ...formData, career_aspirations: e.target.value })}
                placeholder="Employee's career goals and interests..."
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
                {editingProfile ? 'Update' : 'Create'} Profile
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
