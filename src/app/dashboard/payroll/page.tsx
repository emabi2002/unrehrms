import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function PayrollPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-emerald-600">Payroll Processing</h1>
              <p className="text-xs text-muted-foreground">Salary and allowance management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              Payroll Module - Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">This module will include:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Monthly payroll processing and calculation</li>
              <li>Salary structure configuration</li>
              <li>Teaching and research allowances</li>
              <li>Tax deductions and statutory contributions</li>
              <li>Salary slip generation and distribution</li>
              <li>Bank transfer file generation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
