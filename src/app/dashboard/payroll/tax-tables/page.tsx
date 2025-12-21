'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, Edit2, TrendingUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

interface TaxBracket {
  id: string
  tax_year: number
  bracket_number: number
  min_income: number
  max_income: number | null
  tax_rate: number
  base_tax: number
  is_active: boolean
}

export default function TaxTablesPage() {
  const [brackets, setBrackets] = useState<TaxBracket[]>([])
  const [selectedYear, setSelectedYear] = useState(2025)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadBrackets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear])

  async function loadBrackets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('png_tax_brackets')
      .select('*')
      .eq('tax_year', selectedYear)
      .order('bracket_number')

    if (error) {
      console.error('Error loading tax brackets:', error)
      toast.error('Failed to load tax brackets')
    } else {
      setBrackets(data || [])
    }
    setLoading(false)
  }

  async function toggleActive(bracket: TaxBracket) {
    const { error } = await supabase
      .from('png_tax_brackets')
      .update({ is_active: !bracket.is_active })
      .eq('id', bracket.id)

    if (error) {
      toast.error('Failed to update bracket')
    } else {
      toast.success(`Bracket ${bracket.is_active ? 'deactivated' : 'activated'}`)
      loadBrackets()
    }
  }

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  }

  if (loading) {
    return <div className="text-center py-12">Loading tax tables...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">PNG Tax Tables</h1>
          <p className="text-gray-600 mt-2">Manage graduated income tax brackets</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/payroll/tax-calculator">
            <Button variant="outline">
              <DollarSign className="h-4 w-4 mr-2" />
              Tax Calculator
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tax Year</p>
              <p className="text-2xl font-bold mt-1">{selectedYear}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Brackets</p>
              <p className="text-2xl font-bold mt-1">{brackets.length}</p>
            </div>
            <Plus className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Brackets</p>
              <p className="text-2xl font-bold mt-1">
                {brackets.filter(b => b.is_active).length}
              </p>
            </div>
            <Edit2 className="h-10 w-10 text-purple-600 opacity-20" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Max Rate</p>
              <p className="text-2xl font-bold mt-1">
                {Math.max(...brackets.map(b => b.tax_rate))}%
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Tax Year</h3>
          <select
            className="border rounded-md px-3 py-2"
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bracket
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Income Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Base Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Example Tax
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brackets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No tax brackets found for {selectedYear}. Import tax tables first.
                  </td>
                </tr>
              ) : (
                brackets.map((bracket) => {
                  const exampleIncome = bracket.max_income || bracket.min_income + 50000
                  const exampleTax = bracket.base_tax + ((exampleIncome - bracket.min_income) * bracket.tax_rate / 100)

                  return (
                    <tr key={bracket.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className="bg-blue-100 text-blue-800">
                          Bracket {bracket.bracket_number}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCurrency(bracket.min_income)}
                          </div>
                          <div className="text-gray-500">
                            to {bracket.max_income ? formatCurrency(bracket.max_income) : 'No limit'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-orange-600">
                          {bracket.tax_rate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold">
                          {formatCurrency(bracket.base_tax)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="text-gray-500">
                            {formatCurrency(exampleIncome)}
                          </div>
                          <div className="font-semibold text-red-600">
                            = {formatCurrency(exampleTax)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => toggleActive(bracket)}>
                          <Badge className={bracket.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {bracket.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast('Edit feature coming soon')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">PNG Graduated Tax System</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>PNG uses a graduated tax system where different portions of income are taxed at different rates:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Bracket 1 (K0-K12,500): 0% tax-free threshold</li>
            <li>Bracket 2 (K12,501-K20,000): 22% tax rate</li>
            <li>Bracket 3 (K20,001-K33,000): 30% tax rate</li>
            <li>Bracket 4 (K33,001-K70,000): 35% tax rate</li>
            <li>Bracket 5 (K70,001-K250,000): 40% tax rate</li>
            <li>Bracket 6 (K250,001+): 42% tax rate</li>
          </ul>
          <p className="mt-3 font-semibold">
            Use the Tax Calculator to calculate actual tax based on these brackets.
          </p>
        </div>
      </Card>
    </div>
  )
}
