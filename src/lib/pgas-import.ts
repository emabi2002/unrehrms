import * as XLSX from 'xlsx';
import { supabase } from './supabase';

export interface PGASBudgetLine {
  costCentreCode: string;
  costCentreName: string;
  budgetLineCode: string;
  budgetLineDescription: string;
  originalAmount: number;
  actualExpenditure: number;
  fiscalYear: number;
}

export interface PGASImportResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  errorCount: number;
  errors: string[];
  totalAmount: number;
}

/**
 * Parse CSV or Excel file containing PGAS budget data
 * Expected columns: Cost Centre Code, Cost Centre Name, Budget Line Code, Description, Original Amount, Actual Expenditure
 */
export async function parsePGASFile(file: File): Promise<PGASBudgetLine[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;

        // Parse based on file type
        if (file.name.endsWith('.csv')) {
          workbook = XLSX.read(data, { type: 'binary' });
        } else {
          workbook = XLSX.read(data, { type: 'array' });
        }

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        // Extract headers and data
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);

        // Map columns (case-insensitive)
        const getColumnIndex = (possibleNames: string[]) => {
          return headers.findIndex(h =>
            possibleNames.some(name =>
              h.toString().toLowerCase().includes(name.toLowerCase())
            )
          );
        };

        const costCentreCodeIdx = getColumnIndex(['cost centre code', 'cc code', 'centre code']);
        const costCentreNameIdx = getColumnIndex(['cost centre name', 'cc name', 'centre name']);
        const budgetLineCodeIdx = getColumnIndex(['budget line code', 'bl code', 'line code', 'account code']);
        const descriptionIdx = getColumnIndex(['description', 'budget line description', 'account description']);
        const originalAmountIdx = getColumnIndex(['original amount', 'budget amount', 'allocated', 'allocation']);
        const actualExpenditureIdx = getColumnIndex(['actual expenditure', 'actual', 'spent', 'expenditure']);

        // Validate required columns
        if (costCentreCodeIdx === -1 || budgetLineCodeIdx === -1 || originalAmountIdx === -1) {
          throw new Error('Missing required columns. Please ensure the file contains: Cost Centre Code, Budget Line Code, and Original Amount');
        }

        // Parse rows
        const budgetLines: PGASBudgetLine[] = [];
        const currentYear = new Date().getFullYear();

        for (const row of rows) {
          // Skip empty rows
          if (!row || row.length === 0 || !row[costCentreCodeIdx]) continue;

          const costCentreCode = row[costCentreCodeIdx]?.toString().trim();
          const budgetLineCode = row[budgetLineCodeIdx]?.toString().trim();
          const originalAmount = parseFloat(row[originalAmountIdx]?.toString().replace(/[^0-9.-]/g, '') || '0');

          if (!costCentreCode || !budgetLineCode || isNaN(originalAmount)) continue;

          budgetLines.push({
            costCentreCode,
            costCentreName: costCentreNameIdx !== -1 ? row[costCentreNameIdx]?.toString().trim() : '',
            budgetLineCode,
            budgetLineDescription: descriptionIdx !== -1 ? row[descriptionIdx]?.toString().trim() : '',
            originalAmount,
            actualExpenditure: actualExpenditureIdx !== -1
              ? parseFloat(row[actualExpenditureIdx]?.toString().replace(/[^0-9.-]/g, '') || '0')
              : 0,
            fiscalYear: currentYear,
          });
        }

        resolve(budgetLines);
      } catch (error: any) {
        reject(new Error(`Error parsing file: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    // Read file based on type
    if (file.name.endsWith('.csv')) {
      reader.readAsBinaryString(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}

/**
 * Import PGAS budget data into database
 */
export async function importPGASBudget(budgetLines: PGASBudgetLine[]): Promise<PGASImportResult> {
  const result: PGASImportResult = {
    success: false,
    importedCount: 0,
    updatedCount: 0,
    errorCount: 0,
    errors: [],
    totalAmount: 0,
  };

  for (const line of budgetLines) {
    try {
      // Find or create cost centre
      let { data: costCentre } = await supabase
        .from('cost_centres')
        .select('id')
        .eq('code', line.costCentreCode)
        .single() as { data: { id: number } | null };

      if (!costCentre) {
        // Create cost centre if it doesn't exist
        const { data: newCostCentre, error: ccError } = await supabase
          .from('cost_centres')
          .insert({
            code: line.costCentreCode,
            name: line.costCentreName || line.costCentreCode,
            type: 'Division',
            is_active: true,
          } as any)
          .select('id')
          .single();

        if (ccError) {
          result.errors.push(`Failed to create cost centre ${line.costCentreCode}: ${ccError.message}`);
          result.errorCount++;
          continue;
        }

        costCentre = newCostCentre;
      }

      if (!costCentre) {
        result.errors.push(`Failed to find or create cost centre ${line.costCentreCode}`);
        result.errorCount++;
        continue;
      }

      // Check if budget line exists
      const { data: existingBudgetLine } = await supabase
        .from('budget_lines')
        .select('id, original_amount')
        .eq('cost_centre_id', costCentre!.id)
        .eq('code', line.budgetLineCode)
        .eq('fiscal_year', line.fiscalYear)
        .single() as { data: { id: number; original_amount: number } | null };

      if (existingBudgetLine) {
        // Update existing budget line
        const { error: updateError } = await supabase
          .from('budget_lines')
          // @ts-expect-error - Supabase type mismatch
          .update({
            description: line.budgetLineDescription || line.budgetLineCode,
            original_amount: line.originalAmount,
            pgas_actual_expenditure: line.actualExpenditure,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingBudgetLine!.id);

        if (updateError) {
          result.errors.push(`Failed to update budget line ${line.budgetLineCode}: ${updateError.message}`);
          result.errorCount++;
        } else {
          result.updatedCount++;
          result.totalAmount += line.originalAmount;
        }
      } else {
        // Insert new budget line
        const { error: insertError } = await supabase
          .from('budget_lines')
          .insert({
            cost_centre_id: costCentre!.id,
            code: line.budgetLineCode,
            description: line.budgetLineDescription || line.budgetLineCode,
            original_amount: line.originalAmount,
            committed_amount: 0,
            actual_expenditure: 0,
            pgas_actual_expenditure: line.actualExpenditure,
            fiscal_year: line.fiscalYear,
            is_active: true,
          } as any);

        if (insertError) {
          result.errors.push(`Failed to insert budget line ${line.budgetLineCode}: ${insertError.message}`);
          result.errorCount++;
        } else {
          result.importedCount++;
          result.totalAmount += line.originalAmount;
        }
      }
    } catch (error: any) {
      result.errors.push(`Error processing ${line.budgetLineCode}: ${error.message}`);
      result.errorCount++;
    }
  }

  result.success = result.errorCount === 0 || (result.importedCount + result.updatedCount) > 0;
  return result;
}

/**
 * Validate PGAS file before import
 */
export function validatePGASData(budgetLines: PGASBudgetLine[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (budgetLines.length === 0) {
    errors.push('No valid budget lines found in file');
  }

  // Check for duplicates
  const seen = new Set<string>();
  for (const line of budgetLines) {
    const key = `${line.costCentreCode}-${line.budgetLineCode}`;
    if (seen.has(key)) {
      warnings.push(`Duplicate budget line found: ${line.budgetLineCode} in ${line.costCentreCode}`);
    }
    seen.add(key);
  }

  // Check for negative amounts
  const negativeAmounts = budgetLines.filter(l => l.originalAmount < 0);
  if (negativeAmounts.length > 0) {
    warnings.push(`${negativeAmounts.length} budget lines have negative amounts`);
  }

  // Check for very large amounts (potential data errors)
  const largeAmounts = budgetLines.filter(l => l.originalAmount > 10000000);
  if (largeAmounts.length > 0) {
    warnings.push(`${largeAmounts.length} budget lines have unusually large amounts (>10M)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate PGAS import template
 */
export function downloadPGASTemplate() {
  const template = [
    ['Cost Centre Code', 'Cost Centre Name', 'Budget Line Code', 'Description', 'Original Amount', 'Actual Expenditure'],
    ['AGR', 'School of Agriculture', 'OP-TRAV', 'Operating - Travel', '150000', '45000'],
    ['AGR', 'School of Agriculture', 'OP-FUEL', 'Operating - Fuel', '80000', '32000'],
    ['SCI', 'Faculty of Science', 'OP-STAT', 'Operating - Stationery', '45000', '12000'],
    ['ADM', 'Administration', 'CAP-IT', 'Capital - IT Equipment', '500000', '0'],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(template);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PGAS Budget Import');

  // Auto-size columns
  const maxWidth = template[0].map((_, colIndex) =>
    Math.max(...template.map(row => (row[colIndex]?.toString().length || 0)))
  );
  worksheet['!cols'] = maxWidth.map(w => ({ wch: Math.min(w + 2, 50) }));

  XLSX.writeFile(workbook, 'PGAS_Budget_Import_Template.xlsx');
}
