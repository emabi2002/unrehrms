"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Building2, CheckCircle, Shield, TrendingUp, Users, FileText } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/unre-logo.svg"
              alt="UNRE Logo"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-slate-900">UNRE</h1>
              <p className="text-xs text-slate-600">GE Request System</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-slate-300">Login</Button>
            </Link>
            <Link href="/demo">
              <Button className="bg-gradient-to-r from-unre-green-600 to-unre-green-700 hover:from-unre-green-700 hover:to-unre-green-800">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 bg-gradient-to-b from-slate-50/50 to-white">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-block mb-6 px-4 py-2 bg-unre-green-50 border border-unre-green-100 rounded-full">
            <span className="text-sm font-semibold text-unre-green-800">
              Digital Transformation for Higher Education
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Automated GE Request &<br />Budget Control System
          </h2>
          <p className="text-xl text-slate-700 mb-4 font-medium">
            University of Natural Resources & Environment of PNG
          </p>
          <p className="text-lg text-slate-600 mb-10 leading-relaxed">
            Streamline approvals, eliminate paperwork, and gain real-time visibility into your spending
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-unre-green-600 to-unre-green-700 hover:from-unre-green-700 hover:to-unre-green-800 shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-2 border-slate-300 hover:border-unre-green-600 hover:bg-unre-green-50">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {[
            { label: "No More Lost Forms", value: "100%", icon: CheckCircle },
            { label: "Faster Approvals", value: "10x", icon: TrendingUp },
            { label: "Complete Audit Trail", value: "Full", icon: Shield },
            { label: "Real-time Visibility", value: "24/7", icon: Users },
          ].map((stat, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-all duration-300 bg-white border-slate-200 group">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-unre-green-600 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-bold text-slate-900 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-50 py-20 border-y border-slate-200">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Features
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Enterprise-grade tools designed specifically for academic institutions
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Digital GE Requests",
                description: "Create, submit, and track GE requests online. No more paper forms or lost documents.",
                icon: FileText,
                features: [
                  "Online form submission",
                  "Document attachments",
                  "Auto-numbering",
                  "Status tracking",
                ],
              },
              {
                title: "Multi-Level Approvals",
                description: "Configurable approval workflows with automatic routing based on amount and type.",
                icon: CheckCircle,
                features: [
                  "HOD → Dean → Bursar → Registrar",
                  "Amount-based routing",
                  "Email notifications",
                  "Escalation rules",
                ],
              },
              {
                title: "PGAS Integration",
                description: "Seamless integration with AAP budget for real-time spending visibility.",
                icon: TrendingUp,
                features: [
                  "Budget vs Actual",
                  "Commitment tracking",
                  "Available balance",
                  "Manager dashboards",
                ],
              },
              {
                title: "Budget Control",
                description: "Prevent overspending with real-time budget checks and commitment tracking.",
                icon: Shield,
                features: [
                  "Real-time validation",
                  "Commitment register",
                  "Budget alerts",
                  "Virement workflow",
                ],
              },
              {
                title: "Payment Processing",
                description: "Streamline bursary operations from commitment to payment voucher generation.",
                icon: Building2,
                features: [
                  "Payment vouchers",
                  "Cheque/EFT recording",
                  "Payment tracking",
                  "Bank reconciliation",
                ],
              },
              {
                title: "Reporting & Analytics",
                description: "Comprehensive reports and dashboards for all stakeholders.",
                icon: Users,
                features: [
                  "Manager dashboards",
                  "Audit trails",
                  "Spending analysis",
                  "Excel exports",
                ],
              },
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 hover:shadow-xl transition-all duration-300 bg-white border-slate-200 group h-full">
                <div className="mb-6 p-4 bg-unre-green-50 rounded-lg inline-block group-hover:bg-unre-green-100 transition-colors">
                  <feature.icon className="h-10 w-10 text-unre-green-700" />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-unre-green-700 transition-colors">{feature.title}</h4>
                <p className="text-slate-600 mb-6 leading-relaxed">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.features.map((item, i) => (
                    <li key={i} className="flex items-center text-slate-700">
                      <CheckCircle className="h-5 w-5 text-unre-green-600 mr-3 flex-shrink-0" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h3>
            <p className="text-lg text-slate-600">
              A streamlined five-step process from request to payment
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            {[
              {
                step: 1,
                title: "Create Request",
                description: "Staff member creates a GE request online, selects cost centre and budget line, attaches supporting documents.",
              },
              {
                step: 2,
                title: "Approval Workflow",
                description: "Request automatically routed to HOD → Dean → Bursar → Registrar based on amount and type. Each approver receives email notification.",
              },
              {
                step: 3,
                title: "Budget Check",
                description: "System validates against AAP budget. Creates commitment if funds available. Alerts if insufficient balance.",
              },
              {
                step: 4,
                title: "Purchase & Receipt",
                description: "Purchase order generated (if needed). Goods/services received and documented. Invoice uploaded.",
              },
              {
                step: 5,
                title: "Payment",
                description: "Bursary creates payment voucher, records payment details, updates PGAS. Complete audit trail maintained.",
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-6 mb-10 group">
                <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-br from-unre-green-600 to-unre-green-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  {item.step}
                </div>
                <div className="flex-1 pt-1">
                  <h4 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-unre-green-700 transition-colors">{item.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-slate-900 mb-4">
              Institutional Benefits
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive solutions designed for academic excellence and administrative efficiency
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: "For Management",
                icon: "👥",
                benefits: [
                  "Real-time visibility of spending across all cost centres",
                  "Prevent budget overruns with automated checks",
                  "Data-driven decision making with comprehensive reports",
                  "Improved financial control and accountability",
                ],
              },
              {
                title: "For Bursary Department",
                icon: "💼",
                benefits: [
                  "Eliminate paper chase and lost forms",
                  "Faster processing with digital workflows",
                  "Complete audit trail for every transaction",
                  "Seamless PGAS integration",
                ],
              },
              {
                title: "For Staff",
                icon: "📋",
                benefits: [
                  "Submit requests anytime, anywhere",
                  "Track status in real-time",
                  "Faster approvals and payments",
                  "No more duplicate submissions",
                ],
              },
              {
                title: "For Auditors",
                icon: "🔍",
                benefits: [
                  "Complete transaction history",
                  "Tamper-proof audit logs",
                  "Easy verification of approvals",
                  "Comprehensive reporting",
                ],
              },
            ].map((section, idx) => (
              <Card key={idx} className="p-8 bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-4xl">{section.icon}</div>
                  <h4 className="text-2xl font-bold text-slate-900 group-hover:text-unre-green-700 transition-colors">
                    {section.title}
                  </h4>
                </div>
                <ul className="space-y-3">
                  {section.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start text-slate-700">
                      <CheckCircle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0 text-unre-green-600" />
                      <span className="leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-unre-green-600 to-unre-green-700">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your GE Request Process?
          </h3>
          <p className="text-xl text-unre-green-50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join UNRE in modernizing financial operations with our comprehensive system
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-unre-green-700 hover:bg-slate-50 shadow-xl hover:shadow-2xl transition-all font-semibold text-lg px-8">
              Login to System
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/images/unre-logo.svg"
                alt="UNRE Logo"
                className="h-10 w-10 object-contain"
              />
              <div className="text-left">
                <p className="font-semibold text-white">
                  University of Natural Resources & Environment of PNG
                </p>
                <p className="text-slate-400 text-sm">
                  GE Request & Budget Control System v1.0
                </p>
              </div>
            </div>
            <div className="text-slate-400 text-sm">
              © 2025 All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
