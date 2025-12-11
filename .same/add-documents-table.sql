-- =====================================================
-- DOCUMENT MANAGEMENT TABLE
-- =====================================================
-- Add documents table for file attachments
-- Run this migration after the main database schema

-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id BIGSERIAL PRIMARY KEY,

    -- File information
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL, -- in bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type
    file_extension VARCHAR(10),

    -- Storage information
    storage_path TEXT NOT NULL, -- Path in Supabase Storage
    storage_bucket VARCHAR(100) DEFAULT 'documents',
    file_url TEXT, -- Public URL if applicable

    -- Document metadata
    document_type VARCHAR(50), -- e.g., 'quote', 'invoice', 'memo', 'receipt'
    description TEXT,

    -- Associations (polymorphic)
    related_to_type VARCHAR(50), -- e.g., 'ge_request', 'payment_voucher', 'commitment'
    related_to_id BIGINT, -- ID of the related record

    -- Uploaded by
    uploaded_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,

    -- Timestamps
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Soft delete
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_documents_related_to ON public.documents(related_to_type, related_to_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_documents_uploaded_by ON public.documents(uploaded_by) WHERE is_deleted = FALSE;
CREATE INDEX idx_documents_uploaded_at ON public.documents(uploaded_at DESC) WHERE is_deleted = FALSE;
CREATE INDEX idx_documents_type ON public.documents(document_type) WHERE is_deleted = FALSE;

-- Add comments
COMMENT ON TABLE public.documents IS 'Stores file attachments and documents for various modules';
COMMENT ON COLUMN public.documents.related_to_type IS 'Type of related record (ge_request, payment_voucher, commitment, etc.)';
COMMENT ON COLUMN public.documents.related_to_id IS 'ID of the related record';
COMMENT ON COLUMN public.documents.storage_path IS 'Path to file in Supabase Storage';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_documents_timestamp
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.update_documents_updated_at();

-- =====================================================
-- HELPER FUNCTIONS FOR DOCUMENT MANAGEMENT
-- =====================================================

-- Function to get documents for a related record
CREATE OR REPLACE FUNCTION public.get_documents_for_record(
    p_related_type VARCHAR,
    p_related_id BIGINT
)
RETURNS TABLE (
    id BIGINT,
    file_name VARCHAR,
    file_size BIGINT,
    file_type VARCHAR,
    file_url TEXT,
    document_type VARCHAR,
    description TEXT,
    uploaded_by_name TEXT,
    uploaded_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        d.id,
        d.file_name,
        d.file_size,
        d.file_type,
        d.file_url,
        d.document_type,
        d.description,
        up.full_name AS uploaded_by_name,
        d.uploaded_at
    FROM public.documents d
    LEFT JOIN public.user_profiles up ON d.uploaded_by = up.id
    WHERE d.related_to_type = p_related_type
        AND d.related_to_id = p_related_id
        AND d.is_deleted = FALSE
    ORDER BY d.uploaded_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to soft delete a document
CREATE OR REPLACE FUNCTION public.soft_delete_document(
    p_document_id BIGINT,
    p_deleted_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.documents
    SET
        is_deleted = TRUE,
        deleted_at = NOW(),
        deleted_by = p_deleted_by
    WHERE id = p_document_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get document statistics
CREATE OR REPLACE FUNCTION public.get_document_stats()
RETURNS TABLE (
    total_documents BIGINT,
    total_size_bytes BIGINT,
    documents_by_type JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_documents,
        SUM(file_size) AS total_size_bytes,
        jsonb_object_agg(
            COALESCE(document_type, 'uncategorized'),
            doc_count
        ) AS documents_by_type
    FROM (
        SELECT
            document_type,
            COUNT(*) AS doc_count
        FROM public.documents
        WHERE is_deleted = FALSE
        GROUP BY document_type
    ) stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents related to records they have access to
CREATE POLICY documents_select_policy ON public.documents
    FOR SELECT
    USING (
        -- Users can see documents they uploaded
        uploaded_by = auth.uid()
        OR
        -- Or documents related to their cost centre (simplified - adjust based on your needs)
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid()
        )
    );

-- Policy: Authenticated users can insert documents
CREATE POLICY documents_insert_policy ON public.documents
    FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid()
    );

-- Policy: Users can update their own documents
CREATE POLICY documents_update_policy ON public.documents
    FOR UPDATE
    USING (
        uploaded_by = auth.uid()
    )
    WITH CHECK (
        uploaded_by = auth.uid()
    );

-- Policy: Users can soft delete their own documents
CREATE POLICY documents_delete_policy ON public.documents
    FOR UPDATE
    USING (
        uploaded_by = auth.uid()
        AND is_deleted = FALSE
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.documents TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.documents_id_seq TO authenticated;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- This section can be used for testing
-- INSERT INTO public.documents (file_name, file_size, file_type, storage_path, related_to_type, related_to_id, uploaded_by)
-- VALUES ('sample_quote.pdf', 245678, 'application/pdf', 'ge-requests/sample_quote.pdf', 'ge_request', 1, (SELECT id FROM user_profiles LIMIT 1));

COMMENT ON TABLE public.documents IS 'Document management table - stores file attachments for GE requests, payments, and other modules. Run this migration after the main database schema.';
