'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  UserCog,
  DollarSign,
  TrendingUp
} from 'lucide-react'

const sampleDepartments = [
  {
    id: '1',
    name: 'Faculty of Environmental Sciences',
    code: 'FES',
    head: 'Dr. John Kila',
    employees: 45,
    budget: 850000,
    description: 'Research and teaching in environmental sustainability, climate change, and conservation'
  },
  {
    id: '2',
    name: 'Faculty of Natural Resources',
    code: 'FNR',
    head: 'Prof. Mary Tone',
    employees: 52,
    budget: 920000,
    description: 'Forestry, wildlife management, and natural resource conservation'
  },
  {
    id: '3',
    name: 'Faculty of Agriculture',
    code: 'FAG',
    head: 'Dr. Grace Namu',
    employees: 38,
    budget: 780000,
    description: 'Sustainable agriculture, crop science, and food security research'
  },
  {
    id: '4',
    name: 'Administrative Services',
    code: 'ADM',
    head: 'Sarah Puka',
    employees: 65,
    budget: 650000,
    description: 'Human resources, finance, procurement, and general administration'
  },
  {
    id: '5',
    name: 'IT Department',
    code: 'IT',
    head: 'David Kama',
    employees: 18,
    budget: 420000,
    description: 'Information systems, network infrastructure, and technical support'
  },
  {
    id: '6',
    name: 'Student Services',
    code: 'STU',
    head: 'Michael Wari',
    employees: 28,
    budget: 380000,
    description: 'Student affairs, counseling, career services, and campus life'
  },
  {
    id: '7',
    name: 'Research & Development',
    code: 'R&D',
    head: 'Dr. Patricia Luma',
    employees: 22,
    budget: 680000,
    description: 'Research grants, innovation projects, and academic publications'
  },
  {
    id: '8',
    name: 'Library Services',
    code: 'LIB',
    head: 'James Kora',
    employees: 15,
    budget: 320000,
    description: 'Academic resources, digital library, and research support'
  }
]

export default function DepartmentsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedDept, setSelectedDept] = useState<typeof sampleDepartments[0] | null>(null)

  const totalEmployees = sampleDepartments.reduce((sum, d) => sum + d.employees, 0)
  const totalBudget = sampleDepartments.reduce((sum, d) => sum + d.budget, 0)

  const formatCurrency = (amount: number) => {
    return `K${(amount / 1000).toFixed(0)}k`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
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
                <h1 className="text-xl font-bold text-amber-600">Departments</h1>
                <p className="text-xs text-muted-foreground">{sampleDepartments.length} departments</p>
              </div>
            </div>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Department
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Departments</p>
                  <p className="text-3xl font-bold text-amber-600">{sampleDepartments.length}</p>
                </div>
                <Building2 className="h-10 w-10 text-amber-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                  <p className="text-3xl font-bold text-blue-600">{totalEmployees}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Budget</p>
                  <p className="text-3xl font-bold text-green-600">{formatCurrency(totalBudget)}</p>
                </div>
                <DollarSign className="h-10 w-10 text-green-500/20" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg Staff/Dept</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Math.round(totalEmployees / sampleDepartments.length)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Departments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sampleDepartments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg mb-1">{dept.name}</CardTitle>
                      <p className="text-sm text-gray-600">Code: {dept.code}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedDept(dept)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{dept.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Department Head</p>
                      <p className="text-sm font-medium">{dept.head}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Total Staff</p>
                      <p className="text-sm font-medium">{dept.employees} employees</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Annual Budget</span>
                    <span className="text-lg font-bold text-amber-600">
                      {formatCurrency(dept.budget)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Staff
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
