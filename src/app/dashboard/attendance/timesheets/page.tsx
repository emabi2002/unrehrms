'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Download, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface TimesheetEntry {
  id: string;
  employee_name: string;
  employee_number: string;
  week_ending: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

const sampleTimesheets: TimesheetEntry[] = [
  {
    id: '1',
    employee_name: 'John Kila',
    employee_number: 'UNRE-2020-001',
    week_ending: '2025-12-19',
    regular_hours: 40,
    overtime_hours: 5,
    total_hours: 45,
    status: 'approved',
  },
  {
    id: '2',
    employee_name: 'Mary Tone',
    employee_number: 'UNRE-2019-045',
    week_ending: '2025-12-19',
    regular_hours: 40,
    overtime_hours: 0,
    total_hours: 40,
    status: 'approved',
  },
  {
    id: '3',
    employee_name: 'Grace Namu',
    employee_number: 'UNRE-2021-089',
    week_ending: '2025-12-19',
    regular_hours: 35,
    overtime_hours: 8,
    total_hours: 43,
    status: 'submitted',
  },
  {
    id: '4',
    employee_name: 'David Kama',
    employee_number: 'UNRE-2020-112',
    week_ending: '2025-12-19',
    regular_hours: 38,
    overtime_hours: 0,
    total_hours: 38,
    status: 'draft',
  },
];

export default function TimesheetsPage() {
  const [timesheets] = useState<TimesheetEntry[]>(sampleTimesheets);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTimesheets = timesheets.filter(
    (ts) => statusFilter === 'all' || ts.status === statusFilter
  );

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const totalRegularHours = filteredTimesheets.reduce((sum, ts) => sum + ts.regular_hours, 0);
  const totalOvertimeHours = filteredTimesheets.reduce((sum, ts) => sum + ts.overtime_hours, 0);
  const totalHours = filteredTimesheets.reduce((sum, ts) => sum + ts.total_hours, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Timesheets</h1>
            <p className="text-gray-600 mt-1">Track and approve employee work hours</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-[#008751] hover:bg-[#006641]">
              <Plus className="h-4 w-4 mr-2" />
              New Timesheet
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Regular Hours</CardTitle>
            <Clock className="h-4 w-4 text-[#008751]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegularHours} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overtime Hours</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOvertimeHours} hrs</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timesheets.filter((ts) => ts.status === 'approved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input type="date" className="w-48" placeholder="Week ending" />
          </div>
        </CardContent>
      </Card>

      {/* Timesheets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Timesheet Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Employee</th>
                  <th className="text-left p-3 font-semibold">Employee #</th>
                  <th className="text-left p-3 font-semibold">Week Ending</th>
                  <th className="text-right p-3 font-semibold">Regular Hours</th>
                  <th className="text-right p-3 font-semibold">Overtime</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-right p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{timesheet.employee_name}</td>
                    <td className="p-3 text-sm text-gray-600">{timesheet.employee_number}</td>
                    <td className="p-3">
                      {new Date(timesheet.week_ending).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right font-mono">{timesheet.regular_hours}h</td>
                    <td className="p-3 text-right font-mono text-orange-600">
                      {timesheet.overtime_hours}h
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {timesheet.total_hours}h
                    </td>
                    <td className="p-3">
                      <Badge className={statusColors[timesheet.status]}>
                        {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {timesheet.status === 'submitted' && (
                          <Button size="sm" className="bg-[#008751] hover:bg-[#006641]">
                            Approve
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
