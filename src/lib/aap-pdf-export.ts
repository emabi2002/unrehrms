/**
 * AAP PDF Export Utility
 * Generate professional PDF documents for Annual Activity Plans
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AAPHeader, AAPLine, AAPLineSchedule } from './aap-types';
import { MONTHS } from './aap-types';

// UNRE Brand Colors
const UNRE_GREEN = '#16a34a';
const DARK_GRAY = '#1f2937';
const LIGHT_GRAY = '#f3f4f6';

/**
 * Export AAP to PDF
 */
export async function exportAAPToPDF(
  aap: AAPHeader,
  lines: AAPLine[],
  schedules: { [lineId: number]: AAPLineSchedule[] }
) {
  // Create new PDF document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // ============================================
  // HEADER - UNRE Logo and Title
  // ============================================

  // UNRE Title
  doc.setFontSize(20);
  doc.setTextColor(UNRE_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('UNRE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 7;
  doc.setFontSize(12);
  doc.setTextColor(DARK_GRAY);
  doc.setFont('helvetica', 'normal');
  doc.text('University of Natural Resources & Environment', pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  doc.setFontSize(10);
  doc.text('Papua New Guinea', pageWidth / 2, yPos, { align: 'center' });

  yPos += 10;

  // Document Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_GRAY);
  doc.text('ANNUAL ACTIVITY PLAN', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fiscal Year ${aap.fiscal_year?.year_id || ''}`, pageWidth / 2, yPos, { align: 'center' });

  yPos += 12;

  // Status Badge
  const statusColor = getStatusColor(aap.status);
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(pageWidth / 2 - 15, yPos - 5, 30, 8, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(aap.status, pageWidth / 2, yPos, { align: 'center' });

  yPos += 15;

  // ============================================
  // SECTION 1: AAP HEADER INFORMATION
  // ============================================

  doc.setFontSize(12);
  doc.setTextColor(UNRE_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('AAP Information', 15, yPos);

  yPos += 8;

  // Header details table
  autoTable(doc, {
    startY: yPos,
    head: [],
    body: [
      ['Division', aap.division?.name || ''],
      ['Department', aap.department?.name || 'N/A'],
      ['Program', aap.program?.program_name || ''],
      ['Activity/Project', `${aap.activity_project?.code || ''} - ${aap.activity_project?.name || ''}`],
      ['Head of Activity', aap.head_of_activity || 'N/A'],
      ['Manager', aap.manager || 'N/A'],
      ['Telephone', aap.telephone || 'N/A'],
      ['Fax', aap.fax || 'N/A'],
    ],
    theme: 'plain',
    styles: {
      fontSize: 9,
      cellPadding: 2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50 },
      1: { cellWidth: 'auto' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // ============================================
  // SECTION 2: ACTIVITY LINE ITEMS
  // ============================================

  doc.setFontSize(12);
  doc.setTextColor(UNRE_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('Activity Line Items', 15, yPos);

  yPos += 8;

  // Line items table
  const lineItemsData = lines.map(line => [
    line.item_no,
    line.activity_description,
    line.specific_output || '',
    line.target_output || '',
    line.economic_item_code || '',
    `K${line.proposed_cost.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item No', 'Activity Description', 'Specific Output', 'Target', 'Econ. Code', 'Cost (PGK)']],
    body: lineItemsData,
    theme: 'grid',
    headStyles: {
      fillColor: UNRE_GREEN,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 8;

  // Total
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(DARK_GRAY);
  doc.text('Total Proposed Cost:', pageWidth - 70, yPos);
  doc.setTextColor(UNRE_GREEN);
  doc.setFontSize(12);
  doc.text(
    `K${aap.total_proposed_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
    pageWidth - 15,
    yPos,
    { align: 'right' }
  );

  yPos += 12;

  // ============================================
  // SECTION 3: MONTHLY IMPLEMENTATION SCHEDULE
  // ============================================

  // Check if we need a new page
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(UNRE_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('Monthly Implementation Schedule', 15, yPos);

  yPos += 8;

  // Create schedule table for each line
  for (const line of lines) {
    const lineSchedules = schedules[line.aap_line_id] || [];
    const monthSchedule = MONTHS.map(month => {
      const schedule = lineSchedules.find(s => s.month === month.value);
      return schedule?.is_scheduled ? '✓' : '';
    });

    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Line item header
    doc.setFontSize(9);
    doc.setTextColor(DARK_GRAY);
    doc.setFont('helvetica', 'bold');
    doc.text(`${line.item_no} - ${line.activity_description}`, 15, yPos);
    yPos += 6;

    // Schedule grid
    autoTable(doc, {
      startY: yPos,
      head: [MONTHS.map(m => m.short)],
      body: [monthSchedule],
      theme: 'grid',
      headStyles: {
        fillColor: UNRE_GREEN,
        textColor: 255,
        fontSize: 7,
        cellPadding: 1,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center',
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 14.5 },
        1: { cellWidth: 14.5 },
        2: { cellWidth: 14.5 },
        3: { cellWidth: 14.5 },
        4: { cellWidth: 14.5 },
        5: { cellWidth: 14.5 },
        6: { cellWidth: 14.5 },
        7: { cellWidth: 14.5 },
        8: { cellWidth: 14.5 },
        9: { cellWidth: 14.5 },
        10: { cellWidth: 14.5 },
        11: { cellWidth: 14.5 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  // ============================================
  // SECTION 4: APPROVAL TIMELINE (if applicable)
  // ============================================

  if (aap.submitted_date || aap.approved_date) {
    // Check if we need a new page
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(UNRE_GREEN);
    doc.setFont('helvetica', 'bold');
    doc.text('Status History', 15, yPos);

    yPos += 8;

    const timeline = [];

    timeline.push([
      'Created',
      new Date(aap.created_at).toLocaleDateString(),
      new Date(aap.created_at).toLocaleTimeString(),
    ]);

    if (aap.submitted_date) {
      timeline.push([
        'Submitted',
        new Date(aap.submitted_date).toLocaleDateString(),
        new Date(aap.submitted_date).toLocaleTimeString(),
      ]);
    }

    if (aap.approved_date) {
      timeline.push([
        'Approved',
        new Date(aap.approved_date).toLocaleDateString(),
        new Date(aap.approved_date).toLocaleTimeString(),
      ]);
    }

    autoTable(doc, {
      startY: yPos,
      head: [['Event', 'Date', 'Time']],
      body: timeline,
      theme: 'striped',
      headStyles: {
        fillColor: UNRE_GREEN,
        textColor: 255,
        fontSize: 9,
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold' },
        1: { cellWidth: 50 },
        2: { cellWidth: 50 },
      },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // ============================================
  // FOOTER
  // ============================================

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer line
    doc.setDrawColor(UNRE_GREEN);
    doc.setLineWidth(0.5);
    doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(DARK_GRAY);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'University of Natural Resources & Environment of PNG',
      15,
      pageHeight - 15
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString()} | Page ${i} of ${totalPages}`,
      pageWidth - 15,
      pageHeight - 15,
      { align: 'right' }
    );
  }

  // ============================================
  // SAVE PDF
  // ============================================

  const fileName = `AAP_${aap.fiscal_year?.year_id || ''}_${aap.activity_project?.code || 'Draft'}_${new Date().getTime()}.pdf`;
  doc.save(fileName);

  return fileName;
}

/**
 * Get status color for badge
 */
function getStatusColor(status: string): number[] {
  switch (status) {
    case 'Approved':
      return [34, 197, 94]; // Green
    case 'Submitted':
      return [59, 130, 246]; // Blue
    case 'Draft':
      return [156, 163, 175]; // Gray
    case 'Rejected':
      return [239, 68, 68]; // Red
    default:
      return [156, 163, 175]; // Gray
  }
}

/**
 * Export multiple AAPs to a single PDF (for bulk export)
 */
export async function exportMultipleAAPsToPDF(
  aaps: Array<{
    aap: AAPHeader;
    lines: AAPLine[];
    schedules: { [lineId: number]: AAPLineSchedule[] };
  }>
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Summary page
  doc.setFontSize(20);
  doc.setTextColor(UNRE_GREEN);
  doc.setFont('helvetica', 'bold');
  doc.text('UNRE', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(16);
  doc.setTextColor(DARK_GRAY);
  doc.text('Annual Activity Plans Summary', pageWidth / 2, 35, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total AAPs: ${aaps.length}`, pageWidth / 2, 45, { align: 'center' });

  const totalBudget = aaps.reduce((sum, item) => sum + (item.aap.total_proposed_cost || 0), 0);
  doc.text(
    `Total Proposed Budget: K${totalBudget.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    pageWidth / 2,
    52,
    { align: 'center' }
  );

  // Summary table
  const summaryData = aaps.map(item => [
    item.aap.division?.code || '',
    item.aap.activity_project?.code || '',
    item.aap.activity_project?.name || '',
    item.aap.status,
    `K${item.aap.total_proposed_cost?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`,
  ]);

  autoTable(doc, {
    startY: 60,
    head: [['Division', 'Activity Code', 'Activity Name', 'Status', 'Budget']],
    body: summaryData,
    theme: 'grid',
    headStyles: {
      fillColor: UNRE_GREEN,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 60 },
      3: { cellWidth: 25 },
      4: { cellWidth: 35, halign: 'right' },
    },
  });

  // Add each AAP on new pages
  for (let i = 0; i < aaps.length; i++) {
    doc.addPage();

    // For bulk export, we'd need to implement the full AAP details
    // This is simplified - you can expand it similar to the single export
    const { aap, lines } = aaps[i];

    doc.setFontSize(14);
    doc.setTextColor(UNRE_GREEN);
    doc.setFont('helvetica', 'bold');
    doc.text(`AAP ${i + 1} of ${aaps.length}`, pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(DARK_GRAY);
    doc.text(aap.activity_project?.name || '', pageWidth / 2, 28, { align: 'center' });

    // Add line items
    const lineItemsData = lines.map(line => [
      line.item_no,
      line.activity_description,
      `K${line.proposed_cost.toLocaleString()}`,
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Item No', 'Description', 'Cost']],
      body: lineItemsData,
      theme: 'grid',
      headStyles: {
        fillColor: UNRE_GREEN,
      },
    });
  }

  // Save
  const fileName = `AAP_Bulk_Export_${new Date().getTime()}.pdf`;
  doc.save(fileName);

  return fileName;
}
