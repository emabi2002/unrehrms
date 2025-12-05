import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, BarChart } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-red-50">
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
              <h1 className="text-xl font-bold text-rose-600">Reports & Analytics</h1>
              <p className="text-xs text-muted-foreground">HR insights and reporting</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-6 w-6 text-rose-600" />
              Reports Module - Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">This module will include:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Employee statistics and demographics</li>
              <li>Payroll summaries and cost analysis</li>
              <li>Attendance and leave analytics</li>
              <li>Department-wise performance reports</li>
              <li>Custom report builder</li>
              <li>Export to PDF, Excel, and CSV</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
