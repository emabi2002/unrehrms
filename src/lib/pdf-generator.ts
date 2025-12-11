import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PaymentVoucherData {
  voucher_number: string;
  payee_name: string;
  amount: number;
  payment_method: string;
  payment_date: string | null;
  description: string | null;
  bank_name: string | null;
  account_number: string | null;
  cheque_number: string | null;
  bank_reference: string | null;
  status: string;
  ge_request_number?: string;
  commitment_number?: string;
  cost_centre?: string;
  approved_by?: string;
  processed_by?: string;
  paid_at?: string | null;
  created_at: string;
}

export function generatePaymentVoucherPDF(payment: PaymentVoucherData) {
  const doc = new jsPDF();

  // UNRE Header
  doc.setFillColor(15, 112, 55); // Official UNRE Forest Green #0f7037
  doc.rect(0, 0, 220, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF NATURAL RESOURCES & ENVIRONMENT', 105, 10, { align: 'center' });

  doc.setFontSize(14);
  doc.text('PAYMENT VOUCHER', 105, 18, { align: 'center' });

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Voucher Details Header
  let yPos = 35;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VOUCHER DETAILS', 14, yPos);

  // Status Badge
  const statusColors: Record<string, [number, number, number]> = {
    'Paid': [34, 197, 94],
    'Approved': [59, 130, 246],
    'Pending': [234, 179, 8],
    'Cancelled': [239, 68, 68],
  };

  const statusColor = statusColors[payment.status] || [148, 163, 184];
  doc.setFillColor(...statusColor);
  doc.roundedRect(160, yPos - 5, 35, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(payment.status.toUpperCase(), 177.5, yPos, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  yPos += 10;

  // Voucher Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Voucher Number:', payment.voucher_number],
    ['GE Request:', payment.ge_request_number || 'N/A'],
    ['Commitment:', payment.commitment_number || 'N/A'],
    ['Cost Centre:', payment.cost_centre || 'N/A'],
    ['Created Date:', new Date(payment.created_at).toLocaleDateString()],
  ];

  details.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Payee Information Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYEE INFORMATION', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const payeeDetails = [
    ['Payee Name:', payment.payee_name],
    ['Amount:', `PGK ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ['Payment Date:', payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'Not set'],
  ];

  payeeDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Payment Method Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('PAYMENT METHOD', 14, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const paymentDetails = [
    ['Method:', payment.payment_method],
  ];

  if (payment.payment_method === 'EFT') {
    paymentDetails.push(
      ['Bank Name:', payment.bank_name || 'N/A'],
      ['Account Number:', payment.account_number || 'N/A'],
    );
    if (payment.bank_reference) {
      paymentDetails.push(['Bank Reference:', payment.bank_reference]);
    }
  } else if (payment.payment_method === 'Cheque' && payment.cheque_number) {
    paymentDetails.push(['Cheque Number:', payment.cheque_number]);
  }

  paymentDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 14, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, yPos);
    yPos += 6;
  });

  yPos += 5;

  // Description
  if (payment.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('DESCRIPTION', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descLines = doc.splitTextToSize(payment.description, 180);
    doc.text(descLines, 14, yPos);
    yPos += descLines.length * 5 + 10;
  }

  // Approval Section
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('APPROVAL & PROCESSING', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    head: [['Action', 'By', 'Date']],
    body: [
      [
        'Approved',
        payment.approved_by || '-',
        payment.status === 'Approved' || payment.status === 'Paid'
          ? new Date().toLocaleDateString()
          : '-',
      ],
      [
        'Processed',
        payment.processed_by || '-',
        payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [15, 112, 55] }, // Official UNRE Green
    styles: { fontSize: 10 },
  });

  // Signatures Section
  yPos = (doc as any).lastAutoTable.finalY + 20;

  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('SIGNATURES', 14, yPos);
  yPos += 15;

  // Signature boxes
  const signatureBoxes = [
    { label: 'Prepared By', x: 14 },
    { label: 'Approved By', x: 80 },
    { label: 'Received By', x: 146 },
  ];

  signatureBoxes.forEach(({ label, x }) => {
    doc.setDrawColor(200, 200, 200);
    doc.rect(x, yPos, 60, 25);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x + 30, yPos + 30, { align: 'center' });

    doc.setFontSize(8);
    doc.text('_________________', x + 30, yPos + 37, { align: 'center' });
    doc.text('Signature & Date', x + 30, yPos + 42, { align: 'center' });
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | UNRE GE Request System v1.0`,
    105,
    285,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Payment_Voucher_${payment.voucher_number}.pdf`);
}

export function generatePaymentReceiptPDF(payment: PaymentVoucherData) {
  const doc = new jsPDF();

  // UNRE Header
  doc.setFillColor(15, 112, 55); // Official UNRE Forest Green
  doc.rect(0, 0, 220, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF NATURAL RESOURCES & ENVIRONMENT', 105, 10, { align: 'center' });

  doc.setFontSize(14);
  doc.text('PAYMENT RECEIPT', 105, 18, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Receipt Number
  let yPos = 40;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`Receipt No: ${payment.voucher_number}`, 105, yPos, { align: 'center' });

  yPos += 15;

  // Amount Box
  doc.setFillColor(240, 253, 244); // Light green background
  doc.roundedRect(40, yPos, 130, 30, 3, 3, 'F');
  doc.setDrawColor(15, 112, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(40, yPos, 130, 30, 3, 3, 'S');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Received:', 105, yPos + 10, { align: 'center' });

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 112, 55);
  doc.text(
    `PGK ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    105,
    yPos + 22,
    { align: 'center' }
  );

  doc.setTextColor(0, 0, 0);
  yPos += 45;

  // Receipt Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('RECEIPT DETAILS', 14, yPos);
  yPos += 10;

  autoTable(doc, {
    startY: yPos,
    body: [
      ['Received From:', payment.payee_name],
      ['Payment Date:', payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : 'N/A'],
      ['Payment Method:', payment.payment_method],
      ['Reference:', payment.bank_reference || payment.cheque_number || 'N/A'],
      ['GE Request:', payment.ge_request_number || 'N/A'],
      ['Commitment:', payment.commitment_number || 'N/A'],
    ],
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 130 },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // Description
  if (payment.description) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PAYMENT FOR', 14, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(payment.description, 180);
    doc.text(descLines, 14, yPos);
    yPos += descLines.length * 5 + 15;
  }

  // Authorized Signature
  yPos += 20;
  if (yPos > 240) {
    doc.addPage();
    yPos = 30;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(130, yPos, 195, yPos);
  yPos += 5;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', 162.5, yPos, { align: 'center' });
  yPos += 3;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(payment.processed_by || 'Finance Officer', 162.5, yPos, { align: 'center' });

  // Footer
  yPos += 30;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated receipt and does not require a signature.', 105, yPos, {
    align: 'center',
  });

  doc.setFontSize(8);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | UNRE GE Request System v1.0`,
    105,
    285,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Payment_Receipt_${payment.voucher_number}.pdf`);
}

