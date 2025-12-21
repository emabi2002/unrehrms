'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, Clock, CheckCircle, XCircle, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface OvertimeRequest {
  id: string;
  employee_id: string;
  employee?: {
    first_name: string;
    last_name: string;
    department: string;
  };
  request_date: string;
  ot_date: string;
  start_time: string;
  end_time: string;
  hours: number;
  reason?: string;
  status: string;
  approved_by?: string;
  approver?: {
    first_name: string;
    last_name: string;
  };
  approval_date?: string;
  rejection_reason?: string;
  included_in_payroll: boolean;
  pay_run_id?: string;
}

export default function OvertimeRequestsPage() {
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    employee_id: '',
    ot_date: '',
    start_time: '',
    end_time: '',
    reason: '',
  });

  const [filters, setFilters] = useState({
    status: 'all',
    employee: 'all',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  async function loadData() {
    try {
      setLoading(true);
      let query = supabase
        .from('overtime_requests')
        .select(`
          *,
          employee:employees!overtime_requests_employee_id_fkey(
            first_name,
            last_name,
            department
          ),
          approver:employees!overtime_requests_approved_by_fkey(
            first_name,
            last_name
          )
        `)
        .order('ot_date', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.employee !== 'all') {
        query = query.eq('employee_id', filters.employee);
      }

      if (filters.date_from) {
        query = query.gte('ot_date', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('ot_date', filters.date_to);
      }

      const [otRes, empRes] = await Promise.all([
        query,
        supabase.from('employees').select('id, first_name, last_name, department').eq('status', 'active'),
      ]);

      if (otRes.data) setOvertimeRequests(otRes.data);
      if (empRes.data) setEmployees(empRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load overtime requests');
    } finally {
      setLoading(false);
    }
  }

  function calculateHours(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startTotalMin = startHour * 60 + startMin;
    const endTotalMin = endHour * 60 + endMin;

    const totalMinutes = endTotalMin - startTotalMin;
    return Math.round((totalMinutes / 60) * 100) / 100;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const hours = calculateHours(formData.start_time, formData.end_time);

    if (hours <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    const data = {
      employee_id: formData.employee_id,
      request_date: new Date().toISOString().split('T')[0],
      ot_date: formData.ot_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      hours: hours,
      reason: formData.reason || null,
      status: 'pending',
      included_in_payroll: false,
    };

    try {
      const { error } = await supabase.from('overtime_requests').insert([data]);

      if (error) throw error;

      toast.success('Overtime request submitted successfully');
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to submit overtime request');
    }
  }

  async function approveRequest(requestId: string) {
    try {
      const { error } = await supabase
        .from('overtime_requests')
        .update({
          status: 'approved',
          approved_by: '00000000-0000-0000-0000-000000000000', // TODO: Get from auth
          approval_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Overtime request approved');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to approve request');
    }
  }

  async function rejectRequest(requestId: string) {
    const reason = prompt('Rejection reason (optional):');

    try {
      const { error } = await supabase
        .from('overtime_requests')
        .update({
          status: 'rejected',
          approved_by: '00000000-0000-0000-0000-000000000000', // TODO: Get from auth
          approval_date: new Date().toISOString().split('T')[0],
          rejection_reason: reason || null,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast.success('Overtime request rejected');
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to reject request');
    }
  }

  function resetForm() {
    setFormData({
      employee_id: '',
      ot_date: '',
      start_time: '',
      end_time: '',
      reason: '',
    });
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      pending: <Badge className="bg-yellow-600">Pending</Badge>,
      approved: <Badge className="bg-green-600">Approved</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const stats = {
    total: overtimeRequests.length,
    pending: overtimeRequests.filter((r) => r.status === 'pending').length,
    approved: overtimeRequests.filter((r) => r.status === 'approved').length,
    totalHours: overtimeRequests
      .filter((r) => r.status === 'approved')
      .reduce((sum, r) => sum + r.hours, 0),
    pendingPayroll: overtimeRequests.filter(
      (r) => r.status === 'approved' && !r.included_in_payroll
    ).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading overtime requests...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Overtime Requests</h1>
          <p className="text-gray-600 mt-1">Manage overtime requests and approvals</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request Overtime
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hours</p>
                <p className="text-2xl font-bold">{stats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Payroll</p>
                <p className="text-2xl font-bold">{stats.pendingPayroll}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <Label htmlFor="employee">Employee</Label>
              <select
                id="employee"
                className="w-full px-3 py-2 border rounded-md"
                value={filters.employee}
                onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              >
                <option value="all">All Employees</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="date_from">Date From</Label>
              <Input
                id="date_from"
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="date_to">Date To</Label>
              <Input
                id="date_to"
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFilters({ status: 'all', employee: 'all', date_from: '', date_to: '' })
                }
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overtime Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Overtime Requests ({overtimeRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    OT Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Payroll
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {overtimeRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {request.employee?.first_name} {request.employee?.last_name}
                        </p>
                        <p className="text-xs text-gray-600">{request.employee?.department}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(request.ot_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {request.start_time} - {request.end_time}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-bold">{request.hours.toFixed(1)} hrs</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-xs truncate">
                      {request.reason || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {getStatusBadge(request.status)}
                      {request.status === 'rejected' && request.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1">{request.rejection_reason}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {request.included_in_payroll ? (
                        <Badge className="bg-green-600">
                          <DollarSign className="h-3 w-3 mr-1" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => approveRequest(request.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectRequest(request.id)}
                            className="text-red-600"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {request.status === 'approved' && (
                        <div className="text-xs text-gray-600">
                          Approved by {request.approver?.first_name} {request.approver?.last_name}
                          <br />
                          on {new Date(request.approval_date!).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {overtimeRequests.length === 0 && (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No overtime requests found</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Submit First Request
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Request Overtime Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Request Overtime</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="employee_id">Employee *</Label>
              <select
                id="employee_id"
                className="w-full px-3 py-2 border rounded-md"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="ot_date">Overtime Date *</Label>
              <Input
                id="ot_date"
                type="date"
                value={formData.ot_date}
                onChange={(e) => setFormData({ ...formData, ot_date: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  required
                />
              </div>
            </div>

            {formData.start_time && formData.end_time && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-900">Total Hours:</span>
                  <span className="font-bold text-lg text-blue-900">
                    {calculateHours(formData.start_time, formData.end_time).toFixed(1)} hours
                  </span>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="reason">Reason for Overtime</Label>
              <textarea
                id="reason"
                className="w-full min-h-[80px] px-3 py-2 border rounded-md"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Explain why overtime is needed..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
