"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  Clock,
  FileText,
  MessageSquare,
  AlertCircle,
  Eye,
  Download,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  commitBudget,
  releaseBudgetCommitment,
  checkBudgetAvailability,
} from "@/lib/budget-validation";

export default function ApprovalsPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | "return" | null>(null);
  const [comments, setComments] = useState("");

  // Mock data
  const pendingApprovals = [
    {
      id: 1,
      requestNumber: "GE-2025-000125",
      title: "Laboratory Equipment Maintenance",
      description: "Annual maintenance for laboratory equipment in Science Faculty",
      requester: "Peter Wana",
      requesterEmail: "p.wana@unre.ac.pg",
      costCentre: "School of Natural Resources",
      budgetLine: "Operating - Maintenance (OP-MAINT-001)",
      expenseType: "Maintenance & Repairs",
      amount: 22300,
      priority: "Normal",
      submittedDate: "2025-01-20",
      daysWaiting: 3,
      currentStage: "Pending HOD",
      nextApprover: "You (HOD)",
      items: [
        { description: "Equipment calibration service", quantity: 1, unitPrice: 15000, total: 15000 },
        { description: "Replacement parts", quantity: 1, unitPrice: 5000, total: 5000 },
        { description: "Labor costs", quantity: 2, unitPrice: 1150, total: 2300 },
      ],
      justification: "Annual maintenance is critical to ensure laboratory equipment operates correctly and safely. This is required for ongoing research projects and student practicals.",
      attachments: [
        { name: "Quotation_LabMaintenance.pdf", size: "245 KB" },
        { name: "Equipment_List.xlsx", size: "18 KB" },
      ],
      approvalHistory: [
        {
          approver: "Peter Wana",
          role: "Requester",
          action: "Submitted",
          date: "2025-01-20 09:30 AM",
          comments: "Urgent maintenance required before semester starts",
        },
      ],
      budgetInfo: {
        budgetLine: "Operating - Maintenance",
        originalBudget: 200000,
        ytdExpenditure: 95000,
        committed: 22300,
        available: 82700,
        afterApproval: 60400,
      },
    },
    {
      id: 2,
      requestNumber: "GE-2025-000124",
      title: "Travel - Research Conference Port Moresby",
      description: "Attendance to National Research Conference",
      requester: "Mary Bola",
      requesterEmail: "m.bola@unre.ac.pg",
      costCentre: "Faculty of Science",
      budgetLine: "Operating - Travel (OP-TRAV-001)",
      expenseType: "Travel & Accommodation",
      amount: 8500,
      priority: "Urgent",
      submittedDate: "2025-01-19",
      daysWaiting: 1,
      currentStage: "Pending Dean",
      nextApprover: "You (Dean)",
      items: [
        { description: "Return airfare POM-LAE-POM", quantity: 1, unitPrice: 4500, total: 4500 },
        { description: "Accommodation (3 nights)", quantity: 3, unitPrice: 800, total: 2400 },
        { description: "Meals and incidentals", quantity: 3, unitPrice: 200, total: 600 },
        { description: "Conference registration fee", quantity: 1, unitPrice: 1000, total: 1000 },
      ],
      justification: "Presenting research paper on climate change impacts. This conference is important for UNRE's research visibility and networking with other institutions.",
      attachments: [
        { name: "Conference_Invitation.pdf", size: "185 KB" },
        { name: "Paper_Abstract.pdf", size: "92 KB" },
      ],
      approvalHistory: [
        {
          approver: "Mary Bola",
          role: "Requester",
          action: "Submitted",
          date: "2025-01-19 02:15 PM",
          comments: null,
        },
        {
          approver: "Dr. John Kila",
          role: "HOD",
          action: "Approved",
          date: "2025-01-19 04:30 PM",
          comments: "Research presentation is valuable for faculty. Approved.",
        },
      ],
      budgetInfo: {
        budgetLine: "Operating - Travel",
        originalBudget: 250000,
        ytdExpenditure: 120000,
        committed: 35000,
        available: 95000,
        afterApproval: 86500,
      },
    },
    {
      id: 3,
      requestNumber: "GE-2025-000123",
      title: "Office Furniture for School of Agriculture",
      description: "Desks, chairs, and filing cabinets for new staff offices",
      requester: "John Kila",
      requesterEmail: "j.kila@unre.ac.pg",
      costCentre: "School of Agriculture",
      budgetLine: "Capital - Furniture (CAP-FURN-001)",
      expenseType: "Capital Expenditure",
      amount: 45000,
      priority: "Normal",
      submittedDate: "2025-01-18",
      daysWaiting: 2,
      currentStage: "Pending Bursar",
      nextApprover: "You (Bursar)",
      items: [
        { description: "Executive desks", quantity: 3, unitPrice: 5000, total: 15000 },
        { description: "Office chairs", quantity: 6, unitPrice: 2500, total: 15000 },
        { description: "Filing cabinets (4-drawer)", quantity: 4, unitPrice: 2500, total: 10000 },
        { description: "Visitor chairs", quantity: 6, unitPrice: 500, total: 3000 },
        { description: "Delivery and installation", quantity: 1, unitPrice: 2000, total: 2000 },
      ],
      justification: "Three new staff members joining next month. Current furniture is insufficient and some existing items are damaged beyond repair.",
      attachments: [
        { name: "Furniture_Quotation_BrianBell.pdf", size: "356 KB" },
        { name: "Staff_Appointment_Letters.pdf", size: "128 KB" },
      ],
      approvalHistory: [
        {
          approver: "John Kila",
          role: "Requester",
          action: "Submitted",
          date: "2025-01-18 10:00 AM",
          comments: null,
        },
        {
          approver: "Prof. Sarah Mek",
          role: "Dean",
          action: "Approved",
          date: "2025-01-18 03:45 PM",
          comments: "New staff furniture is necessary. Budget approved.",
        },
      ],
      budgetInfo: {
        budgetLine: "Capital - Furniture",
        originalBudget: 320000,
        ytdExpenditure: 180000,
        committed: 45000,
        available: 95000,
        afterApproval: 50000,
      },
    },
  ];

  const handleApprovalAction = (request: any, action: "approve" | "reject" | "return") => {
    setSelectedRequest(request);
    setApprovalAction(action);
    setShowApprovalDialog(true);
    setComments("");
  };

  const confirmAction = async () => {
    if (!selectedRequest || !approvalAction) return;

    const actionText = approvalAction === "approve" ? "approved" : approvalAction === "reject" ? "rejected" : "returned";

    try {
      // Handle budget commitment/release
      if (approvalAction === "approve") {
        // Commit budget when approving
        const budgetLine = selectedRequest.budgetInfo;
        if (budgetLine) {
          // In production, this would use actual GE request ID and budget line ID
          const commitment = await commitBudget(
            selectedRequest.id, // GE request ID
            1, // Budget line ID (would come from request data)
            selectedRequest.amount
          );

          if (commitment) {
            toast.success(
              `Request ${selectedRequest.requestNumber} ${actionText} successfully! Budget committed: K${selectedRequest.amount.toLocaleString()}`
            );
          } else {
            toast.warning(
              `Request ${actionText} but budget commitment failed. Please check manually.`
            );
          }
        }
      } else if (approvalAction === "reject") {
        // Release budget when rejecting
        const released = await releaseBudgetCommitment(selectedRequest.id);

        if (released) {
          toast.success(
            `Request ${selectedRequest.requestNumber} ${actionText}. Budget released back to available.`
          );
        } else {
          toast.success(`Request ${selectedRequest.requestNumber} ${actionText} successfully!`);
        }
      } else {
        // Return for correction
        toast.success(`Request ${selectedRequest.requestNumber} returned for corrections.`);
      }
    } catch (error) {
      console.error('Error processing approval action:', error);
      toast.error('Failed to process approval. Please try again.');
      return;
    }

    setShowApprovalDialog(false);
    setSelectedRequest(null);
    setApprovalAction(null);
    setComments("");
  };

  const getPriorityColor = (priority: string) => {
    return priority === "Urgent" ? "bg-red-500" : "bg-slate-400";
  };

  const getDaysWaitingColor = (days: number) => {
    if (days >= 5) return "text-red-600 bg-red-50";
    if (days >= 3) return "text-orange-600 bg-orange-50";
    return "text-slate-600 bg-slate-50";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Approvals</h1>
          <p className="text-slate-600">GE Requests pending your approval</p>
        </div>
        <Badge className="bg-orange-500 text-lg px-4 py-2">
          {pendingApprovals.length} Pending
        </Badge>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-sm text-slate-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingApprovals.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm text-slate-600">Urgent</p>
              <p className="text-2xl font-bold text-red-600">
                {pendingApprovals.filter((r) => r.priority === "Urgent").length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Total Value</p>
              <p className="text-2xl font-bold text-blue-600">
                K {(pendingApprovals.reduce((sum, r) => sum + r.amount, 0) / 1000).toFixed(1)}k
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-slate-600" />
            <div>
              <p className="text-sm text-slate-600">Avg. Wait Time</p>
              <p className="text-2xl font-bold text-slate-900">
                {(pendingApprovals.reduce((sum, r) => sum + r.daysWaiting, 0) / pendingApprovals.length).toFixed(1)} days
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Approvals List */}
      <div className="space-y-4">
        {pendingApprovals.map((request) => (
          <Card key={request.id} className="overflow-hidden">
            <div className="p-6">
              {/* Header Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {request.priority === "Urgent" && (
                      <span className={`h-3 w-3 rounded-full ${getPriorityColor(request.priority)} animate-pulse`} />
                    )}
                    <span className="font-mono text-sm text-slate-600">{request.requestNumber}</span>
                    {request.priority === "Urgent" && (
                      <Badge className="bg-red-500">Urgent</Badge>
                    )}
                    <Badge className={getDaysWaitingColor(request.daysWaiting)}>
                      {request.daysWaiting} days waiting
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{request.title}</h3>
                  <p className="text-slate-600">{request.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-3xl font-bold text-blue-600">K {request.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-600">Request Amount</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Requester</p>
                  <p className="font-semibold text-slate-900">{request.requester}</p>
                  <p className="text-xs text-slate-500">{request.requesterEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Cost Centre</p>
                  <p className="font-semibold text-slate-900">{request.costCentre}</p>
                  <p className="text-xs text-slate-500">{request.budgetLine}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 mb-1">Current Stage</p>
                  <p className="font-semibold text-orange-600">{request.currentStage}</p>
                  <p className="text-xs text-slate-500">Submitted: {request.submittedDate}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Line Items:</h4>
                <div className="space-y-1">
                  {request.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm p-2 bg-white rounded border">
                      <span className="text-slate-700">{item.description}</span>
                      <span className="text-slate-900">
                        {item.quantity} × K {item.unitPrice.toLocaleString()} = <strong>K {item.total.toLocaleString()}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Budget Impact */}
              <div className={`mb-4 p-4 border rounded-lg ${
                request.budgetInfo.available >= request.amount
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className={`text-sm font-semibold flex items-center gap-2 ${
                    request.budgetInfo.available >= request.amount
                      ? 'text-green-900'
                      : 'text-red-900'
                  }`}>
                    {request.budgetInfo.available >= request.amount ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Budget Available
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Insufficient Budget!
                      </>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-xs">
                    <DollarSign className="w-3 h-3" />
                    <span className={request.budgetInfo.available >= request.amount ? 'text-green-700' : 'text-red-700'}>
                      Auto-commit on approval
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-600">Approved Budget</p>
                    <p className="font-bold text-blue-900">K {request.budgetInfo.originalBudget.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Actual Spent</p>
                    <p className="font-bold text-red-700">K {request.budgetInfo.ytdExpenditure.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Committed</p>
                    <p className="font-bold text-orange-700">K {request.budgetInfo.committed.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Available Now</p>
                    <p className={`font-bold ${
                      request.budgetInfo.available >= request.amount
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}>
                      K {request.budgetInfo.available.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">After Approval</p>
                    <p className={`font-bold ${
                      request.budgetInfo.afterApproval >= 0
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}>
                      K {request.budgetInfo.afterApproval.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Budget utilization bar */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Budget Utilization</span>
                    <span>
                      {((request.budgetInfo.ytdExpenditure + request.budgetInfo.committed) /
                        request.budgetInfo.originalBudget * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-red-500 via-orange-500 to-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((request.budgetInfo.ytdExpenditure + request.budgetInfo.committed) /
                           request.budgetInfo.originalBudget) * 100,
                          100
                        )}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Justification */}
              <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Business Justification:</h4>
                <p className="text-sm text-slate-700">{request.justification}</p>
              </div>

              {/* Attachments */}
              {request.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Attachments:</h4>
                  <div className="flex gap-2">
                    {request.attachments.map((att: any, idx: number) => (
                      <Button key={idx} variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        {att.name} ({att.size})
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval History */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Approval History:</h4>
                <div className="space-y-2">
                  {request.approvalHistory.map((history: any, idx: number) => (
                    <div key={idx} className="flex gap-3 text-sm">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-slate-900">
                          <strong>{history.approver}</strong> ({history.role}) - <strong>{history.action}</strong>
                        </p>
                        <p className="text-xs text-slate-600">{history.date}</p>
                        {history.comments && (
                          <p className="text-sm text-slate-700 mt-1 italic">"{history.comments}"</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprovalAction(request, "approve")}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleApprovalAction(request, "return")}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Return for Clarification
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => handleApprovalAction(request, "reject")}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button variant="ghost">
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {approvalAction === "approve" && "Approve Request"}
              {approvalAction === "reject" && "Reject Request"}
              {approvalAction === "return" && "Return for Clarification"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded">
              <p className="text-sm text-slate-600">Request:</p>
              <p className="font-semibold">{selectedRequest?.requestNumber}</p>
              <p className="text-sm">{selectedRequest?.title}</p>
              <p className="text-lg font-bold text-blue-600 mt-2">K {selectedRequest?.amount.toLocaleString()}</p>
            </div>

            <div>
              <Label htmlFor="comments">
                Comments {approvalAction === "reject" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="comments"
                placeholder={`Add comments for ${approvalAction}...`}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="mt-1"
              />
            </div>

            {approvalAction === "approve" && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-sm text-green-800">
                  This request will be forwarded to the next approver in the workflow.
                </p>
              </div>
            )}

            {approvalAction === "reject" && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-sm text-red-800">
                  This request will be rejected and the requester will be notified. Please provide a reason.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={approvalAction === "reject" && !comments}
              className={
                approvalAction === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : approvalAction === "reject"
                    ? "bg-red-600 hover:bg-red-700"
                    : ""
              }
            >
              {approvalAction === "approve" && "Confirm Approval"}
              {approvalAction === "reject" && "Confirm Rejection"}
              {approvalAction === "return" && "Return Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
