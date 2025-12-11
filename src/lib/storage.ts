import { supabase } from './supabase';

export interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  uploaded_at: string;
}

/**
 * Upload a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns The uploaded file details
 */
export async function uploadDocument(
  file: File,
  bucket: string = 'documents',
  folder: string = ''
): Promise<UploadedDocument> {
  try {
    // Generate unique file name
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      id: data.path,
      name: file.name,
      size: file.size,
      type: file.type,
      url: publicUrl,
      path: filePath,
      uploaded_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
}

/**
 * Upload multiple files
 * @param files Array of files to upload
 * @param bucket The storage bucket name
 * @param folder Optional folder path within the bucket
 * @returns Array of uploaded file details
 */
export async function uploadMultipleDocuments(
  files: File[],
  bucket: string = 'documents',
  folder: string = ''
): Promise<UploadedDocument[]> {
  const uploadPromises = files.map(file => uploadDocument(file, bucket, folder));
  return Promise.all(uploadPromises);
}

/**
 * Download a file from Supabase Storage
 * @param path The file path in storage
 * @param bucket The storage bucket name
 * @returns The file blob
 */
export async function downloadDocument(
  path: string,
  bucket: string = 'documents'
): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error downloading document:', error);
    throw new Error('Failed to download document');
  }
}

/**
 * Delete a file from Supabase Storage
 * @param path The file path in storage
 * @param bucket The storage bucket name
 */
export async function deleteDocument(
  path: string,
  bucket: string = 'documents'
): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

/**
 * Get public URL for a file
 * @param path The file path in storage
 * @param bucket The storage bucket name
 * @returns The public URL
 */
export function getDocumentUrl(
  path: string,
  bucket: string = 'documents'
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Validate file before upload
 * @param file The file to validate
 * @param maxSize Maximum file size in bytes (default 10MB)
 * @param allowedTypes Array of allowed MIME types
 * @returns True if valid, throws error if invalid
 */
export function validateFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024, // 10MB
  allowedTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]
): boolean {
  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }

  return true;
}

/**
 * Format file size for display
 * @param bytes File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file icon based on file type
 * @param fileName The file name or MIME type
 * @returns Icon name for the file type
 */
export function getFileIcon(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();

  switch (ext) {
    case 'pdf':
      return 'FileText';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'Image';
    case 'doc':
    case 'docx':
      return 'FileText';
    case 'xls':
    case 'xlsx':
    case 'csv':
      return 'Table';
    default:
      return 'File';
  }
}
