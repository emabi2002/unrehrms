'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar, TrendingUp } from 'lucide-react';

interface LeaveBalance {
  employee_id: string;
  employee_name: string;
  employee_number: string;
  department: string;
  leave_type: string;
  entitled: number;
  used: number;
  pending: number;
  available: number;
}

const sampleBalances: LeaveBalance[] = [
  {
    employee_id: '1',
    employee_name: 'John Kila',
    employee_number: 'UNRE-2020-001',
    department: 'Environmental Sciences',
    leave_type: 'Annual Leave',
    entitled: 20,
    used: 8,
    pending: 2,
    available: 10,
  },
  {
    employee_id: '1',
    employee_name: 'John Kila',
    employee_number: 'UNRE-2020-001',
    department: 'Environmental Sciences',
    leave_type: 'Sick Leave',
    entitled: 15,
    used: 3,
    pending: 0,
    available: 12,
  },
  {
    employee_id: '2',
    employee_name: 'Mary Tone',
    employee_number: 'UNRE-2019-045',
    department: 'Natural Resources',
    leave_type: 'Annual Leave',
    entitled: 20,
    used: 15,
    pending: 0,
    available: 5,
  },
  {
    employee_id: '2',
    employee_name: 'Mary Tone',
    employee_number: 'UNRE-2019-045',
    department: 'Natural Resources',
    leave_type: 'Sick Leave',
    entitled: 15,
    used: 0,
    pending: 0,
    available: 15,
  },
  {
    employee_id: '3',
    employee_name: 'Grace Namu',
    employee_number: 'UNRE-2021-089',
    department: 'Agriculture',
    leave_type: 'Annual Leave',
    entitled: 20,
    used: 5,
    pending: 5,
    available: 10,
  },
];

export default function LeaveBalancesPage() {
  const [balances] = useState<LeaveBalance[]>(sampleBalances);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBalances = balances.filter(
    (balance) =>
      balance.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      balance.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      balance.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by employee
  const groupedBalances = filteredBalances.reduce((acc, balance) => {
    const key = balance.employee_id;
    if (!acc[key]) {
      acc[key] = {
        employee_name: balance.employee_name,
        employee_number: balance.employee_number,
        department: balance.department,
        balances: [],
      };
    }
    acc[key].balances.push(balance);
    return acc;
  }, {} as any);

  const totalEntitled = balances.reduce((sum, b) => sum + b.entitled, 0);
  const totalUsed = balances.reduce((sum, b) => sum + b.used, 0);
  const totalAvailable = balances.reduce((sum, b) => sum + b.available, 0);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Balances</h1>
            <p className="text-gray-600 mt-1">View employee leave entitlements and usage</p>
          </div>
          <Button className="bg-[#008751] hover:bg-[#006641]">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Entitled</CardTitle>
            <Calendar className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEntitled} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
            <Badge className="bg-red-100 text-red-800">{totalUsed}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Badge className="bg-green-100 text-green-800">{totalAvailable}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAvailable} days</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((totalUsed / totalEntitled) * 100)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by employee name, number, or department..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Balances by Employee */}
      <div className="space-y-6">
        {Object.values(groupedBalances).map((group: any) => (
          <Card key={group.employee_number}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{group.employee_name}</h3>
                  <p className="text-sm text-gray-600">
                    {group.employee_number} • {group.department}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.balances.map((balance: LeaveBalance, idx: number) => (
                  <div key={idx} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{balance.leave_type}</h4>
                      <Badge variant="outline">
                        {balance.available}/{balance.entitled} days available
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute h-full bg-red-500"
                          style={{ width: `${(balance.used / balance.entitled) * 100}%` }}
                        />
                        <div
                          className="absolute h-full bg-yellow-500"
                          style={{
                            left: `${(balance.used / balance.entitled) * 100}%`,
                            width: `${(balance.pending / balance.entitled) * 100}%`,
                          }}
                        />
                        <div
                          className="absolute h-full bg-green-500"
                          style={{
                            left: `${((balance.used + balance.pending) / balance.entitled) * 100}%`,
                            width: `${(balance.available / balance.entitled) * 100}%`,
                          }}
                        />
                      </div>
                      {/* Legend */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded" />
                          <span>Used: {balance.used}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded" />
                          <span>Pending: {balance.pending}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded" />
                          <span>Available: {balance.available}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
