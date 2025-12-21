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
import { Plus, Pencil, Trash2, TrendingUp, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CompensationReview {
  id: string;
  employee_id: string;
  review_date: string;
  review_type: string;
  current_salary: number;
  proposed_salary: number;
  increase_percentage: number;
  effective_date: string;
  status: string;
  reviewer_notes?: string;
  approved_by?: string;
  approval_date?: string;
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

export default function CompensationReviewsPage() {
  const [reviews, setReviews] = useState<CompensationReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CompensationReview | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    review_date: new Date().toISOString().split('T')[0],
    review_type: 'annual',
    current_salary: '',
    proposed_salary: '',
    effective_date: '',
    status: 'pending',
    reviewer_notes: '',
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
      .from('compensation_reviews')
      .select(`
        *,
        employee:employees(first_name, last_name, employee_number)
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
      const currentSalary = parseFloat(formData.current_salary);
      const proposedSalary = parseFloat(formData.proposed_salary);
      const increasePercentage = ((proposedSalary - currentSalary) / currentSalary) * 100;

      const reviewData = {
        employee_id: formData.employee_id,
        review_date: formData.review_date,
        review_type: formData.review_type,
        current_salary: currentSalary,
        proposed_salary: proposedSalary,
        increase_percentage: increasePercentage,
        effective_date: formData.effective_date,
        status: formData.status,
        reviewer_notes: formData.reviewer_notes || null,
      };

      if (editingReview) {
        const { error } = await supabase
          .from('compensation_reviews')
          .update(reviewData)
          .eq('id', editingReview.id);

        if (error) throw error;
        toast.success('Review updated successfully');
      } else {
        const { error } = await supabase
          .from('compensation_reviews')
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
        .from('compensation_reviews')
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

  function handleEdit(review: CompensationReview) {
    setEditingReview(review);
    setFormData({
      employee_id: review.employee_id,
      review_date: review.review_date,
      review_type: review.review_type,
      current_salary: review.current_salary.toString(),
      proposed_salary: review.proposed_salary.toString(),
      effective_date: review.effective_date,
      status: review.status,
      reviewer_notes: review.reviewer_notes || '',
    });
    setDialogOpen(true);
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      review_date: new Date().toISOString().split('T')[0],
      review_type: 'annual',
      current_salary: '',
      proposed_salary: '',
      effective_date: '',
      status: 'pending',
      reviewer_notes: '',
    });
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    implemented: 'bg-blue-100 text-blue-800',
  };

  const reviewTypeColors: Record<string, string> = {
    annual: 'bg-purple-100 text-purple-800',
    promotion: 'bg-green-100 text-green-800',
    market_adjustment: 'bg-blue-100 text-blue-800',
    merit: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compensation Reviews</h1>
          <p className="text-gray-600 mt-1">Manage salary reviews and adjustments</p>
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
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviews.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Increase</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0
                ? (reviews.reduce((sum, r) => sum + r.increase_percentage, 0) / reviews.length).toFixed(1)
                : '0'}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No compensation reviews found</p>
            <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Review
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Review Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proposed Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Increase</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.employee?.first_name} {review.employee?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{review.employee?.employee_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={reviewTypeColors[review.review_type] || reviewTypeColors.annual}>
                        {review.review_type.replace('_', ' ').charAt(0).toUpperCase() + review.review_type.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      K{review.current_salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-green-700">
                      K{review.proposed_salary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-green-100 text-green-800">
                        +{review.increase_percentage.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(review.effective_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusColors[review.status] || statusColors.pending}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
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
              {editingReview ? 'Edit Compensation Review' : 'Add Compensation Review'}
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
                <Label htmlFor="review_type">Review Type *</Label>
                <select
                  id="review_type"
                  required
                  value={formData.review_type}
                  onChange={(e) => setFormData({ ...formData, review_type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="annual">Annual Review</option>
                  <option value="promotion">Promotion</option>
                  <option value="market_adjustment">Market Adjustment</option>
                  <option value="merit">Merit Increase</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_salary">Current Salary (PGK) *</Label>
                <Input
                  id="current_salary"
                  type="number"
                  step="0.01"
                  required
                  value={formData.current_salary}
                  onChange={(e) => setFormData({ ...formData, current_salary: e.target.value })}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label htmlFor="proposed_salary">Proposed Salary (PGK) *</Label>
                <Input
                  id="proposed_salary"
                  type="number"
                  step="0.01"
                  required
                  value={formData.proposed_salary}
                  onChange={(e) => setFormData({ ...formData, proposed_salary: e.target.value })}
                  placeholder="55000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="implemented">Implemented</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="reviewer_notes">Reviewer Notes</Label>
              <textarea
                id="reviewer_notes"
                className="w-full border border-gray-300 rounded-md p-2 min-h-[100px]"
                value={formData.reviewer_notes}
                onChange={(e) => setFormData({ ...formData, reviewer_notes: e.target.value })}
                placeholder="Add review notes and justification..."
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
