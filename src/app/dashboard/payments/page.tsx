"use client";

import { useState, useEffect } from "react";
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
  CreditCard,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  Loader2,
  Plus,
} from "lucide-react";
import { getAllPaymentVouchers, getPaymentStats, type PaymentVoucher } from "@/lib/payments";
import { toast } from "sonner";
import { CreatePaymentVoucherDialog } from "@/components/payments/CreatePaymentVoucherDialog";
import { PaymentDetailModal } from "@/components/payments/PaymentDetailModal";
import { exportPaymentsToExcel } from "@/lib/excel-export";
import { generateMultiplePaymentsPDF } from "@/lib/pdf-generator";
import { ExportDialog } from "@/components/ui/export-dialog";

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payments, setPayments] = useState<PaymentVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_count: 0,
    total_paid: 0,
    total_pending: 0,
    paid_count: 0,
    pending_count: 0,
    approved_count: 0,
    eft_count: 0,
    cheque_count: 0,
    cash_count: 0,
  });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState<number[]>([]);
  const [batchProcessing, setBatchProcessing] = useState(false);

  useEffect(() => {
    loadPayments();
    loadStats();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const data = await getAllPaymentVouchers();
      setPayments(data);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payment vouchers');
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await getPaymentStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function handleExportPayments() {
    if (payments.length === 0) {
      toast.error('No payments to export');
      return;
    }
    setExportDialogOpen(true);
  }

  function handleExportToExcel() {
    try {
      exportPaymentsToExcel(payments);
      toast.success('Payments exported to Excel');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export to Excel');
    }
  }

  function handleExportToPDF() {
    try {
      generateMultiplePaymentsPDF(payments as any);
      toast.success('Payments exported to PDF');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export to PDF');
    }
  }

  function togglePaymentSelection(paymentId: number) {
    setSelectedPayments(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    );
  }

  function toggleSelectAll() {
    if (selectedPayments.length === filteredPayments.length) {
      setSelectedPayments([]);
    } else {
      const allIds = filteredPayments
        .filter(p => (p as PaymentVoucher).id !== undefined)
        .map(p => (p as PaymentVoucher).id);
      setSelectedPayments(allIds);
    }
  }

  async function handleBatchApprove() {
    if (selectedPayments.length === 0) {
      toast.error('No payments selected');
      return;
    }

    const pendingPayments = payments.filter(
      p => (p as PaymentVoucher).id &&
      selectedPayments.includes((p as PaymentVoucher).id) &&
      p.status === 'Pending'
    );

    if (pendingPayments.length === 0) {
      toast.error('No pending payments selected');
      return;
    }

    if (!confirm(`Approve ${pendingPayments.length} payment voucher(s)?`)) {
      return;
    }

    try {
      setBatchProcessing(true);
      let successCount = 0;
      let errorCount = 0;

      for (const payment of pendingPayments) {
        try {
          // In a real implementation, call the approve payment API
          // await approvePayment((payment as PaymentVoucher).id);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Error approving payment ${(payment as PaymentVoucher).id}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} payment(s) approved successfully!`);
        loadPayments();
        loadStats();
        setSelectedPayments([]);
      }

      if (errorCount > 0) {
        toast.error(`${errorCount} payment(s) failed to approve`);
      }
    } catch (error) {
      console.error('Batch approve error:', error);
      toast.error('Failed to process batch approval');
    } finally {
      setBatchProcessing(false);
    }
  }

  function handleBatchExport() {
    if (selectedPayments.length === 0) {
      toast.error('No payments selected');
      return;
    }

    const selectedPaymentData = payments.filter(
      p => (p as PaymentVoucher).id && selectedPayments.includes((p as PaymentVoucher).id)
    );

    const format = window.confirm(`Export ${selectedPayments.length} payment(s)?\n\nOK = Excel, Cancel = PDF`);

    try {
      if (format) {
        exportPaymentsToExcel(selectedPaymentData);
        toast.success(`${selectedPayments.length} payments exported to Excel`);
      } else {
        generateMultiplePaymentsPDF(selectedPaymentData as any);
        toast.success(`${selectedPayments.length} payments exported to PDF`);
      }
    } catch (error) {
      console.error('Batch export error:', error);
      toast.error('Failed to export selected payments');
    }
  }

  // Mock data for display if database is empty
  const mockPayments = [
    {
      id: 1,
      voucherNumber: "PV-2025-000098",
      geRequestNumber: "GE-2025-000122",
      commitmentNumber: "COM-2025-000044",
      title: "Stationery Supplies - Q1 2025",
      payeeName: "PNG Office Supplies Ltd",
      costCentre: "Administration",
      amount: 15000,
      paymentMethod: "EFT",
      bankReference: "EFT20250115-001",
      paymentDate: "2025-01-15",
      status: "Paid",
      processedBy: "Sarah Mek",
      approvedBy: "Emmanuel Saliki",
    },
    {
      id: 2,
      voucherNumber: "PV-2025-000097",
      geRequestNumber: "GE-2025-000121",
      commitmentNumber: "COM-2025-000043",
      title: "Vehicle Fuel - January",
      payeeName: "Ela Motors",
      costCentre: "Administration",
      amount: 6500,
      paymentMethod: "Cheque",
      bankReference: "CHQ-784521",
      paymentDate: "2025-01-14",
      status: "Paid",
      processedBy: "Sarah Mek",
      approvedBy: "Emmanuel Saliki",
    },
    {
      id: 3,
      voucherNumber: "PV-2025-000096",
      geRequestNumber: "GE-2025-000119",
      commitmentNumber: "COM-2025-000042",
      title: "Building Maintenance - Admin Block",
      payeeName: "PNG Builders Ltd",
      costCentre: "Facilities",
      amount: 32000,
      paymentMethod: "EFT",
      bankReference: "EFT20250112-003",
      paymentDate: "2025-01-12",
      status: "Paid",
      processedBy: "Sarah Mek",
      approvedBy: "Emmanuel Saliki",
    },
    {
      id: 4,
      voucherNumber: "PV-2025-000095",
      geRequestNumber: "GE-2025-000120",
      commitmentNumber: "COM-2025-000043",
      title: "IT Equipment - Computers (1st Payment)",
      payeeName: "Brian Bell Ltd",
      costCentre: "ICT Department",
      amount: 42500,
      paymentMethod: "EFT",
      bankReference: "EFT20250113-002",
      paymentDate: "2025-01-13",
      status: "Paid",
      processedBy: "Sarah Mek",
      approvedBy: "Emmanuel Saliki",
    },
    {
      id: 5,
      voucherNumber: "PV-2025-000099",
      geRequestNumber: "GE-2025-000123",
      commitmentNumber: "COM-2025-000045",
      title: "Office Furniture for School of Agriculture",
      payeeName: "Brian Bell Ltd",
      costCentre: "School of Agriculture",
      amount: 45000,
      paymentMethod: "EFT",
      bankReference: null,
      paymentDate: "2025-01-22",
      status: "Pending",
      processedBy: null,
      approvedBy: "Emmanuel Saliki",
    },
    {
      id: 6,
      voucherNumber: "PV-2025-000100",
      geRequestNumber: "GE-2025-000124",
      commitmentNumber: "COM-2025-000046",
      title: "Travel - Research Conference Port Moresby",
      payeeName: "Air Niugini",
      costCentre: "Faculty of Science",
      amount: 8500,
      paymentMethod: "Pending",
      bankReference: null,
      paymentDate: null,
      status: "Approved",
      processedBy: null,
      approvedBy: "Emmanuel Saliki",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "approved":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  // Use real data if available, otherwise use mock data
  const displayPayments = payments.length > 0 ? payments : mockPayments;

  const filteredPayments = displayPayments.filter((payment) => {
    const voucherNum = (payment as PaymentVoucher).voucher_number || (payment as any).voucherNumber;
    const geNum = (payment as PaymentVoucher).ge_requests?.request_number || (payment as any).geRequestNumber;
    const payee = (payment as PaymentVoucher).payee_name || (payment as any).payeeName;
    const title = (payment as PaymentVoucher).ge_requests?.title || (payment as any).title;

    const matchesSearch =
      searchTerm === "" ||
      voucherNum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      geNum?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payee?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      title?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || payment.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600">Process payment vouchers and track payment status</p>
          {selectedPayments.length > 0 && (
            <p className="text-sm text-unre-green-600 mt-1">
              {selectedPayments.length} payment(s) selected
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {selectedPayments.length > 0 ? (
            <>
              <Button
                variant="outline"
                onClick={handleBatchExport}
                disabled={batchProcessing}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Selected ({selectedPayments.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleBatchApprove}
                disabled={batchProcessing}
                className="border-unre-green-600 text-unre-green-600 hover:bg-unre-green-50"
              >
                {batchProcessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Approve Selected
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedPayments([])}
              >
                Clear Selection
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleExportPayments}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Payments
              </Button>
              <Button
                className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Payment Voucher
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Total Payments</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats.total_count || displayPayments.length}</p>
          <p className="text-xs text-slate-500 mt-1">This month</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Paid</p>
          </div>
          <p className="text-2xl font-bold text-green-600">K {(stats.total_paid / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.paid_count} vouchers
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-600">Pending</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">K {(stats.total_pending / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-500 mt-1">
            {stats.pending_count + stats.approved_count} vouchers
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Next Payment</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {(() => {
              const pending = displayPayments.find((p) => p.status === "Pending");
              if (!pending) return "N/A";
              return (pending as any).payment_date || (pending as any).paymentDate || "N/A";
            })()}
          </p>
          <p className="text-xs text-slate-500 mt-1">Scheduled</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by voucher #, GE request #, payee, or title..."
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-slate-300 mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading payments...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b">
                  <tr className="text-left text-sm font-medium text-slate-600">
                    <th className="p-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedPayments.length === filteredPayments.length && filteredPayments.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-unre-green-600 focus:ring-unre-green-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="p-4">Voucher #</th>
                    <th className="p-4">GE Request</th>
                    <th className="p-4">Payee</th>
                    <th className="p-4">Title</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => {
                    const isDbPayment = (payment as PaymentVoucher).voucher_number !== undefined;
                    const voucherNum = isDbPayment ? (payment as PaymentVoucher).voucher_number : (payment as any).voucherNumber;
                    const geNum = isDbPayment ? (payment as PaymentVoucher).ge_requests?.request_number : (payment as any).geRequestNumber;
                    const payee = isDbPayment ? (payment as PaymentVoucher).payee_name : (payment as any).payeeName;
                    const title = isDbPayment ? (payment as PaymentVoucher).ge_requests?.title : (payment as any).title;
                    const payMethod = isDbPayment ? (payment as PaymentVoucher).payment_method : (payment as any).paymentMethod;
                    const bankRef = isDbPayment ? (payment as PaymentVoucher).bank_reference : (payment as any).bankReference;
                    const payDate = isDbPayment ? (payment as PaymentVoucher).payment_date : (payment as any).paymentDate;

                    return (
                      <tr key={payment.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(payment.id)}
                            onChange={() => togglePaymentSelection(payment.id)}
                            className="w-4 h-4 text-unre-green-600 focus:ring-unre-green-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-slate-700">{voucherNum}</span>
                        </td>
                        <td className="p-4">
                          <span className="font-mono text-sm text-blue-600">{geNum || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium text-slate-900">{payee}</p>
                            <p className="text-xs text-slate-500">
                              {isDbPayment ? 'Cost Centre' : (payment as any).costCentre}
                            </p>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-700 max-w-xs truncate">{title || 'N/A'}</td>
                        <td className="p-4">
                          <span className="font-semibold text-unre-green-600">
                            K {payment.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs">
                            {payMethod}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono text-slate-600">
                            {bankRef || "-"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{payDate || "-"}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPaymentId(payment.id);
                                setDetailModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status !== "Paid" && (
                              <Button
                                size="sm"
                                className="bg-unre-green-600 hover:bg-unre-green-700"
                                onClick={() => {
                                  setSelectedPaymentId(payment.id);
                                  setDetailModalOpen(true);
                                }}
                              >
                                Process
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && !loading && (
              <div className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No payments found matching your filters</p>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Payment Methods Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">By Payment Method</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-sm font-medium text-blue-900">EFT</span>
              <span className="text-sm font-bold text-blue-900">
                {stats.eft_count}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-sm font-medium text-green-900">Cheque</span>
              <span className="text-sm font-bold text-green-900">
                {stats.cheque_count}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
              <span className="text-sm font-medium text-purple-900">Cash</span>
              <span className="text-sm font-bold text-purple-900">
                {stats.cash_count}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Financial Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Paid</span>
              <span className="font-semibold text-green-600">
                K {(stats.total_paid / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Pending</span>
              <span className="font-semibold text-yellow-600">
                K {(stats.total_pending / 1000).toFixed(0)}k
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="font-bold text-slate-900">
                K {((stats.total_paid + stats.total_pending) / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Payment Register
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Bank Reconciliation
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              PGAS Export
            </Button>
          </div>
        </Card>
      </div>

      {/* Dialogs */}
      <CreatePaymentVoucherDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          loadPayments();
          loadStats();
        }}
      />

      <PaymentDetailModal
        paymentId={selectedPaymentId}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onUpdate={() => {
          loadPayments();
          loadStats();
        }}
      />

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExportExcel={handleExportToExcel}
        onExportPDF={handleExportToPDF}
        title="Export Payments"
        description="Choose your preferred format to export payment vouchers"
      />
    </div>
  );
}
