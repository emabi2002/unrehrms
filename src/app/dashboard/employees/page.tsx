'use client'

import { useState, useEffect, useCallback } from 'react'
import { employeeService } from '@/lib/db-helpers'
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
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { exportEmployeesToPDF, exportEmployeesToExcel } from '@/lib/export-utils'
import toast from 'react-hot-toast'

// Sample employee data
const sampleEmployees = [
  {
    id: '001',
    first_name: 'John',
    last_name: 'Kila',
    email: 'j.kila@unre.ac.pg',
    phone: '+675 7123 4567',
    employee_id: 'DEMO/EMP/000001',
    department: 'Environmental Sciences',
    position: 'Senior Lecturer',
    employment_type: 'Full-time Academic',
    salary: 85000,
    hire_date: '2020-01-15',
    status: 'active'
  },
  {
    id: '002',
    first_name: 'Sarah',
    last_name: 'Puka',
    email: 's.puka@unre.ac.pg',
    phone: '+675 7234 5678',
    employee_id: 'DEMO/EMP/000002',
    department: 'Administrative Services',
    position: 'HR Officer',
    employment_type: 'Full-time Administrative',
    salary: 55000,
    hire_date: '2021-03-10',
    status: 'active'
  },
  {
    id: '003',
    first_name: 'Mary',
    last_name: 'Tone',
    email: 'm.tone@unre.ac.pg',
    phone: '+675 7345 6789',
    employee_id: 'DEMO/EMP/000003',
    department: 'Natural Resources',
    position: 'Professor',
    employment_type: 'Full-time Academic',
    salary: 110000,
    hire_date: '2018-08-01',
    status: 'on_leave'
  },
  {
    id: '004',
    first_name: 'David',
    last_name: 'Kama',
    email: 'd.kama@unre.ac.pg',
    phone: '+675 7456 7890',
    employee_id: 'DEMO/EMP/000004',
    department: 'IT Department',
    position: 'Systems Administrator',
    employment_type: 'Full-time Technical',
    salary: 62000,
    hire_date: '2022-05-20',
    status: 'active'
  },
  {
    id: '005',
    first_name: 'Grace',
    last_name: 'Namu',
    email: 'g.namu@unre.ac.pg',
    phone: '+675 7567 8901',
    employee_id: 'DEMO/EMP/000005',
    department: 'Agriculture',
    position: 'Assistant Lecturer',
    employment_type: 'Full-time Academic',
    salary: 68000,
    hire_date: '2019-11-01',
    status: 'active'
  },
  {
    id: '006',
    first_name: 'Peter',
    last_name: 'Wau',
    email: 'p.wau@unre.ac.pg',
    phone: '+675 7678 9012',
    employee_id: 'DEMO/EMP/000006',
    department: 'Finance',
    position: 'Finance Officer',
    employment_type: 'Full-time Administrative',
    salary: 58000,
    hire_date: '2020-07-15',
    status: 'active'
  },
  {
    id: '007',
    first_name: 'Anna',
    last_name: 'Bola',
    email: 'a.bola@unre.ac.pg',
    phone: '+675 7789 0123',
    employee_id: 'DEMO/EMP/000007',
    department: 'Environmental Sciences',
    position: 'Research Assistant',
    employment_type: 'Contract',
    salary: 45000,
    hire_date: '2023-01-10',
    status: 'active'
  },
]

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [employees, setEmployees] = useState(sampleEmployees)
  const [loading, setLoading] = useState(false)
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const loadEmployees = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await employeeService.getAll()

      if (error) {
        console.error('Error loading employees:', error)
        toast.error('Using sample data - database not connected')
        return
      }

      if (data && data.length > 0) {
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      toast.error('Using sample data - database not connected')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase()
    const search = searchTerm.toLowerCase()
    return fullName.includes(search) ||
           emp.employee_id.toLowerCase().includes(search) ||
           emp.department.toLowerCase().includes(search) ||
           emp.position.toLowerCase().includes(search)
  })

  const totalPages = Math.ceil(filteredEmployees.length / Number.parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage)
  const endIndex = startIndex + Number.parseInt(entriesPerPage)
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'on_leave':
        return 'bg-yellow-500'
      case 'terminated':
        return 'bg-red-500'
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
            <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">On Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Terminated</span>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee ID</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentEmployees.map((employee, index) => (
                <tr
                  key={employee.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.employee_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {employee.first_name} {employee.last_name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.position}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{employee.phone}</td>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded ${getStatusColor(employee.status)}`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
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
