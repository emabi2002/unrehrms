'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Building2,
  User,
  Phone,
  TrendingUp,
  Clock,
  AlertCircle,
  Download,
  Eye,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  getAAPById,
  getAAPLinesByAAP,
  getMonthlySchedule,
  submitAAP,
  approveAAP,
  rejectAAP,
} from '@/lib/aap';
import type { AAPHeader, AAPLine, AAPLineSchedule, AAPStatus } from '@/lib/aap-types';
import { MONTHS } from '@/lib/aap-types';
import { exportAAPToPDF } from '@/lib/aap-pdf-export';

export default function AAPDetailPage() {
  const router = useRouter();
  const params = useParams();
  const aapId = parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [aap, setAAP] = useState<AAPHeader | null>(null);
  const [lines, setLines] = useState<AAPLine[]>([]);
  const [schedules, setSchedules] = useState<{ [lineId: number]: AAPLineSchedule[] }>({});
  const [processing, setProcessing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  useEffect(() => {
    loadAAPData();
  }, [aapId]);

  async function loadAAPData() {
    try {
      setLoading(true);

      // Get AAP with relations
      const aapData = await getAAPById(aapId);
      if (!aapData) {
        toast.error('AAP not found');
        router.push('/dashboard/aap');
        return;
      }
      setAAP(aapData);

      // Get AAP lines
      const linesData = await getAAPLinesByAAP(aapId);
      setLines(linesData);

      // Get schedules for each line
      const schedulesData: { [lineId: number]: AAPLineSchedule[] } = {};
      for (const line of linesData) {
        const lineSchedules = await getMonthlySchedule(line.aap_line_id);
        schedulesData[line.aap_line_id] = lineSchedules;
      }
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading AAP:', error);
      toast.error('Failed to load AAP details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!aap) return;

    try {
      setProcessing(true);
      await submitAAP(aap.aap_id);
      toast.success('AAP submitted for approval successfully');
      await loadAAPData(); // Reload to get updated status
    } catch (error) {
      console.error('Error submitting AAP:', error);
      toast.error('Failed to submit AAP');
    } finally {
      setProcessing(false);
    }
  }

  async function handleApprove() {
    if (!aap) return;

    try {
      setProcessing(true);
      await approveAAP(aap.aap_id, 'current-user-id'); // TODO: Get from auth
      toast.success('AAP approved successfully');
      await loadAAPData();
    } catch (error) {
      console.error('Error approving AAP:', error);
      toast.error('Failed to approve AAP');
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!aap) return;

    try {
      setProcessing(true);
      await rejectAAP(aap.aap_id);
      toast.success('AAP rejected');
      await loadAAPData();
    } catch (error) {
      console.error('Error rejecting AAP:', error);
      toast.error('Failed to reject AAP');
    } finally {
      setProcessing(false);
    }
  }

  async function handleExportPDF() {
    if (!aap) return;

    try {
      setExportingPDF(true);

      // Transform schedules format
      const schedulesForExport: { [lineId: number]: AAPLineSchedule[] } = {};
      Object.keys(schedules).forEach(key => {
        const lineId = parseInt(key);
        schedulesForExport[lineId] = schedules[lineId];
      });

      const fileName = await exportAAPToPDF(aap, lines, schedulesForExport);
      toast.success(`PDF exported: ${fileName}`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExportingPDF(false);
    }
  }

  function getStatusColor(status: AAPStatus) {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusIcon(status: AAPStatus) {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="w-5 h-5" />;
      case 'Submitted':
        return <Clock className="w-5 h-5" />;
      case 'Draft':
        return <Edit className="w-5 h-5" />;
      case 'Rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AAP details...</p>
        </div>
      </div>
    );
  }

  if (!aap) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AAP Not Found</h3>
              <p className="text-gray-600 mb-4">The requested AAP could not be found.</p>
              <Link href="/dashboard/aap">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to AAPs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/aap">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to AAPs
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">Annual Activity Plan</h1>
              <Badge className={getStatusColor(aap.status)}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(aap.status)}
                  {aap.status}
                </span>
              </Badge>
            </div>
            <p className="text-gray-600">
              Fiscal Year {aap.fiscal_year?.year_id} • Created {new Date(aap.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {aap.status === 'Draft' && (
            <>
              <Link href={`/dashboard/aap/${aap.aap_id}/edit`}>
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </Link>
              <Button
                onClick={handleSubmit}
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {processing ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </>
          )}

          {aap.status === 'Submitted' && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={processing}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {processing ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={exportingPDF}
          >
            {exportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* AAP Header Information */}
      <Card>
        <CardHeader>
          <CardTitle>Header Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Division</p>
                <p className="font-medium text-gray-900">
                  {aap.division?.code} - {aap.division?.name}
                </p>
              </div>
            </div>

            {aap.department && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-900">
                    {aap.department.code} - {aap.department.name}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Program</p>
                <p className="font-medium text-gray-900">{aap.program?.program_name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Activity</p>
                <p className="font-medium text-gray-900">
                  {aap.activity_project?.code} - {aap.activity_project?.name}
                </p>
              </div>
            </div>

            {aap.manager && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Manager</p>
                  <p className="font-medium text-gray-900">{aap.manager}</p>
                </div>
              </div>
            )}

            {aap.telephone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Telephone</p>
                  <p className="font-medium text-gray-900">{aap.telephone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Total Proposed Cost</p>
                <p className="text-xl font-bold text-emerald-600">
                  K{aap.total_proposed_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            {aap.submitted_date && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Submitted</p>
                  <p className="font-medium text-gray-900">
                    {new Date(aap.submitted_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {aap.approved_date && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="font-medium text-gray-900">
                    {new Date(aap.approved_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Line Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Activity Line Items ({lines.length})</CardTitle>
              <CardDescription>Planned activities with proposed costs and outputs</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {lines.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No activity line items</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={line.aap_line_id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {line.item_no}
                        </Badge>
                        {line.economic_item_code && (
                          <Badge variant="outline">
                            {line.economic_item_code} - {line.chart_of_accounts?.economic_item_name}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-lg text-gray-900 mb-1">
                        {line.activity_description}
                      </h4>
                      {line.specific_output && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Specific Output:</span> {line.specific_output}
                        </p>
                      )}
                      {line.target_output && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Target:</span> {line.target_output}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm text-gray-600">Proposed Cost</p>
                      <p className="text-xl font-bold text-emerald-600">
                        K{line.proposed_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {line.manpower_months && line.manpower_months > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {line.manpower_months} manpower months
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Monthly Schedule for this line */}
                  {schedules[line.aap_line_id] && schedules[line.aap_line_id].length > 0 && (
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">Implementation Schedule:</p>
                      <div className="grid grid-cols-12 gap-1">
                        {MONTHS.map((month) => {
                          const monthSchedule = schedules[line.aap_line_id]?.find(
                            (s) => s.month === month.value
                          );
                          const isScheduled = monthSchedule?.is_scheduled || false;

                          return (
                            <div
                              key={month.value}
                              className={`p-1.5 rounded text-center text-xs font-medium ${
                                isScheduled
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                              title={isScheduled ? `${month.label}: Scheduled` : month.label}
                            >
                              {month.short}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Total */}
              <div className="border-t pt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Proposed Cost</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    K{aap.total_proposed_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status History */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Edit className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Created as Draft</p>
                <p className="text-sm text-gray-600">
                  {new Date(aap.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {aap.submitted_date && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center">
                  <Send className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Submitted for Approval</p>
                  <p className="text-sm text-gray-600">
                    {new Date(aap.submitted_date).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {aap.approved_date && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Approved</p>
                  <p className="text-sm text-gray-600">
                    {new Date(aap.approved_date).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {aap.status === 'Rejected' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Rejected</p>
                  <p className="text-sm text-gray-600">
                    {new Date(aap.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Budget Linkage (if approved) */}
      {aap.status === 'Approved' && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-green-800">
              <p>
                <strong>This AAP has been approved!</strong> The next steps are:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Finance Office will receive government budget appropriation</li>
                <li>Budget allocations will be mapped to these AAP line items</li>
                <li>Budget lines will be created linking approved amounts to each activity</li>
                <li>All future GE requests must reference an AAP activity</li>
                <li>Real-time budget checking will be enforced</li>
              </ol>
              <div className="mt-4 flex gap-3">
                <Link href="/dashboard/budget/allocation">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <Eye className="w-4 h-4 mr-2" />
                    View Budget Allocation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
