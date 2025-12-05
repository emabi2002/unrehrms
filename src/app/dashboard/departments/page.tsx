import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
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
              <h1 className="text-xl font-bold text-amber-600">Departments</h1>
              <p className="text-xs text-muted-foreground">Organizational structure management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-amber-600" />
              Departments Module - Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">This module will include:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Department and faculty management</li>
              <li>Organizational hierarchy visualization</li>
              <li>Department heads and staff allocation</li>
              <li>Budget management per department</li>
              <li>Department-wise employee statistics</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
