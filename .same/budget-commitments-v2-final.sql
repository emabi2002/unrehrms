-- ============================================
-- BUDGET COMMITMENTS TABLE - V2 FINAL
-- Safe to run multiple times
-- ============================================

-- Drop existing table if you want a clean slate (CAREFUL!)
-- Uncomment the next line ONLY if you want to delete all commitment data
-- DROP TABLE IF EXISTS budget_commitments CASCADE;

-- Create table
CREATE TABLE IF NOT EXISTS budget_commitments (
    commitment_id BIGSERIAL PRIMARY KEY,
    ge_request_id BIGINT NOT NULL,
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

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_budget_commitments_ge;
DROP INDEX IF EXISTS idx_budget_commitments_budget_line;
DROP INDEX IF EXISTS idx_budget_commitments_status;

-- Create indexes
CREATE INDEX idx_budget_commitments_ge ON budget_commitments(ge_request_id);
CREATE INDEX idx_budget_commitments_budget_line ON budget_commitments(budget_line_id);
CREATE INDEX idx_budget_commitments_status ON budget_commitments(status);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '
    ========================================
    ✅ BUDGET COMMITMENTS TABLE DEPLOYED!
    ========================================

    Table: budget_commitments ✅
    Indexes: 3 ✅

    Ready for:
    - Auto-commit on approval
    - Auto-release on rejection
    - Auto-update on payment

    ========================================
    ';
END $$;
