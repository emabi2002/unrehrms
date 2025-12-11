"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ArrowRight, Play, FileText, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-unre-green-50 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-unre-green-600 to-unre-green-800 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">UNRE GE System</h1>
              <p className="text-xs text-slate-600">Interactive Demo</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-unre-green-600 to-unre-green-700">
                Try Live Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge className="mb-4 bg-unre-green-600">Interactive System Demo</Badge>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            See the UNRE GE Request System in Action
          </h2>
          <p className="text-xl text-slate-600 mb-8">
            Explore how the system transforms your GE request workflow from paper to digital
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/demo/workflow-test">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-amber-700">
                <Play className="mr-2 h-5 w-5" />
                Test Workflow Automation
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-unre-green-600 to-unre-green-700">
                <Play className="mr-2 h-5 w-5" />
                Launch Interactive Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* User Roles */}
        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Explore Different User Roles
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-unre-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-unre-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Staff/Requestor</h4>
              <p className="text-slate-600 mb-4">Create and track your GE requests online. No more paper forms.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Create GE requests with line items</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Upload supporting documents</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Track approval status in real-time</span>
                </li>
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Demo as Staff
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-unre-green-200 bg-unre-green-50">
              <div className="h-12 w-12 bg-unre-green-600 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Approver (HOD/Dean)</h4>
              <p className="text-slate-600 mb-4">Review and approve requests with full context and budget visibility.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>See budget impact before approving</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Review justification and documents</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Approve, reject, or return for clarification</span>
                </li>
              </ul>
              <Link href="/login">
                <Button className="w-full bg-unre-green-600 hover:bg-unre-green-700">
                  Demo as Approver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Bursar/Finance</h4>
              <p className="text-slate-600 mb-4">Manage budget, commitments, and payments with PGAS integration.</p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Real-time budget vs actual tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Commitment management</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Payment voucher processing</span>
                </li>
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Demo as Bursar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        {/* Key Features Demo */}
        <section>
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Interactive Feature Walkthrough
          </h3>
          <div className="space-y-4">
            {[
              {
                number: "01",
                title: "Create GE Request",
                description: "Staff members create requests online with multi-line items, attachments, and automatic budget validation",
                features: ["Select cost centre & budget line", "Add line items with quantities", "Upload quotes and invoices", "Real-time budget check"],
              },
              {
                number: "02",
                title: "Multi-Level Approval Workflow",
                description: "Requests automatically route through HOD → Dean → Bursar → Registrar based on amount and type",
                features: ["Email notifications to approvers", "Complete request history", "Budget impact visibility", "Approve/Reject/Return options"],
              },
              {
                number: "03",
                title: "Budget Tracking & PGAS Integration",
                description: "Real-time visibility into budget vs actual expenditure vs commitments for all cost centres",
                features: ["AAP budget line mapping", "PGAS synchronization", "Commitment tracking", "Available balance alerts"],
              },
              {
                number: "04",
                title: "Payment Processing",
                description: "Streamlined payment workflow from commitment to payment voucher to bank payment",
                features: ["Payment voucher generation", "Multiple payment methods", "Payment tracking", "Ledger integration"],
              },
              {
                number: "05",
                title: "Comprehensive Reporting",
                description: "Dashboards and reports for managers, bursary, and auditors with export capabilities",
                features: ["Manager dashboards", "Spending analytics", "Audit trails", "Excel/PDF exports"],
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-unre-green-600 to-unre-green-800 rounded-lg flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{feature.number}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h4>
                    <p className="text-slate-600 mb-4">{feature.description}</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href="/login">
                      <Button variant="outline" size="sm">
                        Try This
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Sample Workflow */}
        <section className="bg-white rounded-xl p-8 border-2 border-unre-green-200">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Sample Workflow: K 22,300 Equipment Maintenance Request
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { stage: "Created", user: "Peter Wana", role: "Requester", time: "Jan 20, 9:30 AM", status: "complete" },
              { stage: "HOD Review", user: "Dr. John Kila", role: "HOD", time: "Jan 20, 11:15 AM", status: "complete" },
              { stage: "Dean Approval", user: "Prof. Sarah Mek", role: "Dean", time: "Jan 21, 2:00 PM", status: "complete" },
              { stage: "Bursar Check", user: "Emmanuel Saliki", role: "Bursar", time: "Pending", status: "current" },
              { stage: "Payment", user: "Bursary Clerk", role: "Payments", time: "Awaiting", status: "pending" },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold ${
                    step.status === "complete"
                      ? "bg-green-500 text-white"
                      : step.status === "current"
                        ? "bg-unre-green-600 text-white animate-pulse"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {idx + 1}
                </div>
                <p className="font-semibold text-slate-900">{step.stage}</p>
                <p className="text-sm text-slate-600">{step.user}</p>
                <p className="text-xs text-slate-500">{step.role}</p>
                <p className="text-xs text-slate-400 mt-1">{step.time}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-unre-green-600 to-unre-green-700">
                See This Workflow in Action
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-unre-green-600 to-unre-green-800 text-white rounded-xl p-12">
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your GE Process?</h3>
          <p className="text-xl mb-8 text-unre-green-100">
            Login with demo credentials and explore the full system
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                <Play className="mr-2 h-5 w-5" />
                Launch Interactive Demo
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-unre-green-100">
            <p>Demo credentials: demo@unre.ac.pg / demo123</p>
          </div>
        </section>
      </div>
    </div>
  );
}
