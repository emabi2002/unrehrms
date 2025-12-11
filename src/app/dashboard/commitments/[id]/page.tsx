"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Calendar,
  Building2,
  TrendingUp,
  CreditCard,
  Download,
  Loader2,
} from "lucide-react";
import { getCommitmentById } from "@/lib/commitments";
import { getPaymentsByCommitment } from "@/lib/payments";
import type { Commitment } from "@/lib/commitments";
import type { PaymentVoucher } from "@/lib/payments";
import { toast } from "sonner";

export default function CommitmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commitmentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [commitment, setCommitment] = useState<Commitment | null>(null);
  const [payments, setPayments] = useState<PaymentVoucher[]>([]);

  const loadCommitmentDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Load commitment details
      const commitmentData = await getCommitmentById(parseInt(commitmentId));
      setCommitment(commitmentData);

      // Load related payments
      const paymentsData = await getPaymentsByCommitment(parseInt(commitmentId));
      setPayments(paymentsData);
    } catch (error) {
      console.error("Error loading commitment details:", error);
      toast.error("Failed to load commitment details");
    } finally {
      setLoading(false);
    }
  }, [commitmentId]);

  useEffect(() => {
    if (commitmentId) {
      loadCommitmentDetails();
    }
  }, [commitmentId, loadCommitmentDetails]);

  function getStatusColor(status: string) {
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
  }

  function getPaymentStatusColor(status: string) {
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
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-unre-green-600" />
        </div>
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-slate-600">Commitment not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const totalPaid = commitment.amount - (commitment.remaining_amount || 0);
  const utilizationPercentage = ((totalPaid / commitment.amount) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{commitment.commitment_number}</h1>
            <p className="text-slate-600">Commitment Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <Badge className={`text-lg px-4 py-1 ${getStatusColor(commitment.status)}`}>
        {commitment.status}
      </Badge>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Total Commitment</p>
          </div>
          <p className="text-2xl font-bold text-slate-900">K {commitment.amount.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-slate-600">Paid</p>
          </div>
          <p className="text-2xl font-bold text-green-600">K {totalPaid.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">{utilizationPercentage}% of total</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-sm text-slate-600">Remaining</p>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            K {(commitment.remaining_amount || 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Payments</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">{payments.length}</p>
        </Card>
      </div>

      {/* Commitment Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Commitment Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Commitment Number</p>
              <p className="font-mono font-semibold">{commitment.commitment_number}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">GE Request</p>
              <p className="font-mono text-sm text-blue-600">
                {commitment.ge_requests?.request_number || "N/A"}
              </p>
              <p className="text-sm text-slate-700">{commitment.ge_requests?.title || "N/A"}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Cost Centre</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-900">
                  {commitment.cost_centres?.name || "N/A"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Code: {commitment.cost_centres?.code || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Budget Line</p>
              <p className="text-sm text-slate-900">{commitment.budget_lines?.description || "N/A"}</p>
              <p className="text-xs text-slate-500 mt-1">
                PGAS Vote: {commitment.budget_lines?.pgas_vote_code || "N/A"}
              </p>
            </div>
          </div>
        </Card>

        {/* Right Column */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Financial Year</p>
              <p className="text-lg font-semibold">{commitment.financial_year}</p>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Created Date</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-sm">
                  {new Date(commitment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Created By</p>
              <p className="text-sm text-slate-900">{commitment.user_profiles?.full_name || "N/A"}</p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-slate-600 mb-2">Utilization</p>
              <div className="w-full bg-slate-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-unre-green-600 to-unre-green-700 h-4 rounded-full transition-all"
                  style={{ width: `${utilizationPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-1 text-right">{utilizationPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Payment History</h2>

        {payments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <CreditCard className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p>No payments recorded for this commitment</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr className="text-left text-sm font-medium text-slate-600">
                  <th className="p-4">Voucher #</th>
                  <th className="p-4">Payee</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Payment Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Reference</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm text-slate-700">
                        {payment.voucher_number}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-700">{payment.payee_name}</td>
                    <td className="p-4">
                      <span className="font-semibold text-unre-green-600">
                        K {payment.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">
                        {payment.payment_method}
                      </Badge>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      <Badge className={getPaymentStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-slate-600">
                        {payment.bank_reference || payment.cheque_number || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2">
                <tr>
                  <td colSpan={2} className="p-4 font-semibold">
                    Total Paid
                  </td>
                  <td className="p-4">
                    <span className="text-lg font-bold text-green-600">
                      K {totalPaid.toLocaleString()}
                    </span>
                  </td>
                  <td colSpan={4}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Timeline</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-unre-green-600 rounded-full" />
              <div className="w-0.5 h-full bg-slate-200" />
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-sm">Commitment Created</p>
              <p className="text-xs text-slate-500">
                {new Date(commitment.created_at).toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                By {commitment.user_profiles?.full_name}
              </p>
            </div>
          </div>

          {payments
            .filter((p) => p.status === "Paid")
            .map((payment, index) => (
              <div key={payment.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full" />
                  {index < payments.filter((p) => p.status === "Paid").length - 1 && (
                    <div className="w-0.5 h-full bg-slate-200" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">Payment Processed</p>
                  <p className="text-xs text-slate-500">
                    {payment.paid_at ? new Date(payment.paid_at).toLocaleString() : "N/A"}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    K {payment.amount.toLocaleString()} - {payment.voucher_number}
                  </p>
                </div>
              </div>
            ))}

          {commitment.status === "Closed" && (
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-blue-600 rounded-full" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Commitment Closed</p>
                <p className="text-xs text-slate-500">Fully paid</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
