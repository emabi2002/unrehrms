"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Filter,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  exportGERequestsToExcel,
  exportCommitmentsToExcel,
  exportPaymentsToExcel,
  exportBudgetToExcel,
  exportComprehensiveReport,
} from "@/lib/excel-export";
import { generateMultiplePaymentsPDF } from "@/lib/pdf-generator";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("comprehensive");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [costCentre, setCostCentre] = useState("all");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalCommitments: 0,
    totalPayments: 0,
    totalBudget: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Load summary statistics
      const { data: requests } = await supabase.from('ge_requests').select('total_amount');
      const { data: commitments } = await supabase.from('commitments').select('amount');
      const { data: payments } = await supabase.from('payment_vouchers').select('amount').eq('status', 'Paid');
      const { data: budget } = await supabase.from('budget_lines').select('original_amount');

      setStats({
        totalRequests: requests?.length || 0,
        totalCommitments: commitments?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0,
        totalPayments: payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
        totalBudget: budget?.reduce((sum: number, b: any) => sum + b.original_amount, 0) || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function generateReport(format: 'excel' | 'pdf') {
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    try {
      setLoading(true);
      toast.info(`Generating ${reportType} report...`);

      let query = supabase.from('').select('*');

      // Apply date filter
      if (startDate && endDate) {
        query = query.gte('created_at', startDate).lte('created_at', endDate);
      }

      switch (reportType) {
        case 'ge-requests':
          const { data: requests } = await supabase
            .from('ge_requests')
            .select(`
              *,
              cost_centres(name),
              budget_lines(description),
              user_profiles!ge_requests_requester_id_fkey(full_name)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (format === 'excel') {
            exportGERequestsToExcel(requests || []);
          }
          break;

        case 'commitments':
          const { data: commitments } = await supabase
            .from('commitments')
            .select(`
              *,
              ge_requests(request_number, title),
              cost_centres(name),
              budget_lines(description)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (format === 'excel') {
            exportCommitmentsToExcel(commitments || []);
          }
          break;

        case 'payments':
          const { data: payments } = await supabase
            .from('payment_vouchers')
            .select(`
              *,
              ge_requests(request_number),
              commitments(commitment_number),
              approver:user_profiles!payment_vouchers_approved_by_fkey(full_name),
              processor:user_profiles!payment_vouchers_processed_by_fkey(full_name)
            `)
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          if (format === 'excel') {
            exportPaymentsToExcel(payments || []);
          } else if (format === 'pdf') {
            generateMultiplePaymentsPDF(payments || []);
          }
          break;

        case 'budget':
          const { data: budget } = await supabase
            .from('budget_lines')
            .select('*, cost_centres(name)');

          if (format === 'excel') {
            exportBudgetToExcel(budget || []);
          }
          break;

        case 'comprehensive':
          const { data: allRequests } = await supabase
            .from('ge_requests')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const { data: allCommitments } = await supabase
            .from('commitments')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const { data: allPayments } = await supabase
            .from('payment_vouchers')
            .select('*')
            .gte('created_at', startDate)
            .lte('created_at', endDate);

          const { data: allBudget } = await supabase
            .from('budget_lines')
            .select('*');

          exportComprehensiveReport({
            requests: allRequests || [],
            commitments: allCommitments || [],
            payments: allPayments || [],
            budget: allBudget || [],
          });
          break;
      }

      toast.success(`Report generated successfully!`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600">Generate comprehensive reports and export data</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">GE Requests</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.totalRequests}</p>
          <p className="text-xs text-slate-500 mt-1">Total submitted</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Commitments</p>
          </div>
          <p className="text-2xl font-bold text-green-600">K {(stats.totalCommitments / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-500 mt-1">Total committed</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Payments</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">K {(stats.totalPayments / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-500 mt-1">Total paid</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Budget</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">K {(stats.totalBudget / 1000).toFixed(0)}k</p>
          <p className="text-xs text-slate-500 mt-1">Total allocation</p>
        </Card>
      </div>

      {/* Report Generator */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-unre-green-600" />
          <h2 className="text-lg font-semibold text-slate-900">Generate Report</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                <SelectItem value="ge-requests">GE Requests</SelectItem>
                <SelectItem value="commitments">Commitments</SelectItem>
                <SelectItem value="payments">Payment Vouchers</SelectItem>
                <SelectItem value="budget">Budget Overview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Cost Centre Filter */}
          <div className="space-y-2">
            <Label htmlFor="costCentre">Cost Centre</Label>
            <Select value={costCentre} onValueChange={setCostCentre}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cost Centres</SelectItem>
                <SelectItem value="agriculture">School of Agriculture</SelectItem>
                <SelectItem value="forestry">School of Forestry</SelectItem>
                <SelectItem value="admin">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => generateReport('excel')}
            disabled={loading}
            className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to Excel
              </>
            )}
          </Button>

          {(reportType === 'payments' || reportType === 'comprehensive') && (
            <Button
              onClick={() => generateReport('pdf')}
              disabled={loading}
              variant="outline"
            >
              <Download className="mr-2 h-4 w-4" />
              Export to PDF
            </Button>
          )}
        </div>
      </Card>

      {/* Pre-defined Reports */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
              setReportType('comprehensive');
            }}
          >
            <Calendar className="h-5 w-5 mb-2 text-unre-green-600" />
            <span className="font-semibold">Month-to-Date</span>
            <span className="text-xs text-slate-500">Current month activity</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              const today = new Date();
              const firstDay = new Date(today.getFullYear(), 0, 1);
              setStartDate(firstDay.toISOString().split('T')[0]);
              setEndDate(today.toISOString().split('T')[0]);
              setReportType('budget');
            }}
          >
            <DollarSign className="h-5 w-5 mb-2 text-unre-green-600" />
            <span className="font-semibold">Year-to-Date Budget</span>
            <span className="text-xs text-slate-500">Annual budget status</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4 flex flex-col items-start"
            onClick={() => {
              const today = new Date();
              const last30Days = new Date(today.setDate(today.getDate() - 30));
              setStartDate(last30Days.toISOString().split('T')[0]);
              setEndDate(new Date().toISOString().split('T')[0]);
              setReportType('payments');
            }}
          >
            <Users className="h-5 w-5 mb-2 text-unre-green-600" />
            <span className="font-semibold">Recent Payments</span>
            <span className="text-xs text-slate-500">Last 30 days</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
