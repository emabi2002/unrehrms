'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle, XCircle, AlertTriangle, BarChart3, PieChart, Download } from 'lucide-react';
import { toast } from 'sonner';

interface BudgetUtilization {
  cost_centre_name: string;
  cost_centre_code: string;
  total_budget: number;
  ytd_expenditure: number;
  committed: number;
  available: number;
  utilization_percent: number;
  variance: number;
}

interface ApprovalMetrics {
  total_requests: number;
  approved: number;
  denied: number;
  queried: number;
  pending: number;
  approval_rate: number;
  average_processing_days: number;
}

interface SpendingTrend {
  month: string;
  amount: number;
  budget: number;
  variance: number;
}

interface FeedbackItem {
  type: 'warning' | 'success' | 'info' | 'error';
  department: string;
  message: string;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
}

export default function MEPlanningDashboard() {
  const [budgetUtilization, setBudgetUtilization] = useState<BudgetUtilization[]>([]);
  const [approvalMetrics, setApprovalMetrics] = useState<ApprovalMetrics | null>(null);
  const [spendingTrends, setSpendingTrends] = useState<SpendingTrend[]>([]);
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchBudgetUtilization(),
        fetchApprovalMetrics(),
        fetchSpendingTrends(),
        generateAutomatedFeedback()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchBudgetUtilization() {
    const { data, error } = await supabase
      .from('budget_lines')
      .select(`
        *,
        cost_centres (
          name,
          code
        )
      `)
      .eq('budget_year', new Date().getFullYear())
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching budget utilization:', error);
      return;
    }

    // Aggregate by cost centre
    const utilization: Record<string, BudgetUtilization> = {};

    data?.forEach((line: any) => {
      const key = line.cost_centres?.code || 'UNKNOWN';
      if (!utilization[key]) {
        utilization[key] = {
          cost_centre_name: line.cost_centres?.name || 'Unknown',
          cost_centre_code: key,
          total_budget: 0,
          ytd_expenditure: 0,
          committed: 0,
          available: 0,
          utilization_percent: 0,
          variance: 0
        };
      }

      utilization[key].total_budget += parseFloat(line.original_amount || 0);
      utilization[key].ytd_expenditure += parseFloat(line.ytd_expenditure || 0);
      utilization[key].committed += parseFloat(line.committed_amount || 0);
      utilization[key].available += parseFloat(line.available_amount || 0);
    });

    // Calculate percentages and variance
    const utilizationArray = Object.values(utilization).map(item => ({
      ...item,
      utilization_percent: item.total_budget > 0
        ? ((item.ytd_expenditure + item.committed) / item.total_budget) * 100
        : 0,
      variance: item.total_budget - item.ytd_expenditure - item.committed
    }));

    setBudgetUtilization(utilizationArray);
  }

  async function fetchApprovalMetrics() {
    const { data, error } = await supabase
      .from('ge_requests')
      .select('status, created_at, submitted_at');

    if (error) {
      console.error('Error fetching approval metrics:', error);
      return;
    }

    const requests = data as any[] || [];
    const total = requests.length;
    const approved = requests.filter(r => r.status === 'Approved' || r.status === 'Paid').length;
    const denied = requests.filter(r => r.status === 'Denied').length;
    const queried = requests.filter(r => r.status === 'Queried').length;
    const pending = requests.filter(r => r.status?.includes('Pending')).length;

    // Calculate average processing days for approved requests
    const approvedRequests = requests.filter(r => r.status === 'Approved' && r.submitted_at);
    const avgDays = approvedRequests.length > 0
      ? approvedRequests.reduce((sum, r) => {
          const days = Math.floor((new Date().getTime() - new Date(r.submitted_at).getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0) / approvedRequests.length
      : 0;

    setApprovalMetrics({
      total_requests: total,
      approved,
      denied,
      queried,
      pending,
      approval_rate: total > 0 ? (approved / total) * 100 : 0,
      average_processing_days: Math.round(avgDays)
    });
  }

  async function fetchSpendingTrends() {
    // Get spending by month for the current year
    const { data, error } = await supabase
      .from('ge_requests')
      .select('total_amount, created_at, status')
      .gte('created_at', `${new Date().getFullYear()}-01-01`)
      .in('status', ['Approved', 'Paid']);

    if (error) {
      console.error('Error fetching spending trends:', error);
      return;
    }

    // Group by month
    const monthlyData: Record<string, { amount: number; budget: number }> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    months.forEach((month, idx) => {
      monthlyData[month] = { amount: 0, budget: 0 };
    });

    data?.forEach((request: any) => {
      const month = months[new Date(request.created_at).getMonth()];
      monthlyData[month].amount += parseFloat(request.total_amount || 0);
    });

    // Get total budget and divide by 12 for monthly budget
    const totalBudget = budgetUtilization.reduce((sum, item) => sum + item.total_budget, 0);
    const monthlyBudget = totalBudget / 12;

    const trends = months.map(month => ({
      month,
      amount: monthlyData[month].amount,
      budget: monthlyBudget,
      variance: monthlyBudget - monthlyData[month].amount
    }));

    setSpendingTrends(trends);
  }

  async function generateAutomatedFeedback() {
    const feedback: FeedbackItem[] = [];

    // Analyze budget utilization and generate feedback
    budgetUtilization.forEach(dept => {
      // High utilization warning
      if (dept.utilization_percent > 90) {
        feedback.push({
          type: 'error',
          department: dept.cost_centre_name,
          message: `Budget utilization at ${dept.utilization_percent.toFixed(1)}% - Critical level`,
          recommendation: 'Recommend immediate budget review and expenditure freeze for non-essential items',
          priority: 'high'
        });
      } else if (dept.utilization_percent > 75) {
        feedback.push({
          type: 'warning',
          department: dept.cost_centre_name,
          message: `Budget utilization at ${dept.utilization_percent.toFixed(1)}% - High level`,
          recommendation: 'Monitor spending closely and prioritize essential expenses only',
          priority: 'medium'
        });
      }

      // Low utilization feedback
      if (dept.utilization_percent < 30 && new Date().getMonth() > 6) {
        feedback.push({
          type: 'info',
          department: dept.cost_centre_name,
          message: `Budget utilization at ${dept.utilization_percent.toFixed(1)}% - Below target`,
          recommendation: 'Review planned activities and accelerate implementation to meet targets',
          priority: 'low'
        });
      }

      // Positive performance
      if (dept.utilization_percent >= 60 && dept.utilization_percent <= 75 && new Date().getMonth() >= 6) {
        feedback.push({
          type: 'success',
          department: dept.cost_centre_name,
          message: `Budget utilization at ${dept.utilization_percent.toFixed(1)}% - On track`,
          recommendation: 'Continue current spending pace to achieve annual targets',
          priority: 'low'
        });
      }
    });

    // Analyze approval patterns
    if (approvalMetrics) {
      const queryRate = (approvalMetrics.queried / approvalMetrics.total_requests) * 100;
      const denialRate = (approvalMetrics.denied / approvalMetrics.total_requests) * 100;

      if (queryRate > 20) {
        feedback.push({
          type: 'warning',
          department: 'All Departments',
          message: `Query rate at ${queryRate.toFixed(1)}% - Above acceptable threshold`,
          recommendation: 'Conduct training sessions on GE request requirements and documentation',
          priority: 'high'
        });
      }

      if (denialRate > 15) {
        feedback.push({
          type: 'error',
          department: 'All Departments',
          message: `Denial rate at ${denialRate.toFixed(1)}% - Significantly high`,
          recommendation: 'Review budget planning process and improve pre-approval consultations',
          priority: 'high'
        });
      }
    }

    setFeedbackItems(feedback.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }));
  }

  function exportReport() {
    toast.success('Exporting M&E Report...');
    // Implementation for Excel/PDF export
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading M&E Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">M&E Planning Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitoring & Evaluation - Budget Performance Analysis</p>
        </div>
        <Button onClick={exportReport} className="bg-emerald-600 hover:bg-emerald-700">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{approvalMetrics?.total_requests || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Current fiscal year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {approvalMetrics?.approval_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {approvalMetrics?.approved} of {approvalMetrics?.total_requests} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {approvalMetrics?.average_processing_days || 0} days
            </div>
            <p className="text-xs text-gray-500 mt-1">From submission to approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Query Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {approvalMetrics && approvalMetrics.total_requests > 0
                ? ((approvalMetrics.queried / approvalMetrics.total_requests) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{approvalMetrics?.queried} requests queried</p>
          </CardContent>
        </Card>
      </div>

      {/* Automated Feedback Section */}
      <Card className="border-l-4 border-l-emerald-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
            Automated Feedback & Recommendations
          </CardTitle>
          <CardDescription>
            System-generated insights and actionable recommendations based on spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedbackItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                <p>No critical issues detected. All departments are performing well.</p>
              </div>
            ) : (
              feedbackItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'error'
                      ? 'bg-red-50 border-l-red-500'
                      : item.type === 'warning'
                        ? 'bg-orange-50 border-l-orange-500'
                        : item.type === 'success'
                          ? 'bg-green-50 border-l-green-500'
                          : 'bg-blue-50 border-l-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={`${
                            item.priority === 'high'
                              ? 'border-red-500 text-red-700'
                              : item.priority === 'medium'
                                ? 'border-orange-500 text-orange-700'
                                : 'border-blue-500 text-blue-700'
                          }`}
                        >
                          {item.priority.toUpperCase()}
                        </Badge>
                        <span className="font-semibold text-gray-900">{item.department}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{item.message}</p>
                      <p className="text-sm text-gray-600 italic">
                        <strong>Recommendation:</strong> {item.recommendation}
                      </p>
                    </div>
                    {item.type === 'error' && <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 ml-2" />}
                    {item.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 ml-2" />}
                    {item.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 ml-2" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Utilization by Department */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Budget Utilization by Department
          </CardTitle>
          <CardDescription>Current year budget performance and variance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetUtilization.map((dept, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{dept.cost_centre_name}</h4>
                    <p className="text-sm text-gray-500">{dept.cost_centre_code}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      dept.utilization_percent > 90
                        ? 'border-red-500 text-red-700'
                        : dept.utilization_percent > 75
                          ? 'border-orange-500 text-orange-700'
                          : dept.utilization_percent < 30
                            ? 'border-blue-500 text-blue-700'
                            : 'border-green-500 text-green-700'
                    }
                  >
                    {dept.utilization_percent.toFixed(1)}% Utilized
                  </Badge>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      dept.utilization_percent > 90
                        ? 'bg-red-500'
                        : dept.utilization_percent > 75
                          ? 'bg-orange-500'
                          : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(dept.utilization_percent, 100)}%` }}
                  ></div>
                </div>

                {/* Financial Details */}
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Budget</p>
                    <p className="font-semibold">K{dept.total_budget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Spent</p>
                    <p className="font-semibold text-red-600">K{dept.ytd_expenditure.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Committed</p>
                    <p className="font-semibold text-orange-600">K{dept.committed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Available</p>
                    <p className="font-semibold text-emerald-600">K{dept.available.toLocaleString()}</p>
                  </div>
                </div>

                {/* Variance */}
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {dept.variance >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-green-700">
                        Under budget by K{Math.abs(dept.variance).toLocaleString()}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                      <span className="text-red-700">
                        Over budget by K{Math.abs(dept.variance).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Monthly Spending Trends
          </CardTitle>
          <CardDescription>Expenditure patterns vs budget allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {spendingTrends.map((trend, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium text-gray-600">{trend.month}</div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                    <div
                      className="absolute h-6 bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min((trend.amount / trend.budget) * 100, 100)}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      K{trend.amount.toLocaleString()} / K{trend.budget.toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="w-24 text-right text-sm">
                  {trend.variance >= 0 ? (
                    <span className="text-green-600">+K{trend.variance.toLocaleString()}</span>
                  ) : (
                    <span className="text-red-600">-K{Math.abs(trend.variance).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
