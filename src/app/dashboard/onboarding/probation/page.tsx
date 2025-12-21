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
import { Plus, Pencil, Trash2, UserCheck, Calendar, CheckCircle, Loader2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProbationReview {
  id: string;
  employee_id: string;
  review_date: string;
  probation_start_date: string;
  probation_end_date: string;
  review_period: string;
  reviewer_id?: string;
  performance_rating?: number;
  attendance_rating?: number;
  behavior_rating?: number;
  overall_rating?: number;
  recommendation: string;
  comments?: string;
  approved_by?: string;
  approval_date?: string;
  created_at?: string;
  employee?: {
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  reviewer?: {
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

export default function ProbationReviewsPage() {
  const [reviews, setReviews] = useState<ProbationReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ProbationReview | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_date: new Date().toISOString().split('T')[0],
    probation_start_date: '',
    probation_end_date: '',
    review_period: 'mid_probation',
    reviewer_id: '',
    performance_rating: '3',
    attendance_rating: '3',
    behavior_rating: '3',
    recommendation: 'continue',
    comments: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      await Promise.all([
        loadReviews(),
        loadEmployees(),
      ]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function loadReviews() {
    const { data, error } = await supabase
      .from('probation_reviews')
      .select(`
        *,
        employee:employees!probation_reviews_employee_id_fkey(first_name, last_name, employee_number),
        reviewer:employees!probation_reviews_reviewer_id_fkey(first_name, last_name)
      `)
      .order('review_date', { ascending: false });

    if (error) throw error;
    setReviews(data || []);
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
      const performanceRating = parseFloat(formData.performance_rating);
      const attendanceRating = parseFloat(formData.attendance_rating);
      const behaviorRating = parseFloat(formData.behavior_rating);
      const overallRating = (performanceRating + attendanceRating + behaviorRating) / 3;

      const reviewData = {
        employee_id: formData.employee_id,
        review_date: formData.review_date,
        probation_start_date: formData.probation_start_date,
        probation_end_date: formData.probation_end_date,
        review_period: formData.review_period,
        reviewer_id: formData.reviewer_id || null,
        performance_rating: performanceRating,
        attendance_rating: attendanceRating,
        behavior_rating: behaviorRating,
        overall_rating: overallRating,
        recommendation: formData.recommendation,
        comments: formData.comments || null,
      };

      if (editingReview) {
        const { error } = await supabase
          .from('probation_reviews')
          .update(reviewData)
          .eq('id', editingReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        const { error } = await supabase
          .from('probation_reviews')
          .insert([reviewData]);

        if (error) throw error;
        toast.success('Review created successfully');
      }

      setDialogOpen(false);
      loadReviews();
      resetForm();
    } catch (error: any) {
      console.error('Error saving review:', error);
      toast.error(error.message || 'Failed to save review');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      const { error } = await supabase
        .from('probation_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Review deleted successfully');
      loadReviews();
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  }

  function handleAdd() {
    resetForm();
    setEditingReview(null);
    setDialogOpen(true);
  }

  function handleEdit(review: ProbationReview) {
    setEditingReview(review);
    setFormData({
      employee_id: review.employee_id,
      review_date: review.review_date,
      probation_start_date: review.probation_start_date,
      probation_end_date: review.probation_end_date,
      review_period: review.review_period,
      reviewer_id: review.reviewer_id || '',
      performance_rating: review.performance_rating?.toString() || '3',
      attendance_rating: review.attendance_rating?.toString() || '3',
      behavior_rating: review.behavior_rating?.toString() || '3',
      recommendation: review.recommendation,
      comments: review.comments || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      review_date: new Date().toISOString().split('T')[0],
      probation_start_date: '',
      probation_end_date: '',
      review_period: 'mid_probation',
      reviewer_id: '',
      performance_rating: '3',
      attendance_rating: '3',
      behavior_rating: '3',
      recommendation: 'continue',
      comments: '',
    });
  }

  const recommendationColors: Record<string, string> = {
    confirm: 'bg-green-100 text-green-800',
    extend: 'bg-yellow-100 text-yellow-800',
    terminate: 'bg-red-100 text-red-800',
    continue: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Probation Reviews</h1>
          <p className="text-gray-600 mt-1">Manage employee probation period reviews and assessments</p>
        </div>
        <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
          <Plus className="h-4 w-4 mr-2" />
          Add Review
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.recommendation === 'confirm').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Extended</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.recommendation === 'extend').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1)
                : '0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No probation reviews found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Review
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#008751]/10 rounded-lg">
                      <UserCheck className="h-6 w-6 text-[#008751]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {review.employee?.first_name} {review.employee?.last_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {review.employee?.employee_number}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Review Period:</span>
                    <Badge variant="outline" className="capitalize">
                      {review.review_period.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Review Date:</span>
                    <span className="text-sm font-medium">
                      {new Date(review.review_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Rating:</span>
                    <Badge className="bg-purple-100 text-purple-800">
                      {review.overall_rating?.toFixed(1) || 'N/A'}/5
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recommendation:</span>
                    <Badge className={recommendationColors[review.recommendation] || recommendationColors.continue}>
                      {review.recommendation.charAt(0).toUpperCase() + review.recommendation.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Probation End:</span>
                    <span className="text-sm font-medium">
                      {new Date(review.probation_end_date).toLocaleDateString()}
                    </span>
                  </div>
                  {review.reviewer && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reviewer:</span>
                      <span className="text-sm font-medium">
                        {review.reviewer.first_name} {review.reviewer.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(review)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(review.id)}
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
              {editingReview ? 'Edit Probation Review' : 'Add Probation Review'}
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
                <Label htmlFor="review_date">Review Date *</Label>
                <Input
                  id="review_date"
                  type="date"
                  required
                  value={formData.review_date}
                  onChange={(e) => setFormData({ ...formData, review_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="review_period">Review Period *</Label>
                <select
                  id="review_period"
                  required
                  value={formData.review_period}
                  onChange={(e) => setFormData({ ...formData, review_period: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="mid_probation">Mid Probation</option>
                  <option value="end_probation">End Probation</option>
                  <option value="extended">Extended Review</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="probation_start_date">Probation Start *</Label>
                <Input
                  id="probation_start_date"
                  type="date"
                  required
                  value={formData.probation_start_date}
                  onChange={(e) => setFormData({ ...formData, probation_start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="probation_end_date">Probation End *</Label>
                <Input
                  id="probation_end_date"
                  type="date"
                  required
                  value={formData.probation_end_date}
                  onChange={(e) => setFormData({ ...formData, probation_end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="reviewer_id">Reviewer</Label>
              <select
                id="reviewer_id"
                value={formData.reviewer_id}
                onChange={(e) => setFormData({ ...formData, reviewer_id: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Reviewer</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="performance_rating">Performance Rating (1-5) *</Label>
                <Input
                  id="performance_rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  value={formData.performance_rating}
                  onChange={(e) => setFormData({ ...formData, performance_rating: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="attendance_rating">Attendance Rating (1-5) *</Label>
                <Input
                  id="attendance_rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  value={formData.attendance_rating}
                  onChange={(e) => setFormData({ ...formData, attendance_rating: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="behavior_rating">Behavior Rating (1-5) *</Label>
                <Input
                  id="behavior_rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  required
                  value={formData.behavior_rating}
                  onChange={(e) => setFormData({ ...formData, behavior_rating: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="recommendation">Recommendation *</Label>
              <select
                id="recommendation"
                required
                value={formData.recommendation}
                onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="continue">Continue Probation</option>
                <option value="confirm">Confirm Employment</option>
                <option value="extend">Extend Probation</option>
                <option value="terminate">Terminate Employment</option>
              </select>
            </div>
            <div>
              <Label htmlFor="comments">Comments</Label>
              <textarea
                id="comments"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="Detailed review comments and observations..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#008751] hover:bg-[#006641]">
                {editingReview ? 'Update' : 'Create'} Review
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
