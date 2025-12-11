'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Archive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import type { EmployeeDocument, DocumentType } from '@/types/employee-document';
import {
  getEmployeeDocuments,
  getDocumentTypes,
  createEmployeeDocument,
  updateEmployeeDocument,
  deleteEmployeeDocument,
  uploadDocumentFile,
  getDocumentSignedUrl,
} from '@/lib/api/documents';

export default function EmployeeDocumentsPage() {
  const params = useParams();
  const employeeId = params?.id as string;

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    document_type: '',
    document_name: '',
    issue_date: '',
    expiry_date: '',
    document_number: '',
    issuing_authority: '',
    access_level: 'employee_visible' as const,
    is_confidential: false,
    notes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [docs, types] = await Promise.all([
        getEmployeeDocuments(employeeId),
        getDocumentTypes(),
      ]);
      setDocuments(docs);
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      // Auto-fill document name from filename if empty
      if (!formData.document_name) {
        setFormData({ ...formData, document_name: file.name });
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !formData.document_type) {
      toast.error('Please select a file and document type');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const { url, path } = await uploadDocumentFile(
        selectedFile,
        employeeId,
        formData.document_type
      );

      // Create document record
      await createEmployeeDocument({
        employee_id: employeeId,
        document_type: formData.document_type,
        document_name: formData.document_name || selectedFile.name,
        file_url: path,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        uploaded_by: employeeId, // TODO: Get from current user
        issue_date: formData.issue_date || undefined,
        expiry_date: formData.expiry_date || undefined,
        document_number: formData.document_number || undefined,
        issuing_authority: formData.issuing_authority || undefined,
        access_level: formData.access_level,
        is_confidential: formData.is_confidential,
        notes: formData.notes || undefined,
      });

      toast.success('Document uploaded successfully');
      setUploadDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: EmployeeDocument) => {
    try {
      const signedUrl = await getDocumentSignedUrl(doc.file_url);
      window.open(signedUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleArchive = async (doc: EmployeeDocument) => {
    try {
      await updateEmployeeDocument(doc.id, { status: 'archived' });
      toast.success('Document archived');
      loadData();
    } catch (error) {
      console.error('Error archiving document:', error);
      toast.error('Failed to archive document');
    }
  };

  const handleDelete = async (doc: EmployeeDocument) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEmployeeDocument(doc.id);
      toast.success('Document deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const resetForm = () => {
    setFormData({
      document_type: '',
      document_name: '',
      issue_date: '',
      expiry_date: '',
      document_number: '',
      issuing_authority: '',
      access_level: 'employee_visible',
      is_confidential: false,
      notes: '',
    });
    setSelectedFile(null);
  };

  const getStatusBadge = (doc: EmployeeDocument) => {
    if (doc.status === 'expired') {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (doc.status === 'archived') {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (doc.expiry_date) {
      const daysUntilExpiry = Math.ceil(
        (new Date(doc.expiry_date).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry < 0) {
        return <Badge variant="destructive">Expired</Badge>;
      }
      if (daysUntilExpiry <= 30) {
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-700">
            Expires in {daysUntilExpiry} days
          </Badge>
        );
      }
    }
    return <Badge variant="outline" className="border-green-600 text-green-700">Active</Badge>;
  };

  const getDocumentIcon = (mimeType?: string) => {
    if (mimeType?.includes('pdf')) {
      return <FileText className="h-10 w-10 text-red-600" />;
    }
    if (mimeType?.includes('image')) {
      return <FileText className="h-10 w-10 text-blue-600" />;
    }
    return <FileText className="h-10 w-10 text-gray-600" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Employee Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage all employee documents and certificates
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
            <p className="text-gray-600 mb-4">Get started by uploading your first document</p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getDocumentIcon(doc.mime_type)}
                    <div>
                      <CardTitle className="text-base">{doc.document_name}</CardTitle>
                      <CardDescription className="text-sm">{doc.document_type}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Status */}
                  <div>{getStatusBadge(doc)}</div>

                  {/* Metadata */}
                  <div className="text-sm space-y-1">
                    {doc.issue_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Date:</span>
                        <span className="font-medium">{formatDate(doc.issue_date)}</span>
                      </div>
                    )}
                    {doc.expiry_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span className="font-medium">{formatDate(doc.expiry_date)}</span>
                      </div>
                    )}
                    {doc.document_number && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Document #:</span>
                        <span className="font-medium">{doc.document_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{formatFileSize(doc.file_size)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchive(doc)}
                      disabled={doc.status === 'archived'}
                    >
                      <Archive className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(doc)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document for this employee. Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Select File *</Label>
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="document_type">Document Type *</Label>
              <Select
                value={formData.document_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, document_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.code}>
                      {type.name}
                      {type.is_mandatory && (
                        <span className="text-red-600 ml-2">*</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="document_name">Document Name</Label>
              <Input
                id="document_name"
                value={formData.document_name}
                onChange={(e) =>
                  setFormData({ ...formData, document_name: e.target.value })
                }
                placeholder="Auto-filled from filename"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) =>
                    setFormData({ ...formData, issue_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expiry_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="document_number">Document Number</Label>
                <Input
                  id="document_number"
                  value={formData.document_number}
                  onChange={(e) =>
                    setFormData({ ...formData, document_number: e.target.value })
                  }
                  placeholder="e.g., ID12345"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="issuing_authority">Issuing Authority</Label>
                <Input
                  id="issuing_authority"
                  value={formData.issuing_authority}
                  onChange={(e) =>
                    setFormData({ ...formData, issuing_authority: e.target.value })
                  }
                  placeholder="e.g., PNG Immigration"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="access_level">Access Level</Label>
              <Select
                value={formData.access_level}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, access_level: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee_visible">Employee Visible</SelectItem>
                  <SelectItem value="manager_and_hr">Manager & HR Only</SelectItem>
                  <SelectItem value="hr_only">HR Only</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
