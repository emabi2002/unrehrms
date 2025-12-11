'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import WorkflowDiagram from '@/components/WorkflowDiagram';
import { ArrowLeft, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface GERequest {
  id: number;
  request_number: string;
  title: string;
  description: string;
  justification: string;
  total_amount: number;
  status: string;
  priority: string;
  created_at: string;
  submitted_at: string;
  required_date: string;
  user_profiles?: { full_name: string; email: string };
  cost_centres?: { name: string; code: string };
  budget_lines?: { description: string; pgas_vote_code: string };
  ge_request_items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
  }>;
  ge_approvals?: Array<{
    role_name: string;
    action: string;
    actioned_at: string;
    comments?: string;
    user_profiles?: { full_name: string };
  }>;
}

export default function GERequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requestId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<GERequest | null>(null);

  useEffect(() => {
    loadRequestDetails();
  }, [requestId]);

  async function loadRequestDetails() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ge_requests')
        .select(`
          *,
          user_profiles!ge_requests_requester_id_fkey (full_name, email),
          cost_centres (name, code),
          budget_lines (description, pgas_vote_code),
          ge_request_items (*),
          ge_approvals (
            *,
            user_profiles!ge_approvals_approver_id_fkey (full_name)
          )
        `)
        .eq('id', requestId)
        .single();

      if (error) throw error;

      setRequest(data as GERequest);
    } catch (error) {
      console.error('Error loading request details:', error);
      toast.error('Failed to load request details');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Request not found</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{request.request_number}</h1>
            <p className="text-gray-600">{request.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            View Documents
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Status and Amount */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={
                request.status === 'Approved' || request.status === 'Paid'
                  ? 'border-green-500 text-green-700'
                  : request.status === 'Denied'
                    ? 'border-red-500 text-red-700'
                    : request.status === 'Queried'
                      ? 'border-orange-500 text-orange-700'
                      : 'border-blue-500 text-blue-700'
              }
            >
              {request.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              K{parseFloat(request.total_amount.toString()).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={
                request.priority === 'High'
                  ? 'border-red-500 text-red-700'
                  : request.priority === 'Medium'
                    ? 'border-orange-500 text-orange-700'
                    : 'border-blue-500 text-blue-700'
              }
            >
              {request.priority}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-900">
              {request.submitted_at
                ? new Date(request.submitted_at).toLocaleDateString()
                : new Date(request.created_at).toLocaleDateString()
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600">Requester</p>
              <p className="text-gray-900">{request.user_profiles?.full_name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{request.user_profiles?.email}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Cost Centre</p>
              <p className="text-gray-900">{request.cost_centres?.name || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{request.cost_centres?.code}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600">Budget Line</p>
              <p className="text-gray-900">{request.budget_lines?.description || 'Unknown'}</p>
              <p className="text-sm text-gray-600">{request.budget_lines?.pgas_vote_code}</p>
            </div>

            {request.required_date && (
              <div>
                <p className="text-sm font-medium text-gray-600">Required By</p>
                <p className="text-gray-900">{new Date(request.required_date).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description & Justification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Description</p>
              <p className="text-gray-900">{request.description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Justification</p>
              <p className="text-gray-900">{request.justification}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {request.ge_request_items && request.ge_request_items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {request.ge_request_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">K{parseFloat(item.unit_price.toString()).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        K{parseFloat(item.total_amount.toString()).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                      Total Amount:
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-600">
                      K{parseFloat(request.total_amount.toString()).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Workflow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Approval Workflow & Status
          </CardTitle>
          <CardDescription>
            Visual representation of the approval process based on amount-based routing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowDiagram
            requestAmount={parseFloat(request.total_amount.toString())}
            currentStatus={request.status}
            approvalHistory={request.ge_approvals?.map(approval => ({
              role_name: approval.role_name,
              action: approval.action,
              actioned_at: approval.actioned_at,
              approver_name: approval.user_profiles?.full_name,
              comments: approval.comments
            }))}
          />
        </CardContent>
      </Card>

      {/* Approval History */}
      {request.ge_approvals && request.ge_approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Approval History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {request.ge_approvals
                .sort((a, b) => new Date(b.actioned_at).getTime() - new Date(a.actioned_at).getTime())
                .map((approval, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={
                          approval.action === 'Approved'
                            ? 'border-green-500 text-green-700'
                            : approval.action === 'Denied'
                              ? 'border-red-500 text-red-700'
                              : approval.action === 'Queried'
                                ? 'border-orange-500 text-orange-700'
                                : 'border-blue-500 text-blue-700'
                        }
                      >
                        {approval.action}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {approval.user_profiles?.full_name || 'System'}
                      </p>
                      <p className="text-sm text-gray-600">{approval.role_name}</p>
                      {approval.comments && (
                        <p className="text-sm text-gray-700 mt-1 italic">"{approval.comments}"</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(approval.actioned_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
