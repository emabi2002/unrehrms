"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Database,
  ArrowRight,
  Clock,
  Loader2,
  Link as LinkIcon,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { parsePGASFile, importPGASBudget, validatePGASData, downloadPGASTemplate } from "@/lib/pgas-import";

export default function PGASPage() {
  const [syncing, setSyncing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setImportResult(null); // Clear previous results
    }
  };

  const handleSync = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    try {
      setSyncing(true);
      toast.info("Parsing PGAS file...");

      // Parse the file
      const budgetLines = await parsePGASFile(file);

      if (budgetLines.length === 0) {
        toast.error("No valid budget lines found in file");
        setSyncing(false);
        return;
      }

      // Validate data
      const validation = validatePGASData(budgetLines);

      if (validation.errors.length > 0) {
        toast.error(`Validation failed: ${validation.errors[0]}`);
        setImportResult({ success: false, errors: validation.errors });
        setSyncing(false);
        return;
      }

      // Import to database
      toast.info("Importing budget lines to database...");
      const result = await importPGASBudget(budgetLines);

      setImportResult(result);

      if (result.success) {
        toast.success(
          `Successfully imported ${result.importedCount} budget lines! Now map them to AAP activities.`
        );
      } else {
        toast.error("Import completed with errors");
      }
    } catch (error) {
      console.error("Error during PGAS sync:", error);
      toast.error("Failed to sync PGAS data");
      setImportResult({ success: false, error: error instanceof Error ? error.message : "Unknown error" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">PGAS Integration</h1>
          <p className="text-gray-600 mt-1">
            Import PNG Government Accounting System (PGAS) budget appropriations
          </p>
        </div>
        <Link href="/dashboard/budget/allocation">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Budget Allocation
          </Button>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-emerald-200 bg-emerald-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <CardTitle className="text-emerald-900">Import PGAS</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-emerald-800">
              Upload CSV/Excel file with government budget appropriations
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              <CardTitle className="text-blue-900">Map to AAPs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800">
              Link budget lines to approved Annual Activity Plans
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              <CardTitle className="text-purple-900">Enable Spending</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-800">
              Activate budget version to allow GE requests against it
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Import PGAS Budget File</CardTitle>
          <CardDescription>
            Upload CSV or Excel file with government budget appropriations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="pgas-file">Select PGAS File (CSV or Excel)</Label>
            <div className="flex gap-3 mt-2">
              <Input
                id="pgas-file"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => downloadPGASTemplate()}
              >
                <Download className="w-4 h-4 mr-2" />
                Template
              </Button>
            </div>
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Import Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSync}
              disabled={!file || syncing}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Budget
                </>
              )}
            </Button>
          </div>

          {/* Import Results */}
          {importResult && (
            <div
              className={`p-4 rounded-lg ${
                importResult.success
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-start gap-3">
                {importResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4
                    className={`font-semibold ${
                      importResult.success ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {importResult.success ? "Import Successful!" : "Import Failed"}
                  </h4>
                  {importResult.success && (
                    <div className="mt-2 space-y-1 text-sm text-green-800">
                      <p>✓ {importResult.importedCount} budget lines imported</p>
                      <p>✓ {importResult.updatedCount || 0} existing lines updated</p>
                      <p>Total Amount: K{(importResult.totalAmount / 1000).toFixed(0)}k</p>
                    </div>
                  )}
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1 text-sm text-red-800">
                      {importResult.errors.slice(0, 5).map((error: string, idx: number) => (
                        <p key={idx}>• {error}</p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-red-600">
                          ... and {importResult.errors.length - 5} more errors
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      {importResult?.success && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">✅ Import Complete - Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-green-800">
              <p>
                <strong>Budget data has been imported successfully!</strong> Now you need to:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>Go to Budget Allocation page</li>
                <li>Create or select a budget version</li>
                <li>Map imported PGAS lines to approved AAP activities</li>
                <li>Activate the budget version</li>
                <li>GE requests will check against allocated budgets</li>
              </ol>
              <div className="mt-4">
                <Link href="/dashboard/budget/allocation">
                  <Button className="bg-green-600 hover:bg-green-700">
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Go to Budget Allocation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="border-2 border-dashed border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">PGAS Import Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-blue-800">
            <p>
              <strong>Your PGAS file should include:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Vote Code / Activity Code</li>
              <li>Account Code (optional)</li>
              <li>Budget Amount (approved appropriation)</li>
              <li>Description (activity name)</li>
              <li>Fund Source (Government Grant, Internal Revenue, etc.)</li>
            </ul>
            <p className="text-xs text-blue-700 mt-4">
              <strong>Tip:</strong> Download the template to see the exact format required.
              The system will validate your data before importing.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
