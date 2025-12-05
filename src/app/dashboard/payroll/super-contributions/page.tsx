'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, DollarSign, Users, Calendar, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SuperContribution {
  id: string
  employee_id: string
  super_scheme_id: string
  contribution_period: string
  employer_contribution: number
  employee_contribution: number | null
  total_contribution: number
  payment_date: string | null
  status: 'pending' | 'approved' | 'paid'
  created_at: string
  employees?: {
    employee_id: string
    first_name: string
    last_name: string
  }
  super_schemes?: {
    scheme_code: string
    scheme_name: string
  }
}

export default function SuperContributionsPage() {
  const [contributions, setContributions] = useState<SuperContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const supabase = createClient()

  useEffect(() => {
    loadContributions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadContributions() {
    setLoading(true)
    const { data, error } = await supabase
      .from('super_contributions')
      .select(`
        *,
        employees (
          employee_id,
          first_name,
          last_name
        ),
        super_schemes (
          scheme_code,
          scheme_name
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading contributions:', error)
      toast.error('Failed to load contributions')
    } else {
      setContributions(data || [])
    }
    setLoading(false)
  }

  const filteredContributions = contributions.filter(c => {
    const matchesSearch = searchTerm === '' ||
      c.employees?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employees?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employees?.employee_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter

    return matchesSearch && matchesStatus
  })

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
  }

  const totalEmployer = contributions.reduce((sum, c) => sum + c.employer_contribution, 0)
  const totalEmployee = contributions.reduce((sum, c) => sum + (c.employee_contribution || 0), 0)
  const totalContributions = totalEmployer + totalEmployee

  if (loading) {
    return <div className="text-center py-12">Loading contributions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Superannuation Contributions</h1>
          <p className="text-gray-600 mt-2">Track employer and employee super contributions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contributions</p>
              <p className="text-2xl font-bold mt-1">{contributions.length}</p>
            </div>
            <Users className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employer Total</p>
              <p className="text-2xl font-bold mt-1 text-green-600">
                {formatCurrency(totalEmployer)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Employee Total</p>
              <p className="text-2xl font-bold mt-1 text-blue-600">
                {formatCurrency(totalEmployee)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Grand Total</p>
              <p className="text-2xl font-bold mt-1 text-purple-600">
                {formatCurrency(totalContributions)}
              </p>
            </div>
            <Calendar className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by employee name or ID..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Super Scheme
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Payment Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'No contributions found matching your filters.'
                      : 'No contributions recorded yet. Process payroll to generate contributions.'}
                  </td>
                </tr>
              ) : (
                filteredContributions.map((contrib) => (
                  <tr key={contrib.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contrib.employees?.first_name} {contrib.employees?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contrib.employees?.employee_id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium">
                          {contrib.super_schemes?.scheme_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contrib.super_schemes?.scheme_code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contrib.contribution_period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      {formatCurrency(contrib.employer_contribution)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {contrib.employee_contribution ? formatCurrency(contrib.employee_contribution) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-purple-600">
                      {formatCurrency(contrib.total_contribution)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={statusColors[contrib.status]}>
                        {contrib.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {contrib.payment_date ? new Date(contrib.payment_date).toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-green-50 border-green-200">
        <h3 className="font-semibold text-green-900 mb-3">PNG Superannuation Information</h3>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Employer Contribution:</strong> 8.4% of gross salary (statutory)</p>
          <p><strong>Employee Contribution:</strong> Voluntary (optional)</p>
          <p><strong>Payment Frequency:</strong> Monthly or Fortnightly</p>
          <p><strong>Main Schemes:</strong> Nambawan Super, NASFUND</p>
          <p className="mt-3 font-semibold">
            Contributions are automatically calculated during payroll processing.
          </p>
        </div>
      </Card>
    </div>
  )
}
