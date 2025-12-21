'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Network, Users, Building2, Mail, Phone, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  employee_id: number;
  first_name: string;
  last_name: string;
  personal_email?: string;
  mobile_phone?: string;
  employment_status: string;
  reports_to?: number;
  department?: {
    name: string;
    code: string;
  };
  position?: {
    title: string;
  };
}

interface OrgNode {
  employee: Employee;
  subordinates: OrgNode[];
}

export default function OrgChartPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    buildOrgTree();
  }, [employees, selectedDept]);

  async function loadData() {
    try {
      setLoading(true);

      // Load employees with department and position
      const { data: empData, error: empError } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(name, code),
          position:positions(title)
        `)
        .eq('employment_status', 'Active')
        .order('first_name', { ascending: true });

      if (empError) throw empError;

      // Load departments
      const { data: deptData, error: deptError } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (deptError) throw deptError;

      setEmployees(empData || []);
      setDepartments(deptData || []);
    } catch (error: any) {
      console.error('Error loading org chart data:', error);
      toast.error('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  }

  function buildOrgTree() {
    // Filter employees by department if selected
    let filteredEmployees = employees;
    if (selectedDept !== 'all') {
      filteredEmployees = employees.filter(e => e.department?.code === selectedDept);
    }

    // Find top-level employees (those without a manager)
    const topLevel = filteredEmployees.filter(e => !e.reports_to);

    // Build tree recursively
    const tree = topLevel.map(emp => buildNode(emp, filteredEmployees));
    setOrgTree(tree);

    // Auto-expand top level
    const topLevelIds = new Set(topLevel.map(e => e.employee_id));
    setExpandedNodes(topLevelIds);
  }

  function buildNode(employee: Employee, allEmployees: Employee[]): OrgNode {
    const subordinates = allEmployees
      .filter(e => e.reports_to === employee.employee_id)
      .map(sub => buildNode(sub, allEmployees));

    return {
      employee,
      subordinates,
    };
  }

  function toggleNode(employeeId: number) {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedNodes(newExpanded);
  }

  function expandAll() {
    const allIds = new Set(employees.map(e => e.employee_id));
    setExpandedNodes(allIds);
  }

  function collapseAll() {
    const topLevel = employees.filter(e => !e.reports_to);
    const topLevelIds = new Set(topLevel.map(e => e.employee_id));
    setExpandedNodes(topLevelIds);
  }

  function renderNode(node: OrgNode, level: number = 0) {
    const { employee, subordinates } = node;
    const isExpanded = expandedNodes.has(employee.employee_id);
    const hasSubordinates = subordinates.length > 0;

    return (
      <div key={employee.id} className="relative">
        {/* Employee Card */}
        <div
          className={`ml-${level * 8} mb-4`}
          style={{ marginLeft: `${level * 2}rem` }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {/* Expand/Collapse Icon */}
                  {hasSubordinates && (
                    <button
                      onClick={() => toggleNode(employee.employee_id)}
                      className="mt-2 p-1 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  )}

                  {/* Avatar */}
                  <div className="h-12 w-12 rounded-full bg-[#008751]/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-semibold text-[#008751]">
                      {employee.first_name[0]}{employee.last_name[0]}
                    </span>
                  </div>

                  {/* Employee Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {employee.first_name} {employee.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.position?.title || 'No Position'}</p>
                    {employee.department && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {employee.department.code}
                      </Badge>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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

                  {/* Subordinate Count */}
                  {hasSubordinates && (
                    <Badge className="bg-blue-100 text-blue-800">
                      {subordinates.length} {subordinates.length === 1 ? 'report' : 'reports'}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subordinates */}
        {hasSubordinates && isExpanded && (
          <div className="relative">
            {/* Connecting Line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${level * 2 + 0.5}rem` }}
            />
            <div className="space-y-0">
              {subordinates.map(sub => renderNode(sub, level + 1))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600 mt-1">Visual hierarchy of university structure and reporting lines</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Network className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Top Level</p>
                <p className="text-2xl font-bold">
                  {employees.filter(e => !e.reports_to).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Filter by Department:</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Org Chart */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      ) : orgTree.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Network className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No organizational structure found</p>
            <p className="text-sm text-gray-400 mt-2">
              Add employees with reporting relationships to see the org chart
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg p-6">
          {orgTree.map(node => renderNode(node))}
        </div>
      )}
    </div>
  );
}