export function generateMultiplePaymentsPDF(payments: PaymentVoucherData[]) {
  const doc = new jsPDF();

  // UNRE Header
  doc.setFillColor(15, 112, 55); // Official UNRE Forest Green
  doc.rect(0, 0, 220, 25, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY OF NATURAL RESOURCES & ENVIRONMENT', 105, 10, { align: 'center' });

  doc.setFontSize(14);
  doc.text('PAYMENT REGISTER', 105, 18, { align: 'center' });

  doc.setTextColor(0, 0, 0);

  // Date Range
  let yPos = 35;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 14, yPos);
  doc.text(`Total Payments: ${payments.length}`, 160, yPos);

  yPos += 10;

  // Summary
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(
    `Total Amount: PGK ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    14,
    yPos
  );

  yPos += 10;

  // Table
  autoTable(doc, {
    startY: yPos,
    head: [['Voucher #', 'Payee', 'Amount', 'Method', 'Date', 'Status']],
    body: payments.map((p) => [
      p.voucher_number,
      p.payee_name.length > 25 ? p.payee_name.substring(0, 25) + '...' : p.payee_name,
      `K ${p.amount.toLocaleString()}`,
      p.payment_method,
      p.payment_date ? new Date(p.payment_date).toLocaleDateString() : 'N/A',
      p.status,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [15, 112, 55] }, // Official UNRE Green
    styles: { fontSize: 9 },
    columnStyles: {
      2: { halign: 'right' },
    },
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generated on ${new Date().toLocaleString()} | UNRE GE Request System v1.0`,
    105,
    285,
    { align: 'center' }
  );

  // Save the PDF
  doc.save(`Payment_Register_${new Date().toISOString().split('T')[0]}.pdf`);
}
