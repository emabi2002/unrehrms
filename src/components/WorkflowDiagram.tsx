'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, XCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  role: string;
  status: 'completed' | 'current' | 'pending' | 'skipped' | 'rejected';
  date?: string;
  approver?: string;
  comments?: string;
}

interface WorkflowDiagramProps {
  requestAmount: number;
  currentStatus: string;
  approvalHistory?: Array<{
    role_name: string;
    action: string;
    actioned_at: string;
    approver_name?: string;
    comments?: string;
  }>;
}

export default function WorkflowDiagram({ requestAmount, currentStatus, approvalHistory = [] }: WorkflowDiagramProps) {

  // Determine workflow path based on amount
  function getWorkflowPath(amount: number): WorkflowStep[] {
    const baseSteps: WorkflowStep[] = [
      {
        id: 'submission',
        name: 'Request Submitted',
        role: 'Originating Desk',
        status: 'completed'
      },
      {
        id: 'line_manager',
        name: 'Line Manager Approval',
        role: 'Line Manager/HOD',
        status: 'pending'
      }
    ];

    // Add cost centre head (amount-based routing)
    if (amount <= 5000) {
      baseSteps.push({
        id: 'provc',
        name: 'ProVC Approval',
        role: 'ProVC Planning & Development',
        status: 'pending'
      });
    } else if (amount > 5000 && amount <= 10000) {
      baseSteps.push({
        id: 'bursar',
        name: 'Bursar Approval',
        role: 'Bursar',
        status: 'pending'
      });
    } else if (amount > 10000 && amount <= 15000) {
      baseSteps.push({
        id: 'bursar',
        name: 'Bursar Approval',
        role: 'Bursar',
        status: 'pending'
      });
      baseSteps.push({
        id: 'provc',
        name: 'ProVC Approval',
        role: 'ProVC Planning & Development',
        status: 'pending'
      });
    } else {
      baseSteps.push({
        id: 'vc',
        name: 'Vice Chancellor Approval',
        role: 'Vice Chancellor',
        status: 'pending'
      });
    }

    // Add bursary steps
    baseSteps.push(
      {
        id: 'bursary',
        name: 'Bursary Processing',
        role: 'Bursary/Finance',
        status: 'pending'
      },
      {
        id: 'payment',
        name: 'Payment Completed',
        role: 'Payment',
        status: 'pending'
      }
    );

    return baseSteps;
  }

  // Map approval history to steps
  function mapHistoryToSteps(steps: WorkflowStep[]): WorkflowStep[] {
    const statusLower = currentStatus?.toLowerCase() || '';

    return steps.map((step, index) => {
      // Find matching approval in history
      const historyItem = approvalHistory.find(h =>
        h.role_name?.toLowerCase().includes(step.role.toLowerCase()) ||
        h.action?.toLowerCase().includes(step.name.toLowerCase())
      );

      if (historyItem) {
        return {
          ...step,
          status: historyItem.action === 'Denied' ? 'rejected' : 'completed',
          date: historyItem.actioned_at,
          approver: historyItem.approver_name,
          comments: historyItem.comments
        };
      }

      // Determine status based on current request status
      if (statusLower.includes('denied') || statusLower.includes('rejected')) {
        return { ...step, status: index === 0 ? 'completed' : 'skipped' };
      }

      if (statusLower.includes('queried')) {
        return { ...step, status: index === 0 ? 'completed' : 'pending' };
      }

      if (statusLower.includes('pending manager')) {
        return { ...step, status: step.id === 'line_manager' ? 'current' : index === 0 ? 'completed' : 'pending' };
      }

      if (statusLower.includes('pending provc')) {
        return {
          ...step,
          status: step.id === 'provc' ? 'current' : ['submission', 'line_manager'].includes(step.id) ? 'completed' : 'pending'
        };
      }

      if (statusLower.includes('pending vc')) {
        return {
          ...step,
          status: step.id === 'vc' ? 'current' : ['submission', 'line_manager'].includes(step.id) ? 'completed' : 'pending'
        };
      }

      if (statusLower.includes('pending bursar') || statusLower.includes('bursar')) {
        return {
          ...step,
          status: step.id === 'bursar' ? 'current' : ['submission', 'line_manager'].includes(step.id) ? 'completed' : 'pending'
        };
      }

      if (statusLower.includes('approved') || statusLower.includes('pending payment')) {
        return {
          ...step,
          status: step.id === 'bursary' ? 'current' :
                  ['submission', 'line_manager', 'provc', 'vc', 'bursar'].includes(step.id) ? 'completed' : 'pending'
        };
      }

      if (statusLower.includes('processing payment')) {
        return {
          ...step,
          status: step.id === 'payment' ? 'current' :
                  step.id !== 'payment' ? 'completed' : 'pending'
        };
      }

      if (statusLower.includes('paid')) {
        return { ...step, status: 'completed' };
      }

      return step;
    });
  }

  const workflowSteps = mapHistoryToSteps(getWorkflowPath(requestAmount));

  function getStatusIcon(status: WorkflowStep['status']) {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-emerald-500" />;
      case 'current':
        return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'skipped':
        return <Circle className="w-6 h-6 text-gray-300" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  }

  function getStatusColor(status: WorkflowStep['status']) {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 border-emerald-500 text-emerald-900';
      case 'current':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'rejected':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'skipped':
        return 'bg-gray-50 border-gray-300 text-gray-500';
      default:
        return 'bg-gray-50 border-gray-300 text-gray-700';
    }
  }

  return (
    <div className="space-y-6">
      {/* Amount-Based Routing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Approval Route</h4>
            <p className="text-sm text-blue-800">
              {requestAmount <= 5000 && "Amount ≤ K5,000: Originating Desk → Line Manager → ProVC Planning → Bursary"}
              {requestAmount > 5000 && requestAmount <= 10000 && "Amount K5,001 - K10,000: Originating Desk → Line Manager → Bursar → Bursary"}
              {requestAmount > 10000 && requestAmount <= 15000 && "Amount K10,001 - K15,000: Originating Desk → Line Manager → Bursar → ProVC Planning → Bursary"}
              {requestAmount > 15000 && "Amount > K15,000: Originating Desk → Line Manager → Vice Chancellor → Bursary"}
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Steps - Visual Diagram */}
      <div className="relative">
        {workflowSteps.map((step, index) => (
          <div key={step.id} className="relative">
            {/* Connecting Line */}
            {index < workflowSteps.length - 1 && (
              <div className="absolute left-[19px] top-12 w-0.5 h-16 bg-gray-300 z-0"></div>
            )}

            {/* Step Card */}
            <div className={`relative z-10 flex items-start gap-4 mb-4 p-4 rounded-lg border-2 transition-all ${getStatusColor(step.status)}`}>
              {/* Status Icon */}
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(step.status)}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-base mb-1">{step.name}</h3>
                    <p className="text-sm opacity-80">{step.role}</p>

                    {step.approver && (
                      <p className="text-sm mt-2">
                        <span className="font-medium">Approved by:</span> {step.approver}
                      </p>
                    )}

                    {step.comments && (
                      <p className="text-sm mt-1 italic">
                        <span className="font-medium">Comments:</span> {step.comments}
                      </p>
                    )}

                    {step.date && (
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(step.date).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={`${
                      step.status === 'completed'
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                        : step.status === 'current'
                          ? 'border-blue-500 text-blue-700 bg-blue-50'
                          : step.status === 'rejected'
                            ? 'border-red-500 text-red-700 bg-red-50'
                            : 'border-gray-400 text-gray-600'
                    }`}
                  >
                    {step.status === 'completed' && '✓ Completed'}
                    {step.status === 'current' && '⏳ In Progress'}
                    {step.status === 'rejected' && '✗ Rejected'}
                    {step.status === 'pending' && 'Pending'}
                    {step.status === 'skipped' && 'Skipped'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feedback Loops Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-purple-900">M&E Planning Feedback</h4>
          </div>
          <p className="text-sm text-purple-800">
            Budget utilization and spending patterns are automatically reported to M&E Planning for analysis
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="w-4 h-4 text-indigo-600" />
            <h4 className="font-semibold text-indigo-900">Internal Audit Review</h4>
          </div>
          <p className="text-sm text-indigo-800">
            All completed payments are logged for post-payment audit review and compliance checks
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <span>Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-500" />
            <span>Rejected</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-300" />
            <span>Skipped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
