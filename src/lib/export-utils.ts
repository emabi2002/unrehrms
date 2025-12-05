// @ts-nocheck
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// PDF Export for Employee List
export const exportEmployeesToPDF = (employees: Record<string, unknown>[]) => {
  const doc = new jsPDF()

  // Add header
  doc.setFontSize(20)
  doc.setTextColor(0, 135, 81) // PNG University Green
  doc.text('PNG UNRE HRMS', 14, 20)

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Employee List', 14, 30)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PG')}`, 14, 37)

  // Add table
  const tableData = employees.map(emp => [
    emp.employee_id,
    `${emp.first_name} ${emp.last_name}`,
    emp.department,
    emp.position,
    emp.employment_type,
    `K${emp.salary.toLocaleString()}`
  ])

  autoTable(doc, {
    startY: 45,
    head: [['ID', 'Name', 'Department', 'Position', 'Type', 'Salary']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 135, 81], // PNG University Green
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 40 },
      2: { cellWidth: 45 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25, halign: 'right' }
    }
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save(`employees_${new Date().toISOString().split('T')[0]}.pdf`)
}

// PDF Export for Payroll
export const exportPayrollToPDF = (payrollData: Record<string, unknown>[], month: string, year: number) => {
  const doc = new jsPDF()

  // Add header
  doc.setFontSize(20)
  doc.setTextColor(0, 135, 81)
  doc.text('PNG UNRE HRMS', 14, 20)

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text(`Payroll Report - ${month} ${year}`, 14, 30)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-PG')}`, 14, 37)

  // Calculate totals
  const totalBasic = payrollData.reduce((sum, emp) => sum + emp.basic_salary, 0)
  const totalAllowances = payrollData.reduce((sum, emp) =>
    sum + Object.values((emp.allowances as Record<string, number>) || {}).reduce((a: number, b: number) => a + b, 0), 0)
  const totalDeductions = payrollData.reduce((sum, emp) =>
    sum + Object.values((emp.deductions as Record<string, number>) || {}).reduce((a: number, b: number) => a + b, 0), 0)
  const totalNet = payrollData.reduce((sum, emp) => sum + emp.net_salary, 0)

  // Add summary
  doc.setFontSize(12)
  doc.setTextColor(0, 0, 0)
  doc.text('Summary', 14, 47)
  doc.setFontSize(10)
  doc.text(`Total Employees: ${payrollData.length}`, 14, 54)
  doc.text(`Total Basic Salary: K${totalBasic.toLocaleString()}`, 14, 60)
  doc.text(`Total Allowances: K${totalAllowances.toLocaleString()}`, 14, 66)
  doc.text(`Total Deductions: K${totalDeductions.toLocaleString()}`, 14, 72)
  doc.setFontSize(12)
  doc.setTextColor(0, 135, 81)
  doc.text(`Net Payroll: K${totalNet.toLocaleString()}`, 14, 80)

  // Add table
  const tableData = payrollData.map(emp => [
    emp.employee_id,
    emp.employee_name,
    `K${emp.basic_salary.toLocaleString()}`,
    `K${Object.values((emp.allowances as Record<string, number>) || {}).reduce((a: number, b: number) => a + b, 0).toLocaleString()}`,
    `K${Object.values((emp.deductions as Record<string, number>) || {}).reduce((a: number, b: number) => a + b, 0).toLocaleString()}`,
    `K${emp.net_salary.toLocaleString()}`
  ])

  autoTable(doc, {
    startY: 90,
    head: [['ID', 'Employee', 'Basic', 'Allowances', 'Deductions', 'Net Salary']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 135, 81],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 50 },
      2: { cellWidth: 25, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' }
    }
  })

  // Add footer
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save(`payroll_${month}_${year}.pdf`)
}

// Excel Export for Reports
export const exportReportsToExcel = (data: Record<string, unknown>[], filename: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

  // Set column widths
  const maxWidth = data.reduce((w: number, r: Record<string, unknown>) => Math.max(w, ...Object.values(r).map((val: unknown) => String(val).length)), 10)
  worksheet['!cols'] = Object.keys(data[0] || {}).map(() => ({ wch: maxWidth }))

  XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`)
}

// Excel Export for Employee List
export const exportEmployeesToExcel = (employees: Record<string, unknown>[]) => {
  const data = employees.map(emp => ({
    'Employee ID': emp.employee_id,
    'First Name': emp.first_name,
    'Last Name': emp.last_name,
    'Email': emp.email,
    'Phone': emp.phone,
    'Department': emp.department,
    'Position': emp.position,
    'Employment Type': emp.employment_type,
    'Hire Date': emp.hire_date,
    'Salary': emp.salary,
    'Status': emp.status
  }))

  exportReportsToExcel(data, 'employees')
}

// Excel Export for Attendance
export const exportAttendanceToExcel = (attendance: Record<string, unknown>[]) => {
  const data = attendance.map(record => ({
    'Date': record.date,
    'Employee ID': record.employees?.employee_id || '',
    'Employee Name': `${record.employees?.first_name || ''} ${record.employees?.last_name || ''}`,
    'Department': record.employees?.department || '',
    'Check In': record.check_in || '',
    'Check Out': record.check_out || '',
    'Status': record.status
  }))

  exportReportsToExcel(data, 'attendance')
}

// Excel Export for Leave Requests
export const exportLeaveToExcel = (leaveRequests: Record<string, unknown>[]) => {
  const data = leaveRequests.map(leave => ({
    'Leave ID': leave.id,
    'Employee': leave.employeeName,
    'Employee ID': leave.employeeId,
    'Department': leave.department,
    'Leave Type': leave.leaveType,
    'Start Date': leave.startDate,
    'End Date': leave.endDate,
    'Days': leave.days,
    'Reason': leave.reason,
    'Status': leave.status,
    'Applied Date': leave.appliedDate
  }))

  exportReportsToExcel(data, 'leave_requests')
}
