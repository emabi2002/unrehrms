-- ============================================
-- BUDGET COMMITMENTS TABLE
-- Tracks budget commitments when GE requests are approved
-- ============================================

CREATE TABLE IF NOT EXISTS budget_commitments (
    commitment_id BIGSERIAL PRIMARY KEY,
    ge_request_id BIGINT NOT NULL, -- Reference to GE request
    budget_line_id BIGINT REFERENCES budget_line(budget_line_id) NOT NULL,
    amount NUMERIC(18,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'Active', -- Active / Released / Paid

    -- Tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one commitment per GE request
    UNIQUE(ge_request_id)
);

COMMENT ON TABLE budget_commitments IS 'Budget commitments created when GE requests are approved';
COMMENT ON COLUMN budget_commitments.status IS 'Active=Committed, Released=GE rejected/cancelled, Paid=Payment processed';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_budget_commitments_ge ON budget_commitments(ge_request_id);
CREATE INDEX IF NOT EXISTS idx_budget_commitments_budget_line ON budget_commitments(budget_line_id);
CREATE INDEX IF NOT EXISTS idx_budget_commitments_status ON budget_commitments(status);

-- ============================================
-- TRIGGERS FOR AUTO-COMMITMENT
-- ============================================

-- Auto-commit budget when GE request is approved
CREATE OR REPLACE FUNCTION auto_commit_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Only commit when status changes to Approved
    IF NEW.status = 'Approved' AND (OLD.status IS NULL OR OLD.status != 'Approved') THEN
        -- Create budget commitment
        -- This would be done by application code with proper GE request data
        -- Trigger is just a placeholder for documentation
        NULL;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Actual auto-commitment will be handled by application code
-- since we need to access GE request line items and AAP linkage

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Sample commitment (after AAP schema is deployed)
-- INSERT INTO budget_commitments (ge_request_id, budget_line_id, amount, status)
-- VALUES (1, 1, 50000, 'Active');
