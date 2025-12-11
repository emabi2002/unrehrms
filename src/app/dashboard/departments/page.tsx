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
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Department {
  id: string
  code: string
  name: string
  head: string
  employees: number
  budget: number
  description: string
  status: 'active' | 'inactive'
}

const sampleDepartments: Department[] = [
  {
    id: 'DEMO/DEPT/000001',
    code: 'FES',
    name: 'Environmental Sciences',
    head: 'Dr. John Kila',
    employees: 45,
    budget: 850000,
    description: 'Environmental sustainability and conservation',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000002',
    code: 'FNR',
    name: 'Natural Resources',
    head: 'Prof. Mary Tone',
    employees: 52,
    budget: 920000,
    description: 'Forestry and wildlife management',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000003',
    code: 'FAG',
    name: 'Agriculture',
    head: 'Dr. Grace Namu',
    employees: 38,
    budget: 780000,
    description: 'Sustainable agriculture and food security',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000004',
    code: 'ADM',
    name: 'Administrative Services',
    head: 'Sarah Puka',
    employees: 65,
    budget: 650000,
    description: 'HR, finance, and administration',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000005',
    code: 'IT',
    name: 'IT Department',
    head: 'David Kama',
    employees: 18,
    budget: 420000,
    description: 'Information systems and technical support',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000006',
    code: 'STU',
    name: 'Student Services',
    head: 'Michael Wari',
    employees: 28,
    budget: 380000,
    description: 'Student affairs and counseling',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000007',
    code: 'R&D',
    name: 'Research & Development',
    head: 'Dr. Patricia Luma',
    employees: 22,
    budget: 680000,
    description: 'Research grants and innovation',
    status: 'active'
  },
  {
    id: 'DEMO/DEPT/000008',
    code: 'LIB',
    name: 'Library Services',
    head: 'James Kora',
    employees: 15,
    budget: 320000,
    description: 'Academic resources and digital library',
    status: 'inactive'
  },
]

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [departments, setDepartments] = useState(sampleDepartments)
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredDepartments = departments.filter(dept => {
    const search = searchTerm.toLowerCase()
    return dept.name.toLowerCase().includes(search) ||
           dept.code.toLowerCase().includes(search) ||
           dept.head.toLowerCase().includes(search) ||
           dept.description.toLowerCase().includes(search)
  })

  const totalPages = Math.ceil(filteredDepartments.length / Number.parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage)
  const endIndex = startIndex + Number.parseInt(entriesPerPage)
  const currentDepartments = filteredDepartments.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatCurrency = (amount: number) => {
    return `K${(amount / 1000).toFixed(0)}k`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Department Management</h1>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Inactive</span>
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Department Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Head of Department</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employees</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Budget</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDepartments.map((dept, index) => (
                <tr
                  key={dept.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{dept.code}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{dept.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dept.head}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{dept.employees}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatCurrency(dept.budget)}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{dept.description}</td>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded ${getStatusColor(dept.status)}`}></div>
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredDepartments.length)} of {filteredDepartments.length} entries
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
