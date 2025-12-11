"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { createPaymentVoucher } from "@/lib/payments";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { uploadDocument } from "@/lib/storage";

interface CreatePaymentVoucherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface Commitment {
  id: number;
  commitment_number: string;
  ge_request_id: number;
  amount: number;
  remaining_amount: number;
  status: string;
  ge_requests?: {
    request_number: string;
    title: string;
  };
  cost_centres?: {
    name: string;
  };
}

interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  bank_name: string;
  bank_account: string;
}

export function CreatePaymentVoucherDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreatePaymentVoucherDialogProps) {
  const [loading, setLoading] = useState(false);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [selectedCommitment, setSelectedCommitment] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("EFT");
  const [amount, setAmount] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      loadCommitmentsAndSuppliers();
      resetForm();
    }
  }, [open]);

  async function loadCommitmentsAndSuppliers() {
    try {
      setLoadingData(true);

      // Load open and partial commitments
      const { data: commitmentsData, error: commitmentsError } = await supabase
        .from("commitments")
        .select(`
          *,
          ge_requests (
            request_number,
            title
          ),
          cost_centres (
            name
          )
        `)
        .in("status", ["Open", "Partial"])
        .order("created_at", { ascending: false });

      if (commitmentsError) throw commitmentsError;
      setCommitments(commitmentsData as Commitment[]);

      // Load suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from("suppliers")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (suppliersError) throw suppliersError;
      setSuppliers(suppliersData as Supplier[]);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load commitments and suppliers");
    } finally {
      setLoadingData(false);
    }
  }

  function resetForm() {
    setSelectedCommitment("");
    setSelectedSupplier("");
    setPaymentMethod("EFT");
    setAmount("");
    setPaymentDate("");
    setDescription("");
    setBankName("");
    setAccountNumber("");
    setErrors({});
  }

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {};

    if (!selectedCommitment) {
      newErrors.commitment = "Please select a commitment";
    }

    if (!selectedSupplier) {
      newErrors.supplier = "Please select a supplier/payee";
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    // Check if amount exceeds remaining commitment amount
    if (selectedCommitment && amount) {
      const commitment = commitments.find((c) => c.id.toString() === selectedCommitment);
      if (commitment && parseFloat(amount) > (commitment.remaining_amount || 0)) {
        newErrors.amount = `Amount cannot exceed remaining commitment balance (K ${commitment.remaining_amount?.toLocaleString()})`;
      }
    }

    if (!paymentDate) {
      newErrors.paymentDate = "Please select a payment date";
    }

    if (paymentMethod === "EFT" && !bankName) {
      newErrors.bankName = "Bank name is required for EFT payments";
    }

    if (paymentMethod === "EFT" && !accountNumber) {
      newErrors.accountNumber = "Account number is required for EFT payments";
    }

    if (!description || description.trim().length < 10) {
      newErrors.description = "Please provide a description (minimum 10 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setLoading(true);

      const commitment = commitments.find((c) => c.id.toString() === selectedCommitment);
      const supplier = suppliers.find((s) => s.id.toString() === selectedSupplier);

      if (!commitment || !supplier) {
        throw new Error("Invalid commitment or supplier selection");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const voucherId = await createPaymentVoucher(
        {
          ge_request_id: commitment.ge_request_id,
          commitment_id: commitment.id,
          payee_name: supplier.name,
          amount: parseFloat(amount),
          payment_method: paymentMethod,
          bank_name: paymentMethod === "EFT" ? bankName : undefined,
          account_number: paymentMethod === "EFT" ? accountNumber : undefined,
          description: description.trim(),
          payment_date: paymentDate,
        },
        user.id
      );

      // Upload attachments if any
      if (attachments.length > 0 && voucherId) {
        toast.info(`Uploading ${attachments.length} document(s)...`);
        try {
          for (const file of attachments) {
            const uploadedDoc = await uploadDocument(file, 'documents', 'payment-vouchers');

            // Save document record to database
            // @ts-expect-error - Supabase type mismatch
            await supabase.from('documents').insert({
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              file_extension: file.name.split('.').pop(),
              storage_path: uploadedDoc.path,
              storage_bucket: 'documents',
              file_url: uploadedDoc.url,
              document_type: 'invoice',
              related_to_type: 'payment_voucher',
              related_to_id: voucherId,
              uploaded_by: user.id,
            });
          }
          toast.success(`Payment voucher created with ${attachments.length} document(s)!`);
        } catch (uploadError) {
          console.error('Error uploading documents:', uploadError);
          toast.warning('Payment voucher created but some documents failed to upload');
        }
      } else {
        toast.success("Payment voucher created successfully!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating payment voucher:", error);
      toast.error("Failed to create payment voucher");
    } finally {
      setLoading(false);
    }
  }

  // Auto-fill bank details when supplier is selected
  useEffect(() => {
    if (selectedSupplier) {
      const supplier = suppliers.find((s) => s.id.toString() === selectedSupplier);
      if (supplier) {
        setBankName(supplier.bank_name || "");
        setAccountNumber(supplier.bank_account || "");
      }
    }
  }, [selectedSupplier, suppliers]);

  // Auto-fill remaining amount when commitment is selected
  useEffect(() => {
    if (selectedCommitment) {
      const commitment = commitments.find((c) => c.id.toString() === selectedCommitment);
      if (commitment && commitment.remaining_amount) {
        setAmount(commitment.remaining_amount.toString());
      }
    }
  }, [selectedCommitment, commitments]);

  const selectedCommitmentData = commitments.find(
    (c) => c.id.toString() === selectedCommitment
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Payment Voucher</DialogTitle>
          <DialogDescription>
            Create a new payment voucher for an approved commitment.
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-unre-green-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Commitment Selection */}
            <div className="space-y-2">
              <Label htmlFor="commitment">
                Commitment <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCommitment} onValueChange={setSelectedCommitment}>
                <SelectTrigger className={errors.commitment ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a commitment" />
                </SelectTrigger>
                <SelectContent>
                  {commitments.map((commitment) => (
                    <SelectItem key={commitment.id} value={commitment.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{commitment.commitment_number}</span>
                        <span className="text-xs text-slate-500">
                          {commitment.ge_requests?.title} - {commitment.cost_centres?.name}
                        </span>
                        <span className="text-xs text-unre-green-600">
                          Remaining: K {commitment.remaining_amount?.toLocaleString()}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.commitment && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.commitment}
                </p>
              )}
            </div>

            {/* Commitment Details Display */}
            {selectedCommitmentData && (
              <div className="p-3 bg-unre-green-50 border border-unre-green-200 rounded-lg space-y-1">
                <p className="text-sm">
                  <span className="font-medium">GE Request:</span>{" "}
                  {selectedCommitmentData.ge_requests?.request_number}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total Commitment:</span> K{" "}
                  {selectedCommitmentData.amount.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Remaining Balance:</span>{" "}
                  <span className="text-unre-green-700 font-semibold">
                    K {selectedCommitmentData.remaining_amount?.toLocaleString()}
                  </span>
                </p>
              </div>
            )}

            {/* Supplier/Payee Selection */}
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier/Payee <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                <SelectTrigger className={errors.supplier ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{supplier.name}</span>
                        {supplier.contact_person && (
                          <span className="text-xs text-slate-500">
                            Contact: {supplier.contact_person}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supplier && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.supplier}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (PGK) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={errors.amount ? "border-red-500" : ""}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount}
                  </p>
                )}
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label htmlFor="paymentDate">
                  Payment Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className={errors.paymentDate ? "border-red-500" : ""}
                />
                {errors.paymentDate && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.paymentDate}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EFT">Electronic Funds Transfer (EFT)</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bank Details (for EFT) */}
            {paymentMethod === "EFT" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankName">
                    Bank Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className={errors.bankName ? "border-red-500" : ""}
                    placeholder="e.g., Bank South Pacific"
                  />
                  {errors.bankName && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.bankName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Account Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className={errors.accountNumber ? "border-red-500" : ""}
                    placeholder="e.g., 1234567890"
                  />
                  {errors.accountNumber && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.accountNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "border-red-500" : ""}
                placeholder="Provide a detailed description of the payment purpose..."
                rows={3}
              />
              <p className="text-xs text-slate-500">
                {description.length}/200 characters (minimum 10)
              </p>
              {errors.description && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Supporting Documents */}
            <div className="space-y-2">
              <Label>Supporting Documents (Optional)</Label>
              <p className="text-xs text-slate-500 mb-2">
                Upload invoices, receipts, or other supporting documents
              </p>
              <FileUpload
                files={attachments}
                onFilesSelected={(files) => setAttachments([...attachments, ...files])}
                onFileRemoved={(index) => setAttachments(attachments.filter((_, i) => i !== index))}
                maxFiles={5}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-unre-green-600 to-unre-green-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Payment Voucher"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
