/**
 * Automated Feedback Loops System
 * Analyzes patterns, learns from denials/queries, and provides recommendations
 */

import { supabase } from './supabase';

export interface FeedbackPattern {
  type: 'budget_overrun' | 'frequent_queries' | 'high_denial_rate' | 'missing_docs' | 'slow_processing' | 'good_performance';
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  department: string;
  department_id: number;
  message: string;
  recommendation: string;
  data: any;
  created_at: string;
}

export interface TrainingRecommendation {
  target_audience: string;
  topic: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  affected_count: number;
}

export interface CommonError {
  error_type: string;
  frequency: number;
  departments: string[];
  examples: string[];
  solution: string;
}

/**
 * Analyze budget utilization patterns
 */
export async function analyzeBudgetPatterns(): Promise<FeedbackPattern[]> {
  const patterns: FeedbackPattern[] = [];

  try {
    // Get all budget lines with utilization data
    const { data: budgetLines, error } = await supabase
      .from('budget_lines')
      .select(`
        *,
        cost_centres (id, name, code)
      `)
      .eq('budget_year', new Date().getFullYear())
      .eq('is_active', true);

    if (error) throw error;

    // Analyze each department's budget
    const deptBudgets = new Map<number, {
      name: string;
      code: string;
      total: number;
      spent: number;
      committed: number;
      available: number;
    }>();

    budgetLines?.forEach((line: any) => {
      const deptId = line.cost_centre_id;
      if (!deptBudgets.has(deptId)) {
        deptBudgets.set(deptId, {
          name: line.cost_centres?.name || 'Unknown',
          code: line.cost_centres?.code || 'N/A',
          total: 0,
          spent: 0,
          committed: 0,
          available: 0
        });
      }

      const dept = deptBudgets.get(deptId)!;
      dept.total += parseFloat(line.original_amount || 0);
      dept.spent += parseFloat(line.ytd_expenditure || 0);
      dept.committed += parseFloat(line.committed_amount || 0);
      dept.available += parseFloat(line.available_amount || 0);
    });

    // Generate feedback for each department
    for (const [deptId, budget] of deptBudgets.entries()) {
      const utilizationPercent = budget.total > 0
        ? ((budget.spent + budget.committed) / budget.total) * 100
        : 0;

      // Critical: Over 95% utilization
      if (utilizationPercent > 95) {
        patterns.push({
          type: 'budget_overrun',
          severity: 'critical',
          department: budget.name,
          department_id: deptId,
          message: `Budget utilization at ${utilizationPercent.toFixed(1)}% - Critical level reached`,
          recommendation: 'IMMEDIATE ACTION: Freeze all non-essential expenditures. Review and prioritize only critical expenses. Consider budget reallocation or supplementary funding.',
          data: {
            utilization: utilizationPercent,
            budget: budget.total,
            spent: budget.spent,
            committed: budget.committed,
            available: budget.available
          },
          created_at: new Date().toISOString()
        });
      }
      // High: 85-95% utilization
      else if (utilizationPercent > 85) {
        patterns.push({
          type: 'budget_overrun',
          severity: 'high',
          department: budget.name,
          department_id: deptId,
          message: `Budget utilization at ${utilizationPercent.toFixed(1)}% - Approaching limit`,
          recommendation: 'Monitor closely. Defer non-urgent expenses to next quarter. Begin planning for budget virement if needed.',
          data: {
            utilization: utilizationPercent,
            budget: budget.total,
            available: budget.available
          },
          created_at: new Date().toISOString()
        });
      }
      // Low utilization (< 40% by mid-year)
      else if (utilizationPercent < 40 && new Date().getMonth() >= 6) {
        patterns.push({
          type: 'budget_overrun',
          severity: 'medium',
          department: budget.name,
          department_id: deptId,
          message: `Budget utilization at ${utilizationPercent.toFixed(1)}% - Below target for current period`,
          recommendation: 'Review Annual Activity Plan. Accelerate planned activities to meet annual targets. Consider reallocating underutilized funds.',
          data: {
            utilization: utilizationPercent,
            budget: budget.total,
            available: budget.available
          },
          created_at: new Date().toISOString()
        });
      }
      // Good performance
      else if (utilizationPercent >= 60 && utilizationPercent <= 85) {
        patterns.push({
          type: 'good_performance',
          severity: 'info',
          department: budget.name,
          department_id: deptId,
          message: `Budget utilization at ${utilizationPercent.toFixed(1)}% - On track`,
          recommendation: 'Continue current spending pace. Excellent budget management.',
          data: {
            utilization: utilizationPercent,
            budget: budget.total
          },
          created_at: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error analyzing budget patterns:', error);
  }

  return patterns;
}

/**
 * Analyze query and denial patterns to identify training needs
 */
export async function analyzeQueryDenialPatterns(): Promise<{
  patterns: FeedbackPattern[];
  trainingNeeds: TrainingRecommendation[];
  commonErrors: CommonError[];
}> {
  const patterns: FeedbackPattern[] = [];
  const trainingNeeds: TrainingRecommendation[] = [];
  const commonErrors: CommonError[] = [];

  try {
    // Get all GE requests with query/denial status
    const { data: requests, error } = await supabase
      .from('ge_requests')
      .select(`
        *,
        cost_centres (id, name, code),
        user_profiles!ge_requests_requester_id_fkey (full_name, department),
        ge_approvals (
          action,
          comments,
          role_name
        )
      `)
      .in('status', ['Queried', 'Denied']);

    if (error) throw error;

    // Analyze by department
    const deptStats = new Map<number, {
      name: string;
      total_requests: number;
      queried: number;
      denied: number;
      query_reasons: string[];
      denial_reasons: string[];
    }>();

    requests?.forEach((req: any) => {
      const deptId = req.cost_centre_id;
      if (!deptStats.has(deptId)) {
        deptStats.set(deptId, {
          name: req.cost_centres?.name || 'Unknown',
          total_requests: 0,
          queried: 0,
          denied: 0,
          query_reasons: [],
          denial_reasons: []
        });
      }

      const stats = deptStats.get(deptId)!;
      stats.total_requests++;

      if (req.status === 'Queried') {
        stats.queried++;
        req.ge_approvals?.forEach((approval: any) => {
          if (approval.action === 'Queried' && approval.comments) {
            stats.query_reasons.push(approval.comments);
          }
        });
      } else if (req.status === 'Denied') {
        stats.denied++;
        req.ge_approvals?.forEach((approval: any) => {
          if (approval.action === 'Denied' && approval.comments) {
            stats.denial_reasons.push(approval.comments);
          }
        });
      }
    });

    // Generate patterns and training recommendations
    for (const [deptId, stats] of deptStats.entries()) {
      const queryRate = (stats.queried / stats.total_requests) * 100;
      const denialRate = (stats.denied / stats.total_requests) * 100;

      // High query rate
      if (queryRate > 30) {
        patterns.push({
          type: 'frequent_queries',
          severity: 'high',
          department: stats.name,
          department_id: deptId,
          message: `Query rate at ${queryRate.toFixed(1)}% (${stats.queried} of ${stats.total_requests} requests)`,
          recommendation: 'Conduct mandatory training on GE request requirements, documentation standards, and submission guidelines.',
          data: {
            query_rate: queryRate,
            queried_count: stats.queried,
            total_count: stats.total_requests,
            common_issues: analyzeCommonIssues(stats.query_reasons)
          },
          created_at: new Date().toISOString()
        });

        trainingNeeds.push({
          target_audience: `${stats.name} Department`,
          topic: 'GE Request Documentation Requirements',
          reason: `High query rate (${queryRate.toFixed(1)}%) indicates incomplete submissions`,
          priority: 'high',
          affected_count: stats.queried
        });
      }

      // High denial rate
      if (denialRate > 20) {
        patterns.push({
          type: 'high_denial_rate',
          severity: 'critical',
          department: stats.name,
          department_id: deptId,
          message: `Denial rate at ${denialRate.toFixed(1)}% (${stats.denied} of ${stats.total_requests} requests)`,
          recommendation: 'Review budget planning process. Implement pre-submission consultation with Budget Officer. Improve alignment with Annual Activity Plan.',
          data: {
            denial_rate: denialRate,
            denied_count: stats.denied,
            total_count: stats.total_requests,
            common_reasons: analyzeCommonIssues(stats.denial_reasons)
          },
          created_at: new Date().toISOString()
        });

        trainingNeeds.push({
          target_audience: `${stats.name} Department`,
          topic: 'Budget Planning and AAP Alignment',
          reason: `High denial rate (${denialRate.toFixed(1)}%) suggests poor budget planning`,
          priority: 'critical',
          affected_count: stats.denied
        });
      }
    }

    // Analyze common errors across all departments
    const errorPatterns = analyzeErrorPatterns(requests);
    commonErrors.push(...errorPatterns);

  } catch (error) {
    console.error('Error analyzing query/denial patterns:', error);
  }

  return { patterns, trainingNeeds, commonErrors };
}

/**
 * Analyze processing time patterns
 */
export async function analyzeProcessingTimePatterns(): Promise<FeedbackPattern[]> {
  const patterns: FeedbackPattern[] = [];

  try {
    const { data: requests, error } = await supabase
      .from('ge_requests')
      .select(`
        *,
        cost_centres (name),
        ge_approvals (
          action,
          actioned_at,
          role_name
        )
      `)
      .in('status', ['Approved', 'Paid'])
      .order('submitted_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    requests?.forEach((req: any) => {
      if (!req.submitted_at) return;

      const submitDate = new Date(req.submitted_at);
      const approvalDate = req.ge_approvals
        ?.filter((a: any) => a.action === 'Approved')
        .sort((a: any, b: any) => new Date(b.actioned_at).getTime() - new Date(a.actioned_at).getTime())[0]
        ?.actioned_at;

      if (approvalDate) {
        const processingDays = Math.floor(
          (new Date(approvalDate).getTime() - submitDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Slow processing (> 10 days)
        if (processingDays > 10) {
          patterns.push({
            type: 'slow_processing',
            severity: 'medium',
            department: req.cost_centres?.name || 'Unknown',
            department_id: req.cost_centre_id,
            message: `Request ${req.request_number} took ${processingDays} days to approve`,
            recommendation: 'Review approval workflow. Identify bottlenecks. Send reminders to pending approvers.',
            data: {
              request_number: req.request_number,
              processing_days: processingDays,
              approval_path: req.ge_approvals?.map((a: any) => ({
                role: a.role_name,
                date: a.actioned_at
              }))
            },
            created_at: new Date().toISOString()
          });
        }
      }
    });
  } catch (error) {
    console.error('Error analyzing processing times:', error);
  }

  return patterns;
}

/**
 * Helper: Analyze common issues from comments
 */
function analyzeCommonIssues(comments: string[]): { issue: string; count: number }[] {
  const issues = new Map<string, number>();

  const keywords = [
    'missing quote',
    'vendor quote',
    'incomplete',
    'budget',
    'justification',
    'memo',
    'documentation',
    'vote code',
    'aap',
    'specification'
  ];

  comments.forEach(comment => {
    const lower = comment.toLowerCase();
    keywords.forEach(keyword => {
      if (lower.includes(keyword)) {
        issues.set(keyword, (issues.get(keyword) || 0) + 1);
      }
    });
  });

  return Array.from(issues.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Helper: Analyze error patterns across requests
 */
function analyzeErrorPatterns(requests: any[]): CommonError[] {
  const errors: CommonError[] = [];

  // Missing documentation
  const missingDocs = requests.filter(r =>
    r.ge_approvals?.some((a: any) =>
      a.comments?.toLowerCase().includes('missing') ||
      a.comments?.toLowerCase().includes('quote')
    )
  );

  if (missingDocs.length > 0) {
    errors.push({
      error_type: 'Missing Vendor Quotes',
      frequency: missingDocs.length,
      departments: [...new Set(missingDocs.map(r => r.cost_centres?.name || 'Unknown'))],
      examples: missingDocs.slice(0, 3).map(r => r.request_number),
      solution: 'Mandatory: Upload 3 vendor quotes before submission. System should enforce this validation.'
    });
  }

  // Budget issues
  const budgetIssues = requests.filter(r =>
    r.ge_approvals?.some((a: any) =>
      a.comments?.toLowerCase().includes('budget') ||
      a.comments?.toLowerCase().includes('funds')
    )
  );

  if (budgetIssues.length > 0) {
    errors.push({
      error_type: 'Budget/Funding Issues',
      frequency: budgetIssues.length,
      departments: [...new Set(budgetIssues.map(r => r.cost_centres?.name || 'Unknown'))],
      examples: budgetIssues.slice(0, 3).map(r => r.request_number),
      solution: 'Check budget availability before submission. Consult Budget Officer for budget line allocation.'
    });
  }

  // AAP alignment
  const aapIssues = requests.filter(r =>
    r.ge_approvals?.some((a: any) =>
      a.comments?.toLowerCase().includes('aap') ||
      a.comments?.toLowerCase().includes('activity plan')
    )
  );

  if (aapIssues.length > 0) {
    errors.push({
      error_type: 'Not in Annual Activity Plan',
      frequency: aapIssues.length,
      departments: [...new Set(aapIssues.map(r => r.cost_centres?.name || 'Unknown'))],
      examples: aapIssues.slice(0, 3).map(r => r.request_number),
      solution: 'Ensure all expenses align with approved Annual Activity Plan. Items not in AAP require separate approval.'
    });
  }

  return errors;
}

/**
 * Send automated feedback notifications
 */
export async function sendFeedbackNotifications(patterns: FeedbackPattern[]) {
  // Filter high-priority patterns
  const criticalPatterns = patterns.filter(p =>
    p.severity === 'critical' || p.severity === 'high'
  );

  if (criticalPatterns.length === 0) return;

  try {
    // In real implementation, send emails to department heads and M&E Planning
    console.log('Sending feedback notifications for:', criticalPatterns);

    // Log to database for tracking
    for (const pattern of criticalPatterns) {
      // @ts-ignore - Supabase type inference limitation
      await supabase.from('audit_logs').insert({
        table_name: 'feedback_patterns',
        record_id: pattern.department_id,
        action: 'FEEDBACK_GENERATED',
        user_id: null,
        changes: {
          type: pattern.type,
          severity: pattern.severity,
          message: pattern.message,
          recommendation: pattern.recommendation
        }
      });
    }
  } catch (error) {
    console.error('Error sending feedback notifications:', error);
  }
}

/**
 * Generate comprehensive feedback report
 */
export async function generateFeedbackReport() {
  const budgetPatterns = await analyzeBudgetPatterns();
  const { patterns: queryPatterns, trainingNeeds, commonErrors } = await analyzeQueryDenialPatterns();
  const processingPatterns = await analyzeProcessingTimePatterns();

  const allPatterns = [
    ...budgetPatterns,
    ...queryPatterns,
    ...processingPatterns
  ];

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  allPatterns.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    patterns: allPatterns,
    training_recommendations: trainingNeeds,
    common_errors: commonErrors,
    summary: {
      total_patterns: allPatterns.length,
      critical: allPatterns.filter(p => p.severity === 'critical').length,
      high: allPatterns.filter(p => p.severity === 'high').length,
      medium: allPatterns.filter(p => p.severity === 'medium').length,
      training_needs: trainingNeeds.length
    }
  };
}
