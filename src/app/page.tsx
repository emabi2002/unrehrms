import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, FileText, Clock, BarChart } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">🌿</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">PNG UNRE</h1>
                <p className="text-sm text-muted-foreground">HRMS & Payroll System</p>
              </div>
            </div>
            <Button>Sign In</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Papua New Guinea University
        </h2>
        <h3 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
          Natural Resources & Environment
        </h3>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Complete Human Resources Management and Payroll Solution for University Staff
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Get Started
          </Button>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">System Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Manage faculty, staff, and administrative personnel records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Employee profiles & records</li>
                <li>• Department assignments</li>
                <li>• Position & role management</li>
                <li>• Performance tracking</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Leave Management</CardTitle>
              <CardDescription>
                Academic calendar-aligned leave policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Leave applications & approvals</li>
                <li>• Sabbatical leave tracking</li>
                <li>• Leave balance monitoring</li>
                <li>• Academic calendar integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Attendance Tracking</CardTitle>
              <CardDescription>
                Real-time attendance monitoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Check-in/Check-out system</li>
                <li>• Geolocation tracking</li>
                <li>• Late arrival monitoring</li>
                <li>• Attendance reports</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Payroll Processing</CardTitle>
              <CardDescription>
                Automated salary and allowance management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Salary structure configuration</li>
                <li>• Teaching & research allowances</li>
                <li>• Tax calculations</li>
                <li>• Bank transfer integration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Salary Slips</CardTitle>
              <CardDescription>
                Digital salary slip generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Monthly salary statements</li>
                <li>• Detailed breakdowns</li>
                <li>• PDF generation</li>
                <li>• Email distribution</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Comprehensive HR analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Department-wise reports</li>
                <li>• Payroll analytics</li>
                <li>• Attendance statistics</li>
                <li>• Custom report builder</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-4xl font-bold mb-2">500+</h4>
              <p className="text-emerald-100">Staff Members</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">5</h4>
              <p className="text-emerald-100">Faculties</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">15+</h4>
              <p className="text-emerald-100">Departments</p>
            </div>
            <div>
              <h4 className="text-4xl font-bold mb-2">100%</h4>
              <p className="text-emerald-100">Digital</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Access your employee portal, apply for leave, check salary slips, and more.
        </p>
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          Access Employee Portal
        </Button>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            Papua New Guinea University of Natural Resources & Environment
          </p>
          <p className="text-sm text-gray-400">
            HRMS & Payroll System • IT Department
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Contact: hrms@unre.ac.pg | it-support@unre.ac.pg
          </p>
        </div>
      </footer>
    </div>
  )
}
