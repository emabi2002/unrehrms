import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
              <h1 className="text-xl font-bold text-purple-600">Attendance Tracking</h1>
              <p className="text-xs text-muted-foreground">Real-time attendance monitoring</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-purple-600" />
              Attendance Module - Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">This module will include:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Daily attendance records and check-in/check-out logs</li>
              <li>Real-time attendance dashboard</li>
              <li>Late arrival and early departure tracking</li>
              <li>Monthly attendance reports and analytics</li>
              <li>Geolocation-based attendance verification</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
