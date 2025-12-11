'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Report {
  id: string
  date: string
  reportName: string
  reportType: string
  generatedBy: string
  period: string
  format: string
  status: 'completed' | 'processing' | 'failed'
}

const sampleReports: Report[] = [
  {
    id: 'DEMO/RPT/000001',
    date: '10-12-2025',
    reportName: 'Employee Headcount Report',
    reportType: 'HR Analytics',
    generatedBy: 'Sarah Puka',
    period: 'December 2025',
    format: 'PDF',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000002',
    date: '10-12-2025',
    reportName: 'Monthly Payroll Summary',
    reportType: 'Payroll',
    generatedBy: 'Finance Department',
    period: 'November 2025',
    format: 'Excel',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000003',
    date: '09-12-2025',
    reportName: 'Leave Balance Report',
    reportType: 'Leave Management',
    generatedBy: 'HR Manager',
    period: 'Q4 2025',
    format: 'PDF',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000004',
    date: '08-12-2025',
    reportName: 'Attendance Statistics',
    reportType: 'Attendance',
    generatedBy: 'Admin',
    period: 'November 2025',
    format: 'Excel',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000005',
    date: '07-12-2025',
    reportName: 'Department Budget Analysis',
    reportType: 'Financial',
    generatedBy: 'Finance Officer',
    period: '2025 Annual',
    format: 'PDF',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000006',
    date: '06-12-2025',
    reportName: 'Salary Structure Report',
    reportType: 'Payroll',
    generatedBy: 'Payroll Manager',
    period: 'December 2025',
    format: 'PDF',
    status: 'processing'
  },
  {
    id: 'DEMO/RPT/000007',
    date: '05-12-2025',
    reportName: 'Tax Deductions Report',
    reportType: 'Tax & Compliance',
    generatedBy: 'Finance Department',
    period: 'November 2025',
    format: 'Excel',
    status: 'completed'
  },
  {
    id: 'DEMO/RPT/000008',
    date: '04-12-2025',
    reportName: 'Employee Performance Review',
    reportType: 'HR Analytics',
    generatedBy: 'HR Manager',
    period: 'Q4 2025',
    format: 'PDF',
    status: 'failed'
  },
]

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [reports, setReports] = useState(sampleReports)
  const [entriesPerPage, setEntriesPerPage] = useState('10')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredReports = reports.filter(report => {
    const search = searchTerm.toLowerCase()
    return report.reportName.toLowerCase().includes(search) ||
           report.reportType.toLowerCase().includes(search) ||
           report.generatedBy.toLowerCase().includes(search) ||
           report.period.toLowerCase().includes(search)
  })

  const totalPages = Math.ceil(filteredReports.length / Number.parseInt(entriesPerPage))
  const startIndex = (currentPage - 1) * Number.parseInt(entriesPerPage)
  const endIndex = startIndex + Number.parseInt(entriesPerPage)
  const currentReports = filteredReports.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-yellow-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const handleDownload = (reportId: string, reportName: string) => {
    toast.success(`Downloading: ${reportName}`)
  }

  const handleView = (reportId: string, reportName: string) => {
    toast(`Opening: ${reportName}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-sm text-gray-600">Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600">Failed</span>
              </div>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show</span>
            <Select value={entriesPerPage} onValueChange={setEntriesPerPage}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Search:</span>
            <Input
              type="text"
              placeholder=""
              className="w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Report Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Report Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Generated By</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Period</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Format</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentReports.map((report, index) => (
                <tr
                  key={report.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-purple-50/30'
                  }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-700">{startIndex + index + 1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{report.reportName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.reportType}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.generatedBy}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.period}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.format}</td>
                  <td className="px-4 py-3">
                    <div className={`w-4 h-4 rounded ${getStatusColor(report.status)}`}></div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-green-600 hover:text-green-800"
                        onClick={() => handleView(report.id, report.reportName)}
                        disabled={report.status !== 'completed'}
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => handleDownload(report.id, report.reportName)}
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
