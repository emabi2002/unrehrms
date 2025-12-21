'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import { Plus, FileText, CheckCircle, XCircle, Clock, Pencil } from 'lucide-react';

interface Requisition {
  id: string;
  requisition_number: string;
  position_id: string;
  position?: { position_title: string };
  department_id: string;
  department?: { name: string };
  requested_by: string;
  number_of_positions: number;
  employment_type: string;
  justification: string;
  status: string;
  estimated_salary?: number;
  budget_code?: string;
  created_at: string;
}

export default function JobRequisitionsPage() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const supabase = createClient();

  const [formData, setFormData] = useState({
    position_id: '',
    department_id: '',
    number_of_positions: 1,
    employment_type: 'permanent',
    justification: '',
    budget_code: '',
    estimated_salary: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [reqRes, posRes, deptRes] = await Promise.all([
        supabase
          .from('job_requisitions')
          .select('*, position:positions(position_title), department:departments(name)')
          .order('created_at', { ascending: false }),
        supabase.from('positions').select('id, position_title, position_code').eq('is_active', true),
        supabase.from('departments').select('id, name'),
      ]);

      if (reqRes.data) setRequisitions(reqRes.data);
      if (posRes.data) setPositions(posRes.data);
      if (deptRes.data) setDepartments(deptRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load requisitions');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Generate requisition number
    const reqNumber = `REQ-${Date.now().toString().slice(-8)}`;

    const data = {
      requisition_number: reqNumber,
      position_id: formData.position_id,
      department_id: formData.department_id,
      requested_by: '00000000-0000-0000-0000-000000000000', // TODO: Get from auth
      number_of_positions: formData.number_of_positions,
      employment_type: formData.employment_type,
      justification: formData.justification,
      budget_code: formData.budget_code || null,
      estimated_salary: formData.estimated_salary ? parseFloat(formData.estimated_salary) : null,
      status: 'draft',
    };

    try {
      const { error } = await supabase.from('job_requisitions').insert([data]);

      if (error) throw error;

      toast.success('Job requisition created successfully');
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create requisition');
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const { error } = await supabase
        .from('job_requisitions')
        .update({ status, approval_date: status === 'approved' ? new Date().toISOString() : null })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Requisition ${status}`);
      loadData();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update status');
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      draft: <Badge variant="secondary">Draft</Badge>,
      pending_hod: <Badge className="bg-yellow-600">Pending HOD</Badge>,
      pending_hr: <Badge className="bg-orange-600">Pending HR</Badge>,
      pending_ceo: <Badge className="bg-blue-600">Pending CEO</Badge>,
      approved: <Badge className="bg-green-600">Approved</Badge>,
      rejected: <Badge variant="destructive">Rejected</Badge>,
    };
    return badges[status] || <Badge>{status}</Badge>;
  };

  const stats = {
    total: requisitions.length,
    pending: requisitions.filter((r) => r.status.includes('pending')).length,
    approved: requisitions.filter((r) => r.status === 'approved').length,
    rejected: requisitions.filter((r) => r.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Job Requisitions</h1>
          <p className="text-gray-600 mt-1">Request approval for new positions</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Requisition
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requisitions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
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
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Requisitions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Req #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    No. of Positions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estimated Salary
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
                {requisitions.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{req.requisition_number}</td>
                    <td className="px-4 py-3 text-sm">{req.position?.position_title || '-'}</td>
                    <td className="px-4 py-3 text-sm">{req.department?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-center">{req.number_of_positions}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant="outline">{req.employment_type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {req.estimated_salary ? `PGK ${req.estimated_salary.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        {req.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(req.id, 'pending_hod')}
                          >
                            Submit
                          </Button>
                        )}
                        {req.status === 'pending_hod' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'pending_hr')}
                              className="text-green-600"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'rejected')}
                              className="text-red-600"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === 'pending_hr' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'pending_ceo')}
                              className="text-green-600"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'rejected')}
                              className="text-red-600"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === 'pending_ceo' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'approved')}
                              className="text-green-600"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatus(req.id, 'rejected')}
                              className="text-red-600"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {requisitions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No job requisitions found</p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Requisition
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Job Requisition</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position_id">Position *</Label>
                <Select
                  value={formData.position_id}
                  onValueChange={(value) => setFormData({ ...formData, position_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.position_code} - {pos.position_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="number_of_positions">Number of Positions *</Label>
                <Input
                  id="number_of_positions"
                  type="number"
                  min="1"
                  value={formData.number_of_positions}
                  onChange={(e) =>
                    setFormData({ ...formData, number_of_positions: parseInt(e.target.value) })
                  }
                  required
                />
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
                <Label htmlFor="budget_code">Budget Code</Label>
                <Input
                  id="budget_code"
                  value={formData.budget_code}
                  onChange={(e) => setFormData({ ...formData, budget_code: e.target.value })}
                  placeholder="e.g., BUD-2025-001"
                />
              </div>

              <div>
                <Label htmlFor="estimated_salary">Estimated Salary (PGK)</Label>
                <Input
                  id="estimated_salary"
                  type="number"
                  value={formData.estimated_salary}
                  onChange={(e) => setFormData({ ...formData, estimated_salary: e.target.value })}
                  placeholder="80000"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="justification">Justification *</Label>
              <textarea
                id="justification"
                className="w-full min-h-[100px] px-3 py-2 border rounded-md"
                value={formData.justification}
                onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                required
                placeholder="Explain why this position is needed..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Requisition</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
