"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { approvePaymentVoucher, processPayment, cancelPaymentVoucher } from "@/lib/payments";
import { generatePaymentVoucherPDF, generatePaymentReceiptPDF } from "@/lib/pdf-generator";
import { markCommitmentAsPaid } from "@/lib/budget-validation";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  Calendar,
  User,
  FileText,
  CheckCircle,
  XCircle,
  Printer,
  Download,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PaymentDetailModalProps {
  paymentId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface PaymentDetail {
  id: number;
  voucher_number: string;
  ge_request_id: number;
  commitment_id: number;
  payee_name: string;
  amount: number;
  payment_method: string;
  bank_name: string | null;
  account_number: string | null;
  cheque_number: string | null;
  bank_reference: string | null;
  payment_date: string | null;
  description: string | null;
  status: string;
  approved_by: string | null;
  processed_by: string | null;
  paid_at: string | null;
  created_at: string;
  ge_requests?: {
    request_number: string;
    title: string;
  };
  commitments?: {
    commitment_number: string;
    amount: number;
  };
  approver?: {
    full_name: string;
    email: string;
  };
  processor?: {
    full_name: string;
    email: string;
  };
}

export function PaymentDetailModal({
  paymentId,
  open,
  onOpenChange,
  onUpdate,
}: PaymentDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);
  const [processing, setProcessing] = useState(false);
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [bankReference, setBankReference] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);

  const loadPaymentDetails = useCallback(async () => {
    if (!paymentId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("payment_vouchers")
        .select(`
          *,
          ge_requests (
            request_number,
            title
          ),
          commitments (
            commitment_number,
            amount
          ),
          approver:user_profiles!payment_vouchers_approved_by_fkey (
            full_name,
            email
          ),
          processor:user_profiles!payment_vouchers_processed_by_fkey (
            full_name,
            email
          )
        `)
        .eq("id", paymentId)
        .single();

      if (error) throw error;
      setPayment(data as any);
    } catch (error) {
      console.error("Error loading payment details:", error);
      toast.error("Failed to load payment details");
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  const checkUserRole = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id);

      if (roles && roles.length > 0) {
        const roleNames = roles.map((r: any) => r.roles.name);
        if (roleNames.includes("Bursar") || roleNames.includes("System Admin")) {
          setUserRole("approver");
        } else if (roleNames.includes("Bursary Clerk")) {
          setUserRole("processor");
        }
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    }
  }, []);

  useEffect(() => {
    if (open && paymentId) {
      loadPaymentDetails();
      checkUserRole();
    }
  }, [open, paymentId, loadPaymentDetails, checkUserRole]);

  async function handleApprove() {
    if (!payment) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await approvePaymentVoucher(payment.id, user.id);
      toast.success("Payment voucher approved successfully!");
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error approving payment:", error);
      toast.error("Failed to approve payment voucher");
    } finally {
      setProcessing(false);
    }
  }

  async function handleProcess() {
    if (!payment) return;

    try {
      setProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await processPayment(
        payment.id,
        user.id,
        payment.payment_method === "EFT" ? bankReference : undefined,
        payment.payment_method === "Cheque" ? chequeNumber : undefined
      );

      // Mark budget commitment as paid (updates actual spent)
      if (payment.ge_request_id) {
        const commitmentUpdated = await markCommitmentAsPaid(payment.ge_request_id);

        if (commitmentUpdated) {
          toast.success(
            "Payment processed successfully! Budget actual updated and commitment released."
          );
        } else {
          toast.success(
            "Payment processed successfully! (Budget update may need manual verification)"
          );
        }
      } else {
        toast.success("Payment processed successfully!");
      }

      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setProcessing(false);
    }
  }

  function handlePrintVoucher() {
    if (!payment) return;

    try {
      generatePaymentVoucherPDF({
        voucher_number: payment.voucher_number,
        payee_name: payment.payee_name,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        description: payment.description,
        bank_name: payment.bank_name,
        account_number: payment.account_number,
        cheque_number: payment.cheque_number,
        bank_reference: payment.bank_reference,
        status: payment.status,
        ge_request_number: payment.ge_requests?.request_number,
        commitment_number: payment.commitments?.commitment_number,
        approved_by: payment.approver?.full_name,
        processed_by: payment.processor?.full_name,
        paid_at: payment.paid_at,
        created_at: payment.created_at,
      });
      toast.success("Payment voucher PDF generated!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    }
  }

  function handleDownloadReceipt() {
    if (!payment || payment.status !== "Paid") {
      toast.error("Receipt can only be generated for paid vouchers");
      return;
    }

    try {
      generatePaymentReceiptPDF({
        voucher_number: payment.voucher_number,
        payee_name: payment.payee_name,
        amount: payment.amount,
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        description: payment.description,
        bank_name: payment.bank_name,
        account_number: payment.account_number,
        cheque_number: payment.cheque_number,
        bank_reference: payment.bank_reference,
        status: payment.status,
        ge_request_number: payment.ge_requests?.request_number,
        commitment_number: payment.commitments?.commitment_number,
        approved_by: payment.approver?.full_name,
        processed_by: payment.processor?.full_name,
        paid_at: payment.paid_at,
        created_at: payment.created_at,
      });
      toast.success("Payment receipt PDF generated!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    }
  }

  function getStatusColor(status: string) {
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

  if (!payment && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-unre-green-600" />
            Payment Voucher Details
          </DialogTitle>
          <DialogDescription>
            {payment?.voucher_number || "Loading..."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-unre-green-600" />
          </div>
        ) : payment ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`text-lg px-4 py-1 ${getStatusColor(payment.status)}`}>
                {payment.status}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePrintVoucher}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Voucher
                </Button>
                {payment.status === "Paid" && (
                  <Button variant="outline" size="sm" onClick={handleDownloadReceipt}>
                    <Download className="h-4 w-4 mr-2" />
                    Receipt PDF
                  </Button>
                )}
              </div>
            </div>

            {/* Main Details */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Voucher Number</p>
                  <p className="font-mono text-lg font-semibold">{payment.voucher_number}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">GE Request</p>
                  <p className="font-mono text-sm text-blue-600">
                    {payment.ge_requests?.request_number}
                  </p>
                  <p className="text-sm text-slate-700">{payment.ge_requests?.title}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Commitment</p>
                  <p className="font-mono text-sm">{payment.commitments?.commitment_number}</p>
                  <p className="text-xs text-slate-500">
                    Total: K {payment.commitments?.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Amount</p>
                  <p className="text-2xl font-bold text-unre-green-600">
                    K {payment.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Payee</p>
                  <p className="font-medium text-slate-900">{payment.payee_name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Payment Date</p>
                  <p className="text-sm text-slate-900">
                    {payment.payment_date
                      ? new Date(payment.payment_date).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment Method Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Method</p>
                  <Badge variant="outline">{payment.payment_method}</Badge>
                </div>

                {payment.payment_method === "EFT" && (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Bank Name</p>
                      <p className="text-sm text-slate-900">{payment.bank_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Account Number</p>
                      <p className="text-sm font-mono">{payment.account_number || "N/A"}</p>
                    </div>
                    {payment.bank_reference && (
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Bank Reference</p>
                        <p className="text-sm font-mono">{payment.bank_reference}</p>
                      </div>
                    )}
                  </>
                )}

                {payment.payment_method === "Cheque" && payment.cheque_number && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Cheque Number</p>
                    <p className="text-sm font-mono">{payment.cheque_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {payment.description && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                  {payment.description}
                </p>
              </div>
            )}

            {/* Approval History */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Approval History</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <FileText className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-xs text-slate-600">
                      {new Date(payment.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {payment.approved_by && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Approved</p>
                      <p className="text-xs text-slate-600">
                        By: {payment.approver?.full_name || "Unknown"}
                      </p>
                    </div>
                  </div>
                )}

                {payment.paid_at && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Paid</p>
                      <p className="text-xs text-slate-600">
                        By: {payment.processor?.full_name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-600">
                        {new Date(payment.paid_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Process Payment Form */}
            {payment.status === "Approved" && userRole === "processor" && showProcessForm && (
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold">Process Payment</h3>

                {payment.payment_method === "EFT" && (
                  <div className="space-y-2">
                    <Label htmlFor="bankReference">Bank Reference Number</Label>
                    <Input
                      id="bankReference"
                      value={bankReference}
                      onChange={(e) => setBankReference(e.target.value)}
                      placeholder="e.g., EFT20250125-001"
                    />
                  </div>
                )}

                {payment.payment_method === "Cheque" && (
                  <div className="space-y-2">
                    <Label htmlFor="chequeNumber">Cheque Number</Label>
                    <Input
                      id="chequeNumber"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      placeholder="e.g., CHQ-123456"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleProcess}
                    disabled={processing}
                    className="bg-gradient-to-r from-green-600 to-green-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Confirm Payment
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setShowProcessForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t pt-4 flex gap-2 justify-end">
              {payment.status === "Pending" && userRole === "approver" && (
                <Button
                  onClick={handleApprove}
                  disabled={processing}
                  className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve Payment
                    </>
                  )}
                </Button>
              )}

              {payment.status === "Approved" && userRole === "processor" && !showProcessForm && (
                <Button
                  onClick={() => setShowProcessForm(true)}
                  className="bg-gradient-to-r from-green-600 to-green-700"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Process Payment
                </Button>
              )}

              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">Payment not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
