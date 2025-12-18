'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User
} from 'lucide-react'

const leaveRequests = [
  {
    id: 'LV001',
    employeeName: 'Dr. John Kila',
    employeeId: 'UNRE-2020-001',
    department: 'Faculty of Environmental Sciences',
    leaveType: 'Annual Leave',
    startDate: '2025-12-20',
    endDate: '2025-12-24',
    days: 5,
    reason: 'Family vacation during Christmas holidays',
    status: 'pending',
    appliedDate: '2025-12-01'
  },
  {
    id: 'LV002',
    employeeName: 'Sarah Puka',
    employeeId: 'UNRE-2021-045',
    department: 'Administrative Services',
    leaveType: 'Sick Leave',
    startDate: '2025-12-06',
    endDate: '2025-12-07',
    days: 2,
    reason: 'Medical appointment and recovery',
    status: 'pending',
    appliedDate: '2025-12-05'
  },
  {
    id: 'LV003',
    employeeName: 'Prof. Mary Tone',
    employeeId: 'UNRE-2018-012',
    department: 'Faculty of Natural Resources',
    leaveType: 'Conference Leave',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    days: 3,
    reason: 'Attending International Environmental Conference in Australia',
    status: 'approved',
    appliedDate: '2025-11-28',
    approvedBy: 'Dean of Faculty'
  },
  {
    id: 'LV004',
    employeeName: 'David Kama',
    employeeId: 'UNRE-2022-078',
    department: 'IT Department',
    leaveType: 'Annual Leave',
    startDate: '2025-12-15',
    endDate: '2025-12-19',
    days: 5,
    reason: 'Personal time off',
    status: 'approved',
    appliedDate: '2025-11-25',
    approvedBy: 'IT Manager'
  },
  {
    id: 'LV005',
    employeeName: 'Grace Namu',
    employeeId: 'UNRE-2019-034',
    department: 'Faculty of Agriculture',
    leaveType: 'Study Leave',
    startDate: '2025-11-28',
    endDate: '2025-11-30',
    days: 3,
    reason: 'Attending workshop on sustainable farming',
    status: 'rejected',
    appliedDate: '2025-11-20',
    rejectedReason: 'Insufficient notice period'
  },
]

const leaveTypes = [
  { name: 'Annual Leave', color: 'bg-blue-100 text-blue-700', balance: 15 },
  { name: 'Sick Leave', color: 'bg-red-100 text-red-700', balance: 10 },
  { name: 'Study Leave', color: 'bg-purple-100 text-purple-700', balance: 5 },
  { name: 'Conference Leave', color: 'bg-green-100 text-green-700', balance: 7 },
  { name: 'Sabbatical Leave', color: 'bg-amber-100 text-amber-700', balance: 0 },
]

export default function LeavePage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filteredRequests = filter === 'all'
    ? leaveRequests
    : leaveRequests.filter(req => req.status === filter)

  const pendingCount = leaveRequests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-blue-600">Leave Management</h1>
                <p className="text-xs text-muted-foreground">{pendingCount} pending requests</p>
              </div>
            </div>
            <Link href="/dashboard/leave/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                New Leave Request
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Leave Balances */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Leave Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {leaveTypes.map((type) => (
                <div key={type.name} className="text-center p-4 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-2">{type.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{type.balance}</p>
                  <p className="text-xs text-gray-500 mt-1">days available</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-blue-600' : ''}
          >
            All Requests ({leaveRequests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
            className={filter === 'pending' ? 'bg-orange-600' : ''}
          >
            Pending ({leaveRequests.filter(r => r.status === 'pending').length})
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
            className={filter === 'approved' ? 'bg-green-600' : ''}
          >
            Approved ({leaveRequests.filter(r => r.status === 'approved').length})
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
            className={filter === 'rejected' ? 'bg-red-600' : ''}
          >
            Rejected ({leaveRequests.filter(r => r.status === 'rejected').length})
          </Button>
        </div>

        {/* Leave Requests List */}
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.employeeName}</h3>
                      <p className="text-sm text-gray-600">{request.department}</p>
                      <p className="text-xs text-gray-500 mt-1">ID: {request.employeeId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      request.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      request.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {request.status === 'pending' && <Clock className="inline h-4 w-4 mr-1" />}
                      {request.status === 'approved' && <CheckCircle className="inline h-4 w-4 mr-1" />}
                      {request.status === 'rejected' && <XCircle className="inline h-4 w-4 mr-1" />}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Leave Type</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        leaveTypes.find(t => t.name === request.leaveType)?.color
                      }`}>
                        {request.leaveType}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Duration</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {new Date(request.startDate).toLocaleDateString('en-PG')} - {new Date(request.endDate).toLocaleDateString('en-PG')}
                        </span>
                        <span className="text-sm text-gray-600">({request.days} days)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Reason</p>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Applied Date</p>
                      <p className="text-sm font-medium">{new Date(request.appliedDate).toLocaleDateString('en-PG')}</p>
                    </div>
                    {request.status === 'approved' && request.approvedBy && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Approved By</p>
                        <p className="text-sm font-medium text-green-700">{request.approvedBy}</p>
                      </div>
                    )}
                    {request.status === 'rejected' && request.rejectedReason && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Rejection Reason</p>
                        <p className="text-sm font-medium text-red-700">{request.rejectedReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No leave requests found</p>
              <p className="text-gray-400">Try adjusting your filters</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
