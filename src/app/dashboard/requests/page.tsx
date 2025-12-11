"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Search, Filter, Download, Eye } from "lucide-react";
import Link from "next/link";

export default function RequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  // Mock data
  const requests = [
    {
      id: 1,
      requestNumber: "GE-2025-000125",
      title: "Laboratory Equipment Maintenance",
      description: "Annual maintenance for laboratory equipment in Science Faculty",
      amount: 22300,
      status: "Pending HOD",
      costCentre: "School of Natural Resources",
      budgetLine: "Operating - Maintenance",
      requester: "Peter Wana",
      createdDate: "2025-01-20",
      priority: "Normal",
    },
    {
      id: 2,
      requestNumber: "GE-2025-000124",
      title: "Travel - Research Conference Port Moresby",
      description: "Attendance to National Research Conference",
      amount: 8500,
      status: "Pending Dean",
      costCentre: "Faculty of Science",
      budgetLine: "Operating - Travel",
      requester: "Mary Bola",
      createdDate: "2025-01-19",
      priority: "Urgent",
    },
    {
      id: 3,
      requestNumber: "GE-2025-000123",
      title: "Office Furniture for School of Agriculture",
      description: "Desks, chairs, and filing cabinets for new staff offices",
      amount: 45000,
      status: "Pending Bursar",
      costCentre: "School of Agriculture",
      budgetLine: "Capital - Furniture",
      requester: "John Kila",
      createdDate: "2025-01-18",
      priority: "Normal",
    },
    {
      id: 4,
      requestNumber: "GE-2025-000122",
      title: "Stationery Supplies - Q1 2025",
      description: "Office stationery for first quarter",
      amount: 15000,
      status: "Committed",
      costCentre: "Administration",
      budgetLine: "Operating - Stationery",
      requester: "Sarah Mek",
      createdDate: "2025-01-15",
      priority: "Normal",
    },
    {
      id: 5,
      requestNumber: "GE-2025-000121",
      title: "Vehicle Fuel - January",
      description: "Monthly fuel allocation for university vehicles",
      amount: 6500,
      status: "Paid",
      costCentre: "Administration",
      budgetLine: "Operating - Fuel",
      requester: "David Tom",
      createdDate: "2025-01-14",
      priority: "Normal",
    },
    {
      id: 6,
      requestNumber: "GE-2025-000120",
      title: "IT Equipment - Computers",
      description: "10 desktop computers for computer lab",
      amount: 85000,
      status: "Approved",
      costCentre: "ICT Department",
      budgetLine: "Capital - IT Equipment",
      requester: "Michael Kare",
      createdDate: "2025-01-13",
      priority: "Normal",
    },
    {
      id: 7,
      requestNumber: "GE-2025-000119",
      title: "Building Maintenance - Admin Block",
      description: "Repairs to roof and guttering",
      amount: 32000,
      status: "Paid",
      costCentre: "Facilities",
      budgetLine: "Operating - Maintenance",
      requester: "James Noki",
      createdDate: "2025-01-12",
      priority: "Urgent",
    },
    {
      id: 8,
      requestNumber: "GE-2025-000118",
      title: "Library Books - Agriculture Section",
      description: "New textbooks and reference materials",
      amount: 12500,
      status: "Rejected",
      costCentre: "Library Services",
      budgetLine: "Operating - Library",
      requester: "Lisa Poka",
      createdDate: "2025-01-10",
      priority: "Normal",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "committed":
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending hod":
      case "pending dean":
      case "pending bursar":
      case "pending registrar":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "draft":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === "Urgent" ? "bg-red-500" : "bg-slate-400";
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      searchTerm === "" ||
      req.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || req.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">GE Requests</h1>
          <p className="text-slate-600">View and manage all GE requests</p>
        </div>
        <Link href="/dashboard/requests/new">
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
            <Plus className="mr-2 h-4 w-4" />
            New GE Request
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by request #, title, or requester..."
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
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending hod">Pending HOD</SelectItem>
              <SelectItem value="pending dean">Pending Dean</SelectItem>
              <SelectItem value="pending bursar">Pending Bursar</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="committed">Committed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Requests</p>
          <p className="text-2xl font-bold text-slate-900">{requests.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Value</p>
          <p className="text-2xl font-bold text-blue-600">
            K {(requests.reduce((sum, req) => sum + req.amount, 0) / 1000).toFixed(1)}k
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">
            {requests.filter((r) => r.status.toLowerCase().includes("pending")).length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {requests.filter((r) => r.status.toLowerCase() === "paid").length}
          </p>
        </Card>
      </div>

      {/* Requests Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-sm font-medium text-slate-600">
                <th className="p-4">Request #</th>
                <th className="p-4">Title</th>
                <th className="p-4">Cost Centre</th>
                <th className="p-4">Requester</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id} className="border-b hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {request.priority === "Urgent" && (
                        <span className={`h-2 w-2 rounded-full ${getPriorityColor(request.priority)}`} />
                      )}
                      <span className="font-mono text-sm text-slate-600">{request.requestNumber}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{request.title}</p>
                      <p className="text-xs text-slate-500">{request.budgetLine}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700">{request.costCentre}</td>
                  <td className="p-4 text-sm text-slate-700">{request.requester}</td>
                  <td className="p-4">
                    <span className="font-semibold text-blue-600">
                      K {request.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{request.createdDate}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/requests/${request.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No requests found matching your filters</p>
          </div>
        )}
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
}
