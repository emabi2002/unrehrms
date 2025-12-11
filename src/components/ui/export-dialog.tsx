"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  title?: string;
  description?: string;
  showPDF?: boolean;
}

export function ExportDialog({
  open,
  onOpenChange,
  onExportExcel,
  onExportPDF,
  title = "Export Data",
  description = "Choose your preferred export format",
  showPDF = true,
}: ExportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            onClick={() => {
              onExportExcel();
              onOpenChange(false);
            }}
            className="h-auto p-4 justify-start"
            variant="outline"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Export to Excel</p>
                <p className="text-xs text-slate-500">
                  Download as .xlsx file for editing and analysis
                </p>
              </div>
            </div>
          </Button>

          {showPDF && (
            <Button
              onClick={() => {
                onExportPDF();
                onOpenChange(false);
              }}
              className="h-auto p-4 justify-start"
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold">Export to PDF</p>
                  <p className="text-xs text-slate-500">
                    Download as PDF for printing and sharing
                  </p>
                </div>
              </div>
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
