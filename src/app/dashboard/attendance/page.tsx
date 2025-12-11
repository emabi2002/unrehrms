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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface AttendanceRecord {
  id: string
  date: string
  employeeId: string
  employeeName: string
  department: string
  checkIn: string | null
  checkOut: string | null
  status: 'present' | 'late' | 'absent' | 'half_day'
}

const attendanceRecords: AttendanceRecord[] = [
  {
    id: 'DEMO/ATT/000001',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000001',
    employeeName: 'John Kila',
    department: 'Environmental Sciences',
    checkIn: '08:15 AM',
    checkOut: '05:30 PM',
    status: 'present'
  },
  {
    id: 'DEMO/ATT/000002',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000002',
    employeeName: 'Sarah Puka',
    department: 'Administrative Services',
    checkIn: '09:15 AM',
    checkOut: '06:00 PM',
    status: 'late'
  },
  {
    id: 'DEMO/ATT/000003',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000003',
    employeeName: 'Mary Tone',
    department: 'Natural Resources',
    checkIn: '08:00 AM',
    checkOut: '05:15 PM',
    status: 'present'
  },
  {
    id: 'DEMO/ATT/000004',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000004',
    employeeName: 'David Kama',
    department: 'IT Department',
    checkIn: '08:30 AM',
    checkOut: null,
    status: 'present'
  },
  {
    id: 'DEMO/ATT/000005',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000005',
    employeeName: 'Grace Namu',
    department: 'Agriculture',
    checkIn: null,
    checkOut: null,
    status: 'absent'
  },
  {
    id: 'DEMO/ATT/000006',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000006',
    employeeName: 'Peter Wau',
    department: 'Finance',
    checkIn: '08:10 AM',
    checkOut: '01:00 PM',
    status: 'half_day'
  },
  {
    id: 'DEMO/ATT/000007',
    date: '15-12-2025',
    employeeId: 'DEMO/EMP/000007',
    employeeName: 'Anna Bola',
    department: 'Environmental Sciences',
    checkIn: '08:05 AM',
    checkOut: '05:20 PM',
    status: 'present'
  },
]

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [attendance, setAttendance] = useState(attendanceRecords)
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredAttendance = attendance.filter(record => {
    const search = searchTerm.toLowerCase()
    return record.employeeName.toLowerCase().includes(search) ||
           record.employeeId.toLowerCase().includes(search) ||
           record.department.toLowerCase().includes(search)
  })

  const totalPages = Math.ceil(filteredAttendance.length / Number.parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage)
  const endIndex = startIndex + Number.parseInt(entriesPerPage)
  const currentAttendance = filteredAttendance.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500'
      case 'late':
        return 'bg-yellow-500'
      case 'absent':
        return 'bg-red-500'
      case 'half_day':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Tracking</h1>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-sm text-gray-600">Half Day</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Absent</span>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Record ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check In</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check Out</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentAttendance.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.employeeId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.checkIn || '--'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{record.checkOut || '--'}</td>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded ${getStatusColor(record.status)}`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Eye className="h-4 w-4" />
                      </button>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredAttendance.length)} of {filteredAttendance.length} entries
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
