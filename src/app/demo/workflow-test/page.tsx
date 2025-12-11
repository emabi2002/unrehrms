"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Mail,
  FileText,
  Upload,
  ArrowRight,
  Users,
  DollarSign,
  Send,
  XCircle,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  title: string;
  actor: string;
  action: string;
  status: "pending" | "active" | "completed" | "skipped";
  timestamp?: string;
  details: string[];
  emailSent?: boolean;
  emailTo?: string;
  requestStatus?: string;
}

export default function WorkflowTestPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [scenario, setScenario] = useState<"normal" | "query" | "deny">("normal");
  const [autoPlay, setAutoPlay] = useState(false);

  // ICT Printer Purchase Scenario Data
  const requestData = {
    requestNumber: "GE-2025-000125",
    title: "New Printer for ICT Department",
    requester: "John Kola (ICT Officer)",
    department: "ICT Department",
    amount: 4800,
    budgetLine: "Capital - IT Equipment",
    available: 500000,
    quotes: [
      { vendor: "Brian Bell Ltd", amount: 4800, file: "quote1.pdf" },
      { vendor: "Stop & Shop", amount: 4950, file: "quote2.pdf" },
      { vendor: "PNG Office Supplies", amount: 4700, file: "quote3.pdf" },
    ],
    justification: "Current printer is broken and affecting daily operations. Required for printing student records, administrative documents, and departmental reports.",
  };

  const normalWorkflow: WorkflowStep[] = [
    {
      id: 0,
      title: "Request Preparation",
      actor: "ICT Officer (John Kola)",
      action: "Preparing GE Request",
      status: "pending",
      details: [
        "Identified need for new printer",
        "Collected 3 vendor quotes (required)",
        "Filled out GE request form",
        "Uploaded supporting documents",
      ],
    },
    {
      id: 1,
      title: "Request Submission",
      actor: "System (Power Automate)",
      action: "Auto-Processing Submission",
      status: "pending",
      details: [
        "✅ Validated 3 quotes uploaded",
        "✅ Auto-generated request number: GE-2025-000125",
        "✅ Checked budget availability: K500,000 available",
        "✅ Amount K4,800 ≤ K5,000 → Routes to ProVC",
        "✅ Created database record",
        "✅ Status: Pending Manager Review",
      ],
      emailSent: true,
      emailTo: "Department Manager",
      requestStatus: "Pending Manager Review",
    },
    {
      id: 2,
      title: "Manager Review",
      actor: "Department Manager",
      action: "Reviewing Request",
      status: "pending",
      details: [
        "📧 Received email notification",
        "📋 Logged into system",
        "👀 Reviewed request details and quotes",
        "✅ Clicked 'Approve' button",
      ],
      emailSent: false,
    },
    {
      id: 3,
      title: "Manager Approval",
      actor: "System (Power Automate)",
      action: "Processing Approval",
      status: "pending",
      details: [
        "✅ Recorded manager approval",
        "✅ Amount K4,800 ≤ K5,000",
        "✅ Next approver: ProVC Planning & Development",
        "✅ Status: Pending ProVC Approval",
        "✅ Updated approval history",
      ],
      emailSent: true,
      emailTo: "ProVC Planning & Development",
      requestStatus: "Pending ProVC Approval",
    },
    {
      id: 4,
      title: "ProVC Review",
      actor: "ProVC - Planning & Development",
      action: "Final Review",
      status: "pending",
      details: [
        "📧 Received email notification",
        "📋 Logged into system",
        "💰 Verified budget compliance",
        "📄 Checked all documentation",
        "✅ Clicked 'Approve' button",
      ],
      emailSent: false,
    },
    {
      id: 5,
      title: "Final Approval",
      actor: "System (Power Automate)",
      action: "Completing Approval",
      status: "pending",
      details: [
        "✅ Recorded ProVC approval",
        "✅ Final approval complete",
        "✅ Status: Approved - Forwarded to Accounts",
        "✅ Created budget commitment (K4,800)",
        "✅ Updated available budget",
        "✅ Forwarded to Accounts team",
      ],
      emailSent: true,
      emailTo: "ICT Officer + Accounts Team",
      requestStatus: "Approved - Pending Payment",
    },
    {
      id: 6,
      title: "Payment Processing",
      actor: "Accounts/Finance Officer",
      action: "Processing Payment",
      status: "pending",
      details: [
        "📧 Received notification",
        "💳 Created payment voucher",
        "✅ Status: Processing Payment",
        "⏰ 5-day SLA tracking started",
        "🏦 Processed EFT payment",
      ],
      emailSent: false,
    },
    {
      id: 7,
      title: "Payment Complete",
      actor: "System (Power Automate)",
      action: "Finalizing Payment",
      status: "pending",
      details: [
        "✅ Payment marked as Paid",
        "✅ Payment reference: PAY-2025-00089",
        "✅ Status: Paid",
        "✅ Budget updated in PGAS",
        "✅ Complete audit trail saved",
        "✅ Workflow complete!",
      ],
      emailSent: true,
      emailTo: "ICT Officer (Confirmation)",
      requestStatus: "Paid ✓",
    },
  ];

  const queryWorkflow: WorkflowStep[] = [
    ...normalWorkflow.slice(0, 5),
    {
      id: 5,
      title: "ProVC Queries Request",
      actor: "ProVC - Planning & Development",
      action: "Requesting Corrections",
      status: "pending",
      details: [
        "❓ Found issue: Missing third vendor quote",
        "✏️ Entered query: 'Please upload third vendor quote'",
        "✅ Status: Queried",
        "✅ Returned to ICT Officer",
      ],
      emailSent: true,
      emailTo: "ICT Officer (Query Notification)",
      requestStatus: "Queried",
    },
    {
      id: 6,
      title: "Requestor Correction",
      actor: "ICT Officer (John Kola)",
      action: "Uploading Missing Quote",
      status: "pending",
      details: [
        "📧 Received query notification",
        "📎 Uploaded missing third quote",
        "✅ Clicked 'Resubmit' button",
        "✅ Workflow restarts from Manager",
      ],
      emailSent: true,
      emailTo: "Department Manager (Resubmission)",
      requestStatus: "Resubmitted - Pending Manager Review",
    },
  ];

  const denyWorkflow: WorkflowStep[] = [
    ...normalWorkflow.slice(0, 5),
    {
      id: 5,
      title: "ProVC Denies Request",
      actor: "ProVC - Planning & Development",
      action: "Denying Request",
      status: "pending",
      details: [
        "❌ Denial reason: 'Exceeds annual IT equipment budget allocation'",
        "✅ Status: Denied",
        "✅ Budget commitment released",
        "✅ Workflow terminated",
      ],
      emailSent: true,
      emailTo: "ICT Officer (Denial Notification)",
      requestStatus: "Denied",
    },
  ];

  const currentWorkflow = scenario === "query" ? queryWorkflow : scenario === "deny" ? denyWorkflow : normalWorkflow;

  const nextStep = () => {
    if (currentStep < currentWorkflow.length - 1) {
      const newSteps = [...currentWorkflow];
      newSteps[currentStep].status = "completed";
      newSteps[currentStep].timestamp = new Date().toLocaleTimeString();
      newSteps[currentStep + 1].status = "active";
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newSteps = [...currentWorkflow];
      newSteps[currentStep].status = "pending";
      newSteps[currentStep - 1].status = "active";
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setAutoPlay(false);
    const newSteps = [...currentWorkflow];
    newSteps.forEach((step) => {
      step.status = "pending";
      delete step.timestamp;
    });
    newSteps[0].status = "active";
  };

  const changeScenario = (newScenario: "normal" | "query" | "deny") => {
    setScenario(newScenario);
    setCurrentStep(0);
    setAutoPlay(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Workflow Automation Test Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Testing the complete Power Automate replacement with ICT Printer Purchase Scenario
          </p>
        </div>

        {/* Scenario Selector */}
        <Card className="p-6 mb-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-700" />
            Select Test Scenario
          </h2>
          <div className="flex gap-4">
            <Button
              onClick={() => changeScenario("normal")}
              variant={scenario === "normal" ? "default" : "outline"}
              className={scenario === "normal" ? "bg-green-700" : ""}
            >
              ✅ Normal Approval Path
            </Button>
            <Button
              onClick={() => changeScenario("query")}
              variant={scenario === "query" ? "default" : "outline"}
              className={scenario === "query" ? "bg-amber-600" : ""}
            >
              ❓ Query Path (Missing Quote)
            </Button>
            <Button
              onClick={() => changeScenario("deny")}
              variant={scenario === "deny" ? "default" : "outline"}
              className={scenario === "deny" ? "bg-red-600" : ""}
            >
              ❌ Denial Path (Budget Exceeded)
            </Button>
          </div>
        </Card>

        {/* Request Summary */}
        <Card className="p-6 mb-6 bg-white shadow-lg border-l-4 border-l-green-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-700" />
            Request Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Request Number</p>
              <p className="font-mono font-bold text-lg text-green-700">{requestData.requestNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Title</p>
              <p className="font-semibold">{requestData.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Requester</p>
              <p className="font-semibold">{requestData.requester}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-bold text-xl text-green-700">K{requestData.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Budget Line</p>
              <p className="font-semibold">{requestData.budgetLine}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Budget</p>
              <p className="font-semibold text-green-600">K{requestData.available.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600 mb-2">Vendor Quotes (3 required)</p>
            <div className="flex gap-3">
              {requestData.quotes.map((quote, idx) => (
                <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Upload className="w-3 h-3 mr-1" />
                  {quote.vendor}: K{quote.amount}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Workflow Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Steps Timeline */}
          <div className="lg:col-span-2 space-y-4">
            {currentWorkflow.map((step, idx) => (
              <Card
                key={step.id}
                className={`p-6 transition-all duration-300 ${
                  step.status === "active"
                    ? "bg-green-50 border-2 border-green-700 shadow-lg scale-105"
                    : step.status === "completed"
                    ? "bg-green-100 border-green-300"
                    : "bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {step.status === "completed" ? (
                      <div className="w-12 h-12 rounded-full bg-green-700 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                    ) : step.status === "active" ? (
                      <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-white font-bold">{idx + 1}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                      {step.status === "completed" && step.timestamp && (
                        <span className="text-xs text-gray-500">{step.timestamp}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">{step.actor}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{step.action}</span>
                    </div>

                    {/* Details List */}
                    <ul className="space-y-1 mb-3">
                      {step.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-700 mt-0.5">•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Email Notification */}
                    {step.emailSent && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-800">
                          <strong>Email sent to:</strong> {step.emailTo}
                        </span>
                      </div>
                    )}

                    {/* Request Status */}
                    {step.requestStatus && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <span className="text-xs text-gray-600">Request Status: </span>
                        <Badge className="ml-2 bg-green-700 text-white">
                          {step.requestStatus}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <Card className="p-6 bg-white shadow-lg sticky top-8">
              <h2 className="text-xl font-semibold mb-4">Demo Controls</h2>

              <div className="space-y-3">
                <Button
                  onClick={nextStep}
                  disabled={currentStep >= currentWorkflow.length - 1}
                  className="w-full bg-green-700 hover:bg-green-800"
                >
                  Next Step <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  onClick={prevStep}
                  disabled={currentStep <= 0}
                  variant="outline"
                  className="w-full"
                >
                  Previous Step
                </Button>

                <Button
                  onClick={resetDemo}
                  variant="outline"
                  className="w-full border-gray-300"
                >
                  Reset Demo
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">Progress</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-700 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / currentWorkflow.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Step {currentStep + 1} of {currentWorkflow.length}
                </p>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold mb-3 text-gray-700">
                  Microsoft 365 Services Replicated:
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Power Automate (routing)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Microsoft Forms (submission)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>SharePoint (documents)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Microsoft Lists (tracking)</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-3 h-3" />
                    <span>Teams/Outlook (notifications)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Scenario Info */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Current Scenario:</h3>
              <p className="text-sm text-green-800">
                {scenario === "normal" && "✅ Normal approval path - request will be fully approved and paid"}
                {scenario === "query" && "❓ Query path - ProVC will return request for missing third quote"}
                {scenario === "deny" && "❌ Denial path - ProVC will deny due to budget constraints"}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
