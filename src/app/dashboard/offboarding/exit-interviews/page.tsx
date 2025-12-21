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
import { Plus, Pencil, Trash2, MessageSquare, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ExitInterview {
  id: string;
  employee_id: string;
  resignation_id?: string;
  interview_date: string;
  interviewer_id?: string;
  reason_for_leaving: string;
  would_rehire: boolean;
  would_recommend: boolean;
  overall_satisfaction: number;
  management_satisfaction: number;
  work_environment_satisfaction: number;
  compensation_satisfaction: number;
  comments?: string;
  suggestions?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  interviewer?: {
    first_name: string;
    last_name: string;
  };
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  employee_number: string;
}

export default function ExitInterviewsPage() {
  const [interviews, setInterviews] = useState<ExitInterview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState<ExitInterview | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    interview_date: new Date().toISOString().split('T')[0],
    interviewer_id: '',
    reason_for_leaving: 'better_opportunity',
    would_rehire: true,
    would_recommend: true,
    overall_satisfaction: '3',
    management_satisfaction: '3',
    work_environment_satisfaction: '3',
    compensation_satisfaction: '3',
    comments: '',
    suggestions: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadInterviews(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadInterviews() {
    const { data, error } = await supabase
      .from('exit_interviews')
      .select(`
        *,
        employee:employees!exit_interviews_employee_id_fkey(first_name, last_name, employee_number),
        interviewer:employees!exit_interviews_interviewer_id_fkey(first_name, last_name)
      `)
      .order('interview_date', { ascending: false });

    if (error) throw error;
    setInterviews(data || []);
  }

  async function loadEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_number')
      .order('first_name');

    if (error) throw error;
    setEmployees(data || []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const interviewData = {
        employee_id: formData.employee_id,
        interview_date: formData.interview_date,
        interviewer_id: formData.interviewer_id || null,
        reason_for_leaving: formData.reason_for_leaving,
        would_rehire: formData.would_rehire,
        would_recommend: formData.would_recommend,
        overall_satisfaction: parseInt(formData.overall_satisfaction),
        management_satisfaction: parseInt(formData.management_satisfaction),
        work_environment_satisfaction: parseInt(formData.work_environment_satisfaction),
        compensation_satisfaction: parseInt(formData.compensation_satisfaction),
        comments: formData.comments || null,
        suggestions: formData.suggestions || null,
      };

      if (editingInterview) {
        const { error } = await supabase
          .from('exit_interviews')
          .update(interviewData)
          .eq('id', editingInterview.id);

        if (error) throw error;
        toast.success('Exit interview updated successfully');
      } else {
        const { error } = await supabase
          .from('exit_interviews')
          .insert([interviewData]);

        if (error) throw error;
        toast.success('Exit interview created successfully');
      }

      setDialogOpen(false);
      loadInterviews();
      resetForm();
    } catch (error: any) {
      console.error('Error saving exit interview:', error);
      toast.error(error.message || 'Failed to save exit interview');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this exit interview?')) return;

    try {
      const { error } = await supabase
        .from('exit_interviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Exit interview deleted successfully');
      loadInterviews();
    } catch (error: any) {
      console.error('Error deleting exit interview:', error);
      toast.error('Failed to delete exit interview');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingInterview(null);
    setDialogOpen(true);
  }

  function handleEdit(interview: ExitInterview) {
    setEditingInterview(interview);
    setFormData({
      employee_id: interview.employee_id,
      interview_date: interview.interview_date,
      interviewer_id: interview.interviewer_id || '',
      reason_for_leaving: interview.reason_for_leaving,
      would_rehire: interview.would_rehire,
      would_recommend: interview.would_recommend,
      overall_satisfaction: interview.overall_satisfaction.toString(),
      management_satisfaction: interview.management_satisfaction.toString(),
      work_environment_satisfaction: interview.work_environment_satisfaction.toString(),
      compensation_satisfaction: interview.compensation_satisfaction.toString(),
      comments: interview.comments || '',
      suggestions: interview.suggestions || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      interview_date: new Date().toISOString().split('T')[0],
      interviewer_id: '',
      reason_for_leaving: 'better_opportunity',
      would_rehire: true,
      would_recommend: true,
      overall_satisfaction: '3',
      management_satisfaction: '3',
      work_environment_satisfaction: '3',
      compensation_satisfaction: '3',
      comments: '',
      suggestions: '',
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exit Interviews</h1>
          <p className="text-gray-600 mt-1">Conduct and manage employee exit interviews</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Interview
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Would Rehire</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => i.would_rehire).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.length > 0
                ? (interviews.reduce((sum, i) => sum + i.overall_satisfaction, 0) / interviews.length).toFixed(1)
                : '0'}/5
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter(i => {
                const date = new Date(i.interview_date);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : interviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No exit interviews found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Interview
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <Card key={interview.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {interview.employee?.first_name} {interview.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {interview.employee?.employee_number}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Interview Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(interview.interview_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Rating:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {interview.overall_satisfaction}/5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Would Rehire:</span>
                    <Badge className={interview.would_rehire ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {interview.would_rehire ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Would Recommend:</span>
                    <Badge className={interview.would_recommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {interview.would_recommend ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reason:</span>
                    <Badge variant="outline" className="capitalize">
                      {interview.reason_for_leaving.replace('_', ' ')}
                    </Badge>
                  </div>
                  {interview.interviewer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Interviewer:</span>
                      <span className="text-sm font-medium">
                        {interview.interviewer.first_name} {interview.interviewer.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(interview)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(interview.id)}
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
              {editingInterview ? 'Edit Exit Interview' : 'Add Exit Interview'}
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
                <Label htmlFor="interview_date">Interview Date *</Label>
                <Input
                  id="interview_date"
                  type="date"
                  required
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="interviewer_id">Interviewer</Label>
                <select
                  id="interviewer_id"
                  value={formData.interviewer_id}
                  onChange={(e) => setFormData({ ...formData, interviewer_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select Interviewer</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="reason_for_leaving">Reason for Leaving *</Label>
                <select
                  id="reason_for_leaving"
                  required
                  value={formData.reason_for_leaving}
                  onChange={(e) => setFormData({ ...formData, reason_for_leaving: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="better_opportunity">Better Opportunity</option>
                  <option value="personal_reasons">Personal Reasons</option>
                  <option value="relocation">Relocation</option>
                  <option value="career_change">Career Change</option>
                  <option value="retirement">Retirement</option>
                  <option value="health_issues">Health Issues</option>
                  <option value="dissatisfaction">Dissatisfaction</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="overall_satisfaction">Overall (1-5) *</Label>
                <Input
                  id="overall_satisfaction"
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.overall_satisfaction}
                  onChange={(e) => setFormData({ ...formData, overall_satisfaction: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="management_satisfaction">Management (1-5) *</Label>
                <Input
                  id="management_satisfaction"
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.management_satisfaction}
                  onChange={(e) => setFormData({ ...formData, management_satisfaction: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="work_environment_satisfaction">Environment (1-5) *</Label>
                <Input
                  id="work_environment_satisfaction"
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.work_environment_satisfaction}
                  onChange={(e) => setFormData({ ...formData, work_environment_satisfaction: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="compensation_satisfaction">Compensation (1-5) *</Label>
                <Input
                  id="compensation_satisfaction"
                  type="number"
                  min="1"
                  max="5"
                  required
                  value={formData.compensation_satisfaction}
                  onChange={(e) => setFormData({ ...formData, compensation_satisfaction: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="would_rehire"
                  checked={formData.would_rehire}
                  onChange={(e) => setFormData({ ...formData, would_rehire: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="would_rehire">Would Rehire</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="would_recommend"
                  checked={formData.would_recommend}
                  onChange={(e) => setFormData({ ...formData, would_recommend: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="would_recommend">Would Recommend Company</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <textarea
                id="comments"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="General comments and feedback..."
              />
            </div>
            <div>
              <Label htmlFor="suggestions">Suggestions for Improvement</Label>
              <textarea
                id="suggestions"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[80px]"
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                placeholder="What could we improve..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingInterview ? 'Update' : 'Create'} Interview
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
