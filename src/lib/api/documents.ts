import { createClient } from '@/lib/supabase';
import type {
  EmployeeDocument,
  CreateEmployeeDocumentInput,
  UpdateEmployeeDocumentInput,
  DocumentType,
  ExpiringDocument,
} from '@/types/employee-document';

const supabase = createClient();

// =====================================================
// DOCUMENT TYPES
// =====================================================

export async function getDocumentTypes() {
  const { data, error } = await supabase
    .from('document_types')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) throw error;
  return data as DocumentType[];
}

export async function getDocumentTypeByCode(code: string) {
  const { data, error } = await supabase
    .from('document_types')
    .select('*')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data as DocumentType;
}

// =====================================================
// EMPLOYEE DOCUMENTS
// =====================================================

export async function getEmployeeDocuments(employeeId: string) {
  const { data, error } = await supabase
    .from('employee_documents')
    .select('*')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as EmployeeDocument[];
}

export async function getDocumentById(documentId: string) {
  const { data, error } = await supabase
    .from('employee_documents')
    .select('*')
    .eq('id', documentId)
    .single();

  if (error) throw error;
  return data as EmployeeDocument;
}

export async function createEmployeeDocument(input: CreateEmployeeDocumentInput) {
  const { data, error } = await supabase
    .from('employee_documents')
    .insert({
      ...input,
      status: 'active',
      version: 1,
    })
    .select()
    .single();

  if (error) throw error;
  return data as EmployeeDocument;
}

export async function updateEmployeeDocument(
  documentId: string,
  input: UpdateEmployeeDocumentInput
) {
  const { data, error } = await supabase
    .from('employee_documents')
    .update(input)
    .eq('id', documentId)
    .select()
    .single();

  if (error) throw error;
  return data as EmployeeDocument;
}

export async function deleteEmployeeDocument(documentId: string) {
  const { error } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

export async function archiveEmployeeDocument(documentId: string) {
  return updateEmployeeDocument(documentId, { status: 'archived' });
}

// =====================================================
// DOCUMENT EXPIRY
// =====================================================

export async function getExpiringDocuments(daysAhead: number = 30) {
  const { data, error } = await supabase
    .rpc('get_expiring_documents', { days_ahead: daysAhead });

  if (error) throw error;
  return data as ExpiringDocument[];
}

export async function getExpiredDocuments() {
  const { data, error } = await supabase.rpc('get_expired_documents');

  if (error) throw error;
  return data as ExpiringDocument[];
}

// =====================================================
// FILE UPLOAD
// =====================================================

export async function uploadDocumentFile(
  file: File,
  employeeId: string,
  documentType: string
) {
  // Generate unique filename
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}/${documentType}_${timestamp}.${fileExt}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('employee-documents')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL (signed URL for private bucket)
  const { data: urlData } = supabase.storage
    .from('employee-documents')
    .getPublicUrl(fileName);

  return {
    path: data.path,
    url: urlData.publicUrl,
  };
}

export async function getDocumentSignedUrl(filePath: string, expiresIn: number = 3600) {
  const { data, error } = await supabase.storage
    .from('employee-documents')
    .createSignedUrl(filePath, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocumentFile(filePath: string) {
  const { error } = await supabase.storage
    .from('employee-documents')
    .remove([filePath]);

  if (error) throw error;
}
