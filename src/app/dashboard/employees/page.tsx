'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react'

// Sample employee data
const sampleEmployees = [
  {
    id: '001',
    name: 'Dr. John Kila',
    email: 'j.kila@unre.ac.pg',
    phone: '+675 7123 4567',
    employeeId: 'UNRE-2020-001',
    department: 'Faculty of Environmental Sciences',
    position: 'Senior Lecturer',
    employmentType: 'Full-time Academic',
    salary: 85000,
    hireDate: '2020-01-15',
    status: 'active'
  },
  {
    id: '002',
    name: 'Sarah Puka',
    email: 's.puka@unre.ac.pg',
    phone: '+675 7234 5678',
    employeeId: 'UNRE-2021-045',
    department: 'Administrative Services',
    position: 'HR Officer',
    employmentType: 'Full-time Administrative',
    salary: 55000,
    hireDate: '2021-03-10',
    status: 'active'
  },
  {
    id: '003',
    name: 'Prof. Mary Tone',
    email: 'm.tone@unre.ac.pg',
    phone: '+675 7345 6789',
    employeeId: 'UNRE-2018-012',
    department: 'Faculty of Natural Resources',
    position: 'Professor',
    employmentType: 'Full-time Academic',
    salary: 110000,
    hireDate: '2018-08-01',
    status: 'active'
  },
  {
    id: '004',
    name: 'David Kama',
    email: 'd.kama@unre.ac.pg',
    phone: '+675 7456 7890',
    employeeId: 'UNRE-2022-078',
    department: 'IT Department',
    position: 'Systems Administrator',
    employmentType: 'Full-time Technical',
    salary: 62000,
    hireDate: '2022-05-20',
    status: 'active'
  },
  {
    id: '005',
    name: 'Grace Namu',
    email: 'g.namu@unre.ac.pg',
    phone: '+675 7567 8901',
    employeeId: 'UNRE-2019-034',
    department: 'Faculty of Agriculture',
    position: 'Assistant Lecturer',
    employmentType: 'Full-time Academic',
    salary: 68000,
    hireDate: '2019-11-01',
    status: 'active'
  },
]

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const filteredEmployees = sampleEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || emp.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const departments = ['all', ...Array.from(new Set(sampleEmployees.map(e => e.department)))]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
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
                <h1 className="text-xl font-bold text-primary">Employee Management</h1>
                <p className="text-xs text-muted-foreground">{filteredEmployees.length} employees</p>
              </div>
            </div>
            <Link href="/dashboard/employees/new">
              <Button className="bg-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or employee ID..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Employee List */}
        <div className="grid gap-4">
          {filteredEmployees.map((employee) => (
            <Card key={employee.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 flex-1">
                    {/* Avatar */}
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-primary">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.position}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          {employee.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span className="font-medium">ID:</span> {employee.employeeId}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4 text-primary" />
                            {employee.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4 text-primary" />
                            {employee.phone}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4 text-primary" />
                            {employee.department}
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Employment Type:</span>
                            <span className="ml-2 font-medium">{employee.employmentType}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Hire Date:</span>
                            <span className="ml-2 font-medium">
                              {new Date(employee.hireDate).toLocaleDateString('en-PG', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" variant="outline">Edit</Button>
                        <Button size="sm" variant="outline">Salary Slip</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEmployees.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <p className="text-gray-500 text-lg mb-4">No employees found</p>
              <p className="text-gray-400 mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedDepartment('all'); }}>
                Clear Filters
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
