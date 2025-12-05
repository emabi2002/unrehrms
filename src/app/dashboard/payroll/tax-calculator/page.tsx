'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calculator, TrendingUp, Info } from 'lucide-react'
import { toast } from 'react-hot-toast'

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

interface TaxCalculation {
  annual_income: number
  tax_bracket: number
  annual_tax: number
  monthly_tax: number
  fortnightly_tax: number
  net_annual: number
  net_monthly: number
  net_fortnightly: number
  effective_rate: number
}

export default function TaxCalculatorPage() {
  const [annualIncome, setAnnualIncome] = useState<string>('50000')
  const [taxBrackets, setTaxBrackets] = useState<TaxBracket[]>([])
  const [calculation, setCalculation] = useState<TaxCalculation | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadTaxBrackets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTaxBrackets() {
    setLoading(true)
    const { data, error } = await supabase
      .from('png_tax_brackets')
      .select('*')
      .eq('tax_year', 2025)
      .eq('is_active', true)
      .order('bracket_number')

    if (error) {
      console.error('Error loading tax brackets:', error)
      toast.error('Failed to load tax brackets')
    } else {
      setTaxBrackets(data || [])
      // Calculate on initial load
      if (annualIncome) {
        calculateTax(parseFloat(annualIncome), data || [])
      }
    }
    setLoading(false)
  }

  function calculateTax(income: number, brackets: TaxBracket[]) {
    if (!income || income < 0) {
      setCalculation(null)
      return
    }

    // Find applicable bracket
    let totalTax = 0
    let applicableBracket = 1

    for (const bracket of brackets) {
      if (income > bracket.min_income) {
        const taxableInBracket =
          bracket.max_income && income > bracket.max_income
            ? bracket.max_income - bracket.min_income
            : income - bracket.min_income

        const taxInBracket = (taxableInBracket * bracket.tax_rate) / 100
        totalTax = bracket.base_tax + taxInBracket

        applicableBracket = bracket.bracket_number

        // If income falls within this bracket, we're done
        if (!bracket.max_income || income <= bracket.max_income) {
          break
        }
      }
    }

    const monthlyTax = totalTax / 12
    const fortnightlyTax = totalTax / 26
    const effectiveRate = (totalTax / income) * 100

    setCalculation({
      annual_income: income,
      tax_bracket: applicableBracket,
      annual_tax: totalTax,
      monthly_tax: monthlyTax,
      fortnightly_tax: fortnightlyTax,
      net_annual: income - totalTax,
      net_monthly: (income - totalTax) / 12,
      net_fortnightly: (income - totalTax) / 26,
      effective_rate: effectiveRate,
    })
  }

  function handleCalculate() {
    const income = parseFloat(annualIncome)
    if (isNaN(income) || income < 0) {
      toast.error('Please enter a valid income amount')
      return
    }
    calculateTax(income, taxBrackets)
  }

  function formatCurrency(amount: number) {
    return `K${amount.toLocaleString('en-PG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  function formatPercent(rate: number) {
    return `${rate.toFixed(2)}%`
  }

  if (loading) {
    return <div className="text-center py-12">Loading tax calculator...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">PNG Tax Calculator</h1>
        <p className="text-gray-600 mt-2">
          Calculate income tax using 2025 PNG graduated tax rates
        </p>
      </div>

      {/* Calculator Card */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Calculator className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Income Tax Calculator</h2>
            <p className="text-sm text-gray-600">Enter annual gross income</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Section */}
          <div>
            <label className="text-sm font-medium block mb-2">
              Annual Gross Income (Kina)
            </label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={annualIncome}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnnualIncome(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCalculate()}
                  placeholder="e.g. 50000"
                  className="text-lg"
                />
              </div>
              <Button onClick={handleCalculate} className="bg-green-600 hover:bg-green-700">
                Calculate
              </Button>
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
              <div className="grid grid-cols-3 gap-2">
                {[25000, 50000, 75000, 100000, 150000, 200000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAnnualIncome(amount.toString())
                      calculateTax(amount, taxBrackets)
                    }}
                  >
                    K{(amount / 1000)}k
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Section */}
          {calculation && (
            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Tax Calculation Result</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tax Bracket:</span>
                  <Badge className="bg-green-600 text-white">
                    Bracket {calculation.tax_bracket}
                  </Badge>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Annual Tax:</span>
                    <span className="text-lg font-bold text-red-600">
                      {formatCurrency(calculation.annual_tax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Effective Rate:</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {formatPercent(calculation.effective_rate)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Net Annual Income:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(calculation.net_annual)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monthly Tax:</span>
                    <span className="font-semibold">{formatCurrency(calculation.monthly_tax)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fortnightly Tax:</span>
                    <span className="font-semibold">{formatCurrency(calculation.fortnightly_tax)}</span>
                  </div>
                </div>

                <div className="border-t pt-3 bg-white p-3 rounded">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Net Monthly:</span>
                    <span className="font-bold text-green-600">{formatCurrency(calculation.net_monthly)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Net Fortnightly:</span>
                    <span className="font-bold text-green-600">{formatCurrency(calculation.net_fortnightly)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tax Brackets Reference */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          2025 PNG Tax Brackets
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bracket
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Income Range
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tax Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Base Tax
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Example Tax
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxBrackets.map((bracket) => {
                const isCurrentBracket = calculation?.tax_bracket === bracket.bracket_number
                const exampleIncome = bracket.max_income || bracket.min_income + 50000
                const exampleTax = bracket.base_tax + ((exampleIncome - bracket.min_income) * bracket.tax_rate / 100)

                return (
                  <tr
                    key={bracket.id}
                    className={isCurrentBracket ? 'bg-green-50' : ''}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <Badge
                        variant={isCurrentBracket ? 'default' : 'outline'}
                        className={isCurrentBracket ? 'bg-green-600 text-white' : ''}
                      >
                        {bracket.bracket_number}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium">
                          {formatCurrency(bracket.min_income)}
                        </div>
                        <div className="text-gray-500">
                          to {bracket.max_income ? formatCurrency(bracket.max_income) : 'No limit'}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-lg font-semibold text-orange-600">
                        {formatPercent(bracket.tax_rate)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium">
                        {formatCurrency(bracket.base_tax)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="text-gray-500">
                          {formatCurrency(exampleIncome)}
                        </div>
                        <div className="font-semibold text-red-600">
                          = {formatCurrency(exampleTax)}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Tax Formula Explanation */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Info className="h-5 w-5" />
          How PNG Graduated Tax Works
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>PNG uses a graduated tax system.</strong> Your income is taxed at different rates across brackets:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Income up to K12,500 is tax-free (0%)</li>
            <li>Income from K12,501 to K20,000 is taxed at 22%</li>
            <li>Income from K20,001 to K33,000 is taxed at 30%</li>
            <li>And so on...</li>
          </ul>
          <p className="mt-3">
            <strong>Example:</strong> If you earn K50,000 annually, you pay:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>K0 on first K12,500 (0% rate)</li>
            <li>K1,650 on K12,501-K20,000 (22% rate)</li>
            <li>K3,900 on K20,001-K33,000 (30% rate)</li>
            <li>K5,950 on K33,001-K50,000 (35% rate)</li>
            <li><strong>Total: K11,500 annual tax (23% effective rate)</strong></li>
          </ul>
        </div>
      </Card>
    </div>
  )
}
