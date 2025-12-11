"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  // Mock data - in production, this would come from API/Supabase
  const stats = [
    {
      name: "Total Budget (2025)",
      value: "K 12,500,000",
      change: "+5.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      name: "YTD Expenditure",
      value: "K 6,250,000",
      change: "50% utilized",
      trend: "neutral",
      icon: TrendingUp,
      color: "text-unre-green-600",
      bgColor: "bg-unre-green-50",
    },
    {
      name: "Committed",
      value: "K 1,850,000",
      change: "15% of budget",
      trend: "neutral",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      name: "Available Balance",
      value: "K 4,400,000",
      change: "35% remaining",
      trend: "down",
      icon: AlertCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      requestNumber: "GE-2025-000123",
      title: "Office Furniture for School of Agriculture",
      amount: "K 45,000",
      requester: "John Kila",
      costCentre: "School of Agriculture",
      daysWaiting: 2,
      priority: "Normal",
    },
    {
      id: 2,
      requestNumber: "GE-2025-000124",
      title: "Travel - Research Conference Port Moresby",
      amount: "K 8,500",
      requester: "Mary Bola",
      costCentre: "Faculty of Science",
      daysWaiting: 1,
      priority: "Urgent",
    },
    {
      id: 3,
      requestNumber: "GE-2025-000125",
      title: "Laboratory Equipment Maintenance",
      amount: "K 22,300",
      requester: "Peter Wana",
      costCentre: "School of Natural Resources",
      daysWaiting: 3,
      priority: "Normal",
    },
  ];

  const recentRequests = [
    {
      id: 1,
      requestNumber: "GE-2025-000122",
      title: "Stationery Supplies - Q1 2025",
      amount: "K 15,000",
      status: "Committed",
      date: "2025-01-15",
    },
    {
      id: 2,
      requestNumber: "GE-2025-000121",
      title: "Vehicle Fuel - January",
      amount: "K 6,500",
      status: "Paid",
      date: "2025-01-14",
    },
    {
      id: 3,
      requestNumber: "GE-2025-000120",
      title: "IT Equipment - Computers",
      amount: "K 85,000",
      status: "Pending Bursar",
      date: "2025-01-13",
    },
    {
      id: 4,
      requestNumber: "GE-2025-000119",
      title: "Building Maintenance - Admin Block",
      amount: "K 32,000",
      status: "Approved",
      date: "2025-01-12",
    },
  ];

  const costCentreSpending = [
    { name: "School of Agriculture", budget: 2500000, spent: 1200000, committed: 300000 },
    { name: "Faculty of Science", budget: 3000000, spent: 1500000, committed: 450000 },
    { name: "School of Natural Resources", budget: 2800000, spent: 1400000, committed: 280000 },
    { name: "Administration", budget: 1500000, spent: 750000, committed: 225000 },
    { name: "Library Services", budget: 800000, spent: 400000, committed: 120000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "committed":
      case "approved":
        return "bg-unre-green-100 text-blue-800";
      case "pending hod":
      case "pending dean":
      case "pending bursar":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              {stat.trend === "up" && <TrendingUp className="h-5 w-5 text-green-600" />}
              {stat.trend === "down" && <TrendingDown className="h-5 w-5 text-red-600" />}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-600 mb-2">{stat.name}</p>
            <p className="text-xs text-slate-500">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-bold text-slate-900">Pending My Approval</h3>
              <Badge className="bg-orange-500">5</Badge>
            </div>
            <Link href="/dashboard/approvals">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-slate-500">{request.requestNumber}</span>
                      {request.priority === "Urgent" && (
                        <Badge className="bg-red-500">Urgent</Badge>
                      )}
                    </div>
                    <h4 className="font-semibold text-slate-900">{request.title}</h4>
                  </div>
                  <span className="text-lg font-bold text-unre-green-600">{request.amount}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <div>
                    <p>Requester: {request.requester}</p>
                    <p className="text-xs text-slate-500">{request.costCentre}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {request.daysWaiting} days waiting
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="outline">View Details</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/dashboard/requests/new">
              <Button className="w-full justify-start bg-gradient-to-r from-unre-green-600 to-unre-green-700 hover:from-unre-green-700 hover:to-unre-green-800">
                <FileText className="mr-2 h-4 w-4" />
                New GE Request
              </Button>
            </Link>
            <Link href="/dashboard/requests">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                My Requests
              </Button>
            </Link>
            <Link href="/dashboard/budget">
              <Button variant="outline" className="w-full justify-start">
                <DollarSign className="mr-2 h-4 w-4" />
                Budget Status
              </Button>
            </Link>
            <Link href="/dashboard/reports">
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Budget Alerts</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-yellow-900">Low Balance</p>
                  <p className="text-yellow-700">Stationery vote at 85%</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-2 bg-unre-green-50 rounded border border-blue-200">
                <AlertCircle className="h-4 w-4 text-unre-green-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-blue-900">PGAS Sync</p>
                  <p className="text-blue-700">Last synced 2 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Cost Centre Spending */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Cost Centre Spending Overview</h3>
          <Link href="/dashboard/budget">
            <Button variant="outline" size="sm">
              View Detailed Budget
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {costCentreSpending.map((centre, idx) => {
            const utilization = ((centre.spent + centre.committed) / centre.budget) * 100;
            const spentPercent = (centre.spent / centre.budget) * 100;
            const committedPercent = (centre.committed / centre.budget) * 100;

            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{centre.name}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                      K {((centre.spent + centre.committed) / 1000).toFixed(0)}k / K {(centre.budget / 1000).toFixed(0)}k
                    </p>
                    <p className="text-xs text-slate-600">{utilization.toFixed(1)}% utilized</p>
                  </div>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-green-500"
                      style={{ width: `${spentPercent}%` }}
                      title={`Spent: K ${centre.spent.toLocaleString()}`}
                    />
                    <div
                      className="bg-orange-400"
                      style={{ width: `${committedPercent}%` }}
                      title={`Committed: K ${centre.committed.toLocaleString()}`}
                    />
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    Spent: K {(centre.spent / 1000).toFixed(0)}k
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-orange-400 rounded-full" />
                    Committed: K {(centre.committed / 1000).toFixed(0)}k
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="h-2 w-2 bg-slate-200 rounded-full" />
                    Available: K {((centre.budget - centre.spent - centre.committed) / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Requests */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">Recent GE Requests</h3>
          <Link href="/dashboard/requests">
            <Button variant="outline" size="sm">
              View All Requests
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-slate-600">
                <th className="pb-3 font-medium">Request #</th>
                <th className="pb-3 font-medium">Title</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {recentRequests.map((request) => (
                <tr key={request.id} className="border-b last:border-0">
                  <td className="py-3 text-sm font-mono text-slate-600">{request.requestNumber}</td>
                  <td className="py-3 text-sm font-medium text-slate-900">{request.title}</td>
                  <td className="py-3 text-sm font-semibold text-unre-green-600">{request.amount}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </td>
                  <td className="py-3 text-sm text-slate-600">{request.date}</td>
                  <td className="py-3">
                    <Button variant="ghost" size="sm">View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
