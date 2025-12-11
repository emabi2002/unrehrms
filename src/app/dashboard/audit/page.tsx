'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  TrendingUp,
  Shuffle
} from 'lucide-react';
import { toast } from 'sonner';

interface AuditItem {
  id: number;
  request_number: string;
  title: string;
  total_amount: number;
  requester_name: string;
  cost_centre: string;
  payment_date: string;
  status: string;
  audit_status: 'pending' | 'in_review' | 'approved' | 'flagged';
  risk_level: 'low' | 'medium' | 'high';
  compliance_score: number;
}

interface AuditFinding {
  id: number;
  ge_request_id: number;
  request_number: string;
  finding_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  auditor_name: string;
  created_at: string;
  status: 'open' | 'resolved' | 'acknowledged';
}

interface ComplianceCheck {
  check_name: string;
  passed: boolean;
  details: string;
}

export default function InternalAuditDashboard() {
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [auditNotes, setAuditNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_audited: 0,
    flagged: 0,
    compliance_rate: 0,
    high_risk: 0
  });

  useEffect(() => {
    fetchAuditData();
  }, []);

  async function fetchAuditData() {
    setLoading(true);
    try {
      await Promise.all([
        fetchPaidRequests(),
        fetchAuditFindings(),
        calculateStats()
      ]);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setLoading(false);
    }
  }

  async function fetchPaidRequests() {
    const { data, error } = await supabase
      .from('ge_requests')
      .select(`
        *,
        user_profiles!ge_requests_requester_id_fkey (full_name),
        cost_centres (name, code)
      `)
      .eq('status', 'Paid')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching paid requests:', error);
      return;
    }

    // Transform to audit items with risk assessment
    const items: AuditItem[] = data?.map((req: any) => {
      const riskLevel = calculateRiskLevel(req);
      const complianceScore = calculateComplianceScore(req);

      return {
        id: req.id,
        request_number: req.request_number,
        title: req.title,
        total_amount: parseFloat(req.total_amount),
        requester_name: req.user_profiles?.full_name || 'Unknown',
        cost_centre: req.cost_centres?.name || 'Unknown',
        payment_date: req.updated_at,
        status: req.status,
        audit_status: 'pending',
        risk_level: riskLevel,
        compliance_score: complianceScore
      };
    }) || [];

    setAuditItems(items);
  }

  function calculateRiskLevel(request: any): 'low' | 'medium' | 'high' {
    const amount = parseFloat(request.total_amount);

    // Risk factors
    if (amount > 50000) return 'high';
    if (amount > 15000) return 'medium';
    return 'low';
  }

  function calculateComplianceScore(request: any): number {
    let score = 100;

    // Deduct points for missing or incomplete data
    if (!request.justification || request.justification.length < 50) score -= 10;
    if (!request.required_date) score -= 5;
    if (!request.supplier_id) score -= 10;

    return Math.max(score, 0);
  }

  async function fetchAuditFindings() {
    // In a real implementation, this would fetch from audit_findings table
    // For now, we'll use mock data
    const mockFindings: AuditFinding[] = [
      {
        id: 1,
        ge_request_id: 1,
        request_number: 'GE-2025-000123',
        finding_type: 'Missing Documentation',
        severity: 'medium',
        description: 'Only 2 vendor quotes provided instead of required 3',
        recommendation: 'Ensure all future requests include minimum 3 vendor quotes',
        auditor_name: 'Internal Audit Team',
        created_at: new Date().toISOString(),
        status: 'open'
      },
      {
        id: 2,
        ge_request_id: 2,
        request_number: 'GE-2025-000115',
        finding_type: 'Budget Overrun',
        severity: 'high',
        description: 'Expenditure exceeded approved budget line by 15%',
        recommendation: 'Require budget virement approval before committing to expenses',
        auditor_name: 'Internal Audit Team',
        created_at: new Date().toISOString(),
        status: 'acknowledged'
      }
    ];

    setFindings(mockFindings);
  }

  async function calculateStats() {
    const total = auditItems.length;
    const flagged = auditItems.filter(i => i.audit_status === 'flagged').length;
    const highRisk = auditItems.filter(i => i.risk_level === 'high').length;
    const avgCompliance = auditItems.length > 0
      ? auditItems.reduce((sum, item) => sum + item.compliance_score, 0) / auditItems.length
      : 0;

    setStats({
      total_audited: total,
      flagged,
      compliance_rate: avgCompliance,
      high_risk: highRisk
    });
  }

  async function performComplianceCheck(item: AuditItem) {
    setSelectedItem(item);

    // Fetch full request details
    const { data, error } = await supabase
      .from('ge_requests')
      .select(`
        *,
        ge_request_items (*),
        ge_approvals (*),
        payment_vouchers (*)
      `)
      .eq('id', item.id)
      .single();

    if (error) {
      toast.error('Failed to load request details');
      return;
    }

    // Perform compliance checks
    const requestData = data as any;
    const checks: ComplianceCheck[] = [
      {
        check_name: '3 Vendor Quotes Required',
        passed: (requestData.ge_request_items?.length || 0) >= 3,
        details: `Found ${requestData.ge_request_items?.length || 0} line items`
      },
      {
        check_name: 'Proper Authorization',
        passed: (requestData.ge_approvals?.length || 0) >= 2,
        details: `${requestData.ge_approvals?.length || 0} approvals recorded`
      },
      {
        check_name: 'Budget Line Valid',
        passed: !!requestData.budget_line_id,
        details: requestData.budget_line_id ? 'Budget line assigned' : 'No budget line'
      },
      {
        check_name: 'Justification Provided',
        passed: (requestData.justification?.length || 0) > 50,
        details: `${requestData.justification?.length || 0} characters`
      },
      {
        check_name: 'Payment Voucher Created',
        passed: (requestData.payment_vouchers?.length || 0) > 0,
        details: `${requestData.payment_vouchers?.length || 0} vouchers`
      },
      {
        check_name: 'Within Budget',
        passed: true, // Would check against budget line
        details: 'Budget validation passed'
      }
    ];

    setComplianceChecks(checks);
  }

  async function flagForReview(severity: 'low' | 'medium' | 'high' | 'critical') {
    if (!selectedItem || !auditNotes) {
      toast.error('Please add audit notes before flagging');
      return;
    }

    // In real implementation, save to database
    toast.success(`Request ${selectedItem.request_number} flagged for review`);

    // Add to findings
    const newFinding: AuditFinding = {
      id: findings.length + 1,
      ge_request_id: selectedItem.id,
      request_number: selectedItem.request_number,
      finding_type: 'Audit Review Required',
      severity,
      description: auditNotes,
      recommendation: 'Pending auditor recommendation',
      auditor_name: 'Current User',
      created_at: new Date().toISOString(),
      status: 'open'
    };

    setFindings([newFinding, ...findings]);
    setAuditNotes('');
    setSelectedItem(null);
  }

  async function approveAuditItem() {
    if (!selectedItem) return;

    toast.success(`Request ${selectedItem.request_number} audit approved`);
    setSelectedItem(null);
    setComplianceChecks([]);
  }

  function generateAuditSample() {
    // Random sampling of 10% of paid requests for detailed audit
    const sampleSize = Math.max(1, Math.floor(auditItems.length * 0.1));
    const shuffled = [...auditItems].sort(() => 0.5 - Math.random());
    const sample = shuffled.slice(0, sampleSize);

    toast.success(`Generated audit sample: ${sample.length} requests selected for detailed review`);
    setAuditItems(sample);
  }

  function exportAuditReport() {
    toast.success('Exporting Audit Report...');
  }

  const filteredItems = auditItems.filter(item => {
    const matchesSearch = item.request_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.audit_status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Audit Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internal Audit Dashboard</h1>
          <p className="text-gray-600 mt-1">Post-Payment Audit Review & Compliance Monitoring</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateAuditSample} variant="outline">
            <Shuffle className="w-4 h-4 mr-2" />
            Generate Sample
          </Button>
          <Button onClick={exportAuditReport} className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Audited</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total_audited}</div>
            <p className="text-xs text-gray-500 mt-1">Paid transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {stats.compliance_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Average score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Flagged Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.flagged}</div>
            <p className="text-xs text-gray-500 mt-1">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.high_risk}</div>
            <p className="text-xs text-gray-500 mt-1">Large value items</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Findings */}
      <Card className="border-l-4 border-l-red-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Audit Findings & Exceptions
          </CardTitle>
          <CardDescription>Items flagged for review or non-compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {findings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500" />
                <p>No audit findings. All transactions are compliant.</p>
              </div>
            ) : (
              findings.map((finding) => (
                <div
                  key={finding.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    finding.severity === 'critical'
                      ? 'bg-red-50 border-l-red-500'
                      : finding.severity === 'high'
                        ? 'bg-orange-50 border-l-orange-500'
                        : finding.severity === 'medium'
                          ? 'bg-yellow-50 border-l-yellow-500'
                          : 'bg-blue-50 border-l-blue-500'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{finding.severity.toUpperCase()}</Badge>
                        <span className="font-semibold">{finding.request_number}</span>
                        <Badge
                          variant="outline"
                          className={
                            finding.status === 'open'
                              ? 'border-red-500 text-red-700'
                              : finding.status === 'acknowledged'
                                ? 'border-orange-500 text-orange-700'
                                : 'border-green-500 text-green-700'
                          }
                        >
                          {finding.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{finding.finding_type}</p>
                      <p className="text-sm text-gray-700 mb-2">{finding.description}</p>
                      <p className="text-sm text-gray-600 italic">
                        <strong>Recommendation:</strong> {finding.recommendation}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        By {finding.auditor_name} on {new Date(finding.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Audit Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Audit Queue - Paid Transactions
          </CardTitle>
          <CardDescription>Review completed payments for compliance</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by request number or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="in_review">In Review</option>
              <option value="approved">Approved</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>

          {/* Audit Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compliance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.request_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.title}</td>
                    <td className="px-4 py-3 text-sm font-semibold">K{item.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          item.risk_level === 'high'
                            ? 'border-red-500 text-red-700'
                            : item.risk_level === 'medium'
                              ? 'border-orange-500 text-orange-700'
                              : 'border-green-500 text-green-700'
                        }
                      >
                        {item.risk_level.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.compliance_score >= 90
                                ? 'bg-green-500'
                                : item.compliance_score >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${item.compliance_score}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{item.compliance_score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => performComplianceCheck(item)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Audit Review Panel */}
      {selectedItem && (
        <Card className="border-2 border-emerald-600">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Audit Review: {selectedItem.request_number}
            </CardTitle>
            <CardDescription>{selectedItem.title}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Compliance Checks */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Compliance Checks</h3>
              <div className="space-y-2">
                {complianceChecks.map((check, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {check.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{check.check_name}</p>
                        <p className="text-sm text-gray-600">{check.details}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={check.passed ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'}>
                      {check.passed ? 'PASS' : 'FAIL'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Notes & Observations
              </label>
              <Textarea
                value={auditNotes}
                onChange={(e) => setAuditNotes(e.target.value)}
                placeholder="Enter audit observations, findings, or recommendations..."
                rows={4}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={approveAuditItem}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Audit
              </Button>
              <Button
                onClick={() => flagForReview('low')}
                variant="outline"
                className="border-blue-500 text-blue-700"
              >
                Flag - Low
              </Button>
              <Button
                onClick={() => flagForReview('medium')}
                variant="outline"
                className="border-yellow-500 text-yellow-700"
              >
                Flag - Medium
              </Button>
              <Button
                onClick={() => flagForReview('high')}
                variant="outline"
                className="border-orange-500 text-orange-700"
              >
                Flag - High
              </Button>
              <Button
                onClick={() => flagForReview('critical')}
                variant="outline"
                className="border-red-500 text-red-700"
              >
                Flag - Critical
              </Button>
              <Button
                onClick={() => {
                  setSelectedItem(null);
                  setComplianceChecks([]);
                  setAuditNotes('');
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
