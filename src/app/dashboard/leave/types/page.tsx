'use client';

import { useState } from 'react';
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
import { Plus, Pencil, Trash2, Calendar, CheckCircle2 } from 'lucide-react';

interface LeaveType {
  id: string;
  code: string;
  name: string;
  annual_days: number;
  carry_forward: boolean;
  requires_approval: boolean;
  paid: boolean;
  color: string;
  is_active: boolean;
}

const sampleLeaveTypes: LeaveType[] = [
  {
    id: '1',
    code: 'AL',
    name: 'Annual Leave',
    annual_days: 20,
    carry_forward: true,
    requires_approval: true,
    paid: true,
    color: 'bg-blue-500',
    is_active: true,
  },
  {
    id: '2',
    code: 'SL',
    name: 'Sick Leave',
    annual_days: 15,
    carry_forward: false,
    requires_approval: false,
    paid: true,
    color: 'bg-red-500',
    is_active: true,
  },
  {
    id: '3',
    code: 'ML',
    name: 'Maternity Leave',
    annual_days: 84,
    carry_forward: false,
    requires_approval: true,
    paid: true,
    color: 'bg-pink-500',
    is_active: true,
  },
  {
    id: '4',
    code: 'PL',
    name: 'Paternity Leave',
    annual_days: 14,
    carry_forward: false,
    requires_approval: true,
    paid: true,
    color: 'bg-cyan-500',
    is_active: true,
  },
  {
    id: '5',
    code: 'SB',
    name: 'Sabbatical Leave',
    annual_days: 0,
    carry_forward: false,
    requires_approval: true,
    paid: false,
    color: 'bg-purple-500',
    is_active: true,
  },
  {
    id: '6',
    code: 'CL',
    name: 'Compassionate Leave',
    annual_days: 5,
    carry_forward: false,
    requires_approval: true,
    paid: true,
    color: 'bg-gray-500',
    is_active: true,
  },
  {
    id: '7',
    code: 'STU',
    name: 'Study Leave',
    annual_days: 0,
    carry_forward: false,
    requires_approval: true,
    paid: false,
    color: 'bg-green-500',
    is_active: true,
  },
];

export default function LeaveTypesPage() {
  const [leaveTypes] = useState<LeaveType[]>(sampleLeaveTypes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    annual_days: '',
    carry_forward: true,
    requires_approval: true,
    paid: true,
  });

  const handleAdd = () => {
    setEditingType(null);
    setFormData({
      code: '',
      name: '',
      annual_days: '',
      carry_forward: true,
      requires_approval: true,
      paid: true,
    });
    setDialogOpen(true);
  };

  const handleEdit = (leaveType: LeaveType) => {
    setEditingType(leaveType);
    setFormData({
      code: leaveType.code,
      name: leaveType.name,
      annual_days: leaveType.annual_days.toString(),
      carry_forward: leaveType.carry_forward,
      requires_approval: leaveType.requires_approval,
      paid: leaveType.paid,
    });
    setDialogOpen(true);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Types</h1>
            <p className="text-gray-600 mt-1">Configure available leave types and entitlements</p>
          </div>
          <Button onClick={handleAdd} className="bg-[#008751] hover:bg-[#006641]">
            <Plus className="h-4 w-4 mr-2" />
            Add Leave Type
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leave Types</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveTypes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Leave Types</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-[#008751]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leaveTypes.filter(t => t.paid).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Annual Entitlement</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveTypes.filter(t => t.paid && t.annual_days > 0).reduce((sum, t) => sum + t.annual_days, 0)} days
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leaveTypes.map((leaveType) => (
          <Card key={leaveType.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-4 h-4 rounded ${leaveType.color}`} />
                    <h3 className="font-semibold text-lg">{leaveType.name}</h3>
                  </div>
                  <Badge variant="outline">{leaveType.code}</Badge>
                  {leaveType.is_active && (
                    <Badge className="bg-green-100 text-green-800 ml-2">Active</Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(leaveType)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Annual Entitlement</span>
                  <span className="font-semibold">
                    {leaveType.annual_days > 0 ? `${leaveType.annual_days} days` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Paid Leave</span>
                  {leaveType.paid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Requires Approval</span>
                  {leaveType.requires_approval ? (
                    <CheckCircle2 className="h-5 w-5 text-[#008751]" />
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Carry Forward</span>
                  {leaveType.carry_forward ? (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  ) : (
                    <span className="text-sm text-gray-400">No</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit Leave Type' : 'Add Leave Type'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Leave Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g., AL"
                />
              </div>
              <div>
                <Label htmlFor="annual_days">Annual Entitlement (Days)</Label>
                <Input
                  id="annual_days"
                  type="number"
                  value={formData.annual_days}
                  onChange={(e) => setFormData({ ...formData, annual_days: e.target.value })}
                  placeholder="20"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">Leave Type Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Annual Leave"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Paid Leave</Label>
                <input
                  type="checkbox"
                  checked={formData.paid}
                  onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Requires Approval</Label>
                <input
                  type="checkbox"
                  checked={formData.requires_approval}
                  onChange={(e) => setFormData({ ...formData, requires_approval: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Allow Carry Forward</Label>
                <input
                  type="checkbox"
                  checked={formData.carry_forward}
                  onChange={(e) => setFormData({ ...formData, carry_forward: e.target.checked })}
                  className="h-5 w-5"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-[#008751] hover:bg-[#006641]">
                {editingType ? 'Update' : 'Create'} Leave Type
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
