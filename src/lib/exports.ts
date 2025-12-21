import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';

/**
 * Export data to Excel file
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  try {
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Download file
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
}

/**
 * Export data to PDF file with company branding
 */
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  columns: { header: string; dataKey: keyof T }[],
  title: string,
  filename: string,
  options?: {
    orientation?: 'portrait' | 'landscape';
    pageSize?: 'a4' | 'letter';
    companyName?: string;
    subtitle?: string;
  }
) {
  try {
    const {
      orientation = 'portrait',
      pageSize = 'a4',
      companyName = 'PNG UNRE - HRMS & Payroll System',
      subtitle = '',
    } = options || {};

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: pageSize,
    });

    // Add company header
    doc.setFontSize(18);
    doc.setTextColor(0, 135, 81); // Green color
    doc.text(companyName, 14, 15);

    // Add report title
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 25);

    // Add subtitle if provided
    if (subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(subtitle, 14, 32);
    }

    // Add generation date
    doc.setFontSize(9);
    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`,
      14,
      subtitle ? 38 : 32
    );

    // Prepare table data
    const tableData = data.map((row) =>
      columns.map((col) => {
        const value = row[col.dataKey];
        if (value === null || value === undefined) return '-';
        if (value instanceof Date) return value.toLocaleDateString();
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value);
      })
    );

    // Add table
    autoTable(doc, {
      head: [columns.map((col) => col.header)],
      body: tableData,
      startY: subtitle ? 45 : 38,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 135, 81], // Green color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 45 },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      didDrawPage: (data) => {
        // Add page number footer
        const pageCount = doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      },
    });

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
}

/**
 * Export multiple sheets to Excel
 */
export function exportMultipleToExcel(
  sheets: { data: any[]; name: string }[],
  filename: string
) {
  try {
    const wb = XLSX.utils.book_new();

    sheets.forEach((sheet) => {
      const ws = XLSX.utils.json_to_sheet(sheet.data);
      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Error exporting multiple sheets:', error);
    return false;
  }
}

/**
 * Format data for export by cleaning and transforming
 */
export function prepareDataForExport<T extends Record<string, any>>(
  data: T[],
  fieldMapping?: Record<keyof T, string>
): any[] {
  return data.map((item) => {
    const cleanedItem: any = {};

    Object.keys(item).forEach((key) => {
      // Skip internal fields
      if (key === 'id' || key.startsWith('_')) return;

      const displayKey = fieldMapping?.[key as keyof T] || key;
      let value = item[key];

      // Handle nested objects
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Extract nested data (e.g., employee.first_name)
        if (value.first_name && value.last_name) {
          value = `${value.first_name} ${value.last_name}`;
        } else if (value.name) {
          value = value.name;
        } else {
          value = JSON.stringify(value);
        }
      }

      // Handle arrays
      if (Array.isArray(value)) {
        value = value.join(', ');
      }

      // Handle dates
      if (value instanceof Date) {
        value = value.toLocaleDateString();
      }

      // Handle booleans
      if (typeof value === 'boolean') {
        value = value ? 'Yes' : 'No';
      }

      cleanedItem[displayKey] = value ?? '-';
    });

    return cleanedItem;
  });
}
