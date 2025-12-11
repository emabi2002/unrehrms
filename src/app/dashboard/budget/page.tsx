"use client";

import { useState } from "react";
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
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  RefreshCw,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default function BudgetPage() {
  const [costCentreFilter, setCostCentreFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Mock data - in production, fetch from Supabase + PGAS
  const budgetSummary = {
    totalBudget: 12500000,
    ytdExpenditure: 6250000,
    totalCommitted: 1850000,
    availableBalance: 4400000,
    lastPgasSync: "2 hours ago",
  };

  const budgetLines = [
    {
      id: 1,
      costCentre: "School of Agriculture",
      pgasVote: "AGR-001",
      aapCode: "2025-AGR-OP-TRAV",
      description: "Operating - Travel",
      category: "Operating",
      originalBudget: 250000,
      ytdExpenditure: 120000,
      committed: 35000,
      available: 95000,
      utilization: 62,
      transactions: 15,
    },
    {
      id: 2,
      costCentre: "School of Agriculture",
      pgasVote: "AGR-002",
      aapCode: "2025-AGR-OP-STAT",
      description: "Operating - Stationery",
      category: "Operating",
      originalBudget: 150000,
      ytdExpenditure: 80000,
      committed: 25000,
      available: 45000,
      utilization: 70,
      transactions: 22,
    },
    {
      id: 3,
      costCentre: "Faculty of Science",
      pgasVote: "SCI-001",
      aapCode: "2025-SCI-OP-MAINT",
      description: "Operating - Maintenance",
      category: "Operating",
      originalBudget: 350000,
      ytdExpenditure: 180000,
      committed: 55000,
      available: 115000,
      utilization: 67,
      transactions: 18,
    },
    {
      id: 4,
      costCentre: "Faculty of Science",
      pgasVote: "SCI-002",
      aapCode: "2025-SCI-CAP-EQUIP",
      description: "Capital - Laboratory Equipment",
      category: "Capital",
      originalBudget: 850000,
      ytdExpenditure: 420000,
      committed: 180000,
      available: 250000,
      utilization: 71,
      transactions: 8,
    },
    {
      id: 5,
      costCentre: "School of Natural Resources",
      pgasVote: "NRS-001",
      aapCode: "2025-NRS-OP-FUEL",
      description: "Operating - Fuel",
      category: "Operating",
      originalBudget: 180000,
      ytdExpenditure: 95000,
      committed: 22000,
      available: 63000,
      utilization: 65,
      transactions: 28,
    },
    {
      id: 6,
      costCentre: "Administration",
      pgasVote: "ADM-001",
      aapCode: "2025-ADM-OP-UTIL",
      description: "Operating - Utilities",
      category: "Operating",
      originalBudget: 420000,
      ytdExpenditure: 210000,
      committed: 50000,
      available: 160000,
      utilization: 62,
      transactions: 12,
    },
    {
      id: 7,
      costCentre: "Administration",
      pgasVote: "ADM-002",
      aapCode: "2025-ADM-CAP-FURN",
      description: "Capital - Furniture & Fittings",
      category: "Capital",
      originalBudget: 320000,
      ytdExpenditure: 180000,
      committed: 45000,
      available: 95000,
      utilization: 70,
      transactions: 6,
    },
    {
      id: 8,
      costCentre: "ICT Department",
      pgasVote: "ICT-001",
      aapCode: "2025-ICT-CAP-IT",
      description: "Capital - IT Equipment",
      category: "Capital",
      originalBudget: 950000,
      ytdExpenditure: 520000,
      committed: 220000,
      available: 210000,
      utilization: 78,
      transactions: 11,
    },
    {
      id: 9,
      costCentre: "Library Services",
      pgasVote: "LIB-001",
      aapCode: "2025-LIB-OP-BOOKS",
      description: "Operating - Library Books",
      category: "Operating",
      originalBudget: 280000,
      ytdExpenditure: 140000,
      committed: 35000,
      available: 105000,
      utilization: 63,
      transactions: 14,
    },
  ];

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return "text-red-600 bg-red-50";
    if (utilization >= 75) return "text-orange-600 bg-orange-50";
    if (utilization >= 50) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getUtilizationBadgeColor = (utilization: number) => {
    if (utilization >= 90) return "bg-red-100 text-red-800 border-red-200";
    if (utilization >= 75) return "bg-orange-100 text-orange-800 border-orange-200";
    if (utilization >= 50) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  const filteredBudgetLines = budgetLines.filter((line) => {
    const matchesCostCentre = costCentreFilter === "all" || line.costCentre === costCentreFilter;
    const matchesCategory = categoryFilter === "all" || line.category === categoryFilter;
    return matchesCostCentre && matchesCategory;
  });

  const utilizationPercent = ((budgetSummary.ytdExpenditure + budgetSummary.totalCommitted) / budgetSummary.totalBudget) * 100;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budget Overview</h1>
          <p className="text-slate-600">AAP Budget integrated with PGAS - Financial Year 2025</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync PGAS
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Total Budget 2025</p>
          <p className="text-2xl font-bold text-slate-900">K {(budgetSummary.totalBudget / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">AAP Allocation</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingDown className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">YTD Expenditure</p>
          <p className="text-2xl font-bold text-green-600">K {(budgetSummary.ytdExpenditure / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">{((budgetSummary.ytdExpenditure / budgetSummary.totalBudget) * 100).toFixed(1)}% spent (from PGAS)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-50 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Committed</p>
          <p className="text-2xl font-bold text-orange-600">K {(budgetSummary.totalCommitted / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">{((budgetSummary.totalCommitted / budgetSummary.totalBudget) * 100).toFixed(1)}% committed (GE system)</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-purple-600">K {(budgetSummary.availableBalance / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-slate-500 mt-1">{((budgetSummary.availableBalance / budgetSummary.totalBudget) * 100).toFixed(1)}% remaining</p>
        </Card>
      </div>

      {/* Overall Utilization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Budget Utilization</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-700">Budget Performance</span>
              <span className="font-semibold">{utilizationPercent.toFixed(1)}% Utilized</span>
            </div>
            <div className="h-8 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div
                  className="bg-green-500"
                  style={{ width: `${(budgetSummary.ytdExpenditure / budgetSummary.totalBudget) * 100}%` }}
                  title="Spent"
                />
                <div
                  className="bg-orange-400"
                  style={{ width: `${(budgetSummary.totalCommitted / budgetSummary.totalBudget) * 100}%` }}
                  title="Committed"
                />
              </div>
            </div>
            <div className="flex gap-6 mt-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-green-500 rounded" />
                <span className="text-slate-600">Spent: K {(budgetSummary.ytdExpenditure / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-orange-400 rounded" />
                <span className="text-slate-600">Committed: K {(budgetSummary.totalCommitted / 1000).toFixed(0)}k</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-slate-200 rounded" />
                <span className="text-slate-600">Available: K {(budgetSummary.availableBalance / 1000).toFixed(0)}k</span>
              </div>
              <div className="ml-auto text-slate-500">
                Last PGAS sync: {budgetSummary.lastPgasSync}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={costCentreFilter} onValueChange={setCostCentreFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Cost Centres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cost Centres</SelectItem>
              <SelectItem value="School of Agriculture">School of Agriculture</SelectItem>
              <SelectItem value="Faculty of Science">Faculty of Science</SelectItem>
              <SelectItem value="School of Natural Resources">School of Natural Resources</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="ICT Department">ICT Department</SelectItem>
              <SelectItem value="Library Services">Library Services</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Operating">Operating Expenses</SelectItem>
              <SelectItem value="Capital">Capital Expenditure</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">View Chart</Button>
            <Link href="/dashboard/pgas" className="flex-1">
              <Button variant="outline" className="w-full">PGAS Sync</Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Budget Lines Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-sm font-medium text-slate-600">
                <th className="p-4">Cost Centre / Budget Line</th>
                <th className="p-4">PGAS Vote</th>
                <th className="p-4">Original Budget</th>
                <th className="p-4">YTD Expenditure</th>
                <th className="p-4">Committed</th>
                <th className="p-4">Available</th>
                <th className="p-4">Utilization</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBudgetLines.map((line) => (
                <tr key={line.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{line.description}</p>
                      <p className="text-xs text-slate-500">{line.costCentre}</p>
                      <p className="text-xs text-slate-400 font-mono">{line.aapCode}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-sm text-slate-600">{line.pgasVote}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-slate-900">K {line.originalBudget.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="text-green-700 font-semibold">K {line.ytdExpenditure.toLocaleString()}</span>
                      <p className="text-xs text-slate-500">{line.transactions} transactions</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-orange-700 font-semibold">K {line.committed.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-purple-700 font-semibold">K {line.available.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div className="space-y-2">
                      <Badge className={getUtilizationBadgeColor(line.utilization)}>
                        {line.utilization}%
                      </Badge>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden w-24">
                        <div
                          className={`h-full ${
                            line.utilization >= 90
                              ? "bg-red-500"
                              : line.utilization >= 75
                                ? "bg-orange-500"
                                : "bg-green-500"
                          }`}
                          style={{ width: `${line.utilization}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget Alerts</h3>
        <div className="space-y-3">
          {budgetLines
            .filter((line) => line.utilization >= 75)
            .map((line) => (
              <div
                key={line.id}
                className={`p-4 rounded-lg border ${
                  line.utilization >= 90
                    ? "bg-red-50 border-red-200"
                    : "bg-orange-50 border-orange-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle
                    className={`h-5 w-5 mt-0.5 ${
                      line.utilization >= 90 ? "text-red-600" : "text-orange-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${
                        line.utilization >= 90 ? "text-red-900" : "text-orange-900"
                      }`}
                    >
                      {line.utilization >= 90 ? "Critical" : "Warning"}: {line.utilization}% Budget Utilized
                    </p>
                    <p className="text-sm text-slate-700 mt-1">
                      {line.description} ({line.costCentre}) - Available: K {line.available.toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
