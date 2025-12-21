"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import type { Employee, Department, Position } from "@/lib/database.types";
import { exportToExcel, exportToPDF, prepareDataForExport } from "@/lib/exports";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface EmployeeWithDetails extends Employee {
  department?: Department;
  position?: Position;
  supervisor?: { first_name: string; last_name: string };
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("employees")
        .select(`
          *,
          department:departments(id, code, name),
          position:positions(id, code, title),
          supervisor:employees!employees_reports_to_fkey(first_name, last_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEmployees(data || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  }

  async function deleteEmployee(employeeId: string) {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employeeId);

      if (error) throw error;

      toast.success("Employee deleted successfully");
      loadEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee");
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchQuery === "" ||
      employee.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.personal_email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || employee.employment_status === statusFilter;

    const matchesDepartment =
      departmentFilter === "all" ||
      employee.department_id === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const statusColors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    "On Leave": "bg-blue-100 text-blue-800",
    Suspended: "bg-orange-100 text-orange-800",
    Resigned: "bg-gray-100 text-gray-800",
    Terminated: "bg-red-100 text-red-800",
    Retired: "bg-purple-100 text-purple-800",
  };

  async function handleExportExcel() {
    try {
      setExportLoading(true);
      const exportData = filteredEmployees.map(emp => ({
        'Employee Number': emp.employee_number,
        'First Name': emp.first_name,
        'Last Name': emp.last_name,
        'Email': emp.personal_email || '-',
        'Phone': emp.mobile_phone || '-',
        'Status': emp.employment_status,
        'Hire Date': emp.hire_date,
        'Department': emp.department?.name || '-',
        'Position': emp.position?.title || '-',
      }));

      const success = exportToExcel(exportData, 'Employees_Report', 'Employees');
      if (success) {
        toast.success('Excel file downloaded successfully');
      } else {
        toast.error('Failed to export Excel file');
      }
    } finally {
      setExportLoading(false);
    }
  }

  async function handleExportPDF() {
    try {
      setExportLoading(true);
      const pdfData = filteredEmployees.map(emp => ({
        employee_number: emp.employee_number,
        name: `${emp.first_name} ${emp.last_name}`,
        email: emp.personal_email || '-',
        phone: emp.mobile_phone || '-',
        department: emp.department?.name || '-',
        position: emp.position?.title || '-',
        status: emp.employment_status,
        hire_date: emp.hire_date,
      }));

      const columns = [
        { header: 'Employee #', dataKey: 'employee_number' as keyof typeof pdfData[0] },
        { header: 'Name', dataKey: 'name' as keyof typeof pdfData[0] },
        { header: 'Email', dataKey: 'email' as keyof typeof pdfData[0] },
        { header: 'Phone', dataKey: 'phone' as keyof typeof pdfData[0] },
        { header: 'Department', dataKey: 'department' as keyof typeof pdfData[0] },
        { header: 'Position', dataKey: 'position' as keyof typeof pdfData[0] },
        { header: 'Status', dataKey: 'status' as keyof typeof pdfData[0] },
        { header: 'Hire Date', dataKey: 'hire_date' as keyof typeof pdfData[0] },
      ];

      const success = exportToPDF(
        pdfData,
        columns,
        'Employee Directory Report',
        'Employees_Report',
        {
          orientation: 'landscape',
          subtitle: `Total Employees: ${filteredEmployees.length}`,
        }
      );

      if (success) {
        toast.success('PDF file downloaded successfully');
      } else {
        toast.error('Failed to export PDF file');
      }
    } finally {
      setExportLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
          <p className="text-slate-600 mt-1">
            Manage employee records and information
          </p>
        </div>
        <div className="flex gap-2">
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
          <Link href="/dashboard/employees/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900">{employees.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-2xl font-bold text-slate-900">
                {employees.filter((e) => e.employment_status === "Active").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Building2 className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Departments</p>
              <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">New This Month</p>
              <p className="text-2xl font-bold text-slate-900">
                {
                  employees.filter((e) => {
                    const hireDate = new Date(e.hire_date);
                    const now = new Date();
                    return (
                      hireDate.getMonth() === now.getMonth() &&
                      hireDate.getFullYear() === now.getFullYear()
                    );
                  }).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Suspended">Suspended</option>
            <option value="Resigned">Resigned</option>
            <option value="Terminated">Terminated</option>
            <option value="Retired">Retired</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="border border-slate-300 rounded-md px-3 py-2"
          >
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Employees Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Employee #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Hire Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    Loading employees...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 text-slate-300" />
                      <p className="text-slate-500">No employees found</p>
                      <Link href="/dashboard/employees/add">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 mt-2">
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add First Employee
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-700 font-semibold">
                            {employee.first_name[0]}
                            {employee.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            {employee.personal_email && (
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {employee.personal_email}
                              </span>
                            )}
                            {employee.mobile_phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {employee.mobile_phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-mono">
                      {employee.employee_number}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-slate-900">
                          {employee.department?.name || "-"}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {employee.department?.code || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        {employee.position?.title || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="secondary"
                        className={statusColors[employee.employment_status] || ""}
                      >
                        {employee.employment_status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          <Button variant="ghost" size="sm" title="View Employee">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          <Button variant="ghost" size="sm" title="Edit Employee">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Delete Employee"
                          onClick={() => deleteEmployee(employee.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Results Summary */}
      {!loading && filteredEmployees.length > 0 && (
        <div className="text-sm text-slate-600">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      )}
    </div>
  );
}
