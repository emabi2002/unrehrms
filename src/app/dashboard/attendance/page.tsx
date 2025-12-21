'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Clock, CheckCircle, XCircle, Calendar, Download, FileSpreadsheet, FileText } from 'lucide-react'
import { attendanceService } from '@/lib/db-helpers'
import { exportToExcel, exportToPDF } from '@/lib/exports'
import { toast } from 'react-hot-toast'

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0
  })

  // Sample attendance data for demonstration
  const sampleAttendance = [
    {
      id: '1',
      employee_id: '001',
      date: selectedDate,
      check_in: '08:15:00',
      check_out: '17:30:00',
      status: 'present',
      employees: {
        first_name: 'John',
        last_name: 'Kila',
        employee_id: 'UNRE-2020-001',
        department: 'Faculty of Environmental Sciences'
      }
    },
    {
      id: '2',
      employee_id: '002',
      date: selectedDate,
      check_in: '09:15:00',
      check_out: '18:00:00',
      status: 'late',
      employees: {
        first_name: 'Sarah',
        last_name: 'Puka',
        employee_id: 'UNRE-2021-045',
        department: 'Administrative Services'
      }
    },
    {
      id: '3',
      employee_id: '003',
      date: selectedDate,
      check_in: '08:00:00',
      check_out: '17:15:00',
      status: 'present',
      employees: {
        first_name: 'Mary',
        last_name: 'Tone',
        employee_id: 'UNRE-2018-012',
        department: 'Faculty of Natural Resources'
      }
    },
    {
      id: '4',
      employee_id: '004',
      date: selectedDate,
      check_in: '08:30:00',
      check_out: null,
      status: 'present',
      employees: {
        first_name: 'David',
        last_name: 'Kama',
        employee_id: 'UNRE-2022-078',
        department: 'IT Department'
      }
    },
    {
      id: '5',
      employee_id: '005',
      date: selectedDate,
      check_in: null,
      check_out: null,
      status: 'absent',
      employees: {
        first_name: 'Grace',
        last_name: 'Namu',
        employee_id: 'UNRE-2019-034',
        department: 'Faculty of Agriculture'
      }
    }
  ]

  useEffect(() => {
    loadAttendance()
  }, [selectedDate])

  const loadAttendance = async () => {
    setLoading(true)
    try {
      const { data, error } = await attendanceService.getAll(selectedDate)

      if (error) {
        // Use sample data if database not set up
        setAttendanceRecords(sampleAttendance)
      } else {
        setAttendanceRecords(data || sampleAttendance)
      }

      calculateStats(data || sampleAttendance)
    } catch (err) {
      setAttendanceRecords(sampleAttendance)
      calculateStats(sampleAttendance)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (records: any[]) => {
    const total = records.length
    const present = records.filter(r => r.status === 'present').length
    const late = records.filter(r => r.status === 'late').length
    const absent = records.filter(r => r.status === 'absent').length
    const percentage = total > 0 ? Math.round((present + late) / total * 100) : 0

    setStats({ total, present, absent, late, percentage })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700'
      case 'late': return 'bg-orange-100 text-orange-700'
      case 'absent': return 'bg-red-100 text-red-700'
      case 'half_day': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatTime = (time: string | null) => {
    if (!time) return '--:--'
    return time.substring(0, 5)
  }

  async function handleExportExcel() {
    try {
      setExportLoading(true)
      const exportData = attendanceRecords.map(record => {
        const hours = record.check_in && record.check_out
          ? ((new Date(`2000-01-01T${record.check_out}`).getTime() -
              new Date(`2000-01-01T${record.check_in}`).getTime()) / 3600000).toFixed(1)
          : '0'

        return {
          'Employee Name': `${record.employees.first_name} ${record.employees.last_name}`,
          'Employee ID': record.employees.employee_id,
          'Department': record.employees.department,
          'Date': selectedDate,
          'Check In': formatTime(record.check_in),
          'Check Out': formatTime(record.check_out),
          'Hours': hours,
          'Status': record.status.toUpperCase(),
        }
      })

      const success = exportToExcel(exportData, 'Attendance_Report', 'Attendance Records')
      if (success) {
        toast.success('Excel file downloaded successfully')
      } else {
        toast.error('Failed to export Excel file')
      }
    } finally {
      setExportLoading(false)
    }
  }

  async function handleExportPDF() {
    try {
      setExportLoading(true)
      const pdfData = attendanceRecords.map(record => {
        const hours = record.check_in && record.check_out
          ? ((new Date(`2000-01-01T${record.check_out}`).getTime() -
              new Date(`2000-01-01T${record.check_in}`).getTime()) / 3600000).toFixed(1)
          : '0'

        return {
          employee: `${record.employees.first_name} ${record.employees.last_name}`,
          empId: record.employees.employee_id,
          department: record.employees.department,
          checkIn: formatTime(record.check_in),
          checkOut: formatTime(record.check_out),
          hours: hours,
          status: record.status.toUpperCase(),
        }
      })

      const columns = [
        { header: 'Employee', dataKey: 'employee' as keyof typeof pdfData[0] },
        { header: 'ID', dataKey: 'empId' as keyof typeof pdfData[0] },
        { header: 'Department', dataKey: 'department' as keyof typeof pdfData[0] },
        { header: 'Check In', dataKey: 'checkIn' as keyof typeof pdfData[0] },
        { header: 'Check Out', dataKey: 'checkOut' as keyof typeof pdfData[0] },
        { header: 'Hours', dataKey: 'hours' as keyof typeof pdfData[0] },
        { header: 'Status', dataKey: 'status' as keyof typeof pdfData[0] },
      ]

      const success = exportToPDF(
        pdfData,
        columns,
        'Attendance Report',
        'Attendance_Report',
        {
          orientation: 'landscape',
          subtitle: `Date: ${new Date(selectedDate).toLocaleDateString()} | Total: ${attendanceRecords.length} employees | Present: ${stats.present} | Absent: ${stats.absent}`,
        }
      )

      if (success) {
        toast.success('PDF file downloaded successfully')
      } else {
        toast.error('Failed to export PDF file')
      }
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
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
                <h1 className="text-xl font-bold text-purple-600">Attendance Tracking</h1>
                <p className="text-xs text-muted-foreground">Real-time attendance monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="relative group">
                <Button
                  variant="outline"
                  className="border-green-200 hover:bg-green-50"
                  disabled={exportLoading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <button
                    onClick={handleExportExcel}
                    disabled={exportLoading}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-600" />
                    Export to Excel
                  </button>
                  <button
                    onClick={handleExportPDF}
                    disabled={exportLoading}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <FileText className="h-4 w-4 text-red-600" />
                    Export to PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-3xl font-bold text-green-600">{stats.present}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Late</p>
                <p className="text-3xl font-bold text-orange-600">{stats.late}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Attendance</p>
                <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Attendance Records - {new Date(selectedDate).toLocaleDateString('en-PG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium">Employee</th>
                    <th className="text-left p-3 font-medium">Department</th>
                    <th className="text-center p-3 font-medium">Check In</th>
                    <th className="text-center p-3 font-medium">Check Out</th>
                    <th className="text-center p-3 font-medium">Hours</th>
                    <th className="text-center p-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record) => {
                    const hours = record.check_in && record.check_out
                      ? ((new Date(`2000-01-01T${record.check_out}`).getTime() -
                          new Date(`2000-01-01T${record.check_in}`).getTime()) / 3600000).toFixed(1)
                      : '--'

                    return (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">
                              {record.employees.first_name} {record.employees.last_name}
                            </p>
                            <p className="text-sm text-gray-500">{record.employees.employee_id}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {record.employees.department}
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm">
                            {formatTime(record.check_in)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className="font-mono text-sm">
                            {formatTime(record.check_out)}
                          </span>
                        </td>
                        <td className="p-3 text-center font-medium">
                          {hours !== '--' && `${hours}h`}
                          {hours === '--' && '--'}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
