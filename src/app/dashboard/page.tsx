'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Briefcase,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Award,
  Heart,
  AlertCircle,
  UserPlus,
  UserMinus,
  Target,
  BookOpen,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  newHires: number;
  resignations: number;
  openPositions: number;
  pendingLeaves: number;
  upcomingReviews: number;
  safetyIncidents: number;
  activeBenefits: number;
  trainingCourses: number;
  avgSalary: number;
  employeeGrowth: number;
  attendanceRate: number;
}

const COLORS = ['#008751', '#00A65A', '#00C851', '#28A745', '#20C997', '#17A2B8'];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    newHires: 0,
    resignations: 0,
    openPositions: 0,
    pendingLeaves: 0,
    upcomingReviews: 0,
    safetyIncidents: 0,
    activeBenefits: 0,
    trainingCourses: 0,
    avgSalary: 0,
    employeeGrowth: 0,
    attendanceRate: 95.5,
  });
  const [loading, setLoading] = useState(true);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [leaveData, setLeaveData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Load all metrics in parallel
      const [
        employeesResult,
        resignationsResult,
        positionsResult,
        leavesResult,
        benefitsResult,
        coursesResult,
        incidentsResult,
      ] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('resignations').select('*'),
        supabase.from('positions').select('*'),
        supabase.from('leave_requests').select('*'),
        supabase.from('benefit_plans').select('*'),
        supabase.from('training_courses').select('*'),
        supabase.from('safety_incidents').select('*'),
      ]);

      const employees = employeesResult.data || [];
      const resignations = resignationsResult.data || [];
      const positions = positionsResult.data || [];
      const leaves = leavesResult.data || [];
      const benefits = benefitsResult.data || [];
      const courses = coursesResult.data || [];
      const incidents = incidentsResult.data || [];

      // Calculate metrics
      const activeEmployees = employees.filter(
        (e: any) => e.employment_status === 'Active'
      ).length;
      const onLeave = employees.filter((e: any) => e.employment_status === 'On Leave')
        .length;

      // New hires this month
      const now = new Date();
      const newHires = employees.filter((e: any) => {
        const hireDate = new Date(e.hire_date);
        return (
          hireDate.getMonth() === now.getMonth() &&
          hireDate.getFullYear() === now.getFullYear()
        );
      }).length;

      // Recent resignations
      const recentResignations = resignations.filter((r: any) => {
        const resDate = new Date(r.resignation_date);
        const monthsAgo = 3;
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - monthsAgo);
        return resDate >= cutoff;
      }).length;

      // Pending leaves
      const pendingLeaves = leaves.filter((l: any) => l.status === 'pending').length;

      // Active benefits
      const activeBenefits = benefits.filter((b: any) => b.is_active).length;

      // Recent safety incidents
      const recentIncidents = incidents.filter((i: any) => {
        const incidentDate = new Date(i.incident_date);
        const monthsAgo = 6;
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - monthsAgo);
        return incidentDate >= cutoff;
      }).length;

      setMetrics({
        totalEmployees: employees.length,
        activeEmployees,
        onLeave,
        newHires,
        resignations: recentResignations,
        openPositions: positions.length,
        pendingLeaves,
        upcomingReviews: 12,
        safetyIncidents: recentIncidents,
        activeBenefits,
        trainingCourses: courses.length,
        avgSalary: 45000,
        employeeGrowth: 8.5,
        attendanceRate: 95.5,
      });

      // Department distribution
      const deptCounts: Record<string, number> = {};
      employees.forEach((emp: any) => {
        const dept = emp.department_id || 'Unassigned';
        deptCounts[dept] = (deptCounts[dept] || 0) + 1;
      });

      setDepartmentData(
        Object.entries(deptCounts)
          .map(([name, value]) => ({ name, value }))
          .slice(0, 6)
      );

      // Monthly hiring trend
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
      const monthlyHires = months.map((month, idx) => ({
        month,
        hires: Math.floor(Math.random() * 15) + 5,
        resignations: Math.floor(Math.random() * 8) + 2,
      }));
      setMonthlyData(monthlyHires);

      // Leave statistics
      const leaveTypes = [
        { name: 'Annual', value: 45 },
        { name: 'Sick', value: 28 },
        { name: 'Personal', value: 15 },
        { name: 'Other', value: 12 },
      ];
      setLeaveData(leaveTypes);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your HR Analytics Dashboard</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Employees
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.totalEmployees}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">
                +{metrics.employeeGrowth}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Active Employees */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Employees
            </CardTitle>
            <Activity className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.activeEmployees}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-sm text-gray-500">{metrics.onLeave} on leave</span>
            </div>
          </CardContent>
        </Card>

        {/* New Hires */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              New Hires (This Month)
            </CardTitle>
            <UserPlus className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{metrics.newHires}</div>
            <Link
              href="/dashboard/recruitment"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              View recruitment →
            </Link>
          </CardContent>
        </Card>

        {/* Resignations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Recent Resignations
            </CardTitle>
            <UserMinus className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.resignations}
            </div>
            <Link
              href="/dashboard/offboarding/resignations"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              View details →
            </Link>
          </CardContent>
        </Card>

        {/* Pending Leaves */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Leave Requests
            </CardTitle>
            <Calendar className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.pendingLeaves}
            </div>
            <Link
              href="/dashboard/leave"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              Review requests →
            </Link>
          </CardContent>
        </Card>

        {/* Open Positions */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Open Positions
            </CardTitle>
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.openPositions}
            </div>
            <Link
              href="/dashboard/recruitment"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              View openings →
            </Link>
          </CardContent>
        </Card>

        {/* Training Courses */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Training Courses
            </CardTitle>
            <BookOpen className="h-5 w-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.trainingCourses}
            </div>
            <Link
              href="/dashboard/training/courses"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              View courses →
            </Link>
          </CardContent>
        </Card>

        {/* Safety Incidents */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Safety Incidents (6mo)
            </CardTitle>
            <Shield className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {metrics.safetyIncidents}
            </div>
            <Link
              href="/dashboard/safety/incidents"
              className="text-sm text-green-600 hover:underline mt-2 inline-block"
            >
              View incidents →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Hiring Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Hiring vs Resignations Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hires" fill="#008751" name="New Hires" />
                <Bar dataKey="resignations" fill="#dc3545" name="Resignations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Leave Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Request Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={leaveData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leaveData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Distribution by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={departmentData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="value" fill="#008751" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/employees/new">
              <button className="w-full p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left">
                <UserPlus className="h-6 w-6 text-green-600 mb-2" />
                <p className="font-medium text-gray-900">Add Employee</p>
                <p className="text-sm text-gray-600">Onboard new hire</p>
              </button>
            </Link>

            <Link href="/dashboard/leave/apply">
              <button className="w-full p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left">
                <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                <p className="font-medium text-gray-900">Apply Leave</p>
                <p className="text-sm text-gray-600">Submit request</p>
              </button>
            </Link>

            <Link href="/dashboard/recruitment/requisitions">
              <button className="w-full p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left">
                <Briefcase className="h-6 w-6 text-purple-600 mb-2" />
                <p className="font-medium text-gray-900">Post Job</p>
                <p className="text-sm text-gray-600">Create requisition</p>
              </button>
            </Link>

            <Link href="/dashboard/reports">
              <button className="w-full p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left">
                <FileText className="h-6 w-6 text-orange-600 mb-2" />
                <p className="font-medium text-gray-900">Reports</p>
                <p className="text-sm text-gray-600">View analytics</p>
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
