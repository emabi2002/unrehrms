"use client";

import { useState, useRef } from "react";
import { Button } from "./button";
import { Upload, X, FileText, Image as ImageIcon, Table, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateFile, formatFileSize } from "@/lib/storage";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onFileRemoved: (index: number) => void;
  files: File[];
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  onFileRemoved,
  files,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024,
  accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx",
  disabled = false,
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of newFiles) {
      try {
        validateFile(file, maxSize);
        validFiles.push(file);
      } catch (error: any) {
        toast.error(`${file.name}: ${error.message}`);
      }
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-5 w-5 text-blue-600" />;
    } else if (file.type.includes('pdf')) {
      return <FileText className="h-5 w-5 text-red-600" />;
    } else if (file.type.includes('sheet') || file.type.includes('excel')) {
      return <Table className="h-5 w-5 text-green-600" />;
    } else {
      return <File className="h-5 w-5 text-slate-600" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors",
          dragActive ? "border-unre-green-600 bg-unre-green-50" : "border-slate-300",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-slate-400" />
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
            <p className="mt-2 text-sm text-slate-600">
              or drag and drop files here
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {accept.replace(/\./g, '').toUpperCase().replace(/,/g, ', ')} up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Selected Files ({files.length}/{maxFiles}):
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {getFileIcon(file)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onFileRemoved(index)}
                disabled={disabled}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
