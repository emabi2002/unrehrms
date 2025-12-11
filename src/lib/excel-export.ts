import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Export GE Requests to Excel
export function exportGERequestsToExcel(requests: any[]) {
  const data = requests.map(req => ({
    'Request Number': req.request_number || req.requestNumber,
    'Title': req.title,
    'Requester': req.requester?.full_name || req.requesterName || '',
    'Cost Centre': req.cost_centres?.name || req.costCentre || '',
    'Budget Line': req.budget_lines?.description || req.budgetLine || '',
    'Amount': `K ${(req.total_amount || req.amount || 0).toLocaleString()}`,
    'Status': req.status,
    'Submitted Date': req.submitted_at ? new Date(req.submitted_at).toLocaleDateString() : '',
    'Created Date': new Date(req.created_at).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'GE Requests');

  // Auto-size columns
  const maxWidth = data.reduce((w, r) => Math.max(w, Object.keys(r).length), 10);
  ws['!cols'] = Array(maxWidth).fill({ wch: 20 });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `GE_Requests_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export Commitments to Excel
export function exportCommitmentsToExcel(commitments: any[]) {
  const data = commitments.map(com => ({
    'Commitment Number': com.commitment_number || com.commitmentNumber,
    'GE Request': com.ge_requests?.request_number || com.geRequestNumber || '',
    'Title': com.ge_requests?.title || com.title || '',
    'Cost Centre': com.cost_centres?.name || com.costCentre || '',
    'Budget Line': com.budget_lines?.description || com.budgetLine || '',
    'Total Amount': `K ${(com.amount || 0).toLocaleString()}`,
    'Paid Amount': `K ${((com.amount || 0) - (com.remaining_amount || 0)).toLocaleString()}`,
    'Remaining': `K ${(com.remaining_amount || 0).toLocaleString()}`,
    'Status': com.status,
    'Financial Year': com.financial_year,
    'Created Date': new Date(com.created_at).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Commitments');
  ws['!cols'] = Array(10).fill({ wch: 18 });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Commitments_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export Payments to Excel
export function exportPaymentsToExcel(payments: any[]) {
  const data = payments.map(pay => ({
    'Voucher Number': pay.voucher_number || pay.voucherNumber,
    'GE Request': pay.ge_requests?.request_number || pay.geRequestNumber || '',
    'Commitment': pay.commitments?.commitment_number || pay.commitmentNumber || '',
    'Payee': pay.payee_name || pay.payeeName,
    'Amount': `K ${(pay.amount || 0).toLocaleString()}`,
    'Payment Method': pay.payment_method || pay.paymentMethod,
    'Bank Reference': pay.bank_reference || pay.bankReference || '-',
    'Payment Date': pay.payment_date ? new Date(pay.payment_date).toLocaleDateString() : '',
    'Status': pay.status,
    'Approved By': pay.approver?.full_name || pay.approvedBy || '',
    'Processed By': pay.processor?.full_name || pay.processedBy || '',
    'Created Date': new Date(pay.created_at).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Payment Vouchers');
  ws['!cols'] = Array(12).fill({ wch: 16 });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Payment_Vouchers_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export Budget Overview to Excel
export function exportBudgetToExcel(budgetLines: any[]) {
  const data = budgetLines.map(line => ({
    'Cost Centre': line.cost_centres?.name || line.costCentre || '',
    'Vote Code': line.pgas_vote_code || line.voteCode,
    'Budget Line': line.description,
    'Category': line.category || '',
    'Original Budget': `K ${(line.original_amount || 0).toLocaleString()}`,
    'YTD Expenditure': `K ${(line.ytd_expenditure || 0).toLocaleString()}`,
    'Committed': `K ${(line.committed_amount || 0).toLocaleString()}`,
    'Available': `K ${(line.available_amount || 0).toLocaleString()}`,
    'Utilization %': line.original_amount > 0
      ? `${((((line.ytd_expenditure || 0) + (line.committed_amount || 0)) / line.original_amount) * 100).toFixed(1)}%`
      : '0%',
    'Budget Year': line.budget_year,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Budget Overview');
  ws['!cols'] = Array(10).fill({ wch: 18 });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Budget_Overview_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export Cost Centres to Excel
export function exportCostCentresToExcel(costCentres: any[]) {
  const data = costCentres.map(cc => ({
    'Code': cc.code,
    'Name': cc.name,
    'Type': cc.type,
    'Parent': cc.parent?.name || '-',
    'Head': cc.head?.full_name || '-',
    'Active': cc.is_active ? 'Yes' : 'No',
    'Created Date': new Date(cc.created_at).toLocaleDateString(),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cost Centres');
  ws['!cols'] = Array(7).fill({ wch: 20 });

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `Cost_Centres_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Export comprehensive report with multiple sheets
export function exportComprehensiveReport(data: {
  requests?: any[];
  commitments?: any[];
  payments?: any[];
  budget?: any[];
}) {
  const wb = XLSX.utils.book_new();

  // Add GE Requests sheet
  if (data.requests && data.requests.length > 0) {
    const requestsData = data.requests.map(req => ({
      'Request Number': req.request_number,
      'Title': req.title,
      'Amount': req.total_amount,
      'Status': req.status,
      'Created': new Date(req.created_at).toLocaleDateString(),
    }));
    const ws1 = XLSX.utils.json_to_sheet(requestsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'GE Requests');
  }

  // Add Commitments sheet
  if (data.commitments && data.commitments.length > 0) {
    const commitmentsData = data.commitments.map(com => ({
      'Commitment Number': com.commitment_number,
      'Amount': com.amount,
      'Remaining': com.remaining_amount,
      'Status': com.status,
    }));
    const ws2 = XLSX.utils.json_to_sheet(commitmentsData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Commitments');
  }

  // Add Payments sheet
  if (data.payments && data.payments.length > 0) {
    const paymentsData = data.payments.map(pay => ({
      'Voucher Number': pay.voucher_number,
      'Payee': pay.payee_name,
      'Amount': pay.amount,
      'Status': pay.status,
    }));
    const ws3 = XLSX.utils.json_to_sheet(paymentsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Payments');
  }

  // Add Budget sheet
  if (data.budget && data.budget.length > 0) {
    const budgetData = data.budget.map(line => ({
      'Budget Line': line.description,
      'Original': line.original_amount,
      'Committed': line.committed_amount,
      'Available': line.available_amount,
    }));
    const ws4 = XLSX.utils.json_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Budget');
  }

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `UNRE_Comprehensive_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
}
