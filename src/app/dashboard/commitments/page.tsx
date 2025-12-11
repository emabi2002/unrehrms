"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Search,
  Download,
  Eye,
  DollarSign,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { getAllCommitments, getCommitmentStats, type Commitment } from "@/lib/commitments";
import { toast } from "sonner";

export default function CommitmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_committed: 0,
    total_paid: 0,
    total_remaining: 0,
    open_count: 0,
    partial_count: 0,
    closed_count: 0,
  });

  useEffect(() => {
    loadCommitments();
    loadStats();
  }, []);

  async function loadCommitments() {
    try {
      setLoading(true);
      const data = await getAllCommitments();
      setCommitments(data);
    } catch (error) {
      console.error('Error loading commitments:', error);
      toast.error('Failed to load commitments');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await getCommitmentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "partial":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "closed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const filteredCommitments = commitments.filter((commitment) => {
    const matchesSearch =
      searchTerm === "" ||
      commitment.commitment_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commitment.ge_requests?.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commitment.ge_requests?.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || commitment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commitments</h1>
          <p className="text-slate-600">Track and manage budget commitments from approved GE requests</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Total Committed</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">K {(stats.total_committed / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">{commitments.length} commitments</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Total Paid</p>
          </div>
          <p className="text-2xl font-bold text-green-600">K {(stats.total_paid / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.total_committed > 0 ? ((stats.total_paid / stats.total_committed) * 100).toFixed(1) : 0}% of total
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-600">Outstanding</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">K {(stats.total_remaining / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.open_count} open
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Current FY</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">2025</p>
          <p className="text-xs text-slate-500 mt-1">Financial year</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by commitment #, GE request #, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Commitments Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading commitments...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-left text-sm font-medium text-slate-600">
                    <th className="p-4">Commitment #</th>
                    <th className="p-4">GE Request</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Cost Centre</th>
                    <th className="p-4">Committed</th>
                    <th className="p-4">Paid</th>
                    <th className="p-4">Remaining</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCommitments.map((commitment) => {
                    const paidAmount = commitment.amount - (commitment.remaining_amount || 0);
                    return (
                      <tr key={commitment.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-sm text-slate-700">{commitment.commitment_number}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-blue-600">
                            {commitment.ge_requests?.request_number || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">
                              {commitment.ge_requests?.title || 'N/A'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {commitment.budget_lines?.description || 'N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-700">
                          {commitment.cost_centres?.name || 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-blue-600">
                            K {commitment.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-green-600">
                            K {paidAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-yellow-600">
                            K {(commitment.remaining_amount || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(commitment.status)}>{commitment.status}</Badge>
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/commitments/${commitment.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredCommitments.length === 0 && !loading && (
              <div className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No commitments found matching your filters</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Commitment Status Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Commitment Status Summary</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <p className="font-semibold text-green-900">Open</p>
              <p className="text-sm text-green-700">No payments made</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-900">{stats.open_count}</p>
              <p className="text-sm text-green-700">Commitments</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p className="font-semibold text-yellow-900">Partial</p>
              <p className="text-sm text-yellow-700">Partially paid</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-900">{stats.partial_count}</p>
              <p className="text-sm text-yellow-700">Commitments</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <p className="font-semibold text-blue-900">Closed</p>
              <p className="text-sm text-blue-700">Fully paid</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{stats.closed_count}</p>
              <p className="text-sm text-blue-700">Commitments</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
