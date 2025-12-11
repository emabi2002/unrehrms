'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Edit,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface LeaveRequest {
  id: string
  employeeName: string
  employeeId: string
  department: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  appliedDate: string
}

const leaveRequests: LeaveRequest[] = [
  {
    id: 'DEMO/LV/000001',
    employeeName: 'John Kila',
    employeeId: 'DEMO/EMP/000001',
    department: 'Environmental Sciences',
    leaveType: 'Annual Leave',
    startDate: '2025-12-20',
    endDate: '2025-12-24',
    days: 5,
    reason: 'Family vacation during Christmas',
    status: 'pending',
    appliedDate: '01-12-2025'
  },
  {
    id: 'DEMO/LV/000002',
    employeeName: 'Sarah Puka',
    employeeId: 'DEMO/EMP/000002',
    department: 'Administrative Services',
    leaveType: 'Sick Leave',
    startDate: '2025-12-06',
    endDate: '2025-12-07',
    days: 2,
    reason: 'Medical appointment',
    status: 'pending',
    appliedDate: '05-12-2025'
  },
  {
    id: 'DEMO/LV/000003',
    employeeName: 'Mary Tone',
    employeeId: 'DEMO/EMP/000003',
    department: 'Natural Resources',
    leaveType: 'Conference',
    startDate: '2025-12-10',
    endDate: '2025-12-12',
    days: 3,
    reason: 'International Environmental Conference',
    status: 'approved',
    appliedDate: '28-11-2025'
  },
  {
    id: 'DEMO/LV/000004',
    employeeName: 'David Kama',
    employeeId: 'DEMO/EMP/000004',
    department: 'IT Department',
    leaveType: 'Annual Leave',
    startDate: '2025-12-15',
    endDate: '2025-12-19',
    days: 5,
    reason: 'Personal time off',
    status: 'approved',
    appliedDate: '25-11-2025'
  },
  {
    id: 'DEMO/LV/000005',
    employeeName: 'Grace Namu',
    employeeId: 'DEMO/EMP/000005',
    department: 'Agriculture',
    leaveType: 'Study Leave',
    startDate: '2025-11-28',
    endDate: '2025-11-30',
    days: 3,
    reason: 'Attend training workshop',
    status: 'rejected',
    appliedDate: '20-11-2025'
  },
  {
    id: 'DEMO/LV/000006',
    employeeName: 'Peter Wau',
    employeeId: 'DEMO/EMP/000006',
    department: 'Finance',
    leaveType: 'Sick Leave',
    startDate: '2025-12-08',
    endDate: '2025-12-09',
    days: 2,
    reason: 'Medical treatment',
    status: 'pending',
    appliedDate: '07-12-2025'
  },
  {
    id: 'DEMO/LV/000007',
    employeeName: 'Anna Bola',
    employeeId: 'DEMO/EMP/000007',
    department: 'Environmental Sciences',
    leaveType: 'Annual Leave',
    startDate: '2025-12-18',
    endDate: '2025-12-20',
    days: 3,
    reason: 'Personal matters',
    status: 'approved',
    appliedDate: '02-12-2025'
  },
]

export default function LeavePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [leaves, setLeaves] = useState(leaveRequests)
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredLeaves = leaves.filter(leave => {
    const search = searchTerm.toLowerCase()
    return leave.employeeName.toLowerCase().includes(search) ||
           leave.employeeId.toLowerCase().includes(search) ||
           leave.leaveType.toLowerCase().includes(search) ||
           leave.department.toLowerCase().includes(search)
  })

  const totalPages = Math.ceil(filteredLeaves.length / Number.parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage)
  const endIndex = startIndex + Number.parseInt(entriesPerPage)
  const currentLeaves = filteredLeaves.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500'
      case 'pending':
        return 'bg-yellow-500'
      case 'rejected':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleApprove = (leaveId: string) => {
    setLeaves(prev => prev.map(leave =>
      leave.id === leaveId ? { ...leave, status: 'approved' as const } : leave
    ))
    toast.success('Leave request approved')
  }

  const handleReject = (leaveId: string) => {
    setLeaves(prev => prev.map(leave =>
      leave.id === leaveId ? { ...leave, status: 'rejected' as const } : leave
    ))
    toast.error('Leave request rejected')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Rejected</span>
              </div>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <Input
              type="text"
              placeholder=""
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Leave Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Days</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentLeaves.map((leave, index) => (
                <tr
                  key={leave.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.appliedDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.leaveType}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{leave.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.startDate} to {leave.endDate}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{leave.days}</td>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded ${getStatusColor(leave.status)}`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {leave.status === 'pending' && (
                        <>
                          <button
                            className="text-green-600 hover:text-green-800"
                            onClick={() => handleApprove(leave.id)}
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleReject(leave.id)}
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredLeaves.length)} of {filteredLeaves.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
