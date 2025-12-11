export type DocumentAccessLevel = 'hr_only' | 'manager_and_hr' | 'employee_visible' | 'public';
export type DocumentStatus = 'active' | 'archived' | 'expired' | 'replaced';

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  is_mandatory: boolean;
  requires_expiry: boolean;
  default_access_level: DocumentAccessLevel;
  category?: string;
  display_order: number;
  is_active: boolean;
}

export interface EmployeeDocument {
  id: string;
  created_at: string;
  updated_at: string;
  employee_id: string;

  // Document Details
  document_type: string;
  document_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;

  // Document Information
  uploaded_by: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
  issuing_authority?: string;

  // Security & Access
  is_confidential: boolean;
  access_level: DocumentAccessLevel;
  status: DocumentStatus;

  // Version Control
  version: number;
  replaced_by_document_id?: string;
  replaces_document_id?: string;

  // Notes
  notes?: string;
}

export interface CreateEmployeeDocumentInput {
  employee_id: string;
  document_type: string;
  document_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  uploaded_by: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
  issuing_authority?: string;
  is_confidential?: boolean;
  access_level?: DocumentAccessLevel;
  notes?: string;
}

export interface UpdateEmployeeDocumentInput {
  document_name?: string;
  issue_date?: string;
  expiry_date?: string;
  document_number?: string;
  issuing_authority?: string;
  is_confidential?: boolean;
  access_level?: DocumentAccessLevel;
  status?: DocumentStatus;
  notes?: string;
}

export interface ExpiringDocument extends EmployeeDocument {
  days_until_expiry: number;
  employee_name?: string;
}
